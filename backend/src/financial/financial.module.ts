import { Module } from "@nestjs/common";
import { FinancialService } from "./financial.service";
import { FinancialController } from "./financial.controller";
import { IncomeModule } from "../income/income.module";
import { ExpenseModule } from "../expense/expense.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [IncomeModule, ExpenseModule, AuthModule],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}

