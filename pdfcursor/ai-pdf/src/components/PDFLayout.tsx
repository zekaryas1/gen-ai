import type { PDFDocumentProxy } from "pdfjs-dist";
import { DraggableItemDataType, OutlineItem } from "@/models/OutlineItem";
import { RefObject, useCallback, useEffect, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { usePDFUtil } from "@/utils/page.utils";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import OutlineRenderer from "@/components/OutlineRenderer";
import Toolbar from "@/components/Toolbar";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import PDFPageWrapper from "@/components/PDFPageWrapper";
import ChatInterface from "@/components/ChatInterface";

interface PDFLayoutProps {
  pdf: PDFDocumentProxy;
  virtuosoRef: RefObject<VirtuosoHandle | null>;
}

export default function PDFLayout(props: PDFLayoutProps) {
  const { pdf, virtuosoRef } = props;
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  //drag and drop conf
  const [droppedItemData, setDroppedItemData] = useState<
    DraggableItemDataType[]
  >([]);
  const [activeDragItem, setActiveDragItem] =
    useState<DraggableItemDataType | null>(null);
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, // Drag starts after pointer moves 5 pixels
    },
  });
  const sensors = useSensors(pointerSensor);
  const pdfUtil = usePDFUtil(pdf);

  useEffect(() => {
    const getOutline = async () => {
      const pdfOutline = await pdf.getOutline();
      setOutline(pdfOutline);
    };
    getOutline();
  }, []);

  const outlineScrollToPage = useCallback(
    async (item: OutlineItem) => {
      const pageIndex = await pdfUtil.getPageIndex(item);
      virtuosoRef.current?.scrollToIndex({ index: pageIndex });
    },
    [pdfUtil, virtuosoRef],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current as DraggableItemDataType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Check if an item was dropped over the specific form field droppable area
    if (over && over.id === "droppable") {
      const draggedItemData = active.data.current;
      if (draggedItemData) {
        const newItem = draggedItemData as DraggableItemDataType;
        const existsPrevious = droppedItemData.findIndex(
          (it) => it.currentItem.title === newItem.currentItem.title,
        );
        if (existsPrevious == -1) {
          setDroppedItemData([newItem, ...droppedItemData]);
        }
      }
    }
    setActiveDragItem(null); // Reset the active drag item state
  };

  const handleRemoveDroppedItem = (item: DraggableItemDataType) => {
    setDroppedItemData((prev) =>
      prev.filter((it) => it.currentItem.title !== item.currentItem.title),
    );
  };

  const getTextContext = async () => {
    const outlinePages =
      await pdfUtil.outlineItemsToPageConverter(droppedItemData);
    return await pdfUtil.getTextContext([...outlinePages, currentPageNumber]);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="grid grid-cols-12 h-svh gap-2 bg-black">
        {/* Sidebar */}
        <aside className="col-span-2 overflow-y-scroll p-2 bg-white">
          {outline.length > 0 ? (
            <OutlineRenderer items={outline} onNavigate={outlineScrollToPage} />
          ) : (
            <p className="text-gray-500 text-sm">Outline Unavailable</p>
          )}
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
            itemContent={(index) => (
              <PDFPageWrapper
                pageNumber={index + 1}
                pageChangeListener={(pageNumber) => {
                  setCurrentPageNumber(pageNumber);
                }}
              />
            )}
          />
        </main>

        {/* Chat Box */}
        <aside className="col-span-3 bg-white overflow-hidden">
          <ChatInterface
            droppedOutlineItem={droppedItemData}
            getContext={getTextContext}
            onClearContextClick={() => {
              pdfUtil.clearVisitedPages();
              setDroppedItemData([]);
            }}
            onRemoveOutlineItemClick={(item) => {
              handleRemoveDroppedItem(item);
            }}
          />
        </aside>

        <OutlineDragOverlay activeDragItem={activeDragItem} />
      </div>
    </DndContext>
  );
}

function OutlineDragOverlay(props: {
  activeDragItem: DraggableItemDataType | null;
}) {
  return (
    <DragOverlay dropAnimation={null}>
      {props.activeDragItem ? (
        <div className="px-4 py-2 bg-white text-black rounded-md shadow-lg pointer-events-none transition-all duration-150 ease-in-out">
          <div>
            {props.activeDragItem.isCurrentItemLeaf ? "File" : "Folder"}
          </div>
          <span className="text-sm">
            {props.activeDragItem.currentItem.title}
          </span>
        </div>
      ) : null}
    </DragOverlay>
  );
}
