import {
  HomeIcon, PostsIcon, GraphIcon, AboutIcon,
  GameIcon, StatsIcon, ChangelogIcon,
} from "@/components/Icons";

export const NAV = [
  { href: "/",          label: "홈",          icon: <HomeIcon /> },
  { href: "/posts",     label: "글",          icon: <PostsIcon /> },
  { href: "/explore",   label: "탐색",         icon: <GraphIcon /> },
  { href: "/about",     label: "소개",         icon: <AboutIcon /> },
  { href: "/game",      label: "게임",         icon: <GameIcon /> },
  { href: "/stats",     label: "통계",         icon: <StatsIcon /> },
  { href: "/changelog", label: "업데이트 기록",  icon: <ChangelogIcon /> },
];
