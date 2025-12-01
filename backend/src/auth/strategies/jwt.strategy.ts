import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || (() => {
        if (process.env.NODE_ENV === "production") {
          throw new Error("JWT_SECRET environment variable is required in production");
        }
        return "default-secret-change-in-production";
      })(),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== "active") {
      throw new UnauthorizedException("User not found or inactive");
    }

    // Load permissions for the user's role
    let permissions: string[] = [];

    // Check if role is a built-in role (ADMIN, MANAGER)
    const builtInPermissions: Record<string, string[]> = {
      ADMIN: [
        "dashboard:view",
        "invoices:view",
        "invoices:create",
        "invoices:edit",
        "invoices:delete",
        "finances:view",
        "finances:edit",
        "users:view",
        "users:create",
        "users:edit",
        "users:delete",
        "roles:manage",
        "auth:reset-password",
      ],
      MANAGER: [
        "dashboard:view",
        "invoices:view",
        "invoices:create",
        "invoices:edit",
        "finances:view",
      ],
    };

    if (builtInPermissions[user.role]) {
      permissions = builtInPermissions[user.role];
    } else {
      // Load permissions from database for custom roles
      const role = await this.prisma.role.findUnique({
        where: { name: user.role },
        select: { permissions: true },
      });
      if (role) {
        permissions = role.permissions;
      }
    }

    return {
      ...user,
      permissions,
    };
  }
}

