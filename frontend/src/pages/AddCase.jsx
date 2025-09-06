import { useNavigate, useParams, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentText,
  HiOutlineScale,
} from "react-icons/hi2";

import Heading from "../ui/Heading";
import Text from "../ui/Text";
import IconButton from "../ui/IconButton";
import Breadcrumb from "../ui/Breadcrumb";
import CaseForm from "../features/cases/CaseForm";

import { useCase } from "../features/cases/useCase";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: var(--container-2xl);
  margin: 0 auto;
  padding: var(--spacing-0);

  @media (max-width: 768px) {
    gap: var(--spacing-4);
    padding: var(--spacing-0);
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);

  @media (max-width: 768px) {
    gap: var(--spacing-1);
  }
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    gap: var(--spacing-3);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const CaseIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-400)
  );
  border-radius: var(--border-radius-lg);
  color: var(--color-grey-0);
  box-shadow: var(--shadow-md);

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }

  @media (max-width: 640px) {
    width: 4rem;
    height: 4rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

/**
 * AddCase Page Component
 *
 * Clean page component that handles both creating and editing cases
 * All form logic is delegated to the CaseForm component
 * Supports duplication from existing cases via location state
 */
function AddCase() {
  const navigate = useNavigate();
  const { id: caseId } = useParams();
  const location = useLocation();
  const isEditing = !!caseId;

  // Check if duplicating from an existing case
  const duplicateFromCase = location.state?.duplicateFrom;

  // Fetch existing case data if editing
  const { data: existingCase } = useCase(caseId, {
    enabled: isEditing,
  });

  // Build breadcrumb items
  const breadcrumbItems = [
    {
      label: "Case Management",
      to: "/cases",
      icon: HiOutlineScale,
    },
    {
      label: isEditing
        ? `Edit Case ${existingCase?.data?.caseNumber || "#" + caseId}`
        : duplicateFromCase
        ? `Duplicate Case ${duplicateFromCase.caseNumber}`
        : "Create New Case",
      icon: HiOutlineDocumentText,
    },
  ];

  // Handle successful form submission
  const handleFormSuccess = (data, action) => {
    console.log(`Case ${action}d successfully:`, data);

    // Show success message based on action
    if (action === "create") {
      console.log("Case created with ID:", data.data.id);
    } else if (action === "update") {
      console.log("Case updated with ID:", data.data.id);
    }

    // Navigate back to cases list or to the view page
    navigate("/cases");
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    navigate("/cases");
  };

  // Prepare initial data for duplication
  const getInitialData = () => {
    if (duplicateFromCase) {
      // Prepare data for duplication - clear certain fields
      const duplicateData = { ...duplicateFromCase };

      // Clear fields that should be unique for new case
      delete duplicateData.id;
      delete duplicateData.caseNumber;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      delete duplicateData.submittedAt;
      delete duplicateData.assignedAt;
      delete duplicateData.resolvedAt;
      delete duplicateData.resolvedDate;
      delete duplicateData.resolutionSummary;

      // Reset status to open/draft
      duplicateData.statusId = 1;

      // Clear assignment
      delete duplicateData.assignedTo;
      delete duplicateData.assignedBy;
      delete duplicateData.assignmentComments;

      // Update title to indicate it's a copy
      if (duplicateData.title) {
        duplicateData.title = `Copy of ${duplicateData.title}`;
      }

      return duplicateData;
    }

    return null;
  };

  // Determine page title and description
  const getPageTitle = () => {
    if (isEditing) return "Edit Case";
    if (duplicateFromCase) return "Duplicate Case";
    return "Create New Case";
  };

  const getPageDescription = () => {
    if (isEditing) {
      return `Editing case ${
        existingCase?.data?.caseNumber || "#" + caseId
      } - Update case information and processing details`;
    }
    if (duplicateFromCase) {
      return `Creating a new case based on ${duplicateFromCase.caseNumber} - Review and modify the information as needed`;
    }
    return "Create a new case for tracking complaints, feedback, and beneficiary concerns through their resolution lifecycle";
  };

  const getCaseNumber = () => {
    if (isEditing && existingCase?.data?.caseNumber) {
      return existingCase.data.caseNumber;
    }
    if (duplicateFromCase?.caseNumber) {
      return `Based on ${duplicateFromCase.caseNumber}`;
    }
    return null;
  };

  return (
    <PageContainer>
      <PageHeader>
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Title and Description */}
        <HeaderTop>
          <CaseIcon>
            <HiOutlineDocumentText />
          </CaseIcon>

          <HeaderContent>
            <Heading as="h2" size="h1">
              {getPageTitle()}
            </Heading>

            <Text size="md" color="muted">
              {getPageDescription()}
            </Text>

            {getCaseNumber() && (
              <Text size="sm" weight="medium" color="brand">
                Case Number: {getCaseNumber()}
              </Text>
            )}

            {duplicateFromCase && (
              <Text size="xs" color="warning" style={{ marginTop: "4px" }}>
                Note: This is a copy. Review all information before creating the
                new case.
              </Text>
            )}
          </HeaderContent>
        </HeaderTop>
      </PageHeader>

      {/* Case Form */}
      <CaseForm
        caseId={caseId}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
        initialData={getInitialData()}
      />
    </PageContainer>
  );
}

export default AddCase;
