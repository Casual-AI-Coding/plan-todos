"use client";

import { useState, useMemo } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  ProgressBar,
  FadeIn,
} from "@/components/ui";
import { EmptyStateCard } from "@/components/features";
import {
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  usePlansForMilestone,
  useTargetsForMilestone,
  useCirculationsForMilestone,
} from "@/hooks/useMilestones";
import { useEntityOperations } from "@/hooks/useEntityOperations";
import { t } from "@/config/i18n";
import type { Milestone } from "@/lib/api";

export function MilestonesView() {
  const { data: milestones = [], isLoading: milestonesLoading } =
    useMilestones();
  const { data: plans = [] } = usePlansForMilestone();
  const { data: targets = [] } = useTargetsForMilestone();
  const { data: circulations = [] } = useCirculationsForMilestone();

  const createMilestone = useCreateMilestone({
    onSuccess: () => closeForm(),
  });
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();

  const operations = useEntityOperations({
    createMutation: createMilestone,
    updateMutation: updateMilestone,
    deleteMutation: deleteMilestone,
    completedStatus: "completed",
    pendingStatus: "pending",
    messages: {
      created: t.milestone.created,
      updated: t.milestone.updated,
      deleted: t.milestone.deleted,
      toggledDone: t.milestone.completed,
      toggledUndone: t.milestone.uncompleted,
      error: t.error.operationFailed,
    },
  });

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
    void operations.save({
      title,
      target_date: targetDate || undefined,
      biz_type: linkType,
      biz_id: linkId,
    });
  }

  async function handleDelete(id: string) {
    await operations.remove(id, t.confirm.delete);
  }

  async function handleToggle(m: Milestone) {
    await operations.toggle(m);
  }

  const linkLabels = useMemo(() => {
    const labels = new Map<string, { icon: string; label: string }>();
    for (const m of milestones) {
      switch (m.biz_type) {
        case "plan": {
          const plan = plans.find((p) => p.id === m.biz_id);
          labels.set(m.id, { icon: "🚀", label: plan?.title ?? "Plan" });
          break;
        }
        case "target": {
          const target = targets.find((tgt) => tgt.id === m.biz_id);
          labels.set(m.id, { icon: "🎯", label: target?.title ?? "Target" });
          break;
        }
        case "task":
          labels.set(m.id, { icon: "📋", label: "Task" });
          break;
        case "circulation": {
          const circ = circulations.find((c) => c.id === m.biz_id);
          labels.set(m.id, { icon: "🔄", label: circ?.title ?? "Circulation" });
          break;
        }
        default:
          labels.set(m.id, { icon: "", label: t.milestone.noLink });
      }
    }
    return labels;
  }, [milestones, plans, targets, circulations]);

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
        <div className="text-center py-12 text-gray-500">{t.loading.default}</div>
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
        <Button onClick={() => setShowForm(true)}>+ {t.action.create}</Button>
      </div>

      <div className="space-y-4">
        {milestones.map((m, index) => {
          const link = linkLabels.get(m.id);
          return (
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
                    {link && (
                      <div className="text-sm text-gray-500 mt-1">
                        {link.icon} {link.label}
                      </div>
                    )}
                    {m.target_date && (
                      <div className="text-xs text-gray-400 mt-1">
                        {m.target_date}
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
                      {m.status === "completed" ? t.status.completed : t.status.inProgress}
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
          );
        })}
        {milestones.length === 0 && (
          <EmptyStateCard
            icon="🚩"
            title={t.milestone.noLink}
            description="创建你的第一个里程碑来开始使用"
            action={
              <Button onClick={() => setShowForm(true)}>+ {t.action.create}</Button>
            }
          />
        )}
      </div>

      <Modal
        open={showForm}
        title={`+ ${t.action.create} Milestone`}
        onClose={closeForm}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              {t.action.cancel}
            </Button>
            <Button onClick={handleSubmit}>{t.action.create}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t.action.create}
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
                <span>{t.nav.circulations}</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {linkType === "plan"
                ? t.nav.plans
                : linkType === "target"
                  ? t.nav.goals
                  : t.nav.circulations}
            </label>
            <select
              value={linkId}
              onChange={(e) => setLinkId(e.target.value)}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">{t.action.select}...</option>
              {linkType === "plan"
                ? plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))
                : linkType === "target"
                  ? targets.map((tgt) => (
                      <option key={tgt.id} value={tgt.id}>
                        {tgt.title}
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
