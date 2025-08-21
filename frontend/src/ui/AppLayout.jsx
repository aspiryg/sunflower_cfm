import { Outlet } from "react-router-dom";
import { useState } from "react";
import styled, { css } from "styled-components";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useMediaQuery } from "../hooks/useMediaQuery";

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--color-grey-50);
  max-width: 100%;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--duration-normal) var(--ease-in-out);
  max-width: 100%;

  ${(props) =>
    props.$sidebarOpen &&
    !props.$isMobile &&
    css`
      margin-left: 28rem;
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: var(--spacing-6);
  overflow-y: auto;
  /* background: linear-gradient(
    135deg,
    var(--color-brand-50) 0%,
    var(--color-brand-100) 100%
  ); */

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-3);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--backdrop-color);
  z-index: var(--z-modal-backdrop);
  opacity: ${(props) => (props.$show ? 1 : 0)};
  visibility: ${(props) => (props.$show ? "visible" : "hidden")};
  transition: all var(--duration-normal) var(--ease-in-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <LayoutContainer id="app-layout">
      <Sidebar
        $isOpen={sidebarOpen}
        $isMobile={isMobile}
        onClose={closeSidebar}
      />

      {isMobile && <Overlay $show={sidebarOpen} onClick={closeSidebar} />}

      <MainContent $sidebarOpen={sidebarOpen} $isMobile={isMobile}>
        <Header onToggleSidebar={toggleSidebar} $sidebarOpen={sidebarOpen} />

        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
}

export default AppLayout;
