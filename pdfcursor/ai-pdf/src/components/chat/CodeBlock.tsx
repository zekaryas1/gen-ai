import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";

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
      <div
        className={
          "flex justify-between mb-2.5 border-b-1 border-b-gray-200 items-center"
        }
      >
        <p>{language}</p>
        <Button
          onClick={() => copyToClipboard()}
          variant={"ghost"}
          size={"icon"}
        >
          <CopyIcon />
        </Button>
      </div>
      <code className={`language-${language}`} ref={ref}>
        {children}
      </code>
    </>
  );
}
