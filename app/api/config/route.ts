import { NextRequest, NextResponse } from "next/server";

import { getServerSideConfig } from "../../config/server";

const serverConfig = getServerSideConfig();

// Danger! Do not hard code any secret value here!
// 警告！不要在这里写入任何敏感信息！
const DANGER_CONFIG = {
  needCode: serverConfig.needCode,
  hideUserApiKey: serverConfig.hideUserApiKey,
  disableGPT4: serverConfig.disableGPT4,
  hideBalanceQuery: serverConfig.hideBalanceQuery,
  disableFastLink: serverConfig.disableFastLink,
  customModels: serverConfig.customModels,
  defaultModel: serverConfig.defaultModel,
  visionModels: serverConfig.visionModels,
  enabledProviders: serverConfig.enabledProviders,
};

type DangerConfigBase = typeof DANGER_CONFIG;

declare global {
  type DangerConfig = DangerConfigBase & {
    hasBasicAuth: boolean;
  };
}

async function handle(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const hasBasicAuth = authHeader.trim().toLowerCase().startsWith("basic ");

  const needCode = hasBasicAuth ? false : DANGER_CONFIG.needCode;

  return NextResponse.json({
    ...DANGER_CONFIG,
    needCode,
    hasBasicAuth,
  });
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
