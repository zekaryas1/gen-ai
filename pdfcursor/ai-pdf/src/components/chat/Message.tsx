import { UIMessage } from "ai";
import { MemoizedMarkdown } from "@/components/chat/MemoizedMarkdown";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";

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
            <p className={"bg-primary/10 p-3 rounded-md"}>{message.content}</p>
            <div className="invisible flex justify-end group-hover:visible my-2">
              <Button onClick={onCopyClick} size={"icon"} variant={"ghost"}>
                <CopyIcon />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={"flex justify-start mb-4"}>
          <div>
            <MemoizedMarkdown id={message.id} content={message.content} />
            <Button onClick={onCopyClick} size={"icon"} variant={"ghost"}>
              <CopyIcon />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
