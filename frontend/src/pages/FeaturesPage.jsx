import { Link } from "react-router-dom";
import styled from "styled-components";
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
  HiOutlineUserGroup,
  HiOutlineLockClosed,
  HiOutlineServerStack,
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
  max-width: 128rem;
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

/* Main features section */
const MainFeaturesSection = styled.section`
  padding: var(--spacing-12) var(--spacing-6);

  @media (max-width: 768px) {
    padding: var(--spacing-8) var(--spacing-4);
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

const FeatureIcon = styled.div`
  width: 5.2rem;
  height: 5.2rem;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-4);
  background: ${(props) => props.$bg || "var(--color-brand-50)"};
  color: ${(props) => props.$color || "var(--color-brand-600)"};

  svg {
    width: 2.6rem;
    height: 2.6rem;
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
  line-height: 1.7;
`;

const FeatureTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
`;

const Tag = styled.span`
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-grey-100);
  color: var(--color-grey-600);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
`;

/* Technical section */
const TechSection = styled.section`
  padding: var(--spacing-12) var(--spacing-6);
  background: linear-gradient(
    180deg,
    var(--color-grey-50) 0%,
    var(--color-grey-0) 100%
  );

  @media (max-width: 768px) {
    padding: var(--spacing-8) var(--spacing-4);
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 68rem;
  margin: 0 auto var(--spacing-10);
`;

const TechGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-6);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TechCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  text-align: center;
`;

const TechIconWrapper = styled.div`
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

const TechTitle = styled.h3`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  margin-bottom: var(--spacing-2);
`;

const TechDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-500);
  line-height: 1.6;
`;

/* CTA */
const CTASection = styled.section`
  padding: var(--spacing-12) var(--spacing-6);

  @media (max-width: 768px) {
    padding: var(--spacing-8) var(--spacing-4);
  }
`;

const CTACard = styled.div`
  max-width: 80rem;
  margin: 0 auto;
  background: linear-gradient(
    135deg,
    var(--color-brand-600),
    var(--color-indigo-600)
  );
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-10) var(--spacing-8);
  text-align: center;

  @media (max-width: 768px) {
    padding: var(--spacing-8) var(--spacing-6);
  }
`;

const CTATitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: white;
  margin-bottom: var(--spacing-3);

  @media (max-width: 768px) {
    font-size: var(--font-size-2xl);
  }
`;

