import { useState } from "react";
import styled from "styled-components";
import { HiOutlineEnvelope, HiOutlineExclamationCircle } from "react-icons/hi2";
import { useMutation } from "@tanstack/react-query";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import Column from "../../ui/Column";
import { resendEmailVerification } from "../../services/authApi";
import { useToast } from "../../contexts/ToastContext";

const VerificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
  text-align: center;
  padding: var(--spacing-6);
  background-color: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--border-radius-lg);
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  background-color: var(--color-warning-100);
  border-radius: 50%;
  color: var(--color-warning-600);

  svg {
    width: 3rem;
    height: 3rem;
  }
`;

const EmailDisplay = styled.div`
  background-color: var(--color-grey-100);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  font-family: "Courier New", monospace;
  color: var(--color-grey-700);
  word-break: break-all;
`;

function EmailVerificationRequired({ userEmail, onBackToLogin }) {
  //   console.log("Email Verification Required for:", userEmail);
  const [emailSent, setEmailSent] = useState(false);
  const { showToast } = useToast();

  const { mutate: resendVerification, isPending: isResending } = useMutation({
    mutationFn: () => resendEmailVerification(userEmail),
    onSuccess: () => {
      setEmailSent(true);
      showToast({
        type: "success",
        title: "Verification Email Sent",
        message: "Please check your email inbox and spam folder.",
      });
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Failed to Send Email",
        message:
          error.message ||
          "Unable to send verification email. Please try again.",
      });
    },
  });

  const handleResendEmail = () => {
    resendVerification();
  };

  return (
    <VerificationContainer>
      <IconContainer>
        <HiOutlineEnvelope />
      </IconContainer>

      <Column gap={4} align="center">
        <div>
          <Heading as="h2" size="h3" color="warning">
            Email Verification Required
          </Heading>
          <Text
            size="lg"
            color="muted"
            style={{ marginTop: "var(--spacing-2)" }}
          >
            Please verify your email address to continue
          </Text>
        </div>

        <Column gap={3} align="center">
          <Text size="md" color="muted">
            We've sent a verification link to:
          </Text>

          {userEmail && (
            <EmailDisplay>
              <Text size="sm" weight="medium">
                {userEmail}
              </Text>
            </EmailDisplay>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
              backgroundColor: "var(--color-info-50)",
              padding: "var(--spacing-3)",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--color-info-200)",
            }}
          >
            <HiOutlineExclamationCircle
              style={{
                color: "var(--color-info-600)",
                flexShrink: 0,
              }}
            />
            <Text size="sm" color="info">
              Please check your email inbox and spam folder for the verification
              link.
            </Text>
          </div>
        </Column>

        <Column gap={3} align="stretch" style={{ width: "100%" }}>
          {emailSent && (
            <div
              style={{
                background: "var(--color-success-50)",
                border: "1px solid var(--color-success-200)",
                borderRadius: "var(--border-radius-md)",
                padding: "var(--spacing-3)",
              }}
            >
              <Text size="sm" color="success" weight="medium">
                ✅ New verification email sent! Please check your inbox.
              </Text>
            </div>
          )}

          <Button
            variant="primary"
            size="medium"
            onClick={handleResendEmail}
            loading={isResending}
            disabled={isResending}
            fullWidth
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </Button>

          <Button
            variant="ghost"
            size="medium"
            onClick={onBackToLogin}
            fullWidth
          >
            Back to Login
          </Button>

          <Text size="xs" color="muted">
            If you continue to have issues, please contact support.
          </Text>
        </Column>
      </Column>
    </VerificationContainer>
  );
}

export default EmailVerificationRequired;
