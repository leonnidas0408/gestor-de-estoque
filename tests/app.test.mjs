import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const appJs = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const STORAGE_KEY = "estoque-local-v1";

test("HTML usa caminhos relativos para funcionar no subdiretório do GitHub Pages", () => {
  const assetPaths = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.ok(assetPaths.includes("./brand-mark.svg"));
  assert.ok(assetPaths.includes("./styles.css"));
  assert.ok(assetPaths.includes("./app.js"));
  assert.ok(assetPaths.every((path) => !path.startsWith("/")));
});

function makeState(products = []) {
  return {
    version: 1,
    demo: false,
    products,
    expenses: [],
    categories: [
      { id: "cat-a", name: "Cafeteria", budget: 500, color: "#176b38" },
      { id: "cat-b", name: "Insumos", budget: 800, color: "#638bb8" },
    ],
    sales: [],
    movements: [],
    settings: {
      companyName: "Empresa de teste",
      ownerName: "Teste",
      tagline: "Operação sob controle.",
      currency: "BRL",
      setupComplete: true,
    },
  };
}

function product(id, name, quantity, minStock, category = "Cafeteria") {
  return {
    id,
    name,
    sku: id.toUpperCase(),
    category,
    cost: 2,
    price: 5,
    quantity,
    minStock,
    unit: "un.",
  };
}

