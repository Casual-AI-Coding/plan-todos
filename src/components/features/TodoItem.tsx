"use client";

import React from "react";

import { Card, Checkbox } from "@/components/ui";
import type { Todo } from "@/lib/api";

export interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onClick: (todo: Todo) => void;
}

/**
 * Custom comparison function for React.memo
 * Only re-render if todo data changes
 */
function areEqual(prevProps: TodoItemProps, nextProps: TodoItemProps): boolean {
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.title === nextProps.todo.title &&
    prevProps.todo.status === nextProps.todo.status &&
    prevProps.todo.priority === nextProps.todo.priority &&
    JSON.stringify(prevProps.todo.tags) === JSON.stringify(nextProps.todo.tags)
  );
}

export const TodoItem = React.memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
  onClick,
}: TodoItemProps) {
  const priorityColors: Record<string, string> = {
    P0: "bg-red-100 text-red-700",
    P1: "bg-orange-100 text-orange-700",
    P2: "bg-gray-100 text-gray-600",
    P3: "bg-blue-100 text-blue-700",
  };

  return (
    <Card
      hoverable
      onClick={() => onClick(todo)}
      onKeyDown={(e) => e.key === "Enter" && onClick(todo)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={todo.status === "done"}
          onChange={() => onToggle(todo)}
          onClick={(e) => e.stopPropagation()}
        />
        {/* Priority badge */}
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[todo.priority]}`}
        >
          {todo.priority}
        </span>
        <div className="flex-1">
          <div
            className={
              todo.status === "done" ? "line-through text-gray-400" : ""
            }
          >
            {todo.title}
          </div>
          {/* Tags display */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {todo.tags.map((tag) => (
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
          {todo.due_date && (
            <div className="text-xs text-gray-500 mt-1">
              📅 {new Date(todo.due_date).toLocaleDateString()}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(todo.id);
          }}
          className="text-gray-400 hover:text-red-500 px-2"
        >
          🗑️
        </button>
      </div>
    </Card>
  );
}, areEqual);
