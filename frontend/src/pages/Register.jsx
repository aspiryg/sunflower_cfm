import styled from "styled-components";
import Container from "../ui/Container";
import RegisterForm from "../features/auth/RegisterForm";

const RegisterContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--color-brand-50) 0%,
    var(--color-brand-100) 50%,
    var(--color-brand-200) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6) var(--spacing-4);
  overflow-y: auto;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")
      repeat;
    opacity: 0.3;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-4) var(--spacing-2);
    align-items: flex-start;
    padding-top: var(--spacing-6);
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 60rem;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

function Register() {
  return (
    <RegisterContainer>
      {/* <Container size="lg"> */}
      <ContentWrapper>
        <RegisterForm />
      </ContentWrapper>
      {/* </Container> */}
    </RegisterContainer>
  );
}

export default Register;
