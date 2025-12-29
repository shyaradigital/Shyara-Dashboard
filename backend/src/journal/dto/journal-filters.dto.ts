import { IsOptional, IsString, IsDateString, IsEnum, IsBoolean, IsUUID, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { JournalType } from "./create-journal.dto";

export class JournalFiltersDto {
  @ApiProperty({ required: false, enum: JournalType })
  @IsOptional()
  @IsEnum(JournalType)
  type?: JournalType;

  @ApiProperty({ required: false, description: "Filter by assigned user ID" })
  @IsOptional()
  @ValidateIf((o) => o.assignedToId !== undefined && o.assignedToId !== null && o.assignedToId !== "")
  @IsString()
  @IsUUID(4, { message: "Assigned user ID must be a valid UUID" })
  assignedToId?: string | null;

  @ApiProperty({ required: false, description: "Filter by creator user ID" })
  @IsOptional()
  @ValidateIf((o) => o.createdById !== undefined && o.createdById !== null && o.createdById !== "")
  @IsString()
  @IsUUID(4, { message: "Creator user ID must be a valid UUID" })
  createdById?: string | null;

  @ApiProperty({ required: false, description: "Filter by completion status" })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ required: false, description: "Filter by creation date start" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: "Filter by creation date end" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: "Filter by near deadlines (within 7 days)" })
  @IsOptional()
  @IsBoolean()
  nearDeadlines?: boolean;

  @ApiProperty({ required: false, description: "Filter by overdue items (deadline passed and not completed)" })
  @IsOptional()
  @IsBoolean()
  overdue?: boolean;

  @ApiProperty({ required: false, description: "Search by title or content" })
  @IsOptional()
  @IsString()
  search?: string;
}

