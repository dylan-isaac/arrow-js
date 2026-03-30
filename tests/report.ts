import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  name: string;
  expectPatterns: string[];
  rejectPatterns: string[];
  patternsLoaded: string[];
  progressiveDisclosurePass: boolean;
  progressiveDisclosureNotes: string;
  ariaPass: boolean;
  ariaScore: number;
  ariaPassed: string[];
  ariaFailed: string[];
  error?: string;
}

function emojiPass(pass: boolean): string {
  return pass ? '✅' : '❌';
}

export function generateReport(results: TestResult[]): string {
  const lines: string[] = [];
  const now = new Date().toISOString();

  lines.push(`# Arrow.js Skill Test Report`);
  lines.push(`\nGenerated: ${now}\n`);

  // Summary stats
  const pdPassed = results.filter((r) => r.progressiveDisclosurePass).length;
  const ariaPassed = results.filter((r) => r.ariaPass).length;
  const total = results.length;

  lines.push(`## Summary\n`);
  lines.push(`- **Progressive disclosure**: ${pdPassed}/${total} correct`);
  lines.push(`- **ARIA checks**: ${ariaPassed}/${total} passed\n`);

  // Main table
  lines.push(`## Results\n`);
  lines.push(
    `| Pattern | Patterns Loaded | ARIA Checks | Notes |`
  );
  lines.push(`|---------|----------------|-------------|-------|`);

  for (const r of results) {
    const pdEmoji = emojiPass(r.progressiveDisclosurePass);
    const ariaEmoji = emojiPass(r.ariaPass);
    const ariaDetail = r.ariaFailed.length > 0 ? `(${r.ariaPassed.length}/${r.ariaPassed.length + r.ariaFailed.length})` : '';
    const notes = r.error
      ? `ERROR: ${r.error.slice(0, 60)}`
      : r.progressiveDisclosureNotes.slice(0, 80);
    lines.push(`| ${r.name} | ${pdEmoji} | ${ariaEmoji} ${ariaDetail} | ${notes} |`);
  }

  // Failures detail
  const failures = results.filter((r) => !r.progressiveDisclosurePass || !r.ariaPass || r.error);
  if (failures.length > 0) {
    lines.push(`\n## Failure Details\n`);
    for (const r of failures) {
      lines.push(`### ${r.name}\n`);

      if (r.error) {
        lines.push(`**Error**: \`${r.error}\`\n`);
        continue;
      }

      if (!r.progressiveDisclosurePass) {
        lines.push(`**Progressive Disclosure**: ❌`);
        lines.push(`- Expected patterns: \`${r.expectPatterns.join(', ') || 'none'}\``);
        if (r.rejectPatterns.length > 0) {
          lines.push(`- Reject patterns: \`${r.rejectPatterns.join(', ')}\``);
        }
        lines.push(`- Loaded patterns: \`${r.patternsLoaded.join(', ') || 'none'}\``);
        lines.push(`- Note: ${r.progressiveDisclosureNotes}\n`);
      }

      if (!r.ariaPass) {
        lines.push(`**ARIA**: ❌`);
        lines.push(`- Passed: ${r.ariaPassed.map((a) => `\`${a}\``).join(', ') || 'none'}`);
        lines.push(`- Failed: ${r.ariaFailed.map((a) => `\`${a}\``).join(', ') || 'none'}\n`);
      }
    }
  }

  return lines.join('\n');
}

export function saveReport(results: TestResult[], outputDir: string): string {
  fs.mkdirSync(outputDir, { recursive: true });
  const reportPath = path.join(outputDir, 'report.md');
  const content = generateReport(results);
  fs.writeFileSync(reportPath, content, 'utf-8');
  return reportPath;
}
