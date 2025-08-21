import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi2";
import Text from "../../ui/Text";
import Card from "../../ui/Card";

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: var(--spacing-3);
    margin-bottom: var(--spacing-4);
  }
`;

const SummaryCard = styled(Card)`
  padding: var(--spacing-5);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  transition: transform var(--duration-normal) var(--ease-in-out);

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-4);
    gap: var(--spacing-3);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  border-radius: var(--border-radius-lg);
  flex-shrink: 0;

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }

  ${(props) => {
    switch (props.$variant) {
      case "total":
        return `
          background-color: var(--color-brand-100);
          color: var(--color-brand-600);
        `;
      case "pending":
        return `
          background-color: var(--color-warning-100);
          color: var(--color-warning-600);
        `;
      case "resolved":
        return `
          background-color: var(--color-success-100);
          color: var(--color-success-600);
        `;
      case "urgent":
        return `
          background-color: var(--color-error-100);
          color: var(--color-error-600);
        `;
      default:
        return `
          background-color: var(--color-grey-100);
          color: var(--color-grey-600);
        `;
    }
  }}

  @media (max-width: 480px) {
    width: 4rem;
    height: 4rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
`;

const SummaryValue = styled(Text)`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: var(--font-size-2xl);
  }
`;

const SummaryLabel = styled(Text)`
  color: var(--color-grey-600);
  font-weight: var(--font-weight-medium);
`;

function FeedbackSummary({ feedbackData = [], isLoading = false }) {
  // Calculate summary statistics
  const total = feedbackData.length;
  const pending = feedbackData.filter(
    (feedback) => feedback.status === "pending" || feedback.status === "open"
  ).length;
  const resolved = feedbackData.filter(
    (feedback) => feedback.status === "resolved" || feedback.status === "closed"
  ).length;
  const urgent = feedbackData.filter(
    (feedback) => feedback.priority === "high" || feedback.priority === "urgent"
  ).length;

  const summaryItems = [
    {
      id: "total",
      $variant: "total",
      icon: HiOutlineClipboardDocumentList,
      value: total,
      label: "Total Feedback",
    },
    {
      id: "pending",
      $variant: "pending",
      icon: HiOutlineClock,
      value: pending,
      label: "Pending Review",
    },
    {
      id: "resolved",
      $variant: "resolved",
      icon: HiOutlineCheckCircle,
      value: resolved,
      label: "Resolved",
    },
    {
      id: "urgent",
      $variant: "urgent",
      icon: HiOutlineExclamationTriangle,
      value: urgent,
      label: "High Priority",
    },
  ];

  if (isLoading) {
    return (
      <SummaryGrid>
        {summaryItems.map((item) => (
          <SummaryCard key={item.id}>
            <IconWrapper $variant={item.$variant}>
              <item.icon />
            </IconWrapper>
            <SummaryContent>
              <SummaryValue>--</SummaryValue>
              <SummaryLabel>{item.label}</SummaryLabel>
            </SummaryContent>
          </SummaryCard>
        ))}
      </SummaryGrid>
    );
  }

  return (
    <SummaryGrid>
      {summaryItems.map((item) => (
        <SummaryCard key={item.id}>
          <IconWrapper $variant={item.$variant}>
            <item.icon />
          </IconWrapper>
          <SummaryContent>
            <SummaryValue>{item.value.toLocaleString()}</SummaryValue>
            <SummaryLabel>{item.label}</SummaryLabel>
          </SummaryContent>
        </SummaryCard>
      ))}
    </SummaryGrid>
  );
}

FeedbackSummary.propTypes = {
  feedbackData: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default FeedbackSummary;
