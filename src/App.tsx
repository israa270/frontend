import { Navigate, Route, Routes } from "react-router-dom";
import { RecoveryHashRedirect } from "./components/RecoveryHashRedirect";
import { RequireAuth } from "./components/RequireAuth";
import { AppShell } from "./components/layout/AppShell";
import { DashboardHomePage } from "./pages/dashboard/DashboardHomePage";
import { ShellPlaceholderPage } from "./pages/dashboard/ShellPlaceholderPage";
import { AddProjectPage } from "./pages/project/AddProjectPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SignUpPage } from "./pages/SignUpPage";

export default function App() {
  return (
    <>
      <RecoveryHashRedirect />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="dashboard">
            <Route index element={<DashboardHomePage />} />
            <Route
              path="epics"
              element={<ShellPlaceholderPage title="Project Epics" />}
            />
            <Route
              path="tasks"
              element={<ShellPlaceholderPage title="Project Tasks" />}
            />
            <Route
              path="members"
              element={<ShellPlaceholderPage title="Project Members" />}
            />
            <Route
              path="details"
              element={<ShellPlaceholderPage title="Project Details" />}
            />
          </Route>
          <Route path="project">
            <Route path="add" element={<AddProjectPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
