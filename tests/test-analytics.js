/* Executar: node tests/test-analytics.js */
const assert = require("node:assert/strict");
const {parseCsv, suggestColumns, parseDate, summarize} = require("../assets/analytics.js");
const csv = "Status;Categoria;Abertura;Resolução\nNovo;Rede;10/11/2026 09:00;\nSolucionado;Rede;10/11/2026 10:00;10/11/2026 12:00\nFechado;Impressoras;10/11/2026 08:00;10/11/2026 12:00\nPendente;Impressoras;10/11/2026 15:00;\n";
const data = parseCsv(csv);
assert.equal(data.delimiter, ";");
assert.equal(data.rows.length, 4);
const mapping = suggestColumns(data.headers);
assert.deepEqual(mapping, {status:"0",category:"1",opened:"2",resolved:"3"});
const result = summarize(data.rows, mapping);
assert.equal(result.total, 4);
assert.equal(result.opened, 2);
assert.equal(result.resolved, 2);
assert.equal(result.other, 0);
assert.equal(result.averageResolutionHours, 3);
assert.equal(result.timedResolutions, 2);
assert.equal(result.byStatus.reduce((sum,x)=>sum+x.count,0),4);
assert.deepEqual(result.byCategory, [
  {name:"Impressoras", count:2},
  {name:"Rede", count:2}
]);
assert.notDeepEqual(result.byStatus, result.byCategory);
assert.throws(
  () => summarize(data.rows, { status:"0", category:"0", opened:"2", resolved:"3" }),
  /mesma coluna/
);
const quotes = parseCsv('Status,Categoria\n"Em andamento","Impressoras, rede"\n"Solucionado","Chamado ""especial"""\n');
assert.equal(quotes.rows[0][1], "Impressoras, rede");
assert.equal(quotes.rows[1][1], 'Chamado "especial"');
assert.equal(parseCsv("\uFEFFStatus;Categoria\r\nNovo;Rede\r\n").rows.length,1);
assert.equal(parseDate("01/02/2026 12:30").getMonth(),1);
assert.equal(parseDate("2026-02-01 12:30").getDate(),1);
assert.equal(parseDate("31/02/2026"),null);
assert.throws(()=>parseCsv('Status;Categoria\n"Novo;Rede'));
assert.throws(()=>summarize(data.rows,{status:""}));
// Versão 1.3: filtros cumulativos, datas inclusivas e filtros sem resultado.
const {filterRows, distinctValues} = require("../assets/analytics.js");
assert.deepEqual(distinctValues(data.rows, "0"), ["Fechado", "Novo", "Pendente", "Solucionado"]);
assert.deepEqual(distinctValues(data.rows, "1"), ["Impressoras", "Rede"]);
const filteredStatus = filterRows(data.rows, mapping, {status:"Solucionado"});
assert.equal(filteredStatus.length, 1);
assert.equal(filteredStatus[0][1], "Rede");
const filteredCategory = filterRows(data.rows, mapping, {category:"Impressoras"});
assert.equal(filteredCategory.length, 2);
const filteredDate = filterRows(data.rows, mapping, {from:"2026-11-10", to:"2026-11-10"});
assert.equal(filteredDate.length, 4);
const filteredCombined = filterRows(data.rows, mapping, {status:"Fechado", category:"Impressoras", from:"2026-11-10", to:"2026-11-10"});
assert.equal(filteredCombined.length, 1);
const none = filterRows(data.rows, mapping, {status:"Pendente", category:"Rede"});
assert.equal(none.length, 0);
const emptySummary = summarize(none, mapping);
assert.equal(emptySummary.total, 0);
assert.equal(emptySummary.averageResolutionHours, null);
assert.deepEqual(emptySummary.byCategory, []);
assert.throws(() => filterRows(data.rows, mapping, {from:"2026-11-11", to:"2026-11-10"}), /posterior/);
assert.throws(() => filterRows(data.rows, {...mapping, opened:""}, {from:"2026-11-10"}), /data de abertura/);
assert.equal(filterRows(data.rows, {...mapping, category:""}, {}).length, 4);
console.log("Indicadores CSV: testes passaram.");
