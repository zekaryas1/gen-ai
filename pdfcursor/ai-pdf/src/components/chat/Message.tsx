import { UIMessage } from "ai";
import { MemoizedMarkdown } from "@/components/chat/MemoizedMarkdown";

interface MessagePropType {
  message: UIMessage;
  onCopyClick: () => void;
}

export default function Message({ message, onCopyClick }: MessagePropType) {
  return (
    <div>
      {message.role === "user" ? (
        <div className={"flex justify-end p-2 group"}>
          <div>
            <p className={"bg-yellow-50 p-3 rounded-md"}>{message.content}</p>
            <div className="invisible flex justify-end group-hover:visible my-2">
              <button
                className={"cursor-pointer p-1.5 bg-gray-200 rounded-md"}
                onClick={onCopyClick}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={"flex justify-start mb-4"}>
          <div>
            <MemoizedMarkdown id={message.id} content={message.content} />
            <button
              className={"cursor-pointer p-1.5 bg-gray-200 rounded-md my-2"}
              onClick={onCopyClick}
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
