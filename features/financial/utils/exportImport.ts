import type { Income } from "../types/income"
import type { Expense } from "../types/expense"

export interface FinancialDataExport {
  version: string
  exportedAt: string
  incomes: Income[]
  expenses: Expense[]
}

const EXPORT_VERSION = "1.0.0"

/**
 * Export financial data to JSON file
 */
export function exportFinancialData(incomes: Income[], expenses: Expense[]): void {
  try {
    const exportData: FinancialDataExport = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      incomes,
      expenses,
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `shyara-financial-data-${timestamp}.json`

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting financial data:", error)
    throw new Error("Failed to export financial data")
  }
}

/**
 * Validate imported financial data format
 */
export function validateFinancialData(data: unknown): data is FinancialDataExport {
  if (!data || typeof data !== "object") {
    return false
  }

  const exportData = data as Partial<FinancialDataExport>

  // Check required fields
  if (!exportData.version || !exportData.exportedAt) {
    return false
  }

  // Check arrays exist
  if (!Array.isArray(exportData.incomes) || !Array.isArray(exportData.expenses)) {
    return false
  }

  // Validate income structure
  for (const income of exportData.incomes) {
    if (
      typeof income.amount !== "number" ||
      typeof income.category !== "string" ||
      typeof income.source !== "string" ||
      typeof income.date !== "string"
    ) {
      return false
    }
  }

  // Validate expense structure
  for (const expense of exportData.expenses) {
    if (
      typeof expense.amount !== "number" ||
      typeof expense.category !== "string" ||
      typeof expense.purpose !== "string" ||
      typeof expense.date !== "string"
    ) {
      return false
    }
  }

  return true
}

/**
 * Parse imported JSON file
 */
export function parseFinancialData(file: File): Promise<FinancialDataExport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const data = JSON.parse(text)

        if (!validateFinancialData(data)) {
          reject(new Error("Invalid file format. Please ensure the file was exported from this dashboard."))
          return
        }

        resolve(data)
      } catch (error) {
        reject(new Error("Failed to parse file. Please ensure it's a valid JSON file."))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file."))
    }

    reader.readAsText(file)
  })
}

/**
 * Prepare income data for import (remove IDs and timestamps)
 */
export function prepareIncomeForImport(income: Income): Omit<Income, "id" | "createdAt" | "updatedAt"> {
  return {
    amount: income.amount,
    category: income.category,
    source: income.source,
    description: income.description,
    date: income.date,
  }
}

/**
 * Prepare expense data for import (remove IDs and timestamps)
 */
export function prepareExpenseForImport(expense: Expense): Omit<Expense, "id" | "createdAt" | "updatedAt"> {
  return {
    amount: expense.amount,
    category: expense.category,
    purpose: expense.purpose,
    description: expense.description,
    date: expense.date,
  }
}