const CTADescription = styled.p`
  font-size: var(--font-size-base);
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: var(--spacing-6);
  max-width: 50rem;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background-color: white;
  color: var(--color-brand-700);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-in-out);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);

  svg {
    width: 2rem;
    height: 2rem;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

/* ==================== DATA ==================== */
const featuresList = [
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: "Multi-Channel Feedback Collection",
    description:
      "Receive feedback and complaints from multiple channels including phone, in-person visits, online form, hotline, social media, and partner referrals. Each channel is tracked and reported separately.",
    tags: ["Phone", "In-Person", "Online", "Hotline", "Social Media"],
    bg: "var(--color-brand-50)",
    color: "var(--color-brand-600)",
  },
  {
    icon: HiOutlineSparkles,
    title: "AI-Powered Smart Classification",
    description:
      "Leverage intelligent models that analyze feedback content to suggest the appropriate category, priority level, and recommended handling procedures — saving time and improving consistency.",
    tags: ["Auto-Classify", "Priority Suggestion", "Procedure Recommender"],
    bg: "var(--color-purple-50)",
    color: "var(--color-purple-600)",
  },
  {
    icon: HiOutlineClipboardDocumentList,
    title: "Full Case Lifecycle Management",
    description:
      "Manage cases from first receipt through classification, assignment, investigation, resolution, and closure. Track status transitions and ensure nothing falls through the cracks.",
    tags: ["Create", "Assign", "Investigate", "Resolve", "Close"],
    bg: "var(--color-green-50)",
    color: "var(--color-green-600)",
  },
  {
    icon: HiOutlineClock,
    title: "SLA Monitoring & Escalation",
    description:
      "Define Service Level Agreements per case type and priority. Automated reminders warn before deadlines, and escalation procedures kick in when SLAs are breached.",
    tags: ["SLA Timers", "Auto-Reminders", "Escalation", "Breach Alerts"],
    bg: "var(--color-orange-50)",
    color: "var(--color-orange-600)",
  },
  {
    icon: HiOutlineDocumentMagnifyingGlass,
    title: "Timeline & Audit Trail",
    description:
      "Every action is logged — status changes, reassignments, comments, edits. Build a comprehensive case timeline to review what happened, when, and by whom.",
    tags: ["Change Log", "Assignment History", "Status Timeline"],
    bg: "var(--color-blue-50)",
    color: "var(--color-blue-600)",
  },
  {
    icon: HiOutlineBellAlert,
    title: "Smart Notification System",
    description:
      "Real-time in-app and email notifications keep team members informed about new assignments, status updates, comments, SLA warnings, and important deadlines.",
    tags: ["In-App", "Email Alerts", "SLA Warnings", "Assignment Alerts"],
    bg: "var(--color-red-50)",
    color: "var(--color-red-600)",
  },
  {
    icon: HiOutlineMapPin,
    title: "Geographic Hierarchy Management",
    description:
      "Map feedback to a three-level geographic hierarchy: Region, Governorate, and Community. Analyze patterns by location and allocate resources where they are needed most.",
    tags: ["Regions", "Governorates", "Communities", "Location Analytics"],
    bg: "var(--color-teal-100)",
    color: "var(--color-teal-700)",
  },
  {
    icon: HiOutlineAdjustmentsHorizontal,
    title: "Customizable Resources & Metadata",
    description:
      "Configure categories, statuses, priorities, channels, provider types, programs, projects, and activities to match your organization's specific needs and workflows.",
    tags: ["Categories", "Statuses", "Priorities", "Programs", "Projects"],
    bg: "var(--color-yellow-50)",
    color: "var(--color-yellow-700)",
  },
  {
    icon: HiOutlineChartBarSquare,
    title: "Analytics Dashboard & Reports",
    description:
      "Interactive dashboards with case statistics, trend analysis, SLA performance, team workload, and geographic distribution — all filterable and exportable.",
    tags: ["Statistics", "Trends", "SLA Reports", "Workload"],
    bg: "var(--color-indigo-50)",
    color: "var(--color-indigo-600)",
  },
];

const technicalFeatures = [
  {
    icon: HiOutlineUserGroup,
    title: "Role-Based Access Control",
    description:
      "Granular permissions ensure team members see and do only what their role allows. Admin, supervisor, and user roles with customizable permissions.",
    bg: "var(--color-brand-50)",
    color: "var(--color-brand-600)",
  },
  {
    icon: HiOutlineLockClosed,
    title: "Security & Compliance",
    description:
      "Secure authentication with email verification, rate limiting, account lockout protection, and encrypted data transmission.",
    bg: "var(--color-green-50)",
    color: "var(--color-green-600)",
  },
  {
    icon: HiOutlineServerStack,
    title: "Cloud Infrastructure",
    description:
      "Hosted on Azure with SQL Server, blob storage for attachments, and a scalable architecture built with Node.js and React.",
    bg: "var(--color-blue-50)",
    color: "var(--color-blue-600)",
  },
];

/* ==================== COMPONENT ==================== */
function FeaturesPage() {
  return (
    <PageContainer>
      {/* Hero */}
      <HeroSection>
        <SectionInner>
          <SectionLabel>Platform Features</SectionLabel>
          <PageTitle>Built for effective feedback management</PageTitle>
          <PageSubtitle>
            Explore the full set of capabilities that make Sunflower CFM a
            comprehensive solution for community feedback and complaint
            management in the Occupied Palestinian Territories.
          </PageSubtitle>
        </SectionInner>
      </HeroSection>

      {/* Main Features */}
      <MainFeaturesSection>
        <SectionInner>
          <FeaturesGrid>
            {featuresList.map((feature, index) => (
              <FeatureCard key={index}>
                <FeatureIcon $bg={feature.bg} $color={feature.color}>
                  <feature.icon />
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
                <FeatureTags>
                  {feature.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </FeatureTags>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </SectionInner>
      </MainFeaturesSection>

      {/* Technical Features */}
      <TechSection>
        <SectionInner>
          <SectionHeader>
            <SectionLabel>Technical Foundation</SectionLabel>
            <PageTitle as="h2" style={{ fontSize: "var(--font-size-3xl)" }}>
              Built with security and scale in mind
            </PageTitle>
          </SectionHeader>

          <TechGrid>
            {technicalFeatures.map((tech, index) => (
              <TechCard key={index}>
                <TechIconWrapper $bg={tech.bg} $color={tech.color}>
                  <tech.icon />
                </TechIconWrapper>
                <TechTitle>{tech.title}</TechTitle>
                <TechDescription>{tech.description}</TechDescription>
              </TechCard>
            ))}
          </TechGrid>
        </SectionInner>
      </TechSection>

      {/* CTA */}
      <CTASection>
        <CTACard>
          <CTATitle>Want to learn more?</CTATitle>
          <CTADescription>
            Submit your feedback through our simple public form or contact the
            team to learn more about how Sunflower CFM works.
          </CTADescription>
          <CTAButton to="/home/submit-feedback">
            Submit Feedback
            <HiOutlineArrowRight />
          </CTAButton>
        </CTACard>
      </CTASection>
    </PageContainer>
  );
}

export default FeaturesPage;
