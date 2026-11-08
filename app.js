/* Estoque: interface local-first, sem contas ou backend. */
(() => {
  "use strict";

  const STORAGE_KEY = "estoque-local-v1";
  const COLORS = [
    "#286b3d",
    "#e59a42",
    "#638bb8",
    "#9874b6",
    "#58a38b",
    "#d06f5e",
    "#84944e",
    "#d18baf",
  ];
  const $ = (selector, root = document) => root.querySelector(selector);
  const app = $("#app");
  const monthFmt = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  const money = (value) =>
    new Intl.NumberFormat(state?.settings?.locale || "pt-BR", {
      style: "currency",
      currency: state?.settings?.currency || "BRL",
    }).format(Number(value) || 0);
  const number = (value) =>
    new Intl.NumberFormat("pt-BR").format(Number(value) || 0);
  const uid = () =>
    globalThis.crypto?.randomUUID?.() ||
    `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const localISO = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const monthStart = (offset = 0) => {
    const d = new Date();
    d.setDate(1);
    d.setHours(12, 0, 0, 0);
    d.setMonth(d.getMonth() + offset);
    return d;
  };
  const daysAgo = (n) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return localISO(d);
  };
  const dateLabel = (value) => {
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime()) ? value : dateFmt.format(d);
  };
  const iconPaths = {
    box: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    down: '<path d="M12 5v14m-7-7 7 7 7-7"/>',
    up: '<path d="M12 19V5m-7 7 7-7 7 7"/>',
    transfer: '<path d="M7 7h14m0 0-4-4m4 4-4 4M17 17H3m0 0 4 4m-4-4 4-4"/>',
    chart: '<path d="M3 3v18h18M8 16V9m5 7V5m5 11v-4"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"/>',
    products:
      '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    report: '<path d="M4 19V9m6 10V5m6 14v-7m5 7H2"/>',
    settings:
      '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z" transform="translate(-1 -1)"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    alert:
      '<path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18m-2 0-1 14H6L5 6m4 0V4h6v2m-5 4v6m4-6v6"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    download:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"/>',
    upload:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6m-12 5h8m-8 4h8"/>',
    tag: '<path d="M20.6 13.4 11 3.8A2.7 2.7 0 0 0 9.1 3H4a1 1 0 0 0-1 1v5.1c0 .7.3 1.4.8 1.9l9.6 9.6a2.8 2.8 0 0 0 4 0l3.2-3.2a2.8 2.8 0 0 0 0-4Z"/><circle cx="7.5" cy="7.5" r=".8"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    spark:
      '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Zm7 13 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    wallet:
      '<path d="M4 5h15a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2V5Zm0 0V4a2 2 0 0 1 2-2h12M21 11h-5a2 2 0 0 0 0 4h5"/><path d="M16 13h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cart: '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h2l2.4 12h12.8L22 7H5"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M16 8.5c-.6-.7-1.7-1-3-1-1.6 0-2.7.7-2.7 1.9 0 3 6.4 1.2 6.4 4.6 0 1.4-1.3 2.4-3.4 2.4-1.4 0-2.7-.5-3.5-1.4M12.5 5.5v13"/>',
    arrowRight: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  };
  const icon = (name, size = 20) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.spark}</svg>`;

  function makeSeed() {
    const now = new Date();
    const categories = [
      { id: "cat-rest", name: "Restaurantes", budget: 1200, color: "#e89a45" },
      { id: "cat-cafe", name: "Cafeteria", budget: 900, color: "#287044" },
      { id: "cat-insumos", name: "Insumos", budget: 1800, color: "#6c8cb7" },
      { id: "cat-emb", name: "Embalagens", budget: 650, color: "#9475b5" },
      { id: "cat-limp", name: "Limpeza", budget: 400, color: "#55a38b" },
    ];
    const products = [
      {
        id: uid(),
        name: "Café em grãos 1 kg",
        sku: "CAF-001",
        category: "Cafeteria",
        cost: 58,
        price: 89,
        quantity: 3,
        minStock: 8,
        unit: "un.",
      },
      {
        id: uid(),
        name: "Copo descartável 200 ml",
        sku: "COP-014",
        category: "Embalagens",
        cost: 0.22,
        price: 0.5,
        quantity: 0,
        minStock: 5,
        unit: "pct.",
      },
      {
        id: uid(),
        name: "Leite integral 1 L",
        sku: "LAT-008",
        category: "Insumos",
        cost: 5.8,
        price: 9.5,
        quantity: 14,
        minStock: 8,
        unit: "un.",
      },
      {
        id: uid(),
        name: "Xarope de baunilha 700 ml",
        sku: "XAR-021",
        category: "Cafeteria",
        cost: 32,
        price: 54,
        quantity: 6,
        minStock: 4,
        unit: "un.",
      },
      {
        id: uid(),
        name: "Guardanapo folha dupla",
        sku: "EMB-017",
        category: "Embalagens",
        cost: 12,
        price: 20,
        quantity: 4,
        minStock: 10,
        unit: "pct.",
      },
      {
        id: uid(),
        name: "Detergente neutro 5 L",
        sku: "LMP-003",
        category: "Limpeza",
        cost: 23,
        price: 35,
        quantity: 9,
        minStock: 3,
        unit: "un.",
      },
    ];
    const expenses = [
      {
        id: uid(),
        date: localISO(monthStart()),
        description: "Almoço da equipe",
        category: "Restaurantes",
        amount: 1080,
        note: "Fechamento do mês",
      },
      {
        id: uid(),
        date: localISO(
          new Date(
            now.getFullYear(),
            now.getMonth(),
            Math.min(2, now.getDate()),
            12,
          ),
        ),
        description: "Refeição em atendimento externo",
        category: "Restaurantes",
        amount: 504,
        note: "",
      },
      {
        id: uid(),
        date: daysAgo(1),
        description: "Reposição de leite e insumos",
        category: "Insumos",
        amount: 486.5,
        note: "",
      },
      {
        id: uid(),
        date: daysAgo(2),
        description: "Pedido de copos e embalagens",
        category: "Embalagens",
        amount: 218.9,
        note: "",
      },
      {
        id: uid(),
        date: daysAgo(3),
        description: "Produtos de limpeza",
        category: "Limpeza",
        amount: 146.4,
        note: "",
      },
      {
        id: uid(),
        date: localISO(monthStart(-1)),
        description: "Compra de café especial",
        category: "Cafeteria",
        amount: 628,
        note: "",
      },
      {
        id: uid(),
        date: localISO(monthStart(-1)),
        description: "Refeição equipe",
        category: "Restaurantes",
        amount: 920,
        note: "",
      },
    ];
    const monthlyAmounts = [12840, 14320, 13760, 16640, 18120, 17480];
    const sales = monthlyAmounts.map((total, index) => ({
      id: uid(),
      date: localISO(monthStart(index - 5)),
      description: "Vendas demonstrativas",
      productName: "Série de exemplo",
      quantity: Math.round(total / 34),
      total,
      isSample: true,
    }));
    return {
      version: 1,
      demo: true,
      products,
      expenses,
      categories,
      sales,
      movements: [],
      settings: {
        companyName: "Estoque",
        ownerName: "Ana",
        tagline: "Seu estoque, sob controle.",
        currency: "BRL",
        locale: "pt-BR",
        primaryColor: "#176b38",
        accentColor: "#e68819",
        surfaceColor: "#f4f7f3",
      },
    };
  }
  const defaultSettings = {
    companyName: "Estoque",
    ownerName: "Ana",
    tagline: "Seu estoque, sob controle.",
    currency: "BRL",
    locale: "pt-BR",
    primaryColor: "#176b38",
    accentColor: "#e68819",
    surfaceColor: "#f4f7f3",
  };
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return {
          version: 1,
          products: [],
          expenses: [],
          categories: [],
          sales: [],
          movements: [],
          settings: { ...defaultSettings, ...(data.settings || {}) },
          ...data,
          settings: { ...defaultSettings, ...(data.settings || {}) },
        };
      }
    } catch (error) {
      console.warn("Não foi possível ler o estoque salvo.", error);
    }
    return makeSeed();
  }
  let state = loadState();
  function applyTheme() {
    const settings = { ...defaultSettings, ...(state.settings || {}) };
    const color = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
    const primary = color(settings.primaryColor, defaultSettings.primaryColor);
    const accent = color(settings.accentColor, defaultSettings.accentColor);
    const surface = color(settings.surfaceColor, defaultSettings.surfaceColor);
    document.documentElement.style.setProperty("--green", primary);
    document.documentElement.style.setProperty("--green-dark", primary);
    document.documentElement.style.setProperty("--orange", accent);
    document.documentElement.style.setProperty("--surface", surface);
    document.documentElement.style.setProperty("--focus", `${primary}38`);
    document.documentElement.dataset.theme = settings.surfaceColor === "#17231c" ? "dark" : "light";
  }
  let activeView = "home";
  let query = "";
  let categoryFilter = "Todas";
  let productStatusFilter = "todos";
  let productSort = "name-asc";
  let activityFilter = "Todas";
  let modal = null;
  let toastTimer;
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      applyTheme();
    } catch (error) {
      showToast("Não foi possível salvar. Verifique o espaço do navegador.");
      console.error(error);
    }
  }
  save();
  const categoryNames = () => state.categories.map((c) => c.name);
  const categoryFor = (name) => state.categories.find((c) => c.name === name);
  const safeColor = (c) => (/^#[0-9a-f]{6}$/i.test(c || "") ? c : "#287044");
  const lowStock = () =>
    state.products.filter((p) => Number(p.quantity) <= Number(p.minStock));
  const stockStatus = (p) =>
    Number(p.quantity) <= 0
      ? "zerado"
      : Number(p.quantity) <= Number(p.minStock)
        ? "baixo"
        : "normal";
  const validISODate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
    const date = new Date(`${value}T12:00:00`);
    return !Number.isNaN(date.getTime()) && localISO(date) === value;
  };
  const totalStock = () =>
    state.products.reduce(
      (sum, p) => sum + Number(p.cost || 0) * Number(p.quantity || 0),
      0,
    );
  const activeProducts = () =>
    state.products.filter((p) => Number(p.quantity) > 0).length;
  const thisMonthExpenses = () =>
    state.expenses.filter((e) => {
      const d = new Date(`${e.date}T12:00:00`),
        n = new Date();
      return (
        d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
      );
    });
  const monthlyExpenseByCategory = () => {
    const out = {};
    for (const e of thisMonthExpenses())
      out[e.category] = (out[e.category] || 0) + Number(e.amount || 0);
    return out;
  };
  const expenseTotal = (items) =>
    items.reduce((n, e) => n + Number(e.amount || 0), 0);
  function salesSeries() {
    return Array.from({ length: 6 }, (_, i) => {
      const d = monthStart(i - 5);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const total = state.sales
        .filter((s) => String(s.date || "").slice(0, 7) === key)
        .reduce((sum, s) => sum + Number(s.total || 0), 0);
      return { date: d, total };
    });
  }
  function insights() {
    const results = [];
    const byCat = monthlyExpenseByCategory();
    state.categories.forEach((c) => {
      const spent = byCat[c.name] || 0;
      if (c.budget > 0 && spent > c.budget) {
        const pct = Math.round((spent / c.budget - 1) * 100);
        results.push({
          kind: "warn",
          text: `A categoria ${c.name} está ${pct}% acima do orçamento neste mês.`,
          icon: "alert",
        });
      }
    });
    const low = lowStock();
    if (low.length)
      results.push({
        kind: "warn",
        text: `${low.length} ${low.length === 1 ? "produto precisa" : "produtos precisam"} de reposição. ${low[0].name} está com ${number(low[0].quantity)} ${low[0].unit || "un."}.`,
        icon: "box",
      });
    const series = salesSeries();
    const last = series.at(-1)?.total || 0;
    const prev = series.at(-2)?.total || 0;
    if (prev > 0) {
      const diff = Math.round((last / prev - 1) * 100);
      if (Math.abs(diff) >= 3)
        results.push({
          kind: "good",
          text:
            diff >= 0
              ? `As vendas deste mês estão ${diff}% acima do mês passado.`
              : `As vendas deste mês estão ${Math.abs(diff)}% abaixo do mês passado.`,
          icon: "chart",
        });
    }
    if (!results.length)
      results.push({
        kind: "good",
        text: "Tudo em dia: nenhuma categoria passou do orçamento e seu estoque está bem acompanhado.",
        icon: "check",
      });
    return results.slice(0, 4);
  }
  function navButton(view, label, iconName) {
    return `<button class="nav-item ${activeView === view ? "active" : ""}" data-view="${view}" aria-label="${label}">${icon(iconName, 21)}<span>${label}</span></button>`;
  }
  function shell(content) {
    const settings = state.settings || defaultSettings;
    return `<div class="app-shell"><header class="topbar"><button class="brand brand-button" data-view="home" aria-label="Ir para o início"><span class="brand-mark">${icon("box", 22)}</span><span>${escapeHtml(settings.companyName || "Estoque")}</span></button><div class="topbar-actions"><button class="icon-button" data-view="reports" aria-label="Ver alertas e análises">${icon("bell")}<i class="notify-dot"></i></button><button class="icon-button" data-view="settings" aria-label="Abrir configurações">${icon("settings")}</button></div></header><main class="content">${content}</main><nav class="bottom-nav" aria-label="Navegação principal">${navButton("home", "Início", "home")}${navButton("products", "Produtos", "products")}${navButton("activity", "Atividade", "activity")}${navButton("reports", "Relatórios", "report")}${navButton("categories", "Categorias", "settings")}</nav>${modal ? renderModal() : ""}<div id="toast" class="toast" role="status" aria-live="polite"></div></div>`;
  }
  const sectionTitle = (title, actionLabel, action) => {
    const target = [
      "home",
      "products",
      "activity",
      "reports",
      "categories",
    ].includes(action)
      ? `data-view="${action}"`
      : `data-action="${action}"`;
    return `<div class="section-heading"><h2>${title}</h2>${actionLabel ? `<button class="text-link" ${target}>${actionLabel} ${icon("chevron", 14)}</button>` : ""}</div>`;
  };
  function chartSVG(series) {
    const w = 360,
      h = 139,
      p = { l: 8, r: 8, t: 14, b: 12 };
    const max = Math.max(1, ...series.map((s) => s.total)) * 1.13;
    const pts = series.map((s, i) => ({
      x: p.l + (i * (w - p.l - p.r)) / (series.length - 1),
      y: p.t + (h - p.t - p.b) * (1 - s.total / max),
    }));
    const line = pts
      .map((pt, i) => `${i ? "L" : "M"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(" ");
    const area = `${line} L ${pts.at(-1).x} ${h - p.b} L ${pts[0].x} ${h - p.b} Z`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Gráfico de vendas dos últimos seis meses"><defs><linearGradient id="saleFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#4d9d5b" stop-opacity=".22"/><stop offset="100%" stop-color="#4d9d5b" stop-opacity="0"/></linearGradient></defs><path d="M 0 ${h * 0.35} H ${w} M 0 ${h * 0.68} H ${w}" stroke="#edf1ed" stroke-dasharray="3 5" fill="none"/><path d="${area}" fill="url(#saleFill)"/><path d="${line}" fill="none" stroke="#287044" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${pts.map((pt, i) => `<circle cx="${pt.x}" cy="${pt.y}" r="${i === pts.length - 1 ? 4.5 : 3}" fill="white" stroke="#287044" stroke-width="2"/>`).join("")}</svg>`;
  }
  function categoryBars() {
    const byCat = monthlyExpenseByCategory();
    const items = state.categories
      .map((c) => ({ ...c, spent: byCat[c.name] || 0 }))
      .sort((a, b) => b.spent - a.spent);
    const total = items.reduce((n, c) => n + c.spent, 0);
    const max = Math.max(1, ...items.map((c) => c.spent));
    if (!items.length)
      return `<div class="empty-state"><strong>Adicione uma categoria</strong>Organize os gastos para ver a distribuição por aqui.</div>`;
    const segments = items
      .filter((c) => c.spent > 0)
      .map(
        (c) =>
          `<span style="width:${total ? (c.spent / total) * 100 : 0}%;background:${safeColor(c.color)}"></span>`,
      )
      .join("");
    return `${total ? `<div class="split-bars">${segments || '<span style="width:100%;background:#e9eee9"></span>'}</div>` : ""}${items
      .slice(0, 5)
      .map(
        (c) =>
          `<div class="category-row"><div class="category-meta"><span class="category-name"><i class="color-dot" style="background:${safeColor(c.color)}"></i>${escapeHtml(c.name)}</span><span class="category-amount">${money(c.spent)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${c.spent ? Math.max(5, (c.spent / max) * 100) : 0}%;background:${safeColor(c.color)}"></div></div></div>`,
      )
      .join("")}`;
  }
  function renderHome() {
    const series = salesSeries(),
      last = series.at(-1),
      low = lowStock(),
      acts = recentActivities().slice(0, 3);
    const trend =
      series.length > 1 && series.at(-2).total
        ? Math.round((last.total / series.at(-2).total - 1) * 100)
        : 0;
    const settings = { ...defaultSettings, ...(state.settings || {}) };
    return `<div class="welcome"><div class="eyebrow">${new Intl.DateTimeFormat(settings.locale || "pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</div><h1>Bom dia, ${escapeHtml(settings.ownerName || "gestor")} <span aria-hidden="true">👋</span></h1><p>${escapeHtml(settings.tagline || "Seu estoque, sob controle.")}</p></div>${state.demo ? `<div class="insight" style="margin-bottom:12px"><span class="insight-icon">${icon("spark", 16)}</span><span>Produtos, despesas e vendas iniciais são exemplos. Edite ou exclua esses registros para refletir sua operação.</span></div>` : ""}
      <div class="summary-card"><div class="metric"><span class="metric-icon primary">${icon("box")}</span><div><div class="metric-label">Valor em estoque</div><div class="metric-value">${money(totalStock())}</div></div></div><div class="metric"><span class="metric-icon">${icon("tag")}</span><div><div class="metric-label">Produtos ativos</div><div class="metric-value">${number(activeProducts())}</div>        <div class="metric-sub">${number(state.products.length)} cadastrados</div></div></div></div><p class="footnote local-storage-note">Os dados ficam salvos somente neste navegador e não sincronizam entre dispositivos. Exporte CSVs em Relatórios para manter uma cópia.</p>
      ${low.length ? `<div class="stock-alert"><span class="alert-icon">${icon("alert")}</span><span class="alert-text"><strong>${low.length} ${low.length === 1 ? "item precisa" : "itens precisam"} de reposição</strong><br>${state.products.filter((p) => Number(p.quantity) <= 0).length ? `${state.products.filter((p) => Number(p.quantity) <= 0).length} zerados · ` : ""}Confira os produtos abaixo do mínimo.</span><button class="button button-small" style="background:#e98515;color:#fff" data-view="products">Ver itens</button></div>` : ""}
      <section class="section">${sectionTitle("Acesso rápido")}<div class="quick-grid"><button class="quick-action" data-modal="entry">${icon("down")}<span>Entrada</span></button><button class="quick-action" data-modal="expense">${icon("wallet")}<span>Despesa</span></button><button class="quick-action" data-modal="sale">${icon("up")}<span>Registrar venda</span></button><button class="quick-action" data-view="categories">${icon("tag")}<span>Categorias</span></button></div></section>
      <section class="section">${sectionTitle("Vendas mês a mês", "Relatório", "reports")}<div class="card chart-card"><div class="chart-top"><div><div class="chart-caption">Faturamento · últimos 6 meses</div><div class="chart-total">${money(last.total)}</div></div><span class="tag" style="${trend >= 0 ? "background:#eaf5e9;color:#287044" : "background:#fff0ef;color:#b53e37"}">${trend >= 0 ? "+" : ""}${trend}% vs. mês anterior</span></div><div class="chart-wrap">${chartSVG(series)}</div><div class="chart-labels">${series.map((s) => `<span>${monthFmt.format(s.date).replace(".", "")}</span>`).join("")}</div></div></section>
      <section class="section">${sectionTitle("Custos por categoria", "Detalhes", "categories")}<div class="card">${categoryBars()}</div></section>
      <section class="section">${sectionTitle("Análises rápidas", "Ver análises", "reports")}<div class="analysis-list">${insights().slice(0, 2).map(renderInsight).join("")}</div></section>
      <section class="section">${sectionTitle("Estoque baixo", "Ver produtos", "products")}<div class="low-stock-list">${low.length ? low.slice(0, 3).map(renderLowProduct).join("") : `<div class="empty-state"><strong>Estoque em dia</strong>Nenhum produto está abaixo do mínimo.</div>`}</div></section>
      <section class="section">${sectionTitle("Movimentações recentes", "Ver atividade", "activity")}<div class="list-stack">${acts.length ? acts.map(renderActivity).join("") : `<div class="empty-state">Suas vendas, despesas e entradas aparecerão aqui.</div>`}</div></section>`;
  }
  function renderInsight(item) {
    return `<div class="insight"><span class="insight-icon ${item.kind === "warn" ? "warn" : ""}">${icon(item.icon, 16)}</span><span>${escapeHtml(item.text)}</span></div>`;
  }
  function renderLowProduct(p) {
    const zero = Number(p.quantity) <= 0;
    return `<div class="product-row"><span class="product-glyph">${icon("box")}</span><div class="row-main"><div class="row-title">${escapeHtml(p.name)}</div><div class="row-sub">SKU ${escapeHtml(p.sku || "—")} · Mínimo ${number(p.minStock)}</div></div><div class="row-side"><span class="warning-pill ${zero ? "danger-pill" : ""}">${number(p.quantity)} ${escapeHtml(p.unit || "un.")}</span></div><button class="small-icon" data-action="edit-product" data-id="${escapeHtml(p.id)}" aria-label="Editar ${escapeHtml(p.name)}">${icon("chevron", 17)}</button></div>`;
  }
  function recentActivities() {
    const entries = [
      ...state.expenses.map((e) => ({
        id: e.id,
        type: "expense",
        date: e.date,
        title: e.description,
        sub: e.category,
        value: -Number(e.amount),
        note: e.note || "",
      })),
      ...state.sales.map((sale) => ({
        id: sale.id,
        type: "sale",
        date: sale.date,
        title: sale.description || "Venda registrada",
        sub: sale.productName || "Venda de produtos",
        value: Number(sale.total),
        note: sale.note || "",
        productId: sale.productId,
        productName: sale.productName,
      })),
      ...state.movements
        .filter((movement) => movement.type !== "sale")
        .map((movement) => ({
          id: movement.id,
          type: movement.type,
          date: movement.date,
          title: movement.description,
          sub: movement.productName || "Movimentação de estoque",
          value: Number(movement.quantity),
          note: movement.note || "",
          productId: movement.productId,
          productName: movement.productName,
        })),
    ];
    return entries.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }
  function productHistoryEntries(product) {
    const belongsToProduct = (record) =>
      record.productId === product.id ||
      (!record.productId && record.productName === product.name);
    const entries = [
      ...state.sales.filter(belongsToProduct).map((sale) => ({
        id: sale.id,
        type: "sale",
        date: sale.date,
        title: sale.reason || sale.description || "Venda registrada",
        sub: sale.productName || product.name,
        value: Number(sale.total),
        note: sale.note || "",
      })),
      ...state.movements
        .filter(
          (movement) => movement.type !== "sale" && belongsToProduct(movement),
        )
        .map((movement) => ({
          id: movement.id,
          type: movement.type,
          date: movement.date,
          title: movement.reason || movement.description,
          sub: movement.productName || product.name,
          value: Number(movement.quantity),
          note: movement.note || "",
        })),
    ];
    return entries.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }
  function renderActivity(item, actions = false) {
    const expense = item.type === "expense",
      sale = item.type === "sale",
      typeLabel = expense
        ? "Despesa"
        : sale
          ? "Venda"
          : item.type === "entry"
            ? "Entrada"
            : item.type === "exit"
              ? "Saída"
              : item.type === "adjustment"
                ? "Ajuste"
                : "Estoque";
    const valueLabel = expense
      ? `− ${money(Math.abs(item.value))}`
      : sale
        ? `+ ${money(item.value)}`
        : `${item.value > 0 ? "+" : ""}${number(item.value)} un.`;
    return `<div class="activity-row"><span class="activity-bubble ${expense ? "expense" : sale ? "sale" : "adjustment"}">${icon(expense ? "wallet" : sale ? "up" : "down", 18)}</span><div class="row-main"><div class="row-title">${escapeHtml(item.title || typeLabel)}</div><div class="row-sub">${escapeHtml(item.sub || typeLabel)} · ${dateLabel(item.date)}</div>${item.note ? `<div class="row-sub activity-note">Obs.: ${escapeHtml(item.note)}</div>` : ""}</div><div class="row-side"><div class="row-value" style="${expense ? "color:#b9712b" : ""}">${valueLabel}</div><div class="row-sub">${typeLabel}</div></div>${actions && expense ? `<div class="product-row-actions"><button class="small-icon" data-action="edit-expense" data-id="${escapeHtml(item.id)}" aria-label="Editar despesa">${icon("edit")}</button><button class="small-icon" data-action="delete-expense" data-id="${escapeHtml(item.id)}" aria-label="Excluir despesa">${icon("trash")}</button></div>` : ""}</div>`;
  }
  function pageHeading(eyebrow, title, subtitle, buttonLabel, buttonAction) {
    return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div>${buttonLabel ? `<button class="button button-primary button-small" data-action="${buttonAction}">${icon("plus", 16)}${buttonLabel}</button>` : ""}</div>`;
  }
  function renderProducts() {
    const rows = state.products
      .filter(
        (p) =>
          `${p.name} ${p.sku} ${p.category}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (categoryFilter === "Todas" || p.category === categoryFilter) &&
          (productStatusFilter === "todos" ||
            stockStatus(p) === productStatusFilter),
      )
      .sort((a, b) => {
        if (productSort === "quantity-asc")
          return (
            Number(a.quantity) - Number(b.quantity) ||
            a.name.localeCompare(b.name, "pt-BR")
          );
        if (productSort === "quantity-desc")
          return (
            Number(b.quantity) - Number(a.quantity) ||
            a.name.localeCompare(b.name, "pt-BR")
          );
        if (productSort === "value-desc")
          return (
            Number(b.cost) * Number(b.quantity) -
              Number(a.cost) * Number(a.quantity) ||
            a.name.localeCompare(b.name, "pt-BR")
          );
        return a.name.localeCompare(b.name, "pt-BR");
      });
    return `${pageHeading("CATÁLOGO", "Produtos", "Acompanhe quantidades e reposições.", "Adicionar", "new-product")}<div class="page-stat-strip"><div class="mini-stat"><div class="mini-stat-label">Valor em estoque</div><div class="mini-stat-value">${money(totalStock())}</div></div><div class="mini-stat"><div class="mini-stat-label">Reposição necessária</div><div class="mini-stat-value" style="color:${lowStock().length ? "#bb741b" : "#287044"}">${number(lowStock().length)} itens</div></div></div><div class="toolbar"><label class="search-box">${icon("search")}<input id="product-search" aria-label="Buscar produto ou SKU" value="${escapeHtml(query)}" placeholder="Buscar produto ou SKU" /></label><select class="filter-select" id="product-category-filter" aria-label="Filtrar por categoria"><option value="Todas">Todas as categorias</option>${state.categories.map((c) => `<option value="${escapeHtml(c.name)}" ${categoryFilter === c.name ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}</select></div><div class="filter-grid"><label class="filter-control"><span>Situação do estoque</span><select class="filter-select" id="product-status-filter" aria-label="Filtrar por situação do estoque"><option value="todos" ${productStatusFilter === "todos" ? "selected" : ""}>Todas as situações</option><option value="normal" ${productStatusFilter === "normal" ? "selected" : ""}>Normal</option><option value="baixo" ${productStatusFilter === "baixo" ? "selected" : ""}>Estoque baixo</option><option value="zerado" ${productStatusFilter === "zerado" ? "selected" : ""}>Zerado</option></select></label><label class="filter-control"><span>Ordenar por</span><select class="filter-select" id="product-sort" aria-label="Ordenar produtos"><option value="name-asc" ${productSort === "name-asc" ? "selected" : ""}>Nome · A–Z</option><option value="quantity-asc" ${productSort === "quantity-asc" ? "selected" : ""}>Menor saldo</option><option value="quantity-desc" ${productSort === "quantity-desc" ? "selected" : ""}>Maior saldo</option><option value="value-desc" ${productSort === "value-desc" ? "selected" : ""}>Maior valor em estoque</option></select></label></div><div class="list-stack">${rows.length ? rows.map((p) => renderProductRow(p)).join("") : `<div class="empty-state"><span class="empty-icon">${icon("box")}</span><strong>${query || productStatusFilter !== "todos" || categoryFilter !== "Todas" ? "Nada encontrado" : "Seu catálogo começa aqui"}</strong>${query ? "Tente outro nome, SKU ou categoria." : "Ajuste os filtros ou cadastre seus produtos."}</div>`}</div><p class="footnote">O valor em estoque é calculado pelo custo de compra × quantidade disponível. "Baixo" inclui saldo positivo igual ou inferior ao mínimo; "zerado" inclui saldo zero.</p>`;
  }
  function renderProductRow(p) {
    const status = stockStatus(p),
      statusLabel =
        status === "zerado"
          ? "Zerado"
          : status === "baixo"
            ? "Baixo"
            : "Normal";
    return `<div class="product-row" data-stock-status="${status}"><span class="product-glyph">${icon("box")}</span><div class="product-row-main"><div class="row-main"><div class="row-title">${escapeHtml(p.name)}</div><div class="row-sub">${escapeHtml(p.category)} · ${escapeHtml(p.sku || "Sem SKU")}</div><div class="product-price">Custo ${money(p.cost)}${Number(p.price) > 0 ? ` · Venda ${money(p.price)}` : ""}</div><span class="status-pill status-${status}">${statusLabel}</span></div></div><div class="row-side"><div class="row-value" style="${status === "normal" ? "" : "color:#c17918"}">${number(p.quantity)} ${escapeHtml(p.unit || "un.")}</div><div class="row-sub">mín. ${number(p.minStock)}</div></div><div class="product-row-actions"><button class="small-icon" data-action="show-history" data-id="${escapeHtml(p.id)}" aria-label="Histórico de ${escapeHtml(p.name)}" title="Histórico">${icon("clock")}</button><button class="small-icon" data-action="new-entry" data-id="${escapeHtml(p.id)}" aria-label="Registrar entrada para ${escapeHtml(p.name)}" title="Entrada">${icon("down")}</button><button class="small-icon" data-action="new-exit" data-id="${escapeHtml(p.id)}" aria-label="Registrar saída para ${escapeHtml(p.name)}" title="Saída">${icon("up")}</button><button class="small-icon" data-action="new-adjustment" data-id="${escapeHtml(p.id)}" aria-label="Ajustar saldo de ${escapeHtml(p.name)}" title="Ajuste">${icon("transfer")}</button><button class="small-icon" data-action="edit-product" data-id="${escapeHtml(p.id)}" aria-label="Editar ${escapeHtml(p.name)}" title="Editar">${icon("edit")}</button><button class="small-icon" data-action="delete-product" data-id="${escapeHtml(p.id)}" aria-label="Excluir ${escapeHtml(p.name)}" title="Excluir">${icon("trash")}</button></div></div>`;
  }
  function renderActivityPage() {
    const entries = recentActivities().filter(
      (a) =>
        activityFilter === "Todas" ||
        (activityFilter === "Despesas" && a.type === "expense") ||
        (activityFilter === "Vendas" && a.type === "sale") ||
        (activityFilter === "Estoque" &&
          a.type !== "sale" &&
          a.type !== "expense"),
    );
    return `${pageHeading("REGISTROS", "Atividade", "Vendas, despesas e movimentações.", "Nova despesa", "new-expense")}<div class="tabs">${["Todas", "Vendas", "Despesas", "Estoque"].map((x) => `<button class="tab-button ${activityFilter === x ? "active" : ""}" data-action="activity-filter" data-filter="${x}">${x}</button>`).join("")}</div><div class="list-stack">${entries.length ? entries.map((a) => renderActivity(a, true)).join("") : `<div class="empty-state"><span class="empty-icon">${icon("activity")}</span><strong>Nenhuma movimentação por aqui</strong>Registre uma venda, despesa ou entrada de estoque.</div>`}</div><div class="section"><div class="quick-grid"><button class="quick-action" data-modal="entry">${icon("down")}<span>Entrada</span></button><button class="quick-action" data-modal="exit">${icon("up")}<span>Saída</span></button><button class="quick-action" data-modal="adjustment">${icon("transfer")}<span>Ajuste</span></button><button class="quick-action" data-modal="sale">${icon("cart")}<span>Venda</span></button></div></div>`;
  }
  function renderReports() {
    const series = salesSeries(),
      sum = series.reduce((n, s) => n + s.total, 0);
    return `${pageHeading("VISÃO GERAL", "Relatórios", "Tendências, custos e próximos passos.", "Exportar CSV", "export-menu")}<div class="card chart-card"><div class="chart-top"><div><div class="chart-caption">Vendas acumuladas · 6 meses</div><div class="chart-total">${money(sum)}</div></div><span class="tag">${state.sales.some((s) => s.isSample) ? "Série demonstrativa" : `${state.sales.length} registros`}</span></div><div class="chart-wrap" style="height:170px">${chartSVG(series)}</div><div class="chart-labels">${series.map((s) => `<span>${monthFmt.format(s.date).replace(".", "")}</span>`).join("")}</div></div><section class="section">${sectionTitle("Custo por categoria")}<div class="card">${categoryBars()}<p class="footnote">Valores de despesas lançadas neste mês. Os limites mensais podem ser ajustados em Categorias.</p></div></section><section class="section">${sectionTitle("O que merece atenção")}<div class="analysis-list">${insights().map(renderInsight).join("")}</div></section><section class="section" id="csv-tools">${sectionTitle("Dados e arquivos CSV")}<div class="card">${fileTool("products", "Produtos", "Nome, SKU, categoria, custo, preço, quantidade e mínimo.")}${fileTool("expenses", "Despesas", "Data, descrição, categoria, valor e observação.")}${fileTool("categories", "Categorias", "Nome, orçamento mensal e cor.")}</div><p class="footnote">Aceita cabeçalhos em português ou inglês; produtos precisam de nome, custo e quantidade. Categorias novas recebem orçamento zero. Produtos são atualizados por SKU/nome e categorias pelo nome. Despesas idênticas por data, descrição, categoria e valor são ignoradas para evitar duplicatas. Os arquivos são processados neste navegador.</p></section>`;
  }
  function fileTool(kind, label, description) {
    return `<div class="file-tool"><span class="file-icon">${icon("file", 18)}</span><div class="file-copy"><strong>${label}</strong><p>${description}</p><div class="file-actions"><button class="button button-plain button-small" data-action="export" data-kind="${kind}">${icon("download", 14)} Exportar</button><button class="button button-soft button-small" data-action="import" data-kind="${kind}">${icon("upload", 14)} Importar</button></div></div></div>`;
  }
  function renderCategories() {
    const spends = monthlyExpenseByCategory();
    return `${pageHeading("ORGANIZAÇÃO", "Categorias", "Defina limites e acompanhe os gastos.", "Nova categoria", "new-category")}<div class="page-stat-strip"><div class="mini-stat"><div class="mini-stat-label">Despesas neste mês</div><div class="mini-stat-value">${money(expenseTotal(thisMonthExpenses()))}</div></div><div class="mini-stat"><div class="mini-stat-label">Orçamento total</div><div class="mini-stat-value">${money(state.categories.reduce((n, c) => n + Number(c.budget || 0), 0))}</div></div></div><div class="list-stack">${
      state.categories.length
        ? state.categories
            .map((c) => {
              const spent = spends[c.name] || 0,
                pct = c.budget > 0 ? Math.round((spent / c.budget) * 100) : 0;
              const over = pct > 100;
              return `<div class="card" style="padding:13px"><div class="category-card" style="padding:0;border:0"><span class="category-swatch" style="background:${safeColor(c.color)}18;color:${safeColor(c.color)}">${icon("tag")}</span><div class="category-info"><strong>${escapeHtml(c.name)}</strong><p>${number(state.products.filter((p) => p.category === c.name).length)} produtos · ${state.expenses.filter((e) => e.category === c.name).length} despesas</p></div><div class="category-budget" style="color:${over ? "#bf6922" : "#294b35"}">${money(spent)}<small>de ${money(c.budget)}</small></div><div class="product-row-actions"><button class="small-icon" data-action="edit-category" data-id="${escapeHtml(c.id)}" aria-label="Editar categoria">${icon("edit")}</button><button class="small-icon" data-action="delete-category" data-id="${escapeHtml(c.id)}" aria-label="Excluir categoria">${icon("trash")}</button></div></div><div class="budget-progress"><span style="width:${Math.min(100, pct)}%;background:${over ? "#e88935" : safeColor(c.color)}"></span></div>${over ? `<div class="row-sub" style="color:#b86b26;margin:8px 0 0 50px">${pct - 100}% acima do orçamento neste mês</div>` : ""}</div>`;
            })
            .join("")
        : `<div class="empty-state"><strong>Nenhuma categoria cadastrada</strong>Adicione categorias para organizar produtos e despesas.</div>`
    }</div><div class="section"><div class="insight"><span class="insight-icon">${icon("spark", 16)}</span><span>As categorias mantêm despesas e orçamento mensal organizados. Alterar o nome também atualiza os itens vinculados.</span></div></div>`;
  }
  function renderSettings() {
    const s = { ...defaultSettings, ...(state.settings || {}) };
    return `${pageHeading("PERSONALIZAÇÃO", "Configurações", "Adapte o sistema à identidade e à operação da sua empresa.")}<form class="settings-form" id="settings-form"><section class="card settings-card"><div class="settings-section-title"><span class="metric-icon">${icon("spark", 18)}</span><div><h2>Identidade da empresa</h2><p>Esses dados aparecem no cabeçalho e no painel inicial.</p></div></div><div class="form-grid"><div class="field full"><label for="settings-company">Nome da empresa</label><input id="settings-company" name="companyName" required maxlength="60" value="${escapeHtml(s.companyName)}" placeholder="Ex.: Mercado Central"></div><div class="field"><label for="settings-owner">Nome do responsável</label><input id="settings-owner" name="ownerName" maxlength="50" value="${escapeHtml(s.ownerName)}" placeholder="Ex.: Mariana"></div><div class="field"><label for="settings-currency">Moeda</label><select id="settings-currency" name="currency"><option value="BRL" ${s.currency === "BRL" ? "selected" : ""}>Real brasileiro (R$)</option><option value="USD" ${s.currency === "USD" ? "selected" : ""}>Dólar americano (US$)</option><option value="EUR" ${s.currency === "EUR" ? "selected" : ""}>Euro (€)</option></select></div><div class="field full"><label for="settings-tagline">Frase do painel</label><input id="settings-tagline" name="tagline" maxlength="100" value="${escapeHtml(s.tagline)}" placeholder="Ex.: Operação leve, estoque no controle."></div></div></section><section class="card settings-card"><div class="settings-section-title"><span class="metric-icon">${icon("tag", 18)}</span><div><h2>Tema visual</h2><p>Escolha as cores que combinam com a sua marca.</p></div></div><div class="theme-swatches"><label class="color-field"><span>Cor principal</span><input type="color" name="primaryColor" value="${safeColor(s.primaryColor)}"></label><label class="color-field"><span>Cor de destaque</span><input type="color" name="accentColor" value="${safeColor(s.accentColor)}"></label><label class="color-field"><span>Fundo</span><input type="color" name="surfaceColor" value="${safeColor(s.surfaceColor)}"></label></div><div class="theme-presets"><button type="button" class="theme-preset" data-theme-preset="forest"><i style="background:#176b38"></i>Floresta</button><button type="button" class="theme-preset" data-theme-preset="ocean"><i style="background:#176b8a"></i>Oceano</button><button type="button" class="theme-preset" data-theme-preset="plum"><i style="background:#70458f"></i>Ameixa</button></div><div class="form-actions"><button class="button button-primary" type="submit">${icon("check", 16)} Salvar personalização</button></div></section></form><section class="card settings-card"><div class="settings-section-title"><span class="metric-icon">${icon("download", 18)}</span><div><h2>Dados da empresa</h2><p>Faça uma cópia completa para migrar ou recuperar sua operação.</p></div></div><div class="settings-actions"><button class="button button-soft button-small" data-action="export-backup">${icon("download", 14)} Baixar backup completo</button><button class="button button-plain button-small" data-action="reset-demo">${icon("spark", 14)} Recomeçar com dados de exemplo</button></div><p class="footnote">Os dados continuam armazenados somente neste navegador. O backup JSON inclui configurações, produtos, categorias, vendas, despesas e histórico.</p></section>`;
  }
  function getView() {
    return (
      {
        home: renderHome,
        products: renderProducts,
        activity: renderActivityPage,
        reports: renderReports,
        categories: renderCategories,
        settings: renderSettings,
      }[activeView] || renderHome
    )();
  }
  function render() {
    const scroll = window.scrollY;
    app.innerHTML = shell(getView());
    if (activeView === "products") {
      const input = $("#product-search");
      input?.addEventListener("input", () => {
        query = input.value;
        const pos = input.selectionStart;
        render();
        const next = $("#product-search");
        next?.focus();
        next?.setSelectionRange(pos, pos);
      });
      $("#product-category-filter")?.addEventListener("change", (e) => {
        categoryFilter = e.target.value;
        render();
      });
      $("#product-status-filter")?.addEventListener("change", (e) => {
        productStatusFilter = e.target.value;
        render();
      });
      $("#product-sort")?.addEventListener("change", (e) => {
        productSort = e.target.value;
        render();
      });
    }
    if (scroll > 0 && activeView !== "products") window.scrollTo(0, scroll);
  }
  function showToast(message) {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 2600);
  }
  function setView(view) {
    activeView = view;
    query = "";
    render();
    window.scrollTo(0, 0);
  }
  function selectOptions(current = "") {
    const categories = [...state.categories];
    if (current && !categories.some((c) => c.name === current))
      categories.unshift({ name: current });
    return categories
      .map(
        (c) =>
          `<option value="${escapeHtml(c.name)}" ${c.name === current ? "selected" : ""}>${escapeHtml(c.name)}</option>`,
      )
      .join("");
  }
  function renderModal() {
    const record = modal.record || {};
    let title = "",
      subtitle = "",
      form = "";
    if (modal.type === "product") {
      title = record.id ? "Editar produto" : "Novo produto";
      subtitle = "Cadastre os detalhes e níveis de reposição.";
      form = `<form id="modal-form" data-type="product"><input type="hidden" name="id" value="${escapeHtml(record.id || "")}"><div class="form-grid"><div class="field full"><label for="p-name">Nome do produto</label><input id="p-name" name="name" required maxlength="100" placeholder="Ex.: Café em grãos 1 kg" value="${escapeHtml(record.name || "")}"></div><div class="field"><label for="p-sku">SKU / código</label><input id="p-sku" name="sku" maxlength="40" placeholder="CAF-001" value="${escapeHtml(record.sku || "")}"></div><div class="field"><label for="p-cat">Categoria</label><select id="p-cat" name="category" required>${selectOptions(record.category || state.categories[0]?.name)}</select></div><div class="field"><label for="p-cost">Custo unitário (R$)</label><input id="p-cost" name="cost" required type="text" inputmode="decimal" autocomplete="off" value="${record.cost ?? ""}" placeholder="0,00"></div><div class="field"><label for="p-price">Preço de venda (R$)</label><input id="p-price" name="price" type="text" inputmode="decimal" autocomplete="off" value="${record.price ?? ""}" placeholder="Opcional"></div><div class="field"><label for="p-qty">Quantidade</label><input id="p-qty" name="quantity" required type="number" min="0" step="any" value="${record.quantity ?? 0}"></div><div class="field"><label for="p-min">Estoque mínimo</label><input id="p-min" name="minStock" required type="number" min="0" step="any" value="${record.minStock ?? 0}"></div><div class="field full"><label for="p-unit">Unidade (un., pct., kg…)</label><input id="p-unit" name="unit" maxlength="16" value="${escapeHtml(record.unit || "un.")}"></div>${record.id ? `<div class="field full"><label for="p-stock-reason">Motivo do ajuste de saldo (se alterar a quantidade)</label><input id="p-stock-reason" name="stockReason" maxlength="100" placeholder="Ex.: contagem física"></div><div class="field full"><label for="p-stock-note">Observação (opcional)</label><textarea id="p-stock-note" name="stockNote" maxlength="240" rows="2" placeholder="Detalhes do ajuste"></textarea></div>` : ""}</div><div class="form-actions"><button class="button button-plain" type="button" data-action="close-modal">Cancelar</button><button class="button button-primary" type="submit">${icon("check", 16)} Salvar produto</button></div></form>`;
    } else if (modal.type === "expense") {
      title = record.id ? "Editar despesa" : "Nova despesa";
      subtitle = "Registre o gasto e sua categoria.";
      form = `<form id="modal-form" data-type="expense"><input type="hidden" name="id" value="${escapeHtml(record.id || "")}"><div class="form-grid"><div class="field full"><label for="e-desc">Descrição</label><input id="e-desc" name="description" required maxlength="100" placeholder="Ex.: Compra de insumos" value="${escapeHtml(record.description || "")}"></div><div class="field"><label for="e-amount">Valor (R$)</label><input id="e-amount" name="amount" required type="text" inputmode="decimal" autocomplete="off" value="${record.amount ?? ""}" placeholder="0,00"></div><div class="field"><label for="e-date">Data</label><input id="e-date" name="date" required type="date" value="${escapeHtml(record.date || localISO(new Date()))}"></div><div class="field full"><label for="e-cat">Categoria</label><select id="e-cat" name="category" required>${selectOptions(record.category || state.categories[0]?.name)}</select></div><div class="field full"><label for="e-note">Observação (opcional)</label><input id="e-note" name="note" maxlength="140" value="${escapeHtml(record.note || "")}"></div></div><div class="form-actions"><button class="button button-plain" type="button" data-action="close-modal">Cancelar</button><button class="button button-primary" type="submit">${icon("check", 16)} Salvar despesa</button></div></form>`;
    } else if (modal.type === "sale") {
      const p = state.products.find((x) => Number(x.quantity) > 0);
      title = "Registrar venda";
      subtitle = "A quantidade vendida será baixada do estoque.";
      form = `<form id="modal-form" data-type="sale"><div class="form-grid"><div class="field full"><label for="s-product">Produto</label><select id="s-product" name="productId" required>${state.products
        .filter((x) => Number(x.quantity) > 0)
        .map(
          (x) =>
            `<option value="${escapeHtml(x.id)}" data-price="${Number(x.price) || 0}" data-qty="${Number(x.quantity)}" ${record.id === x.id ? "selected" : ""}>${escapeHtml(x.name)} · ${number(x.quantity)} ${escapeHtml(x.unit || "un.")}</option>`,
        )
        .join(
          "",
        )}</select></div><div class="field"><label for="s-qty">Quantidade</label><input id="s-qty" name="quantity" required type="number" min="0.01" step="any" value="1" max="${p ? Number(p.quantity) : 1}"></div><div class="field"><label for="s-price">Preço unitário (R$)</label><input id="s-price" name="price" required type="text" inputmode="decimal" autocomplete="off" value="${p?.price || ""}" placeholder="0,00"></div><div class="field"><label for="s-date">Data</label><input id="s-date" name="date" required type="date" value="${localISO(new Date())}"></div><div class="field"><label for="s-reason">Motivo</label><input id="s-reason" name="reason" required maxlength="100" value="Venda"></div><div class="field full"><label for="s-note">Observação (opcional)</label><textarea id="s-note" name="note" maxlength="240" rows="2"></textarea></div></div>${p ? "" : `<p class="modal-note">Não há produtos com saldo disponível. Faça uma entrada de estoque para registrar uma venda.</p>`}<div class="form-actions"><button class="button button-plain" type="button" data-action="close-modal">Cancelar</button><button class="button button-primary" type="submit" ${p ? "" : "disabled"}>${icon("up", 16)} Confirmar venda</button></div></form>`;
    } else if (modal.type === "entry" || modal.type === "exit") {
      const isEntry = modal.type === "entry";
      const selected =
        state.products.find((x) => x.id === record.id) || state.products[0];
      title = isEntry ? "Entrada de estoque" : "Saída de estoque";
      subtitle = isEntry
        ? "Some unidades recebidas ao saldo do produto."
        : "Registre uma baixa que não seja uma venda.";
      form = `<form id="modal-form" data-type="${isEntry ? "entry" : "exit"}"><div class="form-grid"><div class="field full"><label for="m-product">Produto</label><select id="m-product" name="productId" required>${state.products.map((x) => `<option value="${escapeHtml(x.id)}" ${selected?.id === x.id ? "selected" : ""}>${escapeHtml(x.name)} · ${number(x.quantity)} ${escapeHtml(x.unit || "un.")}</option>`).join("")}</select></div><div class="field"><label for="m-qty">Quantidade</label><input id="m-qty" name="quantity" required type="number" min="0.01" step="any" value="1" ${!isEntry && selected ? `max="${Number(selected.quantity)}"` : ""}></div><div class="field"><label for="m-date">Data</label><input id="m-date" name="date" required type="date" value="${localISO(new Date())}"></div><div class="field full"><label for="m-reason">Motivo</label><input id="m-reason" name="reason" required maxlength="100" placeholder="Ex.: recebimento do fornecedor" value="${isEntry ? "Recebimento" : "Baixa de estoque"}"></div><div class="field full"><label for="m-note">Observação (opcional)</label><textarea id="m-note" name="note" maxlength="240" rows="2"></textarea></div></div><div class="form-actions"><button class="button button-plain" type="button" data-action="close-modal">Cancelar</button><button class="button button-primary" type="submit">${icon(isEntry ? "down" : "up", 16)} Registrar ${isEntry ? "entrada" : "saída"}</button></div></form>`;
    } else if (modal.type === "adjustment") {
      const selected =
        state.products.find((x) => x.id === record.id) || state.products[0];
      title = "Ajuste de estoque";
      subtitle = "Informe o saldo contado; o histórico guardará a diferença.";
      form = `<form id="modal-form" data-type="adjustment"><div class="form-grid"><div class="field full"><label for="a-product">Produto</label><select id="a-product" name="productId" required>${state.products.map((x) => `<option value="${escapeHtml(x.id)}" ${selected?.id === x.id ? "selected" : ""}>${escapeHtml(x.name)} · saldo ${number(x.quantity)}</option>`).join("")}</select></div><div class="field"><label for="a-qty">Novo saldo contado</label><input id="a-qty" name="quantity" required type="number" min="0" step="any" value="${selected ? Number(selected.quantity) : 0}"></div><div class="field"><label for="a-date">Data</label><input id="a-date" name="date" required type="date" value="${localISO(new Date())}"></div><div class="field full"><label for="a-reason">Motivo</label><input id="a-reason" name="reason" required maxlength="100" placeholder="Ex.: inventário físico" value="Contagem física"></div><div class="field full"><label for="a-note">Observação (opcional)</label><textarea id="a-note" name="note" maxlength="240" rows="2"></textarea></div></div><div class="form-actions"><button class="button button-plain" type="button" data-action="close-modal">Cancelar</button><button class="button button-primary" type="submit">${icon("transfer", 16)} Aplicar ajuste</button></div></form>`;
    } else if (modal.type === "category") {
      title = record.id ? "Editar categoria" : "Nova categoria";
      subtitle = "Crie uma categoria e defina o limite mensal.";
      form = `<form id="modal-form" data-type="category"><input type="hidden" name="id" value="${escapeHtml(record.id || "")}"><div class="form-grid"><div class="field full"><label for="c-name">Nome</label><input id="c-name" name="name" required maxlength="50" value="${escapeHtml(record.name || "")}" placeholder="Ex.: Manutenção"></div><div class="field"><label for="c-budget">Orçamento mensal (R$)</label><input id="c-budget" name="budget" type="text" inputmode="decimal" autocomplete="off" value="${record.budget ?? 0}"></div><div class="field"><label for="c-color">Cor nos relatórios</label><input id="c-color" name="color" type="color" value="${safeColor(record.color || COLORS[state.categories.length % COLORS.length])}"></div></div><div class="form-actions"><button class="button button-plain" type="button" data-action="close-modal">Cancelar</button><button class="button button-primary" type="submit">${icon("check", 16)} Salvar categoria</button></div></form>`;
    }
    if (modal.type === "history") {
      const product = record;
      const history = productHistoryEntries(product);
      const balance = Number(product.quantity);
      title = `Histórico · ${product.name}`;
      subtitle = `Saldo atual: ${number(balance)} ${product.unit || "un."} · SKU ${product.sku || "—"}`;
      form = `<div class="history-list">${history.length ? history.map((item) => renderActivity(item)).join("") : `<div class="empty-state"><strong>Nenhuma movimentação registrada</strong>Entradas, saídas, vendas e ajustes deste produto aparecerão aqui.</div>`}</div><div class="form-actions"><button class="button button-plain" type="button" data-action="close-modal">Fechar</button></div>`;
    }
    return `<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="modal-grab"></div><div class="modal-heading"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div><button class="close-button" data-action="close-modal" aria-label="Fechar">${icon("close")}</button></div>${form}</section></div>`;
  }
  function openModal(type, record = null) {
    modal = { type, record };
    render();
    setTimeout(
      () => $(".modal input:not([type=hidden]),.modal select")?.focus(),
      20,
    );
  }
  function closeModal() {
    modal = null;
    render();
  }
  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }
  function commitProduct(d) {
    const editing = state.products.find((p) => p.id === d.id);
    const name = String(d.name || "").trim(),
      sku = String(d.sku || "").trim(),
      cost = Number(d.cost),
      price = d.price === "" ? 0 : Number(d.price),
      quantity = Number(d.quantity),
      minStock = Number(d.minStock);
    if (
      !name ||
      !d.category ||
      !Number.isFinite(cost) ||
      cost < 0 ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      !Number.isFinite(minStock) ||
      minStock < 0
    ) {
      showToast("Confira os dados do produto e os valores não negativos.");
      return;
    }
    if (
      sku &&
      state.products.some(
        (p) =>
          p.id !== d.id &&
          p.sku.toLocaleLowerCase() === sku.toLocaleLowerCase(),
      )
    ) {
      showToast("Já existe um produto com este SKU.");
      return;
    }
    const item = {
      id: d.id || uid(),
      name,
      sku,
      category: d.category,
      cost,
      price,
      quantity,
      minStock,
      unit: String(d.unit || "").trim() || "un.",
    };
    if (editing) {
      const delta = item.quantity - Number(editing.quantity);
      Object.assign(editing, item);
      if (delta)
        state.movements.push({
          id: uid(),
          type: "adjustment",
          date: localISO(new Date()),
          description: String(
            d.stockReason || "Ajuste via cadastro do produto",
          ).trim(),
          reason: String(
            d.stockReason || "Ajuste via cadastro do produto",
          ).trim(),
          note: String(d.stockNote || "").trim(),
          productId: item.id,
          productName: item.name,
          quantity: delta,
        });
    } else {
      state.products.unshift(item);
      if (item.quantity > 0)
        state.movements.push({
          id: uid(),
          type: "entry",
          date: localISO(new Date()),
          description: "Saldo inicial",
          reason: "Saldo inicial",
          note: "Quantidade informada no cadastro do produto.",
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
        });
    }
    save();
    modal = null;
    render();
    showToast(editing ? "Produto atualizado." : "Produto cadastrado.");
  }
  function commitExpense(d) {
    const obj = {
      id: d.id || uid(),
      date: d.date,
      description: d.description.trim(),
      category: d.category,
      amount: Number(d.amount),
      note: d.note.trim(),
    };
    const old = state.expenses.find((e) => e.id === d.id);
    if (old) Object.assign(old, obj);
    else state.expenses.unshift(obj);
    save();
    modal = null;
    render();
    showToast(old ? "Despesa atualizada." : "Despesa registrada.");
  }
  function commitCategory(d) {
    const name = d.name.trim();
    if (
      state.categories.some(
        (c) =>
          c.name.toLocaleLowerCase() === name.toLocaleLowerCase() &&
          c.id !== d.id,
      )
    ) {
      showToast("Já existe uma categoria com esse nome.");
      return;
    }
    const old = state.categories.find((c) => c.id === d.id);
    if (old) {
      const previous = old.name;
      Object.assign(old, {
        name,
        budget: Number(d.budget) || 0,
        color: safeColor(d.color),
      });
      if (previous !== name) {
        state.products.forEach((p) => {
          if (p.category === previous) p.category = name;
        });
        state.expenses.forEach((e) => {
          if (e.category === previous) e.category = name;
        });
      }
    } else
      state.categories.push({
        id: uid(),
        name,
        budget: Number(d.budget) || 0,
        color: safeColor(
          d.color || COLORS[state.categories.length % COLORS.length],
        ),
      });
    save();
    modal = null;
    render();
    showToast(old ? "Categoria atualizada." : "Categoria criada.");
  }
  function commitSale(d) {
    const product = state.products.find((p) => p.id === d.productId),
      qty = Number(d.quantity),
      price = Number(d.price),
      reason = String(d.reason || "").trim();
    if (
      !product ||
      !Number.isFinite(qty) ||
      qty <= 0 ||
      qty > Number(product.quantity)
    ) {
      showToast("Quantidade indisponível no estoque.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      showToast("Informe um preço de venda maior que zero.");
      return;
    }
    if (!validISODate(d.date) || !reason) {
      showToast("Informe uma data válida e o motivo da saída.");
      return;
    }
    state.sales = state.sales.filter((sale) => !sale.isSample);
    const total = qty * price,
      note = String(d.note || "").trim();
    product.quantity = Number(product.quantity) - qty;
    state.sales.push({
      id: uid(),
      productId: product.id,
      date: d.date,
      reason,
      description: `Venda · ${product.name}`,
      productName: product.name,
      quantity: qty,
      total,
      note,
    });
    state.movements.push({
      id: uid(),
      type: "sale",
      productId: product.id,
      date: d.date,
      description: reason,
      reason,
      note,
      productName: product.name,
      quantity: -qty,
    });
    save();
    modal = null;
    render();
    showToast("Venda registrada e estoque atualizado.");
  }
  function commitEntry(d) {
    const product = state.products.find((p) => p.id === d.productId),
      qty = Number(d.quantity),
      reason = String(d.reason || "").trim();
    if (!product || !Number.isFinite(qty) || qty <= 0) {
      showToast("Confira o produto e informe uma quantidade maior que zero.");
      return;
    }
    if (!validISODate(d.date) || !reason) {
      showToast("Informe uma data válida e o motivo da entrada.");
      return;
    }
    product.quantity = Number(product.quantity) + qty;
    state.movements.push({
      id: uid(),
      type: "entry",
      productId: product.id,
      date: d.date,
      description: reason,
      reason,
      note: String(d.note || "").trim(),
      productName: product.name,
      quantity: qty,
    });
    save();
    modal = null;
    render();
    showToast("Entrada registrada.");
  }
  function commitExit(d) {
    const product = state.products.find((p) => p.id === d.productId),
      qty = Number(d.quantity),
      reason = String(d.reason || "").trim();
    if (
      !product ||
      !Number.isFinite(qty) ||
      qty <= 0 ||
      qty > Number(product.quantity)
    ) {
      showToast(
        "A saída precisa ser positiva e não pode superar o saldo disponível.",
      );
      return;
    }
    if (!validISODate(d.date) || !reason) {
      showToast("Informe uma data válida e o motivo da saída.");
      return;
    }
    product.quantity = Number(product.quantity) - qty;
    state.movements.push({
      id: uid(),
      type: "exit",
      productId: product.id,
      date: d.date,
      description: reason,
      reason,
      note: String(d.note || "").trim(),
      productName: product.name,
      quantity: -qty,
    });
    save();
    modal = null;
    render();
    showToast("Saída registrada.");
  }
  function commitAdjustment(d) {
    const product = state.products.find((p) => p.id === d.productId),
      newBalance = Number(d.quantity),
      reason = String(d.reason || "").trim();
    if (!product || !Number.isFinite(newBalance) || newBalance < 0) {
      showToast("O novo saldo deve ser zero ou maior.");
      return;
    }
    if (!validISODate(d.date) || !reason) {
      showToast("Informe uma data válida e o motivo do ajuste.");
      return;
    }
    const delta = newBalance - Number(product.quantity);
    if (!delta) {
      showToast(
        "O novo saldo é igual ao saldo atual; nenhum ajuste foi registrado.",
      );
      return;
    }
    product.quantity = newBalance;
    state.movements.push({
      id: uid(),
      type: "adjustment",
      productId: product.id,
      date: d.date,
      description: reason,
      reason,
      note: String(d.note || "").trim(),
      productName: product.name,
      quantity: delta,
    });
    save();
    modal = null;
    render();
    showToast("Ajuste registrado.");
  }
  function csvEscape(v) {
    const text = String(v ?? "");
    return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }
  const csvSchemas = {
    products: {
      filename: "produtos.csv",
      headers: [
        "name",
        "sku",
        "category",
        "cost",
        "price",
        "quantity",
        "minStock",
        "unit",
      ],
      rows: () => state.products,
    },
    expenses: {
      filename: "despesas.csv",
      headers: ["date", "description", "category", "amount", "note"],
      rows: () => state.expenses,
    },
    categories: {
      filename: "categorias.csv",
      headers: ["name", "budget", "color"],
      rows: () => state.categories,
    },
  };
  function exportCSV(kind) {
    const schema = csvSchemas[kind];
    if (!schema) return;
    const rows = [
      schema.headers,
      ...schema
        .rows()
        .map((item) => schema.headers.map((key) => item[key] ?? "")),
    ];
    const csv =
      "\uFEFF" + rows.map((row) => row.map(csvEscape).join(";")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = schema.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Arquivo ${schema.filename} exportado.`);
  }
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");
    const first = text.split(/\r?\n/)[0] || "";
    const delimiter =
      (first.match(/;/g) || []).length > (first.match(/,/g) || []).length
        ? ";"
        : ",";
    const rows = [];
    let row = [],
      cell = "",
      quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (c === '"') quoted = false;
        else cell += c;
      } else if (c === '"') quoted = true;
      else if (c === delimiter) {
        row.push(cell);
        cell = "";
      } else if (c === "\n") {
        row.push(cell.replace(/\r$/, ""));
        if (row.some((x) => x.trim())) rows.push(row);
        row = [];
        cell = "";
      } else cell += c;
    }
    row.push(cell.replace(/\r$/, ""));
    if (row.some((x) => x.trim())) rows.push(row);
    if (!rows.length) return [];
    const headers = rows.shift().map((h) => h.trim());
    return rows.map((values) =>
      Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? "").trim()])),
    );
  }
  function normalizeCSVRows(kind, rows) {
    const aliases = {
      products: {
        name: ["name", "nome", "product", "produto", "item"],
        sku: ["sku", "codigo", "codigoproduto"],
        category: ["category", "categoria"],
        cost: ["cost", "custo", "custounitario"],
        price: ["price", "preco", "precovenda", "valorvenda"],
        quantity: ["quantity", "quantidade", "estoque"],
        minStock: ["minstock", "estoqueminimo", "minimo"],
        unit: ["unit", "unidade"],
      },
      expenses: {
        date: ["date", "data"],
        description: ["description", "descricao", "despesa", "titulo"],
        category: ["category", "categoria"],
        amount: ["amount", "valor", "valordespesa", "total"],
        note: ["note", "observacao", "obs"],
      },
      categories: {
        name: ["name", "nome", "categoria"],
        budget: ["budget", "orcamento", "orcamentomensal", "limitemensal"],
        color: ["color", "cor"],
      },
    }[kind];
    if (!aliases) throw new Error("Tipo de importação desconhecido.");
    const normalizeKey = (value) =>
      String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const lookup = new Map();
    Object.entries(aliases).forEach(([field, names]) =>
      names.forEach((name) => lookup.set(normalizeKey(name), field)),
    );
    return rows
      .map((row) => {
        const result = {};
        Object.entries(row).forEach(([key, value]) => {
          const field = lookup.get(normalizeKey(key));
          if (field) result[field] = value;
        });
        return result;
      })
      .filter((row) =>
        Object.values(row).some((value) => String(value ?? "").trim()),
      );
  }
  function parseCSVNumber(value) {
    if (value == null || String(value).trim() === "") return NaN;
    let text = String(value)
      .trim()
      .replace(/R\$\s?/i, "")
      .replace(/\s/g, "");
    if (text.includes(",") && text.includes(".")) {
      if (text.lastIndexOf(",") > text.lastIndexOf("."))
        text = text.replace(/\./g, "").replace(",", ".");
      else text = text.replace(/,/g, "");
    } else if (text.includes(",")) text = text.replace(",", ".");
    if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(text)) return NaN;
    const result = Number(text);
    return Number.isFinite(result) ? result : NaN;
  }
  function importCategoryName(name) {
    const label = String(name || "").trim();
    if (!label) return state.categories[0]?.name || "Sem categoria";
    const existing = state.categories.find(
      (c) => c.name.toLocaleLowerCase() === label.toLocaleLowerCase(),
    );
    if (existing) return existing.name;
    state.categories.push({
      id: uid(),
      name: label,
      budget: 0,
      color: COLORS[state.categories.length % COLORS.length],
    });
    return label;
  }
  function importRows(kind, rawRows) {
    const rows = normalizeCSVRows(kind, rawRows);
    if (!rows.length)
      throw new Error("O CSV não contém dados com cabeçalhos reconhecidos.");
    const required = {
      products: ["name", "cost", "quantity"],
      expenses: ["description", "amount"],
      categories: ["name"],
    }[kind];
    const missing = required.filter((field) => !Object.hasOwn(rows[0], field));
    if (missing.length)
      throw new Error(`CSV inválido: inclua as colunas ${missing.join(", ")}.`);
    const prepared = rows.map((r, index) => {
      const line = index + 2;
      if (kind === "products") {
        if (!r.name.trim())
          throw new Error(`Linha ${line}: informe o nome do produto.`);
        const cost = parseCSVNumber(r.cost),
          quantity = parseCSVNumber(r.quantity),
          price = r.price?.trim() ? parseCSVNumber(r.price) : 0,
          minStock = r.minStock?.trim() ? parseCSVNumber(r.minStock) : 0;
        if (
          !Number.isFinite(cost) ||
          cost < 0 ||
          !Number.isFinite(quantity) ||
          quantity < 0 ||
          !Number.isFinite(price) ||
          price < 0 ||
          !Number.isFinite(minStock) ||
          minStock < 0
        )
          throw new Error(
            `Linha ${line}: confira custo, preço, quantidade e estoque mínimo.`,
          );
        return { ...r, cost, quantity, price, minStock };
      }
      if (kind === "expenses") {
        if (!r.description.trim())
          throw new Error(`Linha ${line}: informe a descrição da despesa.`);
        const amount = parseCSVNumber(r.amount);
        if (!Number.isFinite(amount) || amount <= 0)
          throw new Error(
            `Linha ${line}: o valor da despesa deve ser maior que zero.`,
          );
        if (r.date?.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(r.date.trim()))
          throw new Error(`Linha ${line}: use a data no formato AAAA-MM-DD.`);
        return { ...r, amount };
      }
      if (!r.name.trim())
        throw new Error(`Linha ${line}: informe o nome da categoria.`);
      const budget = r.budget?.trim() ? parseCSVNumber(r.budget) : 0;
      if (!Number.isFinite(budget) || budget < 0)
        throw new Error(`Linha ${line}: o orçamento deve ser zero ou maior.`);
      return { ...r, budget };
    });
    let added = 0,
      updated = 0,
      skipped = 0;
    if (kind === "products") {
      for (const r of prepared) {
        const sku = (r.sku || "").trim(),
          existing =
            state.products.find((p) => sku && p.sku === sku) ||
            state.products.find(
              (p) =>
                p.name.toLocaleLowerCase() ===
                r.name.trim().toLocaleLowerCase(),
            );
        const item = {
          id: existing?.id || uid(),
          name: r.name.trim(),
          sku: sku || existing?.sku || "",
          category: importCategoryName(r.category || existing?.category),
          cost: r.cost,
          price: r.price,
          quantity: r.quantity,
          minStock: r.minStock,
          unit: (r.unit || existing?.unit || "un.").trim(),
        };
        if (existing) {
          Object.assign(existing, item);
          updated++;
        } else {
          state.products.push(item);
          added++;
        }
      }
    } else if (kind === "expenses") {
      const keyOf = (e) =>
        [
          e.date,
          String(e.description).trim().toLocaleLowerCase(),
          String(e.category).trim().toLocaleLowerCase(),
          Number(e.amount),
        ].join("|");
      const seen = new Set(state.expenses.map(keyOf));
      for (const r of prepared) {
        const item = {
          id: uid(),
          date: r.date?.trim() || localISO(new Date()),
          description: r.description.trim(),
          category: importCategoryName(r.category),
          amount: r.amount,
          note: (r.note || "").trim(),
        };
        const key = keyOf(item);
        if (seen.has(key)) {
          skipped++;
          continue;
        }
        seen.add(key);
        state.expenses.push(item);
        added++;
      }
    } else if (kind === "categories") {
      for (const r of prepared) {
        const name = r.name.trim(),
          existing = state.categories.find(
            (c) => c.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
          );
        if (existing) {
          existing.budget = r.budget;
          if (r.color?.trim()) existing.color = safeColor(r.color);
          updated++;
        } else {
          state.categories.push({
            id: uid(),
            name,
            budget: r.budget,
            color: safeColor(
              r.color || COLORS[state.categories.length % COLORS.length],
            ),
          });
          added++;
        }
      }
    }
    save();
    return { added, updated, skipped };
  }
  let importKind = null;
  app.addEventListener("click", (event) => {
    const button = event.target.closest(
      "[data-view],[data-modal],[data-action]",
    );
    if (!button) return;
    if (button.dataset.view) {
      setView(button.dataset.view);
      return;
    }
    const type = button.dataset.modal;
    if (type) {
      if (
        type === "expense" ||
        type === "entry" ||
        type === "exit" ||
        type === "adjustment" ||
        type === "sale"
      ) {
        if (!state.categories.length && type === "expense") {
          showToast("Cadastre uma categoria primeiro.");
          return;
        }
        if (
          (type === "entry" || type === "exit" || type === "adjustment") &&
          !state.products.length
        ) {
          showToast("Cadastre um produto primeiro.");
          return;
        }
      }
      openModal(type);
      return;
    }
    const action = button.dataset.action;
    if (action === "close-modal") {
      closeModal();
      return;
    }
    if (action === "backdrop" && event.target === button) {
      closeModal();
      return;
    }
    if (action === "new-product") openModal("product");
    if (action === "new-expense") openModal("expense");
    if (action === "new-category") openModal("category");
    if (action === "edit-product")
      openModal(
        "product",
        state.products.find((p) => p.id === button.dataset.id),
      );
    if (action === "show-history")
      openModal(
        "history",
        state.products.find((p) => p.id === button.dataset.id),
      );
    if (action === "new-entry")
      openModal(
        "entry",
        state.products.find((p) => p.id === button.dataset.id),
      );
    if (action === "new-exit")
      openModal(
        "exit",
        state.products.find((p) => p.id === button.dataset.id),
      );
    if (action === "new-adjustment")
      openModal(
        "adjustment",
        state.products.find((p) => p.id === button.dataset.id),
      );
    if (action === "edit-expense")
      openModal(
        "expense",
        state.expenses.find((e) => e.id === button.dataset.id),
      );
    if (action === "edit-category")
      openModal(
        "category",
        state.categories.find((c) => c.id === button.dataset.id),
      );
    if (action === "delete-product") {
      const p = state.products.find((x) => x.id === button.dataset.id);
      if (p && window.confirm(`Excluir “${p.name}”?`)) {
        state.products = state.products.filter((x) => x.id !== p.id);
        save();
        render();
        showToast("Produto excluído.");
      }
    }
    if (action === "delete-expense") {
      const e = state.expenses.find((x) => x.id === button.dataset.id);
      if (e && window.confirm(`Excluir a despesa “${e.description}”?`)) {
        state.expenses = state.expenses.filter((x) => x.id !== e.id);
        save();
        render();
        showToast("Despesa excluída.");
      }
    }
    if (action === "delete-category") {
      const c = state.categories.find((x) => x.id === button.dataset.id);
      if (!c) return;
      const replacement = state.categories.find((x) => x.id !== c.id);
      if (!replacement) {
        showToast("Mantenha pelo menos uma categoria cadastrada.");
        return;
      }
      if (
        window.confirm(
          `Excluir “${c.name}”? Os produtos e despesas vinculados passarão para “${replacement.name}”.`,
        )
      ) {
        state.categories = state.categories.filter((x) => x.id !== c.id);
        state.products.forEach((p) => {
          if (p.category === c.name) p.category = replacement.name;
        });
        state.expenses.forEach((e) => {
          if (e.category === c.name) e.category = replacement.name;
        });
        save();
        render();
        showToast("Categoria excluída.");
      }
    }
    if (action === "activity-filter") {
      activityFilter = button.dataset.filter;
      render();
    }
    if (action === "export") exportCSV(button.dataset.kind);
    if (action === "export-backup") {
      const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${String(state.settings?.companyName || "empresa").toLocaleLowerCase().replace(/[^a-z0-9]+/gi, "-") || "empresa"}-backup.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Backup completo exportado.");
    }
    if (action === "reset-demo") {
      if (window.confirm("Isso substituirá os dados atuais por exemplos demonstrativos. Continuar?")) {
        state = makeSeed();
        save();
        render();
        showToast("Dados de exemplo restaurados.");
      }
    }
    if (action === "import") {
      importKind = button.dataset.kind;
      const input = $("#csv-file-input");
      input.value = "";
      input.click();
    }
    if (action === "export-menu") {
      if (activeView !== "reports") {
        setView("reports");
        setTimeout(
          () =>
            $("#csv-tools")?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            }),
          60,
        );
      } else
        $("#csv-tools")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  });
  function normalizeModalDecimals(type, data) {
    const fields =
      {
        product: ["cost", "price"],
        expense: ["amount"],
        category: ["budget"],
        sale: ["price"],
      }[type] || [];
    for (const field of fields) {
      const value = String(data[field] ?? "").trim(),
        optional =
          (type === "product" && field === "price") ||
          (type === "category" && field === "budget");
      if (!value && optional) {
        data[field] = "0";
        continue;
      }
      const parsed = parseCSVNumber(value),
        minimum = type === "expense" || type === "sale" ? 0.01 : 0;
      if (!Number.isFinite(parsed) || parsed < minimum) {
        const label =
          {
            cost: "o custo",
            price: "o preço",
            amount: "o valor",
            budget: "o orçamento",
          }[field] || "o valor";
        showToast(`Confira ${label}; use vírgula ou ponto nos centavos.`);
        return null;
      }
      data[field] = String(parsed);
    }
    return data;
  }
  app.addEventListener("submit", (event) => {
    if (event.target.id === "settings-form") {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      if (!String(data.companyName || "").trim()) {
        showToast("Informe o nome da empresa.");
        return;
      }
      state.settings = {
        ...defaultSettings,
        ...state.settings,
        companyName: String(data.companyName).trim(),
        ownerName: String(data.ownerName || "").trim() || "gestor",
        tagline: String(data.tagline || "").trim() || defaultSettings.tagline,
        currency: ["BRL", "USD", "EUR"].includes(data.currency) ? data.currency : "BRL",
        primaryColor: safeColor(data.primaryColor),
        accentColor: safeColor(data.accentColor),
        surfaceColor: safeColor(data.surfaceColor),
      };
      save();
      render();
      showToast("Personalização salva.");
      return;
    }
    if (event.target.id !== "modal-form") return;
    event.preventDefault();
    const form = event.target,
      d = normalizeModalDecimals(form.dataset.type, formData(form));
    if (!d) return;
    if (form.dataset.type === "product") commitProduct(d);
    if (form.dataset.type === "expense") commitExpense(d);
    if (form.dataset.type === "category") commitCategory(d);
    if (form.dataset.type === "sale") commitSale(d);
    if (form.dataset.type === "entry") commitEntry(d);
    if (form.dataset.type === "exit") commitExit(d);
    if (form.dataset.type === "adjustment") commitAdjustment(d);
  });
  app.addEventListener("click", (event) => {
    const preset = event.target.closest("[data-theme-preset]");
    if (!preset) return;
    const themes = {
      forest: ["#176b38", "#e68819", "#f4f7f3"],
      ocean: ["#176b8a", "#e58f32", "#f2f7f8"],
      plum: ["#70458f", "#d87955", "#f7f3f8"],
    };
    const values = themes[preset.dataset.themePreset];
    if (!values) return;
    const form = document.querySelector("#settings-form");
    if (form) {
      form.elements.primaryColor.value = values[0];
      form.elements.accentColor.value = values[1];
      form.elements.surfaceColor.value = values[2];
      document.documentElement.style.setProperty("--green", values[0]);
      document.documentElement.style.setProperty("--green-dark", values[0]);
      document.documentElement.style.setProperty("--orange", values[1]);
      document.documentElement.style.setProperty("--surface", values[2]);
    }
  });
  app.addEventListener("change", (event) => {
    if (event.target.id === "s-product") {
      const option = event.target.selectedOptions[0],
        price = $("#s-price"),
        qty = $("#s-qty");
      if (price) price.value = option?.dataset.price || "";
      if (qty) {
        qty.max = option?.dataset.qty || 1;
        qty.value = Math.min(Number(qty.value) || 1, Number(qty.max));
      }
    }
  });
  $("#csv-file-input").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file || !importKind) return;
    try {
      const result = importRows(importKind, parseCSV(await file.text()));
      render();
      showToast(
        `${result.added} novos · ${result.updated} atualizados${result.skipped ? ` · ${result.skipped} repetidos ignorados` : ""}.`,
      );
    } catch (error) {
      showToast(error.message || "Não foi possível importar este CSV.");
    } finally {
      event.target.value = "";
      importKind = null;
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      state = loadState();
      render();
    }
  });
  applyTheme();
  render();
})();
