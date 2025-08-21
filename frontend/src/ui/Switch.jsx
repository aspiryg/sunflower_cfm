import styled from "styled-components";
import PropTypes from "prop-types";

const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 4.4rem;
  height: 2.4rem;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: var(--color-brand-500);
  }

  &:checked + span::before {
    transform: translateX(2rem);
  }

  &:focus + span {
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &:disabled + span {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-grey-300);
  border-radius: 2.4rem;
  transition: all var(--duration-normal) var(--ease-in-out);

  &::before {
    content: "";
    position: absolute;
    height: 1.8rem;
    width: 1.8rem;
    left: 0.3rem;
    bottom: 0.3rem;
    background-color: var(--color-grey-0);
    border-radius: 50%;
    transition: transform var(--duration-normal) var(--ease-in-out);
    box-shadow: var(--shadow-sm);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &::before {
      transition: none;
    }
  }
`;

/**
 * Switch Component
 *
 * A toggle switch for boolean states
 */
function Switch({ checked = false, onChange, disabled = false, ...props }) {
  return (
    <SwitchContainer>
      <SwitchInput
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        {...props}
      />
      <SwitchSlider />
    </SwitchContainer>
  );
}

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Switch;
