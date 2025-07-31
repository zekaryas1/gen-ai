import type { RefObject } from "react";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { pdfjs } from "react-pdf";

import PDFToolbar from "@/components/PDFToolbar";
import PDFPageWrapper from "@/components/PDFPageWrapper";
import OutlineRenderer from "@/components/OutlineRenderer";
import OutlineToolbar from "@/components/OutlineToolbar";
import ChatInterface from "@/components/chat/ChatInterface";
import APIKeyPromptForm from "@/components/chat/APIKeyPromptForm";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import DndWrapper from "@/components/DndWrapper";
import { Conditional } from "@/components/ConditionalRenderer";
import OutlineItemDragOverlay from "@/components/OutlineItemDragOverlay";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { ApiKeyContext } from "@/utils/ApiKeyContext";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { PagesUtilityManager } from "@/utils/page.utils";
import { pdfUtilityManager } from "@/utils/files.utils";
import { resizePanelUtils } from "@/utils/resizePanel.utils";

import type { PdfStateType } from "@/models/File";
import type {
  DraggableOutlineItemData,
  OutlineItem,
} from "@/models/OutlineItem";
import type { ImperativePanelGroupHandle } from "react-resizable-panels";

//PDF js css
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PDFLayoutProps {
  pdf: PDFDocumentProxy;
  virtuosoRef: RefObject<VirtuosoHandle | null>;
  state: PdfStateType;
}

interface DragStateType {
  activeDragItem: DraggableOutlineItemData | null;
  droppedItems: DraggableOutlineItemData[];
}

