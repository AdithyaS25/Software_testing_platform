import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "../../layouts/AppLayout";
import { DashboardPage } from "../../features/dashboard/pages/DashboardPage";
import { ExecuteTestCasePage } from "../../features/execution/pages/ExecuteTestCasePage";
import { LoginPage } from "../../features/auth/pages/LoginPage";


export const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/test-runs/:testRunId/test-cases/:id/execute"
          element={<ExecuteTestCasePage />}
        />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};