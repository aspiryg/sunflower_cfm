import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { HiOutlineEnvelope, HiOutlineArrowLeft } from "react-icons/hi2";

import Container from "../ui/Container";
import Button from "../ui/Button";
import Input from "../ui/Input";
import FormField from "../ui/FormField";
import Text from "../ui/Text";
import Heading from "../ui/Heading";
import Column from "../ui/Column";
import { useForgotPassword } from "../features/auth/useForgotPassword";

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

  @media (max-width: 640px) {
    padding: var(--spacing-6);
    border-radius: var(--border-radius-lg);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-4);
  }
`;

const FormContainer = styled.form`
  width: 100%;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-brand-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: color var(--duration-fast) var(--ease-in-out);
  margin-bottom: var(--spacing-4);

  &:hover {
    color: var(--color-brand-700);
  }

  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
    border-radius: var(--border-radius-sm);
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SuccessMessage = styled.div`
  color: var(--color-success-600);
  background-color: var(--color-success-50);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-success-200);
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: var(--color-error-600);
  background-color: var(--color-error-50);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-error-200);
  margin-bottom: var(--spacing-4);
`;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  const { forgotPassword, isPending, isSuccess, error, isError } =
    useForgotPassword();

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }

    setValidationError("");
    forgotPassword(email.trim());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };

  if (isSuccess) {
    return (
      <PageContainer>
        <Container size="sm">
          <ContentCard>
            <BackLink to="/login">
              <HiOutlineArrowLeft />
              Back to Login
            </BackLink>

            <Column gap={6} align="center">
              <Column gap={2} align="center">
                <Heading as="h1" size="h2" align="center">
                  Check Your Email
                </Heading>
                <Text size="lg" color="muted" align="center">
                  Password reset instructions sent
                </Text>
              </Column>

              <SuccessMessage>
                <Column gap={2}>
                  <Text size="sm" weight="medium">
                    ✅ We've sent password reset instructions to:
                  </Text>
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{ fontFamily: "monospace" }}
                  >
                    {email}
                  </Text>
                  <Text size="sm">
                    Please check your email inbox and spam folder. The link will
                    expire in 1 hour.
                  </Text>
                </Column>
              </SuccessMessage>

              <Column gap={3} align="stretch" style={{ width: "100%" }}>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={() => setEmail("")}
                  fullWidth
                >
                  Send Another Email
                </Button>

                <Text size="xs" color="muted" align="center">
                  Didn't receive the email? Check your spam folder or try again.
                </Text>
              </Column>
            </Column>
          </ContentCard>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container size="sm">
        <ContentCard>
          <BackLink to="/login">
            <HiOutlineArrowLeft />
            Back to Login
          </BackLink>

          <Column gap={6} align="center">
            <Column gap={2} align="center">
              <Heading as="h1" size="h2" align="center">
                Reset Your Password
              </Heading>
              <Text size="lg" color="muted" align="center">
                Enter your email address and we'll send you a link to reset your
                password
              </Text>
            </Column>

            <FormContainer onSubmit={handleSubmit}>
              <Column gap={4}>
                {isError && (
                  <ErrorMessage>
                    <Text size="sm">{error}</Text>
                  </ErrorMessage>
                )}

                <FormField
                  label="Email Address"
                  error={validationError}
                  required
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    variant={validationError ? "error" : "default"}
                    leftIcon={<HiOutlineEnvelope />}
                    disabled={isPending}
                    autoComplete="email"
                    autoFocus
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isPending}
                  disabled={isPending || !email.trim()}
                >
                  {isPending ? "Sending..." : "Send Reset Link"}
                </Button>

                <Text size="sm" color="muted" align="center">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: "var(--color-brand-600)",
                      textDecoration: "none",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    Sign in here
                  </Link>
                </Text>
              </Column>
            </FormContainer>
          </Column>
        </ContentCard>
      </Container>
    </PageContainer>
  );
}

export default ForgotPassword;
