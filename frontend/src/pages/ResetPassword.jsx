import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";

import Container from "../ui/Container";
import Button from "../ui/Button";
import PasswordInput from "../ui/PasswordInput";
import FormField from "../ui/FormField";
import Text from "../ui/Text";
import Heading from "../ui/Heading";
import Column from "../ui/Column";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useResetPassword } from "../features/auth/useResetPassword";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--color-brand-50) 0%,
    var(--color-brand-100) 50%,
    var(--color-brand-200) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);

  @media (max-width: 640px) {
    padding: var(--spacing-3);
  }
`;

const ContentCard = styled.div`
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-8);
  width: 100%;
  max-width: 48rem;
  border: 1px solid var(--color-grey-100);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => {
      if (props.$variant === "success") {
        return "linear-gradient(90deg, var(--color-success-500) 0%, var(--color-success-600) 100%)";
      } else if (props.$variant === "error") {
        return "linear-gradient(90deg, var(--color-error-500) 0%, var(--color-error-600) 100%)";
      }
      return "linear-gradient(90deg, var(--color-brand-500) 0%, var(--color-brand-600) 100%)";
    }};
    border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  }

  @media (max-width: 640px) {
    padding: var(--spacing-6);
    border-radius: var(--border-radius-lg);

    &::before {
      border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    }
  }

  @media (max-width: 480px) {
    padding: var(--spacing-4);
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8rem;
  height: 8rem;
  margin: 0 auto var(--spacing-4);
  border-radius: 50%;

  ${(props) => {
    if (props.$variant === "success") {
      return `
        background-color: var(--color-success-100);
        color: var(--color-success-600);
      `;
    } else if (props.$variant === "error") {
      return `
        background-color: var(--color-error-100);
        color: var(--color-error-600);
      `;
    }
    return `
      background-color: var(--color-brand-100);
      color: var(--color-brand-600);
    `;
  }}

  svg {
    width: 4rem;
    height: 4rem;
  }

  @media (max-width: 480px) {
    width: 6rem;
    height: 6rem;

    svg {
      width: 3rem;
      height: 3rem;
    }
  }
`;

const FormContainer = styled.form`
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
`;

const ActionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-top: var(--spacing-6);

  @media (max-width: 480px) {
    gap: var(--spacing-2);
    margin-top: var(--spacing-4);
  }
`;

const PasswordRequirements = styled.div`
  background-color: var(--color-info-50);
  border: 1px solid var(--color-info-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-4);
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: ${(props) =>
    props.$met ? "var(--color-success-600)" : "var(--color-grey-600)"};
  font-size: var(--font-size-sm);

  &::before {
    content: ${(props) => (props.$met ? '"✓"' : '"○"')};
    font-weight: var(--font-weight-bold);
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-error-600);
  background-color: var(--color-error-50);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-error-200);
  margin-bottom: var(--spacing-4);
`;

const AppBranding = styled.div`
  position: absolute;
  bottom: var(--spacing-6);
  left: 50%;
  transform: translateX(-50%);
  text-align: center;

  @media (max-width: 640px) {
    bottom: var(--spacing-4);
  }
`;

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [countdown, setCountdown] = useState(10);

  const { resetPassword, isLoading, isSuccess, isError, error } =
    useResetPassword();

  // Validate token exists
  useEffect(() => {
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  // Auto-redirect countdown for successful reset
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      navigate("/login");
    }
  }, [isSuccess, countdown, navigate]);

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    return requirements;
  };

  const validateForm = () => {
    const errors = {};
    const passwordRequirements = validatePassword(formData.newPassword);

    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (!Object.values(passwordRequirements).every(Boolean)) {
      errors.newPassword = "Password does not meet all requirements";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    resetPassword({
      token,
      newPassword: formData.newPassword,
    });
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleTryAgain = () => {
    navigate("/forgot-password");
  };

  const getErrorMessage = () => {
    if (error?.error === "INVALID_TOKEN") {
      return "The password reset link is invalid or has expired.";
    } else if (error?.error === "SERVER_ERROR") {
      return "We encountered a technical issue while resetting your password.";
    }
    return error?.message || "We couldn't reset your password at this time.";
  };

  const getErrorSubMessage = () => {
    if (error?.error === "INVALID_TOKEN") {
      return "Please request a new password reset email.";
    } else if (error?.error === "SERVER_ERROR") {
      return "Please try again later or contact support if the problem persists.";
    }
    return "Please try again or contact our support team for assistance.";
  };

  const passwordRequirements = validatePassword(formData.newPassword);

  // Show loading state (if needed for token validation)
  if (isLoading && !formData.newPassword) {
    return (
      <PageContainer>
        <Container size="sm">
          <ContentCard>
            <LoadingContainer>
              <LoadingSpinner size="large" />
              <Column gap={2} align="center">
                <Heading as="h1" size="h2">
                  Preparing Password Reset
                </Heading>
                <Text size="lg" color="muted">
                  Please wait while we verify your reset token...
                </Text>
              </Column>
            </LoadingContainer>
          </ContentCard>
        </Container>

        <AppBranding>
          <Text size="xs" color="muted">
            Community Feedback Management System
          </Text>
        </AppBranding>
      </PageContainer>
    );
  }

  // Show error state
  if (isError) {
    return (
      <PageContainer>
        <Container size="sm">
          <ContentCard $variant="error">
            <Column gap={4} align="center">
              <IconContainer $variant="error">
                <HiOutlineXCircle />
              </IconContainer>

              <Column gap={2} align="center">
                <Heading as="h1" size="h2" color="error">
                  Password Reset Failed
                </Heading>
                <Text size="lg" color="muted">
                  {getErrorMessage()}
                </Text>
              </Column>

              <Column gap={2} align="center">
                <Text size="sm" color="muted">
                  {getErrorSubMessage()}
                </Text>
              </Column>

              <ActionSection>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleTryAgain}
                  fullWidth
                >
                  Request New Reset Link
                </Button>

                <Button
                  variant="ghost"
                  size="medium"
                  onClick={handleGoToLogin}
                  fullWidth
                >
                  Back to Login
                </Button>

                <Text size="xs" color="muted">
                  Need help? Contact our support team.
                </Text>
              </ActionSection>
            </Column>
          </ContentCard>
        </Container>

        <AppBranding>
          <Text size="xs" color="muted">
            Community Feedback Management System
          </Text>
        </AppBranding>
      </PageContainer>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <PageContainer>
        <Container size="sm">
          <ContentCard $variant="success">
            <Column gap={4} align="center">
              <IconContainer $variant="success">
                <HiOutlineCheckCircle />
              </IconContainer>

              <Column gap={2} align="center">
                <Heading as="h1" size="h2" color="success">
                  Password Reset Successfully! 🎉
                </Heading>
                <Text size="lg" color="muted">
                  Your password has been updated successfully. You can now sign
                  in with your new password.
                </Text>
              </Column>

              <Column gap={2} align="center">
                <Text size="sm" color="muted">
                  Automatically redirecting to login page in{" "}
                  <Text as="span" weight="semibold" color="brand">
                    {countdown}
                  </Text>{" "}
                  seconds...
                </Text>
              </Column>

              <ActionSection>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleGoToLogin}
                  fullWidth
                >
                  Continue to Login
                </Button>

                <div
                  style={{
                    background: "var(--color-success-50)",
                    border: "1px solid var(--color-success-200)",
                    borderRadius: "var(--border-radius-md)",
                    padding: "var(--spacing-3)",
                  }}
                >
                  <Text size="sm" color="success" weight="medium">
                    ✅ You have been logged out of all devices for security.
                  </Text>
                </div>

                <Text size="xs" color="muted">
                  Your password has been updated and is now secure.
                </Text>
              </ActionSection>
            </Column>
          </ContentCard>
        </Container>

        <AppBranding>
          <Text size="xs" color="muted">
            Community Feedback Management System
          </Text>
        </AppBranding>
      </PageContainer>
    );
  }

  // Show reset password form (default state)
  return (
    <PageContainer>
      <Container size="sm">
        <ContentCard>
          <Column gap={6} align="center">
            <Column gap={2} align="center">
              <IconContainer>
                <HiOutlineLockClosed />
              </IconContainer>

              <Heading as="h1" size="h2" align="center">
                Reset Your Password
              </Heading>
              <Text size="lg" color="muted" align="center">
                Enter your new password below
              </Text>
            </Column>

            <FormContainer onSubmit={handleSubmit}>
              <Column gap={4}>
                {isError && (
                  <ErrorMessage>
                    <Text size="sm">{getErrorMessage()}</Text>
                  </ErrorMessage>
                )}

                <PasswordRequirements>
                  <Text
                    size="sm"
                    weight="medium"
                    color="info"
                    style={{ marginBottom: "var(--spacing-2)" }}
                  >
                    Password Requirements:
                  </Text>
                  <Column gap={1}>
                    <RequirementItem $met={passwordRequirements.minLength}>
                      At least 8 characters long
                    </RequirementItem>
                    <RequirementItem $met={passwordRequirements.hasLowercase}>
                      Contains lowercase letter (a-z)
                    </RequirementItem>
                    <RequirementItem $met={passwordRequirements.hasUppercase}>
                      Contains uppercase letter (A-Z)
                    </RequirementItem>
                    <RequirementItem $met={passwordRequirements.hasNumber}>
                      Contains number (0-9)
                    </RequirementItem>
                    <RequirementItem $met={passwordRequirements.hasSpecialChar}>
                      Contains special character (!@#$%^&*)
                    </RequirementItem>
                  </Column>
                </PasswordRequirements>

                <FormField
                  label="New Password"
                  error={validationErrors.newPassword}
                  required
                >
                  <PasswordInput
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder="Enter your new password"
                    variant={validationErrors.newPassword ? "error" : "default"}
                    disabled={isLoading}
                    autoComplete="new-password"
                    autoFocus
                  />
                </FormField>

                <FormField
                  label="Confirm New Password"
                  error={validationErrors.confirmPassword}
                  required
                >
                  <PasswordInput
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm your new password"
                    variant={
                      validationErrors.confirmPassword ? "error" : "default"
                    }
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isLoading}
                  disabled={
                    isLoading ||
                    !formData.newPassword ||
                    !formData.confirmPassword
                  }
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>

                <Text size="sm" color="muted" align="center">
                  Remember your password?{" "}
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleGoToLogin}
                    style={{
                      padding: 0,
                      height: "auto",
                      textDecoration: "underline",
                    }}
                  >
                    Sign in here
                  </Button>
                </Text>
              </Column>
            </FormContainer>
          </Column>
        </ContentCard>
      </Container>

      <AppBranding>
        <Text size="xs" color="muted">
          Community Feedback Management System
        </Text>
      </AppBranding>
    </PageContainer>
  );
}

export default ResetPassword;
