import { IsOptional, IsString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserFiltersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  roleFilter?: string;

  @ApiProperty({ required: false, enum: ["active", "disabled"] })
  @IsOptional()
  @IsEnum(["active", "disabled"])
  statusFilter?: "active" | "disabled";
}

