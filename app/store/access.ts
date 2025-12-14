import {
  DEFAULT_ENABLED_PROVIDERS,
  DEFAULT_MODELS,
  GoogleSafetySettingsThreshold,
  ServiceProvider,
  StoreKey,
  ApiPath,
  GEMINI_BASE_URL,
  DEEPSEEK_BASE_URL,
} from "../constant";
import { getHeaders } from "../client/api";
import { getClientConfig, getServerConfig } from "../config/client";
import { createPersistStore } from "../utils/store";
import { ensure } from "../utils/clone";
import { DEFAULT_CONFIG } from "./config";
import { getModelProvider } from "../utils/model";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const isApp = getClientConfig()?.buildMode === "export";

const DEFAULT_GOOGLE_URL = isApp ? GEMINI_BASE_URL : ApiPath.Google;

const DEFAULT_DEEPSEEK_URL = isApp ? DEEPSEEK_BASE_URL : ApiPath.DeepSeek;

const serverConfigMeta = getServerConfig();
const INITIAL_ENABLED_PROVIDERS =
  serverConfigMeta?.enabledProviders?.length > 0
    ? [...serverConfigMeta.enabledProviders]
    : [...DEFAULT_ENABLED_PROVIDERS];
function getDefaultModelForProvider(provider: ServiceProvider) {
  const model = DEFAULT_MODELS.find(
    (entry) => entry.provider?.providerName === provider,
  );
  return model?.name ?? DEFAULT_CONFIG.modelConfig.model;
}
const INITIAL_PROVIDER =
  INITIAL_ENABLED_PROVIDERS[0] ?? ServiceProvider.DeepSeek;
const INITIAL_PROVIDER_DEFAULT_MODEL =
  getDefaultModelForProvider(INITIAL_PROVIDER);
const REMOVED_PROVIDERS = Object.values(ServiceProvider).filter(
  (p) => !DEFAULT_ENABLED_PROVIDERS.includes(p as ServiceProvider),
);

const DEFAULT_ACCESS_STATE = {
  accessCode: "",
  useCustomConfig: false,

  provider: INITIAL_PROVIDER,

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
  defaultModel: INITIAL_PROVIDER_DEFAULT_MODEL,
  visionModels: "",
  enabledProviders: [...INITIAL_ENABLED_PROVIDERS],
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
          const enabledProvidersFromServer =
            res.enabledProviders?.length > 0
              ? res.enabledProviders
              : [...DEFAULT_ENABLED_PROVIDERS];
          if (defaultModel !== "" && enabledProvidersFromServer.length > 0) {
            const [model, providerName] = getModelProvider(defaultModel);
            const normalizedProvider = providerName as ServiceProvider;
            let targetProvider: ServiceProvider | undefined;
            if (
              normalizedProvider &&
              enabledProvidersFromServer.includes(normalizedProvider)
            ) {
              targetProvider = normalizedProvider;
            } else {
              targetProvider = enabledProvidersFromServer[0];
            }
            if (targetProvider) {
              const fallbackModel = getDefaultModelForProvider(targetProvider);
              DEFAULT_CONFIG.modelConfig.model =
                targetProvider === normalizedProvider ? model : fallbackModel;
              DEFAULT_CONFIG.modelConfig.providerName = targetProvider as any;
            }
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
      state.enabledProviders =
        state.enabledProviders?.length > 0
          ? state.enabledProviders
          : [...INITIAL_ENABLED_PROVIDERS];
      if (
        version < 5 ||
        REMOVED_PROVIDERS.includes(state.provider as any) ||
        (state.enabledProviders.length > 0 &&
          !state.enabledProviders.includes(state.provider as ServiceProvider))
      ) {
        state.provider = state.enabledProviders[0] ?? ServiceProvider.DeepSeek;
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
