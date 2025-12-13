import packageJson from "../../package.json";
import { DEFAULT_INPUT_TEMPLATE } from "../constant";

export const getBuildConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  const buildMode = process.env.BUILD_MODE ?? "standalone";
  const isApp = !!process.env.BUILD_APP;
  const version =
    "v" + (process.env.npm_package_version ?? packageJson.version ?? "0.0.0");

  const commitInfo = (() => {
    // Only run git commands on server (Node.js environment with child_process)
    if (typeof window !== "undefined") {
      return {
        commitDate: "unknown",
        commitHash: "unknown",
      };
    }
    try {
      // Dynamic require to prevent Turbopack from bundling child_process in client
      const childProcess =
        typeof require !== "undefined" ? require("child_process") : null;
      if (!childProcess) {
        return {
          commitDate: "unknown",
          commitHash: "unknown",
        };
      }
      const commitDate: string = childProcess
        .execSync('git log -1 --format="%at000" --date=unix')
        .toString()
        .trim();
      const commitHash: string = childProcess
        .execSync('git log --pretty=format:"%H" -n 1')
        .toString()
        .trim();

      return { commitDate, commitHash };
    } catch (e) {
      console.error("[Build Config] No git or not from git repo.");
      return {
        commitDate: "unknown",
        commitHash: "unknown",
      };
    }
  })();

  return {
    version,
    ...commitInfo,
    buildMode,
    isApp,
    template: process.env.DEFAULT_INPUT_TEMPLATE ?? DEFAULT_INPUT_TEMPLATE,
  };
};

export type BuildConfig = ReturnType<typeof getBuildConfig>;
