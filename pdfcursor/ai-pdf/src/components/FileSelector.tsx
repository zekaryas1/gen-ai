interface FileSelectorPropsType {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileSelector(props: FileSelectorPropsType) {
  const { onFileChange } = props;
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
