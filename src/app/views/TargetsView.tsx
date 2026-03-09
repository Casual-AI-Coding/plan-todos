"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  ProgressBar,
  Checkbox,
} from "@/components/ui";
import { StaggeredList, StaggeredListItem } from "@/components/ui/animations";
import { EmptyStateCard, TargetForm } from "@/components/features";
import { useToast } from "@/components/ui/Toast";
import {
  useTargets,
  useTargetTags,
  useTargetSteps,
  useCreateTarget,
  useDeleteTarget,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
} from "@/hooks/useTargets";
import { useTags } from "@/hooks/useTags";
import type { Target, Step } from "@/lib/api";
import type { TargetFormData } from "@/components/features/TargetForm";
import {
  setEntityTags,
  updateTarget as updateTargetApi,
  getNotificationSettings,
} from "@/lib/api";

interface TargetCardProps {
  target: Target;
  index: number;
  expandedTargets: Set<string>;
  toggleTarget: (id: string) => void;
  selectedTargetId: string;
  setSelectedTargetId: (id: string) => void;
  setShowStepForm: (show: boolean) => void;
  setEditingTarget: (target: Target | null) => void;
  setEditingReminderTimes: (times: number[]) => void;
  setShowForm: (show: boolean) => void;
  handleDeleteTarget: (id: string) => void;
  handleToggleStep: (step: Step) => void;
  handleDeleteStep: (id: string) => void;
}

