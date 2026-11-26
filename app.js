/* =====================================================================
   Gerador de Documentos PGR / PGTR / PCMSO
   App estático — estado guardado em localStorage
   ===================================================================== */
(function () {
"use strict";

/* ---------------- Configuração dos documentos ---------------- */
const DOCS = {
  pgr_nr01: {
    nome: "PGR (NR-01)",
    template: "pgr_nr01",
    vigenciaMeses: 24,
    labelVig: "2 anos",
    temCargos: true,  podeAnexo: false, rodape3: true,
    acoesPadrao: [
      "Elaboração do PGR (NR-1)",
      "Divulgação do inventário de riscos ocupacionais e as medidas de prevenção do plano de ação do PGR",
      "Avaliação ambiental quantitativa (Medições)",
      "Realizar capacitação de todos os colaboradores conforme item 1.7.1.2 da NR-1",
      "Implantação da CIPA (Comissão Interna de Prevenção de Acidentes)",
      "Programar realização da Análise Ergonômica do Trabalho (AET)",
      "Análise Global/Anual (Renovação) do PGR",
    ],
  },
  pgr_nr18: {
    nome: "PGR (NR-18)",
    template: "pgr_nr18",
    vigenciaMeses: 24,
    labelVig: "2 anos",
    temCargos: true,  podeAnexo: true, rodape3: true,
    acoesPadrao: [
      "Elaboração do PGR (NR-18)",
      "Divulgação do inventário de riscos ocupacionais e as medidas de prevenção do plano de ação do PGR",
      "Avaliação ambiental quantitativa (Medições)",
      "Realizar capacitação de todos os colaboradores conforme item 1.7.1.2 da NR-1",
      "Implantação da CIPA (Comissão Interna de Prevenção de Acidentes)",
      "Programar realização da Análise Ergonômica do Trabalho (AET)",
      "Análise Global/Anual (Renovação) do PGR",
    ],
  },
  pgtr_nr31: {
    nome: "PGTR (NR-31)",
    template: "pgtr_nr31",
    vigenciaMeses: 36,
    labelVig: "3 anos",
    temCargos: false, podeAnexo: false, rodape3: true,
    acoesPadrao: [
      "Implementação e divulgação do PGRTR",
      "Divulgação de ordem de serviço",
      "Fornecimento de EPI's adequado ao risco conforme NR-6",
      "Análise Global anual do PGRTR",
    ],
  },
  pcmso: {
    nome: "PCMSO",
    template: "pcmso",
    vigenciaMeses: 12,
    labelVig: "1 ano",
    temCargos: true,  podeAnexo: false, rodape3: true,
    acoesPadrao: [
      "Elaboração do PCMSO",
      "Divulgação do PCMSO",
      "Monitoramento de Saúde Ocupacional",
      "Avaliação periódica do PCMSO",
      "Relatório Analítico do PCMSO",
      "Avaliação Global/Anual do PCMSO",
    ],
  },
};

// ---------------- Profissionais responsáveis técnicos ----------------
// Opções pré-preenchidas por modelo. "manual" abre campos para preenchimento livre.
const RESP_TECS = {
  geraldo: {
    nome: "Dr. Geraldo da Cruz Lopes",
    titulo: "Especialista em Medicina do Trabalho",
    registro: "CRM/MG: 3.821 / RQE Nº: 17.172/MG",
    contato: "(031) 3572-1818",
    extra: "",
  },
  peterson: {
    nome: "Peterson da Silva Cassemiro",
    titulo: "Técnico em Segurança do Trabalho",
    registro: "Registro no MTE 45.342/SP",
    contato: "(31) 3572-1818 / 3572-1221",
    extra: "",
  },
  robson: {
    nome: "Engº Robson Luciano Siqueira Sica",
    titulo: "Engenheiro de Segurança do Trabalho",
    registro: "CREA/MG: 473.137/D",
    contato: "(31) 3572-1221 / 3572-1818 · segurança.ita@performanceocupacional.med.br",
    extra: "Téc. em Seg. do Trabalho Reg.: MTE 16.106 · CPF 051.721.676-09",
  },
};

// Opções do seletor por tipo de documento
const RESP_TEC_OPTIONS = {
  pcmso: [
    { key: "geraldo", label: "Dr. Geraldo da Cruz Lopes — Médico do Trabalho" },
    { key: "manual", label: "Preencher manualmente" },
  ],
  pgr_nr01: [
    { key: "peterson", label: "Peterson da Silva Cassemiro — Técnico de Segurança do Trabalho" },
    { key: "robson", label: "Robson Luciano Siqueira Sica — Engenheiro de Segurança do Trabalho" },
    { key: "manual", label: "Preencher manualmente" },
  ],
  pgr_nr18: [
    { key: "peterson", label: "Peterson da Silva Cassemiro — Técnico de Segurança do Trabalho" },
    { key: "robson", label: "Robson Luciano Siqueira Sica — Engenheiro de Segurança do Trabalho" },
    { key: "manual", label: "Preencher manualmente" },
  ],
  pgtr_nr31: [
    { key: "peterson", label: "Peterson da Silva Cassemiro — Técnico de Segurança do Trabalho" },
    { key: "robson", label: "Robson Luciano Siqueira Sica — Engenheiro de Segurança do Trabalho" },
    { key: "manual", label: "Preencher manualmente" },
  ],
};

const STORE_KEY = "pcmso_pgr_app_v1";
const MESES = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

/* Dados do responsável técnico selecionado: usa o preset se a opção for um dos
   profissionais fixos, ou os campos manuais quando a opção for "manual". */
function respTecDados() {
  const key = state.docInfo.respTec;
  const p = RESP_TECS[key];
  if (p) {
    return { nome: p.nome, titulo: p.titulo, registro: p.registro, contato: p.contato, extra: p.extra };
  }
  return {
    nome: state.docInfo.respNome || "",
    titulo: state.docInfo.respTitulo || "",
    registro: state.docInfo.respRegistro || "",
    contato: state.docInfo.respContato || "",
    extra: state.docInfo.respExtra || "",
  };
}

// Empresa elaboradora — dados FIXOS dos documentos originais (não editáveis)
const ELABORADORA_FIXA = {
  razaoSocial: "PERFORMANCE SAÚDE E SEGURANÇA OCUPACIONAL LTDA",
  nomeFantasia: "Grupo Performance",
  cnaeTexto: "Outras atividades de atenção à saúde humana não especificadas anteriormente",
  cnpj: "13.583.116/0001-42",
  inscEstadual: "Isento",
  endereco: "Praça Antônio Quirino da Silva, 28",
  bairro: "Centro",
  cidade: "Itatiaiuçu",
  uf: "Minas Gerais",
  cep: "35.685-000",
  responsavel: "Robson Luciano Siqueira Sica",
  telefone: "(31) 3572-1221 / 3572-1818",
  email: "comercial.ita@performanceocupacional.med.br seguranca.ita@performanceocupacional.med.br",
  cnaeCodigo: "86.90-9-99",
  grauRisco: "01 (um)",
  site: "www.performanceocupacional.com.br",
  qr: "https://free.qrplanet.com/performanceocupacional",
};

// Unidades para o rodapé "completo" (rodape3: true) — propostas do Gerador de Propostas
const UNIDADES_RODAPE = [
  { nome: "ITATIAIUÇU / MG", tel: "(31) 3572-1818 / (31) 3572-1221", end: "Praça Antônio Quirino da Silva, 28 – Centro" },
  { nome: "ITABIRA / MG", tel: "(31) 3840-1883 / (31) 99757-1883", end: "Av. Daniel Jardim de Grisolia, 85, 1° Andar – Centro" },
  { nome: "SÃO JOSÉ DO RIO PRETO / SP", tel: "(17) 3218-8036 / (17) 3212-8149", end: "Rua Ondina, 156 e 182 – Redentora" },
];

/* ---------------- Estado ---------------- */
let state = {
  doc: null,
  empresa: {
    razaoSocial:"", nomeFantasia:"", cnpj:"", inscEstadual:"",
    endereco:"", numero:"", complemento:"", bairro:"", cidade:"", uf:"", cep:"",
    responsavel:"", telefone:"", email:"", numMasc:0, numFem:0,
    horario:"", cnaeCodigo:"", cnaeTexto:"", grauRisco:"", unidade:"", logo:"",
  },
  docInfo: {
    dataElaboracao:"", cidadeAssinatura:"",
    respTec:"", respNome:"", respTitulo:"", respRegistro:"", respContato:"", respExtra:"",
  },
  elaboradora: {
    razaoSocial:"", cnpj:"", endereco:"", cidade:"", responsavel:"", telefone:"", email:"",
  },
  cargos: [],
  acoes: [],
  anexos: [], // data URLs
  revisoes: [], // histórico de revisões da capa: [{rev, data, historico, elaborado}]
};

/* ---------------- Util ---------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function toast(msg, type) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast" + (type ? " " + type : "");
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 3200);
}

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {
    toast("Falha ao salvar: armazenamento cheio?", "err");
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      state = Object.assign(state, s);
      // Migração: Unidade/Obra/Contrato passou para a empresa cliente
      if (!state.empresa.unidade && state.docInfo && state.docInfo.unidade) {
        state.empresa.unidade = state.docInfo.unidade;
      }
      // Migração: campos antigos do responsável técnico -> campos novos
      if (state.docInfo) {
        if (!state.docInfo.respNome) {
          state.docInfo.respNome = state.docInfo.elaborador || state.docInfo.medico || "";
        }
        if (!state.docInfo.respRegistro) {
          const partes = [state.docInfo.medicoCrm, state.docInfo.medicoRqe].filter(Boolean);
          if (partes.length) state.docInfo.respRegistro = partes.join(" / ");
        }
        if (!state.docInfo.respContato) {
          state.docInfo.respContato = state.docInfo.medicoContato || "";
        }
      }
    }
  } catch (e) { /* ignore */ }
}

/* ---------------- Tabs ---------------- */
$$("#tabs .tab").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("#tabs .tab").forEach(b => b.classList.remove("active"));
    $$(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    $("#panel-" + btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "cronograma") renderCronograma();
    if (btn.dataset.tab === "anexo") renderAnexo();
    if (btn.dataset.tab === "gerar") { renderResumo(); renderRevisoes(); }
  });
});

/* ---------------- Tab 1: modelo ---------------- */
$$(".doc-card").forEach(card => {
  card.addEventListener("click", () => {
    const key = card.dataset.doc;
    selectDoc(key);
  });
});

