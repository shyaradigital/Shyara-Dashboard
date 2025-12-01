import { ApiProperty } from "@nestjs/swagger";
import { ExpenseCategory } from "./create-expense.dto";

export class ExpenseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: ExpenseCategory })
  category: string;

  @ApiProperty()
  purpose: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

