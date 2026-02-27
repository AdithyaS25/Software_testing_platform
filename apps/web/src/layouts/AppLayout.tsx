import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => (
  <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
    <Sidebar />
    <main style={{
      marginLeft: "var(--sidebar-width)",
      flex: 1,
      minHeight: "100vh",
      padding: "28px 32px",
      overflowX: "hidden",
    }}>
      <Outlet />
    </main>
  </div>
);