function selectDoc(key) {
  state.doc = key;
  const d = DOCS[key];
  $$(".doc-card").forEach(c => c.classList.toggle("selected", c.dataset.doc === key));
  // preenche vigência e data padrão
  $("#vigenciaMeses").value = d.vigenciaMeses;
  if (!state.docInfo.dataElaboracao) {
    const hoje = new Date();
    state.docInfo.dataElaboracao = hoje.toISOString().slice(0, 10);
  }
  $("#dataElaboracao").value = state.docInfo.dataElaboracao;
  $("#cronoDataElab").value = state.docInfo.dataElaboracao;
  // Ações padrão se não houver
  if (!state.acoes.length || state.acoes.length !== d.acoesPadrao.length) {
    state.acoes = d.acoesPadrao.map((nome, i) => makeAcao(i + 1, nome));
  }
  save();
  const info = $("#modeloInfo");
  info.hidden = false;
  info.innerHTML = `<b>Modelo selecionado:</b> ${esc(d.nome)} — vigência ${esc(d.labelVig)} (${d.vigenciaMeses} meses no cronograma). ` +
    (d.temCargos ? "Cargos, riscos e exames: sim." : "Cargos, riscos e exames: não aplicado (matriz de riscos fixa do modelo).") +
    (d.podeAnexo ? " <b>Anexo X com imagens: disponível.</b>" : "");
  renderResponsavelTecnico();
  renderCronograma();
  toast("Modelo " + d.nome + " selecionado", "ok");
}

/* ---------------- Tab 2: empresa ---------------- */
const EMPRESA_FIELDS = ["razaoSocial","nomeFantasia","cnpj","inscEstadual","endereco","numero","complemento","bairro","cidade","uf","cep","responsavel","telefone","email","horario","cnaeCodigo","cnaeTexto","grauRisco","unidade"];
const DOCINFO_FIELDS = ["dataElaboracao","cidadeAssinatura"];
const RESP_FIELDS = ["respNome","respTitulo","respRegistro","respContato","respExtra"];

// ---------------- Responsável técnico (por modelo) ----------------
function renderResponsavelTecnico() {
  const wrap = $("#respTecWrap");
  if (!wrap) return;
  const opts = (RESP_TEC_OPTIONS[state.doc] || []).slice();
  // garante um valor válido para o modelo atual
  if (!opts.some(o => o.key === state.docInfo.respTec)) {
    state.docInfo.respTec = opts.length ? opts[0].key : "";
    save();
  }
  let html = `<div class="resp-options">`;
  opts.forEach(o => {
    const checked = state.docInfo.respTec === o.key ? "checked" : "";
    html += `<label class="radio"><input type="radio" name="respTec" value="${o.key}" ${checked}> ${esc(o.label)}</label>`;
  });
  html += `</div>`;

  if (state.docInfo.respTec === "manual") {
    html += `<div class="form-grid resp-fields">`;
    const labs = {
      respNome: "Nome",
      respTitulo: "Título / Profissão",
      respRegistro: "Registro (CRM/RQE/CREA/MTE)",
      respContato: "Contato",
      respExtra: "Registros adicionais",
    };
    RESP_FIELDS.forEach(f => {
      html += `<div class="fg"><label>${labs[f]}</label><input id="${f}" type="text"></div>`;
    });
    html += `</div>`;
  } else {
    const p = RESP_TECS[state.docInfo.respTec];
    if (p) {
      html += `<div class="info-box resp-summary"><div class="elab-grid">`;
      html += `<div><b>Nome:</b> ${esc(p.nome)}</div>`;
      html += `<div><b>Título:</b> ${esc(p.titulo)}</div>`;
      html += `<div><b>Registro:</b> ${esc(p.registro)}</div>`;
      html += `<div><b>Contato:</b> ${esc(p.contato)}</div>`;
      if (p.extra) html += `<div><b>Outros:</b> ${esc(p.extra)}</div>`;
      html += `</div></div>`;
    } else {
      html += `<p class="muted">Selecione um modelo na etapa 1 para definir o responsável técnico.</p>`;
    }
  }
  wrap.innerHTML = html;

  // seletor de profissional
  wrap.querySelectorAll("input[name=respTec]").forEach(r => {
    r.addEventListener("change", e => {
      state.docInfo.respTec = e.target.value;
      save();
      renderResponsavelTecnico();
    });
  });
  // campos manuais
  RESP_FIELDS.forEach(f => bindInput("#" + f, v => state.docInfo[f] = v));
}

function bindForms() {
  EMPRESA_FIELDS.forEach(f => bindInput("#" + f, v => state.empresa[f] = v));
  DOCINFO_FIELDS.forEach(f => bindInput("#" + f, v => state.docInfo[f] = v, v => {
    if (f === "dataElaboracao") { $("#cronoDataElab").value = v; if (state.doc) renderCronograma(); }
  }));
  $("#numMasc").addEventListener("input", e => { state.empresa.numMasc = +e.target.value || 0; save(); });
  $("#numFem").addEventListener("input", e => { state.empresa.numFem = +e.target.value || 0; save(); });
}
function bindInput(sel, setter, extra) {
  const el = $(sel);
  if (!el) return;
  el.addEventListener("input", e => { setter(e.target.value); save(); if (extra) extra(e.target.value); });
}
function fillForms() {
  EMPRESA_FIELDS.forEach(f => { const el = $("#" + f); if (el) el.value = state.empresa[f] || ""; });
  $("#numMasc").value = state.empresa.numMasc || 0;
  $("#numFem").value = state.empresa.numFem || 0;
  DOCINFO_FIELDS.forEach(f => { const el = $("#" + f); if (el) el.value = state.docInfo[f] || ""; });
  renderLogo();
}

/* ---------------- Logo do cliente ---------------- */
function onLogoUpload(e) {
  const file = (e.target.files || [])[0];
  if (!file) return;
  const msg = $("#logoMsg");
  msg.textContent = "Processando logo…";
  const reader = new FileReader();
  reader.onload = () => {
    // comprime para manter o localStorage sob controle; preserva transparência de PNG
    compressImage(reader.result, 500, 0.9).then(dataUrl => {
      state.empresa.logo = dataUrl;
      save(); renderLogo();
      msg.textContent = "✓ Logo do cliente adicionada.";
      msg.classList.add("ok");
    });
  };
  reader.readAsDataURL(file);
  e.target.value = "";
}

function renderLogo() {
  const wrap = $("#logoBox");
  if (!wrap) return;
  const msg = $("#logoMsg");
  if (msg) { msg.classList.remove("ok"); msg.textContent = ""; }
  const logo = state.empresa.logo || "";
  wrap.innerHTML = `
    <label class="btn ghost file-label">🖼️ Enviar logo
      <input type="file" id="logoInput" accept="image/*" hidden>
    </label>
    <div class="logo-preview" id="logoPreview"></div>
    <span class="muted">A logo do cliente, se houver, aparece na capa do documento.</span>`;
  const input = $("#logoInput");
  if (input) input.addEventListener("change", onLogoUpload);
  const prev = $("#logoPreview");
  if (logo) {
    prev.innerHTML = `<button class="del" id="logoDel" title="Remover logo">×</button><img src="${logo}" alt="Logo do cliente">`;
    $("#logoDel").addEventListener("click", () => {
      state.empresa.logo = "";
      save(); renderLogo();
    });
  } else {
    prev.innerHTML = `<span class="muted" style="font-size:12px">Sem logo</span>`;
  }
}

/* ---------------- Lookup CNPJ (Receita Federal) ---------------- */
$("#btnLookup").addEventListener("click", doLookup);
$("#lookupInput").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); doLookup(); } });

// Pré-validação local do CNPJ (14 dígitos + dígitos verificadores)
function validarCnpj(cnpj) {
  cnpj = cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14) return { ok: false, motivo: "tamanho" };
  if (/^(\d)\1+$/.test(cnpj)) return { ok: false, motivo: "repetido" };
  const n = cnpj.split("").map(Number);
  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  let s1 = 0; for (let i = 0; i < 12; i++) s1 += n[i] * w1[i];
  let d1 = 11 - (s1 % 11); if (d1 >= 10) d1 = 0;
  if (d1 !== n[12]) return { ok: false, motivo: "dv1" };
  let s2 = 0; for (let i = 0; i < 13; i++) s2 += n[i] * w2[i];
  let d2 = 11 - (s2 % 11); if (d2 >= 10) d2 = 0;
  if (d2 !== n[13]) return { ok: false, motivo: "dv2" };
  return { ok: true };
}

