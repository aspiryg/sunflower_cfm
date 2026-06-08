import { useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";

/* ==================== STYLES ==================== */
const PageContainer = styled.div`
  background-color: var(--color-grey-0);
  min-height: 100%;
`;

const HeroSection = styled.section`
  padding: var(--spacing-12) var(--spacing-6) var(--spacing-8);
  text-align: center;
  background: linear-gradient(
    180deg,
    var(--color-brand-50) 0%,
    var(--color-grey-0) 100%
  );

  @media (max-width: 768px) {
    padding: var(--spacing-8) var(--spacing-4) var(--spacing-6);
  }
`;

const SectionInner = styled.div`
  max-width: 100rem;
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

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
  line-height: 1.2;
  margin-bottom: var(--spacing-3);
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: var(--font-size-2xl);
  }
`;

const PageSubtitle = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-grey-500);
  line-height: 1.6;
  max-width: 56rem;
  margin: 0 auto;
`;

/* Form area */
const FormSection = styled.section`
  padding: 0 var(--spacing-6) var(--spacing-12);

  @media (max-width: 768px) {
    padding: 0 var(--spacing-4) var(--spacing-8);
  }
`;

const FormCard = styled.div`
  max-width: 64rem;
  margin: 0 auto;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    padding: var(--spacing-6);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.$columns || "1fr"};
  gap: var(--spacing-5);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-700);

  span {
    color: var(--color-grey-400);
    font-weight: var(--font-weight-normal);
    margin-left: var(--spacing-1);
  }
`;

const Input = styled.input`
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-grey-800);
  background-color: var(--color-grey-0);
  transition: border-color var(--duration-fast) var(--ease-in-out);
  font-family: inherit;

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  ${(props) =>
    props.$error &&
    `
    border-color: var(--color-red-500);
    &:focus {
      box-shadow: 0 0 0 3px var(--color-red-100);
    }
  `}
`;

const Textarea = styled.textarea`
  padding: var(--spacing-3);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-grey-800);
  background-color: var(--color-grey-0);
  font-family: inherit;
  resize: vertical;
  min-height: 14rem;
  line-height: 1.6;
  transition: border-color var(--duration-fast) var(--ease-in-out);

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  ${(props) =>
    props.$error &&
    `
    border-color: var(--color-red-500);
    &:focus {
      box-shadow: 0 0 0 3px var(--color-red-100);
    }
  `}
`;

const Select = styled.select`
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-grey-800);
  background-color: var(--color-grey-0);
  font-family: inherit;
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-in-out);

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }
`;

const ErrorMessage = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-red-600);
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-brand-600);
  color: var(--color-brand-50);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  align-self: flex-start;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  &:hover:not(:disabled) {
    background-color: var(--color-brand-700);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HelpText = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-grey-400);
  line-height: 1.5;
  margin-top: var(--spacing-3);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-grey-100);
`;

/* Success state */
const SuccessContainer = styled.div`
  max-width: 52rem;
  margin: 0 auto;
  text-align: center;
  padding: var(--spacing-12) var(--spacing-6);
`;

const SuccessIcon = styled.div`
  width: 7.2rem;
  height: 7.2rem;
  border-radius: 50%;
  background-color: var(--color-green-50);
  color: var(--color-green-600);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-6);

  svg {
    width: 3.6rem;
    height: 3.6rem;
  }
`;

const SuccessTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
  margin-bottom: var(--spacing-3);
`;

const SuccessMessage = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-grey-500);
  line-height: 1.6;
  margin-bottom: var(--spacing-6);
`;

const SuccessButton = styled.button`
  padding: var(--spacing-2) var(--spacing-5);
  background-color: var(--color-brand-600);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  font-family: inherit;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-brand-700);
  }
`;

/* ==================== COMPONENT ==================== */
function PublicFeedbackForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  function onSubmit(data) {
    // TODO: connect to backend API when the public feedback endpoint is ready
    console.log("Public feedback submitted:", data);
    setSubmitted(true);
  }

  function handleSubmitAnother() {
    setSubmitted(false);
    reset();
  }

  if (submitted) {
    return (
      <PageContainer>
        <SuccessContainer>
          <SuccessIcon>
            <HiOutlineCheckCircle />
          </SuccessIcon>
          <SuccessTitle>Thank you for your feedback</SuccessTitle>
          <SuccessMessage>
            Your feedback has been received. Our team will review it and take
            appropriate action. You may be contacted if we need more details.
          </SuccessMessage>
          <SuccessButton onClick={handleSubmitAnother}>
            Submit Another
          </SuccessButton>
        </SuccessContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeroSection>
        <SectionInner>
          <SectionLabel>
            <HiOutlineChatBubbleLeftRight />
            Public Feedback
          </SectionLabel>
          <PageTitle>Share your feedback with us</PageTitle>
          <PageSubtitle>
            Your feedback helps us improve services. All submissions are
            reviewed by our team. You don&apos;t need an account.
          </PageSubtitle>
        </SectionInner>
      </HeroSection>

      <FormSection>
        <FormCard>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Name and contact - optional */}
            <FormRow $columns="1fr 1fr">
              <FieldGroup>
                <Label>
                  Your Name <span>(optional)</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  {...register("name")}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>
                  Phone or Email <span>(optional)</span>
                </Label>
                <Input
                  type="text"
                  placeholder="How can we reach you"
                  {...register("contact")}
                />
              </FieldGroup>
            </FormRow>

            {/* Category */}
            <FieldGroup>
              <Label>Feedback Type</Label>
              <Select {...register("category")} defaultValue="general">
                <option value="general">General Feedback</option>
                <option value="complaint">Complaint</option>
                <option value="suggestion">Suggestion</option>
                <option value="appreciation">Appreciation</option>
                <option value="inquiry">Inquiry</option>
              </Select>
            </FieldGroup>

            {/* Location - optional */}
            <FieldGroup>
              <Label>
                Location / Area <span>(optional)</span>
              </Label>
              <Input
                type="text"
                placeholder="Governorate, community, or area name"
                {...register("location")}
              />
            </FieldGroup>

            {/* Description - required */}
            <FieldGroup>
              <Label>Your Feedback</Label>
              <Textarea
                placeholder="Please describe your feedback, complaint, or suggestion in detail..."
                $error={!!errors.description}
                {...register("description", {
                  required: "Please describe your feedback",
                  minLength: {
                    value: 10,
                    message: "Please provide at least 10 characters",
                  },
                })}
              />
              {errors.description && (
                <ErrorMessage>{errors.description.message}</ErrorMessage>
              )}
            </FieldGroup>

            <SubmitButton type="submit">
              <HiOutlinePaperAirplane />
              Submit Feedback
            </SubmitButton>

            <HelpText>
              Your feedback is confidential. Providing your name and contact
              information is optional but allows our team to follow up with you
              if needed.
            </HelpText>
          </Form>
        </FormCard>
      </FormSection>
    </PageContainer>
  );
}

export default PublicFeedbackForm;
