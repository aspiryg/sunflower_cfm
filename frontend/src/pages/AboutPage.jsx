import styled from "styled-components";
import {
  HiOutlineSun,
  HiOutlineHeart,
  HiOutlineGlobeAlt,
  HiOutlineUserGroup,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhone,
} from "react-icons/hi2";

/* ==================== STYLES ==================== */
const PageContainer = styled.div`
  background-color: var(--color-grey-0);
`;

const HeroSection = styled.section`
  padding: var(--spacing-16) var(--spacing-6) var(--spacing-12);
  text-align: center;
  background: linear-gradient(
    180deg,
    var(--color-brand-50) 0%,
    var(--color-grey-0) 100%
  );

  @media (max-width: 768px) {
    padding: var(--spacing-10) var(--spacing-4) var(--spacing-8);
  }
`;

const SectionInner = styled.div`
  max-width: 100rem;
  margin: 0 auto;
`;

const SectionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-3);
  background-color: var(--color-brand-50);
  color: var(--color-brand-600);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-4);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
  line-height: 1.2;
  margin-bottom: var(--spacing-4);
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: var(--font-size-3xl);
  }
`;

const PageSubtitle = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-500);
  line-height: 1.6;
  max-width: 68rem;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: var(--font-size-base);
  }
`;

/* Mission Section */
const ContentSection = styled.section`
  padding: var(--spacing-12) var(--spacing-6);

  &:nth-child(odd) {
    background-color: var(--color-grey-50);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-8) var(--spacing-4);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-10);
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
  }
`;

const ContentText = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const ContentTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: var(--font-size-2xl);
  }
`;

const ContentDescription = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-grey-500);
  line-height: 1.7;
`;

const PlaceholderVisual = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-brand-100),
    var(--color-brand-50)
  );
  border: 2px dashed var(--color-brand-200);
  border-radius: var(--border-radius-xl);
  height: 30rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  color: var(--color-brand-400);

  svg {
    width: 4.8rem;
    height: 4.8rem;
  }

  span {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }
`;

/* Values */
const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-6);
  margin-top: var(--spacing-8);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ValueCard = styled.div`
  text-align: center;
  padding: var(--spacing-6);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
`;

const ValueIcon = styled.div`
  width: 5.6rem;
  height: 5.6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-4);
  background: ${(props) => props.$bg || "var(--color-brand-50)"};
  color: ${(props) => props.$color || "var(--color-brand-600)"};

  svg {
    width: 2.8rem;
    height: 2.8rem;
  }
`;

const ValueTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  margin-bottom: var(--spacing-2);
`;

const ValueDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-500);
  line-height: 1.6;
`;

/* Contact Section */
const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-6);
  margin-top: var(--spacing-8);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContactCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  text-align: center;
`;

const ContactIcon = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-brand-50);
  color: var(--color-brand-600);

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const ContactTitle = styled.h3`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
`;

