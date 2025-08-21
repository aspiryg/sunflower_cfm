import styled from "styled-components";
import { NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineCog8Tooth,
  HiOutlineUsers,
  HiOutlineUser,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import Text from "./Text";
import Column from "./Column";

const SidebarContainer = styled.aside`
  background-color: var(--color-grey-0);
  border-right: 1px solid var(--color-grey-200);
  width: 28rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: transform var(--duration-normal) var(--ease-in-out);

  /* Mobile: Fixed positioning with overlay */
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-sidebar);
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
    box-shadow: var(--shadow-lg);
  }

  /* Desktop: Static positioning that slides in/out */
  @media (min-width: 769px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-fixed);
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SidebarHeader = styled.div`
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  height: 7rem;

  @media (max-width: 768px) {
    height: 6rem;
    padding: var(--spacing-4);
  }
`;

const Logo = styled.div`
  width: 4rem;
  height: 4rem;
  background: linear-gradient(
    135deg,
    var(--color-brand-600),
    var(--color-brand-700)
  );
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-50);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
`;

const BrandName = styled(Text)`
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
`;

const Navigation = styled.nav`
  flex: 1;
  padding: var(--spacing-4) var(--spacing-6);
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-bottom: var(--spacing-6);
`;

const NavSectionTitle = styled(Text)`
  color: var(--color-grey-500);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-3);
  padding-left: var(--spacing-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const NavList = styled(Column)`
  gap: var(--spacing-1);
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-normal) var(--ease-in-out);
  position: relative;

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
  }

  &.active {
    background-color: var(--color-brand-100);
    color: var(--color-brand-700);

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background-color: var(--color-brand-600);
      border-radius: 0 2px 2px 0;
    }
  }

  svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-normal) var(--ease-in-out);
  position: relative;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
  }

  svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SidebarFooter = styled.div`
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-grey-200);
`;

const navigation = [
  {
    section: "Main",
    items: [{ name: "Dashboard", to: "/dashboard", icon: HiOutlineHome }],
  },
  {
    section: "Management",
    items: [
      { name: "Users", to: "/users", icon: HiOutlineUsers },
      { name: "Settings", to: "/settings", icon: HiOutlineCog8Tooth },
    ],
  },
  {
    section: "Personal",
    items: [
      { name: "My Profile", to: "/my-profile", icon: HiOutlineUser },
      { name: "Feedback", to: "/feedback", icon: HiOutlineChatBubbleLeftRight },
    ],
  },
];

function Sidebar({ $isOpen, $isMobile, onClose }) {
  const handleNavClick = () => {
    if ($isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout clicked");
    if ($isMobile) {
      onClose();
    }
  };

  return (
    <SidebarContainer $isOpen={$isOpen} $isMobile={$isMobile}>
      <SidebarHeader>
        <Logo>C</Logo>
        <BrandName size="lg">CFM System</BrandName>
      </SidebarHeader>

      <Navigation>
        {navigation.map((section) => (
          <NavSection key={section.section}>
            <NavSectionTitle size="xs">{section.section}</NavSectionTitle>
            <NavList>
              {section.items.map((item) => (
                <NavItem key={item.to} to={item.to} onClick={handleNavClick}>
                  <item.icon />
                  {item.name}
                </NavItem>
              ))}
            </NavList>
          </NavSection>
        ))}
      </Navigation>

      <SidebarFooter>
        <LogoutButton onClick={handleLogout}>
          <HiOutlineArrowRightOnRectangle />
          Logout
        </LogoutButton>
      </SidebarFooter>
    </SidebarContainer>
  );
}

export default Sidebar;
