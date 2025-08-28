import { useState } from "react";
import styled from "styled-components";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlinePencil,
  HiOutlineCamera,
  HiArrowPath,
  HiOutlineUserCircle,
} from "react-icons/hi2";

import { useAuth } from "../contexts/AuthContext";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import LoadingSpinner from "../ui/LoadingSpinner";
import Text from "../ui/Text";
import Heading from "../ui/Heading";
import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";
import Breadcrumb from "../ui/Breadcrumb";
import EditPersonalInfoModal from "../features/profile/modals/EditPersonalInfoModal";
import EditContactInfoModal from "../features/profile/modals/EditContactInfoModal";
import EditSecurityModal from "../features/profile/modals/EditSecurityModal";
import ProfileHeader from "../features/profile/ProfileHeader";
import { useProfile } from "../features/profile/useProfile";
import { formatRelativeTime } from "../utils/dateUtils";

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
  align-items: flex-start;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(45rem, 1fr));
  gap: var(--spacing-6);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
`;

const SectionCard = styled(Card)`
  padding: var(--spacing-5);
  border: 1px solid var(--color-grey-200);
  transition: all var(--duration-normal) var(--ease-in-out);
  position: relative;

  &:hover {
    border-color: var(--color-grey-300);
    box-shadow: var(--shadow-sm);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const SectionTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  border-radius: var(--border-radius-md);

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const SectionTitleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const Field = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2);
  border-radius: var(--border-radius-md);
  transition: background-color var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-25);
  }
`;

const FieldLabel = styled(Text)`
  color: var(--color-grey-600);
  font-weight: var(--font-weight-medium);
`;

const FieldValue = styled(Text)`
  color: var(--color-grey-800);
  text-align: right;
