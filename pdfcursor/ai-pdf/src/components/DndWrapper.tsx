import { DraggableItemDataType } from "@/models/OutlineItem";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

interface DndWrapperPropsType {
  children: React.ReactNode;
  onItemDragStart: (item: DraggableItemDataType) => void;
  onItemDragEnd: (item: DraggableItemDataType) => void;
}

export default function DndWrapper(props: DndWrapperPropsType) {
  const { children, onItemDragEnd, onItemDragStart } = props;

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, // Drag starts after pointer moves 5 pixels
    },
  });
  const sensors = useSensors(pointerSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const danglingItem = event.active.data.current as DraggableItemDataType;
    onItemDragStart(danglingItem);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Check if an item was dropped over the specific form field droppable area
    if (over && over.id === "droppable") {
      const draggedItemData = active.data.current;
      if (draggedItemData) {
        const draggedItem = draggedItemData as DraggableItemDataType;
        onItemDragEnd(draggedItem);
      }
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      {children}
    </DndContext>
  );
}
