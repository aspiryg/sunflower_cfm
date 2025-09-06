import { useState, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineHome,
  HiBuildingOffice2,
  HiOutlineMap,
  HiOutlinePencil,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCamera,
  HiOutlineDocumentText,
  HiOutlineClipboard,
} from "react-icons/hi2";

import Card from "../../../ui/Card";
import Text from "../../../ui/Text";
import Heading from "../../../ui/Heading";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import Textarea from "../../../ui/Textarea";
import StyledSelect from "../../../ui/StyledSelect";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import StatusBadge from "../../../ui/StatusBadge";
import InfoCard from "../../../ui/InfoCard";

import { useUpdateCase } from "../useCase";
import { useGeographicHierarchy } from "../useCaseData";
import { useAuth } from "../../../contexts/AuthContext";
import { useRoleBasedAuth } from "../../../hooks/useRoleBasedAuth";
import { formatDate } from "../../../utils/dateUtils";
import { getUserDisplayName } from "../../../utils/userUtils";

const LocationContainer = styled.div`
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

const LocationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
`;

const LocationSection = styled(Card)`
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
      case "administrative":
        return "linear-gradient(135deg, var(--color-blue-100), var(--color-blue-200))";
      case "geographic":
        return "linear-gradient(135deg, var(--color-green-100), var(--color-green-200))";
      case "details":
        return "linear-gradient(135deg, var(--color-purple-100), var(--color-purple-200))";
      case "map":
        return "linear-gradient(135deg, var(--color-orange-100), var(--color-orange-200))";
      case "attachments":
        return "linear-gradient(135deg, var(--color-indigo-100), var(--color-indigo-200))";
      default:
        return "linear-gradient(135deg, var(--color-grey-100), var(--color-grey-200))";
    }
  }};
  color: ${(props) => {
    switch (props.$variant) {
      case "administrative":
        return "var(--color-blue-600)";
      case "geographic":
        return "var(--color-green-600)";
      case "details":
        return "var(--color-purple-600)";
      case "map":
        return "var(--color-orange-600)";
      case "attachments":
        return "var(--color-indigo-600)";
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-4);
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const FieldLabel = styled(Text)`
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-700);
`;

const FieldDescription = styled(Text)`
  color: var(--color-grey-500);
  line-height: 1.4;
`;

const HierarchyDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const HierarchyLevel = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2);
  background: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-100);
`;

const LevelIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: var(--border-radius-sm);
  background: var(--color-brand-100);
  color: var(--color-brand-600);
  flex-shrink: 0;

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const LevelContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const CoordinatesDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-blue-25);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  font-family: var(--font-mono);
`;

const CoordinatesText = styled(Text)`
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: var(--color-blue-700);
`;

const MapPlaceholder = styled.div`
  height: 300px;
  background: linear-gradient(
    135deg,
    var(--color-grey-50),
    var(--color-grey-100)
  );
  border: 2px dashed var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  color: var(--color-grey-500);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background: linear-gradient(
      135deg,
      var(--color-blue-25),
      var(--color-blue-50)
    );
    border-color: var(--color-blue-300);
    color: var(--color-blue-600);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-top: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-blue-25);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
`;

const EditActions = styled.div`
  display: flex;
  gap: var(--spacing-2);
  justify-content: flex-end;
  margin-top: var(--spacing-3);
`;

const AttachmentPlaceholder = styled.div`
  padding: var(--spacing-4);
  background: linear-gradient(
    135deg,
    var(--color-indigo-25),
    var(--color-indigo-50)
  );
  border: 2px dashed var(--color-indigo-300);
  border-radius: var(--border-radius-lg);
  text-align: center;
  color: var(--color-indigo-700);
