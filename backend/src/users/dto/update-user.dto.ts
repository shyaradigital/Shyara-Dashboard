import { IsEmail, IsOptional, IsString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiProperty({ example: "john.doe", required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "john@example.com", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: "+1234567890", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: "password123", required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: "ADMIN", enum: ["ADMIN", "MANAGER"], required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: "active", enum: ["active", "disabled"], required: false })
  @IsOptional()
  @IsEnum(["active", "disabled"])
  status?: "active" | "disabled";
}

