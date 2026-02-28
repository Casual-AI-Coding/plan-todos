"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  ProgressBar,
  FadeIn,
} from "@/components/ui";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { useToast } from "@/components/ui/Toast";
import {
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  usePlansForMilestone,
  useTargetsForMilestone,
  useCirculationsForMilestone,
} from "@/hooks/useMilestones";
import type { Milestone } from "@/lib/api";

export function MilestonesView() {
  const toast = useToast();

  // Data fetching with React Query - parallel loading
  const { data: milestones = [], isLoading: milestonesLoading } =
    useMilestones();
  const { data: plans = [] } = usePlansForMilestone();
  const { data: targets = [] } = useTargetsForMilestone();
  const { data: circulations = [] } = useCirculationsForMilestone();

  // Mutations
  const createMilestoneMutation = useCreateMilestone({
    onSuccess: () => {
      toast.success("里程碑创建成功");
      closeForm();
    },
    onError: (error) => {
      alert(
        error instanceof Error ? error.message : "Failed to create milestone",
      );
      toast.error("创建失败");
    },
  });

  const updateMilestoneMutation = useUpdateMilestone({
    onError: () => {
      toast.error("操作失败");
    },
  });

  const deleteMilestoneMutation = useDeleteMilestone({
    onSuccess: () => {
      toast.success("里程碑已删除");
    },
    onError: () => {
      toast.error("操作失败");
    },
  });

  // UI State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [linkType, setLinkType] = useState<
    "plan" | "target" | "task" | "circulation"
  >("plan");
  const [linkId, setLinkId] = useState("");

  function closeForm() {
    setShowForm(false);
    setTitle("");
    setTargetDate("");
    setLinkId("");
  }

  function handleSubmit() {
    if (!title.trim() || !linkId) return;

    createMilestoneMutation.mutate({
      title,
      target_date: targetDate || undefined,
      biz_type: linkType,
      biz_id: linkId,
    });
  }

  function handleDelete(id: string) {
    deleteMilestoneMutation.mutate(id);
  }

  function handleToggle(m: Milestone) {
    const next = m.status === "completed" ? "pending" : "completed";
    updateMilestoneMutation.mutate({ id: m.id, status: next });
  }

  const getLinkLabel = (m: Milestone) => {
    if (m.biz_type === "plan")
      return `🚀 ${plans.find((p) => p.id === m.biz_id)?.title || "Plan"}`;
    if (m.biz_type === "target")
      return `🎯 ${targets.find((t) => t.id === m.biz_id)?.title || "Target"}`;
    if (m.biz_type === "task") return `📋 Task`;
    if (m.biz_type === "circulation")
      return `🔄 ${circulations.find((c) => c.id === m.biz_id)?.title || "Circulation"}`;
    return "未关联";
  };

  if (milestonesLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            MILESTONES
          </h2>
        </div>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          MILESTONES
        </h2>
        <Button onClick={() => setShowForm(true)}>+ 新建</Button>
      </div>

      <div className="space-y-4">
        {milestones.map((m, index) => (
          <FadeIn key={m.id} delay={index * 0.05} direction="up">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {m.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {getLinkLabel(m)}
                  </div>
                  {m.target_date && (
                    <div className="text-xs text-gray-400 mt-1">
                      目标日期: {m.target_date}
                    </div>
                  )}
                  <ProgressBar
                    value={m.progress}
                    color="teal"
                    size="sm"
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm px-2 py-1 rounded ${m.status === "completed" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {m.status === "completed" ? "已完成" : "进行中"}
                  </span>
                  <button
                    onClick={() => handleToggle(m)}
                    className="text-teal-600 hover:bg-teal-50 px-2 py-1 rounded text-sm"
                  >
                    {m.status === "completed" ? "↩️" : "✅"}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
        {milestones.length === 0 && (
          <EmptyStateCard
            icon="🚩"
            title="暂无里程碑"
            description="创建你的第一个里程碑来开始使用"
            action={
              <Button onClick={() => setShowForm(true)}>+ 创建里程碑</Button>
            }
          />
        )}
      </div>

      <Modal
        open={showForm}
        title="新建 Milestone"
        onClose={closeForm}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>创建</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="里程碑标题..."
            autoFocus
          />
          <Input
            label="目标日期"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              关联类型
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="linkType"
                  checked={linkType === "plan"}
                  onChange={() => {
                    setLinkType("plan");
                    setLinkId("");
                  }}
                />
                <span>Plan</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="linkType"
                  checked={linkType === "target"}
                  onChange={() => {
                    setLinkType("target");
                    setLinkId("");
                  }}
                />
                <span>Target</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="linkType"
                  checked={linkType === "circulation"}
                  onChange={() => {
                    setLinkType("circulation");
                    setLinkId("");
                  }}
                />
                <span>打卡</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {linkType === "plan"
                ? "选择计划"
                : linkType === "target"
                  ? "选择目标"
                  : "选择打卡"}
            </label>
            <select
              value={linkId}
              onChange={(e) => setLinkId(e.target.value)}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">请选择...</option>
              {linkType === "plan"
                ? plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))
                : linkType === "target"
                  ? targets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))
                  : circulations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
