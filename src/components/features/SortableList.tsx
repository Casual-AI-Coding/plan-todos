"use client";

import { ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => ReactNode;
  getItemId: (item: T) => string;
}

function SortableItem<T>({
  item,
  index,
  renderItem,
  getItemId,
}: SortableItemProps<T>) {
  const id = getItemId(item);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {renderItem(item, index)}
    </div>
  );
}

interface SortableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  getItemId: (item: T) => string;
  layout?: "vertical" | "horizontal";
}

export function SortableList<T>({
  items,
  onReorder,
  renderItem,
  getItemId,
  layout = "horizontal",
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
    const newIndex = items.findIndex((item) => getItemId(item) === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const containerClass =
    layout === "vertical" ? "flex flex-col gap-2" : "flex flex-wrap gap-4";
  const sortStrategy =
    layout === "vertical" ? verticalListSortingStrategy : rectSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(getItemId)} strategy={sortStrategy}>
        <div className={containerClass}>
          {items.map((item, index) => (
            <SortableItem
              key={getItemId(item)}
              item={item}
              index={index}
              renderItem={renderItem}
              getItemId={getItemId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default SortableList;