const ContactValue = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-500);
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-2);
`;

/* ==================== COMPONENT ==================== */
function AboutPage() {
  return (
    <PageContainer>
      {/* Hero */}
      <HeroSection>
        <SectionInner>
          <SectionLabel>About Us</SectionLabel>
          <PageTitle>Sunflower Organization</PageTitle>
          <PageSubtitle>
            Dedicated to accountability, service quality, and community
            empowerment across the Occupied Palestinian Territories.
          </PageSubtitle>
        </SectionInner>
      </HeroSection>

      {/* Mission */}
      <ContentSection>
        <SectionInner>
          <ContentGrid>
            <ContentText>
              <SectionLabel>Our Mission</SectionLabel>
              <ContentTitle>
                Amplifying community voices for better services
              </ContentTitle>
              <ContentDescription>
                {/* Placeholder — fill with actual mission statement */}
                Sunflower Organization works to strengthen the relationship
                between service providers and communities in the Occupied
                Palestinian Territories. Through structured feedback mechanisms,
                we ensure that every voice is heard, every concern is addressed,
                and every service delivery is improved.
              </ContentDescription>
              <ContentDescription>
                {/* Placeholder — fill with more detail */}
                Our Community Feedback Management platform is a cornerstone of
                this mission — enabling transparent, accountable, and responsive
                service delivery across all programs and geographic areas.
              </ContentDescription>
            </ContentText>
            <PlaceholderVisual>
              <HiOutlineSun />
              <span>Mission visual / photo placeholder</span>
            </PlaceholderVisual>
          </ContentGrid>
        </SectionInner>
      </ContentSection>

      {/* Values */}
      <ContentSection>
        <SectionInner>
          <SectionHeader>
            <SectionLabel>Our Values</SectionLabel>
            <ContentTitle style={{ textAlign: "center" }}>
              What drives our work
            </ContentTitle>
          </SectionHeader>

          <ValuesGrid>
            <ValueCard>
              <ValueIcon
                $bg="var(--color-brand-50)"
                $color="var(--color-brand-600)"
              >
                <HiOutlineHeart />
              </ValueIcon>
              <ValueTitle>Accountability</ValueTitle>
              <ValueDescription>
                {/* Placeholder */}
                We believe every person deserves transparent and responsive
                service. Our platforms ensure that feedback leads to action.
              </ValueDescription>
            </ValueCard>

            <ValueCard>
              <ValueIcon
                $bg="var(--color-green-50)"
                $color="var(--color-green-600)"
              >
                <HiOutlineGlobeAlt />
              </ValueIcon>
              <ValueTitle>Community First</ValueTitle>
              <ValueDescription>
                {/* Placeholder */}
                Communities are at the center of everything we do. We design
                solutions that are accessible, inclusive, and respectful of local
                context.
              </ValueDescription>
            </ValueCard>

            <ValueCard>
              <ValueIcon
                $bg="var(--color-purple-50)"
                $color="var(--color-purple-600)"
              >
                <HiOutlineUserGroup />
              </ValueIcon>
              <ValueTitle>Collaboration</ValueTitle>
              <ValueDescription>
                {/* Placeholder */}
                Working across sectors, programs, and geographic areas, we bring
                partners and teams together to deliver quality outcomes.
              </ValueDescription>
            </ValueCard>
          </ValuesGrid>
        </SectionInner>
      </ContentSection>

      {/* Impact placeholder */}
      <ContentSection>
        <SectionInner>
          <ContentGrid>
            <PlaceholderVisual>
              <HiOutlineGlobeAlt />
              <span>Impact / coverage map placeholder</span>
            </PlaceholderVisual>
            <ContentText>
              <SectionLabel>Our Impact</SectionLabel>
              <ContentTitle>Working across the OPT</ContentTitle>
              <ContentDescription>
                {/* Placeholder — fill with actual impact data */}
                Sunflower Organization operates across multiple regions and
                governorates in the Occupied Palestinian Territories, managing
                feedback for diverse programs and service sectors.
              </ContentDescription>
              <ContentDescription>
                {/* Placeholder */}
                Through the CFM platform, we track, analyze, and respond to
                community feedback to continuously improve program outcomes and
                service delivery standards.
              </ContentDescription>
            </ContentText>
          </ContentGrid>
        </SectionInner>
      </ContentSection>

      {/* Contact */}
      <ContentSection>
        <SectionInner>
          <SectionHeader>
            <SectionLabel>Contact Us</SectionLabel>
            <ContentTitle style={{ textAlign: "center" }}>
              Get in touch
            </ContentTitle>
            <PageSubtitle style={{ marginTop: "var(--spacing-2)" }}>
              {/* Placeholder */}
              Have questions? Reach out to our team.
            </PageSubtitle>
          </SectionHeader>

          <ContactGrid>
            <ContactCard>
              <ContactIcon>
                <HiOutlineEnvelope />
              </ContactIcon>
              <ContactTitle>Email</ContactTitle>
              <ContactValue>
                {/* Placeholder */}
                info@sunflower-org.ps
              </ContactValue>
            </ContactCard>

            <ContactCard>
              <ContactIcon>
                <HiOutlinePhone />
              </ContactIcon>
              <ContactTitle>Phone</ContactTitle>
              <ContactValue>
                {/* Placeholder */}
                +970 XX XXX XXXX
              </ContactValue>
            </ContactCard>

            <ContactCard>
              <ContactIcon>
                <HiOutlineMapPin />
              </ContactIcon>
              <ContactTitle>Location</ContactTitle>
              <ContactValue>
                {/* Placeholder */}
                Occupied Palestinian Territories
              </ContactValue>
            </ContactCard>
          </ContactGrid>
        </SectionInner>
      </ContentSection>
    </PageContainer>
  );
}

export default AboutPage;
