import { marked } from "marked";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import highlight from "remark-sugar-high";
import "./github.css";
import CodeBlock from "@/components/chat/CodeBlock";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[[remarkGfm, { singleTilde: false }], [highlight]]}
        components={{
          code: (props) => {
            const { children, className } = props;
            if (className && className.includes("sh-lang")) {
              const shSplit = className.split("sh-lang--");
              const language = shSplit.length > 1 ? shSplit[1] : "";
              return <CodeBlock language={language}>{children}</CodeBlock>;
            }

            return <code>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.content === nextProps.content;
  },
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return (
      <div className={"markdown-body grid grid-cols-1"}>
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
        ))}
      </div>
    );
  },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
