const DEFAULT_PRODUCTS = [
  { id: "acucar-refinado", name: "Açúcar refinado", category: "Produção", packageQty: 1, packageUnit: "saco", weight: 5, weightUnit: "kg", price: 21.5, desc: "Para confeitaria, caldas e massas." },
  { id: "alcool-70", name: "Álcool 70%", category: "Limpeza", packageQty: 1, packageUnit: "galão", weight: 5, weightUnit: "L", price: 49.9, desc: "Higienização da área de produção." },
  { id: "caixa-bolo", name: "Caixa para bolo", category: "Embalagens", packageQty: 50, packageUnit: "un.", weight: 0, weightUnit: "", price: 68.5, desc: "Transporte seguro para encomendas." },
  { id: "chocolate-po", name: "Chocolate em pó", category: "Produção", packageQty: 1, packageUnit: "pacote", weight: 1, weightUnit: "kg", price: 32.8, desc: "Bolos, coberturas e recheios." },
  { id: "detergente-neutro", name: "Detergente neutro", category: "Limpeza", packageQty: 1, packageUnit: "galão", weight: 5, weightUnit: "L", price: 24.3, desc: "Limpeza de utensílios e bancadas." },
  { id: "farinha-trigo", name: "Farinha de trigo", category: "Produção", packageQty: 1, packageUnit: "saco", weight: 25, weightUnit: "kg", price: 98.9, desc: "Base para pães, bolos e massas doces." },
  { id: "fermento-biologico", name: "Fermento biológico", category: "Produção", packageQty: 1, packageUnit: "pacote", weight: 500, weightUnit: "g", price: 18.7, desc: "Fermentação de pães e roscas." },
  { id: "leite-integral", name: "Leite integral", category: "Laticínios", packageQty: 12, packageUnit: "caixa", weight: 1, weightUnit: "L", price: 61.2, desc: "Cremes, massas e bebidas." },
  { id: "luvas-descartaveis", name: "Luvas descartáveis", category: "Limpeza", packageQty: 100, packageUnit: "caixa", weight: 0, weightUnit: "", price: 28.6, desc: "Manipulação segura de alimentos." },
  { id: "manteiga", name: "Manteiga", category: "Laticínios", packageQty: 1, packageUnit: "bloco", weight: 2, weightUnit: "kg", price: 74.9, desc: "Folhados, massas amanteigadas e recheios." },
  { id: "queijo-mucarela", name: "Queijo muçarela", category: "Laticínios", packageQty: 1, packageUnit: "peça", weight: 4, weightUnit: "kg", price: 112, desc: "Salgados assados, pizzas e lanches." },
  { id: "saco-pao", name: "Saco para pão", category: "Embalagens", packageQty: 500, packageUnit: "pacote", weight: 0, weightUnit: "", price: 42, desc: "Embalagem para balcão e delivery." },
];

const STORAGE_KEYS = {
  products: "padariaProductsDb",
  cart: "padariaCart",
  orders: "padariaOrders",
  purchases: "padariaPurchaseHistory",
};

const state = {
  activeTab: "insumos",
  category: "todos",
  search: "",
  products: loadJson(STORAGE_KEYS.products, DEFAULT_PRODUCTS),
  cart: loadJson(STORAGE_KEYS.cart, {}),
  orders: loadJson(STORAGE_KEYS.orders, []),
  purchases: loadJson(STORAGE_KEYS.purchases, []),
};

const productTemplate = document.querySelector("#productTemplate");
const productsGrid = document.querySelector("#productsGrid");
const shoppingList = document.querySelector("#shoppingList");
const ordersList = document.querySelector("#ordersList");
const searchInput = document.querySelector("#searchInput");
const pageTitle = document.querySelector("#pageTitle");
const categoryTabs = document.querySelector("#categoryTabs");
const categoryOptions = document.querySelector("#categoryOptions");
const whatsappExport = document.querySelector("#whatsappExport");

