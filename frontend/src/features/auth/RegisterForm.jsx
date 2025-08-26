import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiEnvelope,
  HiUser,
  HiPhone,
  HiBuildingOffice,
  HiShieldCheck,
  HiCheckCircle,
  HiInformationCircle,
} from "react-icons/hi2";
import styled from "styled-components";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import PasswordInput from "../../ui/PasswordInput";
// import StyledSelect from "../../ui/StyledSelect";
import FormField from "../../ui/FormField";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import Column from "../../ui/Column";
// import Row from "../../ui/Row";
import EnhancedCheckbox from "../../ui/EnhancedCheckbox";
import { useRegister } from "./useAuth";

const FormWrapper = styled.div`
  width: 100%;
  max-width: 90rem;
  margin: 0 auto;
`;

const FormContainer = styled.form`
  width: 100%;
  background: var(--color-grey-0);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
`;

const FormHeader = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-brand-600),
    var(--color-brand-500)
  );
  color: var(--color-grey-0);
  padding: var(--spacing-8);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
      repeat;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-6);
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  position: relative;
  z-index: 1;

  svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const FormBody = styled.div`
  width: 100%;
  padding: var(--spacing-8);

  @media (max-width: 768px) {
    padding: var(--spacing-6);
  }
`;

const FormSection = styled.div`
  background: var(--color-grey-25);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-4);
    margin-bottom: var(--spacing-4);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-5);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-grey-200);
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-400)
  );
  border-radius: var(--border-radius-md);
  color: var(--color-grey-0);
  flex-shrink: 0;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  color: var(--color-error-700);
  background: linear-gradient(
    135deg,
    var(--color-error-50),
    var(--color-error-25)
  );
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-error-200);
  border-left: 4px solid var(--color-error-500);
  margin-bottom: var(--spacing-6);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  color: var(--color-success-700);
  background: linear-gradient(
    135deg,
    var(--color-success-50),
    var(--color-success-25)
  );
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-success-200);
  border-left: 4px solid var(--color-success-500);
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
`;

const StyledLink = styled(Link)`
  color: var(--color-brand-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--ease-in-out);
  border-radius: var(--border-radius-sm);
  padding: 0 var(--spacing-1);
  margin: 0 -var(--spacing-1);

  &:hover {
    color: var(--color-brand-700);
    text-decoration: underline;
    background-color: var(--color-brand-50);
  }

  &:focus {
    outline: 2px solid var(--color-brand-200);
    outline-offset: 2px;
    background-color: var(--color-brand-50);
  }
`;

const PasswordStrengthSection = styled.div`
  margin-top: var(--spacing-4);
  padding: var(--spacing-4);
  background: linear-gradient(
    135deg,
    var(--color-grey-25),
    var(--color-grey-50)
  );
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
`;

const StrengthHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
`;

const StrengthBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--color-grey-200);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-4);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const StrengthFill = styled.div`
  height: 100%;
  width: ${(props) => props.$strength}%;
  background: linear-gradient(
    90deg,
    ${(props) => {
      if (props.$strength < 25) return "var(--color-error-500)";
      if (props.$strength < 50) return "var(--color-warning-500)";
      if (props.$strength < 75) return "var(--color-info-500)";
      return "var(--color-success-500)";
    }},
    ${(props) => {
      if (props.$strength < 25) return "var(--color-error-400)";
      if (props.$strength < 50) return "var(--color-warning-400)";
      if (props.$strength < 75) return "var(--color-info-400)";
      return "var(--color-success-400)";
    }}
  );
  transition: all var(--duration-normal) var(--ease-in-out);
  border-radius: var(--border-radius-full);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    border-radius: inherit;
  }
`;

const PasswordRequirements = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
  gap: var(--spacing-3);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-size: var(--font-size-sm);
  color: ${(props) =>
    props.$met ? "var(--color-success-700)" : "var(--color-grey-600)"};
  transition: all var(--duration-fast) var(--ease-in-out);
  padding: var(--spacing-2);
  border-radius: var(--border-radius-md);
  background-color: ${(props) =>
    props.$met ? "var(--color-success-25)" : "transparent"};
`;

const RequirementIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--border-radius-full);
  background-color: ${(props) =>
    props.$met ? "var(--color-success-100)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.$met ? "var(--color-success-600)" : "var(--color-grey-500)"};
  font-weight: bold;
  font-size: var(--font-size-xs);
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-in-out);

  &::before {
    content: ${(props) => (props.$met ? '"✓"' : '"○"')};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-5);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
`;

const TermsSection = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-brand-25),
    var(--color-brand-50)
  );
  border: 2px solid var(--color-brand-200);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  position: relative;
  overflow: hidden;

  /* &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 8rem;
    height: 8rem;
    background: radial-gradient(circle, var(--color-brand-100), transparent);
    opacity: 0.5;
  } */
`;

const TermsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-5);
  position: relative;
  z-index: 1;
`;

const TermsIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-400)
  );
  border-radius: var(--border-radius-md);
  color: var(--color-grey-0);
  box-shadow: var(--shadow-md);

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  position: relative;
  z-index: 1;
`;

const SubmitSection = styled.div`
  margin-top: var(--spacing-8);
  text-align: center;
`;

const SuccessContainer = styled.div`
  text-align: center;
  max-width: 56rem;
  margin: 0 auto;
  background: var(--color-grey-0);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
`;

const SuccessHeader = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-success-500),
    var(--color-success-400)
  );
  color: var(--color-grey-0);
  padding: var(--spacing-8);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
      repeat;
    opacity: 0.5;
  }
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8rem;
  height: 8rem;
  margin: 0 auto var(--spacing-4);
  background: var(--color-grey-0);
  border-radius: var(--border-radius-full);
  color: var(--color-success-500);
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;

  svg {
    width: 4rem;
    height: 4rem;
  }
`;

const SuccessBody = styled.div`
  padding: var(--spacing-8);

  @media (max-width: 768px) {
    padding: var(--spacing-6);
  }
`;

// Organization options
const ORGANIZATION_OPTIONS = [
  { value: "", label: "Select organization type...", disabled: true },
  { value: "corporation", label: "Corporation" },
  { value: "startup", label: "Startup" },
  { value: "nonprofit", label: "Non-profit Organization" },
  { value: "government", label: "Government Agency" },
  { value: "education", label: "Educational Institution" },
  { value: "healthcare", label: "Healthcare Organization" },
  { value: "consulting", label: "Consulting Firm" },
  { value: "freelance", label: "Freelancer/Individual" },
  { value: "other", label: "Other" },
];

function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    organization: "",
    organizationType: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  });

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

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    if (password.length >= 16) strength += 10;

    return Math.min(strength, 100);
  };

  const getPasswordRequirements = (password) => [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains number", met: /[0-9]/.test(password) },
    { text: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
    {
      text: "At least 12 characters (recommended)",
      met: password.length >= 12,
    },
  ];

  const validateForm = () => {
    const errors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      errors.firstName =
        "First name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      errors.lastName =
        "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (formData.username.trim().length > 30) {
      errors.username = "Username must be less than 30 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username.trim())) {
      errors.username =
        "Username can only contain letters, numbers, hyphens, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation (optional but if provided should be valid)
    if (formData.phone.trim()) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.trim().replace(/[\s\-\(\)]/g, ""))) {
        errors.phone = "Please enter a valid phone number";
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const requirements = getPasswordRequirements(formData.password);
      const basicRequirements = requirements.slice(0, 5);

      if (!basicRequirements.every((req) => req.met)) {
        errors.password = "Password must meet all basic security requirements";
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
      errors.acceptTerms = "You must accept the Terms of Service to continue";
    }

    if (!formData.acceptPrivacy) {
      errors.acceptPrivacy = "You must accept the Privacy Policy to continue";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
      return;
    }

    const registrationData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      organization: formData.organization.trim() || undefined,
      organizationType: formData.organizationType || undefined,
      password: formData.password,
      preferences: {
        marketing: formData.acceptMarketing,
      },
    };

    register(registrationData);
  };

  const getStrengthLabel = (strength) => {
    if (strength < 25) return "Very Weak";
    if (strength < 50) return "Weak";
    if (strength < 75) return "Good";
    if (strength < 90) return "Strong";
    return "Very Strong";
  };

  const getStrengthColor = (strength) => {
    if (strength < 25) return "var(--color-error-600)";
    if (strength < 50) return "var(--color-warning-600)";
    if (strength < 75) return "var(--color-info-600)";
    return "var(--color-success-600)";
  };

  // Show success message if registration was successful
  if (isSuccess) {
    return (
      <FormWrapper>
        <SuccessContainer>
          <SuccessHeader>
            <SuccessIcon>
              <HiCheckCircle />
            </SuccessIcon>

            <HeaderContent>
              <Heading
                as="h1"
                size="h1"
                style={{ color: "inherit", marginBottom: "var(--spacing-2)" }}
              >
                Account Created Successfully!
              </Heading>
              <Text size="lg" style={{ color: "inherit", opacity: 0.9 }}>
                Welcome to Sunflower CFM! We're excited to have you on board.
              </Text>
            </HeaderContent>
          </SuccessHeader>

          <SuccessBody>
            <Column gap={6} align="center">
              <SuccessMessage>
                <HiCheckCircle size={20} />
                <span>
                  We've sent a verification email to{" "}
                  <strong>{formData.email}</strong>. Please click the link in
                  the email to activate your account and start using all
                  features.
                </span>
              </SuccessMessage>

              <Column gap={4} align="center">
                <Button as={Link} to="/login" variant="primary" size="large">
                  Continue to Login
                </Button>

                <Text size="sm" color="muted" align="center">
                  Didn't receive the email? Check your spam folder or{" "}
                  <StyledLink to="/resend-verification">
                    request a new verification email
                  </StyledLink>
                </Text>
              </Column>
            </Column>
          </SuccessBody>
        </SuccessContainer>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <FormContainer onSubmit={handleSubmit}>
        {/* Enhanced Header */}
        <FormHeader>
          <LogoSection>
            <HiShieldCheck size={36} />
            <Heading as="h1" size="h2" style={{ color: "inherit" }}>
              Sunflower CFM
            </Heading>
          </LogoSection>

          <HeaderContent>
            <Heading
              align="center"
              as="h2"
              size="h1"
              style={{ color: "inherit", marginBottom: "var(--spacing-2)" }}
            >
              Create Your Account
            </Heading>
            <Text
              align="center"
              size="lg"
              style={{ color: "inherit", opacity: 0.9 }}
            >
              Initialize your account by filling out the form below.
            </Text>
          </HeaderContent>
        </FormHeader>

        {/* Form Body */}
        <FormBody>
          {error && (
            <ErrorMessage>
              <HiInformationCircle size={20} />
              <span>{error}</span>
            </ErrorMessage>
          )}

          {/* Personal Information Section */}
          <FormSection>
            <SectionHeader>
              <SectionIcon>
                <HiUser />
              </SectionIcon>
              <Column gap={1}>
                <Heading as="h3" size="h4">
                  Personal Information
                </Heading>
                <Text size="sm" color="muted">
                  Tell us about yourself
                </Text>
              </Column>
            </SectionHeader>

            <Column gap={5}>
              <FormGrid>
                <FormField
                  label="First Name"
                  error={validationErrors.firstName}
                  required
                >
                  <Input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter your first name"
                    variant={validationErrors.firstName ? "error" : "default"}
                    leftIcon={<HiUser />}
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
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Enter your last name"
                    variant={validationErrors.lastName ? "error" : "default"}
                    leftIcon={<HiUser />}
                    disabled={isPending}
                    autoComplete="family-name"
                  />
                </FormField>
              </FormGrid>

              <FormField
                label="Username"
                error={validationErrors.username}
                required
                helpText="Choose a unique username. Only letters, numbers, hyphens, and underscores are allowed."
              >
                <Input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Choose a unique username"
                  variant={validationErrors.username ? "error" : "default"}
                  leftIcon={<HiUser />}
                  disabled={isPending}
                  autoComplete="username"
                />
              </FormField>

              <FormField
                label="Email Address"
                error={validationErrors.email}
                required
                helpText="We'll send verification and updates here"
              >
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  variant={validationErrors.email ? "error" : "default"}
                  leftIcon={<HiEnvelope />}
                  disabled={isPending}
                  autoComplete="email"
                />
              </FormField>

              <FormField
                label="Phone Number"
                error={validationErrors.phone}
                helpText="Optional - For account recovery"
              >
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  variant={validationErrors.phone ? "error" : "default"}
                  leftIcon={<HiPhone />}
                  disabled={isPending}
                  autoComplete="tel"
                />
              </FormField>
            </Column>
          </FormSection>

          {/* Organization Information Section */}
          <FormSection>
            <SectionHeader>
              <SectionIcon>
                <HiBuildingOffice />
              </SectionIcon>
              <Column gap={1}>
                <Heading as="h3" size="h4">
                  Organization Information
                </Heading>
                <Text size="sm" color="muted">
                  Optional - Help us understand your work context
                </Text>
              </Column>
            </SectionHeader>

            <FormField
              label="Organization Name"
              error={validationErrors.organization}
              helpText="Your company or organization name"
            >
              <Input
                name="organization"
                type="text"
                value={formData.organization}
                onChange={(e) =>
                  handleInputChange("organization", e.target.value)
                }
                placeholder="Enter organization name"
                variant={validationErrors.organization ? "error" : "default"}
                leftIcon={<HiBuildingOffice />}
                disabled={isPending}
                autoComplete="organization"
              />
            </FormField>

            {/* <FormField
                label="Organization Type"
                error={validationErrors.organizationType}
                helpText="Select the type that best describes your organization"
              >
                <StyledSelect
                  value={formData.organizationType}
                  onChange={(value) =>
                    handleInputChange("organizationType", value)
                  }
                  options={ORGANIZATION_OPTIONS}
                  placeholder="Select organization type..."
                  disabled={isPending}
                  $hasError={!!validationErrors.organizationType}
                />
              </FormField> */}
          </FormSection>

          {/* Security Information Section */}
          <FormSection>
            <SectionHeader>
              <SectionIcon>
                <HiShieldCheck />
              </SectionIcon>
              <Column gap={1}>
                <Heading as="h3" size="h4">
                  Security & Password
                </Heading>
                <Text size="sm" color="muted">
                  Create a secure password to protect your account
                </Text>
              </Column>
            </SectionHeader>

            <Column gap={5}>
              <FormField
                label="Password"
                error={validationErrors.password}
                required
                helpText="Create a strong password with at least 8 characters"
              >
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Create a secure password"
                  variant={validationErrors.password ? "error" : "default"}
                  disabled={isPending}
                  autoComplete="new-password"
                />

                {formData.password && (
                  <PasswordStrengthSection>
                    <StrengthHeader>
                      <Text size="sm" weight="medium">
                        Password Strength
                      </Text>
                      <Text
                        size="sm"
                        weight="semibold"
                        style={{ color: getStrengthColor(passwordStrength) }}
                      >
                        {getStrengthLabel(passwordStrength)}
                      </Text>
                    </StrengthHeader>

                    <StrengthBar>
                      <StrengthFill $strength={passwordStrength} />
                    </StrengthBar>

                    <PasswordRequirements>
                      {getPasswordRequirements(formData.password).map(
                        (req, index) => (
                          <RequirementItem key={index} $met={req.met}>
                            <RequirementIcon $met={req.met} />
                            <Text size="sm">{req.text}</Text>
                          </RequirementItem>
                        )
                      )}
                    </PasswordRequirements>
                  </PasswordStrengthSection>
                )}
              </FormField>

              <FormField
                label="Confirm Password"
                error={validationErrors.confirmPassword}
                required
                helpText="Re-enter your password to confirm"
              >
                <PasswordInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm your password"
                  variant={
                    validationErrors.confirmPassword ? "error" : "default"
                  }
                  disabled={isPending}
                  autoComplete="new-password"
                />
              </FormField>
            </Column>
          </FormSection>

          {/* Terms and Agreements Section */}
          <TermsSection>
            <TermsHeader>
              <TermsIcon>
                <HiShieldCheck />
              </TermsIcon>
              <Column gap={1}>
                <Heading as="h3" size="h4" color="brand">
                  Terms and Privacy
                </Heading>
                <Text size="sm" color="brand" style={{ opacity: 0.8 }}>
                  Please review and accept our terms to continue
                </Text>
              </Column>
            </TermsHeader>

            <CheckboxGroup>
              <FormField error={validationErrors.acceptTerms}>
                <EnhancedCheckbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(checked) =>
                    handleInputChange("acceptTerms", checked)
                  }
                  label={
                    <Text size="sm">
                      I agree to the{" "}
                      <StyledLink
                        to="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms of Service
                      </StyledLink>{" "}
                      and acknowledge that I have read and understood them
                    </Text>
                  }
                  disabled={isPending}
                  size="medium"
                  error={!!validationErrors.acceptTerms}
                />
              </FormField>

              <FormField error={validationErrors.acceptPrivacy}>
                <EnhancedCheckbox
                  id="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onChange={(checked) =>
                    handleInputChange("acceptPrivacy", checked)
                  }
                  label={
                    <Text size="sm">
                      I agree to the{" "}
                      <StyledLink
                        to="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </StyledLink>{" "}
                      and consent to the collection and processing of my
                      personal data
                    </Text>
                  }
                  disabled={isPending}
                  size="medium"
                  error={!!validationErrors.acceptPrivacy}
                />
              </FormField>

              <EnhancedCheckbox
                id="acceptMarketing"
                checked={formData.acceptMarketing}
                onChange={(checked) =>
                  handleInputChange("acceptMarketing", checked)
                }
                label={
                  <Text size="sm" color="muted">
                    I would like to receive product updates, tips, and
                    promotional emails (optional)
                  </Text>
                }
                disabled={isPending}
                size="medium"
              />
            </CheckboxGroup>
          </TermsSection>

          {/* Submit Section */}
          <SubmitSection>
            <Column gap={5} align="center">
              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={isPending}
                disabled={
                  isPending ||
                  !formData.acceptTerms ||
                  !formData.acceptPrivacy ||
                  passwordStrength < 60
                }
              >
                {isPending ? "Creating Your Account..." : "Create Account"}
              </Button>

              <Text size="sm" color="muted" align="center">
                Already have an account?{" "}
                <StyledLink to="/login">Sign in to your account</StyledLink>
              </Text>

              <Text
                size="xs"
                color="muted"
                align="center"
                style={{ lineHeight: 1.6, maxWidth: "40rem" }}
              >
                By creating an account, you agree to our terms and privacy
                policy. Your information is encrypted and securely stored. We'll
                never share your personal information with third parties without
                your consent.
              </Text>
            </Column>
          </SubmitSection>
        </FormBody>
      </FormContainer>
    </FormWrapper>
  );
}

export default RegisterForm;
