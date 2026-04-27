"use client";

import { Card, Button } from "@/components/ui";
import { Calendar } from "@/components/ui/Calendar";
import { EmptyStateCard } from "@/components/features";
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
} from "@/domain/todo/todoQueries";
import { useTags } from "@/domain/tag/tagQueries";
import { useBatchSelect } from "@/hooks/useBatchSelect";
import { useEntityOperations } from "@/hooks/useEntityOperations";
import { filterTodos, toCalendarEvents } from "@/domain/todo/todoFilters";
import { useTodoViewState } from "@/domain/todo/todoViewState";
import { BatchActionBar } from "@/components/features/BatchActionBar";
import { SelectableItem } from "@/components/features/SelectableItem";
import type { Todo } from "@/lib/types";
import { TodoItem } from "@/components/features/TodoItem";
import { TodoForm, type TodoFormData } from "@/components/features/TodoForm";
import { TodoFilters } from "@/components/features/TodoFilters";
import { SortableList } from "@/components/features/SortableList";
import { t } from "@/config/i18n";

export function TodosView() {
  const view = useTodoViewState();

  const batchMode = useBatchSelect((s) => s.mode);
  const toggleBatchMode = useBatchSelect((s) => s.toggleMode);

  const { data: todosData, isLoading, error } = useTodos();
  const { data: allTags = [] } = useTags();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const reorderTodosMutation = useReorderTodos();

  const todos = todosData || [];

  const calendarEvents = toCalendarEvents(todos);

  const filteredTodos = filterTodos({
    todos,
    filter: view.filter,
    priorityFilter: view.priorityFilter,
    tagFilters: view.tagFilters,
    searchQuery: view.searchQuery,
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
      isEditing: !!view.editingTodo,
      editingId: view.editingTodo?.id,
    });
    if (result) {
      view.closeForm();
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
    view.openEditForm(todo);
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
          <Button onClick={view.openCreateForm}>+ 新建</Button>
        </div>
      </div>

      {/* Filters */}
      <TodoFilters
        filter={view.filter}
        priorityFilter={view.priorityFilter}
        tagFilters={view.tagFilters}
        searchQuery={view.searchQuery}
        viewMode={view.viewMode}
        allTags={allTags}
        showPriorityDropdown={view.showPriorityDropdown}
        showTagDropdown={view.showTagDropdown}
        onFilterChange={view.setFilter}
        onPriorityFilterChange={view.setPriorityFilter}
        onTagFilterChange={view.setTagFilters}
        onSearchChange={view.setSearchQuery}
        onViewModeChange={view.setViewMode}
        onPriorityDropdownToggle={view.togglePriorityDropdown}
        onTagDropdownToggle={view.toggleTagDropdown}
      />

      {/* Click outside to close dropdowns */}
      {(view.showPriorityDropdown || view.showTagDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={view.closeDropdowns}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <div className="text-gray-500">{t.loading.default}</div>
      ) : view.viewMode === "list" ? (
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
              getItemId={(todo: Todo) => todo.id}
              layout="vertical"
              renderItem={(todo: Todo) => (
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
                <Button onClick={view.openCreateForm}>+ 创建待办</Button>
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
        open={view.showForm}
        editingTodo={view.editingTodo}
        allTags={allTags}
        onClose={view.closeForm}
        onSave={handleSave}
      />
    </div>
  );
}
