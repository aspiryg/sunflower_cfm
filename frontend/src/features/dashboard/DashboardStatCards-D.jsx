import styled from "styled-components";
import Card from "../../ui/Card";
import Text from "../../ui/Text";
import Skeleton from "../../ui/Skeleton";

const Grid = styled.div`
  display: grid;
  gap: var(--spacing-4);
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
`;

const StatCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const Value = styled(Text)`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
`;

function DashboardStatCards({ stats, loading, error }) {
  const items = [
    { key: "totalFeedback", label: "Total Feedback" },
    { key: "openItems", label: "Open" },
    { key: "inProgress", label: "In Progress" },
    { key: "closedItems", label: "Closed" },
    { key: "avgResolutionDays", label: "Avg Resolution (d)" },
  ];

  return (
    <Grid>
      {items.map((it) => (
        <StatCard key={it.key}>
          <Text size="xs" color="muted" weight="medium">
            {it.label}
          </Text>
          {loading ? (
            <Skeleton height="2.4rem" width="60%" />
          ) : (
            <Value>{error ? "--" : stats?.[it.key] ?? 0}</Value>
          )}
        </StatCard>
      ))}
    </Grid>
  );
}

export default DashboardStatCards;
