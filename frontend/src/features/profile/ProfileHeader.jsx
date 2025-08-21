import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineClock,
} from "react-icons/hi2";

import Card from "../../ui/Card";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import StatusBadge from "../../ui/StatusBadge";
import ProfilePictureUpload from "./ProfilePictureUpload";
import { formatRelativeTime } from "../../utils/dateUtils";

const HeaderCard = styled(Card)`
  padding: var(--spacing-6);
  background: linear-gradient(
    135deg,
    var(--color-brand-50) 0%,
    var(--color-grey-25) 100%
  );
  border: 1px solid var(--color-brand-200);

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const HeaderContent = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--spacing-6);
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--spacing-4);
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0; /* Allow text to truncate */
`;

const UserName = styled(Heading)`
  margin: 0;
  color: var(--color-grey-900);
`;

const UserEmail = styled(Text)`
  color: var(--color-grey-600);
  word-break: break-word;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const UserMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-grey-500);

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  align-items: flex-end;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const StatusGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

function ProfileHeader({ user, onRefresh }) {
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.username) {
      return user.username;
    }
    return "User";
  };

  const handleProfileUpdate = (data) => {
    console.log("Profile updated:", data);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <HeaderCard>
      <HeaderContent>
        {/* Profile Picture */}
        <ProfilePictureUpload user={user} onSuccess={handleProfileUpdate} />

        {/* User Information */}
        <UserInfo>
          <UserName as="h2" size="h2">
            {getUserDisplayName()}
          </UserName>

          <UserEmail size="lg" weight="medium">
            {user?.email}
          </UserEmail>

          {user?.bio && (
            <Text
              size="sm"
              color="muted"
              style={{ marginTop: "var(--spacing-2)", lineHeight: 1.5 }}
            >
              {user.bio}
            </Text>
          )}

          <UserMeta>
            <MetaItem>
              <HiOutlineUser />
              <Text size="xs" weight="medium">
                {user?.role?.replace("_", " ").toUpperCase() || "USER"}
              </Text>
            </MetaItem>

            {user?.organization && (
              <MetaItem>
                <Text size="xs">at {user.organization}</Text>
              </MetaItem>
            )}

            {user?.lastLogin && (
              <MetaItem>
                <HiOutlineClock />
                <Text size="xs">
                  Last seen {formatRelativeTime(user.lastLogin)}
                </Text>
              </MetaItem>
            )}
          </UserMeta>
        </UserInfo>

        {/* Status Section */}
        <StatusSection>
          <StatusGrid>
            <StatusBadge
              content={user?.isActive ? "Active" : "Inactive"}
              variant={user?.isActive ? "success" : "error"}
              size="sm"
            />

            <StatusBadge
              content={user?.isEmailVerified ? "Verified" : "Unverified"}
              variant={user?.isEmailVerified ? "success" : "warning"}
              size="sm"
            />

            {user?.twoFactorEnabled && (
              <StatusBadge content="2FA Enabled" variant="success" size="sm" />
            )}
          </StatusGrid>

          {user?.isEmailVerified && (
            <MetaItem>
              <HiOutlineShieldCheck />
              <Text size="xs" color="success">
                Email Verified
              </Text>
            </MetaItem>
          )}
        </StatusSection>
      </HeaderContent>
    </HeaderCard>
  );
}

ProfileHeader.propTypes = {
  user: PropTypes.object.isRequired,
  onRefresh: PropTypes.func,
};

export default ProfileHeader;
