import styled from "styled-components";
import Card from "../../ui/Card";
import Text from "../../ui/Text";
// import Skeleton from "../../ui/Skeleton";
import Button from "../../ui/Button";

const ActivityCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-height: 40rem;
  overflow: auto;
`;

const Item = styled.li`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-2);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-25);
`;

function RecentActivity({ items, loading, error }) {
  return (
    <ActivityCard>
      <Text size="sm" weight="medium">
        Recent Activity
      </Text>
      {loading && (
        <>
          <Skeleton height="4rem" />
          <Skeleton height="4rem" />
          <Skeleton height="4rem" />
        </>
      )}
      {!loading && error && (
        <Text size="sm" color="error">
          Failed to load activity
        </Text>
      )}
      {!loading && !error && (
        <List>
          {(items || []).slice(0, 8).map((act) => (
            <Item key={act.id}>
              <Text size="sm" weight="medium">
                {act.title || "Feedback Item"}
              </Text>
              <Text size="xs" color="muted">
                {act.status || "status"} • {act.updatedAt || "time"}
              </Text>
            </Item>
          ))}
          {(!items || items.length === 0) && (
            <Text size="sm" color="muted">
              No recent activity
            </Text>
          )}
        </List>
      )}
      <Button variant="secondary" size="small" disabled>
        View All
      </Button>
    </ActivityCard>
  );
}

export default RecentActivity;
