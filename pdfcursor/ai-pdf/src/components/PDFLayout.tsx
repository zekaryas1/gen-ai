import type { PDFDocumentProxy } from "pdfjs-dist";
import { DraggableOutlineItemData, OutlineItem } from "@/models/OutlineItem";
import { RefObject, useCallback, useContext, useMemo, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import Toolbar from "@/components/Toolbar";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import PDFPageWrapper from "@/components/PDFPageWrapper";
import ChatInterface from "@/components/chat/ChatInterface";
import { Conditional } from "@/components/ConditionalRenderer";
import { pdfjs } from "react-pdf";
import DndWrapper from "@/components/DndWrapper";
import { PagesUtilityManager } from "@/utils/page.utils";
import { ApiKeyContext } from "@/utils/ApiKeyContext";
import APIKeyPromptForm from "@/components/chat/APIKeyPromptForm";
import OutlineItemDragOverlay from "@/components/OutlineItemDragOverlay";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import OutlineRenderer from "@/components/OutlineRenderer";
import { pdfUtilityManager } from "@/utils/files.utils";
import OutlineToolbar from "@/components/OutlineToolbar";

interface PDFLayoutProps {
  pdf: PDFDocumentProxy;
  virtuosoRef: RefObject<VirtuosoHandle | null>;
  fileName: string;
  lastPagePosition: number;
  outlineData: {
    outline: OutlineItem[];
    state: string[];
  };
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
    outlineData,
    fileName,
  } = props;
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);
  const [sidebarsToggle, setSidebarToggle] = useState({
    showOutline: true,
    showChat: true,
  });

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

  const updatePageNumber = useCallback(
    (newPageNumber: number) => {
      virtuosoRef.current?.scrollToIndex({ index: newPageNumber });
    },
    [virtuosoRef],
  );

  const outlineScrollToPage = useCallback(
    async (item: OutlineItem) => {
      const pageIndex =
        await pagesUtilityManager.getOutlineItemPageNumber(item);
      updatePageNumber(pageIndex);
    },
    [pagesUtilityManager, updatePageNumber],
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

  const handleOutlineStateChange = useCallback((outlineStates: string[]) => {
    pdfUtilityManager.replaceOutlineState(fileName, outlineStates);
  }, []);

  const handleToggleChatSidebar = useCallback(() => {
    setSidebarToggle((prevState) => {
      return {
        ...prevState,
        showChat: !prevState.showChat,
      };
    });
  }, []);

  const handleToggleOutlineSidebar = useCallback(() => {
    setSidebarToggle((prevState) => {
      return {
        ...prevState,
        showOutline: !prevState.showOutline,
      };
    });
  }, []);

  return (
    <DndWrapper onItemDragStart={handleDragStart} onItemDragEnd={handleDragEnd}>
      <ResizablePanelGroup
        autoSaveId="conditional"
        direction="horizontal"
        className={""}
      >
        <>
          <ResizablePanel
            defaultSize={20}
            minSize={20}
            maxSize={30}
            className={"bg-white"}
            id={"left"}
            order={1}
            hidden={!sidebarsToggle.showOutline}
          >
            <div className={"relative overflow-scroll h-svh flex flex-col"}>
              <OutlineToolbar fileName={fileName} />
              <Conditional
                check={outlineData.outline.length > 0}
                ifShow={
                  <>
                    <OutlineRenderer
                      items={outlineData.outline}
                      state={outlineData.state}
                      onNavigate={outlineScrollToPage}
                      onReceiveStateChange={handleOutlineStateChange}
                    />
                  </>
                }
                elseShow={
                  <p className="text-gray-500 text-sm">Outline Unavailable</p>
                }
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
        <ResizablePanel
          className={"h-svh overflow-scroll"}
          id={"middle"}
          order={2}
        >
          <>
            <Toolbar
              pageNumber={currentPageNumber}
              totalPages={pdf.numPages}
              onPageChange={updatePageNumber}
              onToggleChat={handleToggleChatSidebar}
              onToggleOutline={handleToggleOutlineSidebar}
            />

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
          </>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={25}
          minSize={25}
          maxSize={35}
          className={"h-svh overflow-hidden bg-white"}
          id={"right"}
          order={3}
          hidden={!sidebarsToggle.showChat}
        >
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
        </ResizablePanel>
      </ResizablePanelGroup>
      <OutlineItemDragOverlay activeDragItem={activeDragItem} />
    </DndWrapper>
  );
}
