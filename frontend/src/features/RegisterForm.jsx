// filepath: /home/ahmadspierij/projects/sunflower_cfm/frontend/src/features/auth/RegisterForm.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineBuilding,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import PasswordInput from "../../ui/PasswordInput";
import FormField from "../../ui/FormField";
import EnhancedCheckbox from "../../ui/EnhancedCheckbox";
import Column from "../../ui/Column";
import { useRegister } from "./useAuth";

const FormContainer = styled.form`
  width: 100%;
  max-width: 60rem;
  margin: 0 auto;
`;

const ErrorMessage = styled.div`
  color: var(--color-error-600);
  background-color: var(--color-error-50);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-error-200);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 480px) {
    padding: var(--spacing-2);
    font-size: var(--font-size-sm);
  }
`;

const SuccessMessage = styled.div`
  color: var(--color-success-600);
  background-color: var(--color-success-50);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-success-200);
  margin-bottom: var(--spacing-4);
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: var(--color-brand-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-fast) var(--ease-in-out);

  &:hover {
    color: var(--color-brand-700);
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
    border-radius: var(--border-radius-sm);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const PasswordStrengthContainer = styled.div`
  margin-top: var(--spacing-2);
`;

const StrengthBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--color-grey-200);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-2);
`;

const StrengthFill = styled.div`
  height: 100%;
  width: ${(props) => props.$strength}%;
  background-color: ${(props) => {
    if (props.$strength < 25) return "var(--color-error-500)";
    if (props.$strength < 50) return "var(--color-warning-500)";
    if (props.$strength < 75) return "var(--color-info-500)";
    return "var(--color-success-500)";
  }};
  transition: all var(--duration-normal) var(--ease-in-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const PasswordRequirements = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--spacing-1);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: ${(props) =>
    props.$met ? "var(--color-success-600)" : "var(--color-grey-500)"};
  font-size: var(--font-size-sm);
  transition: color var(--duration-fast) var(--ease-in-out);

  &::before {
    content: ${(props) => (props.$met ? '"✓"' : '"○"')};
    font-weight: bold;
    width: 1.2rem;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TermsSection = styled.div`
  background-color: var(--color-grey-25);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin: var(--spacing-4) 0;
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: var(--spacing-6);
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  background-color: var(--color-success-100);
  border-radius: 50%;
  color: var(--color-success-600);
  margin: 0 auto var(--spacing-4);

  svg {
    width: 3rem;
    height: 3rem;
  }
