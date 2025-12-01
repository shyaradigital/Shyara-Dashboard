import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleResponseDto } from "./dto/role-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Permissions } from "../auth/decorators/permissions.decorator";

@ApiTags("roles")
@Controller("roles")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles("ADMIN")
  @Permissions("roles:manage")
  @ApiOperation({ summary: "Create a new role" })
  @ApiResponse({ status: 201, description: "Role created", type: RoleResponseDto })
  @ApiResponse({ status: 409, description: "Role name already exists" })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions("roles:manage")
  @ApiOperation({ summary: "Get all roles" })
  @ApiResponse({ status: 200, description: "List of roles", type: [RoleResponseDto] })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(":id")
  @Permissions("roles:manage")
  @ApiOperation({ summary: "Get role by ID" })
  @ApiResponse({ status: 200, description: "Role found", type: RoleResponseDto })
  @ApiResponse({ status: 404, description: "Role not found" })
  findOne(@Param("id") id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(":id")
  @Roles("ADMIN")
  @Permissions("roles:manage")
  @ApiOperation({ summary: "Update role" })
  @ApiResponse({ status: 200, description: "Role updated", type: RoleResponseDto })
  @ApiResponse({ status: 404, description: "Role not found" })
  @ApiResponse({ status: 409, description: "Role name already exists" })
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  @Permissions("roles:manage")
  @ApiOperation({ summary: "Delete role" })
  @ApiResponse({ status: 200, description: "Role deleted" })
  @ApiResponse({ status: 404, description: "Role not found" })
  remove(@Param("id") id: string) {
    return this.rolesService.remove(id);
  }
}