// "Nome Próprio": caixa alta -> título, preposições em minúsculo (exceto 1ª palavra), siglas preservadas
function toNomeProprio(s) {
  if (!s) return "";
  const preposicoes = new Set(["de","da","do","das","dos","e","em","a","o","na","no"]);
  const siglas = ["LTDA","S/A","S.A.","ME","EPP","EIRELI","MEI"];
  const escRe = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const words = s.trim().split(/\s+/);
  let out = words.map((w, i) => {
    const low = w.toLowerCase();
    if (i > 0 && preposicoes.has(low)) return low;
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
  let res = out.join(" ");
  siglas.forEach(sig => {
    // lookarounds de não-alfanumérico funcionam para siglas com pontuação (S.A., S/A)
    res = res.replace(new RegExp("(?<![A-Za-z0-9])" + escRe(sig) + "(?![A-Za-z0-9])", "gi"), sig);
  });
  return res;
}

function fmtCnpj(d) { d = d.replace(/\D/g, ""); if (d.length === 14) return d.slice(0,2)+"."+d.slice(2,5)+"."+d.slice(5,8)+"/"+d.slice(8,12)+"-"+d.slice(12); return d; }
function fmtCep(d) { d = d.replace(/\D/g, ""); if (d.length === 8) return d.slice(0,5)+"-"+d.slice(5); return d; }
function fmtTelefone(d) {
  d = d.replace(/\D/g, "");
  if (d.length === 11) return "("+d.slice(0,2)+") "+d.slice(2,3)+" "+d.slice(3,7)+"-"+d.slice(7);
  if (d.length === 10) return "("+d.slice(0,2)+") "+d.slice(2,6)+"-"+d.slice(6);
  return d;
}

// Preenche o formulário da empresa a partir dos dados mapeados
function preencherEmpresa(d) {
  const e = state.empresa;
  e.razaoSocial = toNomeProprio(d.razao) || e.razaoSocial;
  e.nomeFantasia = toNomeProprio(d.fantasia) || e.nomeFantasia;
  e.endereco = toNomeProprio(d.logradouro) || e.endereco;
  e.numero = d.numero || e.numero;
  e.bairro = toNomeProprio(d.bairro) || e.bairro;
  e.cidade = toNomeProprio(d.cidade) || e.cidade;
  // Complemento: campo separado, senão concatena ao endereço
  if ($("#complemento")) {
    e.complemento = toNomeProprio(d.complemento) || e.complemento;
  } else if (d.complemento) {
    e.endereco = (e.endereco ? e.endereco + " — " : "") + toNomeProprio(d.complemento);
  }
  e.cep = fmtCep(d.cep) || e.cep;
  e.uf = (d.uf || "").toUpperCase() || e.uf;
  e.cnpj = fmtCnpj($("#lookupInput").value) || e.cnpj;
  e.cnaeTexto = d.cnae || e.cnaeTexto;
  // Contatos: só preencher se vazio (não sobrescreve contatos já digitados)
  if (!e.telefone && d.telefone) e.telefone = fmtTelefone(d.telefone);
  if (!e.email && d.email) e.email = String(d.email).toLowerCase();
  fillForms();
}

async function doLookup() {
  const raw = $("#lookupInput").value.trim();
  const msg = $("#lookupMsg");
  const valid = $("#lookupValid");
  msg.className = "lookup-msg";
  valid.className = "lookup-valid";
  valid.textContent = "";
  if (!raw) { msg.textContent = "Digite um CNPJ para buscar."; msg.classList.add("err"); return; }

  // 1) Pré-validação local — não chama API se o CNPJ for inválido
  const cnpj = raw.replace(/\D/g, "");
  if (cnpj.length !== 14) {
    valid.textContent = "⚠ CNPJ inválido — são necessários 14 dígitos.";
    valid.classList.add("err"); msg.textContent = ""; return;
  }
  if (/^(\d)\1+$/.test(cnpj)) {
    valid.textContent = "⚠ CNPJ inválido — sequência numérica repetida.";
    valid.classList.add("err"); msg.textContent = ""; return;
  }
  const v = validarCnpj(cnpj);
  if (!v.ok) {
    valid.textContent = "⚠ Dígito verificador inválido.";
    valid.classList.add("err"); msg.textContent = ""; return;
  }
  valid.textContent = "✓ CNPJ válido.";
  valid.classList.add("ok");

  // 2) Consulta em cascata
  const btn = $("#btnLookup");
  btn.disabled = true; btn.textContent = "Buscando…";
  msg.textContent = "Consultando a Receita Federal…";
  let dados = null, fonte = "";

  // Primária: BrasilAPI
  try {
    const r = await fetch("https://brasilapi.com.br/api/cnpj/v1/" + cnpj, { headers: { "Accept": "application/json" } });
    if (r.ok) {
      const j = await r.json();
      if (j && j.razao_social) {
        dados = {
          razao: j.razao_social, fantasia: j.nome_fantasia,
          logradouro: j.logradouro, numero: j.numero, complemento: j.complemento,
          bairro: j.bairro, cep: j.cep, cidade: j.municipio, uf: j.uf,
          telefone: j.ddd_telefone_1, email: j.email,
          situacao: j.descricao_situacao_cadastral, simples: j.opcao_pelo_simples,
          cnae: j.cnae_fiscal_descricao
        };
        fonte = "BrasilAPI";
      }
    }
  } catch (e) {}

  // Fallback automático: CNPJá Open
  if (!dados) {
    try {
      const r = await fetch("https://open.cnpja.com/office/" + cnpj, { headers: { "Accept": "application/json" } });
      if (r.ok) {
        const j = await r.json();
        const c = j.company || {}, a = j.address || {};
        const ph = (j.phones && j.phones[0]) ? ((j.phones[0].area || "") + (j.phones[0].number || "")) : "";
        const em = (j.emails && j.emails[0]) ? j.emails[0].address : "";
        if (c.name || j.alias) {
          dados = {
            razao: c.name, fantasia: j.alias,
            logradouro: a.street, numero: a.number, complemento: a.details,
            bairro: a.district, cep: a.zip, cidade: a.city, uf: a.state,
            telefone: ph, email: em,
            situacao: (j.status && j.status.text) ? j.status.text : "",
            simples: c.simples ? c.simples.optant : null,
            cnae: (j.mainActivity && j.mainActivity.text) ? j.mainActivity.text : ""
          };
          fonte = "CNPJá";
        }
      }
    } catch (e) {}
  }

  btn.disabled = false; btn.textContent = "🔎 Buscar";

  // 3) Resultados e avisos
  if (dados) {
    preencherEmpresa(dados);
    save();
    const situacao = dados.situacao || "";
    const naoAtiva = situacao && situacao.toUpperCase().indexOf("ATIVA") === -1;
    if (naoAtiva) {
      msg.textContent = "⚠ Situação cadastral: " + situacao + ". Verifique antes de usar os dados. (" + fonte + ")";
      msg.className = "lookup-msg warn";
    } else {
      let texto = "✓ Dados localizados (" + fonte + "). Preenchido — confira e ajuste.";
      if (dados.simples === true) texto += " Empresa optante pelo Simples Nacional.";
      msg.textContent = texto;
      msg.className = "lookup-msg ok";
    }
  } else {
    msg.textContent = "⚠ Não conseguimos localizar o CNPJ (falha nas APIs ou sem internet). Preencha os campos manualmente — o app não trava.";
    msg.className = "lookup-msg err";
  }
}

/* ---------------- Tab 3: cargos / riscos / exames ---------------- */
$("#pdfInput").addEventListener("change", onPdfUpload);
$("#btnAdicionarCargo").addEventListener("click", () => {
  state.cargos.push(newCargo());
  renderCargos(); save();
});

function newCargo() {
  return {
    id: uid(),
    cargo: "", função: "", setor: "", local: "",
    numMasc: 1, numFem: 0,
    descAmbiente: "", descAtividades: "", horário: "",
    riscos: [], exames: [],
  };
}
function newRisco() {
  return { agente:"", codigoEsical:"", grupo:"", tipoDeRisco:"", tipoDeExposicao:"", focoExame:"", lesoesAgravos:"", fontesCircunstancias:"", controlesExistentes:"" };
}
function newExame() {
  return { exame:"", codigoEsical:"", admissao:"", periodico:"", retorno:"", mudanca:"", demissao:"" };
}

/* Reconstrói linhas de texto de uma página do pdf.js agrupando itens pela
   coordenada Y (transform[5]). Items no mesmo Y formam uma linha; Y diferente
   inicia uma nova linha. Isso preserva a estrutura de blocos do documento. */
function pageLines(items) {
  // Filtra itens vazios e coleta (str, y, x)
  const rows = [];
  for (const it of items) {
    const s = (it.str || "").trim();
    if (!s) continue;
    const y = it.transform ? it.transform[5] : 0;
    const x = it.transform ? it.transform[4] : 0;
    rows.push({ s, y, x });
  }
  if (!rows.length) return "";
  // Ordena por y (decrescente = topo para base) e depois por x
  rows.sort((a, b) => (Math.abs(a.y - b.y) < 2 ? a.x - b.x : b.y - a.y));
  // Agrupa por Y
  const lines = [];
  let cur = null;
  let curY = null;
  for (const r of rows) {
    if (curY === null || Math.abs(r.y - curY) >= 2) {
      if (cur) lines.push(cur);
      cur = r.s;
      curY = r.y;
    } else {
      cur += " " + r.s;
    }
  }
  if (cur) lines.push(cur);
  return lines.join("\n");
}

async function onPdfUpload(e) {
  const files = Array.from(e.target.files || []);
  const msg = $("#pdfMsg");
  if (!files.length) return;
  msg.textContent = "Extraindo texto dos PDFs…";
  msg.className = "lookup-msg";
  try {
    if (typeof pdfjsLib === "undefined") throw new Error("pdf.js não carregado");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "js/pdf.worker.min.js";
    let allText = "";
    for (const file of files) {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let txt = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        txt += pageLines(content.items) + "\n";
      }
      allText += "\n" + txt;
    }
    const parsed = parsePdfText(allText);
    if (parsed.length) {
      state.cargos = parsed;
      renderCargos(); save();
      msg.textContent = "✓ Extraídos " + parsed.length + " cargo(s). Revise e ajuste os campos.";
      msg.classList.add("ok");
    } else {
      msg.textContent = "⚠ Texto extraído, mas nenhum cargo identificado. Adicione os cargos manualmente.";
      msg.classList.add("err");
    }
  } catch (err) {
    msg.textContent = "⚠ Falha na extração: " + (err.message || err);
    msg.classList.add("err");
  }
  e.target.value = "";
}

/* Heuristic parser for dirceu system PDFs (best-effort, editable).
   Opera sobre linhas para preservar agrupamento de checkmarks/riscos. */
function parsePdfText(text) {
  const lines = text.split(/\r?\n/).map(l => l.replace(/[ \t]+/g, " ").trim());
  const cargos = [];

  // Índices de início de bloco de cargo: linha que começa com "CARGO "
  // (exclui o índice de conteúdo, que não começa com "CARGO <letras>")
  const blockStarts = [];
  lines.forEach((l, i) => {
    if (/^CARGO\s+[A-ZÁÀÂÃÉÊÍÎÓÔÕÚÛÇÑ]/.test(l)) blockStarts.push(i);
  });
  if (!blockStarts.length) return [];

  // Classificação de categoria de risco
  const catMap = {
    "ACIDENTES / MÉNICOS": "ACIDENTES",
    "ACIDENTES / MECÂNICOS": "ACIDENTES",
    "ERGONÔMICOS": "ERGONÔMICOS",
    "FÍSICOS": "FÍSICOS",
    "QUÍMICOS": "QUÍMICOS",
  };

  // Marcadores de sub-seção dentro de um bloco de cargo
  const isSec = (l) =>
    l.startsWith("CONTROLE MÉDICO -") ||
    l.startsWith("Ambientes:") || l.startsWith("Empregados:") ||
    l.startsWith("Atividades:") || l.startsWith("IQCT:") ||
    l.startsWith("RISCOS ") || l.startsWith("INVENTÁRIO DE RISCOS ") ||
    /CRONOGRAMA/i.test(l);   // cronograma: fim da área de riscos do cargo

  // Mapa de periodicidade dos checkmarks
  const periodoMap = [
    ["admissional", "admissao"],
    ["demissional", "demissao"],
    ["retorno ao trabalho", "retorno"],
    ["mudança de riscos", "mudanca"],
    ["periódico", "periodico"],
  ];

  blockStarts.forEach((bi, idx) => {
    const be = idx + 1 < blockStarts.length ? blockStarts[idx + 1] : lines.length;
    const block = lines.slice(bi, be);

    // Cabeçalho: "CARGO <X> - <Y>"
    const head = block[0];
    const headM = head.match(/^CARGO\s+(.+?)\s+-\s+(.+)$/i);
    if (!headM) return;
    const cargoName = headM[1].trim();
    const funcao = headM[2].trim();

    // Divide o bloco em sub-seções
    const secIdx = [];
    block.forEach((l, k) => { if (isSec(l)) secIdx.push(k); });
    const sections = [];
    secIdx.forEach((k, si) => {
      const end = si + 1 < secIdx.length ? secIdx[si + 1] : block.length;
      sections.push({ key: block[k], lines: block.slice(k, end) });
    });
    // Cabeçalho do cargo (antes da primeira sub-seção): contém introdução + exames
    const headLines = secIdx.length ? block.slice(1, secIdx[0]) : block.slice(1);

    const c = newCargo();
    c.cargo = cargoName;     // nome do cargo (antes do " - ")
    c.setor = funcao;        // setor/ambiente (depois do " - ")

    // Campos do bloco. O label e o valor podem estar na mesma linha
    // (pdf.js costuma juntar "Empregados: 3 pessoas..." em uma linha).
    const secValue = (sec, label) => {
      const first = sec.lines[0] || "";
      const restOfFirst = first.replace(new RegExp("^" + label + "\\s*"), "").trim();
      const following = sec.lines.slice(1).join(" ").trim();
      return (restOfFirst + " " + following).replace(/\s+/g, " ").trim();
    };
    const labelRe = /^(Ambientes:|Empregados:|Atividades:|IQCT:|CONTROLE MÉDICO|RISCOS |INVENTÁRIO DE RISCOS )/i;
    const introRe = /Abaixo estão listados|dados técnicos|ambientes e os riscos|cargo estão expostos/i;
    for (let si = 0; si < sections.length; si++) {
      const sec = sections[si];
      if (sec.key.startsWith("Ambientes:")) {
        const val = secValue(sec, "Ambientes:");
        if (val) c.descAmbiente = val.replace(/\s*\(Ambiente Principal\)\s*/i, "").trim();
      } else if (sec.key.startsWith("Empregados:")) {
        const val = secValue(sec, "Empregados:");
        const h = val.match(/(\d+)\s*homens/i);
        const w = val.match(/(\d+)\s*mulher/i);
        if (h) c.numMasc = +h[1];
        if (w) c.numFem = +w[1];
      } else if (sec.key.startsWith("Atividades:")) {
        // O texto da atividade pode se envolver ao redor do label "Atividades:"
        // (pdf.js insere o label no meio do parágrafo). Captura o trecho após o
        // label + linhas seguintes, e prepend a linha anterior se for texto de atividade.
        let val = secValue(sec, "Atividades:");
        const startK = secIdx[si];
        if (startK > 0) {
          const prev = block[startK - 1];
          if (prev && !labelRe.test(prev) && !introRe.test(prev) && prev.length > 10) {
            val = (prev + " " + val).replace(/\s+/g, " ").trim();
          }
        }
        if (val) c.descAtividades = val;
      } else if (sec.key.startsWith("IQCT:")) {
        const val = secValue(sec, "IQCT:");
        // ignora ruído numérico (ex: "100/100", números de página/índice)
        if (val && !/^[\d\s\/.,%]+$/.test(val)) {
          c.descAtividades = c.descAtividades ? (c.descAtividades + " " + val) : val;
        }
      }
    }

    // Exames do cargo: varre o bloco todo (cabeçalho, Atividades, CONTROLE MÉDICO)
    const examNames = [];
    const examCodes = [];
    const examKeyRe = /Ocupacional|Audiometria|Espirometria|Otorrino|Avaliação Clínica|Exame[s]? /i;
    const grabExames = (src) => {
      for (const l of src) {
        // Código eSocial
        const cd = l.match(/Código\(s\)\s*eSocial:\s*(0\d{3})/i);
        if (cd) { examCodes.push(cd[1]); continue; }
        // Nome de exame: texto antes de ":" que contém palavra-chave de exame.
        // O ":" pode não estar no final da linha (pdf.js intercala com checkmarks).
        const nm = l.match(/^(.+?)\s*:(?=[^:]*$)/i);
        if (nm && examKeyRe.test(nm[1])) {
          const nome = nm[1].trim();
          if (/CONTROLE MÉDICO|Código|eSocial|Ambientes|Empregados|Atividades|IQCT|RISCOS|INVENTÁRIO/i.test(nome)) continue;
          if (nome.length < 4) continue;
          examNames.push(nome);
        }
      }
    };
    grabExames(block);

    // CONTROLE MÉDICO (PCMSO): checkmarks
    const controle = sections.find(s => s.key.startsWith("CONTROLE MÉDICO -"));
    let checkGroups = [];
    if (controle) {
      // Checkmarks: coleta todos na ordem e divide em grupos — cada grupo de
      // exame começa com "Admissional". Lida com a intercalação do pdf.js
      // (labels/códigos mesclados com os checkmarks).
      const all = [];
      for (const l of controle.lines.slice(1)) {
        if (/\uf00c/.test(l)) {
          const m = l.match(/\uf00c\s*Fazer (?:no|na)\s+(.+)$/i);
          if (m) all.push(m[1].trim().replace(/\*$/, ""));
        }
      }
      const groups = [];
      let cur = [];
      for (const label of all) {
        if (cur.length && /admissional/i.test(label)) {
          groups.push(cur);
          cur = [];
        }
        cur.push(label);
      }
      if (cur.length) groups.push(cur);
      checkGroups = groups;
    }

    // Monta exames associando checkmarks por conjunto
    const exames = examNames.map((nm, i) => {
      const ex = newExame();
      ex.exame = nm;
      ex.codigoEsical = examCodes[i] || examCodes[i - 1] || "";
      return ex;
    });
    if (exames.length) {
      for (let g = 0; g < exames.length; g++) {
        const grp = checkGroups[g] || checkGroups[checkGroups.length - 1] || [];
        for (const label of grp) {
          const key = label.toLowerCase();
          for (const [src, dst] of periodoMap) {
            if (key.includes(src)) exames[g][dst] = true;
          }
        }
      }
      c.exames = exames;
    }

    // Riscos: sub-seções RISCOS <CAT> / INVENTÁRIO DE RISCOS <CAT>
    const seen = new Set();
    for (const sec of sections) {
      if (!(sec.key.startsWith("RISCOS ") || sec.key.startsWith("INVENTÁRIO DE RISCOS "))) continue;
      let cat = sec.key.replace(/^(RISCOS|INVENTÁRIO DE RISCOS)\s+/i, "");
      cat = cat.replace(/\s+-\s+.*$/, "").trim();
      const tipo = catMap[cat] || cat.toUpperCase();

      // Agentes: "\uf0c8 <Risco>"
      for (let k = 0; k < sec.lines.length; k++) {
        const am = sec.lines[k].match(/^\uf0c8\s+(.+)$/);
        if (!am) continue;
        // remove sufixo "eSocial <código>" que o pdf.js costuma juntar ao agente
        let agente = am[1].trim().replace(/\s*eSocial\s+\d{2}\.\d{2}\.\d{3}\s*$/i, "").trim();
        if (/^PCMSO|^PGR|CEP:|CNPJ:|Telefone:|E-mail:|Programa/i.test(agente)) continue;
        if (agente.length < 2) continue;

        const r = newRisco();
        r.agente = agente;
        r.tipoDeRisco = tipo;

        // Texto após o agente até a próxima marca
        const rest = sec.lines.slice(k).join(" ");
        const pf = rest.match(/Perigos, fontes e circunstâncias:\s*(.+?)(?=\s+(?:Metodologia:|Descrição do Agente|Probabilidade:|Severidade:|Nível do Risco))/i);
        if (pf) r.fontesCircunstancias = pf[1].trim();
        const mm = rest.match(/Metodologia:\s*(.+?)(?=\.?\s*(?:Descrição do Agente|Probabilidade|Severidade|Nível))/i);
        if (mm) r.metodologia = mm[1].trim();
        const dm = rest.match(/Descrição do Agente Nocivo:\s*(.+?)(?=\.?\s*(?:Probabilidade|Severidade|Nível))/i);
        if (dm) r.descricaoAgente = dm[1].trim();

        const key = r.agente + "|" + r.tipoDeRisco;
        if (!seen.has(key)) { seen.add(key); c.riscos.push(r); }
      }
    }

    if (c.cargo || c.função || c.riscos.length || c.exames.length) {
      cargos.push(c);
    }
  });

  // Mescla blocos de mesmo cargo (ex: PCMSO + PGR usam os mesmos 9 cargos):
  // mantém um registro por nome de cargo, unindo riscos e exames.
  const byName = new Map();
  for (const c of cargos) {
    const key = (c.cargo || c.função || "").toUpperCase().trim();
    if (!key) continue;
    if (byName.has(key)) {
      const base = byName.get(key);
      // riscos: union por agente+tipoDeRisco
      const seenR = new Set(base.riscos.map(r => r.agente + "|" + r.tipoDeRisco));
      for (const r of c.riscos) {
        const k = r.agente + "|" + r.tipoDeRisco;
        if (!seenR.has(k)) { seenR.add(k); base.riscos.push(r); }
      }
      // exames: complementa se a base não tem
      if (!base.exames.length && c.exames.length) base.exames = c.exames;
      // campos vazios na base são preenchidos pela cópia
      if (!base.descAmbiente && c.descAmbiente) base.descAmbiente = c.descAmbiente;
      if (!base.descAtividades && c.descAtividades) base.descAtividades = c.descAtividades;
      if (!base.numMasc && c.numMasc) base.numMasc = c.numMasc;
      if (!base.numFem && c.numFem) base.numFem = c.numFem;
    } else {
      byName.set(key, c);
    }
  }
  return Array.from(byName.values());
}

function renderCargos() {
  const list = $("#cargosList");
  const empty = $("#cargoEmpty");
  $("#cargoCount").textContent = state.cargos.length + " cargo(s)";
  empty.hidden = state.cargos.length > 0;
  list.innerHTML = "";
  state.cargos.forEach((c, idx) => {
    const card = document.createElement("div");
    card.className = "cargo-card";
    card.innerHTML = `
      <header>
        <h3>Cargo ${idx + 1}</h3>
        <button class="icon-btn" data-del-cargo="${c.id}">Remover</button>
      </header>
      <div class="form-grid">
        <div class="fg"><label>Cargo</label><input data-cargo="${c.id}" data-f="cargo" value="${esc(c.cargo)}"></div>
        <div class="fg"><label>Setor</label><input data-cargo="${c.id}" data-f="setor" value="${esc(c.setor)}"></div>
        <div class="fg"><label>Local</label><input data-cargo="${c.id}" data-f="local" value="${esc(c.local)}"></div>
        <div class="fg"><label>Horário de trabalho</label><input data-cargo="${c.id}" data-f="horário" value="${esc(c.horário)}"></div>
        <div class="fg"><label>Colaboradores — M</label><input type="number" data-cargo="${c.id}" data-f="numMasc" value="${c.numMasc}"></div>
        <div class="fg"><label>Colaboradores — F</label><input type="number" data-cargo="${c.id}" data-f="numFem" value="${c.numFem}"></div>
        <div class="fg" style="grid-column:1/-1"><label>Descrição do ambiente de trabalho</label><input data-cargo="${c.id}" data-f="descAmbiente" value="${esc(c.descAmbiente)}"></div>
        <div class="fg" style="grid-column:1/-1"><label>Descrição das atividades</label><input data-cargo="${c.id}" data-f="descAtividades" value="${esc(c.descAtividades)}"></div>
      </div>
      <div class="cargo-sub">
        <h4>Riscos ocupacionais</h4>
        <table class="data">
          <thead><tr>
            <th>Agente / perigo</th><th>Cód. Esocial</th><th>Grupo</th><th>Tipo de risco</th>
            <th>Tipo de exposição</th><th>Foco do exame</th>
            <th>Lesões e agravos</th><th>Fontes / causas</th><th>Controles</th><th></th>
          </tr></thead>
          <tbody id="riscos-${c.id}"></tbody>
        </table>
        <button class="icon-btn" data-add-risco="${c.id}">+ Risco</button>
      </div>
      <div class="cargo-sub">
        <h4>Exames</h4>
        <table class="data">
          <thead><tr>
            <th>Exame</th><th>Cód. Esocial</th><th>Admissão</th><th>Periódico</th>
            <th>Retorno</th><th>Mudança</th><th>Demissão</th><th></th>
          </tr></thead>
          <tbody id="exames-${c.id}"></tbody>
        </table>
        <button class="icon-btn" data-add-exame="${c.id}">+ Exame</button>
      </div>`;
    list.appendChild(card);
    renderRiscos(c);
    renderExames(c);
  });
  // bind cargo fields
  $$("[data-cargo]").forEach(inp => {
    inp.addEventListener("input", e => {
      const c = state.cargos.find(x => x.id === inp.dataset.cargo);
      if (!c) return;
      c[inp.dataset.f] = inp.type === "number" ? (+inp.value || 0) : inp.value;
      save();
    });
  });
  $$("[data-del-cargo]").forEach(btn => btn.addEventListener("click", () => {
    state.cargos = state.cargos.filter(x => x.id !== btn.dataset.delCargo);
    renderCargos(); save();
  }));
  $$("[data-add-risco]").forEach(btn => btn.addEventListener("click", () => {
    const c = state.cargos.find(x => x.id === btn.dataset.addRisco);
    c.riscos.push(newRisco()); renderRiscos(c); save();
  }));
  $$("[data-add-exame]").forEach(btn => btn.addEventListener("click", () => {
    const c = state.cargos.find(x => x.id === btn.dataset.addExame);
    c.exames.push(newExame()); renderExames(c); save();
  }));
}
function renderRiscos(c) {
  const tb = $("#riscos-" + c.id);
  if (!tb) return;
  tb.innerHTML = "";
  c.riscos.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input data-r="${c.id}:${i}" data-rf="agente" value="${esc(r.agente)}"></td>
      <td><input data-r="${c.id}:${i}" data-rf="codigoEsical" value="${esc(r.codigoEsical)}"></td>
      <td><input data-r="${c.id}:${i}" data-rf="grupo" value="${esc(r.grupo)}"></td>
      <td><input data-r="${c.id}:${i}" data-rf="tipoDeRisco" value="${esc(r.tipoDeRisco)}"></td>
      <td><input data-r="${c.id}:${i}" data-rf="tipoDeExposicao" value="${esc(r.tipoDeExposicao)}"></td>
      <td><input data-r="${c.id}:${i}" data-rf="focoExame" value="${esc(r.focoExame)}"></td>
      <td><input data-r="${c.id}:${i}" data-rf="lesoesAgravos" value="${esc(r.lesoesAgravos)}"></td>
      <td><input data-r="${c.id}:${i}" data-rf="fontesCircunstancias" value="${esc(r.fontesCircunstancias)}"></td>
      <td><input data-r="${c.id}:${i}" data-rf="controlesExistentes" value="${esc(r.controlesExistentes)}"></td>
      <td><button class="row-del" data-delr="${c.id}:${i}">×</button></td>`;
    tb.appendChild(tr);
  });
  $$(`[data-r^="${c.id}:"]`).forEach(inp => {
    inp.addEventListener("input", e => {
      const [cid, i] = inp.dataset.r.split(":");
      const cargo = state.cargos.find(x => x.id === cid);
      cargo.riscos[+i][inp.dataset.rf] = inp.value;
      save();
    });
  });
  $$(`[data-delr^="${c.id}:"]`).forEach(btn => btn.addEventListener("click", () => {
    const [cid, i] = btn.dataset.delr.split(":");
    state.cargos.find(x => x.id === cid).riscos.splice(+i, 1);
    renderRiscos(state.cargos.find(x => x.id === cid)); save();
  }));
}
function renderExames(c) {
  const tb = $("#exames-" + c.id);
  if (!tb) return;
  tb.innerHTML = "";
  c.exames.forEach((ex, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input data-ex="${c.id}:${i}" data-ef="exame" value="${esc(ex.exame)}"></td>
      <td><input data-ex="${c.id}:${i}" data-ef="codigoEsical" value="${esc(ex.codigoEsical)}"></td>
      <td style="text-align:center"><input type="checkbox" data-ex="${c.id}:${i}" data-ef="admissao" ${ex.admissao?"checked":""}></td>
      <td style="text-align:center"><input type="checkbox" data-ex="${c.id}:${i}" data-ef="periodico" ${ex.periodico?"checked":""}></td>
      <td style="text-align:center"><input type="checkbox" data-ex="${c.id}:${i}" data-ef="retorno" ${ex.retorno?"checked":""}></td>
      <td style="text-align:center"><input type="checkbox" data-ex="${c.id}:${i}" data-ef="mudanca" ${ex.mudanca?"checked":""}></td>
      <td style="text-align:center"><input type="checkbox" data-ex="${c.id}:${i}" data-ef="demissao" ${ex.demissao?"checked":""}></td>
      <td><button class="row-del" data-delx="${c.id}:${i}">×</button></td>`;
    tb.appendChild(tr);
  });
  $$(`[data-ex^="${c.id}:"]`).forEach(inp => {
    const ev = inp.type === "checkbox" ? "change" : "input";
    inp.addEventListener(ev, e => {
      const [cid, i] = inp.dataset.ex.split(":");
      const cargo = state.cargos.find(x => x.id === cid);
      cargo.exames[+i][inp.dataset.ef] = inp.type === "checkbox" ? inp.checked : inp.value;
      save();
    });
  });
  $$(`[data-delx^="${c.id}:"]`).forEach(btn => btn.addEventListener("click", () => {
    const [cid, i] = btn.dataset.delx.split(":");
    state.cargos.find(x => x.id === cid).exames.splice(+i, 1);
    renderExames(state.cargos.find(x => x.id === cid)); save();
  }));
}

