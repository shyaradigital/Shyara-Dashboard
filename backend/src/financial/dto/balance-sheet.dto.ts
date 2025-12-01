import { ApiProperty } from "@nestjs/swagger";

export class BalanceSheetDto {
  @ApiProperty()
  assets: number;

  @ApiProperty()
  liabilities: number;

  @ApiProperty()
  equity: number;
}

