import { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineCog8Tooth,
  HiOutlineGlobeAlt,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowLeft,
} from "react-icons/hi2";
import { HiOutlineRefresh } from "react-icons/hi";
import Heading from "../ui/Heading";
import Text from "../ui/Text";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Breadcrumb from "../ui/Breadcrumb";
import HierarchicalResourceBox from "../features/resources/components/HierarchicalResourceBox";
import {
  useAllHierarchicalResources,
  useRegions,
  usePrograms,
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
  gap: var(--spacing-3);

  @media (max-width: 768px) {
    gap: var(--spacing-2);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    justify-content: space-between;
  }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  background: linear-gradient(
    135deg,
    var(--color-grey-25),
    var(--color-grey-50)
  );
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-1);
`;

const StatsGroup = styled.div`
  display: flex;
  gap: var(--spacing-6);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
`;

const StatValue = styled(Text)`
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
`;

const StatLabel = styled(Text)`
  color: var(--color-grey-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// Full width grid - single column stack
const ResourcesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  width: 100%;
`;

const ErrorContainer = styled.div`
  padding: var(--spacing-4);
  background: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-5);
`;

/**
 * HierarchicalResources Page Component
 *
 * Page for managing geographic and program hierarchies
 */
function HierarchicalResources() {
  const navigate = useNavigate();

  // State management
  const [geographicState, setGeographicState] = useState({
    showActiveOnly: false,
    expandAll: false,
    expandedNodes: new Set(),
  });

  const [programState, setProgramState] = useState({
    showActiveOnly: false,
    expandAll: false,
    expandedNodes: new Set(),
  });

  // Data hooks
  const {
    regions,
    governorates,
    communities,
    programs,
    projects,
    activities,
    isLoading: isLoadingAll,
    isError: hasError,
  } = useAllHierarchicalResources();

  // Individual hooks for refresh functionality
  const regionsQuery = useRegions();
  const programsQuery = usePrograms();

  // Extract data arrays for easy reuse
  const regionsData = useMemo(
    () => regions?.data?.data || [],
    [regions?.data?.data]
  );
  const governoratesData = useMemo(
    () => governorates?.data?.data || [],
    [governorates?.data?.data]
  );
  const communitiesData = useMemo(
    () => communities?.data?.data || [],
    [communities?.data?.data]
  );
  const programsData = useMemo(
    () => programs?.data?.data || [],
    [programs?.data?.data]
  );
  const projectsData = useMemo(
    () => projects?.data?.data || [],
    [projects?.data?.data]
  );
  const activitiesData = useMemo(
    () => activities?.data?.data || [],
    [activities?.data?.data]
  );

  // Build complete 3-level geographic hierarchy
  const buildGeographicHierarchy = useCallback(() => {
    return regionsData.map((region) => {
      // Get governorates for this region
      const regionGovernorates = governoratesData.filter(
        (gov) => gov.regionId === region.id
      );

      // Build governorates with their communities
      const governoratesWithCommunities = regionGovernorates.map(
        (governorate) => {
          const governorateCommunities = communitiesData.filter(
            (community) => community.governorateId === governorate.id
          );

          return {
            ...governorate,
            children: governorateCommunities.map((community) => ({
              ...community,
              children: [],
              isExpanded: false,
              hasChildren: false,
            })),
            isExpanded:
              geographicState.expandAll ||
              geographicState.expandedNodes.has(governorate.id),
            hasChildren: governorateCommunities.length > 0,
          };
        }
      );

      return {
        ...region,
        children: governoratesWithCommunities,
        isExpanded:
          geographicState.expandAll ||
          geographicState.expandedNodes.has(region.id),
        hasChildren: governoratesWithCommunities.length > 0,
      };
    });
  }, [
    regionsData,
    governoratesData,
    communitiesData,
    geographicState.expandAll,
    geographicState.expandedNodes,
  ]);

  // Build complete 3-level program hierarchy
  const buildProgramHierarchy = useCallback(() => {
    return programsData.map((program) => {
      // Get projects for this program
      const programProjects = projectsData.filter(
        (project) => project.programId === program.id
      );

      // Build projects with their activities
      const projectsWithActivities = programProjects.map((project) => {
        const projectActivities = activitiesData.filter(
          (activity) => activity.projectId === project.id
        );

        return {
          ...project,
          children: projectActivities.map((activity) => ({
            ...activity,
            children: [],
            isExpanded: false,
            hasChildren: false,
          })),
          isExpanded:
            programState.expandAll ||
            programState.expandedNodes.has(project.id),
          hasChildren: projectActivities.length > 0,
        };
      });

      return {
        ...program,
        children: projectsWithActivities,
        isExpanded:
          programState.expandAll || programState.expandedNodes.has(program.id),
        hasChildren: projectsWithActivities.length > 0,
      };
    });
  }, [
    programsData,
    projectsData,
    activitiesData,
    programState.expandAll,
    programState.expandedNodes,
  ]);

  const geographicHierarchy = buildGeographicHierarchy();
  const programHierarchy = buildProgramHierarchy();

  // Calculate combined stats from actual data
  const calculateTotalStats = () => {
    const regionCount = regionsData.length;
    const governorateCount = governoratesData.length;
    const communityCount = communitiesData.length;
    const programCount = programsData.length;
    const projectCount = projectsData.length;
    const activityCount = activitiesData.length;

    return {
      geographic: regionCount + governorateCount + communityCount,
      program: programCount + projectCount + activityCount,
      total:
        regionCount +
        governorateCount +
        communityCount +
        programCount +
        projectCount +
        activityCount,
    };
  };

  const stats = calculateTotalStats();

  // Event handlers
  const handleRefreshAll = () => {
    regionsQuery.refetch();
    programsQuery.refetch();
  };

  const handleGeographicRefresh = () => {
    regionsQuery.refetch();
  };

  const handleProgramRefresh = () => {
    programsQuery.refetch();
  };

  const handleGeographicToggleExpand = (nodeId) => {
    setGeographicState((prev) => {
      const newExpanded = new Set(prev.expandedNodes);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return {
        ...prev,
        expandedNodes: newExpanded,
      };
    });
  };

  const handleProgramToggleExpand = (nodeId) => {
    setProgramState((prev) => {
      const newExpanded = new Set(prev.expandedNodes);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return {
        ...prev,
        expandedNodes: newExpanded,
      };
    });
  };

  const handleEdit = (item) => {
    console.log("Edit item:", item);
    // Implementation for editing hierarchical items
  };

  const handleDelete = (item) => {
    console.log("Delete item:", item);
    // Implementation for deleting hierarchical items
  };

  const handleToggleActive = (item) => {
    console.log("Toggle active:", item);
    // Implementation for toggling active status
  };

  const handleAddChild = () => {
    // Refresh the relevant hierarchy after adding a child
    handleRefreshAll();
  };

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Settings",
      to: "/settings",
      icon: HiOutlineCog8Tooth,
    },
    {
      label: "Case Resources",
      to: "/settings/resources",
    },
    {
      label: "Hierarchical Resources",
    },
  ];

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader>
        <HeaderContent>
          <HeaderInfo>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-3)",
              }}
            >
              <IconButton
                variant="ghost"
                size="medium"
                onClick={() => navigate("/settings/resources")}
                aria-label="Back to resources"
              >
                <HiOutlineArrowLeft />
              </IconButton>
              <Heading as="h1" size="h1">
                Hierarchical Resources
              </Heading>
            </div>
            <Text size="lg" color="muted">
              Manage geographic locations and program structures with their
              hierarchical relationships
            </Text>
          </HeaderInfo>

          <HeaderActions>
            <IconButton
              variant="ghost"
              size="medium"
              onClick={handleRefreshAll}
              disabled={isLoadingAll}
              aria-label="Refresh all data"
            >
              <HiOutlineRefresh />
            </IconButton>

            <Button
              variant="secondary"
              size="medium"
              onClick={() => navigate("/settings/resources")}
            >
              Back to Resources
            </Button>
          </HeaderActions>
        </HeaderContent>

        {/* Stats Bar */}
        <StatsBar>
          <StatsGroup>
            <StatItem>
              <StatValue>{stats.geographic}</StatValue>
              <StatLabel size="xs">Geographic Items</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.program}</StatValue>
              <StatLabel size="xs">Program Items</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.total}</StatValue>
              <StatLabel size="xs">Total Items</StatLabel>
            </StatItem>
          </StatsGroup>

          <Text size="sm" color="muted">
            Regions → Governorates → Communities | Programs → Projects →
            Activities
          </Text>
        </StatsBar>
      </PageHeader>

      {/* Error State */}
      {hasError && (
        <ErrorContainer>
          <Text size="sm" color="error">
            Failed to load some hierarchical resources. Please try refreshing
            the page.
          </Text>
        </ErrorContainer>
      )}

      {/* Full Width Hierarchical Resources */}
      <ResourcesGrid>
        {/* Geographic Hierarchy - Full Width */}
        <HierarchicalResourceBox
          resourceType="geographic"
          title="Geographic Hierarchy"
          description="Regions, governorates, and communities structure"
          data={geographicHierarchy}
          isLoading={regionsQuery.isLoading}
          error={regionsQuery.error}
          onRefresh={handleGeographicRefresh}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onToggleExpand={handleGeographicToggleExpand}
          onAddChild={handleAddChild}
          showActiveOnly={geographicState.showActiveOnly}
          onToggleShowActive={() =>
            setGeographicState((prev) => ({
              ...prev,
              showActiveOnly: !prev.showActiveOnly,
            }))
          }
          expandAll={geographicState.expandAll}
          onToggleExpandAll={() =>
            setGeographicState((prev) => ({
              ...prev,
              expandAll: !prev.expandAll,
              expandedNodes: prev.expandAll
                ? new Set()
                : new Set(
                    geographicHierarchy.flatMap((region) => [
                      region.id,
                      ...region.children.map((gov) => gov.id),
                    ])
                  ),
            }))
          }
          rootResourceKey="regions"
        />

        {/* Program Hierarchy - Full Width */}
        <HierarchicalResourceBox
          resourceType="program"
          title="Program Hierarchy"
          description="Programs, projects, and activities structure"
          data={programHierarchy}
          isLoading={programsQuery.isLoading}
          error={programsQuery.error}
          onRefresh={handleProgramRefresh}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onToggleExpand={handleProgramToggleExpand}
          onAddChild={handleAddChild}
          showActiveOnly={programState.showActiveOnly}
          onToggleShowActive={() =>
            setProgramState((prev) => ({
              ...prev,
              showActiveOnly: !prev.showActiveOnly,
            }))
          }
          expandAll={programState.expandAll}
          onToggleExpandAll={() =>
            setProgramState((prev) => ({
              ...prev,
              expandAll: !prev.expandAll,
              expandedNodes: prev.expandAll
                ? new Set()
                : new Set(
                    programHierarchy.flatMap((program) => [
                      program.id,
                      ...program.children.map((project) => project.id),
                    ])
                  ),
            }))
          }
          rootResourceKey="programs"
        />
      </ResourcesGrid>
    </PageContainer>
  );
}

export default HierarchicalResources;