const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });
const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uniqueId(name) {
  const base = slugify(name) || "item";
  let id = base;
  let count = 2;
  while (state.products.some((product) => product.id === id)) {
    id = `${base}-${count}`;
    count += 1;
  }
  return id;
}

function iconSvg(name) {
  const icons = {
    package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8 12 3 7 8"/><path d="M12 3v12"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.7Z"/><path d="M8.5 8.5c.3 3.1 2 4.8 5 5"/><path d="M8.5 8.5 9.8 7l1.4 2-1.1 1.1"/><path d="m13.5 13.5 1.1-1.1 2 1.4-1.5 1.3"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-3"/></svg>',
  };
  return icons[name] || "";
}

function hydrateIcons(scope = document) {
  scope.querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = iconSvg(node.dataset.icon);
  });
}

function unitLabel(product) {
  const amount = product.packageQty ? `${cleanNumber(product.packageQty)} ${product.packageUnit || "un."}` : product.packageUnit || "un.";
  const weight = product.weight ? ` · ${cleanNumber(product.weight)} ${product.weightUnit || ""}`.trim() : "";
  return `${amount}${weight}`;
}

function cleanNumber(value) {
  return Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function sortedProducts(products = state.products) {
  return products.slice().sort((a, b) => collator.compare(a.category, b.category) || collator.compare(a.name, b.name));
}

function categories() {
  return [...new Set(state.products.map((product) => product.category).filter(Boolean))].sort(collator.compare);
}

function renderCategories() {
  categoryTabs.innerHTML = "";
  const categoryList = ["todos", ...categories()];
  categoryList.forEach((category) => {
    const button = document.createElement("button");
    button.className = `segment${state.category === category ? " active" : ""}`;
    button.dataset.category = category;
    button.type = "button";
    button.textContent = category === "todos" ? "Todos" : category;
    button.addEventListener("click", () => {
      state.category = category;
      renderProducts();
      renderCategories();
    });
    categoryTabs.appendChild(button);
  });

  categoryOptions.innerHTML = categories()
    .map((category) => `<option value="${escapeHtml(category)}"></option>`)
    .join("");
}

function getFilteredProducts() {
  return sortedProducts().filter((product) => {
    const byCategory = state.category === "todos" || product.category === state.category;
    const query = state.search.trim().toLowerCase();
    const bySearch = !query || `${product.name} ${product.category} ${unitLabel(product)}`.toLowerCase().includes(query);
    return byCategory && bySearch;
  });
}

function renderProducts() {
  productsGrid.innerHTML = "";
  const filtered = getFilteredProducts();

  if (!filtered.length) {
    productsGrid.innerHTML = '<div class="empty-state">Nenhum insumo encontrado.</div>';
    return;
  }

  filtered.forEach((product) => {
    const node = productTemplate.content.cloneNode(true);
    node.querySelector(".category").textContent = product.category;
    node.querySelector("h3").textContent = product.name;
    node.querySelector("p").textContent = product.desc || "Sem observação.";
    node.querySelector("small").textContent = unitLabel(product);
    node.querySelector("strong").textContent = formatCurrency(product.price);
    node.querySelector(".add").addEventListener("click", () => addToCart(product.id));
    node.querySelector(".edit").addEventListener("click", () => editProduct(product.id));
    node.querySelector(".delete").addEventListener("click", () => deleteProduct(product.id));
    hydrateIcons(node);
    productsGrid.appendChild(node);
  });
}

function productFormData() {
  const id = document.querySelector("#editingProductId").value;
  const name = document.querySelector("#productName").value.trim();
  return {
    id: id || uniqueId(name),
    name,
    category: document.querySelector("#productCategory").value.trim() || "Outros",
    packageQty: Number(document.querySelector("#productQty").value || 0),
    packageUnit: document.querySelector("#productQtyUnit").value.trim() || "un.",
    weight: Number(document.querySelector("#productWeight").value || 0),
    weightUnit: document.querySelector("#productWeightUnit").value.trim(),
    price: Number(document.querySelector("#productPrice").value || 0),
    desc: document.querySelector("#productDesc").value.trim(),
  };
}

function resetProductForm() {
  document.querySelector("#productForm").reset();
  document.querySelector("#editingProductId").value = "";
  document.querySelector("#productFormTitle").textContent = "Novo item";
  document.querySelector("#cancelProductEdit").style.display = "none";
}

function editProduct(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  document.querySelector("#editingProductId").value = product.id;
  document.querySelector("#productName").value = product.name;
  document.querySelector("#productCategory").value = product.category;
  document.querySelector("#productQty").value = product.packageQty;
  document.querySelector("#productQtyUnit").value = product.packageUnit;
  document.querySelector("#productWeight").value = product.weight || "";
  document.querySelector("#productWeightUnit").value = product.weightUnit || "";
  document.querySelector("#productPrice").value = product.price;
  document.querySelector("#productDesc").value = product.desc || "";
  document.querySelector("#productFormTitle").textContent = "Alterar item";
  document.querySelector("#cancelProductEdit").style.display = "inline-flex";
  document.querySelector("#productName").focus();
}

function deleteProduct(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product || !confirm(`Excluir ${product.name}?`)) return;
  state.products = state.products.filter((item) => item.id !== productId);
  delete state.cart[productId];
  save(STORAGE_KEYS.products, state.products);
  save(STORAGE_KEYS.cart, state.cart);
  render();
}

