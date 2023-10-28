import { useEffect, useRef, useCallback } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";
import DragIcon from "../icons/drag.svg";

import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showConfirm, showToast } from "./ui-lib";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        if (e.key === "ArrowUp") {
          chatStore.nextSession(-1);
        } else if (e.key === "ArrowDown") {
          chatStore.nextSession(1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
  const lastUpdateTime = useRef(Date.now());

  const toggleSideBar = () => {
    config.update((config) => {
      if (config.sidebarWidth < MIN_SIDEBAR_WIDTH) {
        config.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
      } else {
        config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
      }
    });
  };

  const onDragStart = (e: MouseEvent) => {
    // Remembers the initial width each time the mouse is pressed
    startX.current = e.clientX;
    startDragWidth.current = config.sidebarWidth;
    const dragStartTime = Date.now();

    const handleDragMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 20) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);
      config.update((config) => {
        if (nextWidth < MIN_SIDEBAR_WIDTH) {
          config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
        } else {
          config.sidebarWidth = nextWidth;
        }
      });
    };

    const handleDragEnd = () => {
      // In useRef the data is non-responsive, so `config.sidebarWidth` can't get the dynamic sidebarWidth
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);

      // if user click the drag icon, should toggle the sidebar
      const shouldFireClick = Date.now() - dragStartTime < 300;
      if (shouldFireClick) {
        toggleSideBar();
      }
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragStart,
    shouldNarrow,
  };
}

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();

  useHotKey();

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]} data-tauri-drag-region>
        <div className={styles["sidebar-title"]} data-tauri-drag-region>
          ChatGPT Next
        </div>
        <div className={styles["sidebar-sub-title"]}>
          你的智能AI助手
          <br />
          如果提示需要认证，请尝试Ctrl+F5强制刷新缓存再点击网址旁边的刷新按钮刷新一下页面然后新建一个对话试试或使用浏览器隐私(无痕)模式打开
          <br />
          反馈
          <svg
            width="14"
            height="10"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#000000"
              d="M14.608 12.172c0 .84.239 1.175.864 1.175c1.393 0 2.28-1.775 2.28-4.727c0-4.512-3.288-6.672-7.393-6.672c-4.223 0-8.064 2.832-8.064 8.184c0 5.112 3.36 7.896 8.52 7.896c1.752 0 2.928-.192 4.727-.792l.386 1.607c-1.776.577-3.674.744-5.137.744c-6.768 0-10.393-3.72-10.393-9.456c0-5.784 4.201-9.72 9.985-9.72c6.024 0 9.215 3.6 9.215 8.016c0 3.744-1.175 6.6-4.871 6.6c-1.681 0-2.784-.672-2.928-2.161c-.432 1.656-1.584 2.161-3.145 2.161c-2.088 0-3.84-1.609-3.84-4.848c0-3.264 1.537-5.28 4.297-5.28c1.464 0 2.376.576 2.782 1.488l.697-1.272h2.016v7.057h.002zm-2.951-3.168c0-1.319-.985-1.872-1.801-1.872c-.888 0-1.871.719-1.871 2.832c0 1.68.744 2.616 1.871 2.616c.792 0 1.801-.504 1.801-1.896v-1.68z"
            />
          </svg>
          :&nbsp;<a href="mailto:bobmaster@hibobmaster.com">邮件联系</a> <br />
          聊天室
          <svg
            width="14"
            height="10"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M12.081 0C7.048-.034 2.339 3.125.637 8.153c-2.125 6.276 1.24 13.086 7.516 15.21c6.276 2.125 13.086-1.24 15.21-7.516c1.727-5.1-.172-10.552-4.311-13.557l.126 2.547c2.065 2.282 2.88 5.512 1.852 8.549c-1.534 4.532-6.594 6.915-11.3 5.321c-4.708-1.593-7.28-6.559-5.745-11.092c1.031-3.046 3.655-5.121 6.694-5.67l1.642-1.94A4.87 4.87 0 0 0 12.08 0zm3.528 1.094a.284.284 0 0 0-.123.024l-.004.001a.33.33 0 0 0-.109.071c-.145.142-.657.828-.657.828L13.6 3.4l-1.3 1.585l-2.232 2.776s-1.024 1.278-.798 2.851c.226 1.574 1.396 2.34 2.304 2.648c.907.307 2.302.408 3.438-.704c1.135-1.112 1.098-2.75 1.098-2.75l-.087-3.56l-.07-2.05l-.047-1.775s.01-.856-.02-1.057a.33.33 0 0 0-.035-.107l-.006-.012l-.007-.011a.277.277 0 0 0-.229-.14z"
            />
          </svg>
          :&nbsp;
          <a
            target="_blank"
            href="https://chat.quanquan.space/signup_user_complete/?id=zhqfc9nadpdgfqm9msetg4xb9a"
          >
            点击加入
          </a>{" "}
          <br />
          圈圈之地论坛
          <svg
            width="14"
            height="10"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#000000"
              d="M28 6H8c-1.2 0-2 .8-2 2v14c0 1.2.8 2 2 2h8v-2H8V8h20v14h-7.2L16 28.8l1.6 1.2l4.2-6H28c1.2 0 2-.8 2-2V8c0-1.2-.8-2-2-2z"
            />
            <path
              fill="#000000"
              d="M4 18H2V5c0-1.7 1.3-3 3-3h13v2H5c-.6 0-1 .4-1 1v13z"
            />
          </svg>
          :&nbsp;
          <a target="_blank" href="https://quanquan.space/">
            点击访问
          </a>{" "}
          <br />
          ChatGPT镜像
          <svg
            width="14"
            height="10"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#000000"
              d="M20.562 10.188c.25-.688.313-1.376.25-2.063c-.062-.688-.312-1.375-.625-2c-.562-.938-1.375-1.688-2.312-2.125c-1-.438-2.063-.563-3.125-.313c-.5-.5-1.063-.937-1.688-1.25C12.437 2.126 11.687 2 11 2a5.17 5.17 0 0 0-3 .938c-.875.624-1.5 1.5-1.813 2.5c-.75.187-1.375.5-2 .875c-.562.437-1 1-1.375 1.562c-.562.938-.75 2-.625 3.063a5.438 5.438 0 0 0 1.25 2.874a4.695 4.695 0 0 0-.25 2.063c.063.688.313 1.375.625 2c.563.938 1.375 1.688 2.313 2.125c1 .438 2.062.563 3.125.313c.5.5 1.062.937 1.687 1.25c.625.312 1.375.437 2.063.437a5.17 5.17 0 0 0 3-.938c.875-.625 1.5-1.5 1.812-2.5a4.543 4.543 0 0 0 1.938-.875c.562-.437 1.062-.937 1.375-1.562c.562-.938.75-2 .625-3.063c-.125-1.062-.5-2.062-1.188-2.874Zm-7.5 10.5c-1 0-1.75-.313-2.437-.875c0 0 .062-.063.125-.063l4-2.313a.488.488 0 0 0 .25-.25c.062-.125.062-.187.062-.312V11.25l1.688 1v4.625a3.685 3.685 0 0 1-3.688 3.813ZM5 17.25c-.438-.75-.625-1.625-.438-2.5c0 0 .063.063.125.063l4 2.312a.563.563 0 0 0 .313.063c.125 0 .25 0 .312-.063l4.875-2.813v1.938l-4.062 2.375A3.71 3.71 0 0 1 7.312 19c-1-.25-1.812-.875-2.312-1.75ZM3.937 8.562a3.807 3.807 0 0 1 1.938-1.624v4.75c0 .124 0 .25.062.312a.488.488 0 0 0 .25.25l4.875 2.813l-1.687 1l-4-2.313a3.697 3.697 0 0 1-1.75-2.25c-.25-.938-.188-2.063.312-2.938ZM17.75 11.75l-4.875-2.813l1.687-1l4 2.313c.625.375 1.125.875 1.438 1.5c.312.625.5 1.313.437 2.063a3.718 3.718 0 0 1-.75 1.937c-.437.563-1 1-1.687 1.25v-4.75c0-.125 0-.25-.063-.313c0 0-.062-.124-.187-.187Zm1.687-2.5s-.062-.063-.125-.063l-4-2.312c-.125-.063-.187-.063-.312-.063s-.25 0-.313.063L9.812 9.688V7.75l4.063-2.375c.625-.375 1.312-.5 2.062-.5c.688 0 1.375.25 2 .688c.563.437 1.063 1 1.313 1.625s.312 1.375.187 2.062Zm-10.5 3.5l-1.687-1V7.062c0-.687.187-1.437.562-2C8.187 4.438 8.75 4 9.375 3.688a3.365 3.365 0 0 1 2.062-.312c.688.063 1.375.375 1.938.813c0 0-.063.062-.125.062l-4 2.313a.488.488 0 0 0-.25.25c-.063.125-.063.187-.063.312v5.625Zm.875-2L12 9.5l2.187 1.25v2.5L12 14.5l-2.188-1.25v-2.5Z"
            />
          </svg>
          :&nbsp;
          <a target="_blank" href="https://g.bobmaster.eu.org/">
            点击访问
          </a>{" "}
        </div>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <ChatGptIcon />
        </div>
      </div>

      <div className={styles["sidebar-header-bar"]}>
        <IconButton
          icon={<MaskIcon />}
          text={shouldNarrow ? undefined : Locale.Mask.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => {
            if (config.dontShowMaskSplashScreen !== true) {
              navigate(Path.NewChat, { state: { fromHome: true } });
            } else {
              navigate(Path.Masks, { state: { fromHome: true } });
            }
          }}
          shadow
        />
        <IconButton
          icon={<PluginIcon />}
          text={shouldNarrow ? undefined : Locale.Plugin.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => showToast(Locale.WIP)}
          shadow
        />
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <IconButton
              icon={<CloseIcon />}
              onClick={async () => {
                if (await showConfirm(Locale.Home.DeleteChat)) {
                  chatStore.deleteSession(chatStore.currentSessionIndex);
                }
              }}
            />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
              <IconButton icon={<SettingsIcon />} shadow />
            </Link>
          </div>
          <div className={styles["sidebar-action"]}>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <IconButton icon={<GithubIcon />} shadow />
            </a>
          </div>
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
            shadow
          />
        </div>
      </div>

      <div
        className={styles["sidebar-drag"]}
        onPointerDown={(e) => onDragStart(e as any)}
      >
        <DragIcon />
      </div>
    </div>
  );
}
