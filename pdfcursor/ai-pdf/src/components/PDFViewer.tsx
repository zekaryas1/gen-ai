import { useCallback, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { VirtuosoHandle } from "react-virtuoso";
import { OutlineItem } from "@/models/OutlineItem";
import {
  cleanFileName,
  getLastVisitedPage,
  saveHistory,
  saveLastVisitedPage,
} from "@/utils/files.utils";
import { Document } from "react-pdf";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import { Conditional } from "@/components/ConditionalRenderer";
import PDFLayout from "@/components/PDFLayout";

interface PDFViewerPropsType {
  file: File;
}

export default function PDFViewer(props: PDFViewerPropsType) {
  const { file } = props;
  const pdfRef = useRef<PDFDocumentProxy>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const fileNameRef = useRef<string>("");
  const outlineRef = useRef<OutlineItem[]>([]);
  const lastPagePositionRef = useRef<number>(1);

  const [pdfReady, setPdfReady] = useState(false);

  const handleLoadSuccess = useCallback(
    async (doc: PDFDocumentProxy) => {
      const fileName = cleanFileName(file.name);

      outlineRef.current = (await doc.getOutline()) || [];
      pdfRef.current = doc;
      fileNameRef.current = fileName;
      lastPagePositionRef.current = getLastVisitedPage(fileName);

      setPdfReady(true);
      await saveHistory(doc, fileName);
    },
    [file.name],
  );

  const onTableOfContentItemClick = useCallback(
    ({ pageNumber }: { pageNumber: number }) => {
      virtuosoRef.current?.scrollToIndex({ index: pageNumber });
    },
    [],
  );

  const handleSaveLastVisitedPage = useCallback((newPage: number) => {
    saveLastVisitedPage(fileNameRef.current, newPage);
  }, []);

  return (
    <Document
      file={file}
      onLoadSuccess={handleLoadSuccess}
      onItemClick={onTableOfContentItemClick}
      className="flex flex-1 flex-col relative"
      loading={ScrollPlaceHolder}
    >
      <Conditional
        check={pdfReady && pdfRef.current}
        ifShow={
          <PDFLayout
            pdf={pdfRef.current!}
            virtuosoRef={virtuosoRef}
            fileName={fileNameRef.current}
            lastPagePosition={lastPagePositionRef.current}
            inOutline={outlineRef.current}
            saveLastVisitedPage={handleSaveLastVisitedPage}
          />
        }
      />
    </Document>
  );
}
