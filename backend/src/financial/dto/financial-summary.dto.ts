import { ApiProperty } from "@nestjs/swagger";
import { IncomeSummaryDto } from "../../income/dto/income-summary.dto";
import { ExpenseSummaryDto } from "../../expense/dto/expense-summary.dto";

export class FinancialSummaryDto {
  @ApiProperty()
  totalIncome: number;

  @ApiProperty()
  totalExpenses: number;

  @ApiProperty()
  totalBalance: number;

  @ApiProperty({ type: IncomeSummaryDto })
  incomeSummary: IncomeSummaryDto;

  @ApiProperty({ type: ExpenseSummaryDto })
  expenseSummary: ExpenseSummaryDto;
}

