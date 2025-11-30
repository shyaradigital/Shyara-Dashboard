import { incomeService } from "./incomeService"
import { expenseService } from "./expenseService"
import type { FinancialSummary, RevenueAnalytics, BalanceSheet } from "../types/summary"

// Helper to parse date string to Date object
const parseDate = (dateString: string): Date => {
  return new Date(dateString)
}

// Helper to check if date is valid
const isValidDate = (date: Date): boolean => {
  return !isNaN(date.getTime())
}

// Helper to get year and month from date
const getYearMonth = (date: Date): { year: number; month: number } => {
  return {
    year: date.getFullYear(),
    month: date.getMonth(), // 0-11
  }
}

// Helper to get quarter from month (0-11)
const getQuarter = (month: number): number => {
  // Q1 = Jan-Mar (0-2), Q2 = Apr-Jun (3-5), Q3 = Jul-Sep (6-8), Q4 = Oct-Dec (9-11)
  return Math.floor(month / 3) + 1
}

// Helper to format month key (YYYY-MM)
const formatMonthKey = (year: number, month: number): string => {
  return `${year}-${String(month + 1).padStart(2, "0")}`
}

// Helper to format quarter key
const formatQuarterKey = (year: number, quarter: number): string => {
  return `Q${quarter} ${year}`
}

