import { ChangeEvent, useContext, useState } from "react";
import { Conditional } from "@/components/ConditionalRenderer";
import { encryptionManager } from "@/utils/encryption.utils";
import { ApiKeyContext } from "@/utils/ApiKeyContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileKey2, Save } from "lucide-react";

interface ApiKeyPasswordFormPropType {
  onDecryptAction: (formData: FormData) => void;
}

interface ApiKeyNewFormPropType {
  onSaveAction: (formData: FormData) => void;
}

export default function APIKeyPromptForm() {
  const value = useContext(ApiKeyContext);
  const localApiKeyPresent = localStorage.getItem("encryptedData") != null;

  const saveApiKeyAction = async (form: FormData) => {
    const apiKey = form.get("apiKey") as string;
    const password = form.get("password") as string;
    const storeType = form.get("storeType");

    if (apiKey) {
      if (storeType == "permanent" && password) {
        await encryptAndStore(apiKey, password);
        value.update(apiKey);
      } else {
        value.update(apiKey as string);
      }
    }
  };

  const decryptApiKeyAction = (formData: FormData) => {
    const password = formData.get("password") as string;
    if (password) {
      customDecrypt(password)
        .then((apiKey) => {
          value.update(apiKey);
        })
        .catch(() => {
          alert("Something went wrong: invalid credentials");
        });
    }
  };

  const encryptAndStore = async (key: string, password: string) => {
    const encrypted = await encryptionManager.encryptDataToStorage(
      key,
      password,
    );
    localStorage.setItem("encryptedData", JSON.stringify(encrypted));
  };

  const customDecrypt = async (password: string) => {
    const encryptedData = localStorage.getItem("encryptedData");
    if (encryptedData == null) {
      throw new Error("No stored encrypted data found");
    }
    const stored = JSON.parse(encryptedData);

    return await encryptionManager.decryptDataFromStorage(
      stored.ciphertext,
      password,
      stored.salt,
      stored.iv,
    );
  };

  return (
    <>
      <Conditional
        check={localApiKeyPresent}
        ifShow={<ApiKeyPasswordForm onDecryptAction={decryptApiKeyAction} />}
        elseShow={<ApiKeyNewForm onSaveAction={saveApiKeyAction} />}
      />
    </>
  );
}

function ApiKeyPasswordForm(props: ApiKeyPasswordFormPropType) {
  const { onDecryptAction } = props;
  return (
    <div className={"space-y-1.5"}>
      <p>Please provide the password to decrypt the api key</p>
      <form action={onDecryptAction} className={"flex flex-col gap-2"}>
        <Input
          type={"password"}
          name={"password"}
          placeholder={"password"}
          required
        />
        <Button type={"submit"}>
          <FileKey2 /> load
        </Button>
      </form>
    </div>
  );
}

function ApiKeyNewForm(props: ApiKeyNewFormPropType) {
  const { onSaveAction } = props;
  const [storeType, setStoreType] = useState<string>("temporary");

  const handleStoreTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setStoreType(value);
  };

  return (
    <div className={"p-3 space-y-1.5"}>
      <div>
        <p className={"text-lg font-bold"}>Please provide API key</p>
        <p>Please provide Google Gemini API key to connect to your AI model.</p>
      </div>
      <form className={"flex flex-col gap-2"} action={onSaveAction}>
        <Input
          type={"text"}
          placeholder={"gemini flash api key"}
          name={"apiKey"}
          required
        />

        <select onChange={handleStoreTypeChange} name={"storeType"}>
          <option value={"temporary"}>
            Store temporarily: until this page close
          </option>
          <option value={"permanent"}>
            Store permanent: encrypted local storage
          </option>
        </select>

        {storeType == "permanent" && (
          <Input
            type={"password"}
            placeholder={"password for encryption"}
            name={"password"}
            required
          />
        )}
        <Button type={"submit"}>
          <Save />
          Save
        </Button>
      </form>
    </div>
  );
}
