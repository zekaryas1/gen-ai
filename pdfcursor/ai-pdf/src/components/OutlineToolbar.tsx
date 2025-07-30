import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OutlineToolbar({ fileName }: { fileName: string }) {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className={"flex items-center border p-1.5 border-e-0 gap-4 h-12"}>
      <Button variant={"ghost"} onClick={handleBackClick}>
        <ArrowLeft />
      </Button>
      <p className={"text-sm line-clamp-1 text-ellipsis"} title={fileName}>
        {fileName}
      </p>
    </div>
  );
}
