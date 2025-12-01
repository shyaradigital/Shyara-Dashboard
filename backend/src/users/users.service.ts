import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserFiltersDto } from "./dto/user-filters.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if userId already exists
    const existingUserId = await this.prisma.user.findUnique({
      where: { userId: createUserDto.userId },
    });
    if (existingUserId) {
      throw new ConflictException(`User ID "${createUserDto.userId}" already exists`);
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException(`Email "${createUserDto.email}" already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    return user;
  }

  async findAll(filters?: UserFiltersDto) {
    const where: any = {};

    if (filters?.searchTerm) {
      where.OR = [
        { name: { contains: filters.searchTerm, mode: "insensitive" } },
        { email: { contains: filters.searchTerm, mode: "insensitive" } },
        { userId: { contains: filters.searchTerm, mode: "insensitive" } },
      ];
    }

    if (filters?.roleFilter) {
      where.role = filters.roleFilter;
    }

    if (filters?.statusFilter) {
      where.status = filters.statusFilter;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findByIdentifier(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { userId: identifier }],
      },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Check if userId is being changed and if it conflicts
    if (updateUserDto.userId && updateUserDto.userId !== existingUser.userId) {
      const userIdExists = await this.prisma.user.findUnique({
        where: { userId: updateUserDto.userId },
      });
      if (userIdExists) {
        throw new ConflictException(`User ID "${updateUserDto.userId}" already exists`);
      }
    }

    // Check if email is being changed and if it conflicts
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException(`Email "${updateUserDto.email}" already exists`);
      }
    }

    // Hash password if provided
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    return user;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: `User "${user.name}" has been deleted` };
  }

  async disableUser(id: string) {
    return this.update(id, { status: "disabled" });
  }

  async enableUser(id: string) {
    return this.update(id, { status: "active" });
  }
}

