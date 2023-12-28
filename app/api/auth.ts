import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import { ModelProvider } from "../constant";

export function auth(req: NextRequest, modelProvider: ModelProvider) {
  // const authToken = req.headers.get("Authorization") ?? "";

  // check if it is openai api key or user token
  // const { accessCode, apiKey: token } = parseApiKey(authToken);

  // const hashedCode = md5.hash(accessCode ?? "").trim();

  const serverConfig = getServerSideConfig();
  // console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  // console.log("[Auth] got access code:", accessCode);
  // console.log("[Auth] hashed access code:", hashedCode);
  // console.log("[User IP] ", getIP(req));
  // console.log("[Time] ", new Date().toLocaleString());

  // if (serverConfig.needCode && !serverConfig.codes.has(hashedCode) && !token) {
  //   return {
  //     error: true,
  //     msg: !accessCode ? "empty access code" : "wrong access code",
  //   };
  // }

  // if (serverConfig.hideUserApiKey && !!apiKey) {
  //   return {
  //     error: true,
  //     msg: "you are not allowed to access openai with your own api key",
  //   };
  // }

  const systemApiKey =
    modelProvider === ModelProvider.GeminiPro
      ? serverConfig.googleApiKey
      : serverConfig.isAzure
      ? serverConfig.azureApiKey
      : serverConfig.apiKey;
  if (systemApiKey) {
    console.log("[Auth] use system api key");
    req.headers.set("Authorization", `Bearer ${systemApiKey}`);
  } else {
    console.log("[Auth] admin did not provide an api key");
  }

  return {
    error: false,
  };
}
