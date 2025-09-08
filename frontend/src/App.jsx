import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

//
import GlobalStyles from "./styles/GlobalStyles";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ToastProvider from "./contexts/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout
import AppLayout from "./ui/AppLayout";

// import pages
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import MyProfile from "./pages/MyProfile";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import EmailVerificationSuccess from "./pages/EmailVerificationSuccess";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import PageNotFound from "./pages/PageNotFound";
// Import sub pages
import AssignedToMe from "./features/cases/assignedToMe/AssignedToMe";
import CreatedByMe from "./features/cases/createdByMe/CreatedByMe";

// Import CasePages
import Case from "./pages/Case";
import AddCase from "./pages/AddCase";
import CaseDetails from "./pages/CaseDetails";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <GlobalStyles />
            <BrowserRouter>
              <Routes>
                {/* Public routes - redirect to dashboard if authenticated */}
                <Route
                  path="/login"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  }
                />
                {/* Add register route */}
                <Route
                  path="/register"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Register />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <ForgotPassword />
                    </ProtectedRoute>
                  }
                />
                {/* Password reset page */}
                <Route
                  path="/reset-password/:token"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <ResetPassword />
                    </ProtectedRoute>
                  }
                />
                {/* Client-side email verification */}
                <Route path="/verify-email/:token" element={<VerifyEmail />} />

                {/* Keep the old success page for fallback */}
                <Route
                  path="/email-verification-success"
                  element={<EmailVerificationSuccess />}
                />
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate replace to="dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/my-profile" element={<MyProfile />} />
                </Route>
                {/* Catch all route */}

                {
                  <Route
                    path="/cases"
                    element={
                      <ProtectedRoute requireAuth={true} requiredRole={"user"}>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Case />} />
                    <Route
                      path="add"
                      element={
                        <ProtectedRoute>
                          <AddCase />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <ProtectedRoute>
                          <AddCase />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="view/:caseId"
                      element={
                        <ProtectedRoute>
                          <CaseDetails />
                        </ProtectedRoute>
                      }
                    />
                    {/* Sub pages */}
                    <Route path="assigned-to-me" element={<AssignedToMe />} />
                    <Route path="created-by-me" element={<CreatedByMe />} />
                  </Route>
                }

                {/*Users route */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requiredRole={"admin"}>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Users />} />
                  {/* <Route path="add" element={<AddUser />} />
                  <Route path="edit/:id" element={<EditUser />} />
                  <Route path="view/:id" element={<ViewUser />} /> */}
                </Route>
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster
              position="top-center"
              gutter={12}
              containerStyle={{ margin: "8px", zIndex: 99999 }}
              toastOptions={{
                success: {
                  duration: 3000,
                },
                error: {
                  duration: 5000,
                },
                style: {
                  fontSize: "16px",
                  maxWidth: "500px",
                  padding: "16px 24px",
                  backgroundColor: "var(--color-grey-0)",
                  color: "var(--color-grey-700)",
                  border: "1px solid var(--color-grey-200)",
                  borderRadius: "var(--border-radius-lg)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 99999,
                },
              }}
            />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
