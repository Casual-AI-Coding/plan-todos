"use client";

import { useState } from "react";
import { Card, Button, Modal, Checkbox } from "@/components/ui";
import { ImportExportView } from "./ImportExportView";
import { seedTestData, resetData } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { todoKeys } from "@/hooks/useTodos";
import { planKeys } from "@/hooks/usePlans";
import { targetKeys } from "@/hooks/useTargets";
import { taskKeys } from "@/hooks/useTasks";
import { tagKeys } from "@/hooks/useTags";
import { circulationKeys } from "@/hooks/useCirculations";
import { dashboardKeys } from "@/hooks/useDashboard";
import { statisticsKeys } from "@/hooks/useStatistics";
import { milestoneKeys } from "@/hooks/useMilestones";
import { Icons } from "@/components/ui/Icons";
import { Database } from "lucide-react";

export function DataManagementView() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Operation result messages
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Seed modal state
  const [showSeedModal, setShowSeedModal] = useState(false);

  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [keepTags, setKeepTags] = useState(true);
  const [keepSettings, setKeepSettings] = useState(true);

  const handleSeedConfirm = async () => {
    setShowSeedModal(false);
    setIsLoading(true);
    setMessage(null);
    try {
      const seedResult = await seedTestData();
      // Invalidate all queries to refresh UI
      queryClient.invalidateQueries({ queryKey: todoKeys.todos });
      queryClient.invalidateQueries({ queryKey: planKeys.plans });
      queryClient.invalidateQueries({ queryKey: targetKeys.targets });
      queryClient.invalidateQueries({ queryKey: taskKeys.tasks });
      queryClient.invalidateQueries({ queryKey: tagKeys.tags });
      queryClient.invalidateQueries({ queryKey: circulationKeys.circulations });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: statisticsKeys.statistics });
      queryClient.invalidateQueries({ queryKey: milestoneKeys.milestones });
      setMessage({
        type: "success",
        text: `测试数据生成成功！已添加 ${seedResult.todos} 个待办、${seedResult.plans} 个计划、${seedResult.circulations} 个打卡等`,
      });
    } catch (error) {
      console.error("Failed to seed test data:", error);
      setMessage({
        type: "error",
        text: "生成测试数据失败: " + (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConfirm = async () => {
    setShowResetModal(false);
    setIsLoading(true);
    setMessage(null);
    try {
      await resetData({ keep_tags: keepTags, keep_settings: keepSettings });
      // Invalidate all queries to refresh UI
      queryClient.invalidateQueries({ queryKey: todoKeys.todos });
      queryClient.invalidateQueries({ queryKey: planKeys.plans });
      queryClient.invalidateQueries({ queryKey: targetKeys.targets });
      queryClient.invalidateQueries({ queryKey: taskKeys.tasks });
      queryClient.invalidateQueries({ queryKey: tagKeys.tags });
      queryClient.invalidateQueries({ queryKey: circulationKeys.circulations });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: statisticsKeys.statistics });
      queryClient.invalidateQueries({ queryKey: milestoneKeys.milestones });
      const kept = [];
      if (keepTags) kept.push("标签");
      if (keepSettings) kept.push("设置");
      setMessage({
        type: "success",
        text: `数据重置成功！${kept.length > 0 ? `（已保留${kept.join("和")}）` : ""}`,
      });
    } catch (error) {
      console.error("Failed to reset data:", error);
      setMessage({
        type: "error",
        text: "重置数据失败: " + (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--color-text)" }}
      >
        数据管理
      </h2>

      {/* Section 1: Import/Export */}
      <div className="mb-8">
        <h3
          className="text-sm font-medium uppercase tracking-wider mb-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          备份与恢复
        </h3>
        <ImportExportView />
      </div>

      {/* Section 2: Data Operations */}
      <div className="mb-6">
        <h3
          className="text-sm font-medium uppercase tracking-wider mb-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          数据操作
        </h3>

        <Card className="p-6" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
          <div className="flex items-start gap-4">
            {/* Warning Icon */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <Icons.AlertTriangle
                className="w-5 h-5"
                style={{ color: "#EF4444" }}
              />
            </div>

            <div className="flex-1">
              <h4
                className="font-medium mb-1"
                style={{ color: "var(--color-text)" }}
              >
                危险操作区域
              </h4>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--color-text-muted)" }}
              >
                生成测试数据会添加示例数据到数据库，重置数据会清空所有业务数据。请谨慎操作。
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowSeedModal(true)}
                  disabled={isLoading}
                  variant="secondary"
                  className="gap-2"
                >
                  <Database className="w-4 h-4" />
                  {isLoading ? "处理中..." : "生成测试数据"}
                </Button>
                <Button
                  onClick={() => setShowResetModal(true)}
                  disabled={isLoading}
                  variant="danger"
                  className="gap-2"
                >
                  <Icons.Trash2 className="w-4 h-4" />
                  {isLoading ? "处理中..." : "重置数据"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Operation Result Message */}
      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg text-sm mb-6 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {message.type === "success" ? (
              <Icons.Check className="w-5 h-5" />
            ) : (
              <Icons.AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>{message.text}</div>
        </div>
      )}

      {/* Seed Data Confirmation Modal */}
      <Modal
        open={showSeedModal}
        title="生成测试数据"
        onClose={() => setShowSeedModal(false)}
        width="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSeedModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSeedConfirm}>
              确认生成
            </Button>
          </>
        }
      >
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          <p className="mb-3">
            确定要生成测试数据吗？这将在当前数据库中添加以下示例数据：
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>6 个标签 (工作、生活、学习、健康、娱乐、财务)</li>
            <li>10 个待办事项</li>
            <li>3 个计划</li>
            <li>15 个任务</li>
            <li>5 个目标</li>
            <li>10 个步骤</li>
            <li>5 个里程碑</li>
            <li>8 个打卡</li>
            <li>30 条打卡记录</li>
          </ul>
        </div>
      </Modal>

      {/* Reset Data Confirmation Modal */}
      <Modal
        open={showResetModal}
        title="重置数据"
        onClose={() => setShowResetModal(false)}
        width="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowResetModal(false)}
            >
              取消
            </Button>
            <Button variant="danger" onClick={handleResetConfirm}>
              确认重置
            </Button>
          </>
        }
      >
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          <p className="mb-4">
            <span className="font-medium text-red-600">警告：</span>
            此操作将清空所有业务数据（待办、计划、任务、目标、步骤、里程碑、打卡记录），请谨慎操作！
          </p>

          <div className="flex flex-col gap-4 mt-4">
            <Checkbox
              checked={keepTags}
              onChange={(e) => setKeepTags(e.target.checked)}
              label="保留标签"
            />
            <Checkbox
              checked={keepSettings}
              onChange={(e) => setKeepSettings(e.target.checked)}
              label="保留设置"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
