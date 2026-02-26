import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null) return "$0";
  const num = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "No Date";
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  } catch (e) {
    return "Invalid Date";
  }
}

export function formatTime(timeString: string | undefined): string {
  if (!timeString) return "";
  try {
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const formattedMinutes = minutes.length < 2 ? `0${minutes}` : minutes;
    return `${h12}:${formattedMinutes} ${ampm}`;
  } catch (e) {
    return "";
  }
}
