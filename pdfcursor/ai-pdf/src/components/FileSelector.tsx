import { Input } from "@/components/ui/input";

interface FileSelectorPropsType {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileSelector(props: FileSelectorPropsType) {
  const { onFileChange } = props;
  return (
    <>
      <label htmlFor="files" className="text-2xl text-center mb-1.5">
        PDF + AI
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
