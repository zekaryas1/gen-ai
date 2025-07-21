import React, { useRef, useState } from "react";
import { Conditional } from "@/components/ConditionalRenderer";

interface ToolbarProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  onToggleOutline: () => void;
  onToggleChat: () => void;
}

export default function Toolbar(props: ToolbarProps) {
  const {
    pageNumber,
    totalPages,
    onPageChange,
    onToggleChat,
    onToggleOutline,
  } = props;
  const [showPageInput, setShowPageInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onEnterClick = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key == "Enter" && inputRef.current) {
      const value = parseInt(inputRef.current.value);
      if (value && Number.isInteger(value)) {
        onPageChange(value - 1);
      }
    }
  };

  const showPageNumberInput = () => setShowPageInput(true);
  const hidePageNumberInput = () => setShowPageInput(false);

  return (
    <div
      className={
        "p-4 bg-white text-black border-y shadow-lg flex justify-between items-center"
      }
      style={{
        height: "5svh",
      }}
    >
      <div className="flex group gap-1.5" onMouseLeave={hidePageNumberInput}>
        <button onClick={onToggleOutline}>
          <SidebarLeft />
        </button>
        <p>Page</p>
        <Conditional
          check={showPageInput}
          ifShow={
            <input
              ref={inputRef}
              type="number"
              placeholder={pageNumber.toString()}
              onKeyDown={onEnterClick}
            />
          }
          elseShow={
            <p
              className={"cursor-pointer font-medium"}
              onClick={showPageNumberInput}
              title={"Click to change page number"}
            >
              {pageNumber}
            </p>
          }
        />
        <p>of {totalPages}</p>
      </div>
      <button onClick={onToggleChat}>
        <SidebarRight />
      </button>
    </div>
  );
}

const SidebarLeft = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-panel-left-icon lucide-panel-left"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
};

const SidebarRight = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-panel-right-icon lucide-panel-right"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
    </svg>
  );
};
