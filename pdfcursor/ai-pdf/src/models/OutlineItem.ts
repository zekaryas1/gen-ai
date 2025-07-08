export interface OutlineItem {
  dest: string | object[] | null;
  title: string;
  items: OutlineItem[];
}

export interface DraggableOutlineItemData {
  currentItem: OutlineItem;
  nextSiblingItem?: OutlineItem;
  isCurrentItemLeaf: boolean;
}
