import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PrismaModule } from "../prisma/prisma.module";
import { PermissionsGuard } from "./guards/permissions.guard";

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || (() => {
        if (process.env.NODE_ENV === "production") {
          throw new Error("JWT_SECRET environment variable is required in production");
        }
        console.warn("⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET in production!");
        return "default-secret-change-in-production";
      })(),
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PermissionsGuard],
  exports: [AuthService, PermissionsGuard],
})
export class AuthModule {}

