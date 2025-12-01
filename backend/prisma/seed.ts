import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Check if roles table is empty before seeding roles
  const existingRolesCount = await prisma.role.count();
  if (existingRolesCount === 0) {
    console.log("📋 Roles table is empty, creating built-in roles...");

    const builtInRoles = [
      {
        name: "ADMIN",
        permissions: [
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
      },
      {
        name: "MANAGER",
        permissions: [
          "dashboard:view",
          "invoices:view",
          "invoices:create",
          "invoices:edit",
          "finances:view",
        ],
      },
    ];

    for (const roleData of builtInRoles) {
      await prisma.role.create({
        data: roleData,
      });
      console.log(`✅ Created role: ${roleData.name}`);
    }
  } else {
    console.log(`ℹ️  Roles table already has ${existingRolesCount} role(s), skipping role seeding`);
  }

  // Check if users table is empty before creating master admin
  const existingUsersCount = await prisma.user.count();
  if (existingUsersCount === 0) {
    console.log("👤 Users table is empty, creating master admin...");

    const hashedPassword = await bcrypt.hash("admin", 10);

    const masterAdmin = await prisma.user.create({
      data: {
        userId: "admin.shyara",
        email: "admin@shyara.co.in",
        name: "Master Admin",
        password: hashedPassword,
        role: "ADMIN",
        status: "active",
      },
    });

    console.log("✅ Created master admin:", masterAdmin.email);
  } else {
    console.log(`ℹ️  Users table already has ${existingUsersCount} user(s), skipping admin creation`);
  }

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

