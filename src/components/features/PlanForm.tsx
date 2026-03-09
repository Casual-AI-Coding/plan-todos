"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { ReminderSettings } from "./ReminderSettings";
import type { Plan, Tag } from "@/lib/types";

export interface PlanFormData {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  reminder_times?: number[];
}

export interface PlanFormProps {
  open: boolean;
  editingPlan?: Plan | null;
  allTags: Tag[];
  selectedTags: string[];
  editingReminderTimes?: number[];
  onClose: () => void;
  onSave: (data: PlanFormData, selectedTags: string[]) => void;
}

export function PlanForm({
  open,
  editingPlan,
  allTags,
  selectedTags,
  editingReminderTimes,
  onClose,
  onSave,
}: PlanFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [reminderTimes, setReminderTimes] = useState<number[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (isInitialized.current && !editingPlan) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setTags([]);
      setReminderTimes([]);
    } else if (editingPlan) {
      setTitle(editingPlan.title);
      setDescription(editingPlan.description || "");
      setStartDate(editingPlan.start_date || "");
      setEndDate(editingPlan.end_date || "");
      setTags(selectedTags);
      setReminderTimes(editingReminderTimes || []);
    }
    isInitialized.current = true;
  }, [open, editingPlan, selectedTags, editingReminderTimes]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(
      {
        title: title.trim(),
        description: description || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        reminder_times: reminderTimes.length > 0 ? reminderTimes : undefined,
      },
      tags,
    );
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
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
      title={editingPlan ? "编辑 Plan" : "新建 Plan"}
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSave}>{editingPlan ? "保存" : "创建"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="计划标题..."
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入计划描述..."
            className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="开始日期"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="结束日期"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
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
        <ReminderSettings
          value={reminderTimes}
          onChange={setReminderTimes}
        />
      </div>
    </Modal>
  );
}
