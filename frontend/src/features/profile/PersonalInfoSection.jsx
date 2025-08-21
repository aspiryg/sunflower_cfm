import styled from "styled-components";
import PropTypes from "prop-types";
import Card from "../../ui/Card";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";

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

function PersonalInfoSection({ user }) {
  const renderField = (label, value) => (
    <Field>
      <FieldLabel size="sm">{label}</FieldLabel>
      {value ? (
        <FieldValue size="sm" weight="medium">
          {value}
        </FieldValue>
      ) : (
        <EmptyValue size="sm">Not provided</EmptyValue>
      )}
    </Field>
  );

  return (
    <SectionContainer>
      {/* Basic Information */}
      <SectionCard>
        <SectionHeader>
          <Heading as="h3" size="h4">
            Basic Information
          </Heading>
          <Text size="sm" color="muted">
            Your personal details and identification information
          </Text>
        </SectionHeader>

        <FieldGrid>
          {renderField("First Name", user?.firstName)}
          {renderField("Last Name", user?.lastName)}
          {renderField("Username", user?.username)}
          {renderField("Email Address", user?.email)}
          {renderField("Phone Number", user?.phone)}
          {renderField(
            "Date of Birth",
            user?.dateOfBirth
              ? new Date(user.dateOfBirth).toLocaleDateString()
              : null
          )}
        </FieldGrid>
      </SectionCard>

      {/* Professional Information */}
      <SectionCard>
        <SectionHeader>
          <Heading as="h3" size="h4">
            Professional Information
          </Heading>
          <Text size="sm" color="muted">
            Your role and organizational details
          </Text>
        </SectionHeader>

        <FieldGrid>
          {renderField("Role", user?.role)}
          {renderField("Organization", user?.organization)}
          {renderField(
            "Account Status",
            user?.isActive ? "Active" : "Inactive"
          )}
          {renderField("Email Verified", user?.isEmailVerified ? "Yes" : "No")}
        </FieldGrid>
      </SectionCard>

      {/* Bio Section */}
      {user?.bio && (
        <SectionCard>
          <SectionHeader>
            <Heading as="h3" size="h4">
              About
            </Heading>
          </SectionHeader>

          <Text size="sm" style={{ lineHeight: 1.6 }}>
            {user.bio}
          </Text>
        </SectionCard>
      )}
    </SectionContainer>
  );
}

PersonalInfoSection.propTypes = {
  user: PropTypes.object.isRequired,
};

export default PersonalInfoSection;
