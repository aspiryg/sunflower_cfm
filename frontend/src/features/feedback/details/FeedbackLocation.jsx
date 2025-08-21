import styled from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineMapPin } from "react-icons/hi2";

import Text from "../../../ui/Text";
import Card from "../../../ui/Card";

const LocationContainer = styled.div`
  padding: var(--spacing-6);
`;

const PlaceholderCard = styled(Card)`
  padding: var(--spacing-8);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
`;

const PlaceholderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  background-color: var(--color-grey-100);
  color: var(--color-grey-400);
  border-radius: 50%;

  svg {
    width: 3rem;
    height: 3rem;
  }
`;

const LocationInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
  padding: var(--spacing-4);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-md);
`;

/**
 * Feedback Location Component (Placeholder)
 *
 * TODO: Will display interactive map, location details, and geographic context
 */
function FeedbackLocation({ feedback, feedbackId }) {
  const hasLocationData =
    feedback.community ||
    feedback.location ||
    (feedback.latitude && feedback.longitude);

  return (
    <LocationContainer>
      <PlaceholderCard>
        <PlaceholderIcon>
          <HiOutlineMapPin />
        </PlaceholderIcon>
        <Text size="lg" weight="semibold" color="muted">
          Interactive Map Coming Soon
        </Text>
        <Text
          size="sm"
          color="muted"
          style={{ maxWidth: "50rem", lineHeight: 1.6 }}
        >
          This section will display an interactive map showing the feedback
          location, nearby facilities, and geographic context to help with
          service planning.
        </Text>

        {hasLocationData && (
          <LocationInfo>
            <Text size="sm" weight="semibold">
              Current Location Data:
            </Text>
            {feedback.community && (
              <Text size="sm">Community: {feedback.community.name}</Text>
            )}
            {feedback.location && (
              <Text size="sm">Location: {feedback.location}</Text>
            )}
            {feedback.latitude && feedback.longitude && (
              <Text size="sm">
                Coordinates: {feedback.latitude}, {feedback.longitude}
              </Text>
            )}
          </LocationInfo>
        )}
      </PlaceholderCard>
    </LocationContainer>
  );
}

FeedbackLocation.propTypes = {
  feedback: PropTypes.object.isRequired,
  feedbackId: PropTypes.string.isRequired,
};

export default FeedbackLocation;
