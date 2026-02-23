"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  ProgressBar,
  Checkbox,
  FadeIn,
} from "@/components/ui";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { useToast } from "@/components/ui/Toast";
import {
  usePlans,
  usePlanTags,
  usePlanTasks,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from "@/hooks/usePlans";
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/useTasks";
import { useTags } from "@/hooks/useTags";
import type { Plan, Task } from "@/lib/api";

export function PlansView() {
  const toast = useToast();

  // Data fetching with React Query
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: tags = [] } = useTags();

  // Mutations
  const createPlanMutation = useCreatePlan({
    onSuccess: () => {
      toast.success("计划创建成功");
      closeForm();
    },
    onError: () => {
      toast.error("操作失败");
    },
  });

  const updatePlanMutation = useUpdatePlan({
    onSuccess: () => {
      toast.success("计划更新成功");
      closeForm();
    },
    onError: () => {
      toast.error("操作失败");
    },
  });

  const deletePlanMutation = useDeletePlan({
    onSuccess: () => {
      toast.success("计划已删除");
    },
    onError: () => {
      toast.error("操作失败");
    },
  });

  const createTaskMutation = useCreateTask({
    onSuccess: () => {
      toast.success("任务创建成功");
      closeTaskForm();
    },
    onError: () => {
      toast.error("操作失败");
    },
  });

  const updateTaskMutation = useUpdateTask({
    onError: () => {
      toast.error("操作失败");
    },
  });

  const deleteTaskMutation = useDeleteTask({
    onSuccess: () => {
      toast.success("任务已删除");
    },
    onError: () => {
      toast.error("操作失败");
    },
  });

  // UI State
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function closeForm() {
    setShowForm(false);
    setEditingPlan(null);
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setSelectedTags([]);
  }

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

  function handleSubmitPlan() {
    if (!title.trim()) return;

    const planData = {
      title,
      description: description || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      tagIds: selectedTags,
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, ...planData });
    } else {
      createPlanMutation.mutate(planData);
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

  function handleDeletePlan(id: string) {
    if (!confirm("Delete plan and all tasks?")) return;
    deletePlanMutation.mutate(id);
  }

  function handleDeleteTask(id: string) {
    deleteTaskMutation.mutate(id);
  }

  function handleToggleTask(task: Task) {
    const next = task.status === "done" ? "pending" : "done";
    updateTaskMutation.mutate({ id: task.id, status: next });
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
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    );
  }

  // Filter plans by tags (OR logic)
  const filteredPlans = plans.filter((p) => {
    if (p.status === "archived") return false;
    if (tagFilters.length === 0) return true;
    // Note: For full tag filtering, we'd need to fetch tags for each plan
    // For now, just show all plans when filters are active but no tag data
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          PLANS
        </h2>
        <Button onClick={() => setShowForm(true)}>+ 新建 Plan</Button>
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

      <div className="space-y-4">
        {filteredPlans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            expandedPlans={expandedPlans}
            togglePlan={togglePlan}
            setSelectedPlanId={setSelectedPlanId}
            setShowTaskForm={setShowTaskForm}
            handleDeletePlan={handleDeletePlan}
            handleToggleTask={handleToggleTask}
            handleDeleteTask={handleDeleteTask}
          />
        ))}
        {filteredPlans.length === 0 && (
          <EmptyStateCard
            icon="📝"
            title="暂无计划"
            description="创建你的第一个计划来开始使用"
            action={
              <Button onClick={() => setShowForm(true)}>+ 创建计划</Button>
            }
          />
        )}
      </div>

      <Modal
        open={showForm}
        title={editingPlan ? "编辑 Plan" : "新建 Plan"}
        onClose={closeForm}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditingPlan(null);
                setSelectedTags([]);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitPlan}>
              {editingPlan ? "保存" : "创建"}
            </Button>
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
          {/* Tag selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标签
            </label>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id],
                    );
                  }}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedTags.includes(tag.id) ? "text-white" : ""
                  }`}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id)
                      ? tag.color
                      : `${tag.color}20`,
                    color: selectedTags.includes(tag.id) ? "white" : tag.color,
                    border: `1px solid ${tag.color}`,
                  }}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <span className="text-sm text-gray-400">
                  暂无标签，请在设置中创建
                </span>
              )}
            </div>
          </div>
        </div>
      </Modal>

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
  index: number;
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
  index,
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
    <FadeIn key={plan.id} delay={index * 0.05} direction="up">
      <Card>
        <div
          onClick={() => togglePlan(plan.id)}
          className="cursor-pointer"
        >
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
          <ProgressBar
            value={progress}
            color="teal"
            size="sm"
            className="mt-2"
          />
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
            {plan.start_date && plan.end_date && "~"}{" "}
            {plan.end_date || "进行中"}
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
    </FadeIn>
  );
}
