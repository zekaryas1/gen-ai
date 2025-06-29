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
    <div className={"border border-gray-200 p-1.5 space-y-1.5"}>
      <div className={"flex justify-between bg-gray-200 p-3.5"}>
        <div>{language}</div>
        <button onClick={() => copyToClipboard()}>copy</button>
      </div>
      <code ref={ref} className={"break-all"}>
        {children}
      </code>
    </div>
  );
}
