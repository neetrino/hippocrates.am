const yerevan = "Asia/Yerevan";

export function formatAmd(value: number): string {
  return `${new Intl.NumberFormat("hy-AM").format(value)} դրամ`;
}

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("hy-AM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: yerevan,
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("hy-AM", {
    hour: "2-digit",
    minute: "2-digit",
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
