import { ApiProperty } from "@nestjs/swagger";
import { JournalType } from "./create-journal.dto";

export class JournalResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: JournalType })
  type: JournalType;

  @ApiProperty({ required: false })
  deadline?: Date;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdById: string;

  @ApiProperty({ required: false })
  assignedToId?: string;

  @ApiProperty({ required: false })
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({ required: false })
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
}

