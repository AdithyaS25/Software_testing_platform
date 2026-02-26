import type { Layout } from "react-grid-layout";

export const defaultLayout: Layout[] = [
  // Top metric cards (4 across)
  { i: "runs", x: 0, y: 0, w: 3, h: 2 },
  { i: "executions", x: 3, y: 0, w: 3, h: 2 },
  { i: "passRate", x: 6, y: 0, w: 3, h: 2 },
  { i: "bugs", x: 9, y: 0, w: 3, h: 2 },

  // Charts full width
  { i: "executionTrend", x: 0, y: 2, w: 12, h: 5 },
  { i: "bugTrend", x: 0, y: 7, w: 12, h: 5 },
];