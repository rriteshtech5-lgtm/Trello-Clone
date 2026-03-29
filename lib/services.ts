import {
  Board, Column, Task, TaskWithRelations, Member, Label, CardLabel,
  ChecklistItem, Comment, ActivityLog, Attachment
} from "./supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";

export const boardService = {
  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error) throw error;

    return data;
  },

  async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<void> {
    const { error } = await supabase.from("boards").delete().eq("id", boardId);
    if (error) throw error;
  },
};

export const columnService = {
  async getColumns(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Column[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateColumnTitle(
    supabase: SupabaseClient,
    columnId: string,
    title: string
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .update({ title })
      .eq("id", columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateColumnOrder(
    supabase: SupabaseClient,
    columnId: string,
    sortOrder: number
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .update({ sort_order: sortOrder })
      .eq("id", columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteColumn(
    supabase: SupabaseClient,
    columnId: string
  ): Promise<void> {
    const { error } = await supabase.from("columns").delete().eq("id", columnId);
    if (error) throw error;
  },
};

export const taskService = {
  async getTasksByBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        columns!inner(board_id)
        `
      )
      .eq("columns.board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createTask(
    supabase: SupabaseClient,
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async moveTask(
    supabase: SupabaseClient,
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        column_id: newColumnId,
        sort_order: newOrder,
      })
      .eq("id", taskId);

    if (error) throw error;
    return data;
  },
};

export const boardDataService = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
    const [board, columns] = await Promise.all([
      boardService.getBoard(supabase, boardId),
      columnService.getColumns(supabase, boardId),
    ]);

    if (!board) throw new Error("Board not found");

    const tasks = await taskService.getTasksByBoard(supabase, boardId);

    const taskIds = tasks.map((task) => task.id);
    let taskLabelMap: Record<string, Label[]> = {};

    if (taskIds.length > 0) {
      const { data: cardLabels, error: cardLabelsError } = await supabase
        .from("card_labels")
        .select("task_id, labels(*)")
        .in("task_id", taskIds);

      if (cardLabelsError) throw cardLabelsError;

      type CardLabelRow = { task_id: string; labels: Label | Label[] | null };
      const typedCardLabels = (cardLabels || []) as CardLabelRow[];

      taskLabelMap = typedCardLabels.reduce(
        (acc: Record<string, Label[]>, row: CardLabelRow) => {
          if (!acc[row.task_id]) {
            acc[row.task_id] = [];
          }
          if (Array.isArray(row.labels)) {
            acc[row.task_id].push(...row.labels);
          } else if (row.labels) {
            acc[row.task_id].push(row.labels);
          }
          return acc;
        },
        {}
      );
    }

    const tasksWithRelations: TaskWithRelations[] = tasks.map((task) => ({
      ...task,
      labels: taskLabelMap[task.id] || [],
    }));

    const columnsWithTasks = columns.map((column) => ({
      ...column,
      tasks: tasksWithRelations.filter((task) => task.column_id === column.id),
    }));

    return {
      board,
      columnsWithTasks,
    };
  },

  async createBoardWithDefaultColumns(
    supabase: SupabaseClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
    }
  ) {
    const board = await boardService.createBoard(supabase, {
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
    });

    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    await Promise.all(
      defaultColumns.map((column) =>
        columnService.createColumn(supabase, {
          ...column,
          board_id: board.id,
          user_id: boardData.userId,
        })
      )
    );

    return board;
  },
};

// =========================================================
// MEMBER SERVICES
// =========================================================
export const memberService = {
  async getBoardMembers(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Member[]> {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createMember(
    supabase: SupabaseClient,
    member: Omit<Member, "id" | "created_at">
  ): Promise<Member> {
    const { data, error } = await supabase
      .from("members")
      .insert(member)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMember(
    supabase: SupabaseClient,
    memberId: string,
    updates: Partial<Member>
  ): Promise<Member> {
    const { data, error } = await supabase
      .from("members")
      .update(updates)
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMember(
    supabase: SupabaseClient,
    memberId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;
  },
};

// =========================================================
// LABEL SERVICES
// =========================================================
export const labelService = {
  async getBoardLabels(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Label[]> {
    const { data, error } = await supabase
      .from("labels")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createLabel(
    supabase: SupabaseClient,
    label: Omit<Label, "id" | "created_at">
  ): Promise<Label> {
    const { data, error } = await supabase
      .from("labels")
      .insert(label)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLabel(
    supabase: SupabaseClient,
    labelId: string,
    updates: Partial<Label>
  ): Promise<Label> {
    const { data, error } = await supabase
      .from("labels")
      .update(updates)
      .eq("id", labelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLabel(
    supabase: SupabaseClient,
    labelId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("labels")
      .delete()
      .eq("id", labelId);

    if (error) throw error;
  },

  async getCardLabels(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<Label[]> {
    const { data, error } = await supabase
      .from("card_labels")
      .select("label_id, labels(*)")
      .eq("task_id", taskId);

    if (error) throw error;
    type CardLabelJoinRow = { labels: Label | Label[] | null };
    const typedData = (data || []) as CardLabelJoinRow[];
    return typedData.flatMap((item) => {
      if (Array.isArray(item.labels)) {
        return item.labels;
      }
      return item.labels ? [item.labels] : [];
    });
  },

  async addLabelToCard(
    supabase: SupabaseClient,
    taskId: string,
    labelId: string
  ): Promise<CardLabel> {
    const { data, error } = await supabase
      .from("card_labels")
      .insert({ task_id: taskId, label_id: labelId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeLabelFromCard(
    supabase: SupabaseClient,
    taskId: string,
    labelId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("card_labels")
      .delete()
      .eq("task_id", taskId)
      .eq("label_id", labelId);

    if (error) throw error;
  },
};

// =========================================================
// CHECKLIST SERVICES
// =========================================================
export const checklistService = {
  async getChecklistItems(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("task_id", taskId)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createChecklistItem(
    supabase: SupabaseClient,
    item: Omit<ChecklistItem, "id" | "created_at" | "updated_at">
  ): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from("checklist_items")
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateChecklistItem(
    supabase: SupabaseClient,
    itemId: string,
    updates: Partial<ChecklistItem>
  ): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from("checklist_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteChecklistItem(
    supabase: SupabaseClient,
    itemId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
  },

  async toggleChecklistItem(
    supabase: SupabaseClient,
    itemId: string,
    completed: boolean
  ): Promise<ChecklistItem> {
    return this.updateChecklistItem(supabase, itemId, { completed });
  },
};

// =========================================================
// COMMENT SERVICES
// =========================================================
export const commentService = {
  async getTaskComments(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createComment(
    supabase: SupabaseClient,
    comment: Omit<Comment, "id" | "created_at" | "updated_at">
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateComment(
    supabase: SupabaseClient,
    commentId: string,
    updates: Partial<Comment>
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(
    supabase: SupabaseClient,
    commentId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
  },
};

// =========================================================
// ACTIVITY LOG SERVICES
// =========================================================
export const activityService = {
  async getTaskActivity(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getBoardActivity(
    supabase: SupabaseClient,
    boardId: string,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async logActivity(
    supabase: SupabaseClient,
    activity: Omit<ActivityLog, "id" | "created_at">
  ): Promise<ActivityLog> {
    const { data, error } = await supabase
      .from("activity_logs")
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =========================================================
// ATTACHMENT SERVICES
// =========================================================
export const attachmentService = {
  ATTACHMENT_BUCKET: "attachments",

  async getTaskAttachments(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<Attachment[]> {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createAttachment(
    supabase: SupabaseClient,
    attachment: Omit<Attachment, "id" | "created_at">
  ): Promise<Attachment> {
    const { data, error } = await supabase
      .from("attachments")
      .insert(attachment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  },

  async uploadTaskAttachment(
    supabase: SupabaseClient,
    params: {
      taskId: string;
      userId: string;
      file: File;
      displayName?: string;
    }
  ): Promise<Attachment> {
    const sanitizedName = this.sanitizeFileName(params.file.name);
    const storagePath = `${params.userId}/${params.taskId}/${Date.now()}-${sanitizedName}`;

    const { error: uploadError } = await supabase
      .storage
      .from(this.ATTACHMENT_BUCKET)
      .upload(storagePath, params.file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase
      .storage
      .from(this.ATTACHMENT_BUCKET)
      .getPublicUrl(storagePath);

    return this.createAttachment(supabase, {
      task_id: params.taskId,
      user_id: params.userId,
      file_name: params.displayName?.trim() || params.file.name,
      file_url: publicUrlData.publicUrl,
      bucket_name: this.ATTACHMENT_BUCKET,
      storage_path: storagePath,
    });
  },

  async deleteAttachmentWithFile(
    supabase: SupabaseClient,
    attachment: Attachment
  ): Promise<void> {
    const bucketName = attachment.bucket_name || this.ATTACHMENT_BUCKET;

    if (attachment.storage_path) {
      const { error: removeError } = await supabase
        .storage
        .from(bucketName)
        .remove([attachment.storage_path]);

      if (removeError) throw removeError;
    }

    await this.deleteAttachment(supabase, attachment.id);
  },

  async deleteAttachment(
    supabase: SupabaseClient,
    attachmentId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", attachmentId);

    if (error) throw error;
  },
};

// =========================================================
// EXTENDED TASK SERVICES
// =========================================================
export const extendedTaskService = {
  async updateTaskWithRelations(
    supabase: SupabaseClient,
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async archiveTask(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<Task> {
    return this.updateTaskWithRelations(supabase, taskId, { is_archived: true });
  },

  async unarchiveTask(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<Task> {
    return this.updateTaskWithRelations(supabase, taskId, {
      is_archived: false,
    });
  },

  async deleteTask(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) throw error;
  },
};
