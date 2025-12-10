import js from "@eslint/js";
import { fixupPluginRules } from "@eslint/compat";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import unusedImports from "eslint-plugin-unused-imports";
import prettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
    {
        ignores: ["public/serviceWorker.js", "app/mcp/mcp_config.json", "app/mcp/mcp_config.default.json", ".next/**", "node_modules/**", "scripts/**"]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: { jsx: true }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest
            }
        },
        plugins: {
            react: fixupPluginRules(reactPlugin),
            "react-hooks": fixupPluginRules(reactHooksPlugin),
            "@next/next": fixupPluginRules(nextPlugin),
            "unused-imports": unusedImports,
            prettier: prettier
        },
        settings: {
            react: {
                version: "detect"
            }
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,

            "unused-imports/no-unused-imports": "warn",
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "@next/next/no-img-element": "off",

            // Adjustments for existing codebase
            "@typescript-eslint/no-unused-vars": "warn",
            "no-unused-vars": "off",
            "no-undef": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-wrapper-object-types": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-this-alias": "off",
            "@typescript-eslint/no-unused-expressions": "off",

            "prefer-const": "off",
            "no-var": "off",
            "no-prototype-builtins": "off",
            "no-empty": "warn",
            "no-useless-escape": "off",
            "no-useless-catch": "off",

            // Legacy/Strict rules disabled for migration
            "@typescript-eslint/no-namespace": "off",
            "prefer-spread": "off",
            // "react-hooks/refs" is flagging valid ref prop passing in some cases or is too strict for current codebase patterns
            "react-hooks/refs": "off",
            "react-hooks/rules-of-hooks": "error", // Ensure this stays on
            "react-hooks/exhaustive-deps": "warn" // Ensure this stays on
        }
    }
);
