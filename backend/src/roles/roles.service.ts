import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    // Check if role name already exists
    const existing = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });
    if (existing) {
      throw new ConflictException(`Role "${createRoleDto.name}" already exists`);
    }

    const role = await this.prisma.role.create({
      data: createRoleDto,
    });

    return role;
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { createdAt: "desc" },
    });

    return roles;
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    return role;
  }

  async findByName(name: string) {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    // Check if role exists
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    // Check if name is being changed and if it conflicts
    if (updateRoleDto.name && updateRoleDto.name !== existing.name) {
      const nameExists = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });
      if (nameExists) {
        throw new ConflictException(`Role "${updateRoleDto.name}" already exists`);
      }
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });

    return role;
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    await this.prisma.role.delete({ where: { id } });
    return { message: `Role "${role.name}" has been deleted` };
  }
}

