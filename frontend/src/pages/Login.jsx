import styled from "styled-components";
import Container from "../ui/Container";
import LoginForm from "../features/auth/Login";

const LoginContainer = styled.div`
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
`;

const LoginCard = styled.div`
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-8);
  width: 100%;
  max-width: 48rem;

  @media (max-width: 640px) {
    padding: var(--spacing-6);
    border-radius: var(--border-radius-lg);
  }
`;

function Login() {
  return (
    <LoginContainer>
      <Container size="sm">
        <LoginCard>
          <LoginForm />
        </LoginCard>
      </Container>
    </LoginContainer>
  );
}

export default Login;
