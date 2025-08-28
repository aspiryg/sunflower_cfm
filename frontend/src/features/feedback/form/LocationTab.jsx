import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineMapPin,
  HiOutlineGlobeAmericas,
  HiOutlineInformationCircle,
  HiBuildingOffice2,
} from "react-icons/hi2";

import FormField, { Textarea } from "../../../ui/FormField";
import Input from "../../../ui/Input";
import StyledSelect from "../../../ui/StyledSelect";
import Text from "../../../ui/Text";
import Heading from "../../../ui/Heading";
import Column from "../../../ui/Column";

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  max-width: 90rem;
  padding: var(--spacing-8);

  @media (max-width: 768px) {
    padding: var(--spacing-6);
    gap: var(--spacing-6);
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding-bottom: var(--spacing-4);
  border-bottom: 2px solid var(--color-grey-200);
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-400)
  );
  border-radius: var(--border-radius-md);
  color: var(--color-grey-0);
  flex-shrink: 0;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
`;

const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(32rem, 1fr));
  gap: var(--spacing-5);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
`;

const CoordinatesGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
`;

const InfoCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  background: linear-gradient(
    135deg,
    var(--color-info-25),
    var(--color-info-50)
  );
  border: 1px solid var(--color-info-200);
  border-left: 4px solid var(--color-info-500);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  color: var(--color-info-700);
`;

const CoordinateCard = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-success-25),
    var(--color-success-50)
  );
  border: 1px solid var(--color-success-200);
  border-left: 4px solid var(--color-success-500);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  color: var(--color-success-700);
  margin-top: var(--spacing-3);
`;

const CoordinateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius-md);
  font-family: "Courier New", monospace;
  font-weight: var(--font-weight-medium);
`;

/**
 * Enhanced Location & Context Tab Component
 * Handles geographic information with improved UX and visual feedback
 */
