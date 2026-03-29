"use client";

import { useUser } from "@clerk/nextjs";
import {
  boardDataService,
  boardService,
  columnService,
  taskService,
  memberService,
  labelService,
  activityService,
  extendedTaskService,
} from "../services";
import { useCallback, useEffect, useState } from "react";
import {
  Board,
  ColumnWithTasks,
  Task,
  Member,
  Label,
} from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const effectiveUserId = user?.id ?? "demo-user-001";
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = useCallback(async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardService.getBoards(supabase!, effectiveUserId);
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }, [supabase, effectiveUserId]);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: effectiveUserId,
        }
      );
      setBoards((prev) => [newBoard, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
    }
  }

  async function deleteBoard(boardId: string) {
    if (!supabase) return;

    try {
      setError(null);
      await boardService.deleteBoard(supabase, boardId);
      setBoards((prev) => prev.filter((board) => board.id !== boardId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board.");
    }
  }

  return { boards, loading, error, createBoard, deleteBoard };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const effectiveUserId = user?.id ?? "demo-user-001";

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    if (!boardId || !supabase) return;

    try {
      setLoading(true);
      setError(null);
      const [boardData, membersData, labelsData] = await Promise.all([
        boardDataService.getBoardWithColumns(supabase!, boardId),
        memberService.getBoardMembers(supabase!, boardId),
        labelService.getBoardLabels(supabase!, boardId),
      ]);

      setBoard(boardData.board);
      setColumns(boardData.columnsWithTasks);
      setMembers(membersData);
      setLabels(labelsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }, [boardId, supabase]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update the board."
      );
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignedMemberId?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
    }
  ) {
    try {
      const assignedMember = taskData.assignedMemberId
        ? members.find((member) => member.id === taskData.assignedMemberId)
        : null;

      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: assignedMember?.name || null,
        assigned_member_id: taskData.assignedMemberId || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order:
          columns.find((col) => col.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || "medium",
      });

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
        )
      );

      if (board && effectiveUserId) {
        try {
          await activityService.logActivity(supabase!, {
            task_id: newTask.id,
            board_id: board.id,
            user_id: effectiveUserId,
            action: "created",
            description: `Created task \"${newTask.title}\"`,
          });
        } catch {
          // Do not block UI if activity logging fails.
        }
      }

      return newTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the task."
      );
    }
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    try {
      await taskService.moveTask(supabase!, taskId, newColumnId, newOrder);

      setColumns((prev) => {
        const newColumns = [...prev];

        // Find and remove task from the old column
        let taskToMove: Task | null = null;
        for (const col of newColumns) {
          const taskIndex = col.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            taskToMove = col.tasks[taskIndex];
            col.tasks.splice(taskIndex, 1);
            break;
          }
        }

        if (taskToMove) {
          // Add task to new column
          const targetColumn = newColumns.find((col) => col.id === newColumnId);
          if (targetColumn) {
            targetColumn.tasks.splice(newOrder, 0, taskToMove);
          }
        }

        return newColumns;
      });

      if (board && effectiveUserId) {
        try {
          await activityService.logActivity(supabase!, {
            task_id: taskId,
            board_id: board.id,
            user_id: effectiveUserId,
            action: "moved",
            description: "Moved task",
          });
        } catch {
          // Do not block UI if activity logging fails.
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task.");
    }
  }

  async function createColumn(title: string) {
    if (!board) throw new Error("Board not loaded");

    try {
      const newColumn = await columnService.createColumn(supabase!, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: effectiveUserId,
      });

      setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
      return newColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  async function updateColumn(columnId: string, title: string) {
    try {
      const updatedColumn = await columnService.updateColumnTitle(
        supabase!,
        columnId,
        title
      );

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, ...updatedColumn } : col
        )
      );

      return updatedColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  async function reorderColumns(columnIdsInOrder: string[]) {
    const previous = columns;

    const reordered = columnIdsInOrder
      .map((id) => previous.find((column) => column.id === id))
      .filter((column): column is ColumnWithTasks => Boolean(column))
      .map((column, index) => ({ ...column, sort_order: index }));

    setColumns(reordered);

    try {
      await Promise.all(
        reordered.map((column) =>
          columnService.updateColumnOrder(supabase!, column.id, column.sort_order)
        )
      );
    } catch (err) {
      setColumns(previous);
      setError(err instanceof Error ? err.message : "Failed to reorder columns.");
    }
  }

  async function deleteColumn(columnId: string) {
    try {
      await columnService.deleteColumn(supabase!, columnId);
      setColumns((prev) => prev.filter((column) => column.id !== columnId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete column.");
    }
  }

  return {
    board,
    columns,
    loading,
    error,
    members,
    labels,
    updateBoard,
    createRealTask,
    setColumns,
    moveTask,
    createColumn,
    updateColumn,
    reorderColumns,
    deleteColumn,
    // Member methods
    createMember: async (name: string, email: string, color: string) => {
      if (!board) throw new Error("Board not loaded");
      const newMember = await memberService.createMember(supabase!, {
        board_id: board.id,
        name,
        email,
        color,
        avatar_url: null,
      });
      setMembers((prev) => [...prev, newMember]);
      return newMember;
    },
    deleteMember: async (memberId: string) => {
      await memberService.deleteMember(supabase!, memberId);
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
      setColumns((prev) =>
        prev.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.assigned_member_id === memberId
              ? { ...task, assigned_member_id: null }
              : task
          ),
        }))
      );
    },
    // Label methods
    createLabel: async (name: string, color: string) => {
      if (!board) throw new Error("Board not loaded");
      const newLabel = await labelService.createLabel(supabase!, {
        board_id: board.id,
        name,
        color,
      });
      setLabels((prev) => [...prev, newLabel]);
      return newLabel;
    },
    deleteLabel: async (labelId: string) => {
      await labelService.deleteLabel(supabase!, labelId);
      setLabels((prev) => prev.filter((label) => label.id !== labelId));
    },
    addLabelToCard:async (taskId: string, labelId: string) => {
      return labelService.addLabelToCard(supabase!, taskId, labelId);
    },
    removeLabelFromCard: async (taskId: string, labelId: string) => {
      return labelService.removeLabelFromCard(supabase!, taskId, labelId);
    },
    // Task methods
    updateTask: async (taskId: string, updates: Partial<Task>) => {
      const updatedTask = await extendedTaskService.updateTaskWithRelations(
        supabase!,
        taskId,
        updates
      );

      setColumns((prev) =>
        prev.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  ...updatedTask,
                }
              : task
          ),
        }))
      );

      if (board && effectiveUserId) {
        try {
          await activityService.logActivity(supabase!, {
            task_id: taskId,
            board_id: board.id,
            user_id: effectiveUserId,
            action: "updated",
            description: `Updated task \"${updatedTask.title}\"`,
          });
        } catch {
          // Do not block UI if activity logging fails.
        }
      }
    },
    archiveTask: async (taskId: string) => {
      await extendedTaskService.archiveTask(supabase!, taskId);
      setColumns((prev) =>
        prev.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        }))
      );

      if (board && effectiveUserId) {
        try {
          await activityService.logActivity(supabase!, {
            task_id: taskId,
            board_id: board.id,
            user_id: effectiveUserId,
            action: "archived",
            description: "Archived task",
          });
        } catch {
          // Do not block UI if activity logging fails.
        }
      }
    },
    deleteTask: async (taskId: string) => {
      await extendedTaskService.deleteTask(supabase!, taskId);
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        }))
      );

      if (board && effectiveUserId) {
        try {
          await activityService.logActivity(supabase!, {
            task_id: taskId,
            board_id: board.id,
            user_id: effectiveUserId,
            action: "deleted",
            description: "Deleted task",
          });
        } catch {
          // Do not block UI if activity logging fails.
        }
      }
    },
  };
}
