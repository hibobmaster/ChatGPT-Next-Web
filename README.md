## QuanQuanChat (ChatGPT Next Web)

QuanQuanChat (aka ChatGPT Next Web) is a privacy-first chat platform built with Next.js and React 19. It provides a modular interface for managing prompts and provider lists so you can host a self‑service ChatGPT experience for the web.

## Features

- Framework: Next.js 16+ with the App Router and React 19 powering a responsive UI plus built-in analytics, markdown rendering, and KaTeX support.
- Prompt masks: `app/masks` defines reusable masks that are compiled into `public/masks.json` via `pnpm mask`, making it easy to keep localized prompt libraries in sync.
- Prompt registries: Built-in registry under `public/prompts.json` lets you ship curated prompt sets out of the box.
- Provider & model control: Environment flags cover OpenAI plus DeepSeek and Google fallbacks, plus fine-grained defaults like `CUSTOM_MODELS`, `DEFAULT_MODEL`, and `VISION_MODELS`.
- Security & access: Optional `CODE` gate, toggle-able GPT-4 access (`DISABLE_GPT4`), and optional hidden-key mode (`HIDE_USER_API_KEY`) let you control who interacts with the service.
- Proxy-ready builds: Docker image and proxy scripts (`scripts/init-proxy.sh`, `proxychains.conf`) make it easy to run behind `PROXY_URL` or VPN tunnels.
- Flexible deployments: Use `pnpm build` for standalone servers or `pnpm export` for static exports that suit CDN + proxy hosting.

## Getting started

### Prerequisites

- Node.js 18+ and `pnpm` 9+ (the project ships with `pnpm-lock.yaml` and `packageManager` set to `pnpm@9.15.0`).
- Docker 20+ if you plan to run the containerized stack.

### Local development

1. Clone and install:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` or create `.env.local` to declare secrets such as `OPENAI_API_KEY`, `CODE`, and provider-specific keys.

3. Run the full dev loop:

   ```bash
   pnpm dev
   ```

   `pnpm dev` runs `pnpm mask:watch` alongside `next dev`, so prompt masks regenerate automatically when `app/masks` changes.

4. Optional helper scripts:

   - `pnpm mask` (`pnpm mask:watch`) regenerates `public/masks.json` from `app/masks`.
   - `pnpm prompts` pulls prompt collections from `scripts/fetch-prompts.mjs`.
   - `pnpm proxy-dev` boots `pnpm dev` through `proxychains` via `scripts/init-proxy.sh`.

### Production & export

- `pnpm build`: runs the mask builder then Next.js standalone build (`BUILD_MODE=standalone`).
- `pnpm start`: serves the standalone build from `.next/standalone`.
- `pnpm export`: creates an export build (`BUILD_MODE=export`), suitable for static hosting or CDN deployment.
- `pnpm export:dev`: watch-style version of the export build for debugging.

### Docker & proxies

- `docker build -t quanquanchat .` / `docker-compose up` to rebuild the image defined in `Dockerfile`, which wires `yarn build` and optionally `proxychains`.
- Configure `PROXY_URL` to run requests through a proxy. The container installs `proxychains-ng` and rewrites `/etc/proxychains.conf` before starting `node server.js`.
- Pass `PROXY_URL`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `CODE`, and `ENABLE_MCP` when running the container to match your deployment profile.

### Scripts reference

| Script | Description |
| --- | --- |
| `pnpm dev` | Development server with mask watcher. |
| `pnpm build` | Build masks + Next.js standalone output. |
| `pnpm start` | Run the standalone server in production. |
| `pnpm export` | Export-ready build (`BUILD_MODE=export`) for CDN or proxy hosting. |
| `pnpm export:dev` | Watch-style export build for debugging. |
| `pnpm mask` | Compile `app/masks` → `public/masks.json`. |
| `pnpm mask:watch` | Rebuild masks when sources change. |
| `pnpm proxy-dev` | Launch `pnpm dev` through `proxychains` (see `scripts/init-proxy.sh`). |
| `pnpm prompts` | Refresh prompt catalog from `scripts/fetch-prompts.mjs`. |
| `pnpm lint` | Lints the project with `eslint`. |
| `pnpm test` | Jest watch mode. |
| `pnpm test:ci` | Headless Jest run suited for CI. |
| `pnpm prepare` | Installs Husky hooks. |

## Environment variables

- **Access control**
  - `CODE` *(optional)* – comma-separated list of passwords for the site-wide gate.
  - `HIDE_USER_API_KEY` *(optional, default empty)* – set to `1` to prevent end users from supplying their own provider keys.


- **Provider fallbacks**
  - `GOOGLE_API_KEY` / `GOOGLE_URL` – Gemini Pro credentials and endpoint.
  - `DEEPSEEK_API_KEY` / `DEEPSEEK_URL` – DeepSeek chat provider.

- **Model & UI customization**
  - `CUSTOM_MODELS` – prefix with `+` to add, `-` to hide, and `name=display` to rename models. Use `-all`/`+all` to toggle defaults. ByteDance endpoints accept `modelName@bytedance=deploymentName`.
  - `DEFAULT_MODEL` – force the dropdown default.
  - `VISION_MODELS` – comma-separated list of models that should render with camera/canvas mode on top of the built-in regex.
  - `WHITE_WEBDAV_ENDPOINTS` – comma or semicolon separated fully-qualified WebDAV URLs that are accessible from the file browser.
  - `DEFAULT_INPUT_TEMPLATE` – pre-fill the User Input Preprocessing template field.
  - `ENABLE_MCP` – set to `1` to enable the Model Context Protocol client shipped in `app/mcp`.

- **Infrastructure**
  - `PROXY_URL` – pull requests through `scripts/init-proxy.sh`/`proxychains` (supported by `docker`/`pnpm proxy-dev`).

## Project structure

- `app/` – Next.js `app` router entrypoint, API routes, stores, UI components, localization, prompts, masks, and store logic.
- `public/` – compiled prompts (`prompts.json`) and generated masks (`masks.json`).
- `scripts/` – helper scripts such as prompt fetcher, proxy init, and setup helper for new machines.
- `Dockerfile` / `docker-compose.yml` – containerized deployment with proxy configuration baked-in.

## Testing & quality

- `pnpm lint` – runs `eslint` with the Next.js configuration.
- `pnpm test` / `pnpm test:ci` – Jest (with `ts-jest` configuration in `jest.config.ts`).
- `pnpm prepare` – installs Husky hooks defined in `.husky/` (run once after cloning).

## Contributing

- Follow `CODE_OF_CONDUCT.md`.
- Keep commits in English, run `pnpm lint`, `pnpm test`, and `pnpm mask` before pushing.
- Create issues or PRs against the upstream [ChatGPT-Next-Web](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web) repository.

## License

MIT.
