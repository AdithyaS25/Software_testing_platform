import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => (
  <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
    <Sidebar />
    <main style={{
      marginLeft: "var(--sidebar-width)",
      flex: 1,
      minHeight: "100vh",
      padding: "32px 36px",
      overflowX: "hidden",
      position: "relative",
    }}>
      {/* Subtle inner glow at top */}
      <div style={{
        position: "fixed",
        top: 0,
        left: "var(--sidebar-width)",
        right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(120,87,255,0.2), transparent)",
        pointerEvents: "none",
        zIndex: 10,
      }} />
      <Outlet />
    </main>
  </div>
);
