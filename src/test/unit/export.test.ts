import { describe, it, expect } from 'vitest'
import { EXPORT_COLUMNS } from '../../lib/export'

describe('CSV Export columns', () => {
  it('contains name column', () => {
    const keys = EXPORT_COLUMNS.map(c => c.key)
    expect(keys).toContain('name')
  })

  it('contains address column', () => {
    const keys = EXPORT_COLUMNS.map(c => c.key)
    expect(keys).toContain('address')
  })

  it('contains phone column', () => {
    const keys = EXPORT_COLUMNS.map(c => c.key)
    expect(keys).toContain('phone')
  })

  it('contains email column', () => {
    const keys = EXPORT_COLUMNS.map(c => c.key)
    expect(keys).toContain('email')
  })

  it('contains specialties column', () => {
    const keys = EXPORT_COLUMNS.map(c => c.key)
    expect(keys).toContain('specialties')
  })

  it('each column has both a label and a key', () => {
    EXPORT_COLUMNS.forEach(col => {
      expect(col.label).toBeTruthy()
      expect(col.key).toBeTruthy()
    })
  })
})