import styled from "styled-components";
import Container from "../ui/Container";
import RegisterForm from "../features/auth/RegisterForm";

const RegisterContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--color-brand-50) 0%,
    var(--color-brand-100) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  overflow-y: auto;
`;

const RegisterCard = styled.div`
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-8);
  width: 100%;
  max-width: 60rem;
  margin: var(--spacing-4) 0;

  @media (max-width: 640px) {
    padding: var(--spacing-6);
    border-radius: var(--border-radius-lg);
    margin: var(--spacing-2) 0;
  }
`;

function Register() {
  return (
    <RegisterContainer>
      <Container size="lg">
        <RegisterCard>
          <RegisterForm />
        </RegisterCard>
      </Container>
    </RegisterContainer>
  );
}

export default Register;
