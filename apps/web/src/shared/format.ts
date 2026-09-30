const yerevan = "Asia/Yerevan";

export function formatAmd(value: number): string {
  const grouped = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} դրամ`;
}

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("hy-AM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: yerevan,
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: yerevan,
  }).format(new Date(iso));
}

const statusLabels: Record<string, string> = {
  REQUESTED: "Սպասում է",
  CONFIRMED: "Հաստատված",
  CANCELLED: "Չեղարկված",
  COMPLETED: "Ավարտված",
};

export function statusLabel(status: string): string {
  return statusLabels[status] ?? status;
}
