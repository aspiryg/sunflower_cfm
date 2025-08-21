import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import Text from "./Text";

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  width: 100%;
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-700);

  ${(props) =>
    props.$required &&
    css`
      &::after {
        content: " *";
        color: var(--color-error-500);
      }
    `}
`;

const FieldWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const ErrorMessage = styled(Text)`
  color: var(--color-error-600);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-1);
`;

const HelpText = styled(Text)`
  color: var(--color-grey-500);
  font-size: var(--font-size-xs);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-grey-800);
  background-color: var(--color-grey-0);
  transition: all var(--duration-normal) var(--ease-in-out);

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &:disabled {
    background-color: var(--color-grey-50);
    color: var(--color-grey-500);
    cursor: not-allowed;
  }

  ${(props) =>
    props.$hasError &&
    css`
      border-color: var(--color-error-500);

      &:focus {
        border-color: var(--color-error-500);
        box-shadow: 0 0 0 3px var(--color-error-100);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 8rem;
  padding: var(--spacing-3);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: var(--color-grey-800);
  background-color: var(--color-grey-0);
  resize: vertical;
  transition: all var(--duration-normal) var(--ease-in-out);

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &:disabled {
    background-color: var(--color-grey-50);
    color: var(--color-grey-500);
    cursor: not-allowed;
    resize: none;
  }

  ${(props) =>
    props.$hasError &&
    css`
      border-color: var(--color-error-500);

      &:focus {
        border-color: var(--color-error-500);
        box-shadow: 0 0 0 3px var(--color-error-100);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-grey-800);
  background-color: var(--color-grey-0);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &:disabled {
    background-color: var(--color-grey-50);
    color: var(--color-grey-500);
    cursor: not-allowed;
  }

  ${(props) =>
    props.$hasError &&
    css`
      border-color: var(--color-error-500);

      &:focus {
        border-color: var(--color-error-500);
        box-shadow: 0 0 0 3px var(--color-error-100);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/**
 * Reusable FormField component for consistent form styling
 * Supports input, textarea, and select elements with error states
 */
function FormField({
  children,
  label,
  required = false,
  error,
  helpText,
  className = "",
  ...props
}) {
  const hasError = !!error;

  return (
    <FieldContainer className={className} {...props}>
      {label && <Label $required={required}>{label}</Label>}

      <FieldWrapper>
        {children}

        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

        {helpText && !error && <HelpText>{helpText}</HelpText>}
      </FieldWrapper>
    </FieldContainer>
  );
}

FormField.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  className: PropTypes.string,
};

// Export individual components for direct use
export { Input, Textarea, Select };
export default FormField;
