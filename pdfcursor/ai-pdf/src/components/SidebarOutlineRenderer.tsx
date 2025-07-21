import * as React from "react";
import { ChevronRight } from "lucide-react";
import { SidebarMenuSub } from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DraggableOutlineItemData, OutlineItem } from "@/models/OutlineItem";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface OutlineRendererProps {
  items: OutlineItem[];
  onNavigate: (item: OutlineItem) => void;
  nextSiblingItem?: OutlineItem;
}

interface TreeProps {
  item: OutlineItem;
  onNavigate: (item: OutlineItem) => void;
  nextSiblingItem?: OutlineItem;
}

export default function SidebarOutlineRenderer(props: OutlineRendererProps) {
  const { items, onNavigate, nextSiblingItem } = props;

  return (
    <ul className="p-3 space-y-1.5">
      {items.map((item, index) => {
        const currentIndex = items.findIndex((it) => it.title === item.title);
        const computedNextSibling =
          currentIndex !== -1 && currentIndex + 1 < items.length
            ? items[currentIndex + 1]
            : nextSiblingItem;

        return (
          <Tree
            key={`${item.title}-${index}`}
            item={item}
            nextSiblingItem={computedNextSibling}
            onNavigate={onNavigate}
          />
        );
      })}
    </ul>
  );
}

function Tree(props: TreeProps) {
  const { item, nextSiblingItem, onNavigate } = props;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.title,
    data: {
      currentItem: item,
      nextSiblingItem,
      isCurrentItemLeaf: item.items?.length === 0,
    } as DraggableOutlineItemData,
  });

  const commonClasses = cn("hover:bg-gray-50 cursor-pointer rounded-md");

  if (!item.items?.length) {
    return (
      <li
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          commonClasses,
          "block px-1.5 py-0.5",
          isDragging && "bg-yellow-100",
        )}
        onClick={() => onNavigate(item)}
      >
        {item.title}
      </li>
    );
  }

  return (
    <Collapsible
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group/collapsible [&[data-state=open]>li>span>svg:first-child]:rotate-90",
        isDragging && "bg-yellow-100",
      )}
    >
      <div className="flex items-center gap-1.5">
        <CollapsibleTrigger asChild>
          <li className="flex items-center gap-1">
            <span>
              <ChevronRight className="transition-transform w-4 h-4" />
            </span>
          </li>
        </CollapsibleTrigger>
        <span className={cn(commonClasses)} onClick={() => onNavigate(item)}>
          {item.title}
        </span>
      </div>

      <CollapsibleContent>
        <SidebarMenuSub className="space-y-0.5 py-1.5">
          {item.items.map((subItem, index) => (
            <Tree
              key={`${subItem.title}-${index}`}
              item={subItem}
              onNavigate={onNavigate}
              nextSiblingItem={nextSiblingItem}
            />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
