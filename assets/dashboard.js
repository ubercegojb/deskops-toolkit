/* DeskOps Toolkit — painel de chamados. Dados apenas na memória do navegador. */
(() => {
  "use strict";
  const analytics = window.DeskOpsAnalytics;
  const $ = id => document.getElementById(id);
  if (!analytics || !$("dash-file")) return;
  let parsed = null;
  const fields = [
    ["status", "Situação / Status (obrigatório)"],
    ["category", "Categoria (opcional)"],
    ["opened", "Data de abertura (opcional)"],
    ["resolved", "Data de resolução (opcional)"]
  ];
  const demo = [
    "Status;Categoria;Abertura;Resolução",
    "Novo;Acesso;10/11/2026 09:00;",
    "Em andamento;Impressoras;10/11/2026 10:00;",
    "Pendente;Rede;10/11/2026 11:00;",
    "Solucionado;Equipamentos;09/11/2026 09:00;09/11/2026 11:00",
    "Fechado;Acesso;09/11/2026 13:00;10/11/2026 10:00",
    "Solucionado;Impressoras;10/11/2026 10:00;10/11/2026 11:30",
    "Novo;Software;11/11/2026 08:00;",
    "Solucionado;Acesso;11/11/2026 10:00;11/11/2026 10:30",
    "Em andamento;Rede;11/11/2026 14:00;",
    "Fechado;Equipamentos;12/11/2026 09:00;12/11/2026 17:00",
    "Solucionado;Acesso;12/11/2026 10:00;12/11/2026 12:00",
    "Pendente;Impressoras;12/11/2026 11:00;",
    "Novo;Software;13/11/2026 08:30;",
    "Solucionado;Rede;13/11/2026 09:00;13/11/2026 12:00",
    "Fechado;Impressoras;13/11/2026 10:00;13/11/2026 11:00",
    "Solucionado;Equipamentos;13/11/2026 13:00;13/11/2026 16:00",
    "Em andamento;Acesso;16/11/2026 09:00;",
    "Solucionado;Software;16/11/2026 10:00;16/11/2026 12:00",
    "Solucionado;Impressoras;16/11/2026 11:00;16/11/2026 14:00",
    "Novo;Rede;16/11/2026 13:00;"
  ].join("\n");
  function feedback(message, error=false) {
    const target = $("dash-message");
    target.textContent = message;
    target.classList.toggle("error", error);
  }
  function clearReport() { $("dash-results").hidden = true; $("dash-filters").hidden = true; }
  function load(text, label) {
    clearReport();
    try {
      parsed = analytics.parseCsv(text);
      $("dash-source").textContent = label + " · " + parsed.rows.length.toLocaleString("pt-BR") + " linhas";
      const suggested = analytics.suggestColumns(parsed.headers);
      for (const [key, title] of fields) {
        const select = $("dash-map-" + key);
        select.replaceChildren();
        const blank = document.createElement("option");
        blank.value = "";
        blank.textContent = key === "status" ? "Selecione uma coluna" : "Não utilizar";
        select.append(blank);
        parsed.headers.forEach((header, i) => {
          const option = document.createElement("option");
          option.value = String(i);
          option.textContent = header + " (coluna " + (i + 1) + ")";
          select.append(option);
        });
        select.value = suggested[key] || "";
        select.setAttribute("aria-label", title);
      }
      $("dash-mapping").hidden = false;
      if (suggested.status !== "") {
        createReport();
      } else feedback("Arquivo carregado. Selecione a coluna de status e clique em gerar painel.");
    } catch (e) {
      parsed = null;
      $("dash-mapping").hidden = true;
      $("dash-source").textContent = "Nenhum arquivo carregado";
      feedback(e.message, true);
    }
  }
  function barChart(target, items, total, limit=8) {
    target.replaceChildren();
    const group = items.slice(0, limit);
    if (items.length > limit) group.push({ name: "Outras categorias", count: items.slice(limit).reduce((sum, x) => sum + x.count, 0) });
    if (!group.length) { target.textContent = "Nenhum dado disponível."; return; }
    const max = Math.max(...group.map(item => item.count), 1);
    for (const item of group) {
      const wrapper = document.createElement("div");
      wrapper.className = "dash-bar-item";
      const heading = document.createElement("div");
      heading.className = "dash-bar-heading";
      const label = document.createElement("span");
      label.textContent = item.name;
      label.title = item.name;
      const value = document.createElement("strong");
      value.textContent = item.count.toLocaleString("pt-BR") + " · " + Math.round(item.count / total * 100) + "%";
      heading.append(label, value);
      const track = document.createElement("div");
      track.className = "dash-bar-track";
      const fill = document.createElement("div");
      fill.className = "dash-bar-fill";
      fill.style.width = Math.max(2, item.count / max * 100) + "%";
      track.append(fill);
      wrapper.append(heading, track);
      target.append(wrapper);
    }
  }
  function getMapping() {
    return Object.fromEntries(fields.map(([key]) => [key, $("dash-map-" + key).value]));
  }
  function clearFilters() {
    $("dash-filter-status").value = "";
    $("dash-filter-category").value = "";
    $("dash-filter-from").value = "";
    $("dash-filter-to").value = "";
  }
  function optionsFor(select, values, allLabel) {
    select.replaceChildren();
    const any = document.createElement("option");
    any.value = ""; any.textContent = allLabel; select.append(any);
    for (const value of values) {
      const opt = document.createElement("option");
      opt.value = value; opt.textContent = value;
      select.append(opt);
    }
    select.value = "";
  }
  function showFilters(mapping) {
    optionsFor($("dash-filter-status"), analytics.distinctValues(parsed.rows, mapping.status), "Todos os status");
    optionsFor($("dash-filter-category"), analytics.distinctValues(parsed.rows, mapping.category), "Todas as categorias");
    $("dash-filter-category").disabled = mapping.category === "";
    $("dash-filter-from").disabled = mapping.opened === "";
    $("dash-filter-to").disabled = mapping.opened === "";
    clearFilters();
    $("dash-filters").hidden = false;
  }
  function renderReport(useFilters = false) {
    if (!parsed) return;
    const mapping = getMapping();
    try {
      const filters = useFilters ? {
        status: $("dash-filter-status").value,
        category: $("dash-filter-category").value,
        from: $("dash-filter-from").value,
        to: $("dash-filter-to").value
      } : {};
      const currentRows = useFilters ? analytics.filterRows(parsed.rows, mapping, filters) : parsed.rows;
      const report = analytics.summarize(currentRows, mapping);
      const categoryColumn = mapping.category !== "" ? parsed.headers[Number(mapping.category)] : null;
      $("dash-category-column").textContent = categoryColumn
        ? "Coluna utilizada: " + categoryColumn
        : "Nenhuma coluna de categoria selecionada";
      $("dash-total").textContent = report.total.toLocaleString("pt-BR");
      $("dash-open").textContent = report.opened.toLocaleString("pt-BR");
      $("dash-resolved").textContent = report.resolved.toLocaleString("pt-BR");
      $("dash-average").textContent = report.averageResolutionHours == null ? "—" : report.averageResolutionHours.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1}) + " h";
      $("dash-average-caption").textContent = report.timedResolutions ? "Base: " + report.timedResolutions + " chamados com datas válidas" : "Exige datas de abertura e resolução válidas";
      barChart($("dash-status-bars"), report.byStatus, report.total);
      barChart($("dash-category-bars"), report.byCategory, report.total);
      $("dash-results").hidden = false;
      $("dash-filter-count").textContent = useFilters ? report.total + " de " + parsed.rows.length + " registros selecionados" : parsed.rows.length + " registros (sem filtros)";
      const prefix = report.total ? "Painel gerado: " + report.total + " chamados. " : "Nenhum chamado corresponde aos filtros. ";
      feedback(prefix + "Coluna de categoria: " + (categoryColumn || "não selecionada") + ". " + (report.other ? report.other + " status não classificados. " : "") + "Nenhum dado enviado para servidores.");
      return true;
    } catch (e) {
      feedback(e.message, true);
      return false;
    }
  }
  function createReport() {
    if (!parsed) return;
    if (renderReport(false)) showFilters(getMapping());
  }
  $("dash-example").addEventListener("click", () => load(demo, "Dados fictícios de demonstração"));
  $("dash-file").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2000000) { feedback("Limite de arquivo: 2 MB.", true); clearReport(); return; }
    try {
      const buffer = await file.arrayBuffer();
      let content;
      try { content = new TextDecoder("utf-8",{fatal:true}).decode(buffer); }
      catch (_) { content = new TextDecoder("windows-1252").decode(buffer); }
      load(content, file.name);
    } catch (e) { feedback("Não foi possível ler o arquivo: " + e.message, true); }
  });
  $("dash-mapping").addEventListener("submit", event => { event.preventDefault(); createReport(); });
  $("dash-filter-form").addEventListener("submit", event => { event.preventDefault(); renderReport(true); });
  $("dash-filter-reset").addEventListener("click", () => { clearFilters(); renderReport(false); });
  $("dash-clear").addEventListener("click", () => {
    parsed = null;
    $("dash-file").value = "";
    $("dash-mapping").hidden = true;
    $("dash-filters").hidden = true;
    clearFilters();
    $("dash-source").textContent = "Nenhum arquivo carregado";
    clearReport();
    feedback("Dados limpos da interface. Pronto para importar outro CSV.");
  });
})();