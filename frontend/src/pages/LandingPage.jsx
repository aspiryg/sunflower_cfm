import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  HiOutlineArrowRight,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineChartBarSquare,
  HiOutlineClock,
  HiOutlineGlobeAlt,
  HiOutlineBellAlert,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineClipboardDocumentList,
  HiOutlineSun,
} from "react-icons/hi2";

/* ==================== ANIMATIONS ==================== */
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1rem); }
`;

/* ==================== HERO SECTION ==================== */
const HeroSection = styled.section`
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    160deg,
    var(--color-brand-50) 0%,
    var(--color-grey-0) 40%,
    var(--color-brand-50) 100%
  );
  padding: var(--spacing-20) var(--spacing-6) var(--spacing-16);

  @media (max-width: 768px) {
    padding: var(--spacing-12) var(--spacing-4) var(--spacing-10);
  }
`;

const HeroBackground = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`;

const BackgroundOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;

  &:nth-child(1) {
    width: 40rem;
    height: 40rem;
    background: var(--color-brand-400);
    top: -10%;
    right: -5%;
    animation: ${float} 8s ease-in-out infinite;
  }

  &:nth-child(2) {
    width: 30rem;
    height: 30rem;
    background: var(--color-indigo-400);
    bottom: -10%;
    left: -5%;
    animation: ${float} 10s ease-in-out infinite reverse;
  }

  &:nth-child(3) {
    width: 20rem;
    height: 20rem;
    background: var(--color-purple-400);
    top: 40%;
    left: 30%;
    animation: ${float} 12s ease-in-out infinite;
  }
`;

const HeroInner = styled.div`
  max-width: 100rem;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-4);
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-6);
  animation: ${fadeInUp} 0.6s ease-out;

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 5.6rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-900);
  line-height: 1.1;
  margin-bottom: var(--spacing-6);
  letter-spacing: -0.03em;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;

  span {
    background: linear-gradient(
      135deg,
      var(--color-brand-600),
      var(--color-indigo-500)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 1024px) {
    font-size: 4.4rem;
  }

  @media (max-width: 768px) {
    font-size: 3.6rem;
  }

  @media (max-width: 480px) {
    font-size: 2.8rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: var(--font-size-xl);
  color: var(--color-grey-600);
  line-height: 1.7;
  max-width: 68rem;
  margin: 0 auto var(--spacing-8);
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;

  @media (max-width: 768px) {
    font-size: var(--font-size-lg);
  }

  @media (max-width: 480px) {
    font-size: var(--font-size-base);
  }
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

const HeroButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-in-out);

  svg {
    width: 2rem;
    height: 2rem;
    transition: transform var(--duration-fast) var(--ease-in-out);
  }

  &:hover svg {
    transform: translateX(3px);
  }

  &.primary {
    color: var(--color-brand-50);
    background: linear-gradient(
      135deg,
      var(--color-brand-600),
      var(--color-brand-700)
    );
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);

    &:hover {
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
      transform: translateY(-1px);
    }
  }

  &.secondary {
    color: var(--color-grey-700);
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-300);
    box-shadow: var(--shadow-sm);

    &:hover {
      border-color: var(--color-grey-400);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const HeroStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-10);
  margin-top: var(--spacing-12);
  animation: ${fadeInUp} 0.6s ease-out 0.4s both;

  @media (max-width: 768px) {
    gap: var(--spacing-6);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: var(--spacing-4);
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-brand-600);
  line-height: 1;
  margin-bottom: var(--spacing-1);

  @media (max-width: 768px) {
    font-size: var(--font-size-2xl);
  }
`;

const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-500);
  font-weight: var(--font-weight-medium);
`;

/* ==================== FEATURES SECTION ==================== */
const FeaturesSection = styled.section`
  padding: var(--spacing-16) var(--spacing-6);
  background-color: var(--color-grey-0);

  @media (max-width: 768px) {
    padding: var(--spacing-10) var(--spacing-4);
  }
`;

const SectionInner = styled.div`
  max-width: 128rem;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 68rem;
  margin: 0 auto var(--spacing-12);

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-8);
  }
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

const SectionTitle = styled.h2`
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

const SectionDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-500);
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: var(--font-size-base);
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-6);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    border-color: var(--color-brand-200);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

const FeatureIconWrapper = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-4);
  background: ${(props) => props.$bg || "var(--color-brand-50)"};
  color: ${(props) => props.$color || "var(--color-brand-600)"};

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const FeatureTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  margin-bottom: var(--spacing-2);
`;

const FeatureDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-500);
  line-height: 1.6;
`;

