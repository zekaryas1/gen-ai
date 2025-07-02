"use client";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Document, pdfjs } from "react-pdf";
import { VirtuosoHandle } from "react-virtuoso";
import type { PDFDocumentProxy } from "pdfjs-dist";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ScrollPlaceHolder from "@/components/ScrollPlaceHolder";
import PDFLayout from "@/components/PDFLayout";
import { Conditional } from "@/components/ConditionalRenderer";
import {
  cleanFileName,
  getLastVisitedPage,
  getPreviousFiles,
  LocalPrevFileType,
} from "@/utils/files.utils";
import Image from "next/image";

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PDFFile = File;

export default function Home() {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [showPDF, setShowPDF] = useState(false);
  const [prevFiles, setPrevFiles] = useState<LocalPrevFileType[]>([]);
  const file = useRef<PDFFile>(null);
  const fileName = useRef("Untitled");
  const prevPagePosition = useRef(1);

  useEffect(() => {
    setPrevFiles(getPreviousFiles());
  }, [showPDF]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Check the state pushed to history
      if (event.state && event.state.uiState === "componentB") {
        // If the state indicates Component B, then we should show Component B
        setShowPDF(true);
      } else {
        // Otherwise, assume we should show Component A (e.g., initial state or back from B)
        setShowPDF(false);
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener("popstate", handlePopState);

    // Initial check for history state on mount (e.g., if user refreshes on #details URL)
    if (window.location.hash === "#reading") {
      window.history.replaceState({ uiState: "componentA" }, "", "#home");
    }

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleLoadSuccess = useCallback(async (doc: PDFDocumentProxy) => {
    setPdf(doc);
  }, []);

  const onTableOfContentItemClick = useCallback(
    ({ pageNumber }: { pageNumber: number }) => {
      virtuosoRef.current?.scrollToIndex({ index: pageNumber });
    },
    [],
  );

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { files } = event.target;

    const nextFile = files?.[0];

    if (nextFile) {
      file.current = nextFile;
      fileName.current = cleanFileName(nextFile.name);
      prevPagePosition.current = fileName
        ? getLastVisitedPage(fileName.current)
        : 0;

      startTransition(() => {
        setShowPDF(true);
      });
      window.history.pushState({ uiState: "componentB" }, "", "#reading");
    }
  }

  return (
    <Conditional
      check={showPDF}
      ifShow={
        <Document
          file={file.current}
          onLoadSuccess={handleLoadSuccess}
          onItemClick={onTableOfContentItemClick}
          className="flex flex-1 flex-col relative"
          loading={ScrollPlaceHolder}
        >
          <Conditional
            check={pdf}
            ifShow={(data) => {
              return (
                <PDFLayout
                  pdf={data}
                  virtuosoRef={virtuosoRef}
                  fileName={fileName.current}
                  lastPagePosition={prevPagePosition.current}
                />
              );
            }}
            elseShow={"Error, No pdf found, when trying to open a pdf"}
          />
        </Document>
      }
      elseShow={
        <div className={"container mx-auto flex justify-center pt-52"}>
          <div className={"space-y-8"}>
            <div className={"grid place-content-center space-x-2.5"}>
              <ShowFileInput onFileChange={onFileChange} />
            </div>
            <div className={"space-y-1.5"}>
              <ShowPrevFiles prevFiles={prevFiles} />
            </div>
          </div>
        </div>
      }
    />
  );
}

function ShowFileInput({
  onFileChange,
}: {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <label htmlFor="files" className="text-2xl">
        PDF + AI
      </label>
      <input
        id={"files"}
        onChange={onFileChange}
        type="file"
        accept={".pdf"}
        placeholder={"Select PDF"}
      />
    </>
  );
}

function ShowPrevFiles({ prevFiles }: { prevFiles: LocalPrevFileType[] }) {
  return (
    <Conditional
      check={prevFiles.length > 0}
      ifShow={
        <>
          <p>Previously opened files</p>
          <div className={"grid grid-cols-4 gap-8"}>
            {prevFiles.map((pFile) => {
              return (
                <div
                  key={pFile.title}
                  className={"w-60 border-1 border-gray-50"}
                >
                  <div className={"bg-gray-200"}>
                    <Image
                      src={pFile.thumbnail}
                      alt={pFile.title}
                      width={280}
                      height={100}
                      className={"w-full h-full object-cover object-center"}
                      priority={false}
                    />
                  </div>
                  <p className={"font-bold line-clamp-2"}>{pFile.title}</p>
                  <p className={"text-sm line-clamp-1 text-ellipsis"}>
                    {pFile.author}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      }
    />
  );
}
