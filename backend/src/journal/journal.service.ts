import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJournalDto } from "./dto/create-journal.dto";
import { UpdateJournalDto } from "./dto/update-journal.dto";
import { JournalFiltersDto } from "./dto/journal-filters.dto";

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async create(createJournalDto: CreateJournalDto, userId: string) {
    // Validate assigned user exists if provided
    if (createJournalDto.assignedToId) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: createJournalDto.assignedToId },
      });
      if (!assignedUser) {
        throw new NotFoundException(`User with ID "${createJournalDto.assignedToId}" not found`);
      }
    }

    // Validate deadline is valid date
    let deadlineDate: Date | undefined;
    if (createJournalDto.deadline) {
      deadlineDate = new Date(createJournalDto.deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new BadRequestException("Invalid deadline date format");
      }
    }

    const data: any = {
      title: createJournalDto.title.trim(),
      content: createJournalDto.content.trim(),
      type: createJournalDto.type,
      createdById: userId,
      isCompleted: false,
    };

    if (deadlineDate) {
      data.deadline = deadlineDate;
    }

    if (createJournalDto.assignedToId) {
      data.assignedToId = createJournalDto.assignedToId;
    }

    const journal = await this.prisma.journal.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return journal;
  }

  async findAll(filters?: JournalFiltersDto) {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters?.createdById) {
      where.createdById = filters.createdById;
    }

    // Only apply isCompleted filter if overdue is not set (overdue forces isCompleted: false)
    if (filters?.isCompleted !== undefined && filters?.overdue !== true) {
      where.isCompleted = filters.isCompleted;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (isNaN(startDate.getTime())) {
          throw new BadRequestException("Invalid start date format");
        }
        where.createdAt.gte = startDate;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        if (isNaN(endDate.getTime())) {
          throw new BadRequestException("Invalid end date format");
        }
        where.createdAt.lte = endDate;
      }
      // Validate date range
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        if (startDate > endDate) {
          throw new BadRequestException("Start date must be before or equal to end date");
        }
      }
    }

    // Filter by overdue (deadline passed and not completed) - takes priority
    if (filters?.overdue === true) {
      const today = new Date();
      // Filter for deadlines that are less than today (overdue)
      // Using comparison operators automatically excludes null values
      where.deadline = {
        lt: today,
      };
      where.isCompleted = false;
    } else if (filters?.nearDeadlines === true) {
      // Filter by near deadlines (within 7 days from today)
      // Only apply if overdue is not set
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      // Filter for deadlines between today and 7 days later
      // Using comparison operators automatically excludes null values
      where.deadline = {
        gte: today,
        lte: sevenDaysLater,
      };
    }

    // Search by title or content
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const journals = await this.prisma.journal.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return journals;
  }

  async findOne(id: string) {
    const journal = await this.prisma.journal.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!journal) {
      throw new NotFoundException(`Journal entry with ID "${id}" not found`);
    }

    return journal;
  }

  async updateStatus(id: string, updateJournalDto: UpdateJournalDto, userId: string) {
    const journal = await this.prisma.journal.findUnique({
      where: { id },
    });

    if (!journal) {
      throw new NotFoundException(`Journal entry with ID "${id}" not found`);
    }

    // Only creator can update status
    if (journal.createdById !== userId) {
      throw new ForbiddenException("Only the creator can update the status of this journal entry");
    }

    const updated = await this.prisma.journal.update({
      where: { id },
      data: {
        isCompleted: updateJournalDto.isCompleted,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string) {
    const journal = await this.prisma.journal.findUnique({
      where: { id },
    });

    if (!journal) {
      throw new NotFoundException(`Journal entry with ID "${id}" not found`);
    }

    await this.prisma.journal.delete({
      where: { id },
    });

    return { message: "Journal entry deleted successfully" };
  }
}

