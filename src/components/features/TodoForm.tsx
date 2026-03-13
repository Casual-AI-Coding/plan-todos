"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { ReminderSettings } from "./ReminderSettings";
import type { Todo, Priority, Tag } from "@/lib/types";

export interface TodoFormData {
  title: string;
  content?: string;
  due_date?: string;
  priority: Priority;
  reminder_times?: number[];
}

export interface TodoFormProps {
  open: boolean;
  editingTodo?: Todo | null;
  allTags: Tag[];
  editingReminderTimes?: number[];
  onClose: () => void;
  onSave: (data: TodoFormData, selectedTags: string[]) => void;
}

export function TodoForm({
  open,
  editingTodo,
  allTags,
  editingReminderTimes,
  onClose,
  onSave,
}: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("P2");
  const [tags, setTags] = useState<string[]>([]);
  const [reminderTimes, setReminderTimes] = useState<number[]>([]);
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
    } else if (editingTodo) {
      setTitle(editingTodo.title);
      setContent(editingTodo.content || "");
      setDueDate(editingTodo.due_date || "");
      setPriority(editingTodo.priority);
      setTags(editingTodo.tags?.map((t) => t.id) || []);
      setReminderTimes(editingReminderTimes || []);
    }
    isInitialized.current = true;
  }, [open, editingTodo, editingReminderTimes]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(
      {
        title: title.trim(),
        content: content || undefined,
        due_date: dueDate || undefined,
        priority,
        reminder_times: reminderTimes.length > 0 ? reminderTimes : undefined,
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
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSave}>{editingTodo ? "保存" : "创建"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入任务标题..."
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入任务内容..."
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
            优先级
          </label>
          <div className="flex gap-2">
            {(["P0", "P1", "P2", "P3"] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                  priority === p
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {p === "P0"
                  ? "P0 紧急"
                  : p === "P1"
                    ? "P1 重要"
                    : p === "P2"
                      ? "P2 普通"
                      : "P3 低"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标签
          </label>
          <div className="flex flex-wrap gap-2">
            {allTags.length === 0 ? (
              <span className="text-sm text-gray-400">暂无标签</span>
            ) : (
              allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    tags.includes(tag.id)
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-gray-200 text-gray-600 hover:border-teal-300"
                  }`}
                  style={
                    tags.includes(tag.id)
                      ? {}
                      : {
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          borderColor: tag.color,
                        }
                  }
                >
                  {tag.name}
                </button>
              ))
            )}
          </div>
        </div>
        <ReminderSettings value={reminderTimes} onChange={setReminderTimes} />
      </div>
    </Modal>
  );
}
