"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Member, Label as LabelType } from "@/lib/supabase/models";
import { Settings, Plus, Trash2, Users, Tags } from "lucide-react";

interface BoardSettingsProps {
  members: Member[];
  labels: LabelType[];
  onAddMember: (name: string, email: string, color: string) => Promise<unknown>;
  onAddLabel: (name: string, color: string) => Promise<unknown>;
  onDeleteMember: (memberId: string) => Promise<void>;
  onDeleteLabel: (labelId: string) => Promise<void>;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
];

export default function BoardSettings({
  members,
  labels,
  onAddMember,
  onAddLabel,
  onDeleteMember,
  onDeleteLabel,
}: BoardSettingsProps) {
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedMemberColor, setSelectedMemberColor] = useState(PRESET_COLORS[0]);
  const [newLabelName, setNewLabelName] = useState("");
  const [selectedLabelColor, setSelectedLabelColor] = useState(PRESET_COLORS[0]);
  const [activeTab, setActiveTab] = useState<"members" | "labels">("members");

  const handleAddMember = async () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    try {
      await onAddMember(newMemberName, newMemberEmail, selectedMemberColor);
      setNewMemberName("");
      setNewMemberEmail("");
      setSelectedMemberColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      await onAddLabel(newLabelName, selectedLabelColor);
      setNewLabelName("");
      setSelectedLabelColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error("Failed to add label:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Board settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Board Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("members")}
              className={`pb-2 px-4 font-medium ${
                activeTab === "members"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Members
            </button>
            <button
              onClick={() => setActiveTab("labels")}
              className={`pb-2 px-4 font-medium ${
                activeTab === "labels"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Tags className="h-4 w-4 inline mr-2" />
              Labels
            </button>
          </div>

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Board Members</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: member.color }}
                        />
                        <div>
                          <div className="text-sm font-medium">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold">Add Member</h3>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Member name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="member@example.com"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedMemberColor(color)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          selectedMemberColor === color
                            ? "border-gray-900"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddMember} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
          )}

          {/* Labels Tab */}
          {activeTab === "labels" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Board Labels</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm font-medium">{label.name}</span>
                      </div>
                      <button
                        onClick={() => onDeleteLabel(label.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold">Add Label</h3>
                <div>
                  <Label>Label Name</Label>
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="e.g., Bug, Feature, Documentation"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedLabelColor(color)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          selectedLabelColor === color
                            ? "border-gray-900"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddLabel} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Label
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
