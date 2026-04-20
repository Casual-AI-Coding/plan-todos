"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { TagBadgeList } from "@/components/ui/TagBadge";
import { ReminderSettings } from "./ReminderSettings";
import type { Target, Tag } from "@/lib/types";

export interface TargetFormData {
  title: string;
  description?: string;
  due_date?: string;
  reminder_times?: number[];
}

export interface TargetFormProps {
  open: boolean;
  editingTarget?: Target | null;
  allTags: Tag[];
  selectedTags: string[];
  editingReminderTimes?: number[];
  onClose: () => void;
  onSave: (data: TargetFormData, selectedTags: string[]) => void;
}

export function TargetForm({
  open,
  editingTarget,
  allTags,
  selectedTags,
  editingReminderTimes,
  onClose,
  onSave,
}: TargetFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [reminderTimes, setReminderTimes] = useState<number[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (isInitialized.current && !editingTarget) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setDescription("");
      setDueDate("");
      setTags([]);
      setReminderTimes([]);
    } else if (editingTarget) {
      setTitle(editingTarget.title);
      setDescription(editingTarget.description || "");
      setDueDate(editingTarget.due_date || "");
      setTags(selectedTags);
      setReminderTimes(editingReminderTimes || []);
    }
    isInitialized.current = true;
  }, [open, editingTarget, selectedTags, editingReminderTimes]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(
      {
        title: title.trim(),
        description: description || undefined,
        due_date: dueDate || undefined,
        reminder_times: reminderTimes.length > 0 ? reminderTimes : undefined,
      },
      tags,
    );
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setTags([]);
    setReminderTimes([]);
    onClose();
  };

  const toggleTag = (tagId: string) => {
    setTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  return (
    <Modal
      open={open}
      title={editingTarget ? "编辑 Target" : "新建 Target"}
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {editingTarget ? "保存" : "创建"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="目标标题..."
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入目标描述..."
            className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={3}
          />
        </div>
        <Input
          label="截止日期"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标签
          </label>
          <TagBadgeList
            tags={allTags}
            selectedIds={tags}
            onToggle={toggleTag}
            size="md"
          />
        </div>
        <ReminderSettings value={reminderTimes} onChange={setReminderTimes} />
      </div>
    </Modal>
  );
}
