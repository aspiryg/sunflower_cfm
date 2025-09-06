// Create this file: /frontend/src/features/cases/components/CaseInfoSection.jsx
import PropTypes from "prop-types";
import styled from "styled-components";
import Text from "../../../ui/Text";
import StatusBadge from "../../../ui/StatusBadge";
import { getColorStyles } from "../../../utils/caseUtils";
import { getUserDisplayName } from "../../../utils/userUtils";

const CaseSection = styled.div`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const CaseHeader = styled.div`
  margin-bottom: var(--spacing-3);
`;

const CaseRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);

  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Reusable Case Information Display Component
 * Used across various case modals to show consistent case info
 */
function CaseInfoSection({ caseItem, showExtendedInfo = false }) {
  if (!caseItem) return null;

  return (
    <CaseSection>
      <CaseHeader>
        <Text size="sm" weight="semibold" color="muted">
          Case Entry
        </Text>
        <Text size="md" weight="semibold">
          {caseItem.title}
        </Text>
        <Text size="sm" color="muted">
          {caseItem.caseNumber}
        </Text>
      </CaseHeader>

      <CaseRow>
        <Text size="sm" weight="medium" color="muted">
          Status:
        </Text>
        <StatusBadge
          content={caseItem.status?.name || "Unknown"}
          size="sm"
          style={getColorStyles(caseItem.status?.color || "--color-grey-200")}
        />
      </CaseRow>

      <CaseRow>
        <Text size="sm" weight="medium" color="muted">
          Priority:
        </Text>
        <StatusBadge
          content={caseItem.priority?.name || "Unknown"}
          size="sm"
          style={getColorStyles(caseItem.priority?.color || "--color-grey-200")}
        />
      </CaseRow>

      <CaseRow>
        <Text size="sm" weight="medium" color="muted">
          Category:
        </Text>
        <Text size="sm">{caseItem.category?.name || "N/A"}</Text>
      </CaseRow>

      {showExtendedInfo && caseItem.assignedTo && (
        <CaseRow>
          <Text size="sm" weight="medium" color="muted">
            Assigned To:
          </Text>
          <Text size="sm">{getUserDisplayName(caseItem.assignedTo)}</Text>
        </CaseRow>
      )}

      {showExtendedInfo && caseItem.submittedBy && (
        <CaseRow>
          <Text size="sm" weight="medium" color="muted">
            Submitted By:
          </Text>
          <Text size="sm">{getUserDisplayName(caseItem.submittedBy)}</Text>
        </CaseRow>
      )}
    </CaseSection>
  );
}

CaseInfoSection.propTypes = {
  caseItem: PropTypes.shape({
    title: PropTypes.string.isRequired,
    caseNumber: PropTypes.string,
    status: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    priority: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    category: PropTypes.shape({
      name: PropTypes.string,
    }),
    assignedTo: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    submittedBy: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  }),
  showExtendedInfo: PropTypes.bool,
};

export default CaseInfoSection;
