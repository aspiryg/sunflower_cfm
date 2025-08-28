import styled from "styled-components";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import Breadcrumb from "../../ui/Breadcrumb";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: var(--container-2xl);
  margin: 0 auto;
  padding: var(--spacing-0);

  @media (max-width: 768px) {
    gap: var(--spacing-4);
    padding: var(--spacing-0);
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);

  @media (max-width: 768px) {
    gap: var(--spacing-1);
  }
`;
function CreatedByMe() {
  const breadcrumbItems = [
    {
      label: "Cases",
      to: "/feedback",
      icon: HiOutlineChatBubbleLeftRight,
    },
    {
      label: "Created By Me",
      icon: HiOutlinePlusCircle,
    },
  ];
  return (
    <div>
      <PageContainer>
        <PageHeader>
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbItems} />
        </PageHeader>
      </PageContainer>
      <h2>Created By Me</h2>
      {/* Render feedback items created by the current user */}
    </div>
  );
}

export default CreatedByMe;
