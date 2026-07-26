'use client';

import { Controller } from 'react-hook-form';
import { Building2, CheckCircle2, Mail, Send, User } from 'lucide-react';
import {
  COMPANY_MAX_LENGTH,
  MAX_IMAGES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from '@/constants';
import { EMAIL_PATTERN } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FieldShell } from '@/components/ui/field-shell';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { RatingInput } from '@/components/ui/rating';
import { Textarea } from '@/components/ui/textarea';
import { useReviewForm } from '../hooks/use-review-form';

export function ReviewForm() {
  const { form, submit, submitting, submittedName, reset } = useReviewForm();
  const {
    register,
    control,
    formState: { errors, isDirty },
    watch,
  } = form;

  const message = watch('message') ?? '';

  if (submittedName) {
    return <SubmissionSuccess name={submittedName} onWriteAnother={reset} />;
  }

  return (
    <Card className="p-0 sm:p-0">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Full name"
            placeholder="Jane Cooper"
            autoComplete="name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name', {
              required: 'Please enter your name.',
              minLength: { value: 2, message: 'Name must be at least 2 characters.' },
              maxLength: {
                value: NAME_MAX_LENGTH,
                message: `Name must be under ${NAME_MAX_LENGTH} characters.`,
              },
            })}
          />

          <Input
            label="Work email"
            type="email"
            placeholder="jane@company.com"
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            hint="Never shown publicly."
            {...register('email', {
              required: 'Please enter your email address.',
              pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' },
            })}
          />
        </div>

        <Input
          label="Company"
          placeholder="Acme Inc."
          autoComplete="organization"
          leftIcon={<Building2 className="h-4 w-4" />}
          error={errors.company?.message}
          {...register('company', {
            required: 'Please enter your company.',
            minLength: { value: 2, message: 'Company must be at least 2 characters.' },
            maxLength: {
              value: COMPANY_MAX_LENGTH,
              message: `Company must be under ${COMPANY_MAX_LENGTH} characters.`,
            },
          })}
        />

        {/* Controller: the rating is a custom control, not a native input. */}
        <Controller
          control={control}
          name="rating"
          rules={{ min: { value: 1, message: 'Please select a star rating.' } }}
          render={({ field, fieldState }) => (
            <FieldShell id="rating-field" label="How would you rate us?" error={fieldState.error?.message}>
              <RatingInput
                value={field.value}
                onChange={field.onChange}
                error={Boolean(fieldState.error)}
                name={field.name}
              />
            </FieldShell>
          )}
        />

        <Textarea
          label="Your testimonial"
          placeholder="What did you like? What problem did we solve for you? The more specific, the better."
          currentLength={message.length}
          maxLength={MESSAGE_MAX_LENGTH}
          error={errors.message?.message}
          {...register('message', {
            required: 'Please write a short testimonial.',
            minLength: {
              value: MESSAGE_MIN_LENGTH,
              message: `Please write at least ${MESSAGE_MIN_LENGTH} characters.`,
            },
            maxLength: {
              value: MESSAGE_MAX_LENGTH,
              message: `Please keep it under ${MESSAGE_MAX_LENGTH} characters.`,
            },
          })}
        />

        <Controller
          control={control}
          name="images"
          rules={{
            validate: (images) =>
              images.length <= MAX_IMAGES || `You can upload at most ${MAX_IMAGES} images.`,
          }}
          render={({ field, fieldState }) => (
            <FieldShell id="images-field" label="Add photos" optional>
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                disabled={submitting}
              />
            </FieldShell>
          )}
        />

        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-[13px] leading-relaxed text-gray-500 sm:text-left">
            Submissions are reviewed before they appear publicly.
          </p>

          {/* Submit is full-width and last in the DOM on mobile, so it lands
              under the thumb and stays the obvious primary action. */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {isDirty && (
              <Button variant="ghost" onClick={reset} disabled={submitting}>
                Clear
              </Button>
            )}
            <Button
              type="submit"
              loading={submitting}
              fullWidth
              className="sm:w-auto"
              leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
            >
              {submitting ? 'Submitting...' : 'Submit testimonial'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}

function SubmissionSuccess({ name, onWriteAnother }: { name: string; onWriteAnother: () => void }) {
  return (
    <Card className="animate-slide-up flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </span>

      <h2 className="mt-5 text-lg font-semibold tracking-tight text-gray-900">
        Thank you, {name}!
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
        Your testimonial has been received and is waiting for approval. Once approved, it will
        appear on the public wall.
      </p>

      <Button variant="secondary" className="mt-6" onClick={onWriteAnother}>
        Write another testimonial
      </Button>
    </Card>
  );
}
