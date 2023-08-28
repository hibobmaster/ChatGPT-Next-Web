import { useEffect, useRef } from "react";

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
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
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
              fill="#000000"
              d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12s12-5.373 12-12S18.627 0 12 0zm-1.314 4.715c3.289 0 5.956 2.66 5.956 5.943a.879.879 0 0 1-1.758 0a4.194 4.194 0 0 0-4.198-4.189a.878.878 0 1 1 0-1.754zm-5.092 9.504a.879.879 0 0 1-.879-.877a5.95 5.95 0 0 1 5.956-5.945a.878.878 0 1 1 0 1.753a4.195 4.195 0 0 0-4.198 4.191a.88.88 0 0 1-.879.878zm7.735 5.067c-3.29 0-5.957-2.662-5.957-5.944a.88.88 0 0 1 1.758 0a4.194 4.194 0 0 0 4.199 4.189a.879.879 0 1 1 0 1.755zm0-2.683a.88.88 0 0 1-.88-.876a.88.88 0 0 1 .88-.878a4.195 4.195 0 0 0 4.199-4.19a.878.878 0 0 1 1.758 0c0 3.282-2.667 5.944-5.957 5.944z"
            />
          </svg>
          :&nbsp;
          <a target="_blank" href="https://im.qqs.tw">
            点击加入
          </a>{" "}
          <br />
          长毛象
          <svg
            width="14"
            height="10"
            viewBox="0 0 256 274"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#3088D4"
              d="M249.874 164.085c-3.753 19.307-33.613 40.438-67.908 44.533c-17.883 2.134-35.49 4.095-54.266 3.234c-30.705-1.407-54.933-7.33-54.933-7.33c0 2.99.184 5.836.553 8.498c3.992 30.302 30.047 32.118 54.728 32.964c24.912.852 47.094-6.142 47.094-6.142l1.023 22.521s-17.425 9.357-48.465 11.078c-17.116.94-38.369-.43-63.122-6.983c-53.686-14.21-62.92-71.436-64.332-129.502c-.43-17.24-.165-33.497-.165-47.094c0-59.375 38.903-76.779 38.903-76.779C58.6 4.074 92.259.286 127.25 0h.86c34.991.286 68.673 4.074 88.287 13.083c0 0 38.901 17.404 38.901 76.78c0 0 .488 43.807-5.425 74.222"
            />
            <path
              fill="#FFF"
              d="M209.413 94.469v71.894H180.93V96.582c0-14.71-6.19-22.176-18.57-22.176c-13.687 0-20.547 8.857-20.547 26.37v38.195h-28.315v-38.195c0-17.513-6.862-26.37-20.55-26.37c-12.379 0-18.568 7.466-18.568 22.176v69.78H45.897V94.47c0-14.694 3.741-26.37 11.256-35.009c7.75-8.638 17.898-13.066 30.496-13.066c14.575 0 25.613 5.602 32.911 16.808l7.095 11.893l7.096-11.893c7.296-11.206 18.334-16.808 32.911-16.808c12.597 0 22.745 4.428 30.496 13.066c7.513 8.639 11.255 20.315 11.255 35.009"
            />
          </svg>
          :&nbsp;
          <a target="_blank" href="https://m.qqs.tw/">
            分布式的类微博推特平台
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
          onClick={() => navigate(Path.NewChat, { state: { fromHome: true } })}
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
        onMouseDown={(e) => onDragMouseDown(e as any)}
      >
        <DragIcon />
      </div>
    </div>
  );
}
