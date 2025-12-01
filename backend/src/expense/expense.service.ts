import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ExpenseFiltersDto } from "./dto/expense-filters.dto";
import { ExpenseSummaryDto } from "./dto/expense-summary.dto";

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto, userId?: string) {
    const expense = await this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        date: new Date(createExpenseDto.date),
        userId: userId || null,
      },
    });

    return expense;
  }

  async findAll(filters?: ExpenseFiltersDto) {
    const where: any = {};

    // Note: Removed userId filtering - all users with finances:view permission can see all expenses
    // userId is still stored when creating records for audit trail purposes

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.purpose) {
      where.purpose = { contains: filters.purpose, mode: "insensitive" };
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return expenses;
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const existing = await this.prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }

    const updateData: any = { ...updateExpenseDto };
    if (updateExpenseDto.date) {
      updateData.date = new Date(updateExpenseDto.date);
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data: updateData,
    });

    return expense;
  }

  async remove(id: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }

    await this.prisma.expense.delete({ where: { id } });
    return { message: `Expense entry has been deleted` };
  }

  async getSummary(filters?: ExpenseFiltersDto): Promise<ExpenseSummaryDto> {
    const expenses = await this.findAll(filters);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);

    const monthly = expenses
      .filter((expense) => {
        const date = new Date(expense.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const quarterly = expenses
      .filter((expense) => {
        const date = new Date(expense.date);
        return (
          Math.floor(date.getMonth() / 3) === currentQuarter &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const yearly = expenses
      .filter((expense) => {
        const date = new Date(expense.date);
        return date.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const byCategory: Record<string, number> = {
      Salaries: 0,
      Subscriptions: 0,
      Rent: 0,
      Software: 0,
      Hardware: 0,
      Travel: 0,
      Utilities: 0,
      Misc: 0,
    };

    expenses.forEach((expense) => {
      byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
    });

    return {
      total,
      monthly,
      quarterly,
      yearly,
      byCategory: byCategory as any,
    };
  }
}