/* ==================== HOW IT WORKS ==================== */
const HowItWorksSection = styled.section`
  padding: var(--spacing-16) var(--spacing-6);
  background: linear-gradient(
    180deg,
    var(--color-grey-50) 0%,
    var(--color-grey-0) 100%
  );

  @media (max-width: 768px) {
    padding: var(--spacing-10) var(--spacing-4);
  }
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-6);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.div`
  text-align: center;
  padding: var(--spacing-6);
  position: relative;
`;

const StepNumber = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-600)
  );
  color: var(--color-brand-50);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 auto var(--spacing-4);
`;

const StepTitle = styled.h3`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  margin-bottom: var(--spacing-2);
`;

const StepDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-500);
  line-height: 1.5;
`;

/* ==================== CTA SECTION ==================== */
const CTASection = styled.section`
  padding: var(--spacing-16) var(--spacing-6);
  background-color: var(--color-grey-0);

  @media (max-width: 768px) {
    padding: var(--spacing-10) var(--spacing-4);
  }
`;

const CTACard = styled.div`
  max-width: 100rem;
  margin: 0 auto;
  background: linear-gradient(
    135deg,
    var(--color-brand-600) 0%,
    var(--color-indigo-600) 60%,
    var(--color-purple-600) 100%
  );
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-12) var(--spacing-8);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
      repeat;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-8) var(--spacing-6);
  }
`;

const CTAContent = styled.div`
  position: relative;
  z-index: 1;
`;

const CTATitle = styled.h2`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-brand-50);
  margin-bottom: var(--spacing-4);
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: var(--font-size-3xl);
  }
`;

const CTADescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-brand-100);
  max-width: 60rem;
  margin: 0 auto var(--spacing-8);
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: var(--font-size-base);
  }
`;

const CTAActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-in-out);

  svg {
    width: 2rem;
    height: 2rem;
  }

  &.primary {
    color: var(--color-brand-700);
    background-color: var(--color-brand-0);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
  }

  &.outline {
    color: var(--color-brand-50);
    border: 2px solid rgba(255, 255, 255, 0.4);

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.6);
    }
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

/* ==================== FEATURES DATA ==================== */
const features = [
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: "Multi-Channel Feedback Collection",
    description:
      "Receive feedback through various channels — phone, in-person, online, hotline, and more. Every voice is captured and tracked.",
    bg: "var(--color-brand-50)",
    color: "var(--color-brand-600)",
  },
  {
    icon: HiOutlineSparkles,
    title: "Smart Case Classification",
    description:
      "AI-powered suggestions for case categorization, priority levels, and recommended procedures to accelerate resolution.",
    bg: "var(--color-purple-50)",
    color: "var(--color-purple-600)",
  },
  {
    icon: HiOutlineClipboardDocumentList,
    title: "Full Case Lifecycle Management",
    description:
      "Track each case from receipt to resolution with comprehensive status management, assignment workflows, and audit trails.",
    bg: "var(--color-green-50)",
    color: "var(--color-green-600)",
  },
  {
    icon: HiOutlineClock,
    title: "SLA Monitoring & Alerts",
    description:
      "Set and monitor Service Level Agreements with automated notifications, reminders, and escalation procedures.",
    bg: "var(--color-orange-50)",
    color: "var(--color-orange-600)",
  },
  {
    icon: HiOutlineDocumentMagnifyingGlass,
    title: "Case Timeline & History",
    description:
      "Complete audit trail with change logging, assignment history, status transitions, and detailed case timelines.",
    bg: "var(--color-blue-50)",
    color: "var(--color-blue-600)",
  },
  {
    icon: HiOutlineBellAlert,
    title: "Smart Notifications",
    description:
      "Real-time notifications for case updates, assignments, SLA breaches, and important milestones via in-app and email.",
    bg: "var(--color-red-50)",
    color: "var(--color-red-600)",
  },
  {
    icon: HiOutlineMapPin,
    title: "Geographic Data Management",
    description:
      "Hierarchical geographic structure — regions, governorates, and communities — to track and analyze feedback by location.",
    bg: "var(--color-teal-100)",
    color: "var(--color-teal-700)",
  },
  {
    icon: HiOutlineAdjustmentsHorizontal,
    title: "Customizable Resources",
    description:
      "Fully configurable categories, statuses, priorities, channels, programs, and projects to match your operational needs.",
    bg: "var(--color-yellow-50)",
    color: "var(--color-yellow-700)",
  },
  {
    icon: HiOutlineChartBarSquare,
    title: "Analytics & Reporting",
    description:
      "Dashboards and statistics to understand trends, track team performance, and make data-driven decisions.",
    bg: "var(--color-indigo-50)",
    color: "var(--color-indigo-600)",
  },
];

