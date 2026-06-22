import type { LoginRequest } from "../types/auth";
import { HttpClient } from "../libs/https/http-client";

const auth = "auth/authenticate";

export async function login(data: LoginRequest) {
  try {
    const response = await HttpClient.post<{ token: string }>(`${auth}`,
      data,
    );
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to login");
  }
}
