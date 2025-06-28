export interface OutlineItem {
  dest: string | object[] | null;
  title: string;
  items: OutlineItem[];
}

export interface DraggableItemDataType {
  currentItem: OutlineItem;
  nextSiblingItem?: OutlineItem;
  isCurrentItemLeaf: boolean;
}
