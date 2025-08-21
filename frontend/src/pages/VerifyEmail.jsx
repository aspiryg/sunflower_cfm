import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowRight,
} from "react-icons/hi2";

import Container from "../ui/Container";
import Text from "../ui/Text";
import Heading from "../ui/Heading";
import Button from "../ui/Button";
import Column from "../ui/Column";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useEmailVerification } from "../features/auth/useEmailVerification";

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
  text-align: center;
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

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  const { verifyEmail, isLoading, isSuccess, isError, error } =
    useEmailVerification();

  // Auto-verify when component mounts
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  // Auto-redirect countdown for successful verification
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

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleTryAgain = () => {
    if (token) {
      verifyEmail(token);
    }
  };

  const getErrorMessage = () => {
    if (error?.error === "INVALID_TOKEN") {
      return "The verification link is invalid or has expired.";
    } else if (error?.error === "SERVER_ERROR") {
      return "We encountered a technical issue while verifying your email.";
    }
    return (
      error?.message || "We couldn't verify your email address at this time."
    );
  };

  const getErrorSubMessage = () => {
    if (error?.error === "INVALID_TOKEN") {
      return "Please request a new verification email from the login page.";
    } else if (error?.error === "SERVER_ERROR") {
      return "Please try again later or contact support if the problem persists.";
    }
    return "Please try again or contact our support team for assistance.";
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageContainer>
        <Container size="sm">
          <ContentCard>
            <LoadingContainer>
              <LoadingSpinner size="large" />
              <Column gap={2} align="center">
                <Heading as="h1" size="h2">
                  Verifying Your Email
                </Heading>
                <Text size="lg" color="muted">
                  Please wait while we verify your email address...
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
                  Email Verification Failed
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
                {error?.error === "SERVER_ERROR" && (
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={handleTryAgain}
                    fullWidth
                  >
                    Try Again
                  </Button>
                )}

                <Button
                  variant="primary"
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
                  Email Verified Successfully! 🎉
                </Heading>
                <Text size="lg" color="muted">
                  Your email address has been verified. You can now sign in to
                  your account and start using all features.
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
                  <HiOutlineArrowRight />
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
                    ✅ Welcome to Community Feedback Management System!
                  </Text>
                </div>

                <Text size="xs" color="muted">
                  Your account is now fully activated and ready to use.
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

  // Fallback state (shouldn't normally reach here)
  return (
    <PageContainer>
      <Container size="sm">
        <ContentCard>
          <Column gap={4} align="center">
            <Heading as="h1" size="h2">
              Invalid Verification Link
            </Heading>
            <Text size="lg" color="muted">
              The verification link appears to be invalid.
            </Text>
            <Button variant="primary" onClick={handleGoToLogin} fullWidth>
              Go to Login
            </Button>
          </Column>
        </ContentCard>
      </Container>
    </PageContainer>
  );
}

export default VerifyEmail;
