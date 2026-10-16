const DRINKS = [
  { id: "espresso", name: "Espresso", cat: "Café", price: 2500, emoji: "☕", desc: "Shot intenso de café de origen." },
  { id: "capuccino", name: "Capuccino", cat: "Café", price: 3500, emoji: "☕", desc: "Espresso con leche vaporizada y espuma." },
  { id: "latte", name: "Latte vainilla", cat: "Café", price: 3800, emoji: "🥛", desc: "Suave, con jarabe de vainilla." },
  { id: "cold-brew", name: "Cold brew", cat: "Café", price: 4200, emoji: "🧊", desc: "Infusión en frío de 18 horas." },
  { id: "te-verde", name: "Té verde", cat: "Té", price: 2800, emoji: "🍵", desc: "Té verde japonés con limón." },
  { id: "chai", name: "Chai latte", cat: "Té", price: 3600, emoji: "🫖", desc: "Especias cálidas con leche." },
  { id: "te-frutos", name: "Té de frutos rojos", cat: "Té", price: 3000, emoji: "🍓", desc: "Infusión sin cafeína, dulce y ácida." },
  { id: "jugo-naranja", name: "Jugo de naranja", cat: "Jugos", price: 3200, emoji: "🍊", desc: "Exprimido al momento, 100% natural." },
  { id: "jugo-verde", name: "Jugo verde", cat: "Jugos", price: 3900, emoji: "🥬", desc: "Manzana, pepino, jengibre y limón." },
  { id: "limonada", name: "Limonada menta", cat: "Jugos", price: 3000, emoji: "🍋", desc: "Limón, menta fresca y hielo." },
  { id: "smoothie-mango", name: "Smoothie mango", cat: "Smoothies", price: 4500, emoji: "🥭", desc: "Mango, maracuyá y yogur natural." },
  { id: "smoothie-berry", name: "Smoothie berries", cat: "Smoothies", price: 4700, emoji: "🫐", desc: "Frutos rojos con avena." },
  { id: "smoothie-cacao", name: "Smoothie cacao", cat: "Smoothies", price: 4800, emoji: "🍫", desc: "Cacao puro, plátano y leche de almendras." },
  { id: "mocktail-mojito", name: "Mojito sin alcohol", cat: "Sin alcohol", price: 4000, emoji: "🌿", desc: "Lima, hierbabuena y soda." },
  { id: "virgin-colada", name: "Piña colada virgen", cat: "Sin alcohol", price: 4600, emoji: "🍍", desc: "Piña, coco y crema, sin alcohol." },
  { id: "agua", name: "Agua con gas", cat: "Sin alcohol", price: 1800, emoji: "💧", desc: "Botella de 500 ml." },
];

const CATEGORIES = ["Todas", ...new Set(DRINKS.map((d) => d.cat))];
const fmt = (n) => "$" + n.toLocaleString("es-AR");

const state = { cat: "Todas", query: "", cart: JSON.parse(localStorage.getItem("cart") || "{}") };

const $ = (sel) => document.querySelector(sel);
const menu = $("#menu");
const filters = $("#filters");
const cartEl = $("#cart");

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
    card.querySelector("h3").textContent = d.name;
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
}

function bumpBadge() {
  const badge = $("#cart-count");
  badge.classList.remove("bump");
  void badge.offsetWidth; // reinicia la animación
  badge.classList.add("bump");
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

$("#search").addEventListener("input", (e) => {
  state.query = e.target.value;
  renderMenu();
});
$("#cart-btn").addEventListener("click", () => (cartEl.hidden = !cartEl.hidden));
$("#cart-close").addEventListener("click", () => (cartEl.hidden = true));
$("#clear-cart").addEventListener("click", () => {
  state.cart = {};
  saveCart();
  renderCart();
});
$("#year").textContent = new Date().getFullYear();

renderFilters();
renderMenu();
renderCart();
