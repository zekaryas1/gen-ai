import { useEffect, useRef } from "react";
import { Page } from "react-pdf";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";

export default function PDFPageWrapper(props: {
  pageNumber: number;
  pageChangeListener: (pageNumber: number) => void;
}) {
  const { pageChangeListener, pageNumber } = props;
  const ref = useRef(null);
  const PAGE_VISIBILITY_THRESHOLD = 0.5;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          entry.intersectionRatio > PAGE_VISIBILITY_THRESHOLD
        ) {
          pageChangeListener(pageNumber);
        }
      },
      {
        root: document.getElementById("pdf-container"),
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.disconnect();
    };
  });
  return (
    <div>
      <Page
        inputRef={ref}
        key={`page_${pageNumber}`}
        pageNumber={pageNumber}
        width={950}
        loading={ScrollPlaceHolder}
      />
      <p className={"bg-black text-white text-center"}>{pageNumber}</p>
    </div>
  );
}
