import { useState } from "react";
import styled from "styled-components";
import { HiOutlineExclamationTriangle, HiOutlineClock } from "react-icons/hi2";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import Column from "../../ui/Column";

const LockedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
  text-align: center;
  padding: var(--spacing-6);
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-lg);
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  background-color: var(--color-error-100);
  border-radius: 50%;
  color: var(--color-error-600);

  svg {
    width: 3rem;
    height: 3rem;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const CountdownText = styled(Text)`
  font-family: "Courier New", monospace;
  font-weight: var(--font-weight-bold);
  color: var(--color-error-700);
  background-color: var(--color-error-100);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-md);
  display: inline-block;
`;

function AccountLocked({ lockUntil, onRetry }) {
  const [timeRemaining, setTimeRemaining] = useState("");

  // Calculate time remaining
  const calculateTimeRemaining = () => {
    if (!lockUntil) return "";

    const now = new Date();
    const lockTime = new Date(lockUntil);
    const diff = lockTime - now;

    if (diff <= 0) {
      return "Account unlocked";
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Update countdown every second
  useState(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // If unlocked, stop countdown
      if (remaining === "Account unlocked") {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockUntil]);

  const isUnlocked = timeRemaining === "Account unlocked" || !lockUntil;

  return (
    <LockedContainer>
      <IconContainer>
        <HiOutlineExclamationTriangle />
      </IconContainer>

      <Column gap={4} align="center">
        <div>
          <Heading as="h2" size="h3" color="error">
            Account Temporarily Locked
          </Heading>
          <Text
            size="lg"
            color="muted"
            style={{ marginTop: "var(--spacing-2)" }}
          >
            Too many failed login attempts
          </Text>
        </div>

        <InfoSection>
          <Text size="md" color="muted">
            Your account has been temporarily locked due to multiple failed
            login attempts. This is a security measure to protect your account.
          </Text>

          {!isUnlocked ? (
            <div>
              <Text
                size="sm"
                color="muted"
                style={{ marginBottom: "var(--spacing-2)" }}
              >
                Time remaining:
              </Text>
              <CountdownText size="lg">
                <HiOutlineClock
                  style={{
                    display: "inline",
                    marginRight: "var(--spacing-1)",
                    verticalAlign: "middle",
                  }}
                />
                {timeRemaining}
              </CountdownText>
            </div>
          ) : (
            <Text size="md" weight="medium" color="success">
              ✅ Your account is now unlocked. You can try logging in again.
            </Text>
          )}
        </InfoSection>

        <Column gap={2} align="stretch" style={{ width: "100%" }}>
          <Button
            variant="primary"
            size="medium"
            onClick={onRetry}
            disabled={!isUnlocked}
            fullWidth
          >
            {isUnlocked ? "Try Login Again" : "Please Wait..."}
          </Button>

          <Text size="xs" color="muted">
            If you continue to have issues, please contact support.
          </Text>
        </Column>
      </Column>
    </LockedContainer>
  );
}

export default AccountLocked;
