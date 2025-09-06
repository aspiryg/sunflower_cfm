// Create this file: /frontend/src/features/cases/form/LocationTab.jsx
import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineInformationCircle,
  HiOutlineMap,
} from "react-icons/hi2";

import FormField, { Textarea } from "../../../ui/FormField";
import Input from "../../../ui/Input";
// import Textarea from "../../../ui/Textarea";
import StyledSelect from "../../../ui/StyledSelect";
import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import Row from "../../../ui/Row";
import Column from "../../../ui/Column";
import InfoCard from "../../../ui/InfoCard";
import {
  useRegions,
  useGovernoratesByRegion,
  useCommunitiesByGovernorate,
} from "../useCaseData";

const TabContainer = styled.div`
  padding: var(--spacing-8);

  @media (max-width: 768px) {
    padding: var(--spacing-6);
  }
`;

const TabHeader = styled.div`
  margin-bottom: var(--spacing-6);
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-4);
    text-align: left;
  }
`;

const SectionGrid = styled.div`
  display: grid;
  gap: var(--spacing-6);

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`;

const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const SectionCard = styled(Card)`
  padding: var(--spacing-6);
  border: 1px solid var(--color-grey-200);

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  background: var(--color-brand-100);
  color: var(--color-brand-600);
  border-radius: var(--border-radius-md);

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  gap: var(--spacing-4);

  &.two-columns {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &.three-columns {
    grid-template-columns: repeat(3, 1fr);

    @media (max-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }
`;

const CoordinateInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2);
`;

const LocationPreview = styled.div`
  background: var(--color-grey-25);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  margin-top: var(--spacing-2);