function addToCart(productId, qty = 1) {
  const current = state.cart[productId] || { qty: 0, checked: false };
  state.cart[productId] = { ...current, qty: current.qty + qty };
  save(STORAGE_KEYS.cart, state.cart);
  render();
}

function changeQty(productId, amount) {
  const current = state.cart[productId];
  if (!current) return;
  const nextQty = current.qty + amount;
  if (nextQty <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = { ...current, qty: nextQty };
  }
  save(STORAGE_KEYS.cart, state.cart);
  render();
}

function toggleChecked(productId) {
  const current = state.cart[productId];
  if (!current) return;
  state.cart[productId] = { ...current, checked: !current.checked };
  save(STORAGE_KEYS.cart, state.cart);
  renderShoppingList();
}

function cartEntries() {
  return Object.entries(state.cart)
    .map(([id, item]) => ({ product: state.products.find((product) => product.id === id), ...item }))
    .filter((item) => item.product && item.qty > 0)
    .sort((a, b) => collator.compare(a.product.category, b.product.category) || collator.compare(a.product.name, b.product.name));
}

function renderShoppingList() {
  const entries = cartEntries();
  shoppingList.innerHTML = "";

  if (!entries.length) {
    shoppingList.innerHTML = '<div class="empty-state">Sua lista de compra ainda está vazia.</div>';
    updateSummary();
    updateWhatsappLink();
    return;
  }

  entries.forEach(({ product, qty, checked }) => {
    const item = document.createElement("article");
    item.className = `shopping-item${checked ? " checked" : ""}`;
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-pressed", String(checked));
    item.setAttribute("aria-label", `${checked ? "Desmarcar" : "Marcar"} ${product.name} como comprado`);
    item.innerHTML = `
      <input type="checkbox" ${checked ? "checked" : ""} aria-label="Marcar ${escapeHtml(product.name)}" />
      <div>
        <h4>${escapeHtml(product.name)}</h4>
        <p>${escapeHtml(product.category)} · ${escapeHtml(unitLabel(product))}</p>
      </div>
      <strong class="shopping-qty">${cleanNumber(qty)} x</strong>
      <strong>${formatCurrency(product.price * qty)}</strong>
    `;
    item.addEventListener("click", () => toggleChecked(product.id));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleChecked(product.id);
      }
    });
    shoppingList.appendChild(item);
  });

  updateSummary();
  updateWhatsappLink();
}

