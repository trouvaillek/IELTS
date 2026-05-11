#!/usr/bin/env node
/**
 * Validate all V3 schema files in ~/.ielts/.
 * Exits 0 if clean, 1 if any issues. Prints a colored report.
 */

import { loadSnapshot } from '../lib/scanner.js';
import { IELTS_HOME } from '../lib/paths.js';

console.log(`[validate] target: ${IELTS_HOME}`);
const snap = loadSnapshot();
const issues = snap.issues || [];

if (issues.length === 0) {
  console.log('[validate] ✓ All files pass V3 schema.');
  process.exit(0);
}

console.log(`[validate] ✗ ${issues.length} issue(s) found:\n`);
for (const it of issues) {
  console.log(`  ${it.file}`);
  console.log(`    → ${it.error}`);
}
console.log(`\n[validate] Fix the frontmatter or rerun the responsible skill to regenerate.`);
process.exit(1);
