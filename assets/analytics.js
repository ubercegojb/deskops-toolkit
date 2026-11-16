/* DeskOps Analytics — CSV e indicadores, sem bibliotecas externas. */
(function (root) {
  "use strict";

  function normalize(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }
  function detectDelimiter(text) {
    const counts = { ";": 0, ",": 0, "\t": 0 };
    let quoted = false;
    for (let i = 0; i < Math.min(text.length, 10000); i++) {
      const ch = text[i];
      if (ch === '"') {
        if (quoted && text[i + 1] === '"') i++;
        else quoted = !quoted;
      } else if (!quoted && (ch === "\n" || ch === "\r")) break;
      else if (!quoted && Object.prototype.hasOwnProperty.call(counts, ch)) counts[ch]++;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }
  function parseCsv(input) {
    if (typeof input !== "string" || !input.trim()) throw Error("Selecione um CSV com conteúdo.");
    if (input.length > 2000000) throw Error("Arquivo grande demais. Limite de 2 MB.");
    const source = input.replace(/^\uFEFF/, "");
    const delimiter = detectDelimiter(source);
    const data = [];
    let fields = [], field = "", quoted = false;
    const flush = () => {
      fields.push(field);
      if (fields.some(x => x.trim())) data.push(fields);
      fields = []; field = "";
      if (data.length > 10001) throw Error("Limite de 10 mil chamados por arquivo.");
    };
    for (let i = 0; i < source.length; i++) {
      const c = source[i];
      if (c === '"') {
        if (quoted && source[i + 1] === '"') { field += '"'; i++; }
        else quoted = !quoted;
      } else if (!quoted && c === delimiter) { fields.push(field); field = ""; }
      else if (!quoted && (c === "\r" || c === "\n")) {
        flush();
        if (c === "\r" && source[i + 1] === "\n") i++;
      } else field += c;
    }
    if (quoted) throw Error("CSV inválido: há aspas sem fechamento.");
    if (field || fields.length) flush();
    if (data.length < 2) throw Error("É necessário um cabeçalho e pelo menos um chamado.");
    const headers = data.shift().map(x => x.trim());
    if (headers.some(x => !x)) throw Error("O CSV possui colunas sem nome.");
    const rows = data.map(row => headers.map((_, i) => (row[i] ?? "").trim()));
    return { headers, rows, delimiter };
  }

  const names = {
    status: ["status", "situacao", "estado", "status do chamado", "situacao do chamado", "status ticket", "ticket status"],
    category: ["categoria", "categorias", "categoria do chamado", "category", "itil category", "tipo de solicitacao"],
    opened: ["abertura", "data de abertura", "criado em", "data criacao", "data de criacao", "opening date", "created at", "date", "data"],
    resolved: ["resolucao", "data de resolucao", "solucionado em", "resolvido em", "data de solucao", "resolution date", "resolved at", "closed at"]
  };
  function suggestColumns(headers) {
    const norm = headers.map(normalize);
    const result = {};
    for (const [key, aliases] of Object.entries(names)) {
      const n = aliases.map(normalize);
      const exact = norm.findIndex(h => n.includes(h));
      result[key] = exact >= 0 ? String(exact) : "";
    }
    return result;
  }

  function parseDate(value) {
    const v = String(value ?? "").trim();
    if (!v) return null;
    const br = v.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    let y, m, d, h, minute, sec;
    if (br) { [, d, m, y, h = "0", minute = "0", sec = "0"] = br; }
    else if (iso) { [, y, m, d, h = "0", minute = "0", sec = "0"] = iso; }
    else return null; // Não adivinhar formatos ambíguos ou fuso horário.
    const dt = new Date(+y, +m - 1, +d, +h, +minute, +sec);
    if (dt.getFullYear() !== +y || dt.getMonth() !== +m - 1 || dt.getDate() !== +d ||
        dt.getHours() !== +h || dt.getMinutes() !== +minute || dt.getSeconds() !== +sec) return null;
    return dt;
  }

  // Filtros independentes: mantemos os dados originais na memória e analisamos uma cópia filtrada.
  function filterRows(rows, columns, filters = {}) {
    const statusCol = Number(columns.status);
    const categoryCol = columns.category == null || columns.category === "" ? -1 : Number(columns.category);
    const dateCol = columns.opened == null || columns.opened === "" ? -1 : Number(columns.opened);
    const { status = "", category = "", from = "", to = "" } = filters;
    if (columns.status === "" || !Number.isInteger(statusCol) || statusCol < 0)
      throw Error("Selecione a coluna de status antes de filtrar.");
    if (category && categoryCol < 0) throw Error("Selecione uma coluna de categoria antes de filtrar.");
    if ((from || to) && dateCol < 0) throw Error("Selecione a coluna de data de abertura para usar o período.");
    const dateStart = from ? parseDate(from) : null, dateEnd = to ? parseDate(to) : null;
    if ((from && !dateStart) || (to && !dateEnd)) throw Error("Informe datas de período válidas.");
    if (dateStart && dateEnd && dateStart > dateEnd) throw Error("A data inicial não pode ser posterior à data final.");
    // Data final inclui o dia completo, inclusive horas.
    if (dateEnd) dateEnd.setDate(dateEnd.getDate() + 1);
    return rows.filter(row => {
      if (status && row[statusCol] !== status) return false;
      if (category && row[categoryCol] !== category) return false;
      if (dateStart || dateEnd) {
        const opened = parseDate(row[dateCol]);
        if (!opened || (dateStart && opened < dateStart) || (dateEnd && opened >= dateEnd)) return false;
      }
      return true;
    });
  }
  function distinctValues(rows, column) {
    if (column == null || column === "" || !Number.isInteger(Number(column)) || Number(column) < 0) return [];
    const i = Number(column);
    return Array.from(new Set(rows.map(row => row[i] || "Não informado"))).sort((a,b) => a.localeCompare(b, "pt-BR"));
  }

  function summarize(rows, columns) {
    const statusCol = Number(columns.status);
    if (columns.status === "" || !Number.isInteger(statusCol) || statusCol < 0) throw Error("Selecione a coluna de status.");
    const optional = key => columns[key] === "" || columns[key] == null ? -1 : Number(columns[key]);
    const categoryCol = optional("category"), openCol = optional("opened"), endCol = optional("resolved");
    if (categoryCol === statusCol) {
      throw Error("Categoria está apontando para a mesma coluna que Status. Selecione a coluna correta de categorias.");
    }
    const selected = [statusCol, categoryCol, openCol, endCol].filter(i => i >= 0);
    if (selected.some(i => !Number.isInteger(i) || i >= (rows[0]?.length ?? 0))) {
      throw Error("Uma das colunas selecionadas não existe no arquivo. Confira o mapeamento.");
    }
    const statuses = new Map(), categories = new Map();
    let opened = 0, resolved = 0, other = 0, timeTotal = 0, timeCount = 0;
    for (const row of rows) {
      const status = (row[statusCol] || "Não informado").trim().slice(0,70);
      const category = categoryCol >= 0 ? (row[categoryCol] || "Sem categoria").trim().slice(0,70) : "Sem categoria";
      statuses.set(status, (statuses.get(status) || 0) + 1);
      categories.set(category, (categories.get(category) || 0) + 1);
      const normalized = normalize(status);
      const done = /^(solucionad|resolvid|fechad|concluid|closed|resolved|solved)/.test(normalized);
      const active = /^(novo|nova|em andamento|em atendimento|pendente|aguardando|atribuido|aberto|new|open|pending|in progress|processing)/.test(normalized);
      if (done) resolved++;
      else if (active) opened++;
      else other++;
      if (done && openCol >= 0 && endCol >= 0) {
        const start = parseDate(row[openCol]), end = parseDate(row[endCol]);
        if (start && end && end >= start) { timeTotal += (end - start) / 3600000; timeCount++; }
      }
    }
    const sort = m => [...m].map(([name, count]) => ({ name, count })).sort((a,b) => b.count-a.count || a.name.localeCompare(b.name, "pt-BR"));
    return {
      total: rows.length, opened, resolved, other,
      averageResolutionHours: timeCount ? timeTotal / timeCount : null,
      timedResolutions: timeCount,
      byStatus: sort(statuses), byCategory: sort(categories)
    };
  }
  const api = { parseCsv, suggestColumns, parseDate, summarize, filterRows, distinctValues, normalize };
  root.DeskOpsAnalytics = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
