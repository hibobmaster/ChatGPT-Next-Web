import { BuildConfig, getBuildConfig } from "./build";
import { ServiceProvider } from "../constant";

export function getClientConfig() {
  if (typeof document !== "undefined") {
    // client side
    return JSON.parse(queryMeta("config") || "{}") as BuildConfig;
  }

  if (typeof process !== "undefined") {
    // server side
    return getBuildConfig();
  }
}

export type ServerConfigMeta = {
  enabledProviders: ServiceProvider[];
};

const SERVER_CONFIG_META_KEY = "server-config";

export function getServerConfig(): ServerConfigMeta | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const raw = queryMeta(SERVER_CONFIG_META_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as ServerConfigMeta;
  } catch (error) {
    console.error("[Client Config] failed to parse server config", error);
    return undefined;
  }
}

function queryMeta(key: string, defaultValue?: string): string {
  let ret: string;
  if (document) {
    const meta = document.head.querySelector(
      `meta[name='${key}']`,
    ) as HTMLMetaElement;
    ret = meta?.content ?? "";
  } else {
    ret = defaultValue ?? "";
  }

  return ret;
}
