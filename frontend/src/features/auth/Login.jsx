import { useState } from "react";
import { Link } from "react-router-dom";
import { HiEnvelope } from "react-icons/hi2";
import styled from "styled-components";

import Button from "../../ui/Button";
import Input from "../../ui/Input";
import PasswordInput from "../../ui/PasswordInput";
import FormField from "../../ui/FormField";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import Column from "../../ui/Column";
import EnhancedCheckbox from "../../ui/EnhancedCheckbox";
import AccountLocked from "./AccountLocked";
import EmailVerificationRequired from "./EmailVerificationRequired";
import { useLogin } from "./useLogin";
import { useAuth } from "../../contexts/AuthContext";

const FormContainer = styled.form`
  width: 100%;
  max-width: 42rem;
`;

const ErrorMessage = styled.div`
  color: var(--color-error-600);
  background-color: var(--color-error-50);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-error-200);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 480px) {
    padding: var(--spacing-2);
    font-size: var(--font-size-sm);
  }
`;

const StyledLink = styled(Link)`
  color: var(--color-brand-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-fast) var(--ease-in-out);

  &:hover {
    color: var(--color-brand-700);
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
    border-radius: var(--border-radius-sm);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
`;

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [backToLogin, setBackToLogin] = useState(false);

  const { login, isPending, error: errorMessage, isError } = useLogin();
  const { error } = useAuth();

  // Handle different error states
  const errorType = error?.type || "UNKNOWN_ERROR";
  const isAccountLocked = errorType === "ACCOUNT_LOCKED";
  const isEmailNotVerified = errorType === "EMAIL_NOT_VERIFIED";
  const isInvalidCredentials = errorType === "INVALID_CREDENTIALS";

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

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    login({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (backToLogin) {
      setBackToLogin(false);
    }
  };

  const handleRetryLogin = () => {
    setFormData({
      email: "",
      password: "",
      rememberMe: false,
    });
    setValidationErrors({});
  };

  const handleBackToLogin = () => {
    setValidationErrors({});
    setBackToLogin(true);
  };

  // Show account locked component
  if (isAccountLocked && !backToLogin) {
    return (
      <AccountLocked lockUntil={error.lockUntil} onRetry={handleRetryLogin} />
    );
  }

  // Show email verification required component
  if (isEmailNotVerified && !backToLogin) {
    return (
      <EmailVerificationRequired
        userEmail={error.userEmail}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Show login form (default state)
  return (
    <Column gap={6} align="center">
      <Column gap={2} align="center">
        <Heading as="h1" size="h1" align="center">
          Welcome Back
        </Heading>
        <Text size="lg" color="muted" align="center">
          Sign in to your account to continue
        </Text>
      </Column>

      <FormContainer onSubmit={handleSubmit}>
        <Column gap={4}>
          {/* Show error message for invalid credentials and other errors */}
          {isError &&
            (isInvalidCredentials || errorType === "UNKNOWN_ERROR") && (
              <ErrorMessage>
                <Text size="sm">{error.message}</Text>
              </ErrorMessage>
            )}

          <FormField
            label="Email Address"
            error={validationErrors.email}
            required
          >
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email"
              variant={validationErrors.email ? "error" : "default"}
              leftIcon={<HiEnvelope />}
              disabled={isPending}
              autoComplete="email"
            />
          </FormField>

          <FormField
            label="Password"
            error={validationErrors.password}
            required
          >
            <PasswordInput
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter your password"
              variant={validationErrors.password ? "error" : "default"}
              disabled={isPending}
              autoComplete="current-password"
            />
          </FormField>

          <FormActions>
            <EnhancedCheckbox
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(checked) => handleInputChange("rememberMe", checked)}
              label="Remember me"
              disabled={isPending}
            />

            <StyledLink to="/forgot-password">Forgot password?</StyledLink>
          </FormActions>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isPending}
            disabled={isPending}
          >
            {isPending ? "Signing In..." : "Sign In"}
          </Button>

          <Text size="sm" color="muted" align="center">
            Don't have an account?{" "}
            <StyledLink to="/register">Sign up here</StyledLink>
          </Text>
        </Column>
      </FormContainer>
    </Column>
  );
}

export default LoginForm;
