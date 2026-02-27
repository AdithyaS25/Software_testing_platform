import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { AppLayout } from "../../layouts/AppLayout";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { RegisterPage } from "../../features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "../../features/auth/pages/ForgotPasswordPage";
import { DashboardPage } from "../../features/dashboard/pages/DashboardPage";
import { TestCasesPage } from "../../features/testcases/pages/TestCasesPage";
import { TestCaseDetailPage } from "../../features/testcases/pages/TestCaseDetailPage";
import { CreateTestCasePage } from "../../features/testcases/pages/CreateTestCasePage";
import { BugsPage } from "../../features/bugs/pages/BugsPage";
import { BugDetailPage } from "../../features/bugs/pages/BugDetailPage";
import { ExecutionPage } from "../../features/execution/pages/ExecutionPage";
import { TestSuitesPage } from "../../features/testsuites/pages/TestSuitesPage";
import { TestRunsPage } from "../../features/testruns/pages/TestRunsPage";
import { ReportsPage } from "../../features/reports/pages/ReportsPage";

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="tt-loading"><div className="tt-spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="test-cases" element={<TestCasesPage />} />
          <Route path="test-cases/new" element={<ProtectedRoute roles={["TESTER", "ADMIN"]}><CreateTestCasePage /></ProtectedRoute>} />
          <Route path="test-cases/:id" element={<TestCaseDetailPage />} />
          <Route path="bugs" element={<BugsPage />} />
          <Route path="bugs/:id" element={<BugDetailPage />} />
          <Route path="execution/:testCaseId" element={<ProtectedRoute roles={["TESTER", "ADMIN"]}><ExecutionPage /></ProtectedRoute>} />
          <Route path="test-suites" element={<TestSuitesPage />} />
          <Route path="test-runs" element={<TestRunsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};
