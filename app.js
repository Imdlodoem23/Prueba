const DRINKS = [
  { id: "espresso", name: "Espresso", cat: "Café", price: 2500, emoji: "☕", desc: "Shot intenso de café de origen." },
  { id: "americano", name: "Americano", cat: "Café", price: 2900, emoji: "☕", desc: "Espresso doble con agua caliente." },
  { id: "capuccino", name: "Capuccino", cat: "Café", price: 3500, emoji: "☕", desc: "Espresso con leche vaporizada y espuma.", tag: "Popular" },
  { id: "latte", name: "Latte vainilla", cat: "Café", price: 3800, emoji: "🥛", desc: "Suave, con jarabe de vainilla." },
  { id: "cold-brew", name: "Cold brew", cat: "Café", price: 4200, emoji: "🧊", desc: "Infusión en frío de 18 horas." },
  { id: "te-verde", name: "Té verde", cat: "Té", price: 2800, emoji: "🍵", desc: "Té verde japonés con limón." },
  { id: "matcha", name: "Matcha latte", cat: "Té", price: 4300, emoji: "🍵", desc: "Matcha ceremonial con leche de avena.", tag: "Nuevo" },
  { id: "chai", name: "Chai latte", cat: "Té", price: 3600, emoji: "🫖", desc: "Especias cálidas con leche." },
  { id: "te-frutos", name: "Té de frutos rojos", cat: "Té", price: 3000, emoji: "🍓", desc: "Infusión sin cafeína, dulce y ácida." },
  { id: "jugo-naranja", name: "Jugo de naranja", cat: "Jugos", price: 3200, emoji: "🍊", desc: "Exprimido al momento, 100% natural." },
  { id: "jugo-verde", name: "Jugo verde", cat: "Jugos", price: 3900, emoji: "🥬", desc: "Manzana, pepino, jengibre y limón." },
  { id: "limonada", name: "Limonada menta", cat: "Jugos", price: 3000, emoji: "🍋", desc: "Limón, menta fresca y hielo.", tag: "Popular" },
  { id: "limonada-coco", name: "Limonada de coco", cat: "Jugos", price: 3400, emoji: "🥥", desc: "Limón con agua de coco y hielo.", tag: "Nuevo" },
  { id: "smoothie-mango", name: "Smoothie mango", cat: "Smoothies", price: 4500, emoji: "🥭", desc: "Mango, maracuyá y yogur natural." },
  { id: "smoothie-berry", name: "Smoothie berries", cat: "Smoothies", price: 4700, emoji: "🫐", desc: "Frutos rojos con avena." },
  { id: "smoothie-cacao", name: "Smoothie cacao", cat: "Smoothies", price: 4800, emoji: "🍫", desc: "Cacao puro, plátano y leche de almendras." },
  { id: "batido-fresa", name: "Batido de fresa", cat: "Smoothies", price: 4400, emoji: "🍓", desc: "Fresas frescas, leche y un toque de vainilla." },
  { id: "mocktail-mojito", name: "Mojito sin alcohol", cat: "Sin alcohol", price: 4000, emoji: "🌿", desc: "Lima, hierbabuena y soda." },
  { id: "virgin-colada", name: "Piña colada virgen", cat: "Sin alcohol", price: 4600, emoji: "🍍", desc: "Piña, coco y crema, sin alcohol.", tag: "Popular" },
  { id: "agua", name: "Agua con gas", cat: "Sin alcohol", price: 1800, emoji: "💧", desc: "Botella de 500 ml." },
];

const CATEGORIES = ["Todas", ...new Set(DRINKS.map((d) => d.cat))];
const SORTERS = {
  "precio-asc": (a, b) => a.price - b.price,
  "precio-desc": (a, b) => b.price - a.price,
  nombre: (a, b) => a.name.localeCompare(b.name, "es"),
};
const fmt = (n) => "$" + n.toLocaleString("es-AR");

const state = {
  cat: "Todas",
  query: "",
  sort: "relevancia",
  cart: JSON.parse(localStorage.getItem("cart") || "{}"),
};

const $ = (sel) => document.querySelector(sel);
const menu = $("#menu");
const filters = $("#filters");
const cartEl = $("#cart");
const toastEl = $("#toast");

function saveCart() {
  try { localStorage.setItem("cart", JSON.stringify(state.cart)); } catch {}
}

