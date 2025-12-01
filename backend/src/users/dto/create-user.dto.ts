import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "john.doe" })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: "John Doe" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: "john@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+1234567890", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: "password123" })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: "ADMIN", enum: ["ADMIN", "MANAGER"] })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({ example: "active", enum: ["active", "disabled"] })
  @IsNotEmpty()
  @IsEnum(["active", "disabled"])
  status: "active" | "disabled";
}

