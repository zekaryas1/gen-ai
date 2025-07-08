import { DraggableOutlineItemData } from "@/models/OutlineItem";

interface DroppedOutlineItemListProps {
  draggableItemDataType: DraggableOutlineItemData;
  onRemoveOutlineItemClick: () => void;
}

export default function DroppedOutlineItem({
  draggableItemDataType,
  onRemoveOutlineItemClick,
}: DroppedOutlineItemListProps) {
  return (
    <div
      key={draggableItemDataType.currentItem.title}
      className={"bg-gray-200 p-2 flex gap-4"}
    >
      <button onClick={onRemoveOutlineItemClick}>x</button>
      <div className="flex flex-col">
        <p>{draggableItemDataType.currentItem.title}</p>
        <span className="text-xs">
          {draggableItemDataType.nextSiblingItem?.title}
        </span>
      </div>
    </div>
  );
}
