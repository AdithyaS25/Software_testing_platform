import { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { getDashboardData } from "../api/dashboard.api";
import type { DashboardResponse } from "../types/dashboard.types";
import { WidgetRenderer } from "../components/WidgetRegistry";
import { defaultWidgets } from "../config/defaultWidgets";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Card } from "../../../shared/components/ui/Card";

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [layout, setLayout] = useState<Layout[]>([]);
  const { user } = useAuth();

  // 🔥 Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    };

    fetchDashboard();
  }, []);

  // 🔥 Generate layout dynamically based on role
  useEffect(() => {
    if (!user) return;

    const visibleWidgets = defaultWidgets.filter((w) =>
      w.allowedRoles.includes(user.role)
    );

    const savedLayout = localStorage.getItem(
      `dashboard-layout-${user.id}`
    );

    if (savedLayout) {
      const parsedLayout: Layout[] = JSON.parse(savedLayout);

      const filteredLayout = parsedLayout.filter((item) =>
        visibleWidgets.some((w) => w.id === item.i)
      );

      setLayout(filteredLayout);
      return;
    }

    const metricIds = [
  "runs",
  "executions",
  "passRate",
  "bugs",
  "openBugs",
  "criticalBugs",
];

const metricWidgets = visibleWidgets.filter((w) =>
  metricIds.includes(w.id)
);

const chartWidgets = visibleWidgets.filter(
  (w) => !metricIds.includes(w.id)
);

const newLayout: Layout[] = [];

// 🔥 First row (4 cards)
metricWidgets.slice(0, 4).forEach((widget, index) => {
  newLayout.push({
    i: widget.id,
    x: index * 3,
    y: 0,
    w: 3,
    h: 2,
  });
});

// 🔥 Second row (next 2 cards)
metricWidgets.slice(4, 6).forEach((widget, index) => {
  newLayout.push({
    i: widget.id,
    x: index * 3,
    y: 2,
    w: 3,
    h: 2,
  });
});

// 🔥 Charts full width below
chartWidgets.forEach((widget, index) => {
  newLayout.push({
    i: widget.id,
    x: 0,
    y: 4 + index * 5,
    w: 12,
    h: 5,
  });
});

setLayout(newLayout);
  }, [user]);

  if (!data || !user) return <div>Loading...</div>;

  const visibleWidgets = defaultWidgets.filter((w) =>
    w.allowedRoles.includes(user.role)
  );

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Dashboard
      </h1>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={80}
        width={1200}
        preventCollision={false}
        isBounded={true}
        onLayoutChange={(currentLayout: Layout[]) => {
          setLayout(currentLayout);

          localStorage.setItem(
            `dashboard-layout-${user.id}`,
            JSON.stringify(currentLayout)
          );
        }}
      >
        {visibleWidgets.map((widget) => (
          <div key={widget.id} className="h-full">
            <Card className="h-full flex flex-col justify-between">
              <WidgetRenderer widget={widget} data={data} />
            </Card>
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
