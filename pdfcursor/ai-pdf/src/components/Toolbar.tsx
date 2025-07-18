import React, { useRef, useState } from "react";
import { Conditional } from "@/components/ConditionalRenderer";

interface ToolbarProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

export default function Toolbar(props: ToolbarProps) {
  const { pageNumber, totalPages, onPageChange } = props;
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
      className={"p-4 bg-white text-black border-y shadow-lg flex items-center"}
      style={{
        height: "5svh",
      }}
    >
      <div className="flex group gap-1.5" onMouseLeave={hidePageNumberInput}>
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
    </div>
  );
}
