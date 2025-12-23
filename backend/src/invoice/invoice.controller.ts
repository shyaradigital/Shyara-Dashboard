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
import { InvoiceService } from "./invoice.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { InvoiceFiltersDto } from "./dto/invoice-filters.dto";
import { InvoiceResponseDto } from "./dto/invoice-response.dto";
import { InvoiceStatsDto } from "./dto/invoice-stats.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("invoices")
@Controller("invoices")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Permissions("invoices:create")
  @ApiOperation({ summary: "Create a new invoice" })
  @ApiResponse({ status: 201, description: "Invoice created", type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: "Bad request - invoice number already exists" })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoiceService.create(createInvoiceDto, user?.id);
  }

  @Get()
  @Permissions("invoices:view")
  @ApiOperation({ summary: "Get all invoices" })
  @ApiResponse({ status: 200, description: "List of invoices", type: [InvoiceResponseDto] })
  findAll(@Query() filters: InvoiceFiltersDto) {
    return this.invoiceService.findAll(filters);
  }

  @Get("stats")
  @Permissions("invoices:view")
  @ApiOperation({ summary: "Get invoice statistics" })
  @ApiResponse({ status: 200, description: "Invoice statistics", type: InvoiceStatsDto })
  getStats() {
    return this.invoiceService.getStats();
  }

  @Get("next-number/:businessUnit")
  @Permissions("invoices:view")
  @ApiOperation({ summary: "Get next available invoice number for a business unit" })
  @ApiResponse({ status: 200, description: "Next invoice number", example: "STS/SD/2025/1611" })
  getNextInvoiceNumber(@Param("businessUnit") businessUnit: string) {
    return this.invoiceService.getNextInvoiceNumber(businessUnit);
  }

  @Get(":id")
  @Permissions("invoices:view")
  @ApiOperation({ summary: "Get invoice by ID" })
  @ApiResponse({ status: 200, description: "Invoice found", type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  findOne(@Param("id") id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(":id")
  @Permissions("invoices:edit")
  @ApiOperation({ summary: "Update invoice" })
  @ApiResponse({ status: 200, description: "Invoice updated", type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiResponse({ status: 400, description: "Bad request - invoice number conflict" })
  update(@Param("id") id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(":id")
  @Permissions("invoices:delete")
  @ApiOperation({ summary: "Delete invoice" })
  @ApiResponse({ status: 200, description: "Invoice deleted" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  remove(@Param("id") id: string) {
    return this.invoiceService.remove(id);
  }
}

