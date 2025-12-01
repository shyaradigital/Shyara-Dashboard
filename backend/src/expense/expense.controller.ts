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
import { ExpenseService } from "./expense.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ExpenseFiltersDto } from "./dto/expense-filters.dto";
import { ExpenseResponseDto } from "./dto/expense-response.dto";
import { ExpenseSummaryDto } from "./dto/expense-summary.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("expense")
@Controller("expenses")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @Permissions("finances:edit")
  @ApiOperation({ summary: "Create a new expense entry" })
  @ApiResponse({ status: 201, description: "Expense created", type: ExpenseResponseDto })
  create(@Body() createExpenseDto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expenseService.create(createExpenseDto, user?.id);
  }

  @Get()
  @Permissions("finances:view")
  @ApiOperation({ summary: "Get all expense entries" })
  @ApiResponse({ status: 200, description: "List of expenses", type: [ExpenseResponseDto] })
  findAll(@Query() filters: ExpenseFiltersDto, @CurrentUser() user: any) {
    return this.expenseService.findAll(filters, user?.id);
  }

  @Get("summary")
  @Permissions("finances:view")
  @ApiOperation({ summary: "Get expense summary/analytics" })
  @ApiResponse({ status: 200, description: "Expense summary", type: ExpenseSummaryDto })
  getSummary(@Query() filters: ExpenseFiltersDto, @CurrentUser() user: any) {
    return this.expenseService.getSummary(filters, user?.id);
  }

  @Get(":id")
  @Permissions("finances:view")
  @ApiOperation({ summary: "Get expense by ID" })
  @ApiResponse({ status: 200, description: "Expense found", type: ExpenseResponseDto })
  @ApiResponse({ status: 404, description: "Expense not found" })
  findOne(@Param("id") id: string) {
    return this.expenseService.findOne(id);
  }

  @Patch(":id")
  @Permissions("finances:edit")
  @ApiOperation({ summary: "Update expense entry" })
  @ApiResponse({ status: 200, description: "Expense updated", type: ExpenseResponseDto })
  @ApiResponse({ status: 404, description: "Expense not found" })
  update(@Param("id") id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(":id")
  @Permissions("finances:edit")
  @ApiOperation({ summary: "Delete expense entry" })
  @ApiResponse({ status: 200, description: "Expense deleted" })
  @ApiResponse({ status: 404, description: "Expense not found" })
  remove(@Param("id") id: string) {
    return this.expenseService.remove(id);
  }
}