/* ---------------- Tab 4: cronograma ---------------- */
$("#vigenciaMeses").addEventListener("input", e => { renderCronograma(); save(); });
$("#cronoDataElab").addEventListener("input", e => {
  state.docInfo.dataElaboracao = e.target.value;
  $("#dataElaboracao").value = e.target.value;
  save(); renderCronograma();
});
$("#btnAdicionarAcao").addEventListener("click", () => {
  state.acoes.push(makeAcao(state.acoes.length + 1, "Nova ação"));
  renderCronograma(); save();
});

function makeAcao(item, nome) {
  const all = getMonths();
  return { id: uid(), item, nome, responsavel: state.empresa.razaoSocial || "Empresa Cliente", modo: "fixo", meses: all.map(m => m.key), classificacao: "", estilo: "caixa" };
}

function getMonths() {
  const d = DOCS[state.doc];
  const meses = Math.max(1, +$("#vigenciaMeses").value || d.vigenciaMeses);
  const elab = state.docInfo.dataElaboracao || new Date().toISOString().slice(0, 10);
  const [y, m] = elab.split("-").map(Number);
  const out = [];
  for (let i = 0; i < meses; i++) {
    const dt = new Date(y, m - 1 + i, 1);
    out.push({ key: dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0"), label: MESES[dt.getMonth()] + " " + dt.getFullYear() });
  }
  return out;
}

function getVigencia() {
  const d = DOCS[state.doc];
  const meses = Math.max(1, +$("#vigenciaMeses").value || d.vigenciaMeses);
  const elab = state.docInfo.dataElaboracao || new Date().toISOString().slice(0, 10);
  const [y, m, dia] = elab.split("-").map(Number);
  const ini = new Date(y, m - 1, dia);
  const fim = new Date(y, m - 1 + meses, dia);
  fim.setDate(fim.getDate() - 1); // último dia da vigência
  return {
    inicio: fmt(ini), final: fmt(fim),
  };
}
function fmt(d) {
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
}

function renderCronograma() {
  const meses = getMonths();
  const vig = getVigencia();
  $("#vigenciaInfo").textContent = "Vigência: " + vig.inicio + " À " + vig.final + " — " + meses.length + " meses";
  $("#cronoDataElab").value = state.docInfo.dataElaboracao || "";
  $("#vigenciaMeses").value = +$("#vigenciaMeses").value || DOCS[state.doc].vigenciaMeses;

  const list = $("#acoesList");
  list.innerHTML = "";
  $("#acaoCount").textContent = state.acoes.length + " ação(ões)";
  state.acoes.forEach(a => {
    const card = document.createElement("div");
    card.className = "acao-card";
    card.innerHTML = `
      <div class="acao-top">
        <div class="fg"><label>Item</label><input type="number" data-acao="${a.id}" data-af="item" value="${a.item}" style="max-width:80px"></div>
        <div class="fg"><label>Ação proposta</label><input data-acao="${a.id}" data-af="nome" value="${esc(a.nome)}"></div>
        <div class="fg" style="max-width:200px"><label>Responsável</label><input data-acao="${a.id}" data-af="responsavel" value="${esc(a.responsavel)}"></div>
      </div>
      <div class="acao-top">
        <div class="mode-switch">
          <button data-mode="${a.id}" data-m="fixo" class="${a.modo==='fixo'?'active':''}">Previsto fixo (todos os meses)</button>
          <button data-modo-personalizar="${a.id}" class="${a.modo==='personalizado'?'active':''}">Personalizar meses</button>
        </div>
        <button class="icon-btn" data-del-acao="${a.id}">Remover</button>
      </div>`;
    list.appendChild(card);
  });
  $$("[data-acao]").forEach(inp => {
    inp.addEventListener("input", e => {
      const a = state.acoes.find(x => x.id === inp.dataset.acao);
      if (!a) return;
      a[inp.dataset.af] = inp.type === "number" ? (+inp.value || 0) : inp.value;
      save();
    });
  });
  $$("[data-mode]").forEach(btn => btn.addEventListener("click", () => {
    const a = state.acoes.find(x => x.id === btn.dataset.mode);
    if (!a) return;
    a.modo = btn.dataset.m;
    if (a.modo === "fixo") {
      a.meses = getMonths().map(m => m.key);
    }
    renderCronograma(); save();
  }));
  $$("[data-del-acao]").forEach(btn => btn.addEventListener("click", () => {
    state.acoes = state.acoes.filter(x => x.id !== btn.dataset.delAcao);
    renderCronograma(); save();
  }));
  renderCronoPreview();
}

function renderCronoPreview() {
  const meses = getMonths();
  const wrap = $("#cronoPreview");
  if (!meses.length) { wrap.innerHTML = "<p class='muted'>Defina a data de elaboração.</p>"; return; }
  let html = `<table class="crono-table"><thead><tr>
    <th>Item</th><th>Ações propostas</th><th>Responsável</th>`;
  meses.forEach(m => html += `<th>${m.label}</th>`);
  html += `</tr></thead><tbody>`;
  state.acoes.forEach(a => {
    const estilo = a.estilo || "caixa";
    html += `<tr><td>${a.item}</td><td class="acao-cell">${esc(a.nome)}</td><td>${esc(a.responsavel)}</td>`;
    meses.forEach(m => {
      const on = a.meses.includes(m.key);
      html += `<td>${on ? `<span class="mark ${estilo}"></span>` : ""}</td>`;
    });
    html += `</tr>`;
  });
  html += "</tbody></table>";
  wrap.innerHTML = html;
}

/* ---------------- Modal de personalização ---------------- */
let modalAcao = null;
$("#modalBackdrop").addEventListener("click", e => { if (e.target.id === "modalBackdrop") closeModal(); });
$("#modalClose").addEventListener("click", closeModal);
$("#modalCancel").addEventListener("click", closeModal);
$("#modalConfirm").addEventListener("click", confirmModal);

function openModal(acaoId) {
  const a = state.acoes.find(x => x.id === acaoId);
  if (!a) return;
  modalAcao = a;
  const meses = getMonths();
  $("#modalTitle").textContent = "Personalizar ação — " + (a.nome || "");
  const box = $("#modalMonths");
  box.innerHTML = "";
  const estilo = $('input[name="modalStyle"]:checked').value;
  meses.forEach(m => {
    const lbl = document.createElement("label");
    // Abre sempre desmarcado, para marcar apenas os meses desejados
    const checked = "";
    if (estilo === "circulo") {
      lbl.innerHTML = `<input type="checkbox" data-mk="${m.key}" ${checked}><span style="display:inline-block;width:16px;height:16px;border:2px solid #1f6feb;border-radius:50%;"></span>${m.label}`;
    } else {
      lbl.innerHTML = `<input type="checkbox" data-mk="${m.key}" ${checked}> ${m.label}`;
    }
    box.appendChild(lbl);
  });
  $$("input[name=modalStyle]").forEach(r => { r.onchange = () => openModal(acaoId); });
  $$("[data-mk]").forEach(i => i.addEventListener("change", updateMarkCount));
  updateMarkCount();
  const bd = $("#modalBackdrop");
  bd.hidden = false;
  bd.style.display = "flex"; // inline: prevalece sobre qualquer CSS (inclusive cacheado)
}
function closeModal() {
  const bd = $("#modalBackdrop");
  bd.hidden = true;
  bd.style.display = "none"; // fecha independente do CSS carregado
  modalAcao = null;
}
function updateMarkCount() {
  const n = $$("[data-mk]").filter(i => i.checked).length;
  $("#modalMarkCount").textContent = n;
}
function confirmModal() {
  if (!modalAcao) return;
  modalAcao.meses = $$("[data-mk]").filter(i => i.checked).map(i => i.dataset.mk);
  modalAcao.modo = "personalizado";
  modalAcao.estilo = $('input[name="modalStyle"]:checked').value;
  closeModal();
  renderCronograma(); save();
}
// Permite clicar direto no botão "Personalizar" da ação
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-modo-personalizar]");
  if (btn) openModal(btn.dataset.modoPersonalizar);
});

