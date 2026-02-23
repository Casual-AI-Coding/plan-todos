"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, Button, Input } from "@/components/ui";
import type {
  Circulation,
  CirculationType,
  PeriodicFrequency,
} from "@/lib/api";

interface CirculationFormProps {
  open: boolean;
  editingCirculation?: Circulation | null;
  onClose: () => void;
  onSave: (data: CirculationFormData) => void;
}

export interface CirculationFormData {
  title: string;
  circulation_type: CirculationType;
  frequency?: PeriodicFrequency;
  target_count?: number;
}

export function CirculationForm({
  open,
  editingCirculation,
  onClose,
  onSave,
}: CirculationFormProps) {
  const [title, setTitle] = useState("");
  const [circulationType, setCirculationType] =
    useState<CirculationType>("periodic");
  const [frequency, setFrequency] = useState<PeriodicFrequency>("daily");
  const [targetCount, setTargetCount] = useState<number | "">("");

  const isInitialized = useRef(false);

  // Reset form when opening with editing data
   
  useEffect(() => {
    if (!open) return;
    if (isInitialized.current && !editingCirculation) {
      // Only reset for new item if we've already opened before
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setCirculationType("periodic");
      setFrequency("daily");
      setTargetCount("");
    } else if (editingCirculation) {
      setTitle(editingCirculation.title);
      setCirculationType(editingCirculation.circulation_type);
      setFrequency(editingCirculation.frequency || "daily");
      setTargetCount(editingCirculation.target_count || "");
    }
    isInitialized.current = true;
  }, [open, editingCirculation]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      circulation_type: circulationType,
      frequency: circulationType === "periodic" ? frequency : undefined,
      target_count:
        circulationType === "count" && targetCount
          ? Number(targetCount)
          : undefined,
    });
  };

  return (
    <Modal
      open={open}
      title={editingCirculation ? "编辑打卡项" : "新建打卡项"}
      onClose={onClose}
      width="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入打卡项名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            类型
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                circulationType === "periodic"
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 text-gray-600"
              }`}
              onClick={() => setCirculationType("periodic")}
            >
              周期打卡
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                circulationType === "count"
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 text-gray-600"
              }`}
              onClick={() => setCirculationType("count")}
            >
              计数打卡
            </button>
          </div>
        </div>

        {circulationType === "periodic" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              频率
            </label>
            <select
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as PeriodicFrequency)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="daily">每日</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>
        )}

        {circulationType === "count" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标次数 (可选)
            </label>
            <Input
              type="number"
              value={targetCount}
              onChange={(e) =>
                setTargetCount(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="不填则无限"
              min={1}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
