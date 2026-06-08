import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import {
  HiOutlineSun,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background-color: var(--color-grey-0);
  border-bottom: 1px solid var(--color-grey-200);
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.9);

  [data-theme="dark"] & {
    background-color: rgba(15, 23, 42, 0.9);
  }
`;

const NavInner = styled.div`
  max-width: 128rem;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 6.4rem;

  @media (max-width: 768px) {
    padding: 0 var(--spacing-4);
    height: 5.6rem;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  text-decoration: none;
  flex-shrink: 0;
`;

const LogoIcon = styled.div`
  width: 3.6rem;
  height: 3.6rem;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-600)
  );
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-50);
  font-size: 1.8rem;

  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const LogoText = styled.span`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
  letter-spacing: -0.02em;

  @media (max-width: 480px) {
    font-size: var(--font-size-lg);
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-600);
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    color: var(--color-brand-600);
    background-color: var(--color-brand-50);
  }

  ${(props) =>
    props.$active &&
    css`
      color: var(--color-brand-600);
      background-color: var(--color-brand-50);
    `}
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 768px) {
    gap: var(--spacing-2);
  }
`;

const AuthButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-in-out);
  white-space: nowrap;

  ${(props) =>
    props.$variant === "primary"
      ? css`
          color: var(--color-brand-50);
          background-color: var(--color-brand-600);
          border: 1px solid var(--color-brand-600);

          &:hover {
            background-color: var(--color-brand-700);
            border-color: var(--color-brand-700);
            color: var(--color-brand-50);
          }
        `
      : css`
          color: var(--color-brand-600);
          background-color: transparent;
          border: 1px solid var(--color-brand-200);

          &:hover {
            background-color: var(--color-brand-50);
            border-color: var(--color-brand-300);
          }
        `}

  @media (max-width: 640px) {
    padding: var(--spacing-1) var(--spacing-3);
    font-size: var(--font-size-xs);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-grey-600);
  padding: var(--spacing-2);
  border-radius: var(--border-radius-md);

  &:hover {
    background-color: var(--color-grey-100);
  }

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenu = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${(props) => (props.$isOpen ? "flex" : "none")};
    flex-direction: column;
    padding: var(--spacing-4) var(--spacing-6);
    border-top: 1px solid var(--color-grey-200);
    background-color: var(--color-grey-0);
    gap: var(--spacing-2);
  }
`;

const MobileNavLink = styled(Link)`
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-600);
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    color: var(--color-brand-600);
    background-color: var(--color-brand-50);
  }

  ${(props) =>
    props.$active &&
    css`
      color: var(--color-brand-600);
      background-color: var(--color-brand-50);
    `}
`;

const MobileAuthActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-grey-200);
  margin-top: var(--spacing-2);
`;

const navItems = [
  { label: "Home", path: "/home" },
  { label: "Submit Feedback", path: "/home/submit-feedback" },
  { label: "About", path: "/home/about" },
];

function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Nav>
      <NavInner>
        <LogoLink to="/home">
          <LogoIcon>
            <HiOutlineSun />
          </LogoIcon>
          <LogoText>Sunflower CFM</LogoText>
        </LogoLink>

        <NavLinks>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              $active={isActive(item.path)}
            >
              {item.label}
            </NavLink>
          ))}
        </NavLinks>

        <NavActions>
          <AuthButton to="/login" $variant="outline">
            Sign In
          </AuthButton>
          <AuthButton to="/register" $variant="primary">
            Sign Up
          </AuthButton>
          <MobileMenuButton
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <HiOutlineXMark /> : <HiOutlineBars3 />}
          </MobileMenuButton>
        </NavActions>
      </NavInner>

      <MobileMenu $isOpen={mobileMenuOpen}>
        {navItems.map((item) => (
          <MobileNavLink
            key={item.path}
            to={item.path}
            $active={isActive(item.path)}
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.label}
          </MobileNavLink>
        ))}
        <MobileAuthActions>
          <AuthButton
            to="/login"
            $variant="outline"
            onClick={() => setMobileMenuOpen(false)}
            style={{ textAlign: "center" }}
          >
            Sign In
          </AuthButton>
          <AuthButton
            to="/register"
            $variant="primary"
            onClick={() => setMobileMenuOpen(false)}
            style={{ textAlign: "center" }}
          >
            Sign Up
          </AuthButton>
        </MobileAuthActions>
      </MobileMenu>
    </Nav>
  );
}

export default PublicNavbar;
