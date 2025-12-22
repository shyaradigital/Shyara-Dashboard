/**
 * Format number as Indian currency (₹ 50,000.00)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "₹ 0.00"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format number as Indian currency without symbol (50,000.00)
 */
export function formatCurrencyNumber(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return "0.00"
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date to DD/MM/YYYY format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return ""

  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Get today's date in DD/MM/YYYY format
 */
export function getTodayDate(): string {
  return formatDate(new Date())
}

/**
 * Convert YYYY-MM-DD to DD/MM/YYYY
 */
export function convertDateFormat(dateString: string): string {
  if (!dateString || typeof dateString !== "string") return ""
  const parts = dateString.split("-")
  if (parts.length !== 3) return dateString
  // Validate date parts are numbers
  if (parts.some((p) => isNaN(Number(p)))) return dateString
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD (for input fields)
 */
export function convertToInputDate(dateString: string): string {
  if (!dateString || typeof dateString !== "string") return ""
  const parts = dateString.split("/")
  if (parts.length !== 3) return dateString
  // Validate date parts are numbers
  if (parts.some((p) => isNaN(Number(p)))) return dateString
  return `${parts[2]}-${parts[1]}-${parts[0]}`
}