/* ---------------- Tab 5: Anexo X ---------------- */
$("#anexoInput").addEventListener("change", onAnexoUpload);

function onAnexoUpload(e) {
  const files = Array.from(e.target.files || []);
  const msg = $("#anexoMsg");
  if (!files.length) return;
  msg.textContent = "Processando imagens…";
  let pending = files.length;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      // comprime para manter o localStorage sob controle
      compressImage(reader.result, 1200, 0.72).then(dataUrl => {
        if (state.anexos.length < 10) state.anexos.push(dataUrl);
        else toast("Máximo de 10 imagens no Anexo X.", "err");
        if (--pending === 0) {
          renderAnexo(); save();
          msg.textContent = "✓ " + state.anexos.length + " imagem(ns) adicionada(s).";
          msg.classList.add("ok");
        }
      });
    };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
}
function compressImage(dataUrl, maxW, quality) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxW) { height = Math.round(height * maxW / width); width = maxW; }
      const c = document.createElement("canvas");
      c.width = width; c.height = height;
      c.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
function renderAnexo() {
  const grid = $("#anexoGrid");
  const empty = $("#anexoEmpty");
  empty.hidden = state.anexos.length > 0;
  grid.innerHTML = "";
  state.anexos.forEach((src, i) => {
    const div = document.createElement("div");
    div.className = "anexo-item";
    div.innerHTML = `<button class="del" data-del-anexo="${i}">×</button>
      <img src="${src}" alt="Imagem ${i + 1}"><div class="pos">Imagem ${i + 1}</div>`;
    grid.appendChild(div);
  });
  $$("[data-del-anexo]").forEach(btn => btn.addEventListener("click", () => {
    state.anexos.splice(+btn.dataset.delAnexo, 1);
    renderAnexo(); save();
  }));
}

