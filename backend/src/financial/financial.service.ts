import { Injectable } from "@nestjs/common";
import { IncomeService } from "../income/income.service";
import { ExpenseService } from "../expense/expense.service";
import { FinancialSummaryDto } from "./dto/financial-summary.dto";
import { RevenueAnalyticsDto } from "./dto/revenue-analytics.dto";
import { BalanceSheetDto } from "./dto/balance-sheet.dto";

@Injectable()
export class FinancialService {
  constructor(
    private incomeService: IncomeService,
    private expenseService: ExpenseService
  ) {}

  async getSummary(): Promise<FinancialSummaryDto> {
    // All users with finances:view permission can see all financial data (company-wide)
    const incomeSummary = await this.incomeService.getSummary(undefined);
    const expenseSummary = await this.expenseService.getSummary(undefined);

    return {
      totalIncome: incomeSummary.total,
      totalExpenses: expenseSummary.total,
      totalBalance: incomeSummary.total - expenseSummary.total,
      incomeSummary,
      expenseSummary,
    };
  }

  async getRevenueAnalytics(): Promise<RevenueAnalyticsDto> {
    // All users with finances:view permission can see all analytics (company-wide)
    const incomes = await this.incomeService.findAll(undefined);
    const expenses = await this.expenseService.findAll(undefined);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;

    // Helper functions
    const formatMonthKey = (year: number, month: number): string => {
      return `${year}-${String(month + 1).padStart(2, "0")}`;
    };

    const formatQuarterKey = (year: number, quarter: number): string => {
      return `Q${quarter} ${year}`;
    };

    const getQuarter = (month: number): number => {
      return Math.floor(month / 3) + 1;
    };

    // Monthly data
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    for (let month = 0; month < 12; month++) {
      const monthKey = formatMonthKey(currentYear, month);
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    incomes.forEach((income) => {
      const date = new Date(income.date);
      if (isNaN(date.getTime())) return;
      const year = date.getFullYear();
      const month = date.getMonth();
      if (year === currentYear) {
        const monthKey = formatMonthKey(year, month);
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].income += income.amount;
        }
      }
    });

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (isNaN(date.getTime())) return;
      const year = date.getFullYear();
      const month = date.getMonth();
      if (year === currentYear) {
        const monthKey = formatMonthKey(year, month);
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].expenses += expense.amount;
        }
      }
    });

    const monthly = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        revenue: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Quarterly data
    const quarterlyData: Record<string, { income: number; expenses: number }> = {};
    for (let quarter = 1; quarter <= 4; quarter++) {
      const quarterKey = formatQuarterKey(currentYear, quarter);
      quarterlyData[quarterKey] = { income: 0, expenses: 0 };
    }

    incomes.forEach((income) => {
      const date = new Date(income.date);
      if (isNaN(date.getTime())) return;
      const year = date.getFullYear();
      const month = date.getMonth();
      if (year === currentYear) {
        const quarter = getQuarter(month);
        const quarterKey = formatQuarterKey(year, quarter);
        if (quarterlyData[quarterKey]) {
          quarterlyData[quarterKey].income += income.amount;
        }
      }
    });

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (isNaN(date.getTime())) return;
      const year = date.getFullYear();
      const month = date.getMonth();
      if (year === currentYear) {
        const quarter = getQuarter(month);
        const quarterKey = formatQuarterKey(year, quarter);
        if (quarterlyData[quarterKey]) {
          quarterlyData[quarterKey].expenses += expense.amount;
        }
      }
    });

    const quarterly = Object.entries(quarterlyData)
      .map(([quarter, data]) => ({
        quarter,
        income: data.income,
        expenses: data.expenses,
        revenue: data.income - data.expenses,
      }))
      .sort((a, b) => a.quarter.localeCompare(b.quarter));

    // Yearly data (last 5 years)
    const yearlyData: Record<string, { income: number; expenses: number }> = {};
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    years.forEach((year) => {
      yearlyData[year.toString()] = { income: 0, expenses: 0 };
    });

    incomes.forEach((income) => {
      const date = new Date(income.date);
      if (isNaN(date.getTime())) return;
      const year = date.getFullYear();
      if (years.includes(year)) {
        yearlyData[year.toString()].income += income.amount;
      }
    });

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (isNaN(date.getTime())) return;
      const year = date.getFullYear();
      if (years.includes(year)) {
        yearlyData[year.toString()].expenses += expense.amount;
      }
    });

    const yearly = Object.entries(yearlyData)
      .map(([year, data]) => ({
        year,
        income: data.income,
        expenses: data.expenses,
        revenue: data.income - data.expenses,
      }))
      .sort((a, b) => b.year.localeCompare(a.year));

    // Calculate growth
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const monthlyGrowth =
      monthly.length >= 2
        ? calculateGrowth(monthly[monthly.length - 1].revenue, monthly[monthly.length - 2].revenue)
        : 0;

    const quarterlyGrowth =
      quarterly.length >= 2
        ? calculateGrowth(
            quarterly[quarterly.length - 1].revenue,
            quarterly[quarterly.length - 2].revenue
          )
        : 0;

    const yearlyGrowth =
      yearly.length >= 2
        ? calculateGrowth(yearly[0].revenue, yearly[1].revenue)
        : 0;

    // Category-wise income breakdown
    const categoryWiseIncomeMap: Record<string, number> = {};
    incomes.forEach((income) => {
      const category = income.category;
      categoryWiseIncomeMap[category] = (categoryWiseIncomeMap[category] || 0) + income.amount;
    });
    const categoryWiseIncome = Object.entries(categoryWiseIncomeMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    // Category-wise expense breakdown
    const categoryWiseExpensesMap: Record<string, number> = {};
    expenses.forEach((expense) => {
      const category = expense.category;
      categoryWiseExpensesMap[category] = (categoryWiseExpensesMap[category] || 0) + expense.amount;
    });
    const categoryWiseExpenses = Object.entries(categoryWiseExpensesMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    // Calculate projections
    // Get last 3 months of net revenue for next quarter projection
    const last3MonthsRevenue = monthly
      .slice(-3)
      .map((m) => m.revenue)
      .filter((r) => r !== 0);
    const averageMonthlyNetRevenue =
      last3MonthsRevenue.length > 0
        ? last3MonthsRevenue.reduce((sum, r) => sum + r, 0) / last3MonthsRevenue.length
        : 0;

    // Get outstanding dues and include them in projections based on due dates
    const outstandingDues = await this.incomeService.getOutstandingDues();
    
    // Calculate next quarter date range (3 months from now)
    const nextQuarterStart = new Date(now);
    nextQuarterStart.setMonth(currentMonth + 1, 1);
    const nextQuarterEnd = new Date(nextQuarterStart);
    nextQuarterEnd.setMonth(nextQuarterStart.getMonth() + 3);
    
    // Calculate next year date range (12 months from now)
    const nextYearStart = new Date(now);
    nextYearStart.setMonth(currentMonth + 1, 1);
    const nextYearEnd = new Date(nextYearStart);
    nextYearEnd.setFullYear(nextYearStart.getFullYear() + 1);
    
    // Filter dues by due date within projection periods
    const duesInNextQuarter = outstandingDues.filter((due) => {
      if (!due.dueDate) return false;
      const dueDate = new Date(due.dueDate);
      return dueDate >= nextQuarterStart && dueDate < nextQuarterEnd;
    });
    
    const duesInNextYear = outstandingDues.filter((due) => {
      if (!due.dueDate) return false;
      const dueDate = new Date(due.dueDate);
      return dueDate >= nextYearStart && dueDate < nextYearEnd;
    });
    
    // Sum up dues amounts
    const duesAmountNextQuarter = duesInNextQuarter.reduce((sum, due) => sum + (due.dueAmount || 0), 0);
    const duesAmountNextYear = duesInNextYear.reduce((sum, due) => sum + (due.dueAmount || 0), 0);
    
    // Add dues to projections
    const nextQuarterProjection = averageMonthlyNetRevenue * 3 + duesAmountNextQuarter;
    const nextYearProjection = averageMonthlyNetRevenue * 12 + duesAmountNextYear;

    return {
      monthly,
      quarterly,
      yearly,
      growth: {
        monthly: monthlyGrowth,
        quarterly: quarterlyGrowth,
        yearly: yearlyGrowth,
      },
      categoryWiseIncome,
      categoryWiseExpenses,
      nextQuarterProjection,
      nextYearProjection,
    };
  }

  async getBalanceSheet(): Promise<BalanceSheetDto> {
    const summary = await this.getSummary();
    return {
      assets: summary.totalIncome,
      liabilities: summary.totalExpenses,
      equity: summary.totalBalance,
    };
  }
}