function createApp(state = undefined) {
  const dom = new JSDOM(html, {
    url: "https://stock-manager.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  dom.window.confirm = () => true;
  dom.window.scrollTo = () => {};
  if (state)
    dom.window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  dom.window.eval(appJs);
  return dom;
}

function click(dom, selector) {
  const element = dom.window.document.querySelector(selector);
  assert.ok(element, `Elemento não encontrado: ${selector}`);
  element.click();
}

function setField(dom, form, name, value) {
  const element = form.querySelector(`[name="${name}"]`);
  assert.ok(element, `Campo ${name} não encontrado`);
  element.value = String(value);
}

function submit(dom, type) {
  const form = dom.window.document.querySelector(
    `#modal-form[data-type="${type}"]`,
  );
  assert.ok(form, `Formulário ${type} não encontrado`);
  form.dispatchEvent(
    new dom.window.Event("submit", { bubbles: true, cancelable: true }),
  );
}

function savedState(dom) {
  return JSON.parse(dom.window.localStorage.getItem(STORAGE_KEY));
}

test("painel e navegação principal carregam as telas", () => {
  const dom = createApp(makeState());
  const { document } = dom.window;
  assert.match(document.querySelector("h1").textContent, /Bom dia/);
  for (const [view, heading] of [
    ["products", "Produtos"],
    ["activity", "Atividade"],
    ["reports", "Relatórios"],
    ["categories", "Categorias"],
  ]) {
    click(dom, `[data-view="${view}"]`);
    assert.match(document.querySelector("h1").textContent, new RegExp(heading));
  }
  dom.window.close();
});

test("cadastro, edição, SKU único e persistência dos produtos", () => {
  const dom = createApp(makeState());
  click(dom, '[data-view="products"]');
  click(dom, '[data-action="new-product"]');
  let form = dom.window.document.querySelector(
    '#modal-form[data-type="product"]',
  );
  setField(dom, form, "name", "Café especial");
  setField(dom, form, "sku", "CAF-900");
  setField(dom, form, "category", "Cafeteria");
  setField(dom, form, "cost", "2,50");
  setField(dom, form, "price", "4,25");
  setField(dom, form, "quantity", "5");
  setField(dom, form, "minStock", "2");
  setField(dom, form, "unit", "pct.");
  submit(dom, "product");

  let state = savedState(dom);
  const added = state.products.find((item) => item.sku === "CAF-900");
  assert.ok(added);
  assert.equal(added.cost, 2.5);
  assert.equal(added.price, 4.25);
  assert.equal(added.quantity, 5);
  assert.equal(
    state.movements.find((item) => item.productId === added.id).reason,
    "Saldo inicial",
  );

  click(dom, `[data-action="edit-product"][data-id="${added.id}"]`);
  form = dom.window.document.querySelector('#modal-form[data-type="product"]');
  setField(dom, form, "name", "Café especial torrado");
  setField(dom, form, "quantity", "7");
  setField(dom, form, "stockReason", "Contagem física");
  setField(dom, form, "stockNote", "Ajuste de conferência");
  submit(dom, "product");
  state = savedState(dom);
  assert.equal(
    state.products.find((item) => item.id === added.id).name,
    "Café especial torrado",
  );
  const adjustment = state.movements.find((item) => item.type === "adjustment");
  assert.equal(adjustment.quantity, 2);
  assert.equal(adjustment.reason, "Contagem física");
  assert.equal(adjustment.note, "Ajuste de conferência");

  click(dom, '[data-action="new-product"]');
  form = dom.window.document.querySelector('#modal-form[data-type="product"]');
  setField(dom, form, "name", "Outro café");
  setField(dom, form, "sku", "CAF-900");
  setField(dom, form, "category", "Cafeteria");
  setField(dom, form, "cost", "1");
  setField(dom, form, "quantity", "1");
  setField(dom, form, "minStock", "0");
  setField(dom, form, "unit", "un.");
  submit(dom, "product");
  assert.equal(
    savedState(dom).products.filter((item) => item.sku === "CAF-900").length,
    1,
  );
  assert.match(dom.window.document.querySelector("#toast").textContent, /SKU/);
  dom.window.close();
});

test("filtros por categoria e situação, busca e ordenação funcionam", () => {
  const dom = createApp(
    makeState([
      product("p-a", "Aveia", 10, 2),
      product("p-b", "Cacau", 2, 2),
      product("p-c", "Chá", 0, 1, "Insumos"),
      product("p-d", "Canela", 8, 2, "Insumos"),
    ]),
  );
  click(dom, '[data-view="products"]');
  const { document } = dom.window;
  assert.equal(
    document.querySelectorAll(".product-row[data-stock-status]").length,
    4,
  );

  const status = document.querySelector("#product-status-filter");
  status.value = "baixo";
  status.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.deepEqual(
    [
      ...document.querySelectorAll(
        ".product-row[data-stock-status] .row-title",
      ),
    ].map((node) => node.textContent),
    ["Cacau"],
  );

  document.querySelector("#product-status-filter").value = "zerado";
  document
    .querySelector("#product-status-filter")
    .dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  document.querySelector("#product-category-filter").value = "Insumos";
  document
    .querySelector("#product-category-filter")
    .dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.deepEqual(
    [
      ...document.querySelectorAll(
        ".product-row[data-stock-status] .row-title",
      ),
    ].map((node) => node.textContent),
    ["Chá"],
  );

  document.querySelector("#product-status-filter").value = "todos";
  document
    .querySelector("#product-status-filter")
    .dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  document.querySelector("#product-category-filter").value = "Todas";
  document
    .querySelector("#product-category-filter")
    .dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  document.querySelector("#product-sort").value = "quantity-desc";
  document
    .querySelector("#product-sort")
    .dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.deepEqual(
    [
      ...document.querySelectorAll(
        ".product-row[data-stock-status] .row-title",
      ),
    ].map((node) => node.textContent),
    ["Aveia", "Canela", "Cacau", "Chá"],
  );

  const search = document.querySelector("#product-search");
  search.value = "P-D";
  search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.deepEqual(
    [
      ...document.querySelectorAll(
        ".product-row[data-stock-status] .row-title",
      ),
    ].map((node) => node.textContent),
    ["Canela"],
  );
  dom.window.close();
});

test("entradas, saídas e ajustes guardam data, motivo, observação e histórico por produto", () => {
  const dom = createApp(makeState([product("p1", "Leite", 10, 4)]));
  click(dom, '[data-view="products"]');

  click(dom, '[data-action="new-entry"][data-id="p1"]');
  let form = dom.window.document.querySelector(
    '#modal-form[data-type="entry"]',
  );
  setField(dom, form, "quantity", "3");
  setField(dom, form, "date", "2026-11-07");
  setField(dom, form, "reason", "Recebimento do fornecedor");
  setField(dom, form, "note", "Nota fiscal 123");
  submit(dom, "entry");
  assert.equal(savedState(dom).products[0].quantity, 13);

  click(dom, '[data-action="new-exit"][data-id="p1"]');
  form = dom.window.document.querySelector('#modal-form[data-type="exit"]');
  setField(dom, form, "quantity", "2");
  setField(dom, form, "date", "2026-11-07");
  setField(dom, form, "reason", "Produto danificado");
  setField(dom, form, "note", "Embalagem violada");
  submit(dom, "exit");
  assert.equal(savedState(dom).products[0].quantity, 11);

  click(dom, '[data-action="new-adjustment"][data-id="p1"]');
  form = dom.window.document.querySelector(
    '#modal-form[data-type="adjustment"]',
  );
  setField(dom, form, "quantity", "5");
  setField(dom, form, "date", "2026-11-07");
  setField(dom, form, "reason", "Inventário físico");
  setField(dom, form, "note", "Diferença confirmada");
  submit(dom, "adjustment");
  const state = savedState(dom);
  assert.equal(state.products[0].quantity, 5);
  assert.deepEqual(
    state.movements.map((item) => item.type),
    ["entry", "exit", "adjustment"],
  );
  assert.equal(state.movements[2].quantity, -6);
  assert.ok(
    state.movements.every(
      (item) =>
        item.productId === "p1" &&
        item.date === "2026-11-07" &&
        item.reason &&
        item.note,
    ),
  );

  click(dom, '[data-action="show-history"][data-id="p1"]');
  const history = dom.window.document.querySelector(".history-list");
  assert.ok(history);
  assert.match(history.textContent, /Recebimento do fornecedor/);
  assert.match(history.textContent, /Nota fiscal 123/);
  assert.match(history.textContent, /Produto danificado/);
  assert.match(history.textContent, /Inventário físico/);
  dom.window.close();
});

test("venda e saída manual nunca deixam saldo negativo; venda atualiza receita", () => {
  const dom = createApp(makeState([product("p1", "Xarope", 5, 1)]));
  click(dom, '[data-view="products"]');
  click(dom, '[data-action="new-exit"][data-id="p1"]');
  let form = dom.window.document.querySelector('#modal-form[data-type="exit"]');
  setField(dom, form, "quantity", "6");
  setField(dom, form, "date", "2026-11-07");
  setField(dom, form, "reason", "Uso interno");
  setField(dom, form, "note", "Teste de excesso");
  submit(dom, "exit");
  assert.equal(savedState(dom).products[0].quantity, 5);
  assert.equal(savedState(dom).movements.length, 0);
  assert.ok(dom.window.document.querySelector('#modal-form[data-type="exit"]'));

  click(dom, '[data-action="close-modal"]');
  click(dom, '[data-view="activity"]');
  click(dom, '[data-modal="sale"]');
  form = dom.window.document.querySelector('#modal-form[data-type="sale"]');
  setField(dom, form, "productId", "p1");
  setField(dom, form, "quantity", "6");
  setField(dom, form, "price", "5");
  setField(dom, form, "date", "2026-11-07");
  setField(dom, form, "reason", "Venda balcão");
  setField(dom, form, "note", "Pedido 42");
  submit(dom, "sale");
  assert.equal(savedState(dom).products[0].quantity, 5);
  assert.equal(savedState(dom).sales.length, 0);

  form = dom.window.document.querySelector('#modal-form[data-type="sale"]');
  setField(dom, form, "quantity", "4");
  submit(dom, "sale");
  const state = savedState(dom);
  assert.equal(state.products[0].quantity, 1);
  assert.equal(state.sales[0].total, 20);
  assert.equal(state.sales[0].note, "Pedido 42");
  assert.equal(state.movements[0].quantity, -4);
  assert.equal(state.movements[0].productId, "p1");
  dom.window.close();
});

test("dados e histórico continuam disponíveis após recarregar no mesmo navegador", () => {
  const dom = createApp(makeState([product("p1", "Farinha", 6, 2)]));
  click(dom, '[data-view="products"]');
  click(dom, '[data-action="new-entry"][data-id="p1"]');
  const form = dom.window.document.querySelector(
    '#modal-form[data-type="entry"]',
  );
  setField(dom, form, "quantity", "2");
  setField(dom, form, "date", "2026-11-07");
  setField(dom, form, "reason", "Reposição");
  setField(dom, form, "note", "Lote 11");
  submit(dom, "entry");
  const persisted = dom.window.localStorage.getItem(STORAGE_KEY);
  const reload = createApp(JSON.parse(persisted));
  click(reload, '[data-view="products"]');
  assert.match(
    reload.window.document.querySelector(".product-row").textContent,
    /8 un\./,
  );
  click(reload, '[data-action="show-history"][data-id="p1"]');
  assert.match(
    reload.window.document.querySelector(".history-list").textContent,
    /Lote 11/,
  );
  dom.window.close();
  reload.window.close();
});


test("categorias e despesas podem ser criadas e persistem com orçamento e observações", () => {
  const dom = createApp(makeState());
  click(dom, '[data-view="categories"]');
  click(dom, '[data-action="new-category"]');
  let form = dom.window.document.querySelector('#modal-form[data-type="category"]');
  setField(dom, form, "name", "Transporte");
  setField(dom, form, "budget", "250,00");
  setField(dom, form, "color", "#176b38");
  submit(dom, "category");
  assert.equal(savedState(dom).categories.find((item) => item.name === "Transporte").budget, 250);

  click(dom, '[data-action="new-category"]');
  form = dom.window.document.querySelector('#modal-form[data-type="category"]');
  setField(dom, form, "name", "transporte");
  setField(dom, form, "budget", "100");
  submit(dom, "category");
  assert.equal(savedState(dom).categories.filter((item) => item.name.toLowerCase() === "transporte").length, 1);

  click(dom, '[data-view="activity"]');
  click(dom, '[data-action="new-expense"]');
  form = dom.window.document.querySelector('#modal-form[data-type="expense"]');
  setField(dom, form, "description", "Frete de insumos");
  setField(dom, form, "amount", "48,90");
  setField(dom, form, "date", "2026-11-07");
  setField(dom, form, "category", "Transporte");
  setField(dom, form, "note", "Pedido 77");
  submit(dom, "expense");
  const expense = savedState(dom).expenses.find((item) => item.description === "Frete de insumos");
  assert.ok(expense);
  assert.equal(expense.amount, 48.9);
  assert.equal(expense.category, "Transporte");
  assert.equal(expense.note, "Pedido 77");
  dom.window.close();
});

test("salvar categoria valida nome, orçamento e equivalência de acentos", () => {
  const dom = createApp(makeState());
  click(dom, '[data-view="categories"]');
  click(dom, '[data-action="new-category"]');
  let form = dom.window.document.querySelector('#modal-form[data-type="category"]');
  setField(dom, form, "name", "Café");
  setField(dom, form, "budget", "125,50");
  submit(dom, "category");
  assert.equal(savedState(dom).categories.find((item) => item.name === "Café").budget, 125.5);

  click(dom, '[data-action="new-category"]');
  form = dom.window.document.querySelector('#modal-form[data-type="category"]');
  setField(dom, form, "name", "Cafe");
  setField(dom, form, "budget", "10");
  submit(dom, "category");
  assert.equal(savedState(dom).categories.filter((item) => /cafe/i.test(item.name)).length, 1);

  click(dom, '[data-action="new-category"]');
  form = dom.window.document.querySelector('#modal-form[data-type="category"]');
  setField(dom, form, "name", "   ");
  setField(dom, form, "budget", "10");
  submit(dom, "category");
  assert.equal(savedState(dom).categories.filter((item) => !item.name.trim()).length, 0);
  dom.window.close();
});

test("movimentos rejeitam datas impossíveis sem alterar o saldo", () => {
  const dom = createApp(makeState([product("p1", "Arroz", 7, 2)]));
  click(dom, '[data-view="products"]');
  click(dom, '[data-action="new-entry"][data-id="p1"]');
  const form = dom.window.document.querySelector('#modal-form[data-type="entry"]');
  setField(dom, form, "quantity", "2");
  setField(dom, form, "date", "2026-02-30");
  setField(dom, form, "reason", "Recebimento inválido");
  submit(dom, "entry");
  assert.equal(savedState(dom).products[0].quantity, 7);
  assert.equal(savedState(dom).movements.length, 0);
  assert.match(dom.window.document.querySelector("#toast").textContent, /data válida/);
  dom.window.close();
});
