import styled from "styled-components";
import PropTypes from "prop-types";
import ContactInfoEditor from "./ContactInfoEditor";
import AccountInfoEditor from "./AccountInfoEditor";

const SectionContainer = styled.div`
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

function ContactInfoSection({ user }) {
  const handleSuccess = (data) => {
    console.log("Contact info updated:", data);
    // The data will be automatically updated via React Query
  };

  return (
    <SectionContainer>
      <AccountInfoEditor user={user} onSuccess={handleSuccess} />
      <ContactInfoEditor user={user} onSuccess={handleSuccess} />
    </SectionContainer>
  );
}

ContactInfoSection.propTypes = {
  user: PropTypes.object.isRequired,
};

export default ContactInfoSection;
