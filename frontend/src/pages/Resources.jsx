// Create this file: /frontend/src/pages/Resources.jsx
import { useState } from "react";
import styled from "styled-components";
import {
  HiOutlineCog8Tooth,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { HiOutlineRefresh } from "react-icons/hi";
// import PageContainer from "../ui/PageContainer";
// import PageHeader from "../ui/PageHeader";
import Heading from "../ui/Heading";
import Text from "../ui/Text";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Switch from "../ui/Switch";
import ResourceBox from "../features/resources/components/ResourceBox";
import {
  useAllFlatResources,
  useUpdateResource,
  RESOURCE_CONFIG,
} from "../features/resources/useResources";

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

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const ControlsSection = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-5);
`;

const ViewControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const ResourcesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(45rem, 1fr));
  gap: var(--spacing-5);

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(40rem, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: var(--spacing-4);
  margin-left: auto;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  min-width: 6rem;
`;

/**
 * Resources Page Component
 *
 * Main page for managing all case supporting resources
 */
function Resources() {
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const {
    categories,
    statuses,
    priorities,
    channels,
    providerTypes,
    isLoading: isLoadingAll,
    isError: hasError,
  } = useAllFlatResources();

  // Get all resources for easy management
  const allResources = {
    categories,
    statuses,
    priorities,
    channels,
    providerTypes,
  };

  // Calculate total stats
  const totalItems = Object.values(allResources).reduce(
    (sum, resource) => sum + (resource?.data?.data?.length || 0),
    0
  );

  const totalActive = Object.values(allResources).reduce(
    (sum, resource) =>
      sum +
      (resource?.data?.data?.filter((item) => item.isActive !== false)
        ?.length || 0),
    0
  );

  const handleRefreshAll = () => {
    Object.values(allResources).forEach((resource) => {
      resource.refetch?.();
    });
  };

  const handleToggleActive = (resourceKey) => {
    return (item) => {
      // This would be implemented with an update resource mutation
      // For now, we'll just log it
      console.log(`Toggle active for ${resourceKey}:`, item.id, !item.isActive);
    };
  };

  const handleEdit = (resourceKey) => {
    return (item) => {
      // This would open an edit modal
      // For now, we'll just log it
      console.log(`Edit ${resourceKey}:`, item);
    };
  };

  const getResourceData = (resourceKey) => {
    const resource = allResources[resourceKey];
    return {
      data:
        resource?.data?.data?.sort((a, b) => a.sortOrder - b.sortOrder) || [],
      isLoading: resource?.isLoading || false,
      error: resource?.error || null,
      refetch: resource?.refetch,
    };
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <Heading as="h1" size="h1">
            Case Resources
          </Heading>
          <Text size="lg" color="muted">
            Manage categories, statuses, priorities, and other case supporting
            resources
          </Text>
        </HeaderContent>

        <HeaderActions>
          <IconButton
            variant="ghost"
            size="medium"
            onClick={handleRefreshAll}
            disabled={isLoadingAll}
            aria-label="Refresh all resources"
          >
            <HiOutlineRefresh />
          </IconButton>

          <Button
            variant="secondary"
            size="medium"
            onClick={() => {
              /* Navigate to advanced settings */
            }}
          >
            <HiOutlineCog8Tooth />
            Advanced Settings
          </Button>
        </HeaderActions>
      </PageHeader>

      {/* Controls Section */}
      <ControlsSection>
        <ViewControls>
          <Text size="sm" weight="medium">
            View Options:
          </Text>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
            }}
          >
            <HiOutlineEye />
            <Switch
              checked={showActiveOnly}
              onChange={setShowActiveOnly}
              size="small"
            />
            <HiOutlineEyeSlash />
            <Text size="sm" color="muted">
              {showActiveOnly ? "Active only" : "Show all"}
            </Text>
          </div>
        </ViewControls>

        <StatsContainer>
          <StatItem>
            <Text size="xs" color="muted">
              Total
            </Text>
            <Text size="lg" weight="bold">
              {totalItems}
            </Text>
          </StatItem>
          <StatItem>
            <Text size="xs" color="muted">
              Active
            </Text>
            <Text size="lg" weight="bold" color="success">
              {totalActive}
            </Text>
          </StatItem>
          <StatItem>
            <Text size="xs" color="muted">
              Inactive
            </Text>
            <Text size="lg" weight="bold" color="secondary">
              {totalItems - totalActive}
            </Text>
          </StatItem>
        </StatsContainer>
      </ControlsSection>

      {/* Error State */}
      {hasError && (
        <div
          style={{
            padding: "var(--spacing-4)",
            background: "var(--color-error-50)",
            border: "1px solid var(--color-error-200)",
            borderRadius: "var(--border-radius-md)",
            marginBottom: "var(--spacing-5)",
          }}
        >
          <Text size="sm" color="error">
            Failed to load some resources. Please try refreshing the page.
          </Text>
        </div>
      )}

      {/* Resources Grid */}
      <ResourcesGrid>
        {Object.entries(RESOURCE_CONFIG).map(([resourceKey, config]) => {
          // Only show flat resources on this page
          if (
            ![
              "categories",
              "statuses",
              "priorities",
              "channels",
              "providerTypes",
            ].includes(resourceKey)
          ) {
            return null;
          }

          const resourceData = getResourceData(resourceKey);

          return (
            <ResourceBox
              key={resourceKey}
              resourceKey={resourceKey}
              title={config.label}
              description={getResourceDescription(resourceKey)}
              data={resourceData.data}
              isLoading={resourceData.isLoading}
              error={resourceData.error}
              onRefresh={resourceData.refetch}
              onEdit={handleEdit(resourceKey)}
              onToggleActive={handleToggleActive(resourceKey)}
              showActiveOnly={showActiveOnly}
              onToggleShowActive={() => setShowActiveOnly(!showActiveOnly)}
            />
          );
        })}
      </ResourcesGrid>
    </PageContainer>
  );
}

// Helper function to get resource descriptions
function getResourceDescription(resourceKey) {
  const descriptions = {
    categories: "Organize cases by type and subject matter",
    statuses: "Track case progression and workflow states",
    priorities: "Define urgency levels and response times",
    channels: "Manage communication and submission channels",
    providerTypes: "Classify service and solution providers",
  };

  return descriptions[resourceKey] || "Manage resource items";
}

export default Resources;