export default function PDFLayout({ pdf, virtuosoRef, state }: PDFLayoutProps) {
  const { panelOptions, lastPagePosition, fileName, outline, outlineState } =
    state;

  const [currentPage, setCurrentPage] = useState(0);
  const [dragState, setDragState] = useState<DragStateType>({
    activeDragItem: null,
    droppedItems: [],
  });

  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const previousLayoutRef = useRef<number[]>([
    panelOptions.left.defaultSize,
    panelOptions.right.defaultSize,
  ]);
  const middlePanelRef = useRef<HTMLDivElement>(null);
  const width = useResizeObserver(middlePanelRef);

  const pagesManager = useMemo(() => new PagesUtilityManager(pdf), [pdf]);
  const { apiKey } = useContext(ApiKeyContext);

  // Navigation
  const updatePage = useCallback(
    (page: number) => virtuosoRef.current?.scrollToIndex({ index: page }),
    [virtuosoRef],
  );

  const scrollToOutlineItemDest = useCallback(
    async (item: OutlineItem) => {
      const index = await pagesManager.getOutlineItemPageNumber(item);
      updatePage(index);
    },
    [pagesManager, updatePage],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      pdfUtilityManager.updateLastVisitedPage(fileName, page);
    },
    [fileName],
  );

  const handleOutlineStateChange = useCallback(
    (states: string[]) => {
      pdfUtilityManager.replaceOutlineState(fileName, states);
    },
    [fileName],
  );

  // Drag and Drop
  const handleDragStart = useCallback((item: DraggableOutlineItemData) => {
    setDragState((prevState) => {
      return {
        ...prevState,
        activeDragItem: item,
      };
    });
  }, []);

  const handleDragEnd = useCallback(
    (item: DraggableOutlineItemData) => {
      //check no duplicate items
      if (
        dragState.droppedItems.findIndex(
          (i) =>
            i.currentItem.title === item.currentItem.title &&
            i.nextSiblingItem?.title === item.nextSiblingItem?.title,
        ) == -1
      ) {
        setDragState((prevState) => {
          return {
            ...prevState,
            droppedItems: [item, ...prevState.droppedItems],
          };
        });
      }
      setDragState((prevState) => {
        return {
          ...prevState,
          activeDragItem: null,
        };
      });
    },
    [dragState.droppedItems],
  );

  const removeDroppedItem = useCallback((item: DraggableOutlineItemData) => {
    setDragState((prevState) => {
      return {
        ...prevState,
        droppedItems: prevState.droppedItems.filter(
          (i) =>
            i.currentItem.title !== item.currentItem.title ||
            i.nextSiblingItem?.title !== item.nextSiblingItem?.title,
        ),
      };
    });
  }, []);

  // Chat
  const getContext = useCallback(async () => {
    const pages = await pagesManager.outlineItemsToPageConverter(
      dragState.droppedItems,
    );
    return pagesManager.getTextContext([...pages, currentPage]);
  }, [currentPage, dragState.droppedItems, pagesManager]);

  const clearChatContext = useCallback(() => {
    pagesManager.clearVisitedPages();
    setDragState((prevState) => {
      return {
        ...prevState,
        droppedItems: [],
      };
    });
  }, [pagesManager]);

  // Panel Resize Handlers
  const panelDoubleClickHandle = useCallback((side: "left" | "right") => {
    if (panelGroupRef.current) {
      const layout = panelGroupRef.current.getLayout();
      const newLayout = resizePanelUtils.transformLayout(
        side,
        layout,
        previousLayoutRef.current,
      );
      panelGroupRef.current.setLayout(newLayout);
    }
  }, []);

  return (
    <DndWrapper onItemDragStart={handleDragStart} onItemDragEnd={handleDragEnd}>
      <ResizablePanelGroup
        direction="horizontal"
        ref={panelGroupRef}
        autoSaveId="pdf-layout"
      >
        {/* Left Panel - Outline */}
        <>
          <ResizablePanel
            defaultSize={panelOptions.left.defaultSize}
            maxSize={panelOptions.left.maxSize}
            className="bg-white overflow-scroll flex flex-col h-svh"
            id="left"
            order={1}
          >
            <OutlineToolbar fileName={fileName} />
            <Conditional
              check={outline.length > 0}
              ifShow={
                <OutlineRenderer
                  items={outline}
                  state={outlineState}
                  onNavigate={scrollToOutlineItemDest}
                  onReceiveStateChange={handleOutlineStateChange}
                />
              }
              elseShow={
                <p className="text-sm text-gray-500">Outline Unavailable</p>
              }
            />
          </ResizablePanel>
          <ResizableHandle
            withHandle
            onDoubleClick={() => panelDoubleClickHandle("left")}
          />
        </>

        {/* Middle Panel - PDF */}
        <ResizablePanel id="middle" order={2} className="overflow-scroll h-svh">
          <main ref={middlePanelRef}>
            <PDFToolbar
              pageNumber={currentPage}
              totalPages={pdf.numPages}
              onPageChange={updatePage}
            />
            <Conditional
              check={width > 0}
              ifShow={
                <Virtuoso
                  ref={virtuosoRef}
                  style={{ height: "calc(100svh - var(--spacing) * 12)" }}
                  totalCount={pdf.numPages}
                  overscan={3}
                  id="pdf-container"
                  components={{ ScrollSeekPlaceholder: ScrollPlaceHolder }}
                  initialTopMostItemIndex={Math.max(0, lastPagePosition - 1)}
                  itemContent={(index) => (
                    <PDFPageWrapper
                      pageNumber={index + 1}
                      width={width}
                      pageChangeListener={handlePageChange}
                    />
                  )}
                />
              }
            />
          </main>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          onDoubleClick={() => panelDoubleClickHandle("right")}
        />

        {/* Right Panel - Chat */}
        <ResizablePanel
          defaultSize={panelOptions.right.defaultSize}
          maxSize={panelOptions.right.maxSize}
          className="bg-white h-svh overflow-hidden"
          id="right"
          order={3}
        >
          <Conditional
            check={!!apiKey}
            ifShow={
              <ChatInterface
                plainApiKey={apiKey}
                droppedOutlineItems={dragState.droppedItems}
                getContext={getContext}
                onClearContextClick={clearChatContext}
                onRemoveOutlineItemClick={removeDroppedItem}
              />
            }
            elseShow={
              <div className="grid place-items-center h-full">
                <APIKeyPromptForm />
              </div>
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      <OutlineItemDragOverlay activeDragItem={dragState.activeDragItem} />
    </DndWrapper>
  );
}
