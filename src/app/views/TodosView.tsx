"use client";

import { useState, useEffect, useRef } from "react";
import { Card, Button, FadeIn } from "@/components/ui";
import { Calendar } from "@/components/ui/Calendar";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { useToast } from "@/components/ui/Toast";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  Todo,
  Priority,
  Tag,
  getTags,
  getEntityTags,
  setEntityTags,
} from "@/lib/api";
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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
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

  const isLoaded = useRef(false);
  const toast = useToast();

  async function loadTodos() {
    try {
      const data = await getTodos();
      // Load tags for each todo
      const todosWithTags = await Promise.all(
        data.map(async (todo) => {
          const tags = await getEntityTags("todo", todo.id);
          return { ...todo, tags };
        }),
      );
      if (isLoaded.current) setTodos(todosWithTags);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTags() {
    try {
      const tags = await getTags();
      if (isLoaded.current) setAllTags(tags);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (isLoaded.current) return;
    isLoaded.current = true;
    loadTodos();
  }, []);  
  useEffect(() => {
    if (isLoaded.current) return;
    isLoaded.current = true;
    loadTags();
  }, []);  

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
      const todoTagIds = (t.tags || []).map((tag) => tag.id);
      const hasTag = tagFilters.some((tagId) => todoTagIds.includes(tagId));
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
        await updateTodo(editingTodo.id, {
          title: data.title,
          content: data.content,
          due_date: data.due_date,
          priority: data.priority,
        });
        todoId = editingTodo.id;
        toast.success("待办已更新");
      } else {
        const newTodo = await createTodo({
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
      loadTodos();
    } catch (e) {
      console.error(e);
      toast.error("操作失败");
    }
  }

  async function handleToggle(todo: Todo) {
    const next = todo.status === "done" ? "pending" : "done";
    await updateTodo(todo.id, { status: next });
    toast.success(next === "done" ? "已完成" : "已取消完成");
    loadTodos();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete?")) return;
    await deleteTodo(id);
    toast.success("待办已删除");
    loadTodos();
  }

  function handleEditClick(todo: Todo) {
    setEditingTodo(todo);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingTodo(null);
  }

  // Remove unused state for form since TodoForm handles it internally
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      {viewMode === "list" ? (
        /* List */
        <div className="space-y-2">
          {filteredTodos.map((todo, index) => (
            <FadeIn key={todo.id} delay={index * 0.05} direction="up">
              <TodoItem
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onClick={handleEditClick}
              />
            </FadeIn>
          ))}
          {filteredTodos.length === 0 && (
            <EmptyStateCard
              icon="📋"
              title="暂无待办事项"
              description="创建你的第一个待办事项来开始使用"
              action={
                <Button onClick={() => setShowForm(true)}>+ 创建待办</Button>
              }
            />
          )}
        </div>
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
