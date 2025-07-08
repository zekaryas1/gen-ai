import { useRef } from "react";

interface CodeBlockProps {
  language: string;
  children: React.ReactNode;
}
export default function CodeBlock(props: CodeBlockProps) {
  const { language, children } = props;
  const ref = useRef<HTMLElement>(null);
  const copyToClipboard = async () => {
    if (ref && ref.current) {
      const codeText = ref.current.textContent || "";
      await navigator.clipboard.writeText(codeText);
    }
  };

  return (
    <>
      <div className={"flex justify-between mb-2.5"}>
        <div className={"bg-gray-200 rounded-md p-2"}>{language}</div>
        <button
          className={"bg-gray-200 rounded-md p-2"}
          onClick={() => copyToClipboard()}
        >
          copy
        </button>
      </div>
      <code ref={ref}>{children}</code>
    </>
  );
}
