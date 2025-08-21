import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import FormField, { Input, Select, Textarea } from "../../../ui/FormField";
import Text from "../../../ui/Text";

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: 80rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-grey-200);
`;

const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
`;

const CoordinatesGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBox = styled.div`
  padding: var(--spacing-3);
  background-color: var(--color-blue-25);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-2);
`;

/**
 * Location Tab Component
 * Handles geographic information about where the feedback was received
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

  // Watch latitude and longitude for validation
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  return (
    <TabContainer>
      {/* Community Selection */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Community Information
          </Text>
          <Text size="sm" color="muted">
            Specify the community or area where this feedback was received
          </Text>
        </SectionHeader>

        <Controller
          name="community"
          control={control}
          render={({ field }) => (
            <FormField
              label="Community"
              error={errors.community?.message}
              helpText="Select the community where the feedback originated"
            >
              <Select
                {...field}
                $hasError={!!errors.community}
                disabled={isLoading}
                onChange={(e) => field.onChange(Number(e.target.value) || "")}
              >
                <option value="">Select a community...</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}
        />
      </Section>

      {/* Location Details */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Location Details
          </Text>
          <Text size="sm" color="muted">
            Specific location information and address details
          </Text>
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
              helpText="Describe the specific location where feedback was received (optional)"
            >
              <Textarea
                {...field}
                placeholder="E.g., Health clinic waiting area, Community center main hall, Near the water point..."
                $hasError={!!errors.location}
                rows={3}
                disabled={isLoading}
              />
            </FormField>
          )}
        />
      </Section>

      {/* Geographic Coordinates */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Geographic Coordinates
          </Text>
          <Text size="sm" color="muted">
            Precise GPS coordinates for mapping and analysis (optional)
          </Text>
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
                  $hasError={!!errors.latitude}
                  disabled={isLoading}
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
                  $hasError={!!errors.longitude}
                  disabled={isLoading}
                />
              </FormField>
            )}
          />
        </CoordinatesGroup>

        {/* Coordinate validation info */}
        {(latitude || longitude) && (
          <InfoBox>
            <Text size="sm" weight="medium" color="primary">
              📍 Coordinate Validation
            </Text>
            <Text
              size="xs"
              color="muted"
              style={{ marginTop: "var(--spacing-1)" }}
            >
              {latitude && longitude
                ? `Coordinates: ${latitude}, ${longitude} - Make sure these coordinates are accurate for proper mapping.`
                : "Please provide both latitude and longitude for complete coordinate information."}
            </Text>
          </InfoBox>
        )}

        {/* General info about coordinates */}
        <InfoBox>
          <Text size="sm" weight="medium" color="primary">
            💡 How to get coordinates
          </Text>
          <Text
            size="xs"
            color="muted"
            style={{ marginTop: "var(--spacing-1)" }}
          >
            You can get GPS coordinates from:
            <br />• Mobile apps like GPS Coordinates or What3Words
            <br />• Google Maps (right-click and select coordinates)
            <br />• GPS devices or smartphone location services
          </Text>
        </InfoBox>
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
