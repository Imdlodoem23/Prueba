# Bebidas · Carta web

Sitio estático de una carta de bebidas: cafés, tés, jugos, smoothies y bebidas sin alcohol.
Incluye búsqueda, filtro por categoría y un pedido con cantidades (guardado en el navegador).

## Ejecutar localmente

No requiere build. Abrí `index.html` en el navegador, o servilo con:

```bash
python3 -m http.server 8000
```

## Editar la carta

Los productos están en el arreglo `DRINKS` de `app.js`. Cada bebida tiene `id`, `name`, `cat`,
`price` (en pesos), `emoji` y `desc`.

## Deploy en Render

Es un **Static Site**:

- Build command: `echo "sin build"`
- Publish directory: `.`
