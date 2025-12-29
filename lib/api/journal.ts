import { apiClient } from "./client";
import type { Journal, JournalFilters } from "@/features/journal/types/journal";

export const journalApi = {
  /**
   * Create a new journal entry
   */
  async createJournal(data: {
    title: string;
    content: string;
    type: "TASK" | "NOTE";
    deadline?: string;
    assignedToId?: string;
  }): Promise<Journal> {
    const response = await apiClient.post<Journal>("/journals", data);
    return response.data;
  },

  /**
   * Get all journal entries with optional filters
   */
  async getJournals(filters?: JournalFilters): Promise<Journal[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.assignedToId) params.append("assignedToId", filters.assignedToId);
    if (filters?.createdById) params.append("createdById", filters.createdById);
    if (filters?.isCompleted !== undefined) params.append("isCompleted", String(filters.isCompleted));
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.nearDeadlines) params.append("nearDeadlines", "true");
    if (filters?.overdue) params.append("overdue", "true");
    if (filters?.search) params.append("search", filters.search);

    const queryString = params.toString();
    const response = await apiClient.get<Journal[]>(`/journals${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  /**
   * Get a single journal entry by ID
   */
  async getJournal(id: string): Promise<Journal> {
    const response = await apiClient.get<Journal>(`/journals/${id}`);
    return response.data;
  },

  /**
   * Update journal entry status
   */
  async updateJournalStatus(id: string, isCompleted: boolean): Promise<Journal> {
    const response = await apiClient.patch<Journal>(`/journals/${id}/status`, { isCompleted });
    return response.data;
  },

  /**
   * Delete a journal entry
   */
  async deleteJournal(id: string): Promise<void> {
    await apiClient.delete(`/journals/${id}`);
  },
};

