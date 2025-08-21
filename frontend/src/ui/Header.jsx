import styled from "styled-components";
import { HiOutlineBars3 } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import IconButton from "./IconButton";
import Text from "./Text";
import UserMenu from "./UserMenu";
import NotificationsDropdown from "./NotificationsDropdown";
import DarkModeToggle from "./DarkModeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useAuthActions } from "../contexts/AuthContext";

const HeaderContainer = styled.header`
  background-color: var(--color-grey-0);
  border-bottom: 1px solid var(--color-grey-200);
  padding: 0 var(--spacing-6);
  height: 7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    padding: 0 var(--spacing-4);
    height: 6rem;
  }

  @media (max-width: 480px) {
    padding: 0 var(--spacing-3);
    height: 5.6rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const PageTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);

  @media (max-width: 640px) {
    display: none;
  }
`;

function Header({ onToggleSidebar, $sidebarOpen }) {
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const navigate = useNavigate();

  const handleMenuAction = (action) => {
    switch (action) {
      case "profile":
        navigate("/my-profile");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "logout":
        logout();
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  return (
    <HeaderContainer>
      <HeaderLeft>
        <IconButton
          variant="ghost"
          size="medium"
          onClick={onToggleSidebar}
          aria-label={$sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <HiOutlineBars3 />
        </IconButton>

        <PageTitle size="lg">CFM Dashboard</PageTitle>
      </HeaderLeft>

      <HeaderRight>
        <DarkModeToggle variant="icon-only" />
        <NotificationsDropdown />
        <UserMenu user={user} onMenuAction={handleMenuAction} />
      </HeaderRight>
    </HeaderContainer>
  );
}

export default Header;
