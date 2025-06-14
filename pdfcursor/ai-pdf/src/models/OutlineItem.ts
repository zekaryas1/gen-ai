export interface OutlineItem {
  dest: string | object[] | null;
  title: string;
  items: OutlineItem[];
}
