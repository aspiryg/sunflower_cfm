import styled from "styled-components";
import PropTypes from "prop-types";
import Card from "../../ui/Card";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import StatusBadge from "../../ui/StatusBadge";
import { formatDate } from "../../utils/dateUtils";

const SectionContainer = styled.div`
  padding: var(--spacing-6);

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const SectionCard = styled(Card)`
  padding: var(--spacing-5);
  margin-bottom: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
`;

const SectionHeader = styled.div`
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const FieldLabel = styled(Text)`
  color: var(--color-grey-500);
  font-weight: var(--font-weight-medium);
`;

const FieldValue = styled(Text)`
  color: var(--color-grey-800);
`;

const EmptyValue = styled(Text)`
  color: var(--color-grey-400);
  font-style: italic;
`;

const SecurityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const SecurityInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

function SecuritySection({ user }) {
  const renderField = (label, value) => (
    <Field>
      <FieldLabel size="sm">{label}</FieldLabel>
      {value ? (
        <FieldValue size="sm" weight="medium">
          {value}
        </FieldValue>
      ) : (
        <EmptyValue size="sm">Not available</EmptyValue>
      )}
    </Field>
  );

  return (
    <SectionContainer>
      {/* Account Security */}
      <SectionCard>
        <SectionHeader>
          <Heading as="h3" size="h4">
            Account Security
          </Heading>
          <Text size="sm" color="muted">
            Your account security status and settings
          </Text>
        </SectionHeader>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-4)",
          }}
        >
          <SecurityItem>
            <SecurityInfo>
              <Text size="sm" weight="medium">
                Email Verification
              </Text>
              <Text size="xs" color="muted">
                Your email address verification status
              </Text>
            </SecurityInfo>
            <StatusBadge
              content={user?.isEmailVerified ? "Verified" : "Not Verified"}
              variant={user?.isEmailVerified ? "success" : "warning"}
              size="sm"
            />
          </SecurityItem>

          <SecurityItem>
            <SecurityInfo>
              <Text size="sm" weight="medium">
                Two-Factor Authentication
              </Text>
              <Text size="xs" color="muted">
                Additional security for your account
              </Text>
            </SecurityInfo>
            <StatusBadge
              content={user?.twoFactorEnabled ? "Enabled" : "Disabled"}
              variant={user?.twoFactorEnabled ? "success" : "error"}
              size="sm"
            />
          </SecurityItem>

          <SecurityItem>
            <SecurityInfo>
              <Text size="sm" weight="medium">
                Account Status
              </Text>
              <Text size="xs" color="muted">
                Current account status
              </Text>
            </SecurityInfo>
            <StatusBadge
              content={user?.isActive ? "Active" : "Inactive"}
              variant={user?.isActive ? "success" : "error"}
              size="sm"
            />
          </SecurityItem>
        </div>
      </SectionCard>

      {/* Security Information */}
      <SectionCard>
        <SectionHeader>
          <Heading as="h3" size="h4">
            Security Information
          </Heading>
          <Text size="sm" color="muted">
            Important security-related timestamps
          </Text>
        </SectionHeader>

        <FieldGrid>
          {renderField(
            "Account Created",
            user?.createdAt
              ? formatDate(user.createdAt, "MMM dd, yyyy HH:mm")
              : null
          )}
          {renderField(
            "Last Updated",
            user?.updatedAt
              ? formatDate(user.updatedAt, "MMM dd, yyyy HH:mm")
              : null
          )}
          {renderField(
            "Last Login",
            user?.lastLogin
              ? formatDate(user.lastLogin, "MMM dd, yyyy HH:mm")
              : null
          )}
          {renderField(
            "Password Changed",
            user?.passwordChangedAt
              ? formatDate(user.passwordChangedAt, "MMM dd, yyyy")
              : null
          )}
          {renderField(
            "Email Verified",
            user?.emailVerifiedAt
              ? formatDate(user.emailVerifiedAt, "MMM dd, yyyy")
              : null
          )}
          {renderField(
            "Login Attempts",
            user?.loginAttempts?.toString() || "0"
          )}
        </FieldGrid>
      </SectionCard>

      {/* Account Locks */}
      {user?.lockUntil && new Date(user.lockUntil) > new Date() && (
        <SectionCard>
          <SectionHeader>
            <Heading as="h3" size="h4">
              Security Alerts
            </Heading>
          </SectionHeader>

          <div
            style={{
              padding: "var(--spacing-3)",
              backgroundColor: "var(--color-warning-25)",
              border: "1px solid var(--color-warning-200)",
              borderRadius: "var(--border-radius-md)",
            }}
          >
            <Text size="sm" weight="medium" color="warning">
              Account Temporarily Locked
            </Text>
            <Text size="sm" color="muted">
              Your account is locked until{" "}
              {formatDate(user.lockUntil, "MMM dd, yyyy HH:mm")}
            </Text>
          </div>
        </SectionCard>
      )}
    </SectionContainer>
  );
}

SecuritySection.propTypes = {
  user: PropTypes.object.isRequired,
};

export default SecuritySection;
