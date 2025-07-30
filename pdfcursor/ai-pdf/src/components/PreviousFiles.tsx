import { Conditional } from "@/components/ConditionalRenderer";
import Image from "next/image";
import { LocalStorageFile } from "@/models/File";

interface PreviousFilesPropsType {
  prevFiles: LocalStorageFile[];
  complete: boolean;
}

export default function PreviousFiles(props: PreviousFilesPropsType) {
  const { prevFiles, complete } = props;
  return (
    <Conditional
      check={complete && prevFiles.length == 0}
      ifShow={<FeatureMessages />}
      elseShow={
        <>
          <p className={"text-center"}>
            Previously opened files(Just for history)
          </p>
          <div className={"flex flex-wrap justify-center gap-8"}>
            {prevFiles.map((pFile) => {
              return <PreviousFile key={pFile.fileName} file={pFile} />;
            })}
          </div>
        </>
      }
    />
  );
}

function PreviousFile({ file }: { file: LocalStorageFile }) {
  return (
    <>
      <div key={file.title} className={"w-52 shadow-sm cursor-not-allowed"}>
        <div className={"w-full h-72 border-b-2 border-gray-100"}>
          <Image
            src={file.thumbnail}
            alt={file.title}
            width={208}
            height={288}
            className={"w-full h-full object-cover object-center"}
            priority={false}
          />
        </div>
        <div className={"p-2 space-y-1.5"}>
          <div>
            <p className={"font-bold line-clamp-2"}>{file.title}</p>
            <p className={"text-sm line-clamp-1 text-ellipsis"}>
              {file.author}
            </p>
          </div>
          <p className={"text-sm line-clamp-1 text-ellipsis"}>
            Last visited page: {file.lastVisitedPage}
          </p>
        </div>
      </div>
    </>
  );
}

function FeatureMessages() {
  const messages = [
    {
      title: "Offline PDF Reader",
      description: "View PDFs without an internet connection or downloads.",
    },
    {
      title: "Essential Reader Features",
      description: "Easily navigate with outlines and page controls.",
    },
    {
      title: "AI-Powered Interaction",
      description:
        "Chat with your PDF, get explanations, take quizzes, or generate notes as you read.",
    },
    {
      title: "Customizable Context",
      description:
        "Add more context by dragging and dropping outlines to expand your AI conversations.",
    },
    {
      title: "Local",
      description:
        "Bring your own Google API key for AI features—no backend connection, all data stays local.",
    },
  ];

  return (
    <div className={"space-y-2.5"}>
      <p className={"text-xl"}>
        New here? Discover what PDF-AI can do for you:
      </p>
      <ul className={"list-disc ms-10 space-y-2.5"}>
        {messages.map((message) => {
          return (
            <li key={message.title}>
              <span className={"font-bold"}>{message.title}</span>:{" "}
              {message.description}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
