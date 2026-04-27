import { useState } from "react";

import type { Priority, Todo } from "@/lib/types";

import type { TodoFilterMode } from "./todoFilters";

export type TodoViewMode = "list" | "calendar";

export interface TodoViewState {
  filter: TodoFilterMode;
  priorityFilter: Priority | "all";
  tagFilters: string[];
  showPriorityDropdown: boolean;
  showTagDropdown: boolean;
  searchQuery: string;
  viewMode: TodoViewMode;
  showForm: boolean;
  editingTodo: Todo | null;
  setFilter: React.Dispatch<React.SetStateAction<TodoFilterMode>>;
  setPriorityFilter: React.Dispatch<React.SetStateAction<Priority | "all">>;
  setTagFilters: React.Dispatch<React.SetStateAction<string[]>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setViewMode: React.Dispatch<React.SetStateAction<TodoViewMode>>;
  openCreateForm: () => void;
  openEditForm: (todo: Todo) => void;
  closeForm: () => void;
  togglePriorityDropdown: () => void;
  toggleTagDropdown: () => void;
  closeDropdowns: () => void;
}

export function useTodoViewState(): TodoViewState {
  const [filter, setFilter] = useState<TodoFilterMode>("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<TodoViewMode>("list");
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  function openCreateForm() {
    setEditingTodo(null);
    setShowForm(true);
  }

  function openEditForm(todo: Todo) {
    setEditingTodo(todo);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTodo(null);
  }

  function togglePriorityDropdown() {
    setShowPriorityDropdown((current) => !current);
    setShowTagDropdown(false);
  }

  function toggleTagDropdown() {
    setShowTagDropdown((current) => !current);
    setShowPriorityDropdown(false);
  }

  function closeDropdowns() {
    setShowPriorityDropdown(false);
    setShowTagDropdown(false);
  }

  return {
    filter,
    priorityFilter,
    tagFilters,
    showPriorityDropdown,
    showTagDropdown,
    searchQuery,
    viewMode,
    showForm,
    editingTodo,
    setFilter,
    setPriorityFilter,
    setTagFilters,
    setSearchQuery,
    setViewMode,
    openCreateForm,
    openEditForm,
    closeForm,
    togglePriorityDropdown,
    toggleTagDropdown,
    closeDropdowns,
  };
}
