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
import { IncomeService } from "./income.service";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { UpdateIncomeDto } from "./dto/update-income.dto";
import { IncomeFiltersDto } from "./dto/income-filters.dto";
import { IncomeResponseDto } from "./dto/income-response.dto";
import { IncomeSummaryDto } from "./dto/income-summary.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("income")
@Controller("incomes")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @Permissions("finances:edit")
  @ApiOperation({ summary: "Create a new income entry" })
  @ApiResponse({ status: 201, description: "Income created", type: IncomeResponseDto })
  create(@Body() createIncomeDto: CreateIncomeDto, @CurrentUser() user: any) {
    return this.incomeService.create(createIncomeDto, user?.id);
  }

  @Get()
  @Permissions("finances:view")
  @ApiOperation({ summary: "Get all income entries" })
  @ApiResponse({ status: 200, description: "List of incomes", type: [IncomeResponseDto] })
  findAll(@Query() filters: IncomeFiltersDto, @CurrentUser() user: any) {
    return this.incomeService.findAll(filters, user?.id);
  }

  @Get("summary")
  @Permissions("finances:view")
  @ApiOperation({ summary: "Get income summary/analytics" })
  @ApiResponse({ status: 200, description: "Income summary", type: IncomeSummaryDto })
  getSummary(@Query() filters: IncomeFiltersDto, @CurrentUser() user: any) {
    return this.incomeService.getSummary(filters, user?.id);
  }

  @Get(":id")
  @Permissions("finances:view")
  @ApiOperation({ summary: "Get income by ID" })
  @ApiResponse({ status: 200, description: "Income found", type: IncomeResponseDto })
  @ApiResponse({ status: 404, description: "Income not found" })
  findOne(@Param("id") id: string) {
    return this.incomeService.findOne(id);
  }

  @Patch(":id")
  @Permissions("finances:edit")
  @ApiOperation({ summary: "Update income entry" })
  @ApiResponse({ status: 200, description: "Income updated", type: IncomeResponseDto })
  @ApiResponse({ status: 404, description: "Income not found" })
  update(@Param("id") id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
    return this.incomeService.update(id, updateIncomeDto);
  }

  @Delete(":id")
  @Permissions("finances:edit")
  @ApiOperation({ summary: "Delete income entry" })
  @ApiResponse({ status: 200, description: "Income deleted" })
  @ApiResponse({ status: 404, description: "Income not found" })
  remove(@Param("id") id: string) {
    return this.incomeService.remove(id);
  }
}