function TargetCard({
  target,
  index: _index,
  expandedTargets,
  toggleTarget,
  setSelectedTargetId,
  setShowStepForm,
  setEditingTarget,
  setEditingReminderTimes,
  setShowForm,
  handleDeleteTarget,
  handleToggleStep,
  handleDeleteStep,
}: TargetCardProps) {
  const { data: targetTags = [] } = useTargetTags(target.id);
  const { data: targetSteps = [] } = useTargetSteps(target.id);

  const totalWeight = targetSteps.reduce((sum, s) => sum + s.weight, 0);

  const handleEditClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTarget(target);
    // Fetch reminder times for this target
    try {
      const settings = await getNotificationSettings("target", target.id);
      if (settings && settings.reminder_minutes) {
        setEditingReminderTimes([settings.reminder_minutes]);
      } else {
        setEditingReminderTimes([]);
      }
    } catch {
      setEditingReminderTimes([]);
    }
    setShowForm(true);
  };

  return (
    <Card>
      <div onClick={() => toggleTarget(target.id)} className="cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {expandedTargets.has(target.id) ? "▼" : "▶"}
            </span>
            <span
              className="font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {target.title}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-orange-500 font-medium">
              {target.progress}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTargetId(target.id);
                setShowStepForm(true);
              }}
              className="text-orange-500 hover:bg-orange-50 px-2 py-1 rounded text-sm"
            >
              + Step
            </button>
            <button
              onClick={handleEditClick}
              className="text-gray-400 hover:text-blue-500 px-2"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTarget(target.id);
              }}
              className="text-gray-400 hover:text-red-500 px-2"
            >
              🗑️
            </button>
          </div>
        </div>
        <ProgressBar
          value={target.progress}
          color="orange"
          size="sm"
          className="mt-2"
        />
        {/* Tags display */}
        {targetTags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {targetTags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          权重总和: {totalWeight}/100
          {target.due_date && (
            <span className="ml-2">📅 {target.due_date}</span>
          )}
        </div>
        {expandedTargets.has(target.id) && (
          <div className="mt-4 pl-6 space-y-2 border-l-2 border-orange-200 ml-4">
            {targetSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded"
              >
                <Checkbox
                  checked={step.status === "completed"}
                  onChange={() => handleToggleStep(step)}
                />
                <span className="flex-1">{step.title}</span>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                  {step.weight}%
                </span>
                <button
                  onClick={() => handleDeleteStep(step.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            ))}
            {targetSteps.length === 0 && (
              <p className="text-gray-400 text-sm">暂无步骤</p>
            )}
            {totalWeight < 100 && (
              <p className="text-xs text-orange-500 mt-2">
                剩余可用权重: {100 - totalWeight}%
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export function TargetsView() {
  const toast = useToast();

  // Data fetching with React Query
  const { data: targets = [], isLoading: targetsLoading } = useTargets();
  const { data: tags = [] } = useTags();

  // Mutations
  const createTargetMutation = useCreateTarget({
    onSuccess: () => {
      toast.success("目标创建成功");
      closeForm();
    },
    onError: () => {
      toast.error("操作失败");
    },
  });

  const deleteTargetMutation = useDeleteTarget({
    onSuccess: () => {
      toast.success("目标已删除");
    },
    onError: () => {
      toast.error("操作失败");
    },
  });

  const createStepMutation = useCreateStep({
    onSuccess: () => {
      toast.success("步骤添加成功");
      closeStepForm();
    },
    onError: (error) => {
      alert(
        error instanceof Error ? error.message : "Weight would exceed 100%",
      );
    },
  });

  const updateStepMutation = useUpdateStep({
    onError: () => {
      toast.error("操作失败");
    },
  });

  const deleteStepMutation = useDeleteStep({
    onSuccess: () => {
      toast.success("步骤已删除");
    },
    onError: () => {
      toast.error("操作失败");
    },
  });

  // UI State
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(
    new Set(),
  );
  const [showForm, setShowForm] = useState(false);
  const [showStepForm, setShowStepForm] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [editingReminderTimes, setEditingReminderTimes] = useState<number[]>(
    [],
  );
  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function closeForm() {
    setShowForm(false);
    setEditingTarget(null);
    setEditingReminderTimes([]);
    setSelectedTags([]);
  }

  function closeStepForm() {
    setShowStepForm(false);
    setSelectedTargetId("");
    setTitle("");
    setWeight(0);
  }

  function toggleTarget(targetId: string) {
    setExpandedTargets((prev) => {
      const next = new Set(prev);
      if (next.has(targetId)) next.delete(targetId);
      else next.add(targetId);
      return next;
    });
  }

  async function handleSaveTarget(data: TargetFormData, tagIds: string[]) {
    if (editingTarget) {
      // Update existing target
      await updateTargetApi(editingTarget.id, {
        title: data.title,
        description: data.description,
        due_date: data.due_date,
      });
      await setEntityTags("target", editingTarget.id, tagIds);
      toast.success("目标更新成功");
    } else {
      // Create new target
      const targetData = {
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        tagIds,
      };
      createTargetMutation.mutate(targetData);
    }
    closeForm();
  }

  function handleSubmitStep() {
    if (!title.trim() || !selectedTargetId) return;

    createStepMutation.mutate({
      target_id: selectedTargetId,
      title,
      weight,
    });
  }

  function handleDeleteTarget(id: string) {
    if (!confirm("Delete target and all steps?")) return;
    deleteTargetMutation.mutate(id);
  }

  function handleDeleteStep(id: string) {
    deleteStepMutation.mutate(id);
  }

  function handleToggleStep(step: Step) {
    const next = step.status === "completed" ? "pending" : "completed";
    updateStepMutation.mutate({ id: step.id, status: next });
  }

  // Loading state
  if (targetsLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            GOALS
          </h2>
        </div>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    );
  }

  // Filter targets by tags (OR logic)
  const filteredTargets = targets.filter((t) => {
    if (t.status === "archived") return false;
    if (tagFilters.length === 0) return true;
    return true; // Note: For full tag filtering, we'd need to fetch tags for each target
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          GOALS
        </h2>
        <Button
          onClick={() => {
            setEditingTarget(null);
            setEditingReminderTimes([]);
            setShowForm(true);
          }}
        >
          + 新建 Target
        </Button>
      </div>

      {/* Tag filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="text-sm text-gray-600 py-2">标签:</span>
        <button
          onClick={() => setTagFilters([])}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            tagFilters.length === 0
              ? "bg-teal-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          全部
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() =>
              setTagFilters((prev) =>
                prev.includes(tag.id)
                  ? prev.filter((t) => t !== tag.id)
                  : [...prev, tag.id],
              )
            }
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              tagFilters.includes(tag.id) ? "text-white" : ""
            }`}
            style={{
              backgroundColor: tagFilters.includes(tag.id)
                ? tag.color
                : `${tag.color}20`,
              color: tagFilters.includes(tag.id) ? "white" : tag.color,
            }}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {filteredTargets.length > 0 ? (
        <StaggeredList className="space-y-4" staggerDelay={80}>
          {filteredTargets.map((target, index) => (
            <StaggeredListItem key={target.id}>
              <TargetCard
                target={target}
                index={index}
                expandedTargets={expandedTargets}
                toggleTarget={toggleTarget}
                selectedTargetId={selectedTargetId}
                setSelectedTargetId={setSelectedTargetId}
                setShowStepForm={setShowStepForm}
                setEditingTarget={setEditingTarget}
                setEditingReminderTimes={setEditingReminderTimes}
                setShowForm={setShowForm}
                handleDeleteTarget={handleDeleteTarget}
                handleToggleStep={handleToggleStep}
                handleDeleteStep={handleDeleteStep}
              />
            </StaggeredListItem>
          ))}
        </StaggeredList>
      ) : (
        <EmptyStateCard
          icon="🎯"
          title="暂无目标"
          description="创建你的第一个目标来开始使用"
          action={
            <Button
              onClick={() => {
                setEditingTarget(null);
                setEditingReminderTimes([]);
                setShowForm(true);
              }}
            >
              + 创建目标
            </Button>
          }
        />
      )}

      <TargetForm
        open={showForm}
        editingTarget={editingTarget}
        allTags={tags}
        selectedTags={selectedTags}
        editingReminderTimes={editingReminderTimes}
        onClose={closeForm}
        onSave={handleSaveTarget}
      />

      <Modal
        open={showStepForm}
        title="新建 Step"
        onClose={closeStepForm}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStepForm(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitStep}>创建</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="步骤标题..."
            autoFocus
          />
          <Input
            label="权重 (%)"
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </div>
      </Modal>
    </div>
  );
}
