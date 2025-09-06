import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineArchiveBox,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineShare,
  HiOutlineLockClosed,
  HiOutlineCalendar,
  // HiOutlineCog6Tooth,
  // HiOutlineEyeSlash,
  // HiOutlineFlag,
  // HiOutlineExclamationTriangle,
  // HiOutlineInformationCircle,
  // HiOutlinePencil,
  // HiOutlineClipboardDocumentList,
  // HiOutlineGlobeAlt,
  // HiOutlineClock,
} from "react-icons/hi2";

import Card from "../../../ui/Card";
import Text from "../../../ui/Text";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import Switch from "../../../ui/Switch";
import StyledSelect from "../../../ui/StyledSelect";
import Textarea from "../../../ui/Textarea";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import StatusBadge from "../../../ui/StatusBadge";
// import EnhancedCheckbox from "../../../ui/EnhancedCheckbox";
import DatePicker from "../../../ui/DatePicker";
import InfoCard from "../../../ui/InfoCard";
import { ConfirmationModal } from "../../../ui/Modal";
import DeleteCaseModal from "../modals/DeleteCaseModal";

import { useUpdateCase } from "../useCase";
// import { useAuth } from "../../../contexts/AuthContext";
import { useRoleBasedAuth } from "../../../hooks/useRoleBasedAuth";
import { formatDate, formatRelativeTime } from "../../../utils/dateUtils";
import { getUserDisplayName } from "../../../utils/userUtils";

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  padding: var(--spacing-8);
  max-width: 100%;

  @media (max-width: 768px) {
    padding: var(--spacing-6);
    gap: var(--spacing-4);
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
`;

const SettingsSection = styled(Card)`
  padding: var(--spacing-6);
  border: 1px solid var(--color-grey-200);
  background: var(--color-grey-0);

  &:hover {
    border-color: var(--color-grey-300);
    box-shadow: var(--shadow-sm);
  }

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
  border-radius: var(--border-radius-lg);
  background: ${(props) => {
    switch (props.$variant) {
      case "privacy":
        return "linear-gradient(135deg, var(--color-info-100), var(--color-info-200))";
      case "visibility":
        return "linear-gradient(135deg, var(--color-warning-100), var(--color-warning-200))";
      case "access":
        return "linear-gradient(135deg, var(--color-success-100), var(--color-success-200))";
      case "metadata":
        return "linear-gradient(135deg, var(--color-purple-100), var(--color-purple-200))";
      case "archive":
        return "linear-gradient(135deg, var(--color-grey-100), var(--color-grey-200))";
      case "referral":
        return "linear-gradient(135deg, var(--color-brand-100), var(--color-brand-200))";
      default:
        return "linear-gradient(135deg, var(--color-grey-100), var(--color-grey-200))";
    }
  }};
  color: ${(props) => {
    switch (props.$variant) {
      case "privacy":
        return "var(--color-info-600)";
      case "visibility":
        return "var(--color-warning-600)";
      case "access":
        return "var(--color-success-600)";
      case "metadata":
        return "var(--color-purple-600)";
      case "archive":
        return "var(--color-grey-600)";
      case "referral":
        return "var(--color-brand-600)";
      default:
        return "var(--color-grey-600)";
    }
  }};

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const SectionTitle = styled(Heading)`
  color: var(--color-grey-800);
`;

const SettingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-100);
  margin-bottom: var(--spacing-3);

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    flex-direction: column;
    gap: var(--spacing-2);
  }
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
`;

const SettingDescription = styled(Text)`
  line-height: 1.5;
  margin-top: var(--spacing-1);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const WarningSection = styled.div`
  grid-column: 1 / -1;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);

  ${(props) => {
    switch (props.$status) {
      case "active":
        return `
          background: var(--color-success-100);
          color: var(--color-success-700);
          border: 1px solid var(--color-success-200);
        `;
      case "restricted":
        return `
          background: var(--color-warning-100);
          color: var(--color-warning-700);
          border: 1px solid var(--color-warning-200);
        `;
      case "locked":
        return `
          background: var(--color-error-100);
          color: var(--color-error-700);
          border: 1px solid var(--color-error-200);
        `;
      default:
        return `
          background: var(--color-grey-100);
          color: var(--color-grey-700);
          border: 1px solid var(--color-grey-200);
        `;
    }
  }}
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const MetadataLabel = styled(Text)`
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-600);
`;

const MetadataValue = styled(Text)`
  color: var(--color-grey-800);
  font-family: ${(props) => (props.$mono ? "var(--font-mono)" : "inherit")};
