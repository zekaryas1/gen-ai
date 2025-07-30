import { APP_FEATURE_MESSAGES, APP_NAME } from "@/utils/constants.utils";

export default function AppFeatureMessages() {
  return (
    <div className={"space-y-2.5"}>
      <p className={"text-xl"}>
        New here? Discover what {APP_NAME} can do for you:
      </p>
      <ul className={"list-disc ms-10 space-y-2.5"}>
        {APP_FEATURE_MESSAGES.map((message) => {
          return (
            <li key={message.title}>
              <span className={"font-bold"}>{message.title}</span>:{" "}
              {message.description}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
