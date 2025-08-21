import { useState } from "react";
import styled from "styled-components";
import { HiUser, HiOutlineLockClosed, HiOutlinePencil } from "react-icons/hi2";
import { HiLocationMarker } from "react-icons/hi";

import { useAuth } from "../contexts/AuthContext";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import Text from "../ui/Text";
import Heading from "../ui/Heading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import ProfileHeader from "../features/profile/ProfileHeader";
import PersonalInfoSection from "../features/profile/PersonalInfoSection";
import ContactInfoSection from "../features/profile/ContactInfoSection";
import SecuritySection from "../features/profile/SecuritySection";
import EditProfileForm from "../features/profile/EditProfileForm";
import { useProfile } from "../features/profile/useProfile";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: var(--container-xl);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--spacing-4);

  @media (max-width: 768px) {
    gap: var(--spacing-4);
    padding: 0 var(--spacing-2);
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: var(--spacing-2);

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`;

const TabsContainer = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  min-height: 40rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  text-align: center;
`;

function MyProfile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useAuth();

  const { data: response, isLoading, error, refetch, isError } = useProfile();
  const profile = response?.data || null;

  const handleRefresh = () => {
    refetch();
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleEditSuccess = () => {
    setIsEditMode(false);
    handleRefresh();
  };

  // Use auth user as fallback if profile isn't loaded yet
  const currentUser = profile || user;

  // Loading state
  if (isLoading && !user) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner size="large" />
          <Text size="lg" color="muted">
            Loading your profile...
          </Text>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Error state
  if (isError && !user) {
    return (
      <PageContainer>
        <ErrorContainer>
          <Text size="lg" weight="semibold" color="error">
            Failed to load profile
          </Text>
          <Text size="sm" color="muted">
            {error?.message ||
              "Something went wrong while loading your profile."}
          </Text>
          <Button variant="primary" onClick={handleRefresh}>
            Try Again
          </Button>
        </ErrorContainer>
      </PageContainer>
    );
  }

  const tabs = [
    {
      value: "personal",
      label: "Personal Info",
      icon: HiUser,
    },
    {
      value: "contact",
      label: "Contact & Location",
      icon: HiLocationMarker,
    },
    {
      value: "security",
      label: "Security & Password",
      icon: HiOutlineLockClosed,
    },
  ];

  return (
    <PageContainer>
      {/* Header Section */}
      <PageHeader>
        <HeaderTop>
          <div>
            <Heading as="h1" size="h1">
              My Profile
            </Heading>
            <Text size="lg" color="muted">
              Manage your personal information and account settings
            </Text>
          </div>

          <HeaderActions>
            <Button
              variant="secondary"
              size="medium"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant={isEditMode ? "secondary" : "primary"}
              size="medium"
              onClick={handleEditToggle}
            >
              <HiOutlinePencil />
              {isEditMode ? "Cancel Edit" : "Edit Profile"}
            </Button>
          </HeaderActions>
        </HeaderTop>
      </PageHeader>

      {/* Profile Header Card */}
      <ProfileHeader user={currentUser} onRefresh={handleRefresh} />

      {/* Content Tabs */}
      <ContentArea>
        <TabsContainer>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  icon={tab.icon}
                  data-label={tab.label.charAt(0)}
                >
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="personal">
              {isEditMode ? (
                <EditProfileForm
                  user={currentUser}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setIsEditMode(false)}
                />
              ) : (
                <PersonalInfoSection user={currentUser} />
              )}
            </TabsContent>

            <TabsContent value="contact">
              <ContactInfoSection user={currentUser} />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySection user={currentUser} />
            </TabsContent>
          </Tabs>
        </TabsContainer>
      </ContentArea>
    </PageContainer>
  );
}

export default MyProfile;
