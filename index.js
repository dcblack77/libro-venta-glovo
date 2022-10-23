const fs = require("node:fs");
const XLSX = require('xlsx')
const reader = require('csvtojson');
const folder = './csvs';
const files = fs.readdirSync('./csvs');

// const data = [];

(async function readCsv(files) {

  let rowJson = [];
  let id = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rows = await reader().fromFile(`${folder}/${file}`);
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const haveClient = row['Informacion Fiscal Cliente'] !== ''
      const cliente =  haveClient
        ? row['Informacion Fiscal Cliente']
        : row['Informacion Fiscal Partner'].slice(0, -20);
      const nif = !haveClient 
        ? row['Informacion Fiscal Partner'].slice(-9, row['Informacion Fiscal Partner'].length)
        : '';
      const data = {
        id: id++,
        expedicionAt: row.Fecha,
        operacionAt: row.Fecha,
        serie: row['Numero Factura'].slice(0,9),
        numeroFactura: row['Numero Factura'].slice(11, -1),
        cliente,
        nif,
        concepto: `Reparto: ${row['ID pedido']}`,
        montoFactura: row['Base imponible'],
        IVA: row.IVA,
        total: parseFloat(row['Total Factura'].replace(',', '.'))
      };
      rowJson.push(data);
    };
  };

  let totalFacturado = 0;

  for (let index = 0; index < rowJson.length; index++) {
    const element = rowJson[index];
    totalFacturado = totalFacturado + element.total;
  }
  rowJson.push({totalFacturado: totalFacturado.toFixed(2)});

  const jsonToSheet = XLSX.utils.json_to_sheet(rowJson);
  const xlsBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(xlsBook, jsonToSheet, "Glovo-report");
  const createFile = XLSX.writeFile(xlsBook,`./reports/glovo-report-${Date.now()}.xlsx`);
  console.info("File created: ", createFile);
})(files);




