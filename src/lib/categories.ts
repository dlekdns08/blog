import type { PostMeta } from "./posts";

export type SubSubCategoryData = {
  name: string;
  count: number;
};

export type SubCategoryData = {
  name: string;
  count: number;
  children: SubSubCategoryData[];
};

export type CategoryData = {
  name: string;
  label: string;
  icon: string;
  count: number;
  children: SubCategoryData[];
};

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  ai:       { label: "AI",       icon: "🤖" },
  dev:      { label: "개발",     icon: "💻" },
  life:     { label: "일상",     icon: "☕" },
  class:    { label: "수업",     icon: "📚" },
  projects: { label: "프로젝트", icon: "🚀" },
};

export function buildCategoryTree(posts: PostMeta[]): CategoryData[] {
  type SubNode = { count: number; subSubs: Map<string, number> };
  type CatNode = { count: number; subs: Map<string, SubNode> };

  const map = new Map<string, CatNode>();

  for (const post of posts) {
    if (!post.category) continue;

    if (!map.has(post.category)) {
      map.set(post.category, { count: 0, subs: new Map() });
    }
    const node = map.get(post.category)!;
    node.count++;

    if (post.subcategory) {
      if (!node.subs.has(post.subcategory)) {
        node.subs.set(post.subcategory, { count: 0, subSubs: new Map() });
      }
      const subNode = node.subs.get(post.subcategory)!;
      subNode.count++;

      if (post.subSubcategory) {
        subNode.subSubs.set(
          post.subSubcategory,
          (subNode.subSubs.get(post.subSubcategory) ?? 0) + 1
        );
      }
    }
  }

  return Array.from(map.entries()).map(([name, node]) => ({
    name,
    label: CATEGORY_CONFIG[name]?.label ?? name,
    icon:  CATEGORY_CONFIG[name]?.icon  ?? "📁",
    count: node.count,
    children: Array.from(node.subs.entries()).map(([subName, subNode]) => ({
      name:  subName,
      count: subNode.count,
      children: Array.from(subNode.subSubs.entries()).map(([ssName, ssCount]) => ({
        name:  ssName,
        count: ssCount,
      })),
    })),
  }));
}
