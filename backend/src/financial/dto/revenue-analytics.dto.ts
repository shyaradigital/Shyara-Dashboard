import { ApiProperty } from "@nestjs/swagger";

export class MonthlyDataDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  income: number;

  @ApiProperty()
  expenses: number;

  @ApiProperty()
  revenue: number;
}

export class QuarterlyDataDto {
  @ApiProperty()
  quarter: string;

  @ApiProperty()
  income: number;

  @ApiProperty()
  expenses: number;

  @ApiProperty()
  revenue: number;
}

export class YearlyDataDto {
  @ApiProperty()
  year: string;

  @ApiProperty()
  income: number;

  @ApiProperty()
  expenses: number;

  @ApiProperty()
  revenue: number;
}

export class GrowthDto {
  @ApiProperty()
  monthly: number;

  @ApiProperty()
  quarterly: number;

  @ApiProperty()
  yearly: number;
}

export class CategoryWiseDataDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  total: number;
}

export class RevenueAnalyticsDto {
  @ApiProperty({ type: [MonthlyDataDto] })
  monthly: MonthlyDataDto[];

  @ApiProperty({ type: [QuarterlyDataDto] })
  quarterly: QuarterlyDataDto[];

  @ApiProperty({ type: [YearlyDataDto] })
  yearly: YearlyDataDto[];

  @ApiProperty({ type: GrowthDto })
  growth: GrowthDto;

  @ApiProperty({ type: [CategoryWiseDataDto] })
  categoryWiseIncome: CategoryWiseDataDto[];

  @ApiProperty({ type: [CategoryWiseDataDto] })
  categoryWiseExpenses: CategoryWiseDataDto[];

  @ApiProperty()
  nextQuarterProjection: number;

  @ApiProperty()
  nextYearProjection: number;
}

