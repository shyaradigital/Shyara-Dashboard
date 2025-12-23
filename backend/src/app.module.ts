import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { RolesModule } from "./roles/roles.module";
import { IncomeModule } from "./income/income.module";
import { ExpenseModule } from "./expense/expense.module";
import { FinancialModule } from "./financial/financial.module";
import { InvoiceModule } from "./invoice/invoice.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    IncomeModule,
    ExpenseModule,
    FinancialModule,
    InvoiceModule,
  ],
})
export class AppModule {}

