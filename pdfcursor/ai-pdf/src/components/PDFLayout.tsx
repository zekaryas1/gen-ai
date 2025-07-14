import type { PDFDocumentProxy } from "pdfjs-dist";
import { DraggableOutlineItemData, OutlineItem } from "@/models/OutlineItem";
import { RefObject, useCallback, useContext, useMemo, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import OutlineRenderer from "@/components/OutlineRenderer";
import Toolbar from "@/components/Toolbar";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import PDFPageWrapper from "@/components/PDFPageWrapper";
import ChatInterface from "@/components/chat/ChatInterface";
import { Conditional } from "@/components/ConditionalRenderer";
import OutlineItemDragOverlay from "@/components/OutlineItemDragOverlay";
import { pdfjs } from "react-pdf";
import DndWrapper from "@/components/DndWrapper";
import { PagesUtilityManager } from "@/utils/page.utils";
import { ApiKeyContext } from "@/utils/ApiKeyContext";
import APIKeyPromptForm from "@/components/chat/APIKeyPromptForm";

interface PDFLayoutProps {
  pdf: PDFDocumentProxy;
  virtuosoRef: RefObject<VirtuosoHandle | null>;
  fileName: string;
  lastPagePosition: number;
  outlines: OutlineItem[];
  updateLastVisitedPage: (newPage: number) => void;
}

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PDFLayout(props: PDFLayoutProps) {
  const {
    pdf,
    virtuosoRef,
    updateLastVisitedPage,
    lastPagePosition,
    outlines,
  } = props;
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);
  const pagesUtilityManager = useMemo(
    () => new PagesUtilityManager(pdf),
    [pdf],
  );
  //drag and drop conf
  const [droppedItemData, setDroppedItemData] = useState<
    DraggableOutlineItemData[]
  >([]);
  const [activeDragItem, setActiveDragItem] =
    useState<DraggableOutlineItemData | null>(null);
  //api key
  const value = useContext(ApiKeyContext);

  const outlineScrollToPage = useCallback(
    async (item: OutlineItem) => {
      const pageIndex =
        await pagesUtilityManager.getOutlineItemPageNumber(item);
      virtuosoRef.current?.scrollToIndex({ index: pageIndex });
    },
    [pagesUtilityManager, virtuosoRef],
  );

  const handleDragStart = useCallback((item: DraggableOutlineItemData) => {
    setActiveDragItem(item);
  }, []);

  const handleDragEnd = useCallback(
    (item: DraggableOutlineItemData) => {
      const existsPrevious = droppedItemData.findIndex(
        (it) => it.currentItem.title === item.currentItem.title,
      );
      if (existsPrevious == -1) {
        setDroppedItemData([item, ...droppedItemData]);
      }
      setActiveDragItem(null);
    },
    [droppedItemData],
  );

  const handleRemoveDroppedItem = useCallback(
    (item: DraggableOutlineItemData) => {
      setDroppedItemData((prev) =>
        prev.filter((it) => it.currentItem.title !== item.currentItem.title),
      );
    },
    [],
  );

  const getTextContext = useCallback(async () => {
    const outlinePages =
      await pagesUtilityManager.outlineItemsToPageConverter(droppedItemData);
    return await pagesUtilityManager.getTextContext([
      ...outlinePages,
      currentPageNumber,
    ]);
  }, [currentPageNumber, droppedItemData, pagesUtilityManager]);

  const chatClearHistory = useCallback(() => {
    pagesUtilityManager.clearVisitedPages();
    setDroppedItemData([]);
  }, [pagesUtilityManager]);

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      updateLastVisitedPage(pageNumber);
      setCurrentPageNumber(pageNumber);
    },
    [updateLastVisitedPage],
  );

  return (
    <DndWrapper onItemDragStart={handleDragStart} onItemDragEnd={handleDragEnd}>
      <div className="grid grid-cols-12 h-svh gap-2 bg-black">
        {/* Sidebar */}
        <aside className="col-span-2 overflow-y-scroll p-2 bg-white">
          <Conditional
            check={outlines.length > 0}
            ifShow={
              <OutlineRenderer
                items={outlines}
                onNavigate={outlineScrollToPage}
              />
            }
            elseShow={
              <p className="text-gray-500 text-sm">
                Outline Unavailable, show thumbnail
              </p>
            }
          />
        </aside>

        {/* PDF Content */}
        <main className="col-span-7 bg-black flex flex-col">
          <Toolbar pageNumber={currentPageNumber} totalPages={pdf.numPages} />

          <Virtuoso
            ref={virtuosoRef}
            style={{ height: "95svh" }}
            totalCount={pdf.numPages}
            overscan={10}
            id={"pdf-container"}
            components={{
              ScrollSeekPlaceholder: ScrollPlaceHolder,
            }}
            initialTopMostItemIndex={Math.max(0, lastPagePosition - 1)}
            itemContent={(index) => (
              <PDFPageWrapper
                pageNumber={index + 1}
                pageChangeListener={handlePageChange}
              />
            )}
          />
        </main>

        {/* Chat Box */}
        <aside className="col-span-3 bg-white overflow-hidden">
          <Conditional
            check={value.apiKey}
            ifShow={
              <ChatInterface
                plainApiKey={value.apiKey}
                droppedOutlineItems={droppedItemData}
                getContext={getTextContext}
                onClearContextClick={chatClearHistory}
                onRemoveOutlineItemClick={handleRemoveDroppedItem}
              />
            }
            elseShow={
              <div className={"grid place-items-center h-full"}>
                <APIKeyPromptForm />
              </div>
            }
          />
        </aside>

        <OutlineItemDragOverlay activeDragItem={activeDragItem} />
      </div>
    </DndWrapper>
  );
}
