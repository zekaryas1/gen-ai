import { DraggableOutlineItemData } from "@/models/OutlineItem";
import { DragOverlay } from "@dnd-kit/core";
import { Conditional } from "@/components/ConditionalRenderer";

export default function OutlineItemDragOverlay(props: {
  activeDragItem: DraggableOutlineItemData | null;
}) {
  return (
    <DragOverlay dropAnimation={null}>
      <Conditional
        check={props.activeDragItem}
        ifShow={(data) => {
          return (
            <div className="px-4 py-2 bg-white text-black rounded-md shadow-lg pointer-events-none transition-all duration-150 ease-in-out">
              <div>{data.isCurrentItemLeaf ? "File" : "Folder"}</div>
              <span className="text-sm">{data.currentItem.title}</span>
            </div>
          );
        }}
      />
    </DragOverlay>
  );
}
