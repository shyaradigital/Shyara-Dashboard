import { IsOptional, IsString, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateRoleDto {
  @ApiProperty({ example: "CUSTOM_ROLE", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: ["dashboard:view", "finances:view"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

