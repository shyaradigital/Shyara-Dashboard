import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { identifier, password } = loginDto;

    // Find user by email or userId
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.trim() }, { userId: identifier.trim() }],
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or user ID");
    }

    if (user.status !== "active") {
      throw new UnauthorizedException("Account is disabled");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid password");
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      return null;
    }

    return user;
  }
}

