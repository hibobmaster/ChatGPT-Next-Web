import { ApiPath } from "@/app/constant";
import { NextRequest } from "next/server";
import { handle as googleHandler } from "../../google";
import { handle as deepseekHandler } from "../../deepseek";
import { handle as proxyHandler } from "../../proxy";

async function handle(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string; path: string[] }> },
) {
  const p = await params; // Resolve the promise
  const apiPath = `/api/${p.provider}`;
  console.log(`[${p.provider} Route] params `, p);
  switch (apiPath) {
    case ApiPath.Google:
      return googleHandler(req, { params: p });
    case ApiPath.DeepSeek:
      return deepseekHandler(req, { params: p });
    default:
      return proxyHandler(req, { params: p });
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
export const preferredRegion = [
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];
