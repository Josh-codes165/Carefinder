import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MDEditor from '@uiw/react-md-editor'
import { createHospital, updateHospital } from '../lib/hospitals'
import type { Hospital } from '../lib/hospitals'

// ---- Zod schema ----
// This defines the rules for every field in the form.
// Zod checks all fields at once when the form is submitted.
const hospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  lga: z.string().min(1, 'LGA is required'),
  state: z.string().min(1, 'State is required'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  visiting_hours: z.string().optional(),
  ownership_type: z.enum(['public', 'private']),
  specialties: z.array(z.string()),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional()
    .nullable(),
})

// TypeScript type inferred directly from the Zod schema
// This means the type and validation rules are always in sync
type HospitalFormData = z.infer<typeof hospitalSchema>

const SPECIALTIES = [
  'Emergency', 'Maternity', 'Pediatric', 'Dental',
  'Cardiology', 'Orthopedic', 'Oncology', 'Ophthalmology',
]

type HospitalFormProps = {
  hospital?: Hospital | null
  onSuccess: () => void
}

export function HospitalForm({ hospital, onSuccess }: HospitalFormProps) {
  const isEditing = !!hospital

  // react-hook-form setup with Zod resolver
  // The resolver connects Zod schema to react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
    // Pre-fill form with existing data when editing
    defaultValues: {
      name: hospital?.name ?? '',
      address: hospital?.address ?? '',
      city: hospital?.city ?? '',
      lga: hospital?.lga ?? '',
      state: hospital?.state ?? 'Lagos',
      phone: hospital?.phone ?? '',
      email: hospital?.email ?? '',
      description: hospital?.description ?? '',
      visiting_hours: hospital?.visiting_hours ?? '',
      ownership_type: hospital?.ownership_type ?? 'public',
      specialties: Array.isArray(hospital?.specialties)
        ? hospital.specialties
        : [],
      latitude: hospital?.latitude ?? null,
      longitude: hospital?.longitude ?? null,
    },
  })

  // Watch these values to show them in the UI
  const watchedSpecialties = watch('specialties')
  const watchedOwnership = watch('ownership_type')

  function toggleSpecialty(specialty: string) {
    const current = watchedSpecialties ?? []
    if (current.includes(specialty)) {
      setValue('specialties', current.filter(s => s !== specialty))
    } else {
      setValue('specialties', [...current, specialty])
    }
  }

  // This runs when the form is submitted and passes Zod validation
  async function onSubmit(data: HospitalFormData, publish: boolean) {
    try {
      const hospitalData = {
        ...data,
        phone: data.phone || null,
        email: data.email || null,
        description: data.description || null,
        visiting_hours: data.visiting_hours || null,
        is_published: publish,
      }

      if (isEditing && hospital) {
        await updateHospital(hospital.id, hospitalData)
      } else {
        await createHospital(hospitalData)
      }
      onSuccess()
    } catch (err) {
      console.error('Form submit error:', err)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* LEFT — Form fields */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">

        {/* Hospital name */}
        <FormField
          label="Hospital name"
          required
          error={errors.name?.message}
        >
          <input
            {...register('name')}
            placeholder="e.g. Lagos Island General Hospital"
            className={inputClass(!!errors.name)}
          />
        </FormField>

        {/* City and LGA */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="City" required error={errors.city?.message}>
            <input
              {...register('city')}
              placeholder="Lagos"
              className={inputClass(!!errors.city)}
            />
          </FormField>
          <FormField label="LGA" required error={errors.lga?.message}>
            <input
              {...register('lga')}
              placeholder="Lagos Island"
              className={inputClass(!!errors.lga)}
            />
          </FormField>
        </div>

        {/* State */}
        <FormField label="State" required error={errors.state?.message}>
          <input
            {...register('state')}
            placeholder="Lagos"
            className={inputClass(!!errors.state)}
          />
        </FormField>

        {/* Address */}
        <FormField label="Full address" required error={errors.address?.message}>
          <input
            {...register('address')}
            placeholder="Broad St, Lagos Island, Lagos State"
            className={inputClass(!!errors.address)}
          />
        </FormField>

        {/* Phone and Email */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone number" error={errors.phone?.message}>
            <input
              {...register('phone')}
              placeholder="+234 1 000 0000"
              className={inputClass(!!errors.phone)}
            />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <input
              {...register('email')}
              placeholder="info@hospital.ng"
              className={inputClass(!!errors.email)}
            />
          </FormField>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Latitude" error={errors.latitude?.message}>
            <input
              {...register('latitude', { valueAsNumber: true })}
              placeholder="6.4541"
              type="number"
              step="any"
              className={inputClass(!!errors.latitude)}
            />
          </FormField>
          <FormField label="Longitude" error={errors.longitude?.message}>
            <input
              {...register('longitude', { valueAsNumber: true })}
              placeholder="3.3947"
              type="number"
              step="any"
              className={inputClass(!!errors.longitude)}
            />
          </FormField>
        </div>

        {/* Ownership type */}
        <FormField label="Ownership type">
          <div className="flex gap-2">
            {(['public', 'private'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('ownership_type', type)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  watchedOwnership === type
                    ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#0F6E56]'
                    : 'bg-[#F1EFE8] border-transparent text-[#5F5E5A]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </FormField>

        {/* Specialties */}
        <FormField label="Specialties">
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(specialty => (
              <button
                key={specialty}
                type="button"
                onClick={() => toggleSpecialty(specialty)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  watchedSpecialties?.includes(specialty)
                    ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#0F6E56]'
                    : 'bg-[#F1EFE8] border-transparent text-[#5F5E5A]'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </FormField>

      </div>

      {/* RIGHT — Markdown editors + actions */}
      <div className="flex flex-col gap-4">

        {/* Description — Markdown editor */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 flex-1">

          <FormField label="About / Description">
            {/* Controller wraps non-standard inputs for react-hook-form */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div data-color-mode="light">
                  <MDEditor
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    height={180}
                    preview="edit"
                  />
                </div>
              )}
            />
          </FormField>

          <FormField label="Visiting hours">
            <Controller
              name="visiting_hours"
              control={control}
              render={({ field }) => (
                <div data-color-mode="light">
                  <MDEditor
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    height={140}
                    preview="edit"
                    placeholder={`Monday – Friday: 8:00 AM – 8:00 PM\nSaturday: 9:00 AM – 5:00 PM\nEmergency: 24/7`}
                  />
                </div>
              )}
            />
          </FormField>

        </div>

        {/* Action buttons */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3">
          <button
            type="button"
            onClick={handleSubmit(data => onSubmit(data, false))}
            disabled={isSubmitting}
            className="flex-1 border border-gray-200 text-[#1A1A18] text-sm font-medium py-2.5 rounded-lg hover:border-[#5DCAA5] transition-colors disabled:opacity-40"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={handleSubmit(data => onSubmit(data, true))}
            disabled={isSubmitting}
            className="flex-1 bg-[#0F6E56] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#085041] transition-colors disabled:opacity-40"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update & publish' : 'Publish'}
          </button>
        </div>

      </div>

    </div>
  )
}

// ---- Helper: input CSS based on error state ----
function inputClass(hasError: boolean) {
  return `w-full rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none border transition-colors ${
    hasError
      ? 'bg-[#FCEBEB] border-[#A32D2D] focus:border-[#A32D2D]'
      : 'bg-[#F1EFE8] border-transparent focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20'
  }`
}

// ---- Helper: form field wrapper with label and error ----
function FormField({
  label,
  required = false,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-1.5 text-xs font-medium text-[#5F5E5A] uppercase tracking-wide mb-2">
        {required && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#A32D2D] flex-shrink-0" />
        )}
        {label}
      </label>
      {children}
      {/* Show Zod error message below the field */}
      {error && (
        <p className="text-xs text-[#A32D2D] mt-1 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

export default HospitalForm