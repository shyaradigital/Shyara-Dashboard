import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { FinancialService } from "./financial.service";
import { FinancialSummaryDto } from "./dto/financial-summary.dto";
import { RevenueAnalyticsDto } from "./dto/revenue-analytics.dto";
import { BalanceSheetDto } from "./dto/balance-sheet.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("financial")
@Controller("financial")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get("summary")
  @Permissions("finances:view")
  @ApiOperation({ summary: "Get financial summary" })
  @ApiResponse({ status: 200, description: "Financial summary", type: FinancialSummaryDto })
  getSummary() {
    // All users with finances:view permission can see all financial summaries (company-wide data)
    return this.financialService.getSummary();
  }

  @Get("analytics")
  @Permissions("finances:view")
  @ApiOperation({ summary: "Get revenue analytics" })
  @ApiResponse({ status: 200, description: "Revenue analytics", type: RevenueAnalyticsDto })
  getAnalytics() {
    // All users with finances:view permission can see all analytics (company-wide data)
    return this.financialService.getRevenueAnalytics();
  }

  @Get("balance-sheet")
  @Permissions("finances:view")
  @ApiOperation({ summary: "Get balance sheet" })
  @ApiResponse({ status: 200, description: "Balance sheet", type: BalanceSheetDto })
  getBalanceSheet() {
    // All users with finances:view permission can see balance sheet (company-wide data)
    return this.financialService.getBalanceSheet();
  }
}

