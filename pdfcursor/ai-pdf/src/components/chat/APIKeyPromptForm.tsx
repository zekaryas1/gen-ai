import { useContext, useState } from "react";
import { Conditional } from "@/components/ConditionalRenderer";
import { encryptionManager } from "@/utils/encryption.utils";
import { ApiKeyContext } from "@/utils/ApiKeyContext";

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

function ApiKeyPasswordForm({
  onDecryptAction,
}: {
  onDecryptAction: (formData: FormData) => void;
}) {
  return (
    <div>
      <p>Please provide the password to decrypt the api key</p>
      <form action={onDecryptAction} className={"flex flex-col"}>
        <input
          type={"password"}
          name={"password"}
          placeholder={"password"}
          required
        />
        <input type={"submit"} value={"load"} />
      </form>
    </div>
  );
}

function ApiKeyNewForm({
  onSaveAction,
}: {
  onSaveAction: (formData: FormData) => void;
}) {
  const [storeType, setStoreType] = useState<string>("temporary");

  return (
    <div>
      <div>
        <p className={"text-lg"}>You do not have api key</p>
        <p>
          Please provide google api key and password to securely store on web
        </p>
      </div>
      <form className={"flex flex-col gap-2"} action={onSaveAction}>
        <input
          type={"text"}
          placeholder={"gemini flash api key"}
          name={"apiKey"}
          required
        />

        <select
          onChange={(event) => {
            const value = event.target.value;
            setStoreType(value);
          }}
          name={"storeType"}
        >
          <option value={"temporary"}>Store temporarily: until refresh</option>
          <option value={"permanent"}>
            Store permanent: secure local storage
          </option>
        </select>

        {storeType == "permanent" && (
          <input
            type={"password"}
            placeholder={"password for encryption"}
            name={"password"}
            required
          />
        )}
        <input type={"submit"} value={"Save"} />
      </form>
    </div>
  );
}
