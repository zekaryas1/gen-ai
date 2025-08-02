import { marked } from "marked";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/chat/CodeBlock";
import rehypeHighlight from "rehype-highlight";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

function findLanguageFromClassname(className: string) {
  const languageSplit = className.split("language-");
  const languageCollection = languageSplit.length > 1 ? languageSplit[1] : "";
  return languageCollection.split(" ")[0];
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        rehypePlugins={[[rehypeHighlight]]}
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        components={{
          code: (props) => {
            const { children, className } = props;
            if (className) {
              const language = findLanguageFromClassname(className);
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
        {blocks.map((block, index) => {
          return (
            <MemoizedMarkdownBlock
              content={block}
              key={`${id}-block_${index}`}
            />
          );
        })}
      </div>
    );
  },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