function updateSummary() {
  const entries = cartEntries();
  const totalItems = entries.reduce((sum, item) => sum + item.qty, 0);
  const total = entries.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  document.querySelector("#summaryTotal").textContent = formatCurrency(total);
  document.querySelector("#summaryItems").textContent = `${cleanNumber(totalItems)} ${totalItems === 1 ? "item" : "itens"} na compra`;
}

function shoppingText() {
  const entries = cartEntries();
  const lines = entries.map(({ product, qty, checked }) => {
    const status = checked ? "[x]" : "[ ]";
    return `${status} ${cleanNumber(qty)} x ${product.name} (${product.category}, ${unitLabel(product)}) - ${formatCurrency(product.price * qty)}`;
  });
  const total = entries.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  return [`Lista de compras da padaria`, ...lines, `Total estimado: ${formatCurrency(total)}`].join("\n");
}

function updateWhatsappLink() {
  const entries = cartEntries();
  if (!entries.length) {
    whatsappExport.href = "#";
    whatsappExport.classList.add("disabled");
    return;
  }
  whatsappExport.href = `https://wa.me/?text=${encodeURIComponent(shoppingText())}`;
  whatsappExport.classList.remove("disabled");
}

function finishPurchase() {
  const entries = cartEntries();
  if (!entries.length) return;
  const purchase = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    items: entries.map(({ product, qty }) => ({
      productId: product.id,
      name: product.name,
      category: product.category,
      qty,
      unit: unitLabel(product),
      price: product.price,
      total: product.price * qty,
    })),
  };
  state.purchases.push(purchase);
  state.cart = {};
  save(STORAGE_KEYS.purchases, state.purchases);
  save(STORAGE_KEYS.cart, state.cart);
  render();
  switchTab("relatorios");
}

function parseImportLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[;,]/).map((part) => part.trim());
      return {
        name: parts[0],
        category: parts[1] || "Outros",
        packageQty: Number((parts[2] || "1").replace(",", ".")),
        packageUnit: parts[3] || "un.",
        weight: Number((parts[4] || "0").replace(",", ".")),
        weightUnit: parts[5] || "",
        price: Number((parts[6] || "0").replace(",", ".")),
        desc: parts[7] || "Importado para a lista.",
      };
    })
    .filter((item) => item.name);
}

function importItems(text) {
  const items = parseImportLines(text);
  items.forEach((item) => {
    const existing = state.products.find((product) => collator.compare(product.name, item.name) === 0);
    const product = existing || { ...item, id: uniqueId(item.name) };
    if (!existing) {
      state.products.push(product);
    }
    addToCart(product.id, item.packageQty || 1);
  });
  save(STORAGE_KEYS.products, state.products);
  render();
}

