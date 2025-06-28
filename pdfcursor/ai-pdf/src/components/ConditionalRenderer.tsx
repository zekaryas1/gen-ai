import { ReactNode } from "react";

interface ConditionalRenderProps<T> {
  check: T | boolean;
  ifShow: ReactNode | ((data: NonNullable<T>) => ReactNode);
  elseShow?: ReactNode;
}

/**
 * A conditional rendering component that handles both boolean and data checks
 * @param check - The condition or data to check
 * @param ifShow - Content to render when check is truthy (or a function for data)
 * @param elseShow - Optional content to render when check is falsy
 */
export function Conditional<T>({
  check,
  ifShow,
  elseShow,
}: ConditionalRenderProps<T>): React.ReactNode {
  // Handle boolean checks
  if (typeof check === "boolean") {
    return check
      ? typeof ifShow === "function"
        ? (ifShow as (data: boolean) => ReactNode)(check)
        : ifShow
      : elseShow;
  }

  // Handle data checks
  if (check) {
    return typeof ifShow === "function"
      ? (ifShow as (data: NonNullable<T>) => ReactNode)(check)
      : ifShow;
  }

  return elseShow;
}
