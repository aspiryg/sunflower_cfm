import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiEye,
  HiEyeSlash,
  HiEnvelope,
  HiLockClosed,
  HiUser,
  HiPhone,
  HiBuildingOffice,
} from "react-icons/hi2";
import styled from "styled-components";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import FormField from "../../ui/FormField";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import Column from "../../ui/Column";
import Row from "../../ui/Row";
import Checkbox from "../../ui/Checkbox";
import { useRegister } from "./useAuth";

const FormContainer = styled.form`
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
`;

const ErrorMessage = styled(Text)`
  color: var(--color-error-600);
  background-color: var(--color-error-50);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-error-200);
  margin-bottom: var(--spacing-4);
`;

const SuccessMessage = styled(Text)`
  color: var(--color-success-600);
  background-color: var(--color-success-50);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-success-200);
  margin-bottom: var(--spacing-4);
`;

const StyledLink = styled(Link)`
  color: var(--color-brand-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);

  &:hover {
    color: var(--color-brand-700);
    text-decoration: underline;
  }
`;

const PasswordStrengthIndicator = styled.div`
  margin-top: var(--spacing-2);
`;

const StrengthBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--color-grey-200);
  border-radius: var(--border-radius-full);
  overflow: hidden;
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
`;

const PasswordRequirements = styled.div`
  margin-top: var(--spacing-2);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-1);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const RequirementItem = styled(Text)`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: ${(props) =>
    props.$met ? "var(--color-success-600)" : "var(--color-grey-500)"};

  &::before {
    content: ${(props) => (props.$met ? '"✓"' : '"○"')};
    font-weight: bold;
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, isPending, error, isSuccess } = useRegister();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Calculate password strength
    if (field === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    return Math.min(strength, 100);
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

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username.trim())) {
      errors.username =
        "Username can only contain letters, numbers, hyphens, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation (optional but if provided should be valid)
    if (
      formData.phone.trim() &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.trim())
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const requirements = getPasswordRequirements(formData.password);
      const basicRequirements = requirements.slice(0, 4); // First 4 are basic requirements

      if (!basicRequirements.every((req) => req.met)) {
        errors.password = "Password must meet all basic requirements";
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Terms and privacy validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = "You must accept the terms of service";
    }

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

    // Prepare data for submission
    const registrationData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      organization: formData.organization.trim() || undefined,
      password: formData.password,
    };

    register(registrationData);
  };

  // Show success message if registration was successful
  if (isSuccess) {
    return (
      <Column gap={6} align="center">
        <Column gap={2} align="center">
          <Heading as="h1" size="h1" align="center">
            Registration Successful!
          </Heading>
          <Text size="lg" color="muted" align="center">
            Please check your email to verify your account
          </Text>
        </Column>

        <SuccessMessage size="sm">
          We've sent a verification email to {formData.email}. Please click the
          link in the email to activate your account.
        </SuccessMessage>

        <Column gap={3} align="center">
          <Button as={Link} to="/login" variant="primary" size="large">
            Go to Login
          </Button>

          <Text size="sm" color="muted" align="center">
            Didn't receive the email? Check your spam folder or{" "}
            <StyledLink to="/resend-verification">
              resend verification email
            </StyledLink>
          </Text>
        </Column>
      </Column>
    );
  }

  return (
    <Column gap={6} align="center">
      <Column gap={2} align="center">
        <Heading as="h1" size="h1" align="center">
          Create Account
        </Heading>
        <Text size="lg" color="muted" align="center">
          Join us today and get started
        </Text>
      </Column>

      <FormContainer onSubmit={handleSubmit}>
        <Column gap={4}>
          {error && <ErrorMessage size="sm">{error}</ErrorMessage>}

          {/* Name Fields */}
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
                leftIcon={<HiUser />}
                disabled={isPending}
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
                leftIcon={<HiUser />}
                disabled={isPending}
              />
            </FormField>
          </FormGrid>

          {/* Username and Email */}
          <FormField
            label="Username"
            error={validationErrors.username}
            required
            description="Unique username for your account. Only letters, numbers, hyphens, and underscores allowed."
          >
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="Choose a username"
              variant={validationErrors.username ? "error" : "default"}
              leftIcon={<HiUser />}
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Email Address"
            error={validationErrors.email}
            required
            description="We'll send a verification email to this address"
          >
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              variant={validationErrors.email ? "error" : "default"}
              leftIcon={<HiEnvelope />}
              disabled={isPending}
            />
          </FormField>

          {/* Optional Fields */}
          <FormGrid>
            <FormField
              label="Phone Number"
              error={validationErrors.phone}
              description="Optional - for account recovery"
            >
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                variant={validationErrors.phone ? "error" : "default"}
                leftIcon={<HiPhone />}
                disabled={isPending}
              />
            </FormField>
            <FormField
              label="Organization"
              error={validationErrors.organization}
              description="Optional - your company or organization name"
            >
              <Input
                type="text"
                value={formData.organization}
                onChange={(e) =>
                  handleInputChange("organization", e.target.value)
                }
                placeholder="Enter organization name"
                variant={validationErrors.organization ? "error" : "default"}
                leftIcon={<HiBuildingOffice />}
                disabled={isPending}
              />
            </FormField>
          </FormGrid>

          {/* Password Fields */}
          <FormField
            label="Password"
            error={validationErrors.password}
            required
          >
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Create a strong password"
              variant={validationErrors.password ? "error" : "default"}
              leftIcon={<HiLockClosed />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    color: "var(--color-grey-500)",
                  }}
                >
                  {showPassword ? <HiEyeSlash /> : <HiEye />}
                </button>
              }
              disabled={isPending}
            />

            {formData.password && (
              <PasswordStrengthIndicator>
                <Row
                  justify="between"
                  align="center"
                  style={{ marginBottom: "var(--spacing-1)" }}
                >
                  <Text size="xs" color="muted">
                    Password Strength
                  </Text>
                  <Text size="xs" color="muted">
                    {passwordStrength < 25 && "Weak"}
                    {passwordStrength >= 25 && passwordStrength < 50 && "Fair"}
                    {passwordStrength >= 50 && passwordStrength < 75 && "Good"}
                    {passwordStrength >= 75 && "Strong"}
                  </Text>
                </Row>
                <StrengthBar>
                  <StrengthFill $strength={passwordStrength} />
                </StrengthBar>

                <PasswordRequirements>
                  {getPasswordRequirements(formData.password).map(
                    (req, index) => (
                      <RequirementItem key={index} size="xs" $met={req.met}>
                        {req.text}
                      </RequirementItem>
                    )
                  )}
                </PasswordRequirements>
              </PasswordStrengthIndicator>
            )}
          </FormField>

          <FormField
            label="Confirm Password"
            error={validationErrors.confirmPassword}
            required
          >
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              placeholder="Confirm your password"
              variant={validationErrors.confirmPassword ? "error" : "default"}
              leftIcon={<HiLockClosed />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    color: "var(--color-grey-500)",
                  }}
                >
                  {showConfirmPassword ? <HiEyeSlash /> : <HiEye />}
                </button>
              }
              disabled={isPending}
            />
          </FormField>

          {/* Terms and Privacy */}
          <Column gap={3}>
            <FormField error={validationErrors.acceptTerms}>
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(checked) =>
                  handleInputChange("acceptTerms", checked)
                }
                label={
                  <Text size="sm">
                    I agree to the{" "}
                    <StyledLink to="/terms" target="_blank">
                      Terms of Service
                    </StyledLink>
                  </Text>
                }
                disabled={isPending}
                required
              />
            </FormField>

            <FormField error={validationErrors.acceptPrivacy}>
              <Checkbox
                id="acceptPrivacy"
                checked={formData.acceptPrivacy}
                onChange={(checked) =>
                  handleInputChange("acceptPrivacy", checked)
                }
                label={
                  <Text size="sm">
                    I agree to the{" "}
                    <StyledLink to="/privacy" target="_blank">
                      Privacy Policy
                    </StyledLink>
                  </Text>
                }
                disabled={isPending}
                required
              />
            </FormField>
          </Column>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isPending}
            disabled={
              isPending || !formData.acceptTerms || !formData.acceptPrivacy
            }
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
