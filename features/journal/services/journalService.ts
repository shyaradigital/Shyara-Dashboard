import { journalApi } from "@/lib/api/journal";
import type { Journal, CreateJournalData, UpdateJournalStatusData, JournalFilters } from "../types/journal";

export const journalService = {
  /**
   * Create a new journal entry
   */
  async createJournal(data: CreateJournalData): Promise<Journal> {
    try {
      return await journalApi.createJournal(data);
    } catch (error: any) {
      if (error.isLocalDevError) {
        // In local dev, return a mock response
        return {
          id: crypto.randomUUID(),
          title: data.title,
          content: data.content,
          type: data.type,
          deadline: data.deadline,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdById: "mock-user-id",
          assignedToId: data.assignedToId,
        };
      }
      throw error;
    }
  },

  /**
   * Get all journal entries with optional filters
   */
  async getJournals(filters?: JournalFilters): Promise<Journal[]> {
    try {
      return await journalApi.getJournals(filters);
    } catch (error: any) {
      if (error.isLocalDevError) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Get a single journal entry by ID
   */
  async getJournal(id: string): Promise<Journal> {
    try {
      return await journalApi.getJournal(id);
    } catch (error: any) {
      if (error.isLocalDevError) {
        throw new Error("Journal entry not found");
      }
      throw error;
    }
  },

  /**
   * Update journal entry status
   */
  async updateJournalStatus(id: string, data: UpdateJournalStatusData): Promise<Journal> {
    try {
      return await journalApi.updateJournalStatus(id, data.isCompleted);
    } catch (error: any) {
      if (error.isLocalDevError) {
        throw new Error("Failed to update journal entry status");
      }
      throw error;
    }
  },

  /**
   * Delete a journal entry
   */
  async deleteJournal(id: string): Promise<void> {
    try {
      await journalApi.deleteJournal(id);
    } catch (error: any) {
      if (error.isLocalDevError) {
        // Silently fail in local dev
        return;
      }
      throw error;
    }
  },
};

