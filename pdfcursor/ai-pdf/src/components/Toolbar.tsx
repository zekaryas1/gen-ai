interface ToolbarProps {
  pageNumber: number;
  totalPages: number;
}

export default function Toolbar(props: ToolbarProps) {
  const { pageNumber, totalPages } = props;
  return (
    <div
      className={"p-4 bg-white text-black border-y shadow-lg flex items-center"}
      style={{
        height: "5svh",
      }}
    >
      <p>
        Page {pageNumber} of {totalPages}
      </p>
    </div>
  );
}
