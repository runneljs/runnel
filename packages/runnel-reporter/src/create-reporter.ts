import fs from "node:fs";
import process from "node:process";
export const REPORT_DIR = ".runnel";

export function createReporter(currentFileUrl: string): {
  setReport: (data: object) => void;
  reporter: () => void;
} {
  const rootDirPath = process.cwd();
  const relativePath = currentFileUrl.replace(
    new RegExp(`^file://${rootDirPath}`),
    "",
  );
  if (relativePath === currentFileUrl) {
    throw new Error(
      `Unexpected file URL: [${currentFileUrl}]. It has to be "file://<the file path>" For ESM, please provide "import.meta.url".`,
    );
  }

  const report = new Map<string, object>();

  function setReport(data: object) {
    report.set(relativePath, data);
  }

  function reporter() {
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR);
    }
    if (report.size === 0) {
      console.warn("No report data to write.");
      return;
    }
    const reportFileName = `${relativePath.replace(/[\/|\.]/g, "_")}.json`;
    fs.writeFileSync(
      [REPORT_DIR, reportFileName].join("/"),
      JSON.stringify({ [relativePath]: report.get(relativePath) }),
    );
  }
  return { setReport, reporter };
}
