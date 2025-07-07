import { LocalPrevFileType } from "@/utils/files.utils";
import { Conditional } from "@/components/ConditionalRenderer";
import Image from "next/image";

interface PreviousFilesPropsType {
  prevFiles: LocalPrevFileType[];
}

export default function PreviousFiles(props: PreviousFilesPropsType) {
  const { prevFiles } = props;
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
                      className={"w-full h-72 object-cover object-center"}
                      priority={false}
                    />
                  </div>
                  <p className={"font-bold line-clamp-2"}>{pFile.title}</p>
                  <p className={"text-sm line-clamp-1 text-ellipsis"}>
                    {pFile.author}
                  </p>
                  <p className={"text-sm line-clamp-1 text-ellipsis"}>
                    Last visited page: {pFile.lastVisitedPage}
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
