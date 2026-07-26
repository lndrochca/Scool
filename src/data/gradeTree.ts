import type { GradeNode } from "../types";

let uid = 0;
function makeId(prefix: string) {
  uid += 1;
  return `${prefix}${Date.now().toString(36)}${uid}`;
}

export function createFolder(name: string, weightPercent = 0): GradeNode {
  return { id: makeId("gf"), kind: "folder", name, weightPercent, children: [] };
}

export function createItem(name: string, weightPercent = 0, maxScore = 100): GradeNode {
  return { id: makeId("gi"), kind: "item", name, weightPercent, score: null, maxScore };
}

export function createTerm(name: string, weightPercent = 0): GradeNode {
  return { id: makeId("term"), kind: "folder", name, weightPercent, children: [] };
}

export const DEFAULT_TERM_NAMES = ["Prelim", "Midterm", "Prefinals", "Finals"];

export function createDefaultTerms(): GradeNode[] {
  return DEFAULT_TERM_NAMES.map((name) => createTerm(name));
}

export function createEmptyRoot(subjectName: string): GradeNode {
  return { id: makeId("root"), kind: "folder", name: subjectName, weightPercent: 100, children: [] };
}

export function findNode(root: GradeNode, id: string): GradeNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function getPath(root: GradeNode, id: string): GradeNode[] | null {
  if (root.id === id) return [root];
  for (const child of root.children ?? []) {
    const rest = getPath(child, id);
    if (rest) return [root, ...rest];
  }
  return null;
}

export function listFolders(root: GradeNode): { node: GradeNode; path: string }[] {
  const out: { node: GradeNode; path: string }[] = [];
  const walk = (node: GradeNode, trail: string[]) => {
    if (node.kind !== "folder") return;
    const nextTrail = [...trail, node.name];
    out.push({ node, path: nextTrail.join(" › ") });
    for (const child of node.children ?? []) walk(child, nextTrail);
  };
  walk(root, []);
  return out;
}

function mapTree(root: GradeNode, id: string, fn: (node: GradeNode) => GradeNode): GradeNode {
  if (root.id === id) return fn(root);
  if (!root.children) return root;
  return { ...root, children: root.children.map((c) => mapTree(c, id, fn)) };
}

export function updateNode(root: GradeNode, id: string, patch: Partial<GradeNode>): GradeNode {
  return mapTree(root, id, (node) => ({ ...node, ...patch }));
}

export function toggleCollapse(root: GradeNode, id: string): GradeNode {
  return mapTree(root, id, (node) => ({ ...node, collapsed: !node.collapsed }));
}

export function addChild(root: GradeNode, parentId: string, child: GradeNode): GradeNode {
  return mapTree(root, parentId, (node) => ({ ...node, children: [...(node.children ?? []), child] }));
}

function mapParentOf(root: GradeNode, childId: string, fn: (children: GradeNode[]) => GradeNode[]): GradeNode {
  if (!root.children) return root;
  if (root.children.some((c) => c.id === childId)) {
    return { ...root, children: fn(root.children) };
  }
  return { ...root, children: root.children.map((c) => mapParentOf(c, childId, fn)) };
}

export function deleteNode(root: GradeNode, id: string): GradeNode {
  return mapParentOf(root, id, (children) => children.filter((c) => c.id !== id));
}

function cloneWithNewIds(node: GradeNode): GradeNode {
  return {
    ...node,
    id: makeId(node.kind === "folder" ? "gf" : "gi"),
    children: node.children?.map(cloneWithNewIds),
  };
}

export function duplicateNode(root: GradeNode, id: string): GradeNode {
  return mapParentOf(root, id, (children) => {
    const idx = children.findIndex((c) => c.id === id);
    if (idx === -1) return children;
    const copy = cloneWithNewIds(children[idx]);
    copy.name = `${copy.name} Copy`;
    const next = [...children];
    next.splice(idx + 1, 0, copy);
    return next;
  });
}

export function reorderSibling(root: GradeNode, id: string, dir: -1 | 1): GradeNode {
  return mapParentOf(root, id, (children) => {
    const idx = children.findIndex((c) => c.id === id);
    const swapWith = idx + dir;
    if (idx === -1 || swapWith < 0 || swapWith >= children.length) return children;
    const next = [...children];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    return next;
  });
}

export function reorderToIndex(root: GradeNode, id: string, targetIndex: number): GradeNode {
  return mapParentOf(root, id, (children) => {
    const idx = children.findIndex((c) => c.id === id);
    if (idx === -1) return children;
    const next = [...children];
    const [moved] = next.splice(idx, 1);
    const clampedIndex = Math.max(0, Math.min(targetIndex, next.length));
    next.splice(clampedIndex, 0, moved);
    return next;
  });
}

export function moveNode(root: GradeNode, id: string, destinationFolderId: string): GradeNode {
  const node = findNode(root, id);
  if (!node) return root;
  const descendantIds = new Set<string>();
  const collect = (n: GradeNode) => {
    descendantIds.add(n.id);
    (n.children ?? []).forEach(collect);
  };
  collect(node);
  if (descendantIds.has(destinationFolderId)) return root;

  const withoutNode = deleteNode(root, id);
  return addChild(withoutNode, destinationFolderId, node);
}

export interface NodeStats {
  percent: number | null;
  itemCount: number;
  gradedCount: number;
}

export function computeNodeStats(node: GradeNode): NodeStats {
  if (node.kind === "item") {
    const hasScore = node.score !== null && node.score !== undefined && (node.maxScore ?? 0) > 0;
    return {
      percent: hasScore ? round1(((node.score as number) / (node.maxScore as number)) * 100) : null,
      itemCount: 1,
      gradedCount: hasScore ? 1 : 0,
    };
  }

  const children = node.children ?? [];
  const childStats = children.map((c) => ({ node: c, stats: computeNodeStats(c) }));
  const graded = childStats.filter((c) => c.stats.percent !== null);

  const itemCount = childStats.reduce((sum, c) => sum + c.stats.itemCount, 0);
  const gradedCount = childStats.reduce((sum, c) => sum + c.stats.gradedCount, 0);

  if (graded.length === 0) return { percent: null, itemCount, gradedCount };

  const totalWeight = graded.reduce((sum, c) => sum + (c.node.weightPercent || 0), 0);
  let percent: number;
  if (totalWeight > 0) {
    percent = graded.reduce((sum, c) => sum + (c.stats.percent as number) * (c.node.weightPercent || 0), 0) / totalWeight;
  } else {
    percent = graded.reduce((sum, c) => sum + (c.stats.percent as number), 0) / graded.length;
  }
  return { percent: round1(percent), itemCount, gradedCount };
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function toLetter(pct: number | null): string {
  if (pct === null || pct <= 0) return "—";
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 60) return "D";
  return "F";
}
