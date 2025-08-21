import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineBuildingOffice,
  HiOutlineMapPin,
} from "react-icons/hi2";

import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import StatusBadge from "../../../ui/StatusBadge";

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  padding: var(--spacing-6);
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled(Card)`
  padding: var(--spacing-5);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  border-radius: var(--border-radius-md);

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const SectionTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-3);
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

const DescriptionSection = styled(Card)`
  padding: var(--spacing-5);
  grid-column: 1 / -1;
`;

const Description = styled(Text)`
  line-height: 1.6;
  white-space: pre-wrap;
`;

/**
 * Feedback Overview Component
 *
 * Displays the main feedback information in organized sections
 */
function FeedbackOverview({ feedback }) {
  return (
    <OverviewContainer>
      {/* Description Section - Full Width */}
      <DescriptionSection>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineDocumentText />
          </SectionIcon>
          <SectionTitle size="md">Description</SectionTitle>
        </SectionHeader>
        <Description size="md">
          {feedback.description || "No description provided."}
        </Description>
        {feedback.impactDescription && (
          <>
            <Text
              size="sm"
              weight="semibold"
              style={{
                marginTop: "var(--spacing-4)",
                marginBottom: "var(--spacing-2)",
              }}
            >
              Impact Description:
            </Text>
            <Description size="sm" color="muted">
              {feedback.impactDescription}
            </Description>
          </>
        )}
      </DescriptionSection>

      <SectionGrid>
        {/* Provider Information */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineUser />
            </SectionIcon>
            <SectionTitle size="md">Provider Information</SectionTitle>
          </SectionHeader>

          <FieldGrid>
            <Field>
              <FieldLabel size="sm">Provider Type</FieldLabel>
              <FieldValue size="sm" weight="medium">
                {feedback.providerType?.name || "Individual"}
              </FieldValue>
            </Field>

            {feedback.providerName && (
              <Field>
                <FieldLabel size="sm">Provider Name</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.providerName}
                </FieldValue>
              </Field>
            )}

            {feedback.providerEmail && (
              <Field>
                <FieldLabel size="sm">Email</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.providerEmail}
                </FieldValue>
              </Field>
            )}

            {feedback.providerPhone && (
              <Field>
                <FieldLabel size="sm">Phone</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.providerPhone}
                </FieldValue>
              </Field>
            )}

            {feedback.individualProviderGender && (
              <Field>
                <FieldLabel size="sm">Gender</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.individualProviderGender}
                </FieldValue>
              </Field>
            )}

            {feedback.individualProviderAgeGroup && (
              <Field>
                <FieldLabel size="sm">Age Group</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.individualProviderAgeGroup}
                </FieldValue>
              </Field>
            )}

            <Field>
              <FieldLabel size="sm">Data Sharing Consent</FieldLabel>
              <StatusBadge
                content={
                  feedback.dataSharingConsent ? "Granted" : "Not Granted"
                }
                variant={feedback.dataSharingConsent ? "success" : "warning"}
                size="sm"
              />
            </Field>

            <Field>
              <FieldLabel size="sm">Follow-up Consent</FieldLabel>
              <StatusBadge
                content={feedback.consentToFollowUp ? "Granted" : "Not Granted"}
                variant={feedback.consentToFollowUp ? "success" : "warning"}
                size="sm"
              />
            </Field>
          </FieldGrid>
        </Section>

        {/* Project Information */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineBuildingOffice />
            </SectionIcon>
            <SectionTitle size="md">Project Information</SectionTitle>
          </SectionHeader>

          <FieldGrid>
            <Field>
              <FieldLabel size="sm">Project Related</FieldLabel>
              <StatusBadge
                content={feedback.isProjectRelated ? "Yes" : "No"}
                variant={feedback.isProjectRelated ? "info" : "default"}
                size="sm"
              />
            </Field>

            {feedback.programmeId && (
              <Field>
                <FieldLabel size="sm">Programme</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.programme?.name ||
                    `Programme ID: ${feedback.programmeId}`}
                </FieldValue>
              </Field>
            )}

            {feedback.projectId && (
              <Field>
                <FieldLabel size="sm">Project</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.project?.name ||
                    `Project ID: ${feedback.projectId}`}
                </FieldValue>
              </Field>
            )}

            {feedback.activityId && (
              <Field>
                <FieldLabel size="sm">Activity</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.activity?.name ||
                    `Activity ID: ${feedback.activityId}`}
                </FieldValue>
              </Field>
            )}
          </FieldGrid>
        </Section>

        {/* Submission Details */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineCalendar />
            </SectionIcon>
            <SectionTitle size="md">Submission Details</SectionTitle>
          </SectionHeader>

          <FieldGrid>
            <Field>
              <FieldLabel size="sm">Feedback Date</FieldLabel>
              <FieldValue size="sm" weight="medium">
                {new Date(feedback.feedbackDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </FieldValue>
            </Field>

            <Field>
              <FieldLabel size="sm">Submitted By</FieldLabel>
              <FieldValue size="sm" weight="medium">
                {feedback.submittedBy?.firstName
                  ? `${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}`
                  : "System"}
              </FieldValue>
            </Field>

            <Field>
              <FieldLabel size="sm">Submitted At</FieldLabel>
              <FieldValue size="sm" weight="medium">
                {new Date(feedback.submittedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </FieldValue>
            </Field>

            {feedback.submittedByComments && (
              <Field>
                <FieldLabel size="sm">Submission Notes</FieldLabel>
                <FieldValue size="sm">
                  {feedback.submittedByComments}
                </FieldValue>
              </Field>
            )}
          </FieldGrid>
        </Section>

        {/* Location Information */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineMapPin />
            </SectionIcon>
            <SectionTitle size="md">Location</SectionTitle>
          </SectionHeader>

          <FieldGrid>
            {feedback.community && (
              <Field>
                <FieldLabel size="sm">Community</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.community.name}
                </FieldValue>
              </Field>
            )}

            {feedback.location && (
              <Field>
                <FieldLabel size="sm">Location Details</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.location}
                </FieldValue>
              </Field>
            )}

            {feedback.latitude && feedback.longitude && (
              <Field>
                <FieldLabel size="sm">Coordinates</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {feedback.latitude}, {feedback.longitude}
                </FieldValue>
              </Field>
            )}
          </FieldGrid>
        </Section>
      </SectionGrid>
    </OverviewContainer>
  );
}

FeedbackOverview.propTypes = {
  feedback: PropTypes.object.isRequired,
};

export default FeedbackOverview;
