import { ModelProvider, StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import { ClientApi } from "../client/api";

const ONE_MINUTE = 60 * 1000;

export const useUpdateStore = createPersistStore(
  {
    used: 0,
    subscription: 0,
    lastUpdateUsage: 0,
  },
  (set, get) => ({
    async updateUsage(force = false) {
      // only support openai for now
      const overOneMinute = Date.now() - get().lastUpdateUsage >= ONE_MINUTE;
      if (!overOneMinute && !force) return;

      set(() => ({
        lastUpdateUsage: Date.now(),
      }));

      try {
        const api = new ClientApi(ModelProvider.GPT);
        const usage = await api.llm.usage();

        if (usage) {
          set(() => ({
            used: usage.used,
            subscription: usage.total,
          }));
        }
      } catch (e) {
        console.error((e as Error).message);
      }
    },
  }),
  {
    name: StoreKey.Update,
    version: 1,
  },
);
