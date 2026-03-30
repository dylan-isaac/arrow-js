// Analyze claude --output-format json output
import * as fs from 'fs';
import * as path from 'path';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: ClaudeContent[] | string;
}

export interface ClaudeContent {
  type: string;
  // tool_use
  name?: string;
  input?: Record<string, unknown>;
  // tool_result
  tool_use_id?: string;
  content?: string | ClaudeContent[];
  // text
  text?: string;
}

export interface ClaudeJsonOutput {
  type?: string;
  subtype?: string;
  messages?: ClaudeMessage[];
  result?: string;
  // Sometimes the output is an array of messages directly
  [key: string]: unknown;
}

/**
 * Parse the JSON output from `claude --output-format json` and return
 * all file paths that were read via the Read/read_file tool.
 * 
 * First tries the output JSON `messages` array. If empty (common with --print),
 * falls back to the session JSONL file at ~/.claude/projects/.
 */
export function extractFileReads(output: string): string[] {
  let parsed: ClaudeJsonOutput;
  try {
    parsed = JSON.parse(output);
  } catch {
    return [];
  }

  // Try messages array first
  const messages: ClaudeMessage[] = parsed.messages ?? [];
  if (messages.length > 0) {
    return extractFileReadsFromMessages(messages);
  }

  // Fall back to session JSONL
  const sessionId = parsed.session_id as string;
  if (sessionId) {
    return extractFileReadsFromSessionLog(sessionId);
  }

  return [];
}

function extractFileReadsFromMessages(messages: ClaudeMessage[]): string[] {
  const paths: string[] = [];
  for (const msg of messages) {
    const contents = Array.isArray(msg.content) ? msg.content : [];
    for (const block of contents) {
      if (
        block.type === 'tool_use' &&
        (block.name === 'Read' || block.name === 'read_file') &&
        block.input
      ) {
        const p =
          (block.input['path'] as string) ||
          (block.input['file_path'] as string);
        if (p && typeof p === 'string') paths.push(p);
      }
    }
  }
  return paths;
}

function extractFileReadsFromSessionLog(sessionId: string): string[] {
  
  
  const home = process.env.HOME || '~';
  const projectsDir = path.join(home, '.claude', 'projects');
  
  // Find the session file across all project dirs
  let sessionFile = '';
  try {
    const dirs = fs.readdirSync(projectsDir);
    for (const dir of dirs) {
      const candidate = path.join(projectsDir, dir, `${sessionId}.jsonl`);
      if (fs.existsSync(candidate)) {
        sessionFile = candidate;
        break;
      }
    }
  } catch {
    return [];
  }

  if (!sessionFile) return [];

  const paths: string[] = [];
  try {
    const lines = fs.readFileSync(sessionFile, 'utf-8').split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.type === 'assistant') {
          for (const block of msg.message?.content ?? []) {
            if (block.type === 'tool_use' && (block.name === 'Read' || block.name === 'read_file')) {
              const p = block.input?.file_path || block.input?.path;
              if (p) paths.push(p);
            }
          }
        }
      } catch {}
    }
  } catch {}

  return paths;
}

/**
 * Filter file reads to only `patterns/*.md` files, returning just the filename.
 */
export function extractPatternReads(output: string): string[] {
  const allReads = extractFileReads(output);
  return allReads
    .filter((p) => p.includes('patterns/') && p.endsWith('.md'))
    .map((p) => p.split('/').pop() as string);
}

/**
 * Extract the generated code blocks (HTML/JS) from the assistant's final response.
 * Returns all fenced code block contents concatenated.
 */