`;

const EmptyValue = styled(Text)`
  color: var(--color-grey-400);
  font-style: italic;
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
  const { user } = useAuth();
  const { data: response, isLoading, error, refetch, isError } = useProfile();
  const profile = response?.data || null;

  // Modal states
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [isContactInfoModalOpen, setIsContactInfoModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  const handleRefresh = () => {
    refetch();
  };

  // Use profile data or fallback to auth user
  const currentUser = profile || user;

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "My Profile",
      to: "/my-profile",
      icon: HiOutlineUserCircle,
    },
  ];

  const getUserDisplayName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    if (currentUser?.username) {
      return currentUser.username;
    }
    return "User";
  };

  const handleProfilePictureSuccess = () => {
    handleRefresh();
  };

  const handlePersonalInfoSuccess = () => {
    handleRefresh();
  };

  const handleContactInfoSuccess = () => {
    handleRefresh();
  };

  const handleSecuritySuccess = () => {
    handleRefresh();
  };

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

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader>
        <HeaderTop>
          <HeaderContent>
            <Heading as="h1" size="h1">
              My Profile
            </Heading>
            <Text size="lg" color="muted">
              Manage your personal information and account settings
            </Text>
          </HeaderContent>

          <HeaderActions>
            <IconButton
              variant="ghost"
              size="medium"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Refresh profile"
            >
              <HiArrowPath className={isLoading ? "animate-spin" : ""} />
            </IconButton>
          </HeaderActions>
        </HeaderTop>
      </PageHeader>

      {/* Profile Summary Card */}
      <ProfileHeader user={currentUser} onRefresh={handleRefresh} />

      {/* Profile Sections */}
      <SectionsGrid>
        {/* Personal Information Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleGroup>
              <SectionIcon>
                <HiOutlineUser />
              </SectionIcon>
              <SectionTitleContent>
                <Heading as="h3" size="h4">
                  Personal Information
                </Heading>
                <Text size="sm" color="muted">
                  Your basic personal details
                </Text>
              </SectionTitleContent>
            </SectionTitleGroup>
            <IconButton
              variant="ghost"
              size="small"
              onClick={() => setIsPersonalInfoModalOpen(true)}
              aria-label="Edit personal information"
            >
              <HiOutlinePencil />
            </IconButton>
          </SectionHeader>

          <SectionContent>
            <FieldGroup>
              <Field>
                <FieldLabel size="sm">First Name</FieldLabel>
                {currentUser?.firstName ? (
                  <FieldValue size="sm" weight="medium">
                    {currentUser.firstName}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Not provided</EmptyValue>
                )}
              </Field>

              <Field>
                <FieldLabel size="sm">Last Name</FieldLabel>
                {currentUser?.lastName ? (
                  <FieldValue size="sm" weight="medium">
                    {currentUser.lastName}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Not provided</EmptyValue>
                )}
              </Field>

              <Field>
                <FieldLabel size="sm">Date of Birth</FieldLabel>
                {currentUser?.dateOfBirth ? (
                  <FieldValue size="sm" weight="medium">
                    {new Date(currentUser.dateOfBirth).toLocaleDateString()}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Not provided</EmptyValue>
                )}
              </Field>

              <Field>
                <FieldLabel size="sm">Organization</FieldLabel>
                {currentUser?.organization ? (
                  <FieldValue size="sm" weight="medium">
                    {currentUser.organization}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Not provided</EmptyValue>
                )}
              </Field>
            </FieldGroup>

            {currentUser?.bio && (
              <FieldGroup style={{ marginTop: "var(--spacing-3)" }}>
                <FieldLabel size="sm">About</FieldLabel>
                <Text
                  size="sm"
                  style={{ lineHeight: 1.6, marginTop: "var(--spacing-2)" }}
                >
                  {currentUser.bio}
                </Text>
              </FieldGroup>
            )}
          </SectionContent>
        </SectionCard>

        {/* Contact Information Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleGroup>
              <SectionIcon>
                <HiOutlineEnvelope />
              </SectionIcon>
              <SectionTitleContent>
                <Heading as="h3" size="h4">
                  Contact Information
                </Heading>
                <Text size="sm" color="muted">
                  Your contact details and address
                </Text>
              </SectionTitleContent>
            </SectionTitleGroup>
            <IconButton
              variant="ghost"
              size="small"
              onClick={() => setIsContactInfoModalOpen(true)}
              aria-label="Edit contact information"
            >
              <HiOutlinePencil />
            </IconButton>
          </SectionHeader>

          <SectionContent>
            <FieldGroup>
              <Field>
                <FieldLabel size="sm">Email Address</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {currentUser?.email || "Not provided"}
                </FieldValue>
              </Field>

              <Field>
                <FieldLabel size="sm">Phone Number</FieldLabel>
                {currentUser?.phone ? (
                  <FieldValue size="sm" weight="medium">
                    {currentUser.phone}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Not provided</EmptyValue>
                )}
              </Field>

              <Field>
                <FieldLabel size="sm">Address</FieldLabel>
                {currentUser?.address ? (
                  <FieldValue size="sm" weight="medium">
                    {currentUser.address}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Not provided</EmptyValue>
                )}
              </Field>

              <Field>
                <FieldLabel size="sm">City</FieldLabel>
                {currentUser?.city ? (
                  <FieldValue size="sm" weight="medium">
                    {currentUser.city}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Not provided</EmptyValue>
                )}
              </Field>

              <Field>
                <FieldLabel size="sm">Country</FieldLabel>
                {currentUser?.country ? (
                  <FieldValue size="sm" weight="medium">
                    {currentUser.country}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Not provided</EmptyValue>
                )}
              </Field>
            </FieldGroup>
          </SectionContent>
        </SectionCard>

        {/* Security Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleGroup>
              <SectionIcon>
                <HiOutlineLockClosed />
              </SectionIcon>
              <SectionTitleContent>
                <Heading as="h3" size="h4">
                  Security & Privacy
                </Heading>
                <Text size="sm" color="muted">
                  Account security and authentication
                </Text>
              </SectionTitleContent>
            </SectionTitleGroup>
            <IconButton
              variant="ghost"
              size="small"
              onClick={() => setIsSecurityModalOpen(true)}
              aria-label="Edit security settings"
            >
              <HiOutlinePencil />
            </IconButton>
          </SectionHeader>

          <SectionContent>
            <FieldGroup>
              <Field>
                <FieldLabel size="sm">Username</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {currentUser?.username || "Not set"}
                </FieldValue>
              </Field>

              <Field>
                <FieldLabel size="sm">Email Verification</FieldLabel>
                <StatusBadge
                  content={
                    currentUser?.isEmailVerified ? "Verified" : "Pending"
                  }
                  variant={currentUser?.isEmailVerified ? "success" : "warning"}
                  size="privacy"
                />
              </Field>

              <Field>
                <FieldLabel size="sm">Two-Factor Auth</FieldLabel>
                <StatusBadge
                  content={
                    currentUser?.twoFactorEnabled ? "Enabled" : "Disabled"
                  }
                  variant={currentUser?.twoFactorEnabled ? "success" : "error"}
                  size="privacy"
                />
              </Field>

              <Field>
                <FieldLabel size="sm">Account Status</FieldLabel>
                <StatusBadge
                  content={currentUser?.isActive ? "Active" : "Inactive"}
                  variant={currentUser?.isActive ? "success" : "error"}
                  size="privacy"
                />
              </Field>
            </FieldGroup>
          </SectionContent>
        </SectionCard>

        {/* Account Activity Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitleGroup>
              <SectionIcon>
                <HiOutlineShieldCheck />
              </SectionIcon>
              <SectionTitleContent>
                <Heading as="h3" size="h4">
                  Account Activity
                </Heading>
                <Text size="sm" color="muted">
                  Recent account activity and timestamps
                </Text>
              </SectionTitleContent>
            </SectionTitleGroup>
          </SectionHeader>

          <SectionContent>
            <FieldGroup>
              <Field>
                <FieldLabel size="sm">Account Created</FieldLabel>
                {currentUser?.createdAt ? (
                  <FieldValue size="sm" weight="medium">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Unknown</EmptyValue>
                )}
              </Field>

              <Field>
                <FieldLabel size="sm">Last Updated</FieldLabel>
                {currentUser?.updatedAt ? (
                  <FieldValue size="sm" weight="medium">
                    {formatRelativeTime(currentUser.updatedAt)}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Never</EmptyValue>
                )}
              </Field>

              <Field>
                <FieldLabel size="sm">Last Login</FieldLabel>
                {currentUser?.lastLogin ? (
                  <FieldValue size="sm" weight="medium">
                    {formatRelativeTime(currentUser.lastLogin)}
                  </FieldValue>
                ) : (
                  <EmptyValue size="sm">Never</EmptyValue>
                )}
              </Field>

              <Field>
                <FieldLabel size="sm">Login Attempts</FieldLabel>
                <FieldValue size="sm" weight="medium">
                  {currentUser?.loginAttempts || 0}
                </FieldValue>
              </Field>
            </FieldGroup>
          </SectionContent>
        </SectionCard>
      </SectionsGrid>

      {/* Modals */}
      <EditPersonalInfoModal
        isOpen={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
        user={currentUser}
        onSuccess={handlePersonalInfoSuccess}
      />

      <EditContactInfoModal
        isOpen={isContactInfoModalOpen}
        onClose={() => setIsContactInfoModalOpen(false)}
        user={currentUser}
        onSuccess={handleContactInfoSuccess}
      />

      <EditSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        user={currentUser}
        onSuccess={handleSecuritySuccess}
      />
    </PageContainer>
  );
}

export default MyProfile;