`;

/**
 * Case Location Component
 *
 * Comprehensive location management for cases including administrative
 * hierarchy, geographic coordinates, location details, and visual mapping
 */
function CaseLocation({ case: caseData, caseId, onRefresh }) {
  const { user: currentUser } = useAuth();
  const { hasRole } = useRoleBasedAuth();

  // Initialize geographic hierarchy with current case data
  const {
    regionOptions,
    governorateOptions,
    communityOptions,
    prefetchGovernoratesForRegion,
    prefetchCommunitiesForGovernorate,
    isLoading: geoLoading,
  } = useGeographicHierarchy({
    regionId: caseData?.region?.id,
    governorateId: caseData?.governorate?.id,
  });

  // Local state for location editing
  const [isEditing, setIsEditing] = useState(false);
  const [locationData, setLocationData] = useState({
    regionId: caseData?.region?.id || "",
    governorateId: caseData?.governorate?.id || "",
    communityId: caseData?.community?.id || "",
    location: caseData?.location || "",
    coordinates: caseData?.coordinates || "",
    locationNotes: caseData?.locationNotes || "",
  });

  const updateCaseMutation = useUpdateCase({
    onSuccess: () => {
      setIsEditing(false);
      if (onRefresh) onRefresh();
    },
  });

  // Permission checks
  const canEditLocation = hasRole("staff");

  // Handle location field changes
  const handleLocationChange = (field, value) => {
    setLocationData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear dependent fields when parent changes
    if (field === "regionId") {
      setLocationData((prev) => ({
        ...prev,
        governorateId: "",
        communityId: "",
      }));
      if (value) {
        prefetchGovernoratesForRegion(value);
      }
    } else if (field === "governorateId") {
      setLocationData((prev) => ({
        ...prev,
        communityId: "",
      }));
      if (value) {
        prefetchCommunitiesForGovernorate(value);
      }
    }
  };

  // Save location changes
  const handleSaveLocation = async () => {
    if (updateCaseMutation.isLoading) return;

    try {
      await updateCaseMutation.mutateAsync({
        caseId: caseId,
        caseData: locationData,
      });
    } catch (error) {
      console.error("Failed to save location:", error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setLocationData({
      regionId: caseData?.region?.id || "",
      governorateId: caseData?.governorate?.id || "",
      communityId: caseData?.community?.id || "",
      location: caseData?.location || "",
      coordinates: caseData?.coordinates || "",
      locationNotes: caseData?.locationNotes || "",
    });
    setIsEditing(false);
  };

  // Format coordinates for display
  const formatCoordinates = (coords) => {
    if (!coords) return null;
    const parts = coords.split(",").map((part) => part.trim());
    if (parts.length === 2) {
      const [lat, lng] = parts;
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    return null;
  };

  const coordinates = formatCoordinates(caseData?.coordinates);

  if (!caseData) {
    return (
      <LocationContainer>
        <LoadingSpinner size="large" />
        <Text size="lg" color="muted">
          Loading location data...
        </Text>
      </LocationContainer>
    );
  }

  return (
    <LocationContainer>
      <LocationGrid>
        {/* Administrative Hierarchy */}
        <LocationSection>
          <SectionHeader>
            <SectionIcon $variant="administrative">
              <HiBuildingOffice2 />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Administrative Hierarchy
            </SectionTitle>
          </SectionHeader>

          {!isEditing ? (
            <div>
              <HierarchyDisplay>
                <HierarchyLevel>
                  <LevelIcon>
                    <HiOutlineGlobeAlt />
                  </LevelIcon>
                  <LevelContent>
                    <Text size="xs" weight="medium" color="muted">
                      Region
                    </Text>
                    <Text size="sm" weight="semibold">
                      {caseData.region?.name || "Not specified"}
                    </Text>
                  </LevelContent>
                </HierarchyLevel>

                <HierarchyLevel>
                  <LevelIcon>
                    <HiOutlineMap />
                  </LevelIcon>
                  <LevelContent>
                    <Text size="xs" weight="medium" color="muted">
                      Governorate
                    </Text>
                    <Text size="sm" weight="semibold">
                      {caseData.governorate?.name || "Not specified"}
                    </Text>
                  </LevelContent>
                </HierarchyLevel>

                <HierarchyLevel>
                  <LevelIcon>
                    <HiOutlineHome />
                  </LevelIcon>
                  <LevelContent>
                    <Text size="xs" weight="medium" color="muted">
                      Community
                    </Text>
                    <Text size="sm" weight="semibold">
                      {caseData.community?.name || "Not specified"}
                    </Text>
                  </LevelContent>
                </HierarchyLevel>
              </HierarchyDisplay>

              {canEditLocation && (
                <ActionButtons>
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={() => setIsEditing(true)}
                  >
                    <HiOutlinePencil />
                    Edit Location
                  </Button>
                </ActionButtons>
              )}
            </div>
          ) : (
            <EditForm>
              <FormGrid>
                <FormField>
                  <FieldLabel size="sm">Region</FieldLabel>
                  <StyledSelect
                    value={locationData.regionId}
                    onChange={(value) =>
                      handleLocationChange("regionId", value)
                    }
                    options={regionOptions}
                    placeholder="Select region"
                    isLoading={geoLoading}
                  />
                </FormField>

                <FormField>
                  <FieldLabel size="sm">Governorate</FieldLabel>
                  <StyledSelect
                    value={locationData.governorateId}
                    onChange={(value) =>
                      handleLocationChange("governorateId", value)
                    }
                    options={governorateOptions}
                    placeholder="Select governorate"
                    disabled={!locationData.regionId}
                    isLoading={geoLoading}
                  />
                </FormField>

                <FormField>
                  <FieldLabel size="sm">Community</FieldLabel>
                  <StyledSelect
                    value={locationData.communityId}
                    onChange={(value) =>
                      handleLocationChange("communityId", value)
                    }
                    options={communityOptions}
                    placeholder="Select community"
                    disabled={!locationData.governorateId}
                    isLoading={geoLoading}
                  />
                </FormField>
              </FormGrid>

              <EditActions>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleCancelEdit}
                  disabled={updateCaseMutation.isLoading}
                >
                  <HiOutlineXCircle />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleSaveLocation}
                  loading={updateCaseMutation.isLoading}
                >
                  <HiOutlineCheckCircle />
                  Save Location
                </Button>
              </EditActions>
            </EditForm>
          )}
        </LocationSection>

        {/* Geographic Coordinates */}
        <LocationSection>
          <SectionHeader>
            <SectionIcon $variant="geographic">
              <HiOutlineMapPin />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Geographic Coordinates
            </SectionTitle>
          </SectionHeader>

          {coordinates ? (
            <div>
              <CoordinatesDisplay>
                <HiOutlineMapPin
                  size={20}
                  style={{ color: "var(--color-blue-600)" }}
                />
                <div style={{ flex: 1 }}>
                  <CoordinatesText weight="semibold">
                    {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </CoordinatesText>
                  <Text size="xs" color="muted">
                    Latitude: {coordinates.lat.toFixed(6)} • Longitude:{" "}
                    {coordinates.lng.toFixed(6)}
                  </Text>
                </div>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
                    window.open(url, "_blank");
                  }}
                >
                  <HiOutlineArrowTopRightOnSquare />
                  View on Map
                </Button>
              </CoordinatesDisplay>

              {isEditing && (
                <div style={{ marginTop: "var(--spacing-3)" }}>
                  <FormField>
                    <FieldLabel size="sm">Coordinates</FieldLabel>
                    <FieldDescription size="xs">
                      Enter coordinates as "latitude, longitude" (e.g., 33.8869,
                      35.5131)
                    </FieldDescription>
                    <Input
                      value={locationData.coordinates}
                      onChange={(e) =>
                        handleLocationChange("coordinates", e.target.value)
                      }
                      placeholder="33.8869, 35.5131"
                      disabled={updateCaseMutation.isLoading}
                    />
                  </FormField>
                </div>
              )}
            </div>
          ) : (
            <div>
              <InfoCard variant="info" size="medium">
                <Text size="sm">
                  No geographic coordinates have been recorded for this case
                  location.
                </Text>
              </InfoCard>

              {isEditing && (
                <div style={{ marginTop: "var(--spacing-3)" }}>
                  <FormField>
                    <FieldLabel size="sm">Add Coordinates</FieldLabel>
                    <FieldDescription size="xs">
                      Enter coordinates as "latitude, longitude" (e.g., 33.8869,
                      35.5131)
                    </FieldDescription>
                    <Input
                      value={locationData.coordinates}
                      onChange={(e) =>
                        handleLocationChange("coordinates", e.target.value)
                      }
                      placeholder="33.8869, 35.5131"
                      disabled={updateCaseMutation.isLoading}
                    />
                  </FormField>
                </div>
              )}
            </div>
          )}
        </LocationSection>

        {/* Location Details */}
        <LocationSection>
          <SectionHeader>
            <SectionIcon $variant="details">
              <HiOutlineDocumentText />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Location Details
            </SectionTitle>
          </SectionHeader>

          <FormGrid>
            <FormField>
              <FieldLabel size="sm">Specific Location</FieldLabel>
              <FieldDescription size="xs">
                Detailed description of the specific location within the
                community
              </FieldDescription>
              {!isEditing ? (
                <Text
                  size="sm"
                  style={{
                    padding: "var(--spacing-3)",
                    background: "var(--color-grey-25)",
                    borderRadius: "var(--border-radius-md)",
                    border: "1px solid var(--color-grey-200)",
                  }}
                >
                  {caseData.location || "No specific location provided"}
                </Text>
              ) : (
                <Textarea
                  value={locationData.location}
                  onChange={(e) =>
                    handleLocationChange("location", e.target.value)
                  }
                  placeholder="e.g., Building 5, Apartment 12, Near the water pump station..."
                  rows={3}
                  disabled={updateCaseMutation.isLoading}
                />
              )}
            </FormField>

            <FormField>
              <FieldLabel size="sm">Location Notes</FieldLabel>
              <FieldDescription size="xs">
                Additional notes about accessing or identifying this location
              </FieldDescription>
              {!isEditing ? (
                <Text
                  size="sm"
                  style={{
                    padding: "var(--spacing-3)",
                    background: "var(--color-grey-25)",
                    borderRadius: "var(--border-radius-md)",
                    border: "1px solid var(--color-grey-200)",
                  }}
                >
                  {caseData.locationNotes || "No additional location notes"}
                </Text>
              ) : (
                <Textarea
                  value={locationData.locationNotes}
                  onChange={(e) =>
                    handleLocationChange("locationNotes", e.target.value)
                  }
                  placeholder="e.g., Access through the main gate, ask for directions at the community center..."
                  rows={3}
                  disabled={updateCaseMutation.isLoading}
                />
              )}
            </FormField>
          </FormGrid>
        </LocationSection>

        {/* Visual Map */}
        <LocationSection>
          <SectionHeader>
            <SectionIcon $variant="map">
              <HiOutlineMap />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Visual Map
            </SectionTitle>
          </SectionHeader>

          <MapPlaceholder
            onClick={() => {
              if (coordinates) {
                const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
                window.open(url, "_blank");
              }
            }}
          >
            <HiOutlineMap size={48} />
            <Text size="sm" weight="semibold">
              {coordinates
                ? "Click to View on Google Maps"
                : "Interactive Map Coming Soon"}
            </Text>
            <Text
              size="xs"
              color="muted"
              style={{ textAlign: "center", maxWidth: "300px" }}
            >
              {coordinates
                ? "Click to open this location in Google Maps in a new tab"
                : "Interactive map integration will be available in a future update"}
            </Text>
          </MapPlaceholder>
        </LocationSection>

        {/* Location Attachments (Future Feature) */}
        <LocationSection>
          <SectionHeader>
            <SectionIcon $variant="attachments">
              <HiOutlineCamera />
            </SectionIcon>
            <SectionTitle as="h3" size="h4">
              Location Attachments
            </SectionTitle>
          </SectionHeader>

          <AttachmentPlaceholder>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--spacing-3)",
              }}
            >
              <HiOutlineCamera size={32} />
              <Text size="sm" weight="semibold">
                Photo Attachments Coming Soon
              </Text>
              <Text
                size="xs"
                color="muted"
                style={{ textAlign: "center", maxWidth: "300px" }}
              >
                Ability to attach photos and documents related to the case
                location will be available in a future update.
              </Text>
            </div>
          </AttachmentPlaceholder>
        </LocationSection>
      </LocationGrid>

      {/* Location Metadata */}
      <LocationSection>
        <SectionHeader>
          <SectionIcon $variant="details">
            <HiOutlineInformationCircle />
          </SectionIcon>
          <SectionTitle as="h3" size="h4">
            Location Metadata
          </SectionTitle>
        </SectionHeader>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--spacing-4)",
            padding: "var(--spacing-4)",
            background: "var(--color-grey-25)",
            borderRadius: "var(--border-radius-md)",
            border: "1px solid var(--color-grey-200)",
          }}
        >
          <div>
            <Text size="xs" weight="medium" color="muted">
              Location Last Updated
            </Text>
            <Text size="sm" weight="semibold">
              {formatDate(caseData.updatedAt)}
            </Text>
          </div>
          <div>
            <Text size="xs" weight="medium" color="muted">
              Updated By
            </Text>
            <Text size="sm" weight="semibold">
              {getUserDisplayName(caseData.updatedBy) || "System"}
            </Text>
          </div>
          <div>
            <Text size="xs" weight="medium" color="muted">
              Location Status
            </Text>
            <StatusBadge
              content={coordinates ? "Verified" : "Pending"}
              variant={coordinates ? "success" : "warning"}
              size="sm"
            />
          </div>
          <div>
            <Text size="xs" weight="medium" color="muted">
              Precision Level
            </Text>
            <Text size="sm" weight="semibold">
              {coordinates ? "GPS Coordinates" : "Administrative Only"}
            </Text>
          </div>
        </div>
      </LocationSection>
    </LocationContainer>
  );
}

CaseLocation.propTypes = {
  case: PropTypes.object.isRequired,
  caseId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default CaseLocation;
