"use client";
import { useCallback, useRef, useState } from "react";
import { Document, pdfjs } from "react-pdf";
import { VirtuosoHandle } from "react-virtuoso";
import type { PDFDocumentProxy } from "pdfjs-dist";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import PDFLayout from "@/components/PDFLayout";

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function Home() {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const handleLoadSuccess = useCallback(async (doc: PDFDocumentProxy) => {
    setPdf(doc);
  }, []);

  const onTableOfContentItemClick = useCallback(
    ({ pageNumber }: { pageNumber: number }) => {
      virtuosoRef.current?.scrollToIndex({ index: pageNumber });
    },
    [],
  );

  return (
    <Document
      file="./sample book.pdf"
      onLoadSuccess={handleLoadSuccess}
      onItemClick={onTableOfContentItemClick}
      className="flex flex-1 flex-col relative"
      loading={ScrollPlaceHolder}
    >
      {pdf ? (
        <PDFLayout pdf={pdf} virtuosoRef={virtuosoRef} />
      ) : (
        "Loading PDF, please wait..."
      )}
    </Document>
  );
}
