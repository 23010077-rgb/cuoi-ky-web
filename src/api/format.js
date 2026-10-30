export const vnd = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n ?? 0);

export const isoDate = (d) => d.toISOString().slice(0, 10);

export const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoDate(d);
};

export const nightsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
