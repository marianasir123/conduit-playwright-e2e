#!/usr/bin/env node
/**
 * Reads Playwright JSON results and generates markdown + HTML summaries
 * with passed, failed, and skipped (ignored) test breakdowns.
 */
import fs from 'fs';
import path from 'path';

const JSON_FILE = process.argv[2] ?? 'test-results/results.json';
const OUTPUT_DIR = process.argv[3] ?? 'test-results';

const STATUS = {
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
};

function collectTests(suites, parentTitles = []) {
  const tests = [];

  for (const suite of suites ?? []) {
    const titles = [...parentTitles, suite.title].filter(Boolean);

    for (const spec of suite.specs ?? []) {
      const specTitle = [...titles, spec.title].filter(Boolean).join(' › ');

      for (const test of spec.tests ?? []) {
        const result = test.results?.[test.results.length - 1];
        const rawStatus = result?.status ?? 'unknown';
        const status = mapStatus(rawStatus, spec.ok);
        const errorMessage = result?.error?.message?.split('\n')[0] ?? '';

        tests.push({
          title: specTitle,
          file: suite.file ?? spec.file ?? 'unknown',
          status,
          duration: result?.duration ?? 0,
          error: errorMessage,
        });
      }
    }

    tests.push(...collectTests(suite.suites, titles));
  }

  return tests;
}

function mapStatus(rawStatus, specOk) {
  if (rawStatus === 'passed') return STATUS.passed;
  if (rawStatus === 'skipped') return STATUS.skipped;
  if (rawStatus === 'failed' || rawStatus === 'timedOut' || rawStatus === 'interrupted') {
    return STATUS.failed;
  }
  if (specOk === false) return STATUS.failed;
  if (specOk === true) return STATUS.passed;
  return STATUS.skipped;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function groupTests(tests) {
  return {
    passed: tests.filter(t => t.status === STATUS.passed),
    failed: tests.filter(t => t.status === STATUS.failed),
    skipped: tests.filter(t => t.status === STATUS.skipped),
  };
}

function buildMarkdown({ passed, failed, skipped }, stats, generatedAt) {
  const total = passed.length + failed.length + skipped.length;
  const lines = [
    '# Playwright Test Report',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Summary',
    '',
    '| Status | Count |',
    '|--------|------:|',
    `| ✅ Passed | ${passed.length} |`,
    `| ❌ Failed | ${failed.length} |`,
    `| ⏭️ Skipped | ${skipped.length} |`,
    `| **Total** | **${total}** |`,
    '',
  ];

  if (stats?.duration != null) {
    lines.push(`Duration: ${formatDuration(stats.duration)}`, '');
  }

  lines.push(...section('Failed tests', failed, '❌', true));
  lines.push(...section('Skipped tests', skipped, '⏭️', false));
  lines.push(...section('Passed tests', passed, '✅', false));

  return lines.join('\n');
}

function section(title, tests, icon, showError) {
  if (tests.length === 0) {
    return [`## ${icon} ${title}`, '', '_None_', ''];
  }

  const lines = [`## ${icon} ${title} (${tests.length})`, ''];

  for (const test of tests) {
    lines.push(`- \`${test.title}\` (${formatDuration(test.duration)})`);
    if (showError && test.error) {
      lines.push(`  - ${test.error}`);
    }
  }

  lines.push('');
  return lines;
}

function buildHtml({ passed, failed, skipped }, stats, generatedAt) {
  const total = passed.length + failed.length + skipped.length;
  const renderRows = tests =>
    tests
      .map(
        t => `<tr>
          <td>${escapeHtml(t.title)}</td>
          <td>${formatDuration(t.duration)}</td>
          <td>${escapeHtml(t.file)}</td>
          ${t.error ? `<td class="error">${escapeHtml(t.error)}</td>` : '<td></td>'}
        </tr>`,
      )
      .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Playwright Test Report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #1f2937; }
    h1 { margin-bottom: 0.25rem; }
    .meta { color: #6b7280; margin-bottom: 1.5rem; }
    .cards { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { border-radius: 8px; padding: 1rem; color: #fff; }
    .passed { background: #059669; }
    .failed { background: #dc2626; }
    .skipped { background: #d97706; }
    .total { background: #2563eb; }
    .card strong { display: block; font-size: 1.75rem; }
    section { margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; vertical-align: top; }
    th { background: #f9fafb; }
    .error { color: #b91c1c; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Playwright Test Report</h1>
  <p class="meta">Generated: ${escapeHtml(generatedAt)}${stats?.duration != null ? ` · Duration: ${formatDuration(stats.duration)}` : ''}</p>
  <div class="cards">
    <div class="card passed"><strong>${passed.length}</strong>Passed</div>
    <div class="card failed"><strong>${failed.length}</strong>Failed</div>
    <div class="card skipped"><strong>${skipped.length}</strong>Skipped</div>
    <div class="card total"><strong>${total}</strong>Total</div>
  </div>
  ${tableSection('Failed tests', failed, true)}
  ${tableSection('Skipped tests', skipped, false)}
  ${tableSection('Passed tests', passed, false)}
</body>
</html>`;
}

function tableSection(title, tests, showError) {
  if (tests.length === 0) {
    return `<section><h2>${escapeHtml(title)}</h2><p><em>None</em></p></section>`;
  }

  return `<section>
    <h2>${escapeHtml(title)} (${tests.length})</h2>
    <table>
      <thead><tr><th>Test</th><th>Duration</th><th>File</th>${showError ? '<th>Error</th>' : ''}</tr></thead>
      <tbody>${tests.map(t => `<tr>
        <td>${escapeHtml(t.title)}</td>
        <td>${formatDuration(t.duration)}</td>
        <td>${escapeHtml(t.file)}</td>
        ${showError ? `<td class="error">${escapeHtml(t.error)}</td>` : ''}
      </tr>`).join('\n')}</tbody>
    </table>
  </section>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function main() {
  if (!fs.existsSync(JSON_FILE)) {
    console.warn(`Report skipped: JSON results not found at ${JSON_FILE}`);
    process.exit(0);
  }

  const report = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  const tests = collectTests(report.suites);
  const grouped = groupTests(tests);
  const generatedAt = new Date().toISOString();

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const markdown = buildMarkdown(grouped, report.stats, generatedAt);
  const html = buildHtml(grouped, report.stats, generatedAt);

  const mdPath = path.join(OUTPUT_DIR, 'summary.md');
  const htmlPath = path.join(OUTPUT_DIR, 'summary.html');

  fs.writeFileSync(mdPath, markdown);
  fs.writeFileSync(htmlPath, html);

  console.log('Test report generated:');
  console.log(`  Markdown: ${mdPath}`);
  console.log(`  HTML:     ${htmlPath}`);
  console.log(`  Passed: ${grouped.passed.length} | Failed: ${grouped.failed.length} | Skipped: ${grouped.skipped.length}`);
}

main();
