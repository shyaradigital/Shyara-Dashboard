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
}