/* ---------------- Tab 6: gerar documento ---------------- */
$("#btnGerar").addEventListener("click", gerarDocumento);
$("#btnImprimir").addEventListener("click", () => window.print());

function renderResumo() {
  if (!state.doc) { $("#resumo").innerHTML = "<p class='muted'>Selecione um modelo na etapa 1.</p>"; return; }
  const d = DOCS[state.doc];
  const vig = getVigencia();
  $("#resumo").innerHTML = `
    <div class="item"><b>Documento</b>${esc(d.nome)}</div>
    <div class="item"><b>Empresa</b>${esc(state.empresa.razaoSocial || "—")}</div>
    <div class="item"><b>Unidade</b>${esc(state.empresa.unidade || "—")}</div>
    <div class="item"><b>Elaboração</b>${esc(state.docInfo.dataElaboracao || "—")}</div>
    <div class="item"><b>Vigência</b>${vig.inicio} À ${vig.final}</div>
    <div class="item"><b>Cargos</b>${state.cargos.length}</div>
    <div class="item"><b>Ações no cronograma</b>${state.acoes.length}</div>
    <div class="item"><b>Imagens Anexo X</b>${state.anexos.length}</div>
    <div class="item"><b>Logo do cliente</b>${state.empresa.logo ? "✓ enviada" : "—"}</div>`;
  $("#btnImprimir").disabled = false;
}

/* Histórico de revisões da capa: lista a Rev. 00 (original) + as revisões
   adicionadas e permite incluir novas (Rev. 01, 02...) preservando os registros. */
function renderRevisoes() {
  const wrap = $("#revisoes");
  if (!wrap) return;
  const original = { rev: "00", data: fmtDate(state.docInfo.dataElaboracao), historico: "Elaboração." };
  const adicionadas = (state.revisoes || []).slice();
  const todos = [original].concat(adicionadas);
  wrap.innerHTML = todos.map((r, i) =>
    `<div class="rev-row ${i === 0 ? "rev-original" : ""}"><span class="rev-n">Rev. ${esc(r.rev)}</span><span class="rev-d">${esc(r.data)}</span><span class="rev-h">${esc(r.historico)}</span></div>`
  ).join("");
  // data padrão para nova revisão = hoje
  const dt = $("#revData");
  if (dt && !dt.value) dt.value = new Date().toISOString().slice(0, 10);
}

function adicionarRevisao() {
  const data = ($("#revData").value || "").trim();
  const historico = ($("#revMotivo").value || "").trim();
  if (!data) { toast("Informe a data da alteração.", "err"); return; }
  if (!historico) { toast("Informe o motivo da alteração.", "err"); return; }
  const rows = state.revisoes || [];
  // número da próxima revisão: máximo atual + 1, formatado com 2 dígitos
  const maxRev = rows.reduce((m, r) => Math.max(m, parseInt(r.rev || "0", 10) || 0), 0);
  const next = String(maxRev + 1).padStart(2, "0");
  rows.push({ rev: next, data: fmtDate(data), historico });
  state.revisoes = rows;
  save();
  $("#revMotivo").value = "";
  renderRevisoes();
  toast("Revisão " + next + " adicionada à capa.", "ok");
}

