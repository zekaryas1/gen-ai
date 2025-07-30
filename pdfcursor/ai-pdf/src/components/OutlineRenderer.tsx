import * as React from "react";
import { useCallback, useMemo, useRef } from "react";
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
  onReceiveStateChange: (outlineStates: string[]) => void;
  state: string[];
}

interface TreeProps {
  id: string;
  item: OutlineItem;
  onNavigate: (item: OutlineItem) => void;
  nextSiblingItem?: OutlineItem;
  onOutlineStateChange: (item: OutlineItem) => void;
  state: string[];
}

export default function OutlineRenderer(props: OutlineRendererProps) {
  const { items, onNavigate, nextSiblingItem, onReceiveStateChange, state } =
    props;
  const outlineStateRef = useRef<Set<string>>(new Set<string>(state));

  const prepareOutlineStateData = useCallback(
    (clickedItem: OutlineItem) => {
      if (outlineStateRef.current.has(clickedItem.title)) {
        outlineStateRef.current.delete(clickedItem.title);
      } else {
        outlineStateRef.current.add(clickedItem.title);
      }
      onReceiveStateChange([...outlineStateRef.current.keys()]);
    },
    [onReceiveStateChange],
  );

  return (
    <ul className="p-3 space-y-1.5 bg-gray-50 flex-1 overflow-y-scroll">
      {items.map((item, index) => {
        const currentIndex = items.findIndex((it) => it.title === item.title);
        const computedNextSibling =
          currentIndex !== -1 && currentIndex + 1 < items.length
            ? items[currentIndex + 1]
            : nextSiblingItem;

        return (
          <Tree
            key={`${item.title}-${index}`}
            id={`${item.title}-${index}`}
            item={item}
            nextSiblingItem={computedNextSibling}
            onNavigate={onNavigate}
            onOutlineStateChange={prepareOutlineStateData}
            state={state}
          />
        );
      })}
    </ul>
  );
}

function Tree(props: TreeProps) {
  const { item, nextSiblingItem, onNavigate, onOutlineStateChange, state, id } =
    props;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      currentItem: item,
      nextSiblingItem: nextSiblingItem,
      isCurrentItemLeaf: item.items?.length === 0,
    } as DraggableOutlineItemData,
  });

  const isOpen = useMemo(
    () => state.findIndex((it) => it == item.title),
    [item.title, state],
  );
  const commonClasses = "hover:bg-gray-200 cursor-pointer rounded-md";

  const handleCollapseTriggerClick = () => {
    onOutlineStateChange(item);
  };

  if (!item.items?.length) {
    return (
      <li
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          commonClasses,
          "block px-1.5 py-0.5 w-full",
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
        "group/collapsible [&[data-state=open]>li>svg:first-child]:rotate-90",
        isDragging && "bg-yellow-100",
      )}
      defaultOpen={isOpen != -1}
    >
      <li className="flex items-center">
        <CollapsibleTrigger asChild onClick={handleCollapseTriggerClick}>
          <ChevronRight className="transition-transform w-4 h-4" />
        </CollapsibleTrigger>
        <span
          className={cn(commonClasses, "w-full px-1.5")}
          onClick={() => onNavigate(item)}
        >
          {item.title}
        </span>
      </li>

      <CollapsibleContent>
        <SidebarMenuSub className="w-full space-y-0.5 py-1.5">
          {item.items.map((subItem, index) => (
            <Tree
              key={`${subItem.title}-${index}`}
              id={`${subItem.title}-${index}`}
              item={subItem}
              onNavigate={onNavigate}
              nextSiblingItem={nextSiblingItem}
              onOutlineStateChange={onOutlineStateChange}
              state={state}
            />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
