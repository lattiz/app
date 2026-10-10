import type { ValidationReport } from './validate';

/** Prints a validation report; returns true when it passed. */
export function printReport(id: string, report: ValidationReport): boolean {
  const ok = report.findings.length === 0;
  console.log(
    `${ok ? '✓' : '✗'} validate ${id}${ok ? '' : ` — ${report.findings.length} problem(s)`}`,
  );
  for (const f of report.findings) {
    console.log(
      `    ✗ [${f.rule}] ${f.file}${f.line ? `:${f.line}` : ''} — ${f.message}`,
    );
  }
  for (const s of report.similarity)
    console.log(
      `    similarity vs ${s.other}: ${s.score} (limit ${report.similarityLimit})`,
    );
  return ok;
}
