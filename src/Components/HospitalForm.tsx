import { useState } from 'react'
import { createHospital, updateHospital } from '../lib/hospitals'
import type { Hospital } from '../lib/hospitals'

type HospitalFormProps = {
  hospital?: Hospital | null  
  onSuccess: () => void
}

const SPECIALTIES = [
  'Emergency', 'Maternity', 'Pediatric', 'Dental',
  'Cardiology', 'Orthopedic', 'Oncology', 'Ophthalmology'
]

export function HospitalForm({ hospital, onSuccess }: HospitalFormProps) {
  const isEditing = !!hospital

  const [name, setName] = useState(hospital?.name ?? '')
  const [address, setAddress] = useState(hospital?.address ?? '')
  const [city, setCity] = useState(hospital?.city ?? '')
  const [lga, setLga] = useState(hospital?.lga ?? '')
  const [state, setState] = useState(hospital?.state ?? 'Lagos')
  const [phone, setPhone] = useState(hospital?.phone ?? '')
  const [email, setEmail] = useState(hospital?.email ?? '')
  const [description, setDescription] = useState(hospital?.description ?? '')
  const [visitingHours, setVisitingHours] = useState(hospital?.visiting_hours ?? '')
  const [ownershipType, setOwnershipType] = useState<'public' | 'private'>(
    hospital?.ownership_type ?? 'public'
  )
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    Array.isArray(hospital?.specialties) ? hospital.specialties : []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  async function handleSubmit(publish: boolean) {
    // Validation
    if (!name.trim()) { setError('Hospital name is required'); return }
    if (!address.trim()) { setError('Address is required'); return }
    if (!city.trim()) { setError('City is required'); return }
    if (!lga.trim()) { setError('LGA is required'); return }

    setIsLoading(true)
    setError('')

    const hospitalData = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      lga: lga.trim(),
      state: state.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      description: description.trim() || null,
      visiting_hours: visitingHours.trim() || null,
      ownership_type: ownershipType,
      specialties: selectedSpecialties,
      is_published: publish,
    }

    try {
      if (isEditing && hospital) {
        await updateHospital(hospital.id, hospitalData)
      } else {
        await createHospital(hospitalData)
      }
      onSuccess()
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* LEFT — Form fields */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">

        {error && (
          <div className="bg-[#FCEBEB] border border-red-200 rounded-lg px-4 py-3 text-sm text-[#A32D2D] mb-4">
            {error}
          </div>
        )}

        <FormField label="Hospital name" required>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Lagos Island General Hospital"
            className="w-full bg-[#F1EFE8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5]"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="City" required>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Lagos"
              className="w-full bg-[#F1EFE8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5]"
            />
          </FormField>
          <FormField label="LGA" required>
            <input
              value={lga}
              onChange={e => setLga(e.target.value)}
              placeholder="Lagos Island"
              className="w-full bg-[#F1EFE8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5]"
            />
          </FormField>
        </div>

        <FormField label="State" required>
          <input
            value={state}
            onChange={e => setState(e.target.value)}
            placeholder="Lagos"
            className="w-full bg-[#F1EFE8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5]"
          />
        </FormField>

        <FormField label="Full address" required>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Broad St, Lagos Island, Lagos State"
            className="w-full bg-[#F1EFE8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5]"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone number">
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 1 000 0000"
              className="w-full bg-[#F1EFE8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5]"
            />
          </FormField>
          <FormField label="Email">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="info@hospital.ng"
              className="w-full bg-[#F1EFE8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5]"
            />
          </FormField>
        </div>

        <FormField label="Ownership type">
          <div className="flex gap-2">
            {(['public', 'private'] as const).map(type => (
              <button
                key={type}
                onClick={() => setOwnershipType(type)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  ownershipType === type
                    ? 'bg-[#E1F5EE] border-[#5DCAA5] text-[#0F6E56]'
                    : 'bg-[#F1EFE8] border-transparent text-[#5F5E5A]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Specialties">
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(specialty => (
              <button
                key={specialty}
                onClick={() => toggleSpecialty(specialty)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedSpecialties.includes(specialty)
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

      <div className="flex flex-col gap-4">

        <div className="bg-white border border-gray-100 rounded-xl p-6 flex-1">
          <FormField label="About / Description">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write a description of the hospital, its services and history..."
              rows={6}
              className="w-full bg-[#F1EFE8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5] resize-none"
            />
          </FormField>

          <FormField label="Visiting hours">
            <textarea
              value={visitingHours}
              onChange={e => setVisitingHours(e.target.value)}
              placeholder={`Monday – Friday: 8:00 AM – 8:00 PM\nSaturday: 9:00 AM – 5:00 PM\nEmergency: 24/7`}
              rows={4}
              className="w-full bg-[#F1EFE8] rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:ring-2 focus:ring-[#5DCAA5]/30 border border-transparent focus:border-[#5DCAA5] resize-none font-mono"
            />
          </FormField>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="flex-1 border border-gray-200 text-[#1A1A18] text-sm font-medium py-2.5 rounded-lg hover:border-[#5DCAA5] transition-colors disabled:opacity-40"
          >
            Save as draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="flex-1 bg-[#0F6E56] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#085041] transition-colors disabled:opacity-40"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update & publish' : 'Publish'}
          </button>
        </div>
      </div>

    </div>
  )
}

function FormField({
  label, required = false, children
}: {
  label: string
  required?: boolean
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
    </div>
  )
}
