import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineBuildingOffice,
  HiOutlineMapPin,
  HiOutlineScale,
  HiOutlineUserGroup,
  HiOutlineIdentification,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import StatusBadge from "../../../ui/StatusBadge2";
import {
  getIndividualAgeGroup,
  getUserDisplayName,
} from "../../../utils/userUtils";
import { getColorStyles } from "../../../utils/caseUtils";
import { formatDate } from "../../../utils/dateUtils";

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  padding: var(--spacing-8);

  @media (max-width: 768px) {
    padding: var(--spacing-6);
    gap: var(--spacing-4);
  }
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
`;

const Section = styled(Card)`
  padding: var(--spacing-6);
  border: 1px solid var(--color-grey-200);

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
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
  background: linear-gradient(
    135deg,
    var(--color-brand-100),
    var(--color-brand-200)
  );
  color: var(--color-brand-600);
  border-radius: var(--border-radius-lg);

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
  gap: var(--spacing-4);
`;

const Field = styled.div`
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  gap: var(--spacing-1);
`;

const FieldLabel = styled(Text)`
  color: var(--color-grey-500);
  font-weight: var(--font-weight-medium);
`;

const FieldValue = styled(Text)`
  color: var(--color-grey-800);
  font-weight: var(--font-weight-medium);
`;

const DescriptionSection = styled(Card)`
  padding: var(--spacing-6);
  border: 1px solid var(--color-grey-200);
  grid-column: 1 / -1;

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const Description = styled(Text)`
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const BadgeGroup = styled.div`
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
`;

const ConsentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-blue-25);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
`;

const ImpactSection = styled.div`
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-grey-200);
`;

/**
 * Case Overview Component
 *
 * Displays comprehensive case information in organized sections
 * with improved layout and case-specific data presentation
 */
