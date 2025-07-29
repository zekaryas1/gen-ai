import { Page } from "react-pdf";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import { usePageVisibilityObserver } from "@/hooks/usePageVisibilityObserver";

interface PDFPageWrapperPropTypes {
  pageNumber: number;
  pageChangeListener: (pageNumber: number) => void;
  width: number;
}

export default function PDFPageWrapper(props: PDFPageWrapperPropTypes) {
  const { pageChangeListener, pageNumber, width } = props;
  const pageRef = usePageVisibilityObserver({
    rootId: "pdf-container",
    visibilityThreshold: 0.5,
    onPageVisible: () => pageChangeListener(pageNumber),
  });

  return (
    <>
      <Page
        inputRef={pageRef}
        key={`page_${pageNumber}`}
        pageNumber={pageNumber}
        width={width}
        loading={ScrollPlaceHolder}
      />
      <p className={"bg-black text-white text-center"}>{pageNumber}</p>
    </>
  );
}
