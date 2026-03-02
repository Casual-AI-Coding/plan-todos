"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { StaggeredList, StaggeredListItem } from "@/components/ui/animations";
import { Calendar } from "@/components/ui/Calendar";
import { EmptyStateCard } from "@/components/features";
import { useToast } from "@/components/ui/Toast";
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from "@/hooks/useTodos";
import { useTags } from "@/hooks/useTags";
import type { Todo, Priority } from "@/lib/types";
import { setEntityTags } from "@/lib/api";
import { TodoItem } from "@/components/features/TodoItem";
import { TodoForm, type TodoFormData } from "@/components/features/TodoForm";
import { TodoFilters } from "@/components/features/TodoFilters";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "todo" | "task" | "plan" | "milestone";
}

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

  const toast = useToast();

  // Use React Query hooks
  const { data: todosData, isLoading, error } = useTodos();
  const { data: allTags = [] } = useTags();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const todos = todosData || [];

  // Convert todos to calendar events
  const calendarEvents: CalendarEvent[] = todos
    .filter((t) => t.due_date)
    .map((t) => ({
      id: t.id,
      title: t.title,
      date: t.due_date!,
      type: "todo" as const,
    }));

  const filteredTodos = todos.filter((t) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !t.title.toLowerCase().includes(q) &&
        !t.content?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    // Priority filter
    if (priorityFilter !== "all" && t.priority !== priorityFilter) {
      return false;
    }
    // Tag filter (OR logic - multiple tags)
    if (tagFilters.length > 0) {
      // Note: This needs entity tags loaded - simplified for now
      const hasTag = tagFilters.some((tagId) =>
        (t as unknown as { tags?: { id: string }[] }).tags?.some(
          (tag) => tag.id === tagId,
        ),
      );
      if (!hasTag) return false;
    }
    // Status filter
    const today = new Date().toISOString().split("T")[0];
    if (filter === "today") return t.due_date?.startsWith(today);
    if (filter === "upcoming") return t.due_date && t.due_date > today;
    if (filter === "completed") return t.status === "done";
    return true;
  });

  async function handleSave(data: TodoFormData, tags: string[]) {
    if (!data.title.trim()) return;
    try {
      let todoId: string;
      if (editingTodo) {
        await updateTodo.mutateAsync({
          id: editingTodo.id,
          title: data.title,
          content: data.content,
          due_date: data.due_date,
          priority: data.priority,
        });
        todoId = editingTodo.id;
        toast.success("待办已更新");
      } else {
        const newTodo = await createTodo.mutateAsync({
          title: data.title,
          content: data.content,
          due_date: data.due_date,
          priority: data.priority,
        });
        todoId = newTodo.id;
        toast.success("待办已创建");
      }
      // Save tags
      await setEntityTags("todo", todoId, tags);
      setShowForm(false);
      setEditingTodo(null);
    } catch (e) {
      console.error(e);
      toast.error("操作失败");
    }
  }

  async function handleToggle(todo: Todo) {
    const next = todo.status === "done" ? "pending" : "done";
    try {
      await updateTodo.mutateAsync({ id: todo.id, status: next });
      toast.success(next === "done" ? "已完成" : "已取消完成");
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete?")) return;
    try {
      await deleteTodo.mutateAsync(id);
      toast.success("待办已删除");
    } catch (e) {
      console.error(e);
    }
  }

  function handleEditClick(todo: Todo) {
    setEditingTodo(todo);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingTodo(null);
  }

  if (error) {
    return (
      <div className="p-2 sm:p-4 md:p-6">
        <p className="text-red-500">加载失败: {error.message}</p>
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
        <Button onClick={() => setShowForm(true)}>+ 新建</Button>
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
        <div className="text-gray-500">加载中...</div>
      ) : viewMode === "list" ? (
        filteredTodos.length > 0 ? (
          <StaggeredList className="space-y-2" staggerDelay={50}>
            {filteredTodos.map((todo) => (
              <StaggeredListItem key={todo.id}>
                <TodoItem
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onClick={handleEditClick}
                />
              </StaggeredListItem>
            ))}
          </StaggeredList>
        ) : (
          <EmptyStateCard
            icon="📋"
            title="暂无待办事项"
            description="创建你的第一个待办事项来开始使用"
            action={
              <Button onClick={() => setShowForm(true)}>+ 创建待办</Button>
            }
          />
        )
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
        selectedTags={selectedTags}
        onClose={handleCloseForm}
        onSave={handleSave}
      />
    </div>
  );
}
