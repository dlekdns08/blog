type Props = {
  slug: string;
};

/**
 * GitHub에서 글 소스 직접 편집 링크.
 * NEXT_PUBLIC_GITHUB_REPO 환경변수가 필요 (e.g. "user/blog").
 * 미설정 시 렌더링 안 함.
 */
export function EditSuggestion({ slug }: Props) {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  if (!repo) return null;

  const branch = process.env.NEXT_PUBLIC_GITHUB_BRANCH ?? "main";
  const url = `https://github.com/${repo}/edit/${branch}/blog/content/posts/${slug}.md`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-subtle hover:text-accent transition-colors"
    >
      <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.549 2.8a2.121 2.121 0 1 1 3 3L19.862 7.487M16.862 4.487 9.396 11.953a4.5 4.5 0 0 0-1.13 1.897l-.808 2.685a.75.75 0 0 0 .933.933l2.685-.808a4.5 4.5 0 0 0 1.897-1.13L19.862 7.487M16.862 4.487 19.862 7.487" />
      </svg>
      <span>이 글 편집 제안하기</span>
    </a>
  );
}
