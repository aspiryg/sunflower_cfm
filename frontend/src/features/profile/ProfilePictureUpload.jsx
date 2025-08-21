import { useRef, useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineCamera,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlinePhoto,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import toast from "react-hot-toast";

import Button from "../../ui/Button";
import Text from "../../ui/Text";
import Modal from "../../ui/Modal";
import { useUploadProfilePicture } from "./useProfile";
import DeleteProfilePictureModal from "./modals/DeleteProfilePictureModal";

const PictureContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
`;

const PictureWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileImage = styled.img`
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-grey-200);
  background-color: var(--color-grey-100);

  @media (max-width: 640px) {
    width: 10rem;
    height: 10rem;
  }
`;

const PlaceholderAvatar = styled.div`
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  background-color: var(--color-grey-200);
  border: 4px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-500);

  svg {
    width: 4rem;
    height: 4rem;
  }

  @media (max-width: 640px) {
    width: 10rem;
    height: 10rem;

    svg {
      width: 3rem;
      height: 3rem;
    }
  }
`;

const OverlayButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-color: var(--color-brand-500);
  color: var(--color-grey-0);
  border: 3px solid var(--color-grey-0);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-brand-600);
    transform: scale(1.05);
  }

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 640px) {
    width: 3rem;
    height: 3rem;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadArea = styled.div`
  border: 2px dashed var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  text-align: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);
  background-color: var(--color-grey-25);

  &:hover {
    border-color: var(--color-brand-400);
    background-color: var(--color-brand-25);
  }

  &.drag-over {
    border-color: var(--color-brand-500);
    background-color: var(--color-brand-50);
  }
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-3);
  color: var(--color-grey-400);

  svg {
    width: 3rem;
    height: 3rem;
  }
`;

const FilePreview = styled.div`
  margin-top: var(--spacing-4);
  padding: var(--spacing-3);
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const PreviewImage = styled.img`
  width: 100%;
  max-width: 20rem;
  max-height: 20rem;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  margin: 0 auto;
  display: block;
`;

const FileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-2);
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background-color: var(--color-warning-25);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-3);

  svg {
    color: var(--color-warning-600);
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
  }
`;

function ProfilePictureUpload({ user, onSuccess }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const uploadMutation = useUploadProfilePicture({
    onSuccess: (data) => {
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (onSuccess) onSuccess(data);
    },
  });

  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, or WebP)";
    }

    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    return null;
  };

  const handleFileSelect = (file) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync(selectedFile);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (data) => {
    setIsDeleteModalOpen(false);
    if (onSuccess) onSuccess(data);
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <PictureContainer>
        <PictureWrapper>
          {user?.profilePicture ? (
            <ProfileImage
              src={user.profilePicture}
              alt={`${user.firstName || "User"}'s profile`}
              onError={(e) => {
                console.error(
                  "Failed to load profile picture:",
                  user.profilePicture
                );
                e.target.style.display = "none";
              }}
            />
          ) : (
            <PlaceholderAvatar>
              <HiOutlineUser />
            </PlaceholderAvatar>
          )}

          <OverlayButton
            onClick={openUploadModal}
            aria-label="Change profile picture"
          >
            <HiOutlineCamera />
          </OverlayButton>
        </PictureWrapper>

        <ActionButtons>
          <Button
            variant="secondary"
            size="small"
            onClick={openUploadModal}
            disabled={uploadMutation.isPending}
          >
            <HiOutlineCamera />
            {user?.profilePicture ? "Change Photo" : "Upload Photo"}
          </Button>

          {user?.profilePicture && (
            <Button
              variant="danger"
              size="small"
              onClick={handleDelete}
              disabled={uploadMutation.isPending}
            >
              <HiOutlineTrash />
              Remove Photo
            </Button>
          )}
        </ActionButtons>
      </PictureContainer>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        title="Upload Profile Picture"
        description="Choose a new profile picture"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeUploadModal}
              disabled={uploadMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              loading={uploadMutation.isPending}
            >
              Upload Picture
            </Button>
          </>
        }
      >
        <div>
          <UploadArea
            className={dragOver ? "drag-over" : ""}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon>
              <HiOutlinePhoto />
            </UploadIcon>
            <Text
              size="lg"
              weight="medium"
              style={{ marginBottom: "var(--spacing-2)" }}
            >
              {selectedFile ? "File Selected" : "Choose or drag a photo"}
            </Text>
            <Text size="sm" color="muted">
              Supports JPEG, PNG, and WebP up to 5MB
            </Text>
          </UploadArea>

          <FileInput
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
          />

          {selectedFile && (
            <FilePreview>
              {previewUrl && <PreviewImage src={previewUrl} alt="Preview" />}
              <FileInfo>
                <div>
                  <Text size="sm" weight="medium">
                    {selectedFile.name}
                  </Text>
                  <Text size="xs" color="muted">
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </div>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Remove
                </Button>
              </FileInfo>
            </FilePreview>
          )}

          <WarningMessage>
            <HiOutlineExclamationTriangle />
            <Text size="sm">
              Your profile picture will be visible to other users. Make sure
              it's appropriate and represents you well.
            </Text>
          </WarningMessage>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteProfilePictureModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={user}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

ProfilePictureUpload.propTypes = {
  user: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};

export default ProfilePictureUpload;
