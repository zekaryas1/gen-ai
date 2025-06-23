import { useChat } from "@ai-sdk/react";

interface ChatInterfaceProps {
  getCurrentPageTextContent: () => Promise<string>;
  clearVisited: () => void;
}

export default function ChatInterface(props: ChatInterfaceProps) {
  const { getCurrentPageTextContent, clearVisited } = props;
  const { messages, setMessages, input, handleInputChange, handleSubmit } =
    useChat({});

  return (
    <div className="flex flex-col h-full">
      <div className={"flex justify-between items-center p-1 border"}>
        <p>Chat interface</p>
        <button
          className={"bg-black border shadow text-white p-2"}
          onClick={() => {
            setMessages([]);
            clearVisited();
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
              <div className={"flex justify-start mb-4"}>{message.content}</div>
            )}
          </div>
        ))}
      </div>
      <form
        className="flex"
        onSubmit={async (event) => {
          event.preventDefault();
          const context = await getCurrentPageTextContent();
          handleSubmit(event, {
            body: {
              context: context,
            },
          });
        }}
      >
        <input
          type={"text"}
          placeholder={"your question"}
          className={"border w-full p-4"}
          height={300}
          value={input}
          name={"prompt"}
          onChange={handleInputChange}
        />
        <button className={"border border-s-0 px-4"} type={"submit"}>
          Send
        </button>
      </form>
    </div>
  );
}
