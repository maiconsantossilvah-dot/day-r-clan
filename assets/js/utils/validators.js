export const required = (value, label = "Campo") => String(value ?? "").trim() ? "" : `${label} é obrigatório.`;
export const nonNegative = (value, label = "Quantidade") => Number.isFinite(Number(value)) && Number(value) >= 0 ? "" : `${label} deve ser zero ou maior.`;
export const positive = (value, label = "Quantidade") => Number.isFinite(Number(value)) && Number(value) > 0 ? "" : `${label} deve ser maior que zero.`;
export const validUrl = value => { if (!value) return ""; try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? "" : "Use uma URL http ou https."; } catch { return "URL inválida."; } };
export function validateImport(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "O arquivo deve conter um objeto JSON.";
  const requiredCollections = ["items","inventories","requests","trades","tutorials","members"];
  const missing = requiredCollections.filter(key => !Array.isArray(data[key]));
  return missing.length ? `Estrutura inválida. Coleções ausentes: ${missing.join(", ")}.` : "";
}
