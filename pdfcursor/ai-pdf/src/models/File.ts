import { OutlineItem } from "@/models/OutlineItem";
import { RESIZABLE_PANEL_DESKTOP_OPTIONS } from "@/utils/constants.utils";

export interface LocalStorageFile {
  title: string;
  fileName: string;
  author: string;
  thumbnail: string;
  lastVisitedPage: number;
  lastOpenedDate: number;
  outlineState: string[];
}

export interface PdfStateType {
  fileName: string;
  outline: OutlineItem[];
  lastPagePosition: number;
  outlineState: string[];
  panelOptions: typeof RESIZABLE_PANEL_DESKTOP_OPTIONS;
}
