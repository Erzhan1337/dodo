import { AxiosError } from "axios";
import toast from "react-hot-toast";

interface ApiErrorData {
  message: string | string[];
  statusCode?: number;
}

export function handleApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorData | undefined;

    if (!data?.message) {
      toast.error("Произошла ошибка");
      return;
    }

    const message = Array.isArray(data.message)
      ? data.message[0]
      : data.message;

    toast.error(message);
    return;
  }

  toast.error("Произошла ошибка");
}
