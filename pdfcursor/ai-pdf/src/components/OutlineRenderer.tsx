import React from "react";
import { OutlineItem } from "@/models/OutlineItem";

interface OutlineRendererPropType {
  items: OutlineItem[];
  onNavigate: (item: OutlineItem) => void;
}

function OutlineRenderer(props: OutlineRendererPropType) {
  const { items, onNavigate } = props;

  return (
    <ul className="space-y-1 pl-2 text-sm text-gray-700">
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`}>
          <button
            onClick={() => onNavigate(item)}
            className="hover:underline text-left cursor-pointer"
          >
            {item.title}
          </button>
          {item.items?.length > 0 && (
            <OutlineRenderer items={item.items} onNavigate={onNavigate} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default React.memo(OutlineRenderer);