function googleCalendarUrl(order) {
  const start = new Date(`${order.date}T${order.time}`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const stamp = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const details = [
    `Cliente: ${order.customer}`,
    order.phone ? `Telefone: ${order.phone}` : "",
    `Pedido: ${order.items}`,
    order.notes ? `Observações: ${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Encomenda - ${order.customer}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function renderOrders() {
  ordersList.innerHTML = "";

  if (!state.orders.length) {
    ordersList.innerHTML = '<div class="empty-state">Nenhuma encomenda cadastrada.</div>';
    return;
  }

  state.orders
    .slice()
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .forEach((order) => {
      const card = document.createElement("article");
      card.className = "order-card";
      const date = new Date(`${order.date}T${order.time}`);
      card.innerHTML = `
        <header>
          <div>
            <h4>${escapeHtml(order.customer)}</h4>
            <p>${date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</p>
          </div>
          <strong>${escapeHtml(order.phone || "")}</strong>
        </header>
        <p>${escapeHtml(order.items)}</p>
        ${order.notes ? `<p>${escapeHtml(order.notes)}</p>` : ""}
        <footer>
          <a class="calendar-link" href="${googleCalendarUrl(order)}" target="_blank" rel="noopener">
            <span data-icon="calendar"></span>
            Adicionar ao Google Agenda
          </a>
          <button class="danger-link" type="button">Excluir</button>
        </footer>
      `;
      card.querySelector(".danger-link").addEventListener("click", () => {
        state.orders = state.orders.filter((saved) => saved.id !== order.id);
        save(STORAGE_KEYS.orders, state.orders);
        renderOrders();
      });
      hydrateIcons(card);
      ordersList.appendChild(card);
    });
}

function purchaseStats() {
  const stats = new Map();
  state.purchases.forEach((purchase) => {
    purchase.items.forEach((item) => {
      const current = stats.get(item.name) || { name: item.name, category: item.category, qty: 0, total: 0, times: 0 };
      current.qty += item.qty;
      current.total += item.total;
      current.times += 1;
      stats.set(item.name, current);
    });
  });
  return [...stats.values()].sort((a, b) => b.qty - a.qty || collator.compare(a.name, b.name));
}

function renderReports() {
  const totalPurchases = state.purchases.length;
  const totalSpent = state.purchases.reduce((sum, purchase) => sum + purchase.items.reduce((itemSum, item) => itemSum + item.total, 0), 0);
  const totalItems = state.purchases.reduce((sum, purchase) => sum + purchase.items.reduce((itemSum, item) => itemSum + item.qty, 0), 0);
  document.querySelector("#reportCards").innerHTML = `
    <article class="metric-card"><span>Compras finalizadas</span><strong>${totalPurchases}</strong></article>
    <article class="metric-card"><span>Itens comprados</span><strong>${cleanNumber(totalItems)}</strong></article>
    <article class="metric-card"><span>Total registrado</span><strong>${formatCurrency(totalSpent)}</strong></article>
  `;

  const stats = purchaseStats();
  const popular = document.querySelector("#popularItems");
  if (!stats.length) {
    popular.innerHTML = '<div class="empty-state">Finalize uma compra para alimentar o histórico.</div>';
    return;
  }

  popular.innerHTML = stats
    .map((item, index) => {
      const max = stats[0].qty || 1;
      const width = Math.max(8, (item.qty / max) * 100);
      return `
        <article class="popular-item">
          <div>
            <span>${index + 1}</span>
            <div>
              <h4>${escapeHtml(item.name)}</h4>
              <p>${escapeHtml(item.category)} · ${cleanNumber(item.qty)} unidades de compra · ${formatCurrency(item.total)}</p>
            </div>
          </div>
          <div class="bar"><i style="width:${width}%"></i></div>
        </article>
      `;
    })
    .join("");
}

function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tab);
  });
  const titles = {
    insumos: "Selecionar insumos",
    compras: "Checklist da compra",
    encomendas: "Encomendas e agenda",
    relatorios: "Levantamento de compras",
  };
  pageTitle.textContent = titles[tab];
  searchInput.closest(".search-wrap").style.display = tab === "insumos" ? "flex" : "none";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  renderCategories();
  renderProducts();
  renderShoppingList();
  renderOrders();
  renderReports();
  hydrateIcons();
}

document.querySelectorAll(".nav-tab").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

document.querySelector("#productForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const product = productFormData();
  const index = state.products.findIndex((item) => item.id === product.id);
  if (index >= 0) {
    state.products[index] = product;
  } else {
    state.products.push(product);
  }
  save(STORAGE_KEYS.products, state.products);
  resetProductForm();
  render();
});

document.querySelector("#cancelProductEdit").addEventListener("click", resetProductForm);

document.querySelector("#clearCart").addEventListener("click", () => {
  state.cart = {};
  save(STORAGE_KEYS.cart, state.cart);
  render();
});

document.querySelector("#markAllChecked").addEventListener("click", () => {
  Object.keys(state.cart).forEach((id) => {
    state.cart[id].checked = true;
  });
  save(STORAGE_KEYS.cart, state.cart);
  renderShoppingList();
});

document.querySelector("#finishPurchase").addEventListener("click", finishPurchase);

document.querySelector("#importList").addEventListener("click", () => {
  const text = document.querySelector("#importText").value.trim();
  if (!text) return;
  importItems(text);
  document.querySelector("#importText").value = "";
  switchTab("compras");
});

document.querySelector("#importFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = file.name.toLowerCase().endsWith(".docx") ? await readDocxText(file) : await file.text();
    document.querySelector("#importText").value = text;
  } catch (error) {
    alert(error.message || "Não foi possível importar o arquivo.");
  }
});

document.querySelector("#clearHistory").addEventListener("click", () => {
  if (!state.purchases.length || !confirm("Limpar histórico de compras?")) return;
  state.purchases = [];
  save(STORAGE_KEYS.purchases, state.purchases);
  renderReports();
});

document.querySelector("#orderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const order = {
    id: crypto.randomUUID(),
    customer: document.querySelector("#customerName").value.trim(),
    phone: document.querySelector("#customerPhone").value.trim(),
    items: document.querySelector("#orderItems").value.trim(),
    date: document.querySelector("#orderDate").value,
    time: document.querySelector("#orderTime").value,
    notes: document.querySelector("#orderNotes").value.trim(),
  };
  state.orders.push(order);
  save(STORAGE_KEYS.orders, state.orders);
  event.currentTarget.reset();
  renderOrders();
});

resetProductForm();
render();

async function readDocxText(file) {
  const buffer = await file.arrayBuffer();
  const entries = parseZipEntries(buffer);
  const documentEntry = entries.find((entry) => entry.name === "word/document.xml");
  if (!documentEntry) {
    throw new Error("O arquivo Word não possui conteúdo de documento reconhecível.");
  }

  const xmlText = await inflateZipEntry(documentEntry);
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const parserError = xml.querySelector("parsererror");
  if (parserError) {
    throw new Error("Não foi possível ler o texto do arquivo Word.");
  }

  const paragraphs = [...xml.getElementsByTagNameNS("*", "p")]
    .map((paragraph) =>
      [...paragraph.getElementsByTagNameNS("*", "t")]
        .map((node) => node.textContent)
        .join("")
        .trim()
    )
    .filter(Boolean);

  if (!paragraphs.length) {
    throw new Error("O arquivo Word não possui linhas de insumos para importar.");
  }

  return paragraphs.join("\n");
}

function parseZipEntries(buffer) {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const entries = [];
  let endOffset = -1;

  for (let offset = bytes.length - 22; offset >= 0; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endOffset = offset;
      break;
    }
  }

  if (endOffset < 0) {
    throw new Error("O arquivo Word não parece ser um .docx válido.");
  }

  const centralDirectoryOffset = view.getUint32(endOffset + 16, true);
  const totalEntries = view.getUint16(endOffset + 10, true);
  let offset = centralDirectoryOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;

    const compression = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameStart = offset + 46;
    const name = new TextDecoder().decode(bytes.slice(nameStart, nameStart + fileNameLength));

    const localFileNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;

    entries.push({
      name,
      compression,
      compressedSize,
      uncompressedSize,
      data: bytes.slice(dataStart, dataEnd),
    });

    offset = nameStart + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

async function inflateZipEntry(entry) {
  if (entry.compression === 0) {
    return new TextDecoder("utf-8").decode(entry.data);
  }

  if (entry.compression !== 8) {
    throw new Error("Este arquivo Word usa uma compressão não suportada pelo navegador.");
  }

  if (!("DecompressionStream" in window)) {
    throw new Error("Este navegador não consegue descompactar arquivos Word localmente.");
  }

  const stream = new Blob([entry.data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const result = await new Response(stream).arrayBuffer();
  return new TextDecoder("utf-8").decode(result);
}
