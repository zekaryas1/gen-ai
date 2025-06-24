import React from "react";
import { OutlineItem } from "@/models/OutlineItem";

interface OutlineRendererPropType {
  items: OutlineItem[];
  onNavigate: (item: OutlineItem) => void;
  parentTitle?: string;
}

function OutlineRenderer(props: OutlineRendererPropType) {
  const { items, onNavigate, parentTitle } = props;

  return (
    <ul className="space-y-1 pl-2 text-sm text-gray-700">
      {items.map((item, index) => {
        const currNext = items.findIndex((it) => it.title == item.title);
        let cParentTitle: string | undefined = undefined;

        if (currNext != -1 && currNext + 1 < items.length) {
          cParentTitle = items[currNext + 1].title;
        } else {
          cParentTitle = parentTitle;
        }

        return (
          <li key={`${item.title}-${index}`}>
            <button
              onClick={() => onNavigate(item)}
              className="hover:underline text-left cursor-pointer"
              title={cParentTitle}
            >
              {item.title}
            </button>
            {item.items?.length > 0 && (
              <OutlineRenderer
                items={item.items}
                onNavigate={onNavigate}
                parentTitle={cParentTitle}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default React.memo(OutlineRenderer);