const steps = [
  {
    number: "1",
    title: "Submit Feedback",
    description:
      "Beneficiaries share their feedback through a simple public form or any supported channel.",
  },
  {
    number: "2",
    title: "Classify & Assign",
    description:
      "Team classifies the case — category, priority, geographic area — and assigns it for handling.",
  },
  {
    number: "3",
    title: "Manage & Track",
    description:
      "Monitor progress, add comments, track SLA timelines, and collaborate on case resolution.",
  },
  {
    number: "4",
    title: "Resolve & Close",
    description:
      "Cases are resolved, documented, and closed with a full audit trail and notification to stakeholders.",
  },
];

/* ==================== COMPONENT ==================== */
function LandingPage() {
  return (
    <>
      {/* Hero */}
      <HeroSection>
        <HeroBackground>
          <BackgroundOrb />
          <BackgroundOrb />
          <BackgroundOrb />
        </HeroBackground>

        <HeroInner>
          <HeroBadge>
            <HiOutlineSun />
            Sunflower Organization — OPT
          </HeroBadge>

          <HeroTitle>
            Community Feedback
            <br />
            <span>Management Platform</span>
          </HeroTitle>

          <HeroSubtitle>
            Empowering accountability and service quality across the Occupied
            Palestinian Territories. Receive, classify, manage, and resolve
            community feedback — all in one place.
          </HeroSubtitle>

          <HeroActions>
            <HeroButton to="/home/submit-feedback" className="primary">
              Submit Feedback
              <HiOutlineArrowRight />
            </HeroButton>
            <HeroButton to="/home/about" className="secondary">
              <HiOutlineShieldCheck />
              Learn More
            </HeroButton>
          </HeroActions>

          <HeroStats>
            <StatItem>
              <StatValue>Multi</StatValue>
              <StatLabel>Feedback Channels</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>Full</StatValue>
              <StatLabel>Case Lifecycle</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>Smart</StatValue>
              <StatLabel>Classification AI</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>Real-time</StatValue>
              <StatLabel>Notifications</StatLabel>
            </StatItem>
          </HeroStats>
        </HeroInner>
      </HeroSection>

      {/* Features */}
      <FeaturesSection id="features">
        <SectionInner>
          <SectionHeader>
            <SectionLabel>Platform Capabilities</SectionLabel>
            <SectionTitle>
              Everything you need to manage community feedback
            </SectionTitle>
            <SectionDescription>
              From collection to resolution, Sunflower CFM provides a
              comprehensive toolkit to manage feedback and complaints
              effectively.
            </SectionDescription>
          </SectionHeader>

          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index}>
                <FeatureIconWrapper $bg={feature.bg} $color={feature.color}>
                  <feature.icon />
                </FeatureIconWrapper>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </SectionInner>
      </FeaturesSection>

      {/* How It Works */}
      <HowItWorksSection>
        <SectionInner>
          <SectionHeader>
            <SectionLabel>How It Works</SectionLabel>
            <SectionTitle>Simple process, powerful outcomes</SectionTitle>
            <SectionDescription>
              Our streamlined workflow ensures every piece of feedback is heard,
              tracked, and acted on.
            </SectionDescription>
          </SectionHeader>

          <StepsGrid>
            {steps.map((step) => (
              <StepCard key={step.number}>
                <StepNumber>{step.number}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepCard>
            ))}
          </StepsGrid>
        </SectionInner>
      </HowItWorksSection>

      {/* CTA */}
      <CTASection>
        <CTACard>
          <CTAContent>
            <CTATitle>Ready to improve service delivery?</CTATitle>
            <CTADescription>
              Whether you&apos;re a beneficiary wanting to share feedback or a
              team member managing cases, Sunflower CFM is here to help.
            </CTADescription>
            <CTAActions>
              <CTAButton to="/home/submit-feedback" className="primary">
                Submit Feedback
                <HiOutlineArrowRight />
              </CTAButton>
              <CTAButton to="/login" className="outline">
                Team Login
                <HiOutlineArrowRight />
              </CTAButton>
            </CTAActions>
          </CTAContent>
        </CTACard>
      </CTASection>
    </>
  );
}

export default LandingPage;
