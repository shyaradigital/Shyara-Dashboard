import { IsBoolean, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateJournalDto {
  @ApiProperty({ example: true, required: false, description: "Update completion status" })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

