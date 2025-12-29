import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { JournalService } from "./journal.service";
import { CreateJournalDto } from "./dto/create-journal.dto";
import { UpdateJournalDto } from "./dto/update-journal.dto";
import { JournalFiltersDto } from "./dto/journal-filters.dto";
import { JournalResponseDto } from "./dto/journal-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("journal")
@Controller("journals")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @Permissions("journal:edit")
  @ApiOperation({ summary: "Create a new journal entry (admin only)" })
  @ApiResponse({ status: 201, description: "Journal entry created", type: JournalResponseDto })
  create(@Body() createJournalDto: CreateJournalDto, @CurrentUser() user: any) {
    return this.journalService.create(createJournalDto, user?.id);
  }

  @Get()
  @Permissions("journal:view")
  @ApiOperation({ summary: "Get all journal entries with filters" })
  @ApiResponse({ status: 200, description: "List of journal entries", type: [JournalResponseDto] })
  findAll(@Query() filters: JournalFiltersDto) {
    return this.journalService.findAll(filters);
  }

  @Get(":id")
  @Permissions("journal:view")
  @ApiOperation({ summary: "Get journal entry by ID" })
  @ApiResponse({ status: 200, description: "Journal entry found", type: JournalResponseDto })
  @ApiResponse({ status: 404, description: "Journal entry not found" })
  findOne(@Param("id") id: string) {
    return this.journalService.findOne(id);
  }

  @Patch(":id/status")
  @Permissions("journal:edit")
  @ApiOperation({ summary: "Update journal entry status (creator only)" })
  @ApiResponse({ status: 200, description: "Status updated", type: JournalResponseDto })
  @ApiResponse({ status: 403, description: "Only creator can update status" })
  @ApiResponse({ status: 404, description: "Journal entry not found" })
  updateStatus(
    @Param("id") id: string,
    @Body() updateJournalDto: UpdateJournalDto,
    @CurrentUser() user: any
  ) {
    return this.journalService.updateStatus(id, updateJournalDto, user?.id);
  }

  @Delete(":id")
  @Permissions("journal:edit")
  @ApiOperation({ summary: "Delete journal entry (admin only)" })
  @ApiResponse({ status: 200, description: "Journal entry deleted" })
  @ApiResponse({ status: 404, description: "Journal entry not found" })
  remove(@Param("id") id: string) {
    return this.journalService.remove(id);
  }
}

