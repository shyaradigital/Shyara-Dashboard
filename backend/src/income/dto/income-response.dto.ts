import { ApiProperty } from "@nestjs/swagger";
import { IncomeCategory } from "./create-income.dto";

export class IncomeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: IncomeCategory })
  category: string;

  @ApiProperty()
  source: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Advance payment and dues fields
  @ApiProperty({ required: false })
  totalAmount?: number;

  @ApiProperty({ required: false })
  advanceAmount?: number;

  @ApiProperty({ required: false })
  dueAmount?: number;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  isDuePaid?: boolean;

  @ApiProperty({ required: false })
  duePaidDate?: Date;
}

