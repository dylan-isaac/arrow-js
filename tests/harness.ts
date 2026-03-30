#!/usr/bin/env npx tsx
/**
 * Arrow.js skill test harness
 * Runs claude CLI with task-oriented prompts and verifies:
 * 1. Progressive disclosure: correct pattern files are loaded
 * 2. ARIA correctness: generated code has expected ARIA attributes
 *
 * Usage:
 *   npx tsx tests/harness.ts
 *   npx tsx tests/harness.ts --pattern accordion
 *   npx tsx tests/harness.ts --dry-run
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { TEST_CASES, TestCase } from './prompts';
import {
  extractPatternReads,
  extractGeneratedCode,
  checkAriaAttributes,
} from './analyze';
import { TestResult, saveReport } from './report';

// ── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const patternIdx = args.indexOf('--pattern');
const filterPattern = patternIdx !== -1 ? args[patternIdx + 1] : null;

// ── Preflight checks ──────────────────────────────────────────────────────────

function checkClaudeInstalled(): void {
  try {
    execSync('which claude', { encoding: 'utf-8' });
  } catch {
    console.error('❌  claude CLI not found. Install it first:');
    console.error('   npm install -g @anthropic-ai/claude-code');
    process.exit(1);
  }
}

// ── Run a single test ─────────────────────────────────────────────────────────

const ARROW_LAB_DIR = path.resolve(process.env.HOME || '~', 'Projects', 'arrow-lab');
const RESULTS_DIR = path.join(ARROW_LAB_DIR, 'tests', 'results');

function runTest(tc: TestCase): TestResult {
  console.log(`\n▶  Running: ${tc.name}`);
  console.log(`   Prompt: ${tc.prompt}`);

  const result: TestResult = {
    name: tc.name,
    expectPatterns: tc.expectPatterns,
    rejectPatterns: tc.rejectPatterns ?? [],
    patternsLoaded: [],
    progressiveDisclosurePass: false,
    progressiveDisclosureNotes: '',
    ariaPass: false,
    ariaScore: 0,
    ariaPassed: [],
    ariaFailed: [],
  };

  if (dryRun) {
    console.log('   [dry-run] skipping claude execution');
    result.progressiveDisclosureNotes = 'dry-run';
    return result;
  }

  // Build command — escape the prompt for shell
  const escapedPrompt = tc.prompt.replace(/'/g, `'\\''`);
  const cmd = [
    'claude',
    '--print',
    '--output-format', 'json',
    '--max-turns', '20',
    '--model', 'sonnet',
    `'${escapedPrompt}'`,
  ].join(' ');

  let rawOutput = '';
  try {
    rawOutput = execSync(cmd, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: ARROW_LAB_DIR,
      env: { ...process.env },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`   ❌ claude CLI error: ${msg.slice(0, 120)}`);
    result.error = msg.slice(0, 200);
    return result;
  }

  // Save raw output for debugging
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RESULTS_DIR, `${tc.name}.json`), rawOutput, 'utf-8');

  // ── Progressive disclosure check ──────────────────────────────────────────
  const patternsLoaded = extractPatternReads(rawOutput);
  result.patternsLoaded = patternsLoaded;

  const missingExpected = tc.expectPatterns.filter((p) => !patternsLoaded.includes(p));
  const unexpectedRejected = (tc.rejectPatterns ?? []).filter((p) => patternsLoaded.includes(p));

  if (missingExpected.length === 0 && unexpectedRejected.length === 0) {
    result.progressiveDisclosurePass = true;
    result.progressiveDisclosureNotes = `Loaded: ${patternsLoaded.join(', ') || 'none (expected)'}`;
  } else {
    const notes: string[] = [];
    if (missingExpected.length > 0) {
      notes.push(`missing: ${missingExpected.join(', ')}`);
    }
    if (unexpectedRejected.length > 0) {
      notes.push(`should NOT have loaded: ${unexpectedRejected.join(', ')}`);
    }
    result.progressiveDisclosureNotes = notes.join('; ');
  }

  // ── ARIA check ────────────────────────────────────────────────────────────
  const code = extractGeneratedCode(rawOutput);
  const ariaResult = checkAriaAttributes(code, tc.name);
  result.ariaPassed = ariaResult.passed;
  result.ariaFailed = ariaResult.failed;
  result.ariaScore = ariaResult.score;
  result.ariaPass = ariaResult.failed.length === 0;

  const pdIcon = result.progressiveDisclosurePass ? '✅' : '❌';
  const ariaIcon = result.ariaPass ? '✅' : '❌';
  console.log(`   Progressive disclosure: ${pdIcon}  ARIA: ${ariaIcon}`);
  if (!result.progressiveDisclosurePass) {
    console.log(`   → ${result.progressiveDisclosureNotes}`);
  }
  if (result.ariaFailed.length > 0) {
    console.log(`   → Missing ARIA: ${result.ariaFailed.join(', ')}`);
  }

  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!dryRun) {
    checkClaudeInstalled();
  }

  const cases = filterPattern
    ? TEST_CASES.filter((tc) => tc.name === filterPattern)
    : TEST_CASES;

  if (cases.length === 0) {
    console.error(`No test cases found matching pattern: ${filterPattern}`);
    process.exit(1);
  }

  console.log(`\n🧪  Arrow.js Skill Test Harness`);
  console.log(`   Running ${cases.length} test(s)${dryRun ? ' (dry-run)' : ''}...\n`);

  const results: TestResult[] = [];
  for (const tc of cases) {
    results.push(runTest(tc));
  }

  // Generate report
  const reportPath = saveReport(results, RESULTS_DIR);
  console.log(`\n📋  Report saved to: ${reportPath}\n`);

  // Print summary
  const pdPassed = results.filter((r) => r.progressiveDisclosurePass).length;
  const ariaPassed = results.filter((r) => r.ariaPass).length;
  const total = results.length;

  console.log(`Results:`);
  console.log(`  Progressive disclosure: ${pdPassed}/${total}`);
  console.log(`  ARIA correctness:       ${ariaPassed}/${total}`);

  const anyFailed = results.some(
    (r) => r.error || !r.progressiveDisclosurePass || !r.ariaPass
  );
  if (anyFailed && !dryRun) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
