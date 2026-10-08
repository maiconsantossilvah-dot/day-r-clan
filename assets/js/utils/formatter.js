const numberFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const formatNumber = value => numberFormatter.format(Number(value || 0));
export const formatDate = value => value ? dateFormatter.format(new Date(value)) : "—";
export const formatDateTime = value => value ? dateTimeFormatter.format(new Date(value)) : "—";
export const formatRelative = value => {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.max(0, Math.round(diff / 3600000));
  if (hours < 1) return "agora";
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return `há ${days} dia${days === 1 ? "" : "s"}`;
};
