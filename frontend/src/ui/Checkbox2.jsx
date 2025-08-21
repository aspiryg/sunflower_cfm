import styled from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineCheck } from "react-icons/hi2";

const CheckboxContainer = styled.div`
  display: inline-flex;
  align-items: center;
  position: relative;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const StyledCheckbox = styled.div`
  width: 1.6rem;
  height: 1.6rem;
  border: 2px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal) var(--ease-in-out);
  cursor: pointer;

  ${HiddenCheckbox}:checked + & {
    background-color: var(--color-brand-500);
    border-color: var(--color-brand-500);
    color: var(--color-grey-0);
  }

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  ${HiddenCheckbox}:disabled + & {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--color-grey-100);
  }

  &:hover {
    border-color: var(--color-brand-400);
  }

  ${HiddenCheckbox}:checked + &:hover {
    background-color: var(--color-brand-600);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
    opacity: ${(props) => (props.$checked ? 1 : 0)};
    transition: opacity var(--duration-fast) var(--ease-in-out);
  }
`;

function Checkbox({
  id,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <CheckboxContainer className={className}>
      <HiddenCheckbox
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <StyledCheckbox $checked={checked}>
        <HiOutlineCheck />
      </StyledCheckbox>
    </CheckboxContainer>
  );
}

Checkbox.propTypes = {
  id: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Checkbox;