$("#btnAdicionarRev").addEventListener("click", adicionarRevisao);

/* Número da revisão atual (a mais recente do histórico). Rev. 00 quando não
   houver revisões adicionadas; senão o maior número registrado. */
function revAtual(st) {
  const rows = (st && st.revisoes) || [];
  if (!rows.length) return "00";
  const maxRev = rows.reduce((m, r) => Math.max(m, parseInt(r.rev || "0", 10) || 0), 0);
  return String(maxRev).padStart(2, "0");
}

/* ---------------- Cabeçalho e rodapé das páginas (guia de design) ---------------- */
function buildHeader(pageno, total, d, st) {
  const logoElab = '<img src="assets/logo.png" class="phead-logo" alt="Logo">';
  const logoCliente = st.empresa.logo ? `<img src="${st.empresa.logo}" class="phead-logo phead-logo-client" alt="Logo do cliente">` : "";
  const title = d.nome || "";
  const nomeEmp = st.empresa.razaoSocial || "";
  const ref = st.empresa.unidade || "";
  return `<div class="phead"><table class="phead-tbl"><tr>
    <td class="c-client">${logoCliente}</td>
    <td class="c-title"><div class="phead-doc">${esc(title)}</div><div class="phead-emp">${esc(nomeEmp)}</div>${ref ? `<div class="phead-unit">${esc(ref)}</div>` : ""}</td>
    <td class="c-pag">REV. ${revAtual(st)}<br>PÁGINA ${pageno} / ${total}</td>
    <td class="c-logo">${logoElab}</td>
  </tr></table></div>`;
}
function buildFooter(st, d) {
  const rodap3 = d && d.rodape3; // true: logo + 3 unidades + site | false: só logo + site
  const unidades = UNIDADES_RODAPE.map(u =>
    `<div class="u"><b>${esc(u.nome)}</b>${esc(u.tel)}<br>${esc(u.end)}</div>`
  ).join("");
  return `<div class="pfoot">
    <div class="pfoot-row">
      <div class="lg"><img src="assets/logo.png" alt="Grupo Performance"></div>
      <div class="unidades">${rodap3 ? unidades : ""}</div>
    </div>
    <div class="site">WWW.PERFORMANCEOCUPACIONAL.COM.BR</div>
  </div>`;
}

function gerarDocumento() {
  if (!state.doc) { toast("Selecione um modelo primeiro.", "err"); return; }
  const d = DOCS[state.doc];
  const tpl = (window.TEMPLATES || {})[d.template];
  if (!tpl) { toast("Template não encontrado.", "err"); return; }
  const vig = getVigencia();

  // valores dos placeholders
  const rtec = respTecDados(); // responsável técnico selecionado (preset ou manual)
  const vals = {
    NOME_EMPRESA: state.empresa.razaoSocial || "",
    UNIDADE: state.empresa.unidade || "",
    VIGENCIA_INICIO: vig.inicio,
    VIGENCIA_FINAL: vig.final,
    DATA_ELABORACAO: fmtDate(state.docInfo.dataElaboracao),
    DATA_ASSINATURA: fmtDate(state.docInfo.dataElaboracao),
    CIDADE: state.docInfo.cidadeAssinatura || state.empresa.cidade || "",
    UF: state.empresa.uf || "",
    ELABORADOR: rtec.nome || "",
    RESP_NOME: rtec.nome || "",
    RESP_TITULO: rtec.titulo || "",
    RESP_REGISTRO: rtec.registro || "",
    RESP_CONTACT: rtec.contato || "",
    RESP_EXTRA: rtec.extra || "",
  };
  let html = tpl;
  Object.keys(vals).forEach(k => {
    html = html.split("{{" + k + "}}").join(esc(vals[k]));
  });
  // substitui a tag {{RAZAO_SOCIAL}} pelo nome real da empresa (razão social preenchida em Empresa & dados > Empresa ciente)
  html = html.split("{{RAZAO_SOCIAL}}").join(esc(state.empresa.razaoSocial || ""));
  // logo na capa do documento: usa a logo do cliente, se enviada; senão a logo da elaboradora
  const logoSrc = state.empresa.logo || "assets/logo.png";
  html = html.split("{{LOGO}}").join(`<img src="${logoSrc}" class="doc-logo" alt="Logo">`);
  // logo do cliente abaixo do nome da empresa na capa (apenas se enviada)
  html = html.split('<img class="cover-client" src="{{LOGO_IMG}}" alt="Logo do cliente">').join(
    state.empresa.logo ? `<img src="${state.empresa.logo}" class="cover-client" alt="Logo do cliente">` : ""
  );
  // marca a primeira página como capa + linha tricolor central (estilo do guia)
  html = html.replace('<div class="page">', '<div class="page cover"><div class="cover-line"></div>');
  // blocos
  html = html.split("{{BLOCK:empresa}}").join(blocoEmpresa(state.empresa));
  html = html.split("{{BLOCK:elaboradora}}").join(blocoElaboradora(state.elaboradora));
  html = html.split("{{BLOCK:elaboradoraTexto}}").join(blocoElaboradoraTexto());
  html = html.split("{{BLOCK:cronograma}}").join(blocoCronograma());
  if (d.temCargos) html = html.split("{{BLOCK:cargos}}").join(blocoCargos(d));
  if (d.podeAnexo) html = html.split("{{BLOCK:anexox}}").join(blocoAnexox());
  html = html.split("{{BLOCK:revisoes}}").join(blocoRevisoes());
  // qualquer token restante
  html = html.replace(/\{\{[^}]+\}\}/g, "");

  const container = document.createElement("div");
  container.className = "doc-print show";
  container.innerHTML = html;
  // injeta cabeçalho (tabela de 5 colunas) e rodapé em cada página (exceto a capa)
  const pages = container.querySelectorAll(".page");
  const total = pages.length;
  pages.forEach((page, idx) => {
    if (idx === 0) return; // capa: não recebe cabeçalho/rodapé do guia
    const pageno = idx + 1;
    page.insertAdjacentHTML("afterbegin", buildHeader(pageno, total, d, state));
    page.insertAdjacentHTML("beforeend", buildFooter(state, d));
  });
  const oldDoc = document.querySelector(".doc-print.show");
  if (oldDoc && oldDoc !== container) oldDoc.remove();
  document.body.appendChild(container);
  $("#btnImprimir").disabled = false;
  // scroll para o documento
  if (typeof container.scrollIntoView === "function") {
    container.scrollIntoView({ behavior: "smooth" });
  }
  toast("Documento gerado — use “Imprimir / Exportar PDF”.", "ok");
}

function fmtDate(d) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return dd + "/" + m + "/" + y;
}

function blocoEmpresa(e) {
  const total = (+e.numMasc || 0) + (+e.numFem || 0);
  const rows = [
    ["Razão Social", e.razaoSocial], ["Nome Fantasia", e.nomeFantasia],
    ["Ramo de Atividade", e.cnaeTexto], ["CNPJ", e.cnpj],
    ["Inscrição Estadual", e.inscEstadual], ["Endereço", [e.endereco, e.numero, e.complemento].filter(Boolean).join(", ")],
    ["Bairro", e.bairro], ["Cidade", e.cidade], ["Estado", e.uf], ["CEP", e.cep],
    ["Responsável", e.responsavel], ["Telefone", e.telefone], ["E-mail", e.email],
    ["Número de colaboradores", `Masculino: ${e.numMasc || 0} / Feminino: ${e.numFem || 0} / Total: ${total}`],
    ["Horário de trabalho", e.horario],
    ["Código da Atividade (CNAE)", e.cnaeCodigo], ["Grau de risco", e.grauRisco],
    ["Atividade Principal", e.cnaeTexto],
  ];
  return tableSimples(rows, "PLANILHA DE APRESENTAÇÃO DA EMPRESA", "planilha-empresa");
}
function blocoElaboradora() {
  const el = ELABORADORA_FIXA;
  const rows = [
    ["Razão Social", el.razaoSocial],
    ["Ramo de Atividade", el.cnaeTexto],
    ["CNPJ", el.cnpj],
    ["Inscrição Estadual", el.inscEstadual],
    ["Endereço", el.endereco],
    ["Bairro", el.bairro],
    ["Cidade", el.cidade],
    ["Estado", el.uf],
    ["CEP", el.cep],
    ["Responsável", el.responsavel],
    ["Telefone", el.telefone],
    ["E-mail", el.email],
    ["Código da Atividade (CNAE)", el.cnaeCodigo],
    ["Grau de risco", el.grauRisco],
  ].filter(([, v]) => v && String(v).trim()); // omite linhas vazias
  return tableSimples(rows, "PLANILHA DE APRESENTAÇÃO DA EMPRESA ELABORADORA", "planilha-elaboradora");
}
function blocoElaboradoraTexto() {
  const el = ELABORADORA_FIXA;
  return (
    `<div class="bloco">` +
    `<p class="elab-texto">Somos um grupo especializado nas áreas de Medicina, Segurança do Trabalho e eSocial, atuando no mercado de Medicina Ocupacional há mais de 12 anos. Atualmente gerenciando mais de 1.500 empresas com média total superior a 25 mil vidas ativas.</p>` +
    `<div class="elab-qr">` +
    `<div class="elab-qr-texto">` +
    `<p class="elab-texto"><b>Faça um orçamento conosco, temos soluções personalizadas para sua empresa.</b></p>` +
    `<p class="elab-texto">Avalie a nossa empresa e nos ajude a contribuir para a melhoria contínua para nossos clientes e parceiros:</p>` +
    `<p class="elab-texto"><a href="${esc(el.qr)}" target="_blank" rel="noopener">${esc(el.qr)}</a></p>` +
    `</div>` +
    `<img class="elab-qr-img" src="assets/qr-performance.png" alt="QR Code">` +
    `</div>` +
    `</div>`
  );
}
function tableSimples(rows, titulo, cls) {
  let h = `<div class="bloco ${cls || ""}"><h2 class="doc-h">${esc(titulo)}</h2><table class="doc-table"><tbody>`;
  rows.forEach(([k, v]) => { h += `<tr><th style="width:38%">${esc(k)}</th><td>${esc(v || "")}</td></tr>`; });
  return h + "</tbody></table></div>";
}

