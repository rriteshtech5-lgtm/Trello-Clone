"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Task,
  Label as LabelType,
  Member,
  ChecklistItem,
  Attachment,
  Comment,
  ActivityLog,
} from "@/lib/supabase/models";
import {
  labelService,
  checklistService,
  commentService,
  activityService,
  attachmentService,
} from "@/lib/services";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  Trash2,
  Archive,
  Plus,
  X,
  MessageCircle,
  Activity,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  labels: LabelType[];
  members: Member[];
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onArchive: (taskId: string) => Promise<void>;
  onTaskLabelsChange?: (taskId: string, labels: LabelType[]) => void;
}

export default function CardDetailModal({
  isOpen,
  onClose,
  task,
  labels,
  members,
  onUpdate,
  onDelete,
  onArchive,
  onTaskLabelsChange,
}: CardDetailModalProps) {
  const UNASSIGNED_VALUE = "__unassigned__";
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedMemberId, setAssignedMemberId] = useState<string>("");
  const [cardLabels, setCardLabels] = useState<LabelType[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const loadCardDetails = useCallback(async () => {
    if (!task || !supabase) return;

    try {
      const [
        cardLabelsData,
        checklistData,
        commentsData,
        activityLogData,
        attachmentsData,
      ] =
        await Promise.all([
          labelService.getCardLabels(supabase, task.id),
          checklistService.getChecklistItems(supabase, task.id),
          commentService.getTaskComments(supabase, task.id),
          activityService.getTaskActivity(supabase, task.id),
          attachmentService.getTaskAttachments(supabase, task.id),
        ]);

      setCardLabels(cardLabelsData);
      setChecklistItems(checklistData);
      setComments(commentsData);
      setActivity(activityLogData);
      setAttachments(attachmentsData);
    } catch (error) {
      console.error("Failed to load card details:", error);
    }
  }, [task, supabase]);

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setDueDate(task.due_date || "");
      setAssignedMemberId(task.assigned_member_id || UNASSIGNED_VALUE);
      loadCardDetails();
    }
  }, [task, isOpen, loadCardDetails]);

  const appendActivity = async (action: string, description: string) => {
    if (!task || !supabase || !user) return;

    try {
      const activityItem = await activityService.logActivity(supabase, {
        task_id: task.id,
        board_id: null,
        user_id: user.id,
        action,
        description,
      });

      setActivity((prev) => [activityItem, ...prev]);
    } catch {
      // Do not block UI when activity logging fails.
    }
  };

  const handleSave = async () => {
    if (!task) return;

    const selectedMember =
      assignedMemberId === UNASSIGNED_VALUE
        ? null
        : members.find((member) => member.id === assignedMemberId) || null;

    try {
      await onUpdate(task.id, {
        title,
        description,
        priority,
        due_date: dueDate,
        assignee: selectedMember?.name || null,
        assigned_member_id:
          assignedMemberId === UNASSIGNED_VALUE ? null : assignedMemberId,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleAddLabel = async (labelId: string) => {
    if (!task || !supabase) return;

    try {
      await labelService.addLabelToCard(supabase, task.id, labelId);
      const label = labels.find((l) => l.id === labelId);
      if (label) {
        setCardLabels((prev) => {
          const nextLabels = [...prev, label];
          onTaskLabelsChange?.(task.id, nextLabels);
          return nextLabels;
        });
        await appendActivity("labeled", `Added label \"${label.name}\"`);
      }
    } catch (error) {
      console.error("Failed to add label:", error);
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    if (!task || !supabase) return;

    try {
      await labelService.removeLabelFromCard(supabase, task.id, labelId);
      const removedLabel = cardLabels.find((l) => l.id === labelId);
      setCardLabels((prev) => {
        const nextLabels = prev.filter((l) => l.id !== labelId);
        onTaskLabelsChange?.(task.id, nextLabels);
        return nextLabels;
      });
      if (removedLabel) {
        await appendActivity(
          "unlabeled",
          `Removed label \"${removedLabel.name}\"`
        );
      }
    } catch (error) {
      console.error("Failed to remove label:", error);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!task || !supabase || !newChecklistItem.trim()) return;

    try {
      const newItem = await checklistService.createChecklistItem(supabase, {
        task_id: task.id,
        title: newChecklistItem,
        completed: false,
        sort_order: checklistItems.length,
      });

      setChecklistItems((prev) => [...prev, newItem]);
      setNewChecklistItem("");
      await appendActivity(
        "checklist_added",
        `Added checklist item \"${newItem.title}\"`
      );
    } catch (error) {
      console.error("Failed to add checklist item:", error);
    }
  };

  const handleToggleChecklistItem = async (
    itemId: string,
    completed: boolean
  ) => {
    if (!supabase) return;

    try {
      await checklistService.toggleChecklistItem(supabase, itemId, !completed);
      setChecklistItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, completed: !completed } : item
        )
      );
      await appendActivity(
        "checklist_toggled",
        !completed ? "Completed a checklist item" : "Unchecked a checklist item"
      );
    } catch (error) {
      console.error("Failed to toggle checklist item:", error);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!supabase) return;

    try {
      const removedItem = checklistItems.find((item) => item.id === itemId);
      await checklistService.deleteChecklistItem(supabase, itemId);
      setChecklistItems((prev) => prev.filter((item) => item.id !== itemId));
      if (removedItem) {
        await appendActivity(
          "checklist_removed",
          `Removed checklist item \"${removedItem.title}\"`
        );
      }
    } catch (error) {
      console.error("Failed to delete checklist item:", error);
    }
  };

  const handleAddComment = async () => {
    if (!task || !supabase || !user || !newComment.trim()) return;

    try {
      const comment = await commentService.createComment(supabase, {
        task_id: task.id,
        user_id: user.id,
        content: newComment,
      });

      setComments((prev) => [...prev, comment]);
      setNewComment("");
      await appendActivity("commented", "Added a comment");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleArchive = async () => {
    if (!task) return;
    try {
      await onArchive(task.id);
      onClose();
    } catch (error) {
      console.error("Failed to archive task:", error);
    }
  };

  const handleAddAttachment = async () => {
    if (!task || !supabase || !user || !attachmentFile) return;

    try {
      setIsUploadingAttachment(true);
      const createdAttachment = await attachmentService.uploadTaskAttachment(
        supabase,
        {
          taskId: task.id,
          userId: user.id,
          file: attachmentFile,
          displayName: newAttachmentName,
        }
      );

      setAttachments((prev) => [createdAttachment, ...prev]);
      setNewAttachmentName("");
      setAttachmentFile(null);
      await appendActivity(
        "attachment_added",
        `Added attachment \"${createdAttachment.file_name}\"`
      );
    } catch (error) {
      console.error("Failed to add attachment:", error);
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!supabase) return;

    try {
      const removedAttachment = attachments.find((item) => item.id === attachmentId);
      if (!removedAttachment) return;
      await attachmentService.deleteAttachmentWithFile(supabase, removedAttachment);
      setAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
      if (removedAttachment) {
        await appendActivity(
          "attachment_removed",
          `Removed attachment \"${removedAttachment.file_name}\"`
        );
      }
    } catch (error) {
      console.error("Failed to delete attachment:", error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const checklistProgress = checklistItems.length
    ? Math.round(
        (checklistItems.filter((item) => item.completed).length /
          checklistItems.length) *
          100
      )
    : 0;

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Card description"
                rows={4}
              />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {description || "No description"}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              {isEditing ? (
                <Select
                  value={priority}
                  onValueChange={(val: "low" | "medium" | "high") =>
                    setPriority(val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  variant={
                    priority === "high"
                      ? "destructive"
                      : priority === "medium"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {priority}
                </Badge>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              ) : (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{dueDate || "No due date"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Member */}
          <div className="space-y-2">
            <Label>Assigned To</Label>
            {isEditing ? (
              <Select value={assignedMemberId} onValueChange={setAssignedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-gray-600">
                {members.find((m) => m.id === assignedMemberId)?.name ||
                  "Unassigned"}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {cardLabels.map((label) => (
                <Badge
                  key={label.id}
                  style={{ backgroundColor: label.color }}
                  className="text-white cursor-pointer hover:opacity-80"
                  onClick={() => handleRemoveLabel(label.id)}
                >
                  {label.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex flex-wrap gap-2">
                {labels
                  .filter((l) => !cardLabels.find((cl) => cl.id === l.id))
                  .map((label) => (
                    <Badge
                      key={label.id}
                      style={{ backgroundColor: label.color }}
                      className="text-white cursor-pointer hover:opacity-80"
                      onClick={() => handleAddLabel(label.id)}
                    >
                      {label.name}
                      <Plus className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          {/* Checklist */}
          {(checklistItems.length > 0 || isEditing) && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Checklist</Label>
                {checklistItems.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {checklistProgress}% complete
                  </span>
                )}
              </div>
              {checklistItems.length > 0 && (
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              )}
              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        handleToggleChecklistItem(item.id, item.completed)
                      }
                      className="w-4 h-4"
                    />
                    <span
                      className={`flex-1 ${
                        item.completed
                          ? "line-through text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Add checklist item"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddChecklistItem();
                      }
                    }}
                  />
                  <Button onClick={handleAddChecklistItem} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <Label>Comments</Label>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="font-medium text-gray-900">{comment.user_id}</div>
                  <div className="text-gray-600">{comment.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(comment.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
              />
              <Button onClick={handleAddComment} size="sm">
                Send
              </Button>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2 border-t pt-4">
            <Label>Attachments</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded text-sm"
                >
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {attachment.file_name}
                  </a>
                  {isEditing && (
                    <button
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="space-y-2">
                <Input
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="Attachment name (optional)"
                />
                <div className="flex gap-2">
                  <Input
                    type="file"
                    onChange={(e) =>
                      setAttachmentFile(e.target.files?.[0] || null)
                    }
                  />
                  <Button
                    onClick={handleAddAttachment}
                    size="sm"
                    disabled={!attachmentFile || isUploadingAttachment}
                  >
                    {isUploadingAttachment ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Activity Log */}
          {activity.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <Label>Activity</Label>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                {activity.map((log) => (
                  <div key={log.id} className="text-gray-600">
                    <span className="font-medium">{log.action}</span>
                    {log.description && `: ${log.description}`}
                    <div className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 border-t pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  onClick={handleArchive}
                  variant="outline"
                  size="sm"
                  title="Archive card"
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  size="sm"
                  title="Delete card"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
