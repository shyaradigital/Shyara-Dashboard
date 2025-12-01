import { IsNotEmpty, IsString, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRoleDto {
  @ApiProperty({ example: "CUSTOM_ROLE" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: ["dashboard:view", "finances:view"],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