function renderFilters() {
  filters.innerHTML = "";
  for (const c of CATEGORIES) {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = c;
    b.setAttribute("aria-pressed", String(c === state.cat));
    b.addEventListener("click", () => {
      state.cat = c;
      renderFilters();
      renderMenu();
    });
    filters.appendChild(b);
  }
}

function renderMenu() {
  const q = state.query.trim().toLowerCase();
  const list = DRINKS.filter(
    (d) =>
      (state.cat === "Todas" || d.cat === state.cat) &&
      (!q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q))
  );
  if (SORTERS[state.sort]) list.sort(SORTERS[state.sort]);

  $("#result-count").textContent = `${list.length} ${list.length === 1 ? "bebida" : "bebidas"}`;
  menu.innerHTML = "";
  if (!list.length) {
    menu.innerHTML = '<p class="empty">No encontramos bebidas con esa búsqueda.</p>';
    return;
  }
  for (const [i, d] of list.entries()) {
    const card = document.createElement("article");
    card.className = "drink";
    card.style.setProperty("--i", i);
    card.innerHTML = `
      <div class="emoji" aria-hidden="true">${d.emoji}</div>
      <h3></h3>
      <p></p>
      <div class="drink-foot">
        <span class="price">${fmt(d.price)}</span>
        <button class="add-btn" type="button">Agregar</button>
      </div>`;
    const title = card.querySelector("h3");
    title.textContent = d.name;
    if (d.tag) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = d.tag;
      title.appendChild(tag);
    }
    card.querySelector("p").textContent = d.desc;
    card.querySelector(".add-btn").addEventListener("click", () => addToCart(d.id));
    menu.appendChild(card);
  }
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  renderCart();
  bumpBadge();
  showToast(`Agregaste ${DRINKS.find((d) => d.id === id).name}`);
}

function bumpBadge() {
  const badge = $("#cart-count");
  badge.classList.remove("bump");
  void badge.offsetWidth; // reinicia la animación
  badge.classList.add("bump");
}

let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
}

function changeQty(id, delta) {
  const next = (state.cart[id] || 0) + delta;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = next;
  saveCart();
  renderCart();
}

function renderCart() {
  const items = $("#cart-items");
  items.innerHTML = "";
  let count = 0;
  let total = 0;
  for (const [id, qty] of Object.entries(state.cart)) {
    const d = DRINKS.find((x) => x.id === id);
    if (!d) continue;
    count += qty;
    total += qty * d.price;
    const li = document.createElement("li");
    li.innerHTML = `
      <span></span>
      <span class="qty">
        <button type="button" aria-label="Quitar uno">−</button>
        <span>${qty}</span>
        <button type="button" aria-label="Agregar uno">+</button>
      </span>`;
    li.querySelector("span").textContent = `${d.name} · ${fmt(qty * d.price)}`;
    const [minus, plus] = li.querySelectorAll("button");
    minus.addEventListener("click", () => changeQty(id, -1));
    plus.addEventListener("click", () => changeQty(id, 1));
    items.appendChild(li);
  }
  if (!count) items.innerHTML = "<li>Tu pedido está vacío.</li>";
  $("#cart-count").textContent = count;
  $("#cart-total").textContent = fmt(total);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("#theme-btn").textContent = theme === "dark" ? "☀️" : "🌙";
}

function currentTheme() {
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  return document.documentElement.dataset.theme || (dark ? "dark" : "light");
}

$("#search").addEventListener("input", (e) => {
  state.query = e.target.value;
  renderMenu();
});
$("#sort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderMenu();
});
$("#theme-btn").addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch {}
});
$("#cart-btn").addEventListener("click", () => (cartEl.hidden = !cartEl.hidden));
$("#cart-close").addEventListener("click", () => (cartEl.hidden = true));
$("#clear-cart").addEventListener("click", () => {
  state.cart = {};
  saveCart();
  renderCart();
});
$("#confirm-order").addEventListener("click", () => {
  if (!Object.keys(state.cart).length) return showToast("Tu pedido está vacío");
  const number = Math.floor(1000 + Math.random() * 9000);
  state.cart = {};
  saveCart();
  renderCart();
  cartEl.hidden = true;
  showToast(`¡Pedido #${number} confirmado! Gracias 🥤`);
});
$("#year").textContent = new Date().getFullYear();

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch {}
if (savedTheme) applyTheme(savedTheme);
else applyTheme(currentTheme());

renderFilters();
renderMenu();
renderCart();