`;

function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    organization: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, isPending, error, isSuccess } = useRegister();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Calculate password strength
    if (field === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Clear confirm password error when either password field changes
    if ((field === "password" || field === "confirmPassword") && validationErrors.confirmPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    const requirements = getPasswordRequirements(password);
    const metRequirements = requirements.filter(req => req.met).length;
    strength = (metRequirements / requirements.length) * 100;
    return Math.round(strength);
  };

  const getPasswordRequirements = (password) => [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains number", met: /[0-9]/.test(password) },
    { text: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
    { text: "At least 12 characters", met: password.length >= 12 },
  ];

  const validateForm = () => {
    const errors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Username validation (optional but if provided, must be valid)
    if (formData.username && formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Terms acceptance validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = "You must accept the terms of service";
    }

    // Privacy policy acceptance validation
    if (!formData.acceptPrivacy) {
      errors.acceptPrivacy = "You must accept the privacy policy";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Submit registration data
    register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim() || formData.email.split("@")[0],
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      organization: formData.organization.trim(),
      password: formData.password,
    });
  };

  // Show success message if registration was successful
  if (isSuccess) {
    return (
      <SuccessContainer>
        <SuccessIcon>
          <HiOutlineCheckCircle />
        </SuccessIcon>
        
        <Column gap={4} align="center">
          <div>
            <Heading as="h2" size="h2" color="success" align="center">
              Registration Successful! 🎉
            </Heading>
            <Text size="lg" color="muted" align="center" style={{ marginTop: "var(--spacing-2)" }}>
              Welcome to Community Feedback Management System
            </Text>
          </div>

          <SuccessMessage>
            <Column gap={2}>
              <Text weight="semibold">
                Please check your email to verify your account
              </Text>
              <Text size="sm" color="muted">
                We've sent a verification link to <strong>{formData.email}</strong>
              </Text>
              <Text size="sm" color="muted">
                Don't forget to check your spam folder if you don't see the email.
              </Text>
            </Column>
          </SuccessMessage>

          <Column gap={3} align="stretch" style={{ width: "100%", maxWidth: "32rem" }}>
            <Button
              as={Link}
              to="/login"
              variant="primary"
              size="large"
              fullWidth
            >
              Continue to Login
            </Button>
            
            <Text size="sm" color="muted" align="center">
              You can sign in once you've verified your email address.
            </Text>
          </Column>
        </Column>
      </SuccessContainer>
    );
  }

  return (
    <Column gap={6} align="center">
      <Column gap={2} align="center">
        <Heading as="h1" size="h1" align="center">
          Create Your Account
        </Heading>
        <Text size="lg" color="muted" align="center">
          Join our community feedback management system
        </Text>
      </Column>

      <FormContainer onSubmit={handleSubmit}>
        <Column gap={4}>
          {error && (
            <ErrorMessage>
              <Text size="sm">{error}</Text>
            </ErrorMessage>
          )}

          {/* Personal Information */}
          <FormGrid>
            <FormField
              label="First Name"
              error={validationErrors.firstName}
              required
            >
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                variant={validationErrors.firstName ? "error" : "default"}
                leftIcon={<HiOutlineUser />}
                disabled={isPending}
                autoComplete="given-name"
              />
            </FormField>

            <FormField
              label="Last Name"
              error={validationErrors.lastName}
              required
            >
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                variant={validationErrors.lastName ? "error" : "default"}
                leftIcon={<HiOutlineUser />}
                disabled={isPending}
                autoComplete="family-name"
              />
            </FormField>
          </FormGrid>

          {/* Contact Information */}
          <FormField
            label="Email Address"
            error={validationErrors.email}
            required
          >
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              variant={validationErrors.email ? "error" : "default"}
              leftIcon={<HiOutlineEnvelope />}
              disabled={isPending}
              autoComplete="email"
            />
          </FormField>

          <FormGrid>
            <FormField
              label="Username"
              error={validationErrors.username}
              helper="Optional - we'll generate one from your email if not provided"
            >
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Choose a username"
                variant={validationErrors.username ? "error" : "default"}
                leftIcon={<HiOutlineUser />}
                disabled={isPending}
                autoComplete="username"
              />
            </FormField>

            <FormField
              label="Phone Number"
              error={validationErrors.phone}
              helper="Optional"
            >
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
                variant={validationErrors.phone ? "error" : "default"}
                leftIcon={<HiOutlinePhone />}
                disabled={isPending}
                autoComplete="tel"
              />
            </FormField>
          </FormGrid>

          <FormField
            label="Organization"
            error={validationErrors.organization}
            helper="Optional - your company or organization name"
          >
            <Input
              type="text"
              value={formData.organization}
              onChange={(e) => handleInputChange("organization", e.target.value)}
              placeholder="Enter your organization name"
              variant={validationErrors.organization ? "error" : "default"}
              leftIcon={<HiOutlineBuilding />}
              disabled={isPending}
              autoComplete="organization"
            />
          </FormField>

          {/* Password Section */}
          <FormField
            label="Password"
            error={validationErrors.password}
            required
          >
            <PasswordInput
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Create a strong password"
              variant={validationErrors.password ? "error" : "default"}
              disabled={isPending}
              autoComplete="new-password"
            />
            
            {formData.password && (
              <PasswordStrengthContainer>
                <StrengthBar>
                  <StrengthFill $strength={passwordStrength} />
                </StrengthBar>
                <PasswordRequirements>
                  {getPasswordRequirements(formData.password).map((req, index) => (
                    <RequirementItem key={index} $met={req.met}>
                      {req.text}
                    </RequirementItem>
                  ))}
                </PasswordRequirements>
              </PasswordStrengthContainer>
            )}
          </FormField>

          <FormField
            label="Confirm Password"
            error={validationErrors.confirmPassword}
            required
          >
            <PasswordInput
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              placeholder="Confirm your password"
              variant={validationErrors.confirmPassword ? "error" : "default"}
              disabled={isPending}
              autoComplete="new-password"
            />
          </FormField>

          {/* Terms and Privacy */}
          <TermsSection>
            <Column gap={3}>
              <Text size="sm" weight="semibold" color="grey-700">
                Terms & Privacy
              </Text>
              
              <EnhancedCheckbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(checked) => handleInputChange("acceptTerms", checked)}
                label={
                  <Text size="sm">
                    I agree to the{" "}
                    <StyledLink to="/terms" target="_blank">
                      Terms of Service
                    </StyledLink>
                  </Text>
                }
                disabled={isPending}
                error={validationErrors.acceptTerms}
                required
              />

              <EnhancedCheckbox
                id="acceptPrivacy"
                checked={formData.acceptPrivacy}
                onChange={(checked) => handleInputChange("acceptPrivacy", checked)}
                label={
                  <Text size="sm">
                    I agree to the{" "}
                    <StyledLink to="/privacy" target="_blank">
                      Privacy Policy
                    </StyledLink>
                  </Text>
                }
                disabled={isPending}
                error={validationErrors.acceptPrivacy}
                required
              />
            </Column>
          </TermsSection>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isPending}
            disabled={isPending}
          >
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>

          <Text size="sm" color="muted" align="center">
            Already have an account?{" "}
            <StyledLink to="/login">Sign in here</StyledLink>
          </Text>
        </Column>
      </FormContainer>
    </Column>
  );
}

export default RegisterForm;