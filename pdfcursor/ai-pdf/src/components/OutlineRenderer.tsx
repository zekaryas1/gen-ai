import React from "react";
import { DraggableItemDataType, OutlineItem } from "@/models/OutlineItem";
import { useDraggable } from "@dnd-kit/core";
import { Conditional } from "@/components/ConditionalRenderer";

interface OutlineRendererPropType {
  items: OutlineItem[];
  onNavigate: (item: OutlineItem) => void;
  nextSiblingItem?: OutlineItem;
}

function OutlineRenderer(props: OutlineRendererPropType) {
  const { items, onNavigate, nextSiblingItem } = props;

  return (
    <ul className="pl-1.5 text-sm text-gray-700">
      {items.map((item) => {
        const currNext = items.findIndex((it) => it.title == item.title);
        let cNextSiblingItem: OutlineItem | undefined;

        if (currNext != -1 && currNext + 1 < items.length) {
          cNextSiblingItem = items[currNext + 1];
        } else {
          cNextSiblingItem = nextSiblingItem;
        }

        return (
          <DraggableOutlineItem
            key={item.title}
            item={item}
            onNavigate={onNavigate}
            nextSiblingItem={cNextSiblingItem}
          />
        );
      })}
    </ul>
  );
}

function DraggableOutlineItem(props: {
  item: OutlineItem;
  onNavigate: (item: OutlineItem) => void;
  nextSiblingItem?: OutlineItem;
}) {
  const { item, onNavigate, nextSiblingItem } = props;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.title,
    data: {
      currentItem: item,
      nextSiblingItem: nextSiblingItem,
      isCurrentItemLeaf: item.items?.length == 0,
    } as DraggableItemDataType,
  });

  return (
    <li
      key={`${item.title}`}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
         ${isDragging ? "bg-yellow-100" : ""}
      `}
    >
      <button
        onClick={() => {
          onNavigate(item);
        }}
        className="hover:underline text-left cursor-pointer px-1.5 py-0.5"
      >
        {item.title}
      </button>
      <Conditional
        check={item.items?.length > 0}
        ifShow={
          <OutlineRenderer
            items={item.items}
            onNavigate={onNavigate}
            nextSiblingItem={nextSiblingItem}
          />
        }
      />
    </li>
  );
}

export default React.memo(OutlineRenderer);
