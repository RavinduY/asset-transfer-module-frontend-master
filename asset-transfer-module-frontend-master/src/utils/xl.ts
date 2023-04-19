/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
interface ReadXlCallback {
  (data: unknown[]): void;
}

export interface XlRowData {
  key: string;
  values: string[];
}
export interface XlTransferNameValues {
  name: string;
}
export interface XlTransferDataValue {
  header: string;
  value: XlTransferNameValues[] | string;
}

export interface XlTransferData {
  name: string;
  values: XlTransferDataValue[];
}

export const readXlAsJson = (file: File, cb: ReadXlCallback) => {
  const reader = new FileReader();
  reader.onload = (evt: ProgressEvent<FileReader>) => {
    const bstr = evt?.target?.result;
    const wb = XLSX.read(bstr, { type: 'binary' });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    return cb(data);
  };
  reader.readAsBinaryString(file);
};

export const exportAsExcelFile = async (
  workbookData: any[],
  datas: XlRowData[],
  excelFileName: string,
) => {
  const workbook = new ExcelJS.Workbook();
  workbookData.forEach(({ workSheet, rows }) => {
    const sheet = workbook.addWorksheet(workSheet);
    const uniqueHeaders = [
      ...new Set(rows.reduce((prev: any, next: object) => [...prev, ...Object.keys(next)], [])),
    ];
    // @ts-ignore
    sheet.columns = uniqueHeaders?.map((x) => ({ header: x, key: x }));
    rows.forEach((jsonRow: { [x: string]: any }, i: number) => {
      let values = {};
      Object.keys(jsonRow).forEach((row) => {
        const val = datas.find((data) => data.key === row);
        if (val) {
          values = {
            ...values,
            [row]: val?.values?.[i] || '',
          };
        } else {
          values = {
            ...values,
            [row]: '',
          };
        }
      });
      const cellValues = { ...values };
      uniqueHeaders.forEach((header: any, i) => {
        if (Array.isArray(jsonRow[header])) {
          // @ts-ignore
          cellValues[header] = datas[header]?.values[i];
        }
      });
      sheet.addRow(cellValues);
      uniqueHeaders.forEach((header, j) => {
        // @ts-ignore
        if (Array.isArray(jsonRow[header])) {
          // @ts-ignore
          const jsonDropdown = jsonRow[header];
          sheet.getCell(getSpreadSheetCellNumber(i + 1, j)).dataValidation = {
            type: 'list',
            formulae: [`"${jsonDropdown.join(',')}"`],
          };
        }
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAsExcelFile(buffer, excelFileName);
};

const getSpreadSheetCellNumber = (row: number, column: number) => {
  let result = '';

  let n = column;
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }

  result += `${row + 1}`;

  return result;
};

const saveAsExcelFile = (buffer: any, fileName: string) => {
  const data: Blob = new Blob([buffer], {
    type: EXCEL_TYPE,
  });
  FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
};

export const transform = (data: XlTransferData[], noOfRowaToGenerate: number) => {
  return data?.map(({ name, values }) => {
    const headers = values.reduce(
      (prev, next) => ({
        ...prev,
        [next.header]: Array.isArray(next.value) ? next.value?.map(({ name }) => name) : next.value,
      }),
      {},
    );
    return {
      workSheet: name,
      rows: Array(noOfRowaToGenerate).fill(headers),
    };
  });
};

export const downloadXL = (name: string, data: object[]) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ws['!cols'] = data?.map((_) => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws, 'sheet');
  XLSX.writeFile(wb, `${name}.xlsx`);
};