function CaseOverview({ case: caseData }) {
  if (!caseData) {
    return (
      <OverviewContainer>
        <Text color="muted">No case data available</Text>
      </OverviewContainer>
    );
  }

  return (
    <OverviewContainer>
      {/* Description Section - Full Width */}
      <DescriptionSection>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineDocumentText />
          </SectionIcon>
          <SectionTitle size="md">Case Description</SectionTitle>
        </SectionHeader>

        <Description size="md">
          {caseData.description || "No description provided."}
        </Description>

        {caseData.impactDescription && (
          <ImpactSection>
            <Text
              size="sm"
              weight="semibold"
              color="muted"
              style={{ marginBottom: "var(--spacing-2)" }}
            >
              Impact Description:
            </Text>
            <Description size="sm" color="muted">
              {caseData.impactDescription}
            </Description>
          </ImpactSection>
        )}

        {caseData.affectedBeneficiaries && (
          <ImpactSection>
            <Text
              size="sm"
              weight="semibold"
              color="muted"
              style={{ marginBottom: "var(--spacing-2)" }}
            >
              Affected Beneficiaries:
            </Text>
            <Description size="sm" color="muted">
              {caseData.affectedBeneficiaries}
            </Description>
          </ImpactSection>
        )}
      </DescriptionSection>

      <SectionGrid>
        {/* Provider/Submitter Information */}
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
              <FieldValue size="sm">
                {caseData.providerType?.name || "Individual Beneficiary"}
              </FieldValue>
            </Field>

            {caseData.providerDetails?.contactPersonName && (
              <Field>
                <FieldLabel size="sm">Contact Person</FieldLabel>
                <FieldValue size="sm">
                  {caseData.providerDetails.contactPersonName}
                </FieldValue>
              </Field>
            )}

            {caseData.providerDetails?.organizationName && (
              <Field>
                <FieldLabel size="sm">Organization</FieldLabel>
                <FieldValue size="sm">
                  {caseData.providerDetails.organizationName}
                </FieldValue>
              </Field>
            )}

            {caseData.providerDetails?.email && (
              <Field>
                <FieldLabel size="sm">Email</FieldLabel>
                <FieldValue size="sm">
                  {caseData.providerDetails.email}
                </FieldValue>
              </Field>
            )}

            {caseData.providerDetails?.phone && (
              <Field>
                <FieldLabel size="sm">Phone</FieldLabel>
                <FieldValue size="sm">
                  {caseData.providerDetails.phone}
                </FieldValue>
              </Field>
            )}

            {/* Individual Demographics */}
            {caseData.individualDemographics?.gender && (
              <Field>
                <FieldLabel size="sm">Gender</FieldLabel>
                <FieldValue size="sm">
                  {caseData.individualDemographics.gender}
                </FieldValue>
              </Field>
            )}

            {caseData.individualDemographics?.ageGroup && (
              <Field>
                <FieldLabel size="sm">Age Group</FieldLabel>
                <FieldValue size="sm">
                  {getIndividualAgeGroup(
                    caseData.individualDemographics.ageGroup
                  )}
                </FieldValue>
              </Field>
            )}

            {caseData.individualDemographics?.disabilityStatus && (
              <Field>
                <FieldLabel size="sm">Disability Status</FieldLabel>
                <FieldValue size="sm">
                  {caseData.individualDemographics.disabilityStatus}
                </FieldValue>
              </Field>
            )}

            {/* Group Demographics */}
            {caseData.groupDemographics?.groupSize && (
              <Field>
                <FieldLabel size="sm">Group Size</FieldLabel>
                <FieldValue size="sm">
                  {caseData.groupDemographics.groupSize} people
                </FieldValue>
              </Field>
            )}

            {caseData.groupDemographics?.genderComposition && (
              <Field>
                <FieldLabel size="sm">Gender Composition</FieldLabel>
                <FieldValue size="sm">
                  {caseData.groupDemographics.genderComposition}
                </FieldValue>
              </Field>
            )}

            {/* Consent Information */}
            <ConsentSection>
              <Text size="sm" weight="semibold" color="brand">
                Data & Follow-up Consent
              </Text>
              <BadgeGroup>
                <StatusBadge
                  content={
                    caseData.dataSharingConsent
                      ? "Data Sharing: Granted"
                      : "Data Sharing: Not Granted"
                  }
                  variant={caseData.dataSharingConsent ? "success" : "warning"}
                  size="sm"
                />
                <StatusBadge
                  content={
                    caseData.followUpConsent
                      ? "Follow-up: Granted"
                      : "Follow-up: Not Granted"
                  }
                  variant={caseData.followUpConsent ? "success" : "warning"}
                  size="sm"
                />
              </BadgeGroup>
              {caseData.followUpContactMethod && (
                <Text size="xs" color="muted">
                  Preferred contact method: {caseData.followUpContactMethod}
                </Text>
              )}
            </ConsentSection>
          </FieldGrid>
        </Section>

        {/* Classification & Status */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineScale />
            </SectionIcon>
            <SectionTitle size="md">Classification</SectionTitle>
          </SectionHeader>

          <FieldGrid>
            <Field>
              <FieldLabel size="sm">Category</FieldLabel>
              <StatusBadge
                content={caseData.category?.name || "Uncategorized"}
                size="sm"
                style={getColorStyles(
                  caseData.category?.color || "--color-grey-200"
                )}
              />
            </Field>

            <Field>
              <FieldLabel size="sm">Status</FieldLabel>
              <StatusBadge
                content={caseData.status?.name || "Unknown"}
                size="sm"
                style={getColorStyles(
                  caseData.status?.color || "--color-grey-200"
                )}
              />
            </Field>

            <Field>
              <FieldLabel size="sm">Priority</FieldLabel>
              <StatusBadge
                content={caseData.priority?.name || "Normal"}
                size="sm"
                style={getColorStyles(
                  caseData.priority?.color || "--color-grey-200"
                )}
              />
            </Field>

            <Field>
              <FieldLabel size="sm">Channel</FieldLabel>
              <FieldValue size="sm">
                {caseData.channel?.name || "Unknown"}
              </FieldValue>
            </Field>

            {caseData.urgencyLevel && (
              <Field>
                <FieldLabel size="sm">Urgency Level</FieldLabel>
                <StatusBadge
                  content={caseData.urgencyLevel.toUpperCase()}
                  variant={
                    caseData.urgencyLevel === "critical"
                      ? "error"
                      : caseData.urgencyLevel === "high"
                      ? "warning"
                      : "default"
                  }
                  size="sm"
                />
              </Field>
            )}

            {/* Privacy & Security Indicators */}
            <Field>
              <FieldLabel size="sm">Privacy Settings</FieldLabel>
              <BadgeGroup>
                {caseData.isSensitive && (
                  <StatusBadge
                    content="Sensitive"
                    variant="warning"
                    size="sm"
                  />
                )}
                {caseData.isAnonymized && (
                  <StatusBadge content="Anonymized" variant="info" size="sm" />
                )}
                {caseData.confidentialityLevel && (
                  <StatusBadge
                    content={`${caseData.confidentialityLevel} Access`}
                    variant="secondary"
                    size="sm"
                  />
                )}
              </BadgeGroup>
            </Field>
          </FieldGrid>
        </Section>

        {/* Assignment Information */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineUserGroup />
            </SectionIcon>
            <SectionTitle size="md">Assignment</SectionTitle>
          </SectionHeader>

          <FieldGrid>
            <Field>
              <FieldLabel size="sm">Submitted By</FieldLabel>
              <FieldValue size="sm">
                {caseData.submittedBy
                  ? getUserDisplayName(caseData.submittedBy)
                  : "System/Anonymous"}
              </FieldValue>
            </Field>

            <Field>
              <FieldLabel size="sm">Assigned To</FieldLabel>
              <FieldValue size="sm">
                {caseData.assignedTo
                  ? getUserDisplayName(caseData.assignedTo)
                  : "Unassigned"}
              </FieldValue>
            </Field>

            {caseData.assignedBy && (
              <Field>
                <FieldLabel size="sm">Assigned By</FieldLabel>
                <FieldValue size="sm">
                  {getUserDisplayName(caseData.assignedBy)}
                </FieldValue>
              </Field>
            )}

            {caseData.assignedAt && (
              <Field>
                <FieldLabel size="sm">Assigned Date</FieldLabel>
                <FieldValue size="sm">
                  {formatDate(caseData.assignedAt)}
                </FieldValue>
              </Field>
            )}

            {caseData.assignmentComments && (
              <Field>
                <FieldLabel size="sm">Assignment Notes</FieldLabel>
                <Text size="sm" color="muted">
                  {caseData.assignmentComments}
                </Text>
              </Field>
            )}
          </FieldGrid>
        </Section>

        {/* Timeline Information */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineCalendar />
            </SectionIcon>
            <SectionTitle size="md">Timeline</SectionTitle>
          </SectionHeader>

          <FieldGrid>
            <Field>
              <FieldLabel size="sm">Case Date</FieldLabel>
              <FieldValue size="sm">
                {formatDate(caseData.caseDate || caseData.createdAt)}
              </FieldValue>
            </Field>

            <Field>
              <FieldLabel size="sm">Created</FieldLabel>
              <FieldValue size="sm">
                {formatDate(caseData.createdAt, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </FieldValue>
            </Field>

            <Field>
              <FieldLabel size="sm">Last Updated</FieldLabel>
              <FieldValue size="sm">
                {formatDate(caseData.updatedAt, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </FieldValue>
            </Field>

            {caseData.dueDate && (
              <Field>
                <FieldLabel size="sm">Due Date</FieldLabel>
                <FieldValue size="sm">
                  {formatDate(caseData.dueDate)}
                </FieldValue>
              </Field>
            )}

            {caseData.resolvedAt && (
              <Field>
                <FieldLabel size="sm">Resolved</FieldLabel>
                <FieldValue size="sm">
                  {formatDate(caseData.resolvedAt)}
                </FieldValue>
              </Field>
            )}

            {caseData.escalatedAt && (
              <Field>
                <FieldLabel size="sm">Last Escalated</FieldLabel>
                <FieldValue size="sm">
                  {formatDate(caseData.escalatedAt)}
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
            {caseData.region && (
              <Field>
                <FieldLabel size="sm">Region</FieldLabel>
                <FieldValue size="sm">{caseData.region.name}</FieldValue>
              </Field>
            )}

            {caseData.governorate && (
              <Field>
                <FieldLabel size="sm">Governorate</FieldLabel>
                <FieldValue size="sm">{caseData.governorate.name}</FieldValue>
              </Field>
            )}

            {caseData.community && (
              <Field>
                <FieldLabel size="sm">Community</FieldLabel>
                <FieldValue size="sm">{caseData.community.name}</FieldValue>
              </Field>
            )}

            {caseData.location && (
              <Field>
                <FieldLabel size="sm">Location Details</FieldLabel>
                <FieldValue size="sm">{caseData.location}</FieldValue>
              </Field>
            )}

            {caseData.coordinates && (
              <Field>
                <FieldLabel size="sm">Coordinates</FieldLabel>
                <FieldValue
                  size="sm"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {caseData.coordinates}
                </FieldValue>
              </Field>
            )}
          </FieldGrid>
        </Section>

        {/* Project Information */}
        {caseData.isProjectRelated && (
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
                <StatusBadge content="Yes" variant="info" size="sm" />
              </Field>

              {caseData.program && (
                <Field>
                  <FieldLabel size="sm">Program</FieldLabel>
                  <FieldValue size="sm">{caseData.program.name}</FieldValue>
                </Field>
              )}

              {caseData.project && (
                <Field>
                  <FieldLabel size="sm">Project</FieldLabel>
                  <FieldValue size="sm">{caseData.project.name}</FieldValue>
                </Field>
              )}

              {caseData.activity && (
                <Field>
                  <FieldLabel size="sm">Activity</FieldLabel>
                  <FieldValue size="sm">{caseData.activity.name}</FieldValue>
                </Field>
              )}
            </FieldGrid>
          </Section>
        )}

        {/* System Information */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineIdentification />
            </SectionIcon>
            <SectionTitle size="md">System Information</SectionTitle>
          </SectionHeader>

          <FieldGrid>
            <Field>
              <FieldLabel size="sm">Case ID</FieldLabel>
              <FieldValue size="sm" style={{ fontFamily: "var(--font-mono)" }}>
                {caseData.id}
              </FieldValue>
            </Field>

            <Field>
              <FieldLabel size="sm">Case Number</FieldLabel>
              <FieldValue size="sm" style={{ fontFamily: "var(--font-mono)" }}>
                {caseData.caseNumber}
              </FieldValue>
            </Field>

            {caseData.tags && (
              <Field>
                <FieldLabel size="sm">Tags</FieldLabel>
                <BadgeGroup>
                  {caseData.tags.split(",").map((tag, index) => (
                    <StatusBadge
                      key={index}
                      content={tag.trim()}
                      variant="secondary"
                      size="sm"
                    />
                  ))}
                </BadgeGroup>
              </Field>
            )}

            <Field>
              <FieldLabel size="sm">Privacy Policy</FieldLabel>
              <StatusBadge
                content={
                  caseData.privacyPolicyAccepted ? "Accepted" : "Not Accepted"
                }
                variant={caseData.privacyPolicyAccepted ? "success" : "error"}
                size="sm"
              />
            </Field>
          </FieldGrid>
        </Section>
      </SectionGrid>
    </OverviewContainer>
  );
}

CaseOverview.propTypes = {
  case: PropTypes.object.isRequired,
  caseId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default CaseOverview;
