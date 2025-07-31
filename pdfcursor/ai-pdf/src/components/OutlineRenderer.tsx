import * as React from "react";
import { useCallback, useMemo, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { SidebarMenuSub } from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { OutlineItem } from "@/models/OutlineItem";
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
  onOutlineStateChange: (id: string) => void;
  state: string[];
}

export default function OutlineRenderer(props: OutlineRendererProps) {
  const { items, onNavigate, nextSiblingItem, onReceiveStateChange, state } =
    props;
  const outlineStateRef = useRef<Set<string>>(new Set<string>(state));

  const prepareOutlineStateData = useCallback(
    (id: string) => {
      if (outlineStateRef.current.has(id)) {
        outlineStateRef.current.delete(id);
      } else {
        outlineStateRef.current.add(id);
      }
      onReceiveStateChange([...outlineStateRef.current.keys()]);
    },
    [onReceiveStateChange],
  );

  return (
    <ul className="p-3 space-y-1.5 bg-gray-50 flex-1 overflow-y-scroll">
      {items.map((item, index) => {
        return (
          <Tree
            key={`${index}`}
            id={`${index}`}
            item={item}
            nextSiblingItem={
              index + 1 < items.length ? items[index + 1] : nextSiblingItem
            }
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
    },
  });

  const isOpen = useMemo(() => state.findIndex((it) => it == id), [id, state]);
  const commonClasses = "hover:bg-primary/50 cursor-pointer rounded-md";

  const handleCollapseTriggerClick = () => {
    onOutlineStateChange(id);
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
          isDragging && "bg-primary/50",
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
        isDragging && "bg-primary/50 rounded-md",
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
              key={`${id}-${index}`}
              id={`${id}-${index}`}
              item={subItem}
              onNavigate={onNavigate}
              nextSiblingItem={
                index + 1 < item.items.length
                  ? item.items[index + 1]
                  : nextSiblingItem
              }
              onOutlineStateChange={onOutlineStateChange}
              state={state}
            />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
