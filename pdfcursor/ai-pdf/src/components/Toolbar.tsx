interface ToolbarProps {
  currentPage: number;
  totalPages: number;
}

export default function Toolbar(props: ToolbarProps) {
  const { currentPage, totalPages } = props;
  return (
    <div
      className={"p-4 bg-white text-black border-y shadow-lg flex items-center"}
      style={{
        height: "5svh",
      }}
    >
      <p>
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
}
