export function toLocalIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIso() {
  return toLocalIsoDate();
}

export function parseLocalIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function addLocalDays(isoDate: string, days: number) {
  const date = parseLocalIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return toLocalIsoDate(date);
}

export function isSameLocalIsoDate(value: string | null | undefined, isoDate: string) {
  if (!value) return false;
  return value.slice(0, 10) === isoDate;
}
