import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/utils/constants.utils";

interface FileSelectorPropsType {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileSelector(props: FileSelectorPropsType) {
  const { onFileChange } = props;
  return (
    <>
      <label htmlFor="files" className="text-2xl text-center mb-1.5">
        {APP_NAME}: <span className={"text-lg"}>PDF + AI</span>
      </label>
      <Input
        id={"files"}
        onChange={onFileChange}
        type="file"
        accept={".pdf"}
        placeholder={"Select PDF"}
      />
    </>
  );
}
