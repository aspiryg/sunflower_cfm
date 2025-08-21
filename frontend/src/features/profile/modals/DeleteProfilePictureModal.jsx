import PropTypes from "prop-types";
import { HiOutlineExclamationTriangle, HiOutlineTrash } from "react-icons/hi2";
import styled from "styled-components";

import { ConfirmationModal } from "../../../ui/Modal";
import Text from "../../../ui/Text";
import { useDeleteProfilePicture } from "../useProfile";

const WarningContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  text-align: center;
`;

const WarningIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background-color: var(--color-error-100);
  color: var(--color-error-600);
  border-radius: 50%;

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const ProfilePreview = styled.img`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-grey-200);
  margin: var(--spacing-2) 0;
`;

function DeleteProfilePictureModal({ isOpen, onClose, user, onSuccess }) {
  const deleteMutation = useDeleteProfilePicture({
    onSuccess: (data) => {
      onClose();
      if (onSuccess) onSuccess(data);
    },
  });

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete Profile Picture"
      confirmText="Delete Picture"
      cancelText="Cancel"
      isLoading={deleteMutation.isPending}
      destructive={true}
    >
      <WarningContent>
        <WarningIcon>
          <HiOutlineExclamationTriangle />
        </WarningIcon>

        {user?.profilePicture && (
          <ProfilePreview
            src={user.profilePicture}
            alt="Current profile picture"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        <div>
          <Text
            size="lg"
            weight="semibold"
            style={{ marginBottom: "var(--spacing-2)" }}
          >
            Are you sure you want to delete your profile picture?
          </Text>
          <Text size="sm" color="muted">
            This action cannot be undone. Your profile picture will be
            permanently removed from your account.
          </Text>
        </div>
      </WarningContent>
    </ConfirmationModal>
  );
}

DeleteProfilePictureModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};

export default DeleteProfilePictureModal;
