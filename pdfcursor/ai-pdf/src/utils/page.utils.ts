import type { PDFDocumentProxy } from "pdfjs-dist";
import { Ref } from "@/models/Ref";
import { OutlineItem } from "@/models/OutlineItem";

export const getDestination = (pdf: PDFDocumentProxy, item: OutlineItem) => {
  return typeof item.dest === "string"
    ? pdf.getDestination(item.dest)
    : item.dest;
};

export const getPageIndex = async (
  pdf: PDFDocumentProxy,
  item: OutlineItem,
) => {
  const dest = await getDestination(pdf, item);
  if (!dest) throw new Error("Destination not found.");

  const [ref] = dest as [Ref];
  return pdf.getPageIndex(new Ref(ref));
};
