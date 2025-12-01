import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  user: {
    id: string;
    userId: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
}

