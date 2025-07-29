import type { PDFDocumentProxy } from "pdfjs-dist";
import { DraggableOutlineItemData, OutlineItem } from "@/models/OutlineItem";
import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

//pdf js css
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { ImperativePanelGroupHandle } from "react-resizable-panels";

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
  panelOptions: {
    left: {
      defaultSize: number;
      maxSize: number;
    };
    right: {
      defaultSize: number;
      maxSize: number;
    };
  };
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
    panelOptions,
  } = props;
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);
  //drag and drop conf
  const [droppedItemData, setDroppedItemData] = useState<
    DraggableOutlineItemData[]
  >([]);
  const [activeDragItem, setActiveDragItem] =
    useState<DraggableOutlineItemData | null>(null);

  const previousStateHolder = useRef<number[]>([20, 25]);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const middleResizeContainerRef = useRef<HTMLDivElement>(null);

  const width = useResizeObserver(middleResizeContainerRef);

  const pagesUtilityManager = useMemo(
    () => new PagesUtilityManager(pdf),
    [pdf],
  );
  //api key
  const value = useContext(ApiKeyContext);

  useEffect(() => {}, []);

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

  const handleOutlineStateChange = useCallback(
    (outlineStates: string[]) => {
      pdfUtilityManager.replaceOutlineState(fileName, outlineStates);
    },
    [fileName],
  );

  const handleHandleDoubleClick = (side: "left" | "right") => {
    const panelGroup = panelGroupRef.current;
    if (!panelGroup) return;

    const layout = panelGroup.getLayout();
    const isLeft = side === "left";
    const index = isLeft ? 0 : 2;
    const currentSize = Math.floor(layout[index]);

    if (currentSize === 0) {
      const prevSize = previousStateHolder.current[isLeft ? 0 : 1];
      const adjustedMiddle = layout[1] - prevSize + 0.2;
      const newLayout: number[] = isLeft
        ? [prevSize, adjustedMiddle, layout[2]]
        : [layout[0], adjustedMiddle, prevSize];

      panelGroup.setLayout(newLayout);
    } else {
      previousStateHolder.current[isLeft ? 0 : 1] = layout[index];
      const adjustedMiddle = layout[1] + layout[index] - 0.2;
      const newLayout: number[] = isLeft
        ? [0.2, adjustedMiddle, layout[2]]
        : [layout[0], adjustedMiddle, 0.2];

      panelGroup.setLayout(newLayout);
    }
  };

  const handleLeftHandleDoubleClick = () => handleHandleDoubleClick("left");
  const handleRightHandleDoubleClick = () => handleHandleDoubleClick("right");

  return (
    <DndWrapper onItemDragStart={handleDragStart} onItemDragEnd={handleDragEnd}>
      <ResizablePanelGroup
        autoSaveId="conditional"
        direction="horizontal"
        ref={panelGroupRef}
      >
        <>
          <ResizablePanel
            defaultSize={panelOptions.left.defaultSize}
            maxSize={panelOptions.left.maxSize}
            className={"bg-white"}
            id={"left"}
            order={1}
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
          <ResizableHandle
            withHandle
            onDoubleClick={handleLeftHandleDoubleClick}
          />
        </>
        <ResizablePanel
          className={"h-svh overflow-scroll"}
          id={"middle"}
          order={2}
        >
          <div ref={middleResizeContainerRef}>
            <Toolbar
              pageNumber={currentPageNumber}
              totalPages={pdf.numPages}
              onPageChange={updatePageNumber}
            />

            <Conditional
              check={width != 0}
              ifShow={
                <Virtuoso
                  ref={virtuosoRef}
                  style={{ height: "calc(100svh - var(--spacing) * 12)" }}
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
                      width={width}
                      pageChangeListener={handlePageChange}
                    />
                  )}
                />
              }
            />
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          onDoubleClick={handleRightHandleDoubleClick}
        />
        <ResizablePanel
          defaultSize={panelOptions.right.defaultSize}
          maxSize={panelOptions.right.maxSize}
          className={"h-svh overflow-hidden bg-white"}
          id={"right"}
          order={3}
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
