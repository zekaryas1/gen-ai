"use client";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Conditional } from "@/components/ConditionalRenderer";
import { getPreviousFiles, LocalPrevFileType } from "@/utils/files.utils";
import FileSelector from "@/components/FileSelector";
import PreviousFiles from "@/components/PreviousFiles";
import PDFViewer from "@/components/PDFViewer";

export default function Home() {
  const fileRef = useRef<File>(null);
  const [showPDF, setShowPDF] = useState(false);
  const [prevFiles, setPrevFiles] = useState<LocalPrevFileType[]>([]);

  useEffect(() => {
    startTransition(() => {
      setPrevFiles(getPreviousFiles());
    });
  }, [showPDF]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setShowPDF(event.state?.uiState === "pdf_show");
    };

    window.addEventListener("popstate", handlePopState);
    if (window.location.hash === "#reading") {
      window.history.replaceState({ uiState: "pdf_list" }, "", "#home");
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0];
      if (nextFile) {
        fileRef.current = nextFile;
        window.history.pushState({ uiState: "pdf_show" }, "", "#reading");
        startTransition(() => setShowPDF(true));
      }
    },
    [],
  );

  return (
    <Conditional
      check={showPDF && fileRef.current}
      ifShow={<PDFViewer file={fileRef.current!} />}
      elseShow={
        <div className={"container mx-auto flex justify-center pt-52"}>
          <div className={"space-y-8"}>
            <div className={"grid place-content-center space-x-2.5"}>
              <FileSelector onFileChange={handleFileChange} />
            </div>
            <div className={"space-y-1.5"}>
              <PreviousFiles prevFiles={prevFiles} />
            </div>
          </div>
        </div>
      }
    />
  );
}
