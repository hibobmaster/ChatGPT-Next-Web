import {
  GoogleSafetySettingsThreshold,
  ServiceProvider,
  StoreKey,
  ApiPath,
  GEMINI_BASE_URL,
  DEEPSEEK_BASE_URL,
} from "../constant";
import { getHeaders } from "../client/api";
import { getClientConfig } from "../config/client";
import { createPersistStore } from "../utils/store";
import { ensure } from "../utils/clone";
import { DEFAULT_CONFIG } from "./config";
import { getModelProvider } from "../utils/model";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const isApp = getClientConfig()?.buildMode === "export";

const DEFAULT_GOOGLE_URL = isApp ? GEMINI_BASE_URL : ApiPath.Google;

const DEFAULT_DEEPSEEK_URL = isApp ? DEEPSEEK_BASE_URL : ApiPath.DeepSeek;

const ENABLED_PROVIDERS = [ServiceProvider.Google, ServiceProvider.DeepSeek];
const REMOVED_PROVIDERS = Object.values(ServiceProvider).filter(
  (p) => !ENABLED_PROVIDERS.includes(p as ServiceProvider),
);

const DEFAULT_ACCESS_STATE = {
  accessCode: "",
  useCustomConfig: false,

  provider: ServiceProvider.DeepSeek,

  // google ai studio
  googleUrl: DEFAULT_GOOGLE_URL,
  googleApiKey: "",
  googleApiVersion: "v1",
  googleSafetySettings: GoogleSafetySettingsThreshold.BLOCK_ONLY_HIGH,

  // deepseek
  deepseekUrl: DEFAULT_DEEPSEEK_URL,
  deepseekApiKey: "",

  // server config
  needCode: true,
  hideUserApiKey: false,
  hideBalanceQuery: false,
  disableGPT4: false,
  disableFastLink: false,
  customModels: "",
  defaultModel: "deepseek-chat",
  visionModels: "",
};

export const useAccessStore = createPersistStore(
  { ...DEFAULT_ACCESS_STATE },

  (set, get) => ({
    enabledAccessControl() {
      this.fetch();

      return get().needCode;
    },
    getVisionModels() {
      this.fetch();
      return get().visionModels;
    },

    isValidGoogle() {
      return ensure(get(), ["googleApiKey"]);
    },

    isValidDeepSeek() {
      return ensure(get(), ["deepseekApiKey"]);
    },

    isAuthorized() {
      this.fetch();

      // has token or has code or disabled access control
      return (
        this.isValidGoogle() ||
        this.isValidDeepSeek() ||
        !this.enabledAccessControl() ||
        (this.enabledAccessControl() && ensure(get(), ["accessCode"]))
      );
    },
    fetch() {
      if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
      fetchState = 1;
      fetch("/api/config", {
        method: "post",
        body: null,
        headers: {
          ...getHeaders(),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          const defaultModel = res.defaultModel ?? "";
          if (defaultModel !== "") {
            const [model, providerName] = getModelProvider(defaultModel);
            const targetProvider = ENABLED_PROVIDERS.includes(
              providerName as ServiceProvider,
            )
              ? (providerName as ServiceProvider)
              : ServiceProvider.DeepSeek;
            DEFAULT_CONFIG.modelConfig.model =
              targetProvider === providerName ? model : "deepseek-chat";
            DEFAULT_CONFIG.modelConfig.providerName = targetProvider as any;
          }

          return res;
        })
        .then((res: DangerConfig) => {
          console.log("[Config] got config from server", res);
          set(() => ({ ...res }));
        })
        .catch(() => {
          console.error("[Config] failed to fetch config");
        })
        .finally(() => {
          fetchState = 2;
        });
    },
  }),
  {
    name: StoreKey.Access,
    version: 5,
    migrate(persistedState, version) {
      const state = persistedState as typeof DEFAULT_ACCESS_STATE & {
        token?: string;
        openaiApiKey?: string;
      };
      if (version < 2 && state.token && !state.deepseekApiKey) {
        state.deepseekApiKey = state.token;
      }
      if (!state.deepseekApiKey && state.openaiApiKey) {
        state.deepseekApiKey = state.openaiApiKey;
      }
      if (version < 5 || REMOVED_PROVIDERS.includes(state.provider as any)) {
        state.provider = ServiceProvider.DeepSeek;
      }
      state.defaultModel =
        state.defaultModel || DEFAULT_CONFIG.modelConfig.model;
      state.useCustomConfig = false;
      state.googleUrl = state.googleUrl ?? DEFAULT_GOOGLE_URL;
      state.deepseekUrl = state.deepseekUrl ?? DEFAULT_DEEPSEEK_URL;
      state.googleApiVersion = state.googleApiVersion ?? "v1";
      state.googleSafetySettings =
        state.googleSafetySettings ??
        GoogleSafetySettingsThreshold.BLOCK_ONLY_HIGH;
      return state as any;
    },
  },
);
