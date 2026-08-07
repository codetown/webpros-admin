import * as XLSX from "xlsx";

export interface ExcelSheet {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

/** 计算单元格显示宽度（中文按双倍宽度） */
function displayWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    width += char.charCodeAt(0) > 255 ? 2 : 1;
  }
  return width;
}

/** 导出多工作表 Excel 文件（.xlsx） */
export function exportExcel(filename: string, sheets: ExcelSheet[]) {
  const workbook = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const worksheet = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows]);
    worksheet["!cols"] = sheet.headers.map((header, colIndex) => {
      let max = displayWidth(header);
      for (const row of sheet.rows) {
        max = Math.max(max, displayWidth(String(row[colIndex] ?? "")));
      }
      return { wch: Math.min(Math.max(max + 2, 10), 50) };
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }
  XLSX.writeFile(workbook, filename);
}