export const financialService = {
  getSummary: (): FinancialSummary => {
    const incomeSummary = incomeService.getSummary()
    const expenseSummary = expenseService.getSummary()

    return {
      totalIncome: incomeSummary.total,
      totalExpenses: expenseSummary.total,
      totalBalance: incomeSummary.total - expenseSummary.total,
      incomeSummary,
      expenseSummary,
    }
  },

  getRevenueAnalytics: (): RevenueAnalytics => {
    const incomes = incomeService.getAll()
    const expenses = expenseService.getAll()
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const currentQuarter = getQuarter(currentMonth)

    // ===========================================
    // MONTHLY DATA - All months with data in current year
    // ===========================================
    const monthlyData: Record<string, { income: number; expenses: number }> = {}

    // Initialize all months for current year
    for (let month = 0; month < 12; month++) {
      const monthKey = formatMonthKey(currentYear, month)
      monthlyData[monthKey] = { income: 0, expenses: 0 }
    }

    // Process income entries
    incomes.forEach((income) => {
      const date = parseDate(income.date)
      if (!isValidDate(date)) return

      const { year, month } = getYearMonth(date)
      const amount = isNaN(income.amount) ? 0 : income.amount

      // Only include current year months
      if (year === currentYear) {
        const monthKey = formatMonthKey(year, month)
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].income += amount
        }
      }
    })

    // Process expense entries
    expenses.forEach((expense) => {
      const date = parseDate(expense.date)
      if (!isValidDate(date)) return

      const { year, month } = getYearMonth(date)
      const amount = isNaN(expense.amount) ? 0 : expense.amount

      // Only include current year months
      if (year === currentYear) {
        const monthKey = formatMonthKey(year, month)
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].expenses += amount
        }
      }
    })

    // Convert to array and sort by month
    const monthly = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        revenue: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // ===========================================
    // QUARTERLY DATA - All quarters with data in current year
    // ===========================================
    const quarterlyData: Record<string, { income: number; expenses: number }> = {}

    // Initialize all quarters for current year
    for (let quarter = 1; quarter <= 4; quarter++) {
      const quarterKey = formatQuarterKey(currentYear, quarter)
      quarterlyData[quarterKey] = { income: 0, expenses: 0 }
    }

    // Process income entries
    incomes.forEach((income) => {
      const date = parseDate(income.date)
      if (!isValidDate(date)) return

      const { year, month } = getYearMonth(date)
      const amount = isNaN(income.amount) ? 0 : income.amount

      // Only include current year
      if (year === currentYear) {
        const quarter = getQuarter(month)
        const quarterKey = formatQuarterKey(year, quarter)
        if (quarterlyData[quarterKey]) {
          quarterlyData[quarterKey].income += amount
        }
      }
    })

    // Process expense entries
    expenses.forEach((expense) => {
      const date = parseDate(expense.date)
      if (!isValidDate(date)) return

      const { year, month } = getYearMonth(date)
      const amount = isNaN(expense.amount) ? 0 : expense.amount

      // Only include current year
      if (year === currentYear) {
        const quarter = getQuarter(month)
        const quarterKey = formatQuarterKey(year, quarter)
        if (quarterlyData[quarterKey]) {
          quarterlyData[quarterKey].expenses += amount
        }
      }
    })

    // Convert to array and sort by quarter
    const quarterly = Object.entries(quarterlyData)
      .map(([quarter, data]) => ({
        quarter,
        income: data.income,
        expenses: data.expenses,
        revenue: data.income - data.expenses,
      }))
      .sort((a, b) => {
        // Sort Q1, Q2, Q3, Q4
        const qA = parseInt(a.quarter.match(/Q(\d+)/)?.[1] || "0")
        const qB = parseInt(b.quarter.match(/Q(\d+)/)?.[1] || "0")
        return qA - qB
      })

    // ===========================================
    // YEARLY DATA - All years with data (last 5 years)
    // ===========================================
    const yearlyData: Record<string, { income: number; expenses: number }> = {}

    // Get all unique years from data
    const allYears = new Set<number>()
    incomes.forEach((income) => {
      const date = parseDate(income.date)
      if (isValidDate(date)) {
        allYears.add(date.getFullYear())
      }
    })
    expenses.forEach((expense) => {
      const date = parseDate(expense.date)
      if (isValidDate(date)) {
        allYears.add(date.getFullYear())
      }
    })

    // Initialize years (current year and up to 4 previous years)
    const yearsToShow = Array.from(allYears)
      .filter((year) => year >= currentYear - 4 && year <= currentYear)
      .sort((a, b) => a - b)

    yearsToShow.forEach((year) => {
      yearlyData[year.toString()] = { income: 0, expenses: 0 }
    })

    // Process income entries
    incomes.forEach((income) => {
      const date = parseDate(income.date)
      if (!isValidDate(date)) return

      const year = date.getFullYear().toString()
      const amount = isNaN(income.amount) ? 0 : income.amount

      if (yearlyData[year]) {
        yearlyData[year].income += amount
      }
    })

    // Process expense entries
    expenses.forEach((expense) => {
      const date = parseDate(expense.date)
      if (!isValidDate(date)) return

      const year = date.getFullYear().toString()
      const amount = isNaN(expense.amount) ? 0 : expense.amount

      if (yearlyData[year]) {
        yearlyData[year].expenses += amount
      }
    })

    // Convert to array and sort by year
    const yearly = Object.entries(yearlyData)
      .map(([year, data]) => ({
        year,
        income: data.income,
        expenses: data.expenses,
        revenue: data.income - data.expenses,
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year))

    // ===========================================
    // GROWTH CALCULATIONS
    // ===========================================

    // Monthly Growth (Month-over-Month)
    let monthlyGrowth = 0
    if (monthly.length >= 2) {
      const currentMonthIndex = currentMonth
      const currentMonthData = monthly[currentMonthIndex]
      const previousMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : null
      const previousMonthData = previousMonthIndex !== null ? monthly[previousMonthIndex] : null

      if (currentMonthData && previousMonthData) {
        const currentRevenue = currentMonthData.revenue
        const previousRevenue = previousMonthData.revenue

        if (previousRevenue !== 0) {
          monthlyGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100
        } else if (currentRevenue > 0) {
          monthlyGrowth = 100
        } else {
          monthlyGrowth = 0
        }
      }
    }

    // Quarterly Growth (Quarter-over-Quarter)
    let quarterlyGrowth = 0
    if (quarterly.length >= 2) {
      const currentQuarterIndex = currentQuarter - 1 // Convert to 0-based index
      const currentQuarterData = quarterly[currentQuarterIndex]
      const previousQuarterIndex = currentQuarterIndex > 0 ? currentQuarterIndex - 1 : null
      const previousQuarterData =
        previousQuarterIndex !== null ? quarterly[previousQuarterIndex] : null

      if (currentQuarterData && previousQuarterData) {
        const currentRevenue = currentQuarterData.revenue
        const previousRevenue = previousQuarterData.revenue

        if (previousRevenue !== 0) {
          quarterlyGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100
        } else if (currentRevenue > 0) {
          quarterlyGrowth = 100
        } else {
          quarterlyGrowth = 0
        }
      }
    }

    // Yearly Growth (Year-over-Year)
    let yearlyGrowth = 0
    if (yearly.length >= 2) {
      const currentYearIndex = yearly.findIndex((y) => y.year === currentYear.toString())
      const previousYearIndex = currentYearIndex > 0 ? currentYearIndex - 1 : null

      const currentYearData = currentYearIndex >= 0 ? yearly[currentYearIndex] : null
      const previousYearData = previousYearIndex !== null ? yearly[previousYearIndex] : null

      if (currentYearData && previousYearData) {
        const currentRevenue = currentYearData.revenue
        const previousRevenue = previousYearData.revenue

        if (previousRevenue !== 0) {
          yearlyGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100
        } else if (currentRevenue > 0) {
          yearlyGrowth = 100
        } else {
          yearlyGrowth = 0
        }
      }
    }

    return {
      monthly,
      quarterly,
      yearly,
      growth: {
        monthly: monthlyGrowth,
        quarterly: quarterlyGrowth,
        yearly: yearlyGrowth,
      },
    }
  },

  getBalanceSheet: (): BalanceSheet => {
    const summary = financialService.getSummary()
    return {
      assets: summary.totalIncome,
      liabilities: summary.totalExpenses,
      equity: summary.totalBalance,
    }
  },
}
