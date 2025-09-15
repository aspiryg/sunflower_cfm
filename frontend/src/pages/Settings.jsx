import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { HiOutlineCog8Tooth } from "react-icons/hi2";
// import PageContainer from "../ui/PageContainer";
import Heading from "../ui/Heading";
import Text from "../ui/Text";
import Card from "../ui/Card";

// Update your Settings.jsx file to include a link to Resources
// Add this to your settings navigation or as a settings card

// In your Settings.jsx file, add this section:

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

const SettingsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-5);
`;

const SettingsCard = styled(Card)`
  padding: var(--spacing-5);
  border: 1px solid var(--color-grey-200);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;

  &:hover {
    border-color: var(--color-brand-300);
    box-shadow: var(--shadow-md);
  }
`;

// Add this to your Settings component:
function Settings() {
  const navigate = useNavigate();

  const settingsOptions = [
    {
      title: "Case Resources",
      description:
        "Manage categories, statuses, priorities, and other case supporting resources",
      icon: HiOutlineCog8Tooth,
      path: "/settings/resources",
      color: "var(--color-brand-500)",
    },
    // ... other settings options
  ];

  return (
    <PageContainer>
      {/* ... existing settings header ... */}

      <SettingsSection>
        {settingsOptions.map((option) => (
          <SettingsCard key={option.path} onClick={() => navigate(option.path)}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--spacing-3)",
              }}
            >
              <div
                style={{
                  padding: "var(--spacing-3)",
                  backgroundColor: `${option.color}20`,
                  borderRadius: "var(--border-radius-md)",
                  color: option.color,
                }}
              >
                <option.icon style={{ width: "2.4rem", height: "2.4rem" }} />
              </div>

              <div style={{ flex: 1 }}>
                <Heading
                  as="h3"
                  size="h5"
                  style={{ marginBottom: "var(--spacing-2)" }}
                >
                  {option.title}
                </Heading>
                <Text size="sm" color="muted">
                  {option.description}
                </Text>
              </div>
            </div>
          </SettingsCard>
        ))}
      </SettingsSection>
    </PageContainer>
  );
}

export default Settings;
