"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { Calendar } from "@/components/ui/Calendar";
import { EmptyStateCard } from "@/components/features";
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
} from "@/hooks/useTodos";
import { useTags } from "@/hooks/useTags";
import { useBatchSelect } from "@/hooks/useBatchSelect";
import { useEntityOperations } from "@/hooks/useEntityOperations";
import { useFilteredTodos, useCalendarEvents } from "@/hooks/useEntityFilter";
import { BatchActionBar } from "@/components/features/BatchActionBar";
import { SelectableItem } from "@/components/features/SelectableItem";
import type { Todo, Priority } from "@/lib/types";
import { TodoItem } from "@/components/features/TodoItem";
import { TodoForm, type TodoFormData } from "@/components/features/TodoForm";
import { TodoFilters } from "@/components/features/TodoFilters";
import { SortableList } from "@/components/features/SortableList";
import { t } from "@/config/i18n";

export function TodosView() {
  const [filter, setFilter] = useState<
    "all" | "today" | "upcoming" | "completed"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const batchMode = useBatchSelect((s) => s.mode);
  const toggleBatchMode = useBatchSelect((s) => s.toggleMode);

  const { data: todosData, isLoading, error } = useTodos();
  const { data: allTags = [] } = useTags();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const reorderTodosMutation = useReorderTodos();

  const todos = todosData || [];

  const calendarEvents = useCalendarEvents(todos);

  const filteredTodos = useFilteredTodos({
    todos,
    filter,
    priorityFilter,
    tagFilters,
    searchQuery,
  });

  const operations = useEntityOperations({
    entityType: "todo",
    createMutation: createTodo,
    updateMutation: updateTodo,
    deleteMutation: deleteTodo,
    reorderMutation: reorderTodosMutation,
    completedStatus: "done",
    pendingStatus: "pending",
    messages: {
      created: t.todo.created,
      updated: t.todo.updated,
      deleted: t.todo.deleted,
      toggledDone: t.todo.completed,
      toggledUndone: t.todo.uncompleted,
      error: t.error.operationFailed,
      reminderError: t.error.reminderUpdateFailed,
    },
  });

  async function handleSave(data: TodoFormData, tags: string[]) {
    if (!data.title.trim()) return;
    const result = await operations.save(data, tags, {
      isEditing: !!editingTodo,
      editingId: editingTodo?.id,
    });
    if (result) {
      setShowForm(false);
      setEditingTodo(null);
    }
  }

  async function handleToggle(todo: Todo) {
    await operations.toggle(todo);
  }

  async function handleDelete(id: string) {
    await operations.remove(id, t.confirm.delete);
  }

  async function handleReminderUpdate(todoId: string, times: number[]) {
    await operations.updateReminder(todoId, times);
  }

  function handleEditClick(todo: Todo) {
    setEditingTodo(todo);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingTodo(null);
  }

  async function handleReorder(newItems: Todo[]) {
    await operations.reorder(newItems);
  }

  if (error) {
    return (
      <div className="p-2 sm:p-4 md:p-6">
        <p className="text-red-500">{t.error.networkError}: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          TODOS
        </h2>
        <div className="flex gap-2">
          <Button
            variant={batchMode ? "primary" : "secondary"}
            size="sm"
            onClick={toggleBatchMode}
          >
            {batchMode ? "退出多选" : "多选"}
          </Button>
          <Button onClick={() => setShowForm(true)}>+ 新建</Button>
        </div>
      </div>

      {/* Filters */}
      <TodoFilters
        filter={filter}
        priorityFilter={priorityFilter}
        tagFilters={tagFilters}
        searchQuery={searchQuery}
        viewMode={viewMode}
        allTags={allTags}
        showPriorityDropdown={showPriorityDropdown}
        showTagDropdown={showTagDropdown}
        onFilterChange={setFilter}
        onPriorityFilterChange={setPriorityFilter}
        onTagFilterChange={setTagFilters}
        onSearchChange={setSearchQuery}
        onViewModeChange={setViewMode}
        onPriorityDropdownToggle={() => {
          setShowPriorityDropdown(!showPriorityDropdown);
          setShowTagDropdown(false);
        }}
        onTagDropdownToggle={() => {
          setShowTagDropdown(!showTagDropdown);
          setShowPriorityDropdown(false);
        }}
      />

      {/* Click outside to close dropdowns */}
      {(showPriorityDropdown || showTagDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowPriorityDropdown(false);
            setShowTagDropdown(false);
          }}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <div className="text-gray-500">{t.loading.default}</div>
      ) : viewMode === "list" ? (
        <>
          {/* Batch Action Bar */}
          {batchMode && (
            <BatchActionBar
              entityType="todo"
              allIds={filteredTodos.map((todo) => todo.id)}
            />
          )}
          {filteredTodos.length > 0 ? (
            <SortableList
              items={filteredTodos}
              onReorder={handleReorder}
              getItemId={(todo) => todo.id}
              layout="vertical"
              renderItem={(todo) => (
                <SelectableItem id={todo.id}>
                  <TodoItem
                    todo={todo}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onClick={handleEditClick}
                    onReminderUpdate={handleReminderUpdate}
                  />
                </SelectableItem>
              )}
            />
          ) : (
            <EmptyStateCard
              icon="📋"
              title="暂无待办事项"
              description="创建你的第一个待办事项来开始使用"
              action={
                <Button onClick={() => setShowForm(true)}>+ 创建待办</Button>
              }
            />
          )}
        </>
      ) : (
        /* Calendar */
        <Card>
          <Calendar
            events={calendarEvents}
            onEventClick={(e) => console.log("Clicked:", e)}
          />
        </Card>
      )}

      {/* Form */}
      <TodoForm
        open={showForm}
        editingTodo={editingTodo}
        allTags={allTags}
        onClose={handleCloseForm}
        onSave={handleSave}
      />
    </div>
  );
}
