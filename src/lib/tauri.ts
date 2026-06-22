import { api } from "../lib/api";
import type { SystemInfo } from "../types/system";

export async function fetchSystemInfo(): Promise<SystemInfo> {
  return api.getSystemInfo();
}
