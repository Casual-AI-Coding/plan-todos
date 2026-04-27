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
import { EmptyStateCard } from "@/components/features";
import {
  usePlans,
  usePlanTags,
  usePlanTasks,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useReorderPlans,
} from "@/domain/plan/planQueries";
import { useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useTags } from "@/domain/tag/tagQueries";
import { useBatchSelect } from "@/hooks/useBatchSelect";
import { useEntityOperations } from "@/hooks/useEntityOperations";
import { useFilteredPlans } from "@/hooks/useEntityFilter";
import { BatchActionBar } from "@/components/features/BatchActionBar";
import { SelectableItem } from "@/components/features/SelectableItem";
import type { Plan, Task } from "@/lib/api";
import { PlanForm, type PlanFormData } from "@/components/features/PlanForm";
import { SortableList } from "@/components/features/SortableList";
import { t } from "@/config/i18n";

export function PlansView() {
  // Batch mode state
  const batchMode = useBatchSelect((s) => s.mode);
  const toggleBatchMode = useBatchSelect((s) => s.toggleMode);

  // Data fetching with React Query
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: tags = [] } = useTags();

  // Mutations
  const createPlanMutation = useCreatePlan({});
  const updatePlanMutation = useUpdatePlan({});
  const deletePlanMutation = useDeletePlan({});
  const reorderPlansMutation = useReorderPlans();

  // Task mutations - keep intact
  const createTaskMutation = useCreateTask({
    onSuccess: () => {
      closeTaskForm();
    },
  });

  const updateTaskMutation = useUpdateTask({});
  const deleteTaskMutation = useDeleteTask({});

  // UI State
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingReminderTimes, setEditingReminderTimes] = useState<number[]>(
    [],
  );

  const selectedTags: string[] = [];

  function closeForm() {
    setShowForm(false);
    setEditingPlan(null);
    setTitle("");
    setStartDate("");
    setEndDate("");
    setEditingReminderTimes([]);
  }

  const filteredPlans = useFilteredPlans({
    plans,
    tagFilters,
    showArchived: false,
  });

  function closeTaskForm() {
    setShowTaskForm(false);
    setSelectedPlanId("");
    setTitle("");
    setStartDate("");
    setEndDate("");
  }

  function togglePlan(planId: string) {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) next.delete(planId);
      else next.add(planId);
      return next;
    });
  }

  const operations = useEntityOperations({
    entityType: "plan",
    createMutation: createPlanMutation,
    updateMutation: updatePlanMutation,
    deleteMutation: deletePlanMutation,
    reorderMutation: reorderPlansMutation,
    completedStatus: "completed",
    pendingStatus: "active",
    messages: {
      created: t.plan.created,
      updated: t.plan.updated,
      deleted: t.plan.deleted,
      toggledDone: t.plan.completed,
      toggledUndone: t.plan.uncompleted,
      error: t.error.operationFailed,
      reminderError: t.error.reminderUpdateFailed,
    },
  });

  async function handleSavePlan(data: PlanFormData, formTags: string[]) {
    const planData = {
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
    };

    const result = await operations.save(planData, formTags, {
      isEditing: !!editingPlan,
      editingId: editingPlan?.id,
    });

    if (result) {
      if (data.reminder_times && data.reminder_times.length > 0) {
        await operations.updateReminder(result.id, data.reminder_times);
      }
      closeForm();
    }
  }

  function handleSubmitTask() {
    if (!title.trim() || !selectedPlanId) return;

    createTaskMutation.mutate({
      plan_id: selectedPlanId,
      title,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  }

  async function handleDeletePlan(id: string) {
    await operations.remove(id, t.confirm.delete);
  }

  function handleDeleteTask(id: string) {
    deleteTaskMutation.mutate(id);
  }

  function handleToggleTask(task: Task) {
    const next = task.status === "done" ? "pending" : "done";
    updateTaskMutation.mutate({ id: task.id, status: next });
  }

  async function handleReorder(newItems: Plan[]) {
    await operations.reorder(newItems);
  }

  // Loading state
  if (plansLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            PLANS
          </h2>
        </div>
        <div className="text-center py-12 text-gray-500">
          {t.loading.default}
        </div>
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
          PLANS
        </h2>
        <div className="flex gap-2">
          <Button
            variant={batchMode ? "primary" : "secondary"}
            size="sm"
            onClick={toggleBatchMode}
          >
            {batchMode ? "退出多选" : "多选"}
          </Button>
          <Button onClick={() => setShowForm(true)}>+ 新建 Plan</Button>
        </div>
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

      {/* Batch Action Bar */}
      {batchMode && (
        <BatchActionBar
          entityType="plan"
          allIds={filteredPlans.map((plan) => plan.id)}
        />
      )}

      {filteredPlans.length > 0 ? (
        <SortableList
          items={filteredPlans}
          onReorder={handleReorder}
          getItemId={(plan) => plan.id}
          layout="vertical"
          renderItem={(plan) => (
            <SelectableItem id={plan.id}>
              <PlanCard
                plan={plan}
                expandedPlans={expandedPlans}
                togglePlan={togglePlan}
                setSelectedPlanId={setSelectedPlanId}
                setShowTaskForm={setShowTaskForm}
                handleDeletePlan={handleDeletePlan}
                handleToggleTask={handleToggleTask}
                handleDeleteTask={handleDeleteTask}
              />
            </SelectableItem>
          )}
        />
      ) : (
        <EmptyStateCard
          icon="📝"
          title="暂无计划"
          description="创建你的第一个计划来开始使用"
          action={<Button onClick={() => setShowForm(true)}>+ 创建计划</Button>}
        />
      )}

      <PlanForm
        open={showForm}
        editingPlan={editingPlan}
        allTags={tags}
        selectedTags={selectedTags}
        editingReminderTimes={editingReminderTimes}
        onClose={closeForm}
        onSave={handleSavePlan}
      />

      <Modal
        open={showTaskForm}
        title="新建 Task"
        onClose={closeTaskForm}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowTaskForm(false);
                setTitle("");
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitTask}>创建</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="任务标题..."
            autoFocus
          />
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
        </div>
      </Modal>
    </div>
  );
}

