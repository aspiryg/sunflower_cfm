import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import Label from "./Label";
import Text from "./Text";

const FormFieldContainer = styled.div`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  width: 100%;

  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}
`;

const HelperText = styled(Text)`
  margin-top: var(--spacing-1);
`;

const ErrorText = styled(Text)`
  margin-top: var(--spacing-1);
  color: var(--color-error-600);
`;

function FormField({
  label,
  children,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  labelSize = "medium",
  className = "",
  ...props
}) {
  const hasError = !!error;
  const labelVariant = hasError ? "error" : "default";

  return (
    <FormFieldContainer $fullWidth={fullWidth} className={className} {...props}>
      {label && (
        <Label
          size={labelSize}
          variant={labelVariant}
          required={required}
          disabled={disabled}
        >
          {label}
        </Label>
      )}

      {children}

      {hasError && <ErrorText size="sm">{error}</ErrorText>}

      {!hasError && helperText && (
        <HelperText size="sm" color="muted">
          {helperText}
        </HelperText>
      )}
    </FormFieldContainer>
  );
}

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  labelSize: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
};

export default FormField;
