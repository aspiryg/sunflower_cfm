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
import Feedback from "./pages/Feedback";
import AddFeedback from "./pages/AddFeedback";
import FeedbackDetails from "./pages/FeedbackDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import EmailVerificationSuccess from "./pages/EmailVerificationSuccess";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import PageNotFound from "./pages/PageNotFound";

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
                  <Route path="/users" element={<Users />} />
                  <Route path="/my-profile" element={<MyProfile />} />
                </Route>
                {/* Catch all route */}

                <Route
                  path="/feedback"
                  element={
                    <ProtectedRoute requireAuth={true} requiredRole={"user"}>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Feedback />} />
                  <Route
                    path="add"
                    element={
                      <ProtectedRoute>
                        <AddFeedback />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="edit/:id"
                    element={
                      <ProtectedRoute>
                        <AddFeedback />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="view/:feedbackId"
                    element={
                      <ProtectedRoute>
                        <FeedbackDetails />
                      </ProtectedRoute>
                    }
                  />
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
