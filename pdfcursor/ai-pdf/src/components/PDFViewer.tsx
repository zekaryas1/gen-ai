import { useCallback, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { VirtuosoHandle } from "react-virtuoso";
import { Document } from "react-pdf";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import { Conditional } from "@/components/ConditionalRenderer";
import PDFLayout from "@/components/PDFLayout";
import { pdfUtilityManager } from "@/utils/files.utils";
import { ApiKeyContextProvider } from "@/utils/ApiKeyContext";
import {
  MOBILE_BREAKPOINT,
  RESIZABLE_PANEL_DESKTOP_OPTIONS,
  RESIZABLE_PANEL_MOBILE_OPTIONS,
} from "@/utils/constants.utils";
import { PdfStateType } from "@/models/File";

interface PDFViewerPropsType {
  file: File;
}

export default function PDFViewer(props: PDFViewerPropsType) {
  const { file } = props;
  const pdfRef = useRef<PDFDocumentProxy>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const pdfStateRef = useRef<PdfStateType>({
    fileName: "",
    outline: [],
    lastPagePosition: 0,
    outlineState: [],
    panelOptions:
      window.innerWidth < MOBILE_BREAKPOINT
        ? RESIZABLE_PANEL_MOBILE_OPTIONS
        : RESIZABLE_PANEL_DESKTOP_OPTIONS,
  });

  const [pdfReady, setPdfReady] = useState(false);

  const initializePdfState = useCallback(
    async (pdfDoc: PDFDocumentProxy) => {
      const fileName = pdfUtilityManager.cleanFileName(file.name);
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

      const [outline, lastPage, outlineState] = await Promise.all([
        pdfDoc.getOutline(),
        pdfUtilityManager.getLastVisitedPage(fileName),
        pdfUtilityManager.getOutlineState(fileName),
      ]);

      pdfRef.current = pdfDoc;

      pdfStateRef.current = {
        fileName,
        outline: outline || [],
        lastPagePosition: lastPage,
        outlineState,
        panelOptions: isMobile
          ? RESIZABLE_PANEL_MOBILE_OPTIONS
          : RESIZABLE_PANEL_DESKTOP_OPTIONS,
      };

      await pdfUtilityManager.saveInitialHistory(pdfDoc, fileName);
      setPdfReady(true);
    },
    [file.name],
  );

  const handleTableOfContentItemClick = useCallback(
    ({ pageNumber }: { pageNumber: number }) => {
      virtuosoRef.current?.scrollToIndex({ index: pageNumber });
    },
    [],
  );

  return (
    <Document
      file={file}
      onLoadSuccess={initializePdfState}
      onItemClick={handleTableOfContentItemClick}
      loading={ScrollPlaceHolder}
    >
      <Conditional
        check={pdfReady && !!pdfRef.current}
        ifShow={
          <ApiKeyContextProvider>
            <PDFLayout
              pdf={pdfRef.current!}
              virtuosoRef={virtuosoRef}
              state={pdfStateRef.current}
            />
          </ApiKeyContextProvider>
        }
      />
    </Document>
  );
}
