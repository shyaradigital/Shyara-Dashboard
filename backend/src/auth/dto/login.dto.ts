import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "admin@shyara.co.in" })
  @IsNotEmpty()
  @IsString()
  identifier: string; // email or userId

  @ApiProperty({ example: "admin" })
  @IsNotEmpty()
  @IsString()
  password: string;
}

