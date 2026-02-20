import styled from "styled-components";
import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-grey-0);
`;

const Main = styled.main`
  flex: 1;
`;

function PublicLayout() {
  return (
    <LayoutContainer>
      <PublicNavbar />
      <Main>
        <Outlet />
      </Main>
      <PublicFooter />
    </LayoutContainer>
  );
}

export default PublicLayout;
