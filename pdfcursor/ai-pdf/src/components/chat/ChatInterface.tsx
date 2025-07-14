import { useChat } from "@ai-sdk/react";
import { useDroppable } from "@dnd-kit/core";
import { DraggableOutlineItemData } from "@/models/OutlineItem";
import DroppedOutlineItem from "@/components/chat/DroppedOutlineItem";
import { Conditional } from "@/components/ConditionalRenderer";
import Message from "@/components/chat/Message";
import ChatIntroMessage from "@/components/chat/ChatIntro";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

interface ChatInterfaceProps {
  plainApiKey: string;
  getContext: () => Promise<string>;
  onClearContextClick: () => void;
  droppedOutlineItems: DraggableOutlineItemData[];
  onRemoveOutlineItemClick: (item: DraggableOutlineItemData) => void;
}

export default function ChatInterface(props: ChatInterfaceProps) {
  const {
    plainApiKey,
    getContext,
    onClearContextClick,
    droppedOutlineItems,
    onRemoveOutlineItemClick,
  } = props;

  const { messages, setMessages, input, handleInputChange, handleSubmit } =
    useChat({
      onResponse: () => {
        onClearContextClick();
      },
      fetch: async (requestInfo, requestInit) => {
        const { messages, context } = JSON.parse(requestInit?.body as string);

        const google = createGoogleGenerativeAI({
          apiKey: plainApiKey,
        });

        const result = streamText({
          model: google("gemini-2.0-flash"),
          system: `You are a helpful assistant. When answering questions, always prioritize and use the provided context first. Only rely on your own knowledge if the context is insufficient. Keep your responses concise, clear, and to the point. ${context}`,
          messages,
        });

        return result.toDataStreamResponse();
      },
    });

  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });

  const copyMessageToClipboard = async (message: string) => {
    await navigator.clipboard.writeText(message);
  };

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
      <div className={"flex-1 overflow-scroll p-3"}>
        <Conditional
          check={messages.length == 0}
          ifShow={<ChatIntroMessage />}
          elseShow={messages.map((message) => {
            return (
              <Message
                key={message.id}
                message={message}
                onCopyClick={async () => {
                  await copyMessageToClipboard(message.content);
                }}
              />
            );
          })}
        />
      </div>
      <div className="flex flex-col gap-2 p-2">
        {droppedOutlineItems.map((droppedOutlineItem) => {
          return (
            <DroppedOutlineItem
              key={droppedOutlineItem.currentItem.title}
              draggableItemDataType={droppedOutlineItem}
              onRemoveOutlineItemClick={() => {
                onRemoveOutlineItemClick(droppedOutlineItem);
              }}
            />
          );
        })}
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
