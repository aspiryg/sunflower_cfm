import styled from "styled-components";
import Heading from "../../ui/Heading";
import Text from "../../ui/Text";
import Button from "../../ui/Button";

const HeaderWrap = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  align-items: flex-end;
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 24rem;
`;

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
`;

function DashboardHeader({ onRefresh }) {
  return (
    <HeaderWrap>
      <Left>
        <Heading as="h1" size="h2">
          Dashboard
        </Heading>
        <Text size="sm" color="muted">
          Overview of feedback activity and key indicators
        </Text>
      </Left>
      <Actions>
        <Button variant="secondary" size="small" onClick={onRefresh}>
          Refresh
        </Button>
        <Button variant="primary" size="small">
          New Feedback
        </Button>
      </Actions>
    </HeaderWrap>
  );
}

export default DashboardHeader;
