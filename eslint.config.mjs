import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.config({
        extends: ["next/core-web-vitals"],
        plugins: ["prettier", "unused-imports"],
        rules: {
            "unused-imports/no-unused-imports": "warn",
        },
    }),
    {
        ignores: ["public/serviceWorker.js", "app/mcp/mcp_config.json", "app/mcp/mcp_config.default.json"]
    }
];

export default eslintConfig;
