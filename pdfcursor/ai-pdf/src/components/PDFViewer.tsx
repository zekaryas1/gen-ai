import { useCallback, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { VirtuosoHandle } from "react-virtuoso";
import { OutlineItem } from "@/models/OutlineItem";
import { Document } from "react-pdf";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import { Conditional } from "@/components/ConditionalRenderer";
import PDFLayout from "@/components/PDFLayout";
import { pdfUtilityManager } from "@/utils/files.utils";
import { ApiKeyContextProvider } from "@/utils/ApiKeyContext";

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
  const outlineStateRef = useRef<string[]>([]);
  const panelOptions = useRef({
    left: {
      defaultSize: 20,
      maxSize: 25,
    },
    right: {
      defaultSize: 25,
      maxSize: 30,
    },
  });
  const [pdfReady, setPdfReady] = useState(false);

  const handleLoadSuccess = useCallback(
    async (doc: PDFDocumentProxy) => {
      const fileName = pdfUtilityManager.cleanFileName(file.name);

      outlineRef.current = (await doc.getOutline()) || [];
      pdfRef.current = doc;
      fileNameRef.current = fileName;
      lastPagePositionRef.current =
        pdfUtilityManager.getLastVisitedPage(fileName);
      outlineStateRef.current = pdfUtilityManager.getOutlineState(fileName);

      //is mobile
      if (window.innerWidth < 768) {
        panelOptions.current = {
          left: {
            defaultSize: 0.2,
            maxSize: 55,
          },
          right: {
            defaultSize: 0.2,
            maxSize: 55,
          },
        };
      }

      setPdfReady(true);
      await pdfUtilityManager.saveInitialHistory(doc, fileName);
    },
    [file.name],
  );

  const onTableOfContentItemClick = useCallback(
    ({ pageNumber }: { pageNumber: number }) => {
      virtuosoRef.current?.scrollToIndex({ index: pageNumber });
    },
    [],
  );

  const handleUpdateLastVisitedPage = useCallback((newPage: number) => {
    pdfUtilityManager.updateLastVisitedPage(fileNameRef.current, newPage);
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
          <ApiKeyContextProvider>
            <PDFLayout
              pdf={pdfRef.current!}
              virtuosoRef={virtuosoRef}
              fileName={fileNameRef.current}
              lastPagePosition={lastPagePositionRef.current}
              outlineData={{
                outline: outlineRef.current,
                state: outlineStateRef.current,
              }}
              updateLastVisitedPage={handleUpdateLastVisitedPage}
              panelOptions={panelOptions.current}
            />
          </ApiKeyContextProvider>
        }
      />
    </Document>
  );
}