function blocoCargos(d) {
  if (!state.cargos.length) return `<div class="page"><div class="bloco"><p><em>Nenhum cargo registrado.</em></p></div></div>`;
  let h = "";
  state.cargos.forEach((c, i) => {
    const isPcmso = d.template === "pcmso";
    h += `<div class="page"><div class="bloco"><h3 style="text-align:center">CARGO ${i + 1}</h3>`;
    h += `<table class="doc-table"><tbody>
      <tr><th style="width:30%">Cargo</th><td>${esc(c.cargo)}</td></tr>
      <tr><th>Setor</th><td>${esc(c.setor)}</td></tr>
      <tr><th>Local</th><td>${esc(c.local)}</td></tr>
      <tr><th>Nº de colaboradores</th><td>Masculino: ${c.numMasc || 0} / Feminino: ${c.numFem || 0}</td></tr>
      <tr><th>Horário de trabalho</th><td>${esc(c.horário)}</td></tr>
      <tr><th>Descrição do ambiente</th><td>${esc(c.descAmbiente)}</td></tr>
      <tr><th>Descrição das atividades</th><td>${esc(c.descAtividades)}</td></tr>
    </tbody></table>`;
    // riscos
    if (c.riscos.length) {
      h += `<h4>Identificação dos riscos ocupacionais</h4>`;
      if (isPcmso) {
        h += `<table class="doc-table"><thead><tr><th>Agente</th><th>Cód. Esocial</th><th>Grupo</th><th>Tipo de risco</th><th>Tipo de exposição</th><th>Foco do exame</th></tr></thead><tbody>`;
      } else {
        h += `<table class="doc-table"><thead><tr><th>Agente / perigo</th><th>Cód. Esocial</th><th>Lesões e agravos</th><th>Fontes e circunstâncias</th><th>Controles existentes</th></tr></thead><tbody>`;
      }
      c.riscos.forEach(r => {
        if (isPcmso) {
          h += `<tr><td>${esc(r.agente)}</td><td>${esc(r.codigoEsical)}</td><td>${esc(r.grupo)}</td><td>${esc(r.tipoDeRisco)}</td><td>${esc(r.tipoDeExposicao)}</td><td>${esc(r.focoExame)}</td></tr>`;
        } else {
          h += `<tr><td>${esc(r.agente)}</td><td>${esc(r.codigoEsical)}</td><td>${esc(r.lesoesAgravos)}</td><td>${esc(r.fontesCircunstancias)}</td><td>${esc(r.controlesExistentes)}</td></tr>`;
        }
      });
      h += "</tbody></table>";
    }
    // exames
    if (c.exames.length) {
      h += `<h4>Exames a serem realizados</h4>`;
      h += `<table class="doc-table"><thead><tr><th>Exame</th><th>Cód. Esocial</th><th>Admissão</th><th>Periódico</th><th>Retorno</th><th>Mudança</th><th>Demissão</th></tr></thead><tbody>`;
      c.exames.forEach(ex => {
        const marca = (v) => v ? "X" : "";
        h += `<tr><td>${esc(ex.exame)}</td><td>${esc(ex.codigoEsical)}</td><td style="text-align:center">${marca(ex.admissao)}</td><td style="text-align:center">${marca(ex.periodico)}</td><td style="text-align:center">${marca(ex.retorno)}</td><td style="text-align:center">${marca(ex.mudanca)}</td><td style="text-align:center">${marca(ex.demissao)}</td></tr>`;
      });
      h += "</tbody></table>";
    }
    h += "</div></div>";
  });
  return h;
}

function blocoRelacaioRiscosExames() {
  if (!state.cargos.length) return `<div class="bloco"><p><em>Nenhum cargo registrado — não é possível gerar a relação de riscos x exames.</em></p></div>`;
  // 1. Coletar todos os riscos de todos os cargos e desduplicar por agente
  const riskMap = {}; // agente -> { exames: [], codigo, grupo, tipoRisco, tipoExposicao, foco }
  state.cargos.forEach(c => {
    (c.riscos || []).forEach(r => {
      const key = (r.agente || "").trim().toLowerCase();
      if (!key) return;
      if (!riskMap[key]) {
        riskMap[key] = {
          agente: (r.agente || "").trim(),
          codigo: r.codigoEsical || "",
          grupo: r.grupo || "",
          tipoRisco: r.tipoDeRisco || "",
          tipoExposicao: r.tipoDeExposicao || "",
          exames: [],
        };
      }
      // coletar exame correspondente (foco do exame ou casamento por código)
      let exame = (r.focoExame || "").trim();
      if (!exame) {
        const matched = (c.exames || []).find(ex => ex.codigoEsical && ex.codigoEsical === r.codigoEsical);
        if (matched) exame = matched.exame;
      } else {
        const matched = (c.exames || []).find(ex => ex.exame && ex.exame.toLowerCase().includes(exame.toLowerCase()));
        if (matched) exame = matched.exame;
      }
      if (exame) {
        const exKey = exame.toLowerCase();
        if (!riskMap[key].exames.some(e => e.toLowerCase() === exKey)) {
          riskMap[key].exames.push(exame);
        }
      }
    });
  });
  // 2. Montar a tabela no formato RISCO | EXAME (modelo PCMSO)
  const risks = Object.values(riskMap);
  if (risks.length === 0) {
    return `<div class="bloco"><p><em>Nenhum risco ocupacional identificado nos cargos registrados.</em></p></div>`;
  }
  let h = `<div class="bloco"><table class="doc-table"><thead><tr>`;
  h += `<th style="width:45%">RISCO</th>`;
  h += `<th style="width:55%">EXAME</th>`;
  h += `</tr></thead><tbody>`;
  risks.forEach(r => {
    const exameTexto = r.exames.length > 0 ? r.exames.join("; ") : `<span style="color:var(--erro-txt)">⚠ [REVISAR] Exame não identificado</span>`;
    h += `<tr><td>${esc(r.agente)}</td><td>${exameTexto}</td></tr>`;
  });
  h += `</tbody></table></div>`;
  return h;
}

function blocoCronograma() {
  const meses = getMonths();
  const razao = state.empresa.razaoSocial || "Empresa Cliente";
  let h = `<div class="bloco"><table class="doc-table"><thead><tr>
    <th>Item</th><th>Ações propostas</th><th>Responsável</th>`;
  meses.forEach(m => h += `<th>${m.label}</th>`);
  h += `</tr></thead><tbody>`;
  state.acoes.forEach(a => {
    h += `<tr><td>${a.item}</td><td>${esc(a.nome)}</td><td>${esc(a.responsavel)}</td>`;
    meses.forEach(m => {
      const on = a.meses.includes(m.key);
      h += `<td style="text-align:center">${on ? "X" : ""}</td>`;
    });
    h += `</tr>`;
  });
  h += `</tbody></table><p style="margin-top:6px">Obs.: A execução do Cronograma de Atividades é de responsabilidade da empresa ${esc(razao)}.</p></div>`;
  return h;
}

function blocoAnexox() {
  if (!state.anexos.length) return `<div class="bloco"><p><em>Nenhuma imagem inserida no Anexo X.</em></p></div>`;
  let h = `<div class="bloco"><div class="doc-h">Imagens do levantamento psicossocial</div>`;
  state.anexos.forEach((src, i) => {
    h += `<img class="anexo-img" src="${src}" alt="Levantamento psicossocial ${i + 1}">`;
  });
  return h + "</div>";
}

/* Histórico de revisões da capa: Rev. 00 (elaboração) + revisões adicionadas
   durante a vigência do documento. Registros anteriores são preservados. */
function blocoRevisoes() {
  const rtec = respTecDados();
  const elaborado = rtec.nome || "";
  // linha original Rev. 00 (elaboração) sempre presente
  const original = { rev: "00", data: fmtDate(state.docInfo.dataElaboracao), historico: "Elaboração.", elaborado };
  const adicionadas = (state.revisoes || []).map(r => Object.assign({ elaborado }, r));
  return [original].concat(adicionadas).map(r =>
    `<tr><td>${esc(r.rev)}</td><td>${esc(r.data)}</td><td>${esc(r.historico)}</td><td>${esc(r.elaborado || elaborado)}</td></tr>`
  ).join("");
}

/* ---------------- Exportar / importar / limpar ---------------- */
$("#btnExportar").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "projeto_" + (state.doc || "documento") + ".json";
  a.click();
  toast("Projeto exportado.", "ok");
});
$("#fileImport").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const s = JSON.parse(reader.result);
      state = Object.assign(state, s);
      fillForms();
      if (state.doc) selectDoc(state.doc);
      renderCargos(); renderCronograma(); renderAnexo();
      save();
      toast("Projeto importado.", "ok");
    } catch (err) { toast("Arquivo inválido.", "err"); }
  };
  reader.readAsText(file);
  e.target.value = "";
});
$("#btnLimpar").addEventListener("click", () => {
  if (!confirm("Limpar todos os dados do projeto? Esta ação não pode ser desfeita.")) return;
  localStorage.removeItem(STORE_KEY);
  state = {
    doc: null, empresa: {razaoSocial:"",nomeFantasia:"",cnpj:"",inscEstadual:"",endereco:"",numero:"",complemento:"",bairro:"",cidade:"",uf:"",cep:"",responsavel:"",telefone:"",email:"",numMasc:0,numFem:0,horario:"",cnaeCodigo:"",cnaeTexto:"",grauRisco:"",unidade:""},
    docInfo: {dataElaboracao:"",cidadeAssinatura:"",respTec:"",respNome:"",respTitulo:"",respRegistro:"",respContato:"",respExtra:""},
    elaboradora: {razaoSocial:"",cnpj:"",endereco:"",cidade:"",responsavel:"",telefone:"",email:""},
    cargos: [], acoes: [], anexos: [],
  };
  $$(".doc-card").forEach(c => c.classList.remove("selected"));
  $("#modeloInfo").hidden = true;
  fillForms(); renderResponsavelTecnico(); renderCargos(); renderCronograma(); renderAnexo(); renderResumo(); renderRevisoes();
  $("#btnImprimir").disabled = true;
  const dc = document.querySelector(".doc-print.show"); if (dc) dc.remove();
  toast("Dados limpos.", "ok");
});

/* ---------------- Init ---------------- */
function init() {
  load();
  bindForms();
  fillForms();
  $("#vigenciaMeses").value = state.doc ? DOCS[state.doc].vigenciaMeses : 24;
  if (state.doc) {
    selectDoc(state.doc);
    $$(".doc-card").forEach(c => c.classList.toggle("selected", c.dataset.doc === state.doc));
  } else {
    renderResponsavelTecnico();
  }
  renderCargos();
  renderCronograma();
  renderAnexo();
}
init();

})();
