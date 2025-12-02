import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { UpdateIncomeDto } from "./dto/update-income.dto";
import { IncomeFiltersDto } from "./dto/income-filters.dto";
import { IncomeSummaryDto } from "./dto/income-summary.dto";

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

  async create(createIncomeDto: CreateIncomeDto, userId?: string) {
    // Handle backward compatibility: if totalAmount is provided, use it; else use amount
    const data: any = {
      ...createIncomeDto,
      date: new Date(createIncomeDto.date),
      userId: userId || null,
    };

    // If totalAmount is provided, set advance/due amounts
    // Otherwise, use existing amount field (backward compatible)
    if (createIncomeDto.totalAmount !== undefined) {
      data.totalAmount = createIncomeDto.totalAmount;
      data.advanceAmount = createIncomeDto.advanceAmount ?? createIncomeDto.totalAmount;
      data.dueAmount = createIncomeDto.dueAmount ?? 0;
      data.isDuePaid = (data.dueAmount === 0 || data.dueAmount === null || data.dueAmount === undefined);
      
      if (createIncomeDto.dueDate) {
        data.dueDate = new Date(createIncomeDto.dueDate);
      }
    } else {
      // Backward compatible: set advanceAmount = amount, dueAmount = 0
      data.advanceAmount = createIncomeDto.amount;
      data.dueAmount = 0;
      data.isDuePaid = true;
    }

    const income = await this.prisma.income.create({
      data,
    });

    return income;
  }

  async findAll(filters?: IncomeFiltersDto) {
    const where: any = {};

    // Note: Removed userId filtering - all users with finances:view permission can see all income
    // userId is still stored when creating records for audit trail purposes

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.source) {
      where.source = { contains: filters.source, mode: "insensitive" };
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

    // Filter by entries with outstanding dues
    if (filters?.hasDues === true) {
      where.isDuePaid = false;
      where.dueAmount = { gt: 0 };
    }

    const incomes = await this.prisma.income.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return incomes;
  }

  async findOne(id: string) {
    const income = await this.prisma.income.findUnique({
      where: { id },
    });

    if (!income) {
      throw new NotFoundException(`Income with ID "${id}" not found`);
    }

    return income;
  }

  async update(id: string, updateIncomeDto: UpdateIncomeDto) {
    const existing = await this.prisma.income.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Income with ID "${id}" not found`);
    }

    const updateData: any = { ...updateIncomeDto };
    if (updateIncomeDto.date) {
      updateData.date = new Date(updateIncomeDto.date);
    }
    if (updateIncomeDto.dueDate) {
      updateData.dueDate = new Date(updateIncomeDto.dueDate);
    }
    if (updateIncomeDto.duePaidDate) {
      updateData.duePaidDate = new Date(updateIncomeDto.duePaidDate);
    }

    const income = await this.prisma.income.update({
      where: { id },
      data: updateData,
    });

    return income;
  }

  async remove(id: string) {
    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income) {
      throw new NotFoundException(`Income with ID "${id}" not found`);
    }

    await this.prisma.income.delete({ where: { id } });
    return { message: `Income entry has been deleted` };
  }

  async getSummary(filters?: IncomeFiltersDto): Promise<IncomeSummaryDto> {
    const incomes = await this.findAll(filters);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);

    const monthly = incomes
      .filter((income) => {
        const date = new Date(income.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, income) => sum + income.amount, 0);

    const quarterly = incomes
      .filter((income) => {
        const date = new Date(income.date);
        return (
          Math.floor(date.getMonth() / 3) === currentQuarter &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, income) => sum + income.amount, 0);

    const yearly = incomes
      .filter((income) => {
        const date = new Date(income.date);
        return date.getFullYear() === currentYear;
      })
      .reduce((sum, income) => sum + income.amount, 0);

    const total = incomes.reduce((sum, income) => sum + income.amount, 0);

    const byCategory: Record<string, number> = {
      SMM: 0,
      Website: 0,
      Ads: 0,
      POS: 0,
      Consultation: 0,
      Freelancing: 0,
      "Wedding Video Invitation": 0,
      "Engagement Video Invitation": 0,
      "Wedding Card Invitation": 0,
      "Engagement Card Invitation": 0,
      "Anniversary Card Invitation": 0,
      "Anniversary Video Invitation": 0,
      "Birthday Wish Video": 0,
      "Birthday Wish Card": 0,
      "Birthday Video Invitation": 0,
      "Birthday Card Invitation": 0,
      Other: 0,
    };

    incomes.forEach((income) => {
      byCategory[income.category] = (byCategory[income.category] || 0) + income.amount;
    });

    return {
      total,
      monthly,
      quarterly,
      yearly,
      byCategory: byCategory as any,
    };
  }

  async markDueAsPaid(id: string, paidDate?: Date) {
    const existing = await this.prisma.income.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Income with ID "${id}" not found`);
    }

    if (!existing.dueAmount || existing.dueAmount === 0) {
      throw new NotFoundException(`Income with ID "${id}" has no outstanding dues`);
    }

    // When dues are paid, add the due amount to the income amount
    // This ensures the paid dues are included in total income calculations
    const updatedAmount = existing.amount + existing.dueAmount;

    const income = await this.prisma.income.update({
      where: { id },
      data: {
        isDuePaid: true,
        duePaidDate: paidDate || new Date(),
        amount: updatedAmount,
        // Set dueAmount to 0 since it's now been paid and added to amount
        dueAmount: 0,
      },
    });

    return income;
  }

  async getOutstandingDues(filters?: IncomeFiltersDto) {
    const where: any = {
      isDuePaid: false,
      dueAmount: { gt: 0 },
    };

    // Apply additional filters if provided
    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.source) {
      where.source = { contains: filters.source, mode: "insensitive" };
    }

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) {
        where.dueDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.dueDate.lte = new Date(filters.endDate);
      }
    }

    const dues = await this.prisma.income.findMany({
      where,
      orderBy: { dueDate: "asc" },
    });

    return dues;
  }
}

