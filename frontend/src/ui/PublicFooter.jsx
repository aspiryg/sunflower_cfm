import { Link } from "react-router-dom";
import styled from "styled-components";
import { HiOutlineSun } from "react-icons/hi2";

const FooterContainer = styled.footer`
  background-color: var(--color-grey-800);
  color: var(--color-grey-300);
  border-top: 1px solid var(--color-grey-700);
`;

const FooterInner = styled.div`
  max-width: 128rem;
  margin: 0 auto;
  padding: var(--spacing-12) var(--spacing-6) var(--spacing-6);

  @media (max-width: 768px) {
    padding: var(--spacing-8) var(--spacing-4) var(--spacing-4);
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
  }
`;

const FooterBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const BrandIcon = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  background: linear-gradient(
    135deg,
    var(--color-brand-400),
    var(--color-brand-500)
  );
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const BrandName = styled.span`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-100);
`;

const BrandDescription = styled.p`
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--color-grey-400);
  max-width: 36rem;
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`;

const SectionTitle = styled.h4`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-100);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-1);
`;

const FooterLink = styled(Link)`
  font-size: var(--font-size-sm);
  color: var(--color-grey-400);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-in-out);

  &:hover {
    color: var(--color-brand-400);
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: var(--color-grey-700);
  margin-bottom: var(--spacing-6);
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
`;

const BottomLinks = styled.div`
  display: flex;
  gap: var(--spacing-4);
`;

const BottomLink = styled(Link)`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-in-out);

  &:hover {
    color: var(--color-grey-300);
  }
`;

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterInner>
        <FooterGrid>
          <FooterBrand>
            <BrandHeader>
              <BrandIcon>
                <HiOutlineSun />
              </BrandIcon>
              <BrandName>Sunflower CFM</BrandName>
            </BrandHeader>
            <BrandDescription>
              A comprehensive Community Feedback Management platform built for
              Sunflower Organization to receive, classify, and manage feedback
              across the Occupied Palestinian Territories.
            </BrandDescription>
          </FooterBrand>

          <FooterSection>
            <SectionTitle>Platform</SectionTitle>
            <FooterLink to="/home/submit-feedback">Submit Feedback</FooterLink>
            <FooterLink to="/home/about">About</FooterLink>
          </FooterSection>

          <FooterSection>
            <SectionTitle>Account</SectionTitle>
            <FooterLink to="/login">Sign In</FooterLink>
            <FooterLink to="/register">Create Account</FooterLink>
            <FooterLink to="/forgot-password">Reset Password</FooterLink>
          </FooterSection>

          <FooterSection>
            <SectionTitle>Organization</SectionTitle>
            <FooterLink to="/home/about">Sunflower Organization</FooterLink>
            <FooterLink to="/home/about">Contact Us</FooterLink>
            <FooterLink to="/home/about">Our Mission</FooterLink>
          </FooterSection>
        </FooterGrid>

        <Divider />

        <FooterBottom>
          <Copyright>
            &copy; {currentYear} Sunflower Organization. All rights reserved.
          </Copyright>
          <BottomLinks>
            <BottomLink to="/home/about">Privacy Policy</BottomLink>
            <BottomLink to="/home/about">Terms of Service</BottomLink>
          </BottomLinks>
        </FooterBottom>
      </FooterInner>
    </FooterContainer>
  );
}

export default PublicFooter;