export function extractGeneratedCode(output: string): string {
  let parsed: ClaudeJsonOutput;
  try {
    parsed = JSON.parse(output);
  } catch {
    return '';
  }

  const messages: ClaudeMessage[] = parsed.messages ?? [];
  const codeBlocks: string[] = [];

  for (const msg of messages) {
    if (msg.role !== 'assistant') continue;
    const contents = Array.isArray(msg.content) ? msg.content : [];
    for (const block of contents) {
      if (block.type === 'text' && block.text) {
        // Extract fenced code blocks
        const fenceRegex = /```(?:html|javascript|js|ts|typescript)?\n([\s\S]*?)```/g;
        let match: RegExpExecArray | null;
        while ((match = fenceRegex.exec(block.text)) !== null) {
          codeBlocks.push(match[1]);
        }
      }
    }
  }

  // Also check the top-level result field (--print mode puts final text here)
  if (typeof parsed.result === 'string') {
    // Check for code blocks in result
    const fenceRegex = /```(?:html|javascript|js|ts|typescript)?\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = fenceRegex.exec(parsed.result)) !== null) {
      codeBlocks.push(match[1]);
    }
    // Also check result prose for ARIA attributes (claude often describes them in text)
    if (codeBlocks.length === 0) {
      codeBlocks.push(parsed.result);
    }
  }

  // Fall back to session JSONL for tool_use write operations (claude writes to files)
  if (codeBlocks.length === 0) {
    const sessionId = parsed.session_id as string;
    if (sessionId) {
      const written = extractWrittenCodeFromSession(sessionId);
      if (written) codeBlocks.push(written);
    }
  }

  return codeBlocks.join('\n');
}

function extractWrittenCodeFromSession(sessionId: string): string {
  
  
  const home = process.env.HOME || '~';
  const projectsDir = path.join(home, '.claude', 'projects');

  let sessionFile = '';
  try {
    const dirs = fs.readdirSync(projectsDir);
    for (const dir of dirs) {
      const candidate = path.join(projectsDir, dir, `${sessionId}.jsonl`);
      if (fs.existsSync(candidate)) { sessionFile = candidate; break; }
    }
  } catch { return ''; }

  if (!sessionFile) return '';

  const code: string[] = [];
  try {
    const lines = fs.readFileSync(sessionFile, 'utf-8').split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.type === 'assistant') {
          for (const block of msg.message?.content ?? []) {
            if (block.type === 'tool_use' && (block.name === 'Write' || block.name === 'write_to_file' || block.name === 'str_replace_based_edit_tool')) {
              const content = block.input?.content || block.input?.new_str || '';
              if (content) code.push(content);
            }
            if (block.type === 'text' && block.text) {
              const fenceRegex = /```(?:html|javascript|js|ts|typescript)?\n([\s\S]*?)```/g;
              let match: RegExpExecArray | null;
              while ((match = fenceRegex.exec(block.text)) !== null) {
                code.push(match[1]);
              }
            }
          }
        }
      } catch {}
    }
  } catch {}

  return code.join('\n');
}

export const ARIA_CHECKS: Record<string, string[]> = {
  accordion: ['aria-expanded', 'aria-controls', 'role="region"'],
  tabs: ['role="tablist"', 'role="tab"', 'role="tabpanel"', 'aria-selected'],
  dialog: ['aria-modal', 'aria-labelledby', 'role="dialog"'],
  disclosure: ['aria-expanded'],
  alert: ['role="alert"'],
  tooltip: ['role="tooltip"', 'aria-describedby'],
  combobox: ['role="combobox"', 'aria-expanded', 'aria-activedescendant', 'role="listbox"'],
  switch: ['role="switch"', 'aria-checked'],
  listbox: ['role="listbox"', 'role="option"', 'aria-selected'],
};

export interface AriaCheckResult {
  passed: string[];
  failed: string[];
  score: number; // 0–1
}

/**
 * Check generated code for expected ARIA attributes for a given pattern.
 */
export function checkAriaAttributes(code: string, pattern: string): AriaCheckResult {
  const checks = ARIA_CHECKS[pattern];
  if (!checks || checks.length === 0) {
    return { passed: [], failed: [], score: 1 };
  }

  const passed: string[] = [];
  const failed: string[] = [];

  for (const attr of checks) {
    if (code.includes(attr)) {
      passed.push(attr);
    } else {
      failed.push(attr);
    }
  }

  return {
    passed,
    failed,
    score: passed.length / checks.length,
  };
}
