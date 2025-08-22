import styled from "styled-components";
import PropTypes from "prop-types";
import Text from "./Text";

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  text-align: center;
  min-height: 20rem;
`;

const EmptyIcon = styled.div`
  width: 6.4rem;
  height: 6.4rem;
  border-radius: var(--border-radius-full);
  background-color: var(--color-grey-100);
  color: var(--color-grey-400);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 3.2rem;
    height: 3.2rem;
  }
`;

const EmptyContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  max-width: 40rem;
`;

function Empty({ icon: Icon, title, description, action, className = "" }) {
  return (
    <EmptyContainer className={className}>
      {Icon && (
        <EmptyIcon>
          <Icon />
        </EmptyIcon>
      )}

      <EmptyContent>
        {title && (
          <Text size="lg" weight="semibold" color="default">
            {title}
          </Text>
        )}

        {description && (
          <Text size="sm" color="muted">
            {description}
          </Text>
        )}
      </EmptyContent>

      {action && action}
    </EmptyContainer>
  );
}

Empty.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};

export default Empty;