function LocationTab({
  control,
  errors,
  watch,
  formOptions,
  isLoading = false,
}) {
  // Extract communities from form options
  const { communities = [] } = formOptions || {};

  // Watch coordinates for validation and display
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const community = watch("community");

  // Get selected community for additional context
  const selectedCommunity = communities.find(
    (c) => c.id === parseInt(community)
  );

  // Validate coordinates
  const hasValidCoordinates =
    latitude &&
    longitude &&
    !isNaN(parseFloat(latitude)) &&
    !isNaN(parseFloat(longitude)) &&
    parseFloat(latitude) >= -90 &&
    parseFloat(latitude) <= 90 &&
    parseFloat(longitude) >= -180 &&
    parseFloat(longitude) <= 180;

  return (
    <TabContainer aria-label="Location & Context Information">
      {/* Important Notice */}
      <InfoCard>
        <HiOutlineInformationCircle
          size={20}
          style={{ marginTop: "2px", flexShrink: 0 }}
        />
        <Column gap={1}>
          <Text size="sm" weight="semibold">
            Location Information Guidelines
          </Text>
          <Text size="sm">
            Provide as much location context as possible to help with case
            routing, analysis, and response coordination. Geographic data helps
            identify patterns and improve service delivery.
          </Text>
        </Column>
      </InfoCard>

      {/* Administrative Location */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiBuildingOffice2 />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Administrative Location
            </Heading>
            <Text size="sm" color="muted">
              Specify the administrative area or community where this case
              originated
            </Text>
          </SectionContent>
        </SectionHeader>

        <Controller
          name="community"
          control={control}
          render={({ field }) => (
            <FormField
              label="Community/Area"
              error={errors.community?.message}
              helpText="Select the community, village, or administrative area where the feedback was received"
            >
              <StyledSelect
                {...field}
                $hasError={!!errors.community}
                disabled={isLoading}
                placeholder="Select a community or area..."
                options={[
                  { value: "", label: "Select community...", disabled: true },
                  ...communities.map((community) => ({
                    value: community.id,
                    label: community.name,
                    description:
                      community.description ||
                      `${community.type || "Community"} - ${
                        community.region || "Unknown region"
                      }`,
                  })),
                ]}
                onChange={(value) => field.onChange(parseInt(value) || "")}
              />
            </FormField>
          )}
        />

        {/* Selected Community Info */}
        {selectedCommunity && (
          <InfoCard>
            <HiBuildingOffice2
              size={20}
              style={{ marginTop: "2px", flexShrink: 0 }}
            />
            <Column gap={1}>
              <Text size="sm" weight="semibold">
                {selectedCommunity.name}
              </Text>
              <Text size="sm">
                {selectedCommunity.type && `Type: ${selectedCommunity.type}`}
                {selectedCommunity.region &&
                  ` • Region: ${selectedCommunity.region}`}
                {selectedCommunity.population &&
                  ` • Population: ${selectedCommunity.population.toLocaleString()}`}
              </Text>
              {selectedCommunity.description && (
                <Text size="sm" style={{ marginTop: "var(--spacing-1)" }}>
                  {selectedCommunity.description}
                </Text>
              )}
            </Column>
          </InfoCard>
        )}
      </Section>

      {/* Specific Location Details */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineMapPin />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Specific Location
            </Heading>
            <Text size="sm" color="muted">
              Detailed location information and address details
            </Text>
          </SectionContent>
        </SectionHeader>

        <Controller
          name="location"
          control={control}
          rules={{
            maxLength: {
              value: 500,
              message: "Location description cannot exceed 500 characters",
            },
          }}
          render={({ field }) => (
            <FormField
              label="Location Description"
              error={errors.location?.message}
              helpText="Describe the specific location where feedback was received (building, landmark, area description)"
            >
              <Textarea
                {...field}
                placeholder="Describe the specific location..."
                $variant={errors.location ? "error" : "default"}
                rows={4}
                disabled={isLoading}
                maxLength={500}
              />
              <Text
                size="xs"
                color="muted"
                style={{ marginTop: "var(--spacing-1)" }}
              >
                {field.value?.length || 0}/500 characters
              </Text>
            </FormField>
          )}
        />
      </Section>

      {/* Geographic Coordinates */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineGlobeAmericas />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Geographic Coordinates
            </Heading>
            <Text size="sm" color="muted">
              Precise GPS coordinates for mapping, analysis, and service
              planning
            </Text>
          </SectionContent>
        </SectionHeader>

        <CoordinatesGroup>
          <Controller
            name="latitude"
            control={control}
            rules={{
              min: {
                value: -90,
                message: "Latitude must be between -90 and 90",
              },
              max: {
                value: 90,
                message: "Latitude must be between -90 and 90",
              },
              validate: (value) => {
                if (value === "" || value === null || value === undefined)
                  return true;
                const num = Number(value);
                if (isNaN(num)) return "Please enter a valid number";
                return true;
              },
            }}
            render={({ field }) => (
              <FormField
                label="Latitude"
                error={errors.latitude?.message}
                helpText="North-South position (-90 to 90)"
              >
                <Input
                  {...field}
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="e.g., 1.2921"
                  $variant={errors.latitude ? "error" : "default"}
                  disabled={isLoading}
                  leftIcon={<HiOutlineGlobeAmericas />}
                />
              </FormField>
            )}
          />

          <Controller
            name="longitude"
            control={control}
            rules={{
              min: {
                value: -180,
                message: "Longitude must be between -180 and 180",
              },
              max: {
                value: 180,
                message: "Longitude must be between -180 and 180",
              },
              validate: (value) => {
                if (value === "" || value === null || value === undefined)
                  return true;
                const num = Number(value);
                if (isNaN(num)) return "Please enter a valid number";
                return true;
              },
            }}
            render={({ field }) => (
              <FormField
                label="Longitude"
                error={errors.longitude?.message}
                helpText="East-West position (-180 to 180)"
              >
                <Input
                  {...field}
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="e.g., 36.8219"
                  $variant={errors.longitude ? "error" : "default"}
                  disabled={isLoading}
                  leftIcon={<HiOutlineGlobeAmericas />}
                />
              </FormField>
            )}
          />
        </CoordinatesGroup>

        {/* Coordinate Display and Validation */}
        {hasValidCoordinates && (
          <CoordinateCard>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-2)",
              }}
            >
              <HiOutlineMapPin size={20} />
              <Text size="sm" weight="semibold">
                Coordinates Validated
              </Text>
            </div>
            <CoordinateDisplay>
              <Text size="sm" weight="medium">
                📍 {parseFloat(latitude).toFixed(6)},{" "}
                {parseFloat(longitude).toFixed(6)}
              </Text>
            </CoordinateDisplay>
            <Text size="xs" style={{ marginTop: "var(--spacing-2)" }}>
              These coordinates appear valid and can be used for mapping and
              geographic analysis.
            </Text>
          </CoordinateCard>
        )}

        {(latitude || longitude) && !hasValidCoordinates && (
          <InfoCard
            style={{
              background:
                "linear-gradient(135deg, var(--color-warning-25), var(--color-warning-50))",
              borderColor: "var(--color-warning-200)",
              borderLeftColor: "var(--color-warning-500)",
              color: "var(--color-warning-700)",
            }}
          >
            <HiOutlineInformationCircle
              size={20}
              style={{ marginTop: "2px", flexShrink: 0 }}
            />
            <Column gap={1}>
              <Text size="sm" weight="semibold">
                Coordinate Validation
              </Text>
              <Text size="sm">
                Please provide both latitude and longitude for complete
                coordinate information. Ensure values are within valid ranges
                (latitude: -90 to 90, longitude: -180 to 180).
              </Text>
            </Column>
          </InfoCard>
        )}

        {/* General info about coordinates */}
        <InfoCard>
          <HiOutlineInformationCircle
            size={20}
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <Column gap={1}>
            <Text size="sm" weight="semibold">
              How to obtain GPS coordinates
            </Text>
            <Text size="sm">
              <strong>Mobile Apps:</strong> GPS Coordinates, What3Words, Maps.me
              <br />
              <strong>Google Maps:</strong> Right-click location and copy
              coordinates
              <br />
              <strong>Smartphone:</strong> Use built-in location services or
              compass app
              <br />
              <strong>GPS Devices:</strong> Handheld GPS units or vehicle
              navigation systems
            </Text>
            <Text size="xs" style={{ marginTop: "var(--spacing-2)" }}>
              💡 <strong>Tip:</strong> Coordinates help identify service gaps,
              plan responses, and track geographic patterns in feedback.
            </Text>
          </Column>
        </InfoCard>
      </Section>
    </TabContainer>
  );
}

LocationTab.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  formOptions: PropTypes.shape({
    communities: PropTypes.array,
  }),
  isLoading: PropTypes.bool,
};

export default LocationTab;
