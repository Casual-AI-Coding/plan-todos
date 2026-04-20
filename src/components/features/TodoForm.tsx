"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { TagBadge, TagBadgeList } from "@/components/ui/TagBadge";
import { ReminderSettings } from "./ReminderSettings";
import { RecurrenceForm } from "./RecurrenceForm";
import type { Todo, Priority, Tag, Recurrence } from "@/lib/types";

export interface TodoFormData {
  title: string;
  content?: string;
  due_date?: string;
  priority: Priority;
  reminder_times?: number[];
  recurrence?: Recurrence;
}

export interface TodoFormProps {
  open: boolean;
  editingTodo?: Todo | null;
  allTags: Tag[];
  editingReminderTimes?: number[];
  editingRecurrence?: Recurrence | null;
  onClose: () => void;
  onSave: (data: TodoFormData, selectedTags: string[]) => void;
}

export function TodoForm({
  open,
  editingTodo,
  allTags,
  editingReminderTimes,
  editingRecurrence,
  onClose,
  onSave,
}: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("P2");
  const [tags, setTags] = useState<string[]>([]);
  const [reminderTimes, setReminderTimes] = useState<number[]>([]);
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (isInitialized.current && !editingTodo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setContent("");
      setDueDate("");
      setPriority("P2");
      setTags([]);
      setReminderTimes([]);
      setRecurrence(null);
    } else if (editingTodo) {
      setTitle(editingTodo.title);
      setContent(editingTodo.content || "");
      setDueDate(editingTodo.due_date || "");
      setPriority(editingTodo.priority);
      setTags(editingTodo.tags?.map((t) => t.id) || []);
      setReminderTimes(editingReminderTimes || []);
      setRecurrence(editingRecurrence || null);
    }
    isInitialized.current = true;
  }, [open, editingTodo, editingReminderTimes, editingRecurrence]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(
      {
        title: title.trim(),
        content: content || undefined,
        due_date: dueDate || undefined,
        priority,
        reminder_times: reminderTimes.length > 0 ? reminderTimes : undefined,
        recurrence: recurrence || undefined,
      },
      tags,
    );
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setDueDate("");
    setPriority("P2");
    setTags([]);
    setReminderTimes([]);
    setRecurrence(null);
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
      title={editingTodo ? "编辑 Todo" : "新建 Todo"}
      onClose={handleClose}
      width="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSave}>{editingTodo ? "保存" : "创建"}</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入任务标题..."
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入任务内容..."
            className="w-full px-3 py-1.5 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            rows={2}
          />
        </div>
        <Input
          label="截止日期"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            优先级
          </label>
          <div className="flex gap-1.5">
            {(["P0", "P1", "P2", "P3"] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-1.5 text-sm rounded-lg border-2 transition-colors ${
                  priority === p
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {p === "P0"
                  ? "紧急"
                  : p === "P1"
                    ? "重要"
                    : p === "P2"
                      ? "普通"
                      : "低"}
              </button>
            ))}
          </div>
        </div>
        {allTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              标签
            </label>
            <div className="flex flex-wrap gap-1.5">
              <TagBadgeList
                tags={allTags}
                selectedIds={tags}
                onToggle={toggleTag}
              />
            </div>
          </div>
        )}
        <ReminderSettings value={reminderTimes} onChange={setReminderTimes} />
        <RecurrenceForm
          value={recurrence}
          onChange={(data) => setRecurrence(data.recurrence)}
          onClear={() => setRecurrence(null)}
        />
      </div>
    </Modal>
  );
}
