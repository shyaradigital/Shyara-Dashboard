import { ApiProperty } from "@nestjs/swagger";
import { IncomeCategory } from "./create-income.dto";

export class IncomeSummaryDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  monthly: number;

  @ApiProperty()
  quarterly: number;

  @ApiProperty()
  yearly: number;

  @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
  byCategory: Record<IncomeCategory, number>;
}

