import { DraggableOutlineItemData } from "@/models/OutlineItem";
import { Button } from "@/components/ui/button";
import { FileIcon, FilesIcon, Trash2Icon } from "lucide-react";

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
      className={
        "bg-gray-200 p-2 flex gap-4 items-center justify-between rounded-sm shadow-sm"
      }
    >
      <div className="flex gap-2 items-center">
        <div>
          {draggableItemDataType.isCurrentItemLeaf ? (
            <FileIcon size={20} />
          ) : (
            <FilesIcon size={20} />
          )}
        </div>
        <p>{draggableItemDataType.currentItem.title}</p>
      </div>
      <Button
        variant={"ghost"}
        onClick={onRemoveOutlineItemClick}
        size={"icon"}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}
