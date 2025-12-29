import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum, MaxLength, IsUUID, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum JournalType {
  TASK = "TASK",
  NOTE = "NOTE",
}

export class CreateJournalDto {
  @ApiProperty({ example: "Complete project documentation" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, { message: "Title must be less than 200 characters" })
  title: string;

  @ApiProperty({ example: "Need to document all API endpoints and update README" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000, { message: "Content must be less than 5000 characters" })
  content: string;

  @ApiProperty({ example: "TASK", enum: JournalType })
  @IsNotEmpty()
  @IsEnum(JournalType)
  type: JournalType;

  @ApiProperty({ example: "2024-12-31T00:00:00.000Z", required: false })
  @IsOptional()
  @IsDateString({}, { message: "Deadline must be a valid date" })
  deadline?: string;

  @ApiProperty({ example: "user-id-123", required: false })
  @IsOptional()
  @ValidateIf((o) => o.assignedToId !== undefined && o.assignedToId !== null && o.assignedToId !== "")
  @IsString()
  @IsUUID(4, { message: "Assigned user ID must be a valid UUID" })
  assignedToId?: string | null;
}