`;

const ReferralPlaceholder = styled.div`
  padding: var(--spacing-4);
  background: linear-gradient(
    135deg,
    var(--color-blue-25),
    var(--color-blue-50)
  );
  border: 2px dashed var(--color-blue-300);
  border-radius: var(--border-radius-lg);
  text-align: center;
  color: var(--color-blue-700);
`;

/**
 * Case Settings Component
 *
 * Comprehensive settings management for cases including privacy,
 * visibility, access controls, metadata, and archival options
 */
function CaseSettings({ case: caseData, caseId, onRefresh }) {
  // const { user: currentUser } = useAuth();
  const { hasRole } = useRoleBasedAuth();

  // Local state for settings
  const [localSettings, setLocalSettings] = useState({
    isSensitive: caseData?.isSensitive || false,
    isAnonymized: caseData?.isAnonymized || false,
    isPublic: caseData?.isPublic || false,
    confidentialityLevel: caseData?.confidentialityLevel || "internal",
    dataSharingConsent: caseData?.dataSharingConsent || false,
    followUpConsent: caseData?.followUpConsent || false,
    followUpContactMethod: caseData?.followUpContactMethod || "",
    privacyPolicyAccepted: caseData?.privacyPolicyAccepted || false,
    tags: caseData?.tags || "",
    followUpRequired: caseData?.followUpRequired || false,
    followUpDate: caseData?.followUpDate || "",
    monitoringRequired: caseData?.monitoringRequired || false,
    monitoringDate: caseData?.monitoringDate || "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmArchive, setShowConfirmArchive] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const updateCaseMutation = useUpdateCase({
    onSuccess: () => {
      setHasChanges(false);
      if (onRefresh) onRefresh();
    },
  });

  // Permission checks
  const canEditSettings = hasRole("staff");
  const canArchiveCase = hasRole("manager");
  const canDeleteCase = hasRole("admin");
  const canManagePrivacy = hasRole("manager");

  // Handle setting changes
  const handleSettingChange = (key, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!hasChanges || updateCaseMutation.isPending) return;

    try {
      await updateCaseMutation.mutateAsync({
        caseId: caseId,
        caseData: localSettings,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  // Reset settings
  const handleResetSettings = () => {
    setLocalSettings({
      isSensitive: caseData?.isSensitive || false,
      isAnonymized: caseData?.isAnonymized || false,
      isPublic: caseData?.isPublic || false,
      confidentialityLevel: caseData?.confidentialityLevel || "internal",
      dataSharingConsent: caseData?.dataSharingConsent || false,
      followUpConsent: caseData?.followUpConsent || false,
      followUpContactMethod: caseData?.followUpContactMethod || "",
      privacyPolicyAccepted: caseData?.privacyPolicyAccepted || false,
      tags: caseData?.tags || "",
      followUpRequired: caseData?.followUpRequired || false,
      followUpDate: caseData?.followUpDate || "",
      monitoringRequired: caseData?.monitoringRequired || false,
      monitoringDate: caseData?.monitoringDate || "",
    });
    setHasChanges(false);
  };

  // Confidentiality levels
  const confidentialityOptions = [
    { value: "public", label: "Public", description: "Can be shared publicly" },
    {
      value: "internal",
      label: "Internal",
      description: "Organization access only",
    },
    {
      value: "restricted",
      label: "Restricted",
      description: "Limited team access",
    },
    {
      value: "confidential",
      label: "Confidential",
      description: "Minimal access required",
    },
  ];

  // Contact method options
  const contactMethodOptions = [
    { value: "", label: "Not specified" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "sms", label: "SMS" },
    { value: "in_person", label: "In Person" },
    { value: "none", label: "No Contact" },
  ];

  if (!caseData) {
    return (
      <SettingsContainer>
        <LoadingSpinner size="large" />
        <Text size="lg" color="muted">
          Loading case settings...
        </Text>
      </SettingsContainer>
    );
  }

  return (
    <SettingsContainer>
      {/* Privacy & Security Settings */}
      <SettingsGrid>
        <SettingsSection>
          <SectionHeader>
            <SectionIcon $variant="privacy">
              <HiOutlineShieldCheck />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Privacy & Security
            </SectionTitle>
          </SectionHeader>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Sensitive Information
                </Text>
                <SettingDescription size="xs" color="muted">
                  Mark if this case contains sensitive or confidential
                  information that requires special handling
                </SettingDescription>
              </div>
              <SettingControl>
                <Switch
                  checked={localSettings.isSensitive}
                  onChange={(checked) =>
                    handleSettingChange("isSensitive", checked)
                  }
                  disabled={!canManagePrivacy}
                  size="sm"
                />
                {localSettings.isSensitive && (
                  <StatusBadge
                    content="Sensitive"
                    variant="warning"
                    size="sm"
                  />
                )}
              </SettingControl>
            </SettingItemHeader>
          </SettingItem>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Data Anonymization
                </Text>
                <SettingDescription size="xs" color="muted">
                  Personal identifiable information has been anonymized or
                  removed from this case
                </SettingDescription>
              </div>
              <SettingControl>
                <Switch
                  checked={localSettings.isAnonymized}
                  onChange={(checked) =>
                    handleSettingChange("isAnonymized", checked)
                  }
                  disabled={!canManagePrivacy}
                  size="sm"
                />
                {localSettings.isAnonymized && (
                  <StatusBadge content="Anonymized" variant="info" size="sm" />
                )}
              </SettingControl>
            </SettingItemHeader>
          </SettingItem>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Confidentiality Level
                </Text>
                <SettingDescription size="xs" color="muted">
                  Set the access level for this case data
                </SettingDescription>
              </div>
            </SettingItemHeader>
            <StyledSelect
              value={localSettings.confidentialityLevel}
              onChange={(value) =>
                handleSettingChange("confidentialityLevel", value)
              }
              disabled={!canManagePrivacy}
              options={confidentialityOptions}
              placeholder="Select confidentiality level"
            />
          </SettingItem>
        </SettingsSection>

        {/* Visibility & Access Settings */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon $variant="visibility">
              <HiOutlineEye />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Visibility & Access
            </SectionTitle>
          </SectionHeader>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Public Visibility
                </Text>
                <SettingDescription size="xs" color="muted">
                  Allow this case to be visible in public reports and dashboards
                  (anonymized)
                </SettingDescription>
              </div>
              <SettingControl>
                <Switch
                  checked={localSettings.isPublic}
                  onChange={(checked) =>
                    handleSettingChange("isPublic", checked)
                  }
                  disabled={!canManagePrivacy || localSettings.isSensitive}
                  size="sm"
                />
                {localSettings.isPublic && (
                  <StatusBadge content="Public" variant="success" size="sm" />
                )}
              </SettingControl>
            </SettingItemHeader>
            {localSettings.isSensitive && (
              <InfoCard variant="warning" size="small">
                Public visibility is disabled for sensitive cases
              </InfoCard>
            )}
          </SettingItem>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Current Access Status
                </Text>
                <SettingDescription size="xs" color="muted">
                  Current access permissions and restrictions for this case
                </SettingDescription>
              </div>
            </SettingItemHeader>
            <div
              style={{ display: "flex", flex: "wrap", gap: "var(--spacing-2)" }}
            >
              <StatusIndicator
                $status={caseData.isActive ? "active" : "locked"}
              >
                {caseData.isActive ? (
                  <HiOutlineCheckCircle size={16} />
                ) : (
                  <HiOutlineLockClosed size={16} />
                )}
                {caseData.isActive ? "Active" : "Locked"}
              </StatusIndicator>
              {localSettings.confidentialityLevel && (
                <StatusIndicator $status="restricted">
                  <HiOutlineShieldCheck size={16} />
                  {localSettings.confidentialityLevel.charAt(0).toUpperCase() +
                    localSettings.confidentialityLevel.slice(1)}
                </StatusIndicator>
              )}
            </div>
          </SettingItem>
        </SettingsSection>

        {/* Consent & Communication Settings */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon $variant="access">
              <HiOutlineUserGroup />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Consent & Communication
            </SectionTitle>
          </SectionHeader>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Data Sharing Consent
                </Text>
                <SettingDescription size="xs" color="muted">
                  Provider has given consent for data sharing with relevant
                  stakeholders
                </SettingDescription>
              </div>
              <SettingControl>
                <Switch
                  checked={localSettings.dataSharingConsent}
                  onChange={(checked) =>
                    handleSettingChange("dataSharingConsent", checked)
                  }
                  disabled={!canEditSettings}
                  size="sm"
                />
              </SettingControl>
            </SettingItemHeader>
          </SettingItem>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Follow-up Consent
                </Text>
                <SettingDescription size="xs" color="muted">
                  Provider has consented to follow-up communications
                </SettingDescription>
              </div>
              <SettingControl>
                <Switch
                  checked={localSettings.followUpConsent}
                  onChange={(checked) =>
                    handleSettingChange("followUpConsent", checked)
                  }
                  disabled={!canEditSettings}
                  size="sm"
                />
              </SettingControl>
            </SettingItemHeader>
            {localSettings.followUpConsent && (
              <div>
                <Text
                  size="xs"
                  weight="medium"
                  color="muted"
                  style={{ marginBottom: "var(--spacing-2)" }}
                >
                  Preferred Contact Method:
                </Text>
                <StyledSelect
                  value={localSettings.followUpContactMethod}
                  onChange={(value) =>
                    handleSettingChange("followUpContactMethod", value)
                  }
                  disabled={!canEditSettings}
                  options={contactMethodOptions}
                  placeholder="Select contact method"
                />
              </div>
            )}
          </SettingItem>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Privacy Policy
                </Text>
                <SettingDescription size="xs" color="muted">
                  Provider has accepted the organization's privacy policy
                </SettingDescription>
              </div>
              <SettingControl>
                <Switch
                  checked={localSettings.privacyPolicyAccepted}
                  onChange={(checked) =>
                    handleSettingChange("privacyPolicyAccepted", checked)
                  }
                  disabled={!canEditSettings}
                  size="sm"
                />
                {localSettings.privacyPolicyAccepted && (
                  <StatusBadge content="Accepted" variant="success" size="sm" />
                )}
              </SettingControl>
            </SettingItemHeader>
          </SettingItem>
        </SettingsSection>

        {/* Metadata & Tagging */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon $variant="metadata">
              <HiOutlineDocumentText />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Metadata & Tagging
            </SectionTitle>
          </SectionHeader>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Case Tags
                </Text>
                <SettingDescription size="xs" color="muted">
                  Add tags to categorize and help search this case
                  (comma-separated)
                </SettingDescription>
              </div>
            </SettingItemHeader>
            <Textarea
              value={localSettings.tags}
              onChange={(e) => handleSettingChange("tags", e.target.value)}
              disabled={!canEditSettings}
              placeholder="Enter tags separated by commas (e.g., urgent, water-supply, infrastructure)"
              rows={2}
            />
          </SettingItem>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  System Metadata
                </Text>
                <SettingDescription size="xs" color="muted">
                  System-generated metadata and tracking information
                </SettingDescription>
              </div>
            </SettingItemHeader>
            <MetadataGrid>
              <MetadataItem>
                <MetadataLabel size="xs">Case ID</MetadataLabel>
                <MetadataValue size="xs" $mono>
                  {caseData.id}
                </MetadataValue>
              </MetadataItem>
              <MetadataItem>
                <MetadataLabel size="xs">Created</MetadataLabel>
                <MetadataValue size="xs">
                  {formatDate(caseData.createdAt)}
                </MetadataValue>
              </MetadataItem>
              <MetadataItem>
                <MetadataLabel size="xs">Last Updated</MetadataLabel>
                <MetadataValue size="xs">
                  {formatRelativeTime(caseData.updatedAt)}
                </MetadataValue>
              </MetadataItem>
              <MetadataItem>
                <MetadataLabel size="xs">Updated By</MetadataLabel>
                <MetadataValue size="xs">
                  {getUserDisplayName(caseData.updatedBy) || "System"}
                </MetadataValue>
              </MetadataItem>
            </MetadataGrid>
          </SettingItem>
        </SettingsSection>

        {/* Follow-up & Monitoring */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon $variant="metadata">
              <HiOutlineCalendar />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Follow-up & Monitoring
            </SectionTitle>
          </SectionHeader>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Follow-up Required
                </Text>
                <SettingDescription size="xs" color="muted">
                  This case requires follow-up action or monitoring
                </SettingDescription>
              </div>
              <SettingControl>
                <Switch
                  checked={localSettings.followUpRequired}
                  onChange={(checked) =>
                    handleSettingChange("followUpRequired", checked)
                  }
                  disabled={!canEditSettings}
                  size="sm"
                />
              </SettingControl>
            </SettingItemHeader>
            {localSettings.followUpRequired && (
              <div>
                <Text
                  size="xs"
                  weight="medium"
                  color="muted"
                  style={{ marginBottom: "var(--spacing-2)" }}
                >
                  Follow-up Date:
                </Text>
                <DatePicker
                  value={localSettings.followUpDate}
                  onChange={(date) => handleSettingChange("followUpDate", date)}
                  disabled={!canEditSettings}
                  placeholder="Select follow-up date"
                  size="medium"
                />
              </div>
            )}
          </SettingItem>

          <SettingItem>
            <SettingItemHeader>
              <div>
                <Text size="sm" weight="semibold">
                  Monitoring Required
                </Text>
                <SettingDescription size="xs" color="muted">
                  This case requires ongoing monitoring or periodic review
                </SettingDescription>
              </div>
              <SettingControl>
                <Switch
                  checked={localSettings.monitoringRequired}
                  onChange={(checked) =>
                    handleSettingChange("monitoringRequired", checked)
                  }
                  disabled={!canEditSettings}
                  size="sm"
                />
              </SettingControl>
            </SettingItemHeader>
            {localSettings.monitoringRequired && (
              <div>
                <Text
                  size="xs"
                  weight="medium"
                  color="muted"
                  style={{ marginBottom: "var(--spacing-2)" }}
                >
                  Monitoring Date:
                </Text>
                <DatePicker
                  value={localSettings.monitoringDate}
                  onChange={(date) =>
                    handleSettingChange("monitoringDate", date)
                  }
                  disabled={!canEditSettings}
                  placeholder="Select monitoring date"
                  size="medium"
                />
              </div>
            )}
          </SettingItem>
        </SettingsSection>

        {/* External Referral (Future Feature) */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon $variant="referral">
              <HiOutlineShare />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              External Referral
            </SectionTitle>
          </SectionHeader>

          <ReferralPlaceholder>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--spacing-3)",
              }}
            >
              <HiOutlineArrowTopRightOnSquare size={32} />
              <Text size="sm" weight="semibold">
                Referral Feature Coming Soon
              </Text>
              <Text
                size="xs"
                color="muted"
                style={{ textAlign: "center", maxWidth: "300px" }}
              >
                Ability to refer cases to external agencies and organizations
                will be available in a future update.
              </Text>
            </div>
          </ReferralPlaceholder>
        </SettingsSection>
      </SettingsGrid>

      {/* Archive & Deletion Warning Section */}
      <WarningSection>
        <SettingsSection>
          <SectionHeader>
            <SectionIcon $variant="archive">
              <HiOutlineArchiveBox />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Archive & Deletion
            </SectionTitle>
          </SectionHeader>

          <InfoCard variant="warning" title="Permanent Actions" size="medium">
            <Text size="sm">
              The following actions are permanent and cannot be undone. Please
              ensure you have the necessary permissions and have backed up any
              important data before proceeding.
            </Text>

            <ActionButtons>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => setShowConfirmArchive(true)}
                disabled={!canArchiveCase}
              >
                <HiOutlineArchiveBox />
                Archive Case
              </Button>

              <Button
                variant="danger"
                size="medium"
                onClick={() => setShowConfirmDelete(true)}
                disabled={!canDeleteCase}
              >
                <HiOutlineTrash />
                Delete Case
              </Button>
            </ActionButtons>
          </InfoCard>
        </SettingsSection>
      </WarningSection>

      {/* Action Buttons */}
      {hasChanges && (
        <div
          style={{
            position: "sticky",
            bottom: "var(--spacing-4)",
            display: "flex",
            gap: "var(--spacing-3)",
            padding: "var(--spacing-4)",
            background: "var(--color-grey-0)",
            border: "1px solid var(--color-grey-200)",
            borderRadius: "var(--border-radius-lg)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <Button
            variant="secondary"
            size="medium"
            onClick={handleResetSettings}
            disabled={updateCaseMutation.isPending}
          >
            <HiOutlineXCircle />
            Reset Changes
          </Button>

          <Button
            variant="primary"
            size="medium"
            onClick={handleSaveSettings}
            disabled={!hasChanges || updateCaseMutation.isPending}
            loading={updateCaseMutation.isPending}
          >
            <HiOutlineCheckCircle />
            Save Settings
          </Button>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showConfirmArchive}
        onClose={() => setShowConfirmArchive(false)}
        onConfirm={() => {
          // TODO: Implement archive functionality
          console.log("Archive case:", caseId);
          setShowConfirmArchive(false);
        }}
        title="Archive Case"
        description="Are you sure you want to archive this case? Archived cases can be restored later."
        confirmText="Archive Case"
        cancelText="Cancel"
        variant="warning"
      />

      {/* <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          // TODO: Implement delete functionality
          console.log("Delete case:", caseId);
          setShowConfirmDelete(false);
        }}
        title="Delete Case"
        description="Are you sure you want to permanently delete this case? This action cannot be undone."
        confirmText="Delete Case"
        cancelText="Cancel"
        variant="danger"
      /> */}

      <DeleteCaseModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        case={caseData}
      />
    </SettingsContainer>
  );
}

CaseSettings.propTypes = {
  case: PropTypes.object.isRequired,
  caseId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default CaseSettings;
