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
  ApiQuery,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserFiltersDto } from "./dto/user-filters.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Permissions } from "../auth/decorators/permissions.decorator";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles("ADMIN")
  @Permissions("users:create")
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created", type: UserResponseDto })
  @ApiResponse({ status: 409, description: "User ID or email already exists" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Permissions("users:view")
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "List of users", type: [UserResponseDto] })
  findAll(@Query() filters: UserFiltersDto) {
    return this.usersService.findAll(filters);
  }

  @Get(":id")
  @Permissions("users:view")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User found", type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @Roles("ADMIN")
  @Permissions("users:edit")
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({ status: 200, description: "User updated", type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 409, description: "User ID or email already exists" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(":id/disable")
  @Permissions("users:edit")
  @ApiOperation({ summary: "Disable user" })
  @ApiResponse({ status: 200, description: "User disabled", type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  disable(@Param("id") id: string) {
    return this.usersService.disableUser(id);
  }

  @Patch(":id/enable")
  @Permissions("users:edit")
  @ApiOperation({ summary: "Enable user" })
  @ApiResponse({ status: 200, description: "User enabled", type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  enable(@Param("id") id: string) {
    return this.usersService.enableUser(id);
  }

  @Delete(":id")
  @Roles("ADMIN")
  @Permissions("users:delete")
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 200, description: "User deleted" })
  @ApiResponse({ status: 404, description: "User not found" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}

