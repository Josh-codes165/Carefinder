import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

function SearchBar({
  value,
  onChange,
  onSearch,
}: {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
}) {
  return (
    <div>
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder="Search hospitals..."
      />
      <button data-testid="search-button" onClick={onSearch}>
        Search
      </button>
    </div>
  )
}

describe('SearchBar', () => {
  it('renders input and search button', () => {
    render(<SearchBar value="" onChange={vi.fn()} onSearch={vi.fn()} />)
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
    expect(screen.getByTestId('search-button')).toBeInTheDocument()
  })

  it('calls onChange when user types', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} onSearch={vi.fn()} />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'Lagos' },
    })
    expect(onChange).toHaveBeenCalledWith('Lagos')
  })

  it('calls onSearch when button is clicked', () => {
    const onSearch = vi.fn()
    render(<SearchBar value="Lagos" onChange={vi.fn()} onSearch={onSearch} />)
    fireEvent.click(screen.getByTestId('search-button'))
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('calls onSearch when Enter key is pressed', () => {
    const onSearch = vi.fn()
    render(<SearchBar value="Lagos" onChange={vi.fn()} onSearch={onSearch} />)
    fireEvent.keyDown(screen.getByTestId('search-input'), { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('shows current value in input', () => {
    render(<SearchBar value="Abuja" onChange={vi.fn()} onSearch={vi.fn()} />)
    expect(screen.getByTestId('search-input')).toHaveValue('Abuja')
  })
})