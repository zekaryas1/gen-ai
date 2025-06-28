import { useChat } from "@ai-sdk/react";
import { MemoizedMarkdown } from "@/components/MemoizedMarkdown";
import { useDroppable } from "@dnd-kit/core";
import { DraggableItemDataType } from "@/models/OutlineItem";

interface ChatInterfaceProps {
  getContext: () => Promise<string>;
  onClearContextClick: () => void;
  droppedOutlineItem: DraggableItemDataType[];
  onRemoveOutlineItemClick: (item: DraggableItemDataType) => void;
}

export default function ChatInterface(props: ChatInterfaceProps) {
  const {
    getContext,
    onClearContextClick,
    droppedOutlineItem,
    onRemoveOutlineItemClick,
  } = props;
  const { messages, setMessages, input, handleInputChange, handleSubmit } =
    useChat({
      onResponse: () => {
        onClearContextClick();
      },
    });

  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });

  return (
    <div
      className={`flex flex-col h-full  ${isOver ? "border-yellow-300 bg-yellow-50" : "border-gray-300 bg-gray-50"}`}
      ref={setNodeRef}
    >
      <div className={"flex justify-between items-center p-1 border"}>
        <p>Chat interface</p>
        <button
          className={"bg-black border shadow text-white p-2"}
          onClick={() => {
            setMessages([]);
            onClearContextClick();
          }}
        >
          Clear history
        </button>
      </div>
      <div className={"flex-1 overflow-scroll p-3.5"}>
        {messages.map((message) => (
          <div key={message.id}>
            {message.role === "user" ? (
              <div className={"flex justify-end p-2"}>
                <p className={"bg-yellow-50 p-3 rounded-md"}>
                  {message.content}
                </p>
              </div>
            ) : (
              <div className={"flex justify-start mb-4"}>
                <MemoizedMarkdown id={message.id} content={message.content} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 p-2">
        <DroppedOutlineItemList
          draggableItemDataTypes={droppedOutlineItem}
          onRemoveOutlineItemClick={onRemoveOutlineItemClick}
        />
      </div>
      <form
        className="flex"
        onSubmit={async (event) => {
          event.preventDefault();
          const context = await getContext();
          handleSubmit(event, {
            body: {
              context: context,
            },
          });
        }}
      >
        <input
          type={"text"}
          placeholder={"Your question"}
          className={"border w-full p-4"}
          height={300}
          value={input}
          name={"prompt"}
          required
          onChange={handleInputChange}
        />
        <button className={"border border-s-0 px-4"} type={"submit"}>
          Send
        </button>
      </form>
    </div>
  );
}

interface DroppedOutlineItemListProps {
  draggableItemDataTypes: DraggableItemDataType[];
  onRemoveOutlineItemClick: ChatInterfaceProps["onRemoveOutlineItemClick"];
}

function DroppedOutlineItemList(props: DroppedOutlineItemListProps) {
  const { draggableItemDataTypes, onRemoveOutlineItemClick } = props;
  return draggableItemDataTypes.map((it) => {
    return (
      <div key={it.currentItem.title} className={"bg-gray-200 p-2 flex gap-4"}>
        <button onClick={() => onRemoveOutlineItemClick(it)}>x</button>
        <div className="flex flex-col">
          <p>{it.currentItem.title}</p>
          <span className="text-xs">{it.nextSiblingItem?.title}</span>
        </div>
      </div>
    );
  });
}