`;

/**
 * LocationTab Component
 *
 * Handles geographic location and contextual information
 * with hierarchical location selection and coordinate input
 */
function LocationTab({
  control,
  watch,
  setValue,
  errors,
  // trigger,
  // isEditing,
  isLoading,
  // formOptions = {},
}) {
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedGovernorateId, setSelectedGovernorateId] = useState("");

  // Watch form values
  const watchedValues = watch([
    "regionId",
    "governorateId",
    "communityId",
    "location",
    "coordinates",
  ]);

  const [regionId, governorateId, communityId, location, coordinates] =
    watchedValues;

  // Fetch geographic hierarchy data
  const { data: regionsData, isLoading: regionsLoading } = useRegions();
  const { data: governoratesData, isLoading: governoratesLoading } =
    useGovernoratesByRegion(selectedRegionId);
  const { data: communitiesData, isLoading: communitiesLoading } =
    useCommunitiesByGovernorate(selectedGovernorateId);

  // Update selected IDs when form values change
  useEffect(() => {
    if (regionId && regionId !== selectedRegionId) {
      setSelectedRegionId(regionId);
      // Clear downstream selections
      setValue("governorateId", "");
      setValue("communityId", "");
      setSelectedGovernorateId("");
    }
  }, [regionId, selectedRegionId, setValue]);

  useEffect(() => {
    if (governorateId && governorateId !== selectedGovernorateId) {
      setSelectedGovernorateId(governorateId);
      // Clear downstream selections
      setValue("communityId", "");
    }
  }, [governorateId, selectedGovernorateId, setValue]);

  // Helper function to parse coordinates
  const parseCoordinates = (coordString) => {
    if (!coordString) return { lat: "", lng: "" };
    const parts = coordString.split(",").map((s) => s.trim());
    return {
      lat: parts[0] || "",
      lng: parts[1] || "",
    };
  };

  // const coordData = parseCoordinates(coordinates);

  // // Helper function to format coordinates
  // const formatCoordinates = (lat, lng) => {
  //   if (!lat || !lng) return "";
  //   return `${lat.trim()}, ${lng.trim()}`;
  // };

  // Form options
  const regionOptions = regionsData?.activeOptions || [];
  const governorateOptions = governoratesData?.activeOptions || [];
  const communityOptions = communitiesData?.activeOptions || [];

  // Build location breadcrumb
  const getLocationBreadcrumb = () => {
    const parts = [];

    const selectedRegion = regionOptions.find((r) => r.value === regionId);
    const selectedGovernorate = governorateOptions.find(
      (g) => g.value === governorateId
    );
    const selectedCommunity = communityOptions.find(
      (c) => c.value === communityId
    );

    if (selectedRegion) parts.push(selectedRegion.label);
    if (selectedGovernorate) parts.push(selectedGovernorate.label);
    if (selectedCommunity) parts.push(selectedCommunity.label);

    return parts.length > 0 ? parts.join(" > ") : "No location selected";
  };

  return (
    <TabContainer>
      <TabHeader>
        <Text size="lg" weight="semibold" color="grey-800">
          Location & Context
        </Text>
        <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
          Geographic location and contextual information about where the case
          occurred
        </Text>
      </TabHeader>

      <SectionGrid>
        {/* Main Content Section */}
        <MainSection>
          {/* Geographic Location Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineGlobeAlt />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Geographic Location
                </Text>
                <Text size="xs" color="muted">
                  Select the administrative location hierarchy
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid className="three-columns">
              {/* Region */}
              <FormField
                label="Region"
                error={errors.regionId?.message}
                helpText="Administrative region"
              >
                <Controller
                  name="regionId"
                  control={control}
                  render={({ field }) => (
                    <StyledSelect
                      {...field}
                      options={[
                        { value: "", label: "Select region..." },
                        ...regionOptions,
                      ]}
                      placeholder="Select region..."
                      disabled={isLoading || regionsLoading}
                      $hasError={!!errors.regionId?.message}
                      size="medium"
                    />
                  )}
                />
              </FormField>

              {/* Governorate */}
              <FormField
                label="Governorate"
                error={errors.governorateId?.message}
                helpText="Governorate within region"
              >
                <Controller
                  name="governorateId"
                  control={control}
                  render={({ field }) => (
                    <StyledSelect
                      {...field}
                      options={[
                        { value: "", label: "Select governorate..." },
                        ...governorateOptions,
                      ]}
                      placeholder="Select governorate..."
                      disabled={
                        isLoading || !selectedRegionId || governoratesLoading
                      }
                      $hasError={!!errors.governorateId?.message}
                      size="medium"
                    />
                  )}
                />
              </FormField>

              {/* Community */}
              <FormField
                label="Community"
                error={errors.communityId?.message}
                helpText="Specific community or locality"
              >
                <Controller
                  name="communityId"
                  control={control}
                  render={({ field }) => (
                    <StyledSelect
                      {...field}
                      options={[
                        { value: "", label: "Select community..." },
                        ...communityOptions,
                      ]}
                      placeholder="Select community..."
                      disabled={
                        isLoading ||
                        !selectedGovernorateId ||
                        communitiesLoading
                      }
                      $hasError={!!errors.communityId?.message}
                      size="medium"
                    />
                  )}
                />
              </FormField>
            </FieldGrid>

            {/* Location Preview */}
            <LocationPreview>
              <Row align="center" gap={2}>
                <HiOutlineMapPin style={{ color: "var(--color-grey-500)" }} />
                <Text size="sm" weight="medium">
                  {getLocationBreadcrumb()}
                </Text>
              </Row>
            </LocationPreview>
          </SectionCard>

          {/* Specific Location Details Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineMapPin />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Specific Location Details
                </Text>
                <Text size="xs" color="muted">
                  Detailed location information and coordinates
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid>
              {/* Location Description */}
              <FormField
                label="Location Description"
                error={errors.location?.message}
                helpText="Specific location or landmark description"
              >
                <Controller
                  name="location"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 255,
                      message:
                        "Location description cannot exceed 255 characters",
                    },
                  }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Describe the specific location where the case occurred...&#10;e.g., 'Near the main entrance of the health center' or 'Community center on Main Street'"
                      disabled={isLoading}
                      $variant={errors.location?.message ? "error" : "default"}
                    />
                  )}
                />
              </FormField>
              {/* Coordinates */}
              <FormField
                label="GPS Coordinates (Optional)"
                error={errors.coordinates?.message}
              >
                <Controller
                  name="coordinates"
                  control={control}
                  rules={{
                    // check if coordinates are in valid format and lat is < 90 and lng is < 180
                    validate: {
                      isValid: (value) => {
                        const { lat, lng } = parseCoordinates(value);
                        if (lat === "" && lng === "") return true; // allow empty
                        if (isNaN(lat) || isNaN(lng)) {
                          return "Coordinates must be valid numbers";
                        }
                        if (lat < -90 || lat > 90) {
                          return "Latitude must be between -90 and 90";
                        }
                        if (lng < -180 || lng > 180) {
                          return "Longitude must be between -180 and 180";
                        }
                        return true;
                      },
                    },
                  }}
                  render={({ field }) => (
                    <Column gap={2}>
                      <CoordinateInputs>
                        <Input
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          placeholder="Latitude"
                          value={parseCoordinates(field.value).lat}
                          onChange={(e) => {
                            const newCoords = `${e.target.value}, ${
                              parseCoordinates(field.value).lng
                            }`;
                            field.onChange(newCoords);
                          }}
                          disabled={isLoading}
                          $variant={
                            errors.coordinates?.message ? "error" : "default"
                          }
                        />
                        <Input
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          placeholder="Longitude"
                          value={parseCoordinates(field.value).lng}
                          onChange={(e) => {
                            const newCoords = `${
                              parseCoordinates(field.value).lat
                            }, ${e.target.value}`;
                            field.onChange(newCoords);
                          }}
                          disabled={isLoading}
                          $variant={
                            errors.coordinates?.message ? "error" : "default"
                          }
                        />
                      </CoordinateInputs>
                      <Text size="xs" color="muted">
                        Example: 31.7683, 35.2137 (Latitude, Longitude)
                      </Text>
                    </Column>
                  )}
                />
              </FormField>
            </FieldGrid>
          </SectionCard>
        </MainSection>

        {/* Side Section - Help and Guidelines */}
        <SideSection>
          {/* Location Guidelines */}
          <InfoCard
            icon={HiOutlineInformationCircle}
            title="Location Guidelines"
            variant="info"
          >
            <Column gap={3}>
              <Text size="sm">
                <strong>Why Location Matters:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">Helps identify service gaps by area</Text>
                </li>
                <li>
                  <Text size="xs">Enables targeted interventions</Text>
                </li>
                <li>
                  <Text size="xs">Supports resource allocation decisions</Text>
                </li>
                <li>
                  <Text size="xs">Facilitates follow-up site visits</Text>
                </li>
              </ul>

              <Text size="sm" style={{ marginTop: "var(--spacing-3)" }}>
                <strong>Location Hierarchy:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">
                    <strong>Region:</strong> Largest administrative division
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Governorate:</strong> Sub-region within a region
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Community:</strong> Local area or village
                  </Text>
                </li>
              </ul>
            </Column>
          </InfoCard>

          {/* GPS Coordinates Help */}
          <InfoCard
            icon={HiOutlineMap}
            title="GPS Coordinates"
            variant="success"
          >
            <Column gap={2}>
              <Text size="sm">
                <strong>Finding Coordinates:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">
                    Use Google Maps: Right-click location → Copy coordinates
                  </Text>
                </li>
                <li>
                  <Text size="xs">Use GPS apps on mobile devices</Text>
                </li>
                <li>
                  <Text size="xs">Ask field staff to record during visits</Text>
                </li>
              </ul>

              <Text size="sm" style={{ marginTop: "var(--spacing-3)" }}>
                <strong>Format:</strong>
              </Text>
              <Text size="xs" color="muted">
                Latitude first, then longitude
                <br />
                Example: 31.7683, 35.2137
              </Text>

              <Text
                size="xs"
                color="muted"
                style={{ marginTop: "var(--spacing-2)" }}
              >
                <strong>Note:</strong> Coordinates are optional but helpful for
                mapping and analysis.
              </Text>
            </Column>
          </InfoCard>

          {/* Current Selection Summary */}
          {(regionId || governorateId || communityId || location) && (
            <InfoCard
              icon={HiOutlineMapPin}
              title="Selected Location"
              variant="warning"
            >
              <Column gap={2}>
                <Text size="sm" weight="semibold">
                  Current Selection:
                </Text>
                <Text size="sm" color="brand">
                  {getLocationBreadcrumb()}
                </Text>

                {location && (
                  <>
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{ marginTop: "var(--spacing-2)" }}
                    >
                      Specific Location:
                    </Text>
                    <Text size="sm">{location}</Text>
                  </>
                )}

                {coordinates && (
                  <>
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{ marginTop: "var(--spacing-2)" }}
                    >
                      Coordinates:
                    </Text>
                    <Text size="sm" style={{ fontFamily: "monospace" }}>
                      {coordinates}
                    </Text>
                  </>
                )}
              </Column>
            </InfoCard>
          )}
        </SideSection>
      </SectionGrid>
    </TabContainer>
  );
}

LocationTab.propTypes = {
  control: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  trigger: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isLoading: PropTypes.bool,
  formOptions: PropTypes.object,
};

export default LocationTab;
