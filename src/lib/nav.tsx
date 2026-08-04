import {
  HomeIcon, PostsIcon, GraphIcon, AboutIcon,
  StatsIcon, ChangelogIcon,
} from "@/components/Icons";

export const NAV = [
  { href: "/",          label: "홈",          icon: <HomeIcon /> },
  { href: "/posts",     label: "글",          icon: <PostsIcon /> },
  { href: "/explore",   label: "탐색",         icon: <GraphIcon /> },
  { href: "/about",     label: "소개",         icon: <AboutIcon /> },
  // 게임 메뉴는 숨김 처리 (복구하려면 아래 줄 주석 해제 + GameIcon import 추가)
  // { href: "/game",      label: "게임",         icon: <GameIcon /> },
  { href: "/stats",     label: "통계",         icon: <StatsIcon /> },
  { href: "/changelog", label: "업데이트 기록",  icon: <ChangelogIcon /> },
];
