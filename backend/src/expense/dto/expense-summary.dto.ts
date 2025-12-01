import { ApiProperty } from "@nestjs/swagger";
import { ExpenseCategory } from "./create-expense.dto";

export class ExpenseSummaryDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  monthly: number;

  @ApiProperty()
  quarterly: number;

  @ApiProperty()
  yearly: number;

  @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
  byCategory: Record<ExpenseCategory, number>;
}

