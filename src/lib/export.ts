import Papa from "papaparse"
import type { Hospital } from "./hospitals"

export const EXPORT_COLUMNS = [
    { label: 'Hospital name', key: 'name'},
    { label: 'Address', key: 'address'},
    { label: 'City', key: 'city'},
    { label: 'LGA', key: 'lga'},
    { label: 'Phone Number', key: 'phone'},
    { label: 'Email', key: 'email'},
    { label: 'Specialties', key: 'specialties'},
    { label: 'Ownership', key: 'ownership_type'},
    { label: 'Star rating', key: 'avg_rating'},
] as const

export type ExportColumnKey = typeof EXPORT_COLUMNS[number]['key']

export function exportHospitalToCSV(
    hospitals : Hospital[],
    selectedColumns : ExportColumnKey[],
    searchQuery : string
) {
    const rows = hospitals.map(hospital => {
        const row: Record<string, unknown> = {}

        selectedColumns.forEach(col => {
            if(col === 'specialties'){
                row["Specialties"] = Array.isArray(hospital.specialties)
                ? hospital.specialties.join(', ')
                : hospital.specialties
            } else {
                const column = EXPORT_COLUMNS.find(c => c.key === col)
                const header = column ? column.label : col
                row[header] = hospital[col as keyof Hospital] ?? ''
            }
        })

        return row
    })

    const csv =     Papa.unparse(rows)

    const cleanQuery = searchQuery
    ? searchQuery.toLocaleLowerCase().replace(/\s+/g, '-')
    : "all"

    const date = new Date().toISOString().split('T')[0]
    const filename = `hospital-${cleanQuery}-${date}.csv`

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
}