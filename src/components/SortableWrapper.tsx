import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import React from "react";

interface Props<T> {
  items: T[];
  setItems: (items: T[]) => void;
  children: React.ReactNode;
  getId: (item: T) => string;
  onUpdateOrder: (newOrder: { _id: string; ranking: number }[]) => Promise<void>;
}

export default function SortableWrapper<T>({
  items,
  setItems,
  children,
  getId,
  onUpdateOrder,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = items.findIndex((m) => getId(m) === active.id);
    const newIndex = items.findIndex((m) => getId(m) === over.id);

    if (oldIndex !== newIndex) {
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);

      const ranked = newOrder.map((item, i) => ({
        _id: getId(item),
        ranking: i + 1,
      }));

      await onUpdateOrder(ranked);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={items.map(getId)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}
