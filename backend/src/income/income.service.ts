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
    const income = await this.prisma.income.create({
      data: {
        ...createIncomeDto,
        date: new Date(createIncomeDto.date),
        userId: userId || null,
      },
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
}

