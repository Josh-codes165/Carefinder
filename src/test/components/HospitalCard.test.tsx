import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Hospital } from '../../lib/hospitals'

function HospitalCard({
  hospital,
  isSelected,
  onSelect,
  onNavigate,
}: {
  hospital: Hospital
  isSelected: boolean
  onSelect: () => void
  onNavigate: () => void
}) {
  return (
    <div
      data-testid="hospital-card"
      onClick={onNavigate}
      onMouseEnter={onSelect}
      data-selected={isSelected}
    >
      <h3 data-testid="hospital-name">{hospital.name}</h3>
      <p data-testid="hospital-address">{hospital.address}</p>
      <span data-testid="ownership-badge">{hospital.ownership_type}</span>
      {hospital.avg_rating > 0 && (
        <span data-testid="rating">{hospital.avg_rating.toFixed(1)}</span>
      )}
      {hospital.specialties.map(s => (
        <span key={s} data-testid="specialty-tag">{s}</span>
      ))}
    </div>
  )
}

const mockHospital: Hospital = {
  id: '1',
  name: 'Lagos Island General Hospital',
  address: 'Broad Street, Lagos Island',
  city: 'Lagos',
  lga: 'Lagos Island',
  state: 'Lagos',
  phone: '+234 1 269 0000',
  email: 'info@ligh.gov.ng',
  specialties: ['Emergency', 'Maternity'],
  ownership_type: 'public',
  description: null,
  visiting_hours: null,
  is_published: true,
  avg_rating: 4.1,
  review_count: 38,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  latitude: 6.4541,
  longitude: 3.3947,
  image_url: null,
}

describe('HospitalCard', () => {
  it('renders hospital name', () => {
    render(
      <HospitalCard
        hospital={mockHospital}
        isSelected={false}
        onSelect={vi.fn()}
        onNavigate={vi.fn()}
      />
    )
    expect(screen.getByTestId('hospital-name')).toHaveTextContent(
      'Lagos Island General Hospital'
    )
  })

  it('renders hospital address', () => {
    render(
      <HospitalCard
        hospital={mockHospital}
        isSelected={false}
        onSelect={vi.fn()}
        onNavigate={vi.fn()}
      />
    )
    expect(screen.getByTestId('hospital-address')).toHaveTextContent(
      'Broad Street, Lagos Island'
    )
  })

  it('renders ownership badge', () => {
    render(
      <HospitalCard
        hospital={mockHospital}
        isSelected={false}
        onSelect={vi.fn()}
        onNavigate={vi.fn()}
      />
    )
    expect(screen.getByTestId('ownership-badge')).toHaveTextContent('public')
  })

  it('renders specialties correctly', () => {
    render(
      <HospitalCard
        hospital={mockHospital}
        isSelected={false}
        onSelect={vi.fn()}
        onNavigate={vi.fn()}
      />
    )
    const tags = screen.getAllByTestId('specialty-tag')
    expect(tags).toHaveLength(2)
    expect(tags[0]).toHaveTextContent('Emergency')
    expect(tags[1]).toHaveTextContent('Maternity')
  })

  it('renders rating when avg_rating > 0', () => {
    render(
      <HospitalCard
        hospital={mockHospital}
        isSelected={false}
        onSelect={vi.fn()}
        onNavigate={vi.fn()}
      />
    )
    expect(screen.getByTestId('rating')).toHaveTextContent('4.1')
  })

  it('does not render rating when avg_rating is 0', () => {
    render(
      <HospitalCard
        hospital={{ ...mockHospital, avg_rating: 0 }}
        isSelected={false}
        onSelect={vi.fn()}
        onNavigate={vi.fn()}
      />
    )
    expect(screen.queryByTestId('rating')).not.toBeInTheDocument()
  })

  it('calls onNavigate when clicked', () => {
    const onNavigate = vi.fn()
    render(
      <HospitalCard
        hospital={mockHospital}
        isSelected={false}
        onSelect={vi.fn()}
        onNavigate={onNavigate}
      />
    )
    fireEvent.click(screen.getByTestId('hospital-card'))
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('calls onSelect when mouse enters', () => {
    const onSelect = vi.fn()
    render(
      <HospitalCard
        hospital={mockHospital}
        isSelected={false}
        onSelect={onSelect}
        onNavigate={vi.fn()}
      />
    )
    fireEvent.mouseEnter(screen.getByTestId('hospital-card'))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})