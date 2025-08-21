import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineCog6Tooth,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineExclamationTriangle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArchiveBox,
} from "react-icons/hi2";

import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import StatusBadge from "../../../ui/StatusBadge";
import Button from "../../../ui/Button";
import Switch from "../../../ui/Switch";
// import Select from "../../../ui/Select";
// import TextArea from "../../../ui/TextArea";
import { useUpdateFeedback } from "../useFeedback";

const SettingsContainer = styled.div`
  padding: var(--spacing-6);
  max-width: 90rem;

  @media (max-width: 768px) {
    padding: var(--spacing-4);
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

const SettingsCard = styled(Card)`
  padding: var(--spacing-5);

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const CardIcon = styled.div`
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

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-25);

  &:hover {
    background-color: var(--color-grey-50);
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SettingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
`;

const DangerZone = styled(Card)`
  padding: var(--spacing-5);
  border: 1px solid var(--color-error-200);
  background-color: var(--color-error-25);
  grid-column: 1 / -1;

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const DangerActions = styled.div`
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const SaveActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    flex-direction: column-reverse;
  }
`;

const TagsInput = styled.div`
  color: var(--color-grey-700);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: var(--color-brand-600);
  cursor: pointer;
  padding: 0;
  width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background-color: var(--color-brand-200);
  }
`;

/**
 * Feedback Settings Component
 *
 * Provides interface for managing privacy settings, permissions, and advanced options
 */
function FeedbackSettings({ feedback, feedbackId, onEdit, onDelete }) {
  const [settings, setSettings] = useState({
    isSensitive: feedback.isSensitive || false,
    isAnonymized: feedback.isAnonymized || false,
    isPublic: feedback.isPublic || false,
    isActive: feedback.isActive !== false, // Default to true if not specified
    tags: feedback.tags
      ? feedback.tags.split(",").map((tag) => tag.trim())
      : [],
    newTag: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateMutation = useUpdateFeedback({
    onSuccess: () => {
      setHasChanges(false);
    },
  });

  // Handle setting changes
  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  // Handle tag management
  const handleAddTag = () => {
    const newTag = settings.newTag.trim();
    if (newTag && !settings.tags.includes(newTag)) {
      handleSettingChange("tags", [...settings.tags, newTag]);
      setSettings((prev) => ({ ...prev, newTag: "" }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    handleSettingChange(
      "tags",
      settings.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Save changes
  const handleSave = async () => {
    try {
      const updateData = {
        isSensitive: settings.isSensitive,
        isAnonymized: settings.isAnonymized,
        isPublic: settings.isPublic,
        isActive: settings.isActive,
        tags: settings.tags.join(", "),
      };

      await updateMutation.mutateAsync({
        id: feedbackId,
        data: updateData,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleReset = () => {
    setSettings({
      isSensitive: feedback.isSensitive || false,
      isAnonymized: feedback.isAnonymized || false,
      isPublic: feedback.isPublic || false,
      isActive: feedback.isActive !== false,
      tags: feedback.tags
        ? feedback.tags.split(",").map((tag) => tag.trim())
        : [],
      newTag: "",
    });
    setHasChanges(false);
  };

  return (
    <SettingsContainer>
      <SettingsGrid>
        {/* Privacy & Security Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <HiOutlineShieldCheck />
            </CardIcon>
            <Text size="md" weight="semibold">
              Privacy & Security
            </Text>
          </CardHeader>

          <SettingsList>
            <SettingItem>
              <SettingInfo>
                <Text size="sm" weight="medium">
                  Sensitive Content
                </Text>
                <Text size="xs" color="muted">
                  Mark this feedback as containing sensitive information
                </Text>
              </SettingInfo>
              <SettingControl>
                <Switch
                  checked={settings.isSensitive}
                  onChange={(checked) =>
                    handleSettingChange("isSensitive", checked)
                  }
                />
                <StatusBadge
                  content={settings.isSensitive ? "Sensitive" : "Normal"}
                  variant={settings.isSensitive ? "warning" : "success"}
                  size="sm"
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <Text size="sm" weight="medium">
                  Anonymized
                </Text>
                <Text size="xs" color="muted">
                  Remove or hide personal identifying information
                </Text>
              </SettingInfo>
              <SettingControl>
                <Switch
                  checked={settings.isAnonymized}
                  onChange={(checked) =>
                    handleSettingChange("isAnonymized", checked)
                  }
                />
                <StatusBadge
                  content={settings.isAnonymized ? "Anonymous" : "Identified"}
                  variant={settings.isAnonymized ? "info" : "default"}
                  size="sm"
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <Text size="sm" weight="medium">
                  Public Visibility
                </Text>
                <Text size="xs" color="muted">
                  Allow this feedback to be visible in public reports
                </Text>
              </SettingInfo>
              <SettingControl>
                <Switch
                  checked={settings.isPublic}
                  onChange={(checked) =>
                    handleSettingChange("isPublic", checked)
                  }
                />
                {settings.isPublic ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <Text size="sm" weight="medium">
                  Privacy Policy Status
                </Text>
                <Text size="xs" color="muted">
                  Provider's consent to privacy policy
                </Text>
              </SettingInfo>
              <SettingControl>
                <StatusBadge
                  content={
                    feedback.privacyPolicyAccepted ? "Accepted" : "Not Accepted"
                  }
                  variant={feedback.privacyPolicyAccepted ? "success" : "error"}
                  size="privacy"
                />
              </SettingControl>
            </SettingItem>
          </SettingsList>
        </SettingsCard>

        {/* System Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon>
              <HiOutlineCog6Tooth />
            </CardIcon>
            <Text size="md" weight="semibold">
              System Settings
            </Text>
          </CardHeader>

          <SettingsList>
            <SettingItem>
              <SettingInfo>
                <Text size="sm" weight="medium">
                  Active Status
                </Text>
                <Text size="xs" color="muted">
                  Enable or disable this feedback entry
                </Text>
              </SettingInfo>
              <SettingControl>
                <Switch
                  checked={settings.isActive}
                  onChange={(checked) =>
                    handleSettingChange("isActive", checked)
                  }
                />
                <StatusBadge
                  content={settings.isActive ? "Active" : "Inactive"}
                  variant={settings.isActive ? "success" : "error"}
                  size="sm"
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <Text size="sm" weight="medium">
                  Feedback ID
                </Text>
                <Text size="xs" color="muted">
                  Unique system identifier
                </Text>
              </SettingInfo>
              <SettingControl>
                <Text
                  size="sm"
                  color="muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {feedbackId}
                </Text>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <Text size="sm" weight="medium">
                  Creation Date
                </Text>
                <Text size="xs" color="muted">
                  When this feedback was first created
                </Text>
              </SettingInfo>
              <SettingControl>
                <Text size="sm" color="muted">
                  {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <Text size="sm" weight="medium">
                  Last Modified
                </Text>
                <Text size="xs" color="muted">
                  When this feedback was last updated
                </Text>
              </SettingInfo>
              <SettingControl>
                <Text size="sm" color="muted">
                  {new Date(feedback.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </SettingControl>
            </SettingItem>

            {/* Tags Management */}
            <SettingItem
              style={{ flexDirection: "column", alignItems: "stretch" }}
            >
              <SettingInfo>
                <Text size="sm" weight="medium">
                  Tags
                </Text>
                <Text size="xs" color="muted">
                  Add tags to categorize and organize this feedback
                </Text>
              </SettingInfo>

              <TagsInput>
                {settings.tags.length > 0 && (
                  <TagsList>
                    {settings.tags.map((tag, index) => (
                      <Tag key={index}>
                        {tag}
                        <TagRemove onClick={() => handleRemoveTag(tag)}>
                          ×
                        </TagRemove>
                      </Tag>
                    ))}
                  </TagsList>
                )}

                <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                  <input
                    type="text"
                    placeholder="Add new tag..."
                    value={settings.newTag}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        newTag: e.target.value,
                      }))
                    }
                    onKeyPress={handleTagInputKeyPress}
                    style={{
                      flex: 1,
                      padding: "var(--spacing-2)",
                      border: "1px solid var(--color-grey-300)",
                      borderRadius: "var(--border-radius-sm)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleAddTag}
                    disabled={!settings.newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
              </TagsInput>
            </SettingItem>
          </SettingsList>
        </SettingsCard>

        {/* Danger Zone */}
        <DangerZone>
          <CardHeader>
            <CardIcon
              style={{
                backgroundColor: "var(--color-error-100)",
                color: "var(--color-error-600)",
              }}
            >
              <HiOutlineExclamationTriangle />
            </CardIcon>
            <Text size="md" weight="semibold" color="error">
              Danger Zone
            </Text>
          </CardHeader>

          <Text
            size="sm"
            color="muted"
            style={{ marginBottom: "var(--spacing-4)" }}
          >
            These actions are permanent and cannot be undone. Please proceed
            with caution.
          </Text>

          <DangerActions>
            <Button variant="secondary" size="medium" onClick={onEdit}>
              <HiOutlinePencil />
              Edit Feedback
            </Button>

            <Button variant="secondary" size="medium" disabled>
              <HiOutlineArchiveBox />
              Archive Feedback
            </Button>

            <Button variant="danger" size="medium" onClick={onDelete}>
              <HiOutlineTrash />
              Delete Feedback
            </Button>
          </DangerActions>
        </DangerZone>
      </SettingsGrid>

      {/* Save Actions */}
      {hasChanges && (
        <SaveActions>
          <Button
            variant="secondary"
            size="medium"
            onClick={handleReset}
            disabled={updateMutation.isLoading}
          >
            Reset Changes
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={handleSave}
            loading={updateMutation.isLoading}
          >
            Save Settings
          </Button>
        </SaveActions>
      )}

      <Text
        size="xs"
        color="muted"
        style={{ marginTop: "var(--spacing-4)", textAlign: "center" }}
      >
        Contact your system administrator for additional permissions or to
        modify system-level settings.
      </Text>
    </SettingsContainer>
  );
}

FeedbackSettings.propTypes = {
  feedback: PropTypes.object.isRequired,
  feedbackId: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default FeedbackSettings;
