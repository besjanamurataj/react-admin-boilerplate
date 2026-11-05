import type { LoginRequest } from "../types/auth";
import { HttpClient } from "../libs/https/http-client";

const auth = "api/auth/authenticate";

export async function login(data: LoginRequest) {
  try {
    const response = await HttpClient.post<{ token: string }>(`${auth}`, data);
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to login",
      { cause: error },
    );
  }
}