// PlanCard subcomponent - handles its own data fetching
interface PlanCardProps {
  plan: Plan;
  expandedPlans: Set<string>;
  togglePlan: (id: string) => void;
  setSelectedPlanId: (id: string) => void;
  setShowTaskForm: (show: boolean) => void;
  handleDeletePlan: (id: string) => void;
  handleToggleTask: (task: Task) => void;
  handleDeleteTask: (id: string) => void;
}

function PlanCard({
  plan,
  expandedPlans,
  togglePlan,
  setSelectedPlanId,
  setShowTaskForm,
  handleDeletePlan,
  handleToggleTask,
  handleDeleteTask,
}: PlanCardProps) {
  const { data: planTags = [] } = usePlanTags(plan.id);
  const { data: planTasks = [] } = usePlanTasks(plan.id);

  const progress =
    planTasks.length > 0
      ? Math.round(
          (planTasks.filter((t) => t.status === "done").length /
            planTasks.length) *
            100,
        )
      : 0;
  const doneCount = planTasks.filter((t) => t.status === "done").length;

  return (
    <Card>
      <div onClick={() => togglePlan(plan.id)} className="cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {expandedPlans.has(plan.id) ? "▼" : "▶"}
            </span>
            <span
              className="font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {plan.title}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-teal-600 text-sm">{progress}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlanId(plan.id);
                setShowTaskForm(true);
              }}
              className="text-teal-600 hover:bg-teal-50 px-2 py-1 rounded text-sm"
            >
              + Task
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePlan(plan.id);
              }}
              className="text-gray-400 hover:text-red-500 px-2"
            >
              🗑️
            </button>
          </div>
        </div>
        <ProgressBar value={progress} color="teal" size="sm" className="mt-2" />
        {/* Tags display */}
        {planTags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {planTags.map((tag) => (
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
          {plan.start_date && `📅 ${plan.start_date}`}{" "}
          {plan.start_date && plan.end_date && "~"} {plan.end_date || "进行中"}
          {planTasks.length > 0 && (
            <span className="ml-2">
              ({doneCount}/{planTasks.length} Task)
            </span>
          )}
        </div>
        {expandedPlans.has(plan.id) && (
          <div className="mt-4 pl-6 space-y-2 border-l-2 border-teal-200 ml-4">
            {planTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded"
              >
                <Checkbox
                  checked={task.status === "done"}
                  onChange={() => handleToggleTask(task)}
                />
                <span
                  className={
                    task.status === "done"
                      ? "line-through text-gray-400 flex-1"
                      : "flex-1"
                  }
                >
                  {task.title}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            ))}
            {planTasks.length === 0 && (
              <p className="text-gray-400 text-sm">暂无任务</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
