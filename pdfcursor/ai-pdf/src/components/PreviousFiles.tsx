import Image from "next/image";
import { LocalStorageFile } from "@/models/File";

interface PreviousFilesPropsType {
  prevFiles: LocalStorageFile[];
}

export default function PreviousFiles(props: PreviousFilesPropsType) {
  const { prevFiles } = props;
  return (
    <>
      <p className={"text-center border-b-1 border-gray-200 mb-4 pb-2"}>
        Previously opened files(Just for history)
      </p>
      <div className={"flex flex-wrap justify-center gap-8"}>
        {prevFiles.map((pFile) => {
          return <PreviousFile key={pFile.fileName} file={pFile} />;
        })}
      </div>
    </>
  );
}

function PreviousFile({ file }: { file: LocalStorageFile }) {
  return (
    <>
      <div key={file.title} className={"w-52 shadow-sm cursor-not-allowed"}>
        <div className={"w-full h-72 border-b-2 border-gray-100"}>
          <Image
            src={file.thumbnail}
            alt={file.title}
            width={208}
            height={288}
            className={"w-full h-full object-cover object-center"}
            priority={false}
          />
        </div>
        <div className={"p-2 space-y-1.5"}>
          <div>
            <p className={"font-bold line-clamp-2"}>{file.title}</p>
            <p className={"text-sm line-clamp-1 text-ellipsis"}>
              {file.author}
            </p>
          </div>
          <p className={"text-sm line-clamp-1 text-ellipsis"}>
            Last visited page: {file.lastVisitedPage}
          </p>
        </div>
      </div>
    </>
  );
}
