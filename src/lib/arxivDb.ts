import Database from "better-sqlite3";
import path from "path";

const DB_PATH =
  process.env.ARXIV_DB_PATH ??
  path.resolve(process.cwd(), "/app/actions-runner-arxiv/_work/arxiv-graph/arxiv-graph/data/arxiv_graph.db");


let _db: Database.Database | null = null;

console.log("Using database path:", DB_PATH);

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
  }
  return _db;
}

export type Paper = {
  arxiv_id: string;
  title: string;
  abstract: string;
  pdf_url: string;
  published_at: string;
  primary_category: string;
  importance_score: number;
  citation_count: number;
};

export type Relation = {
  source_id: string;
  target_id: string;
  relation_type: string;
  weight: number;
};

export type Stats = {
  paperCount: number;
  relationCount: number;
  authorCount: number;
  categories: { primary_category: string; cnt: number }[];
};

export type GraphNode = Pick<
  Paper,
  "arxiv_id" | "title" | "primary_category" | "importance_score"
>;

export function getTopPapers(limit = 50): Paper[] {
  try {
    return getDb()
      .prepare(
        `SELECT arxiv_id, title, abstract, pdf_url, published_at,
                primary_category, importance_score, citation_count
         FROM papers
         ORDER BY importance_score DESC
         LIMIT ?`
      )
      .all(limit) as Paper[];
  } catch {
    return [];
  }
}

export function getStats(): Stats {
  try {
    const db = getDb();
    const paperCount = (
      db.prepare("SELECT COUNT(*) as cnt FROM papers").get() as { cnt: number }
    ).cnt;
    const relationCount = (
      db
        .prepare("SELECT COUNT(*) as cnt FROM paper_relations")
        .get() as { cnt: number }
    ).cnt;
    const authorCount = (
      db.prepare("SELECT COUNT(*) as cnt FROM authors").get() as { cnt: number }
    ).cnt;
    const categories = db
      .prepare(
        `SELECT primary_category, COUNT(*) as cnt
         FROM papers
         GROUP BY primary_category
         ORDER BY cnt DESC`
      )
      .all() as { primary_category: string; cnt: number }[];
    return { paperCount, relationCount, authorCount, categories };
  } catch {
    return { paperCount: 0, relationCount: 0, authorCount: 0, categories: [] };
  }
}

export function getGraphData(limit = 40): { papers: GraphNode[]; relations: Relation[] } {
  try {
    const db = getDb();
    const papers = db
      .prepare(
        `SELECT arxiv_id, title, primary_category, importance_score
         FROM papers
         ORDER BY importance_score DESC
         LIMIT ?`
      )
      .all(limit) as GraphNode[];

    if (papers.length === 0) return { papers: [], relations: [] };

    const ids = papers.map((p) => p.arxiv_id);
    const ph = ids.map(() => "?").join(",");
    const relations = db
      .prepare(
        `SELECT source_id, target_id, relation_type, weight
         FROM paper_relations
         WHERE source_id IN (${ph}) AND target_id IN (${ph})
         LIMIT 300`
      )
      .all(...ids, ...ids) as Relation[];

    return { papers, relations };
  } catch {
    return { papers: [], relations: [] };
  }
}
