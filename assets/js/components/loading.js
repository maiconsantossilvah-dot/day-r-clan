export const loading = (count = 3) => `<div class="content-grid" aria-label="Carregando">${Array.from({ length: count }, () => '<div class="skeleton"></div>').join("")}</div>`;
