import { useState } from "react";
import { EXPORT_COLUMNS, exportHospitalToCSV } from "../lib/export";
import type { ExportColumnKey } from "../lib/export";
import type { Hospital } from "../lib/hospitals";

type ExportModalProps = {
  hospitals: Hospital[];
  searchQuery: string;
  onClose: () => void;
};

function ExportModal({ hospitals, searchQuery, onClose }: ExportModalProps) {
  const [selectedColumns, setSelectedColumns] = useState<ExportColumnKey[]>([
    "name",
    "address",
    "phone",
    "email",
    "specialties",
  ]);

  function toggleColumn(key: ExportColumnKey) {
    setSelectedColumns(
      (prev) =>
        prev.includes(key)
          ? prev.filter((k) => k !== key) 
          : [...prev, key], 
    );
  }

  function handleExport() {
    if (selectedColumns.length === 0) return;

    exportHospitalToCSV(hospitals, selectedColumns, searchQuery);

    onClose();
  }

  const cleanQuery = searchQuery
    ? searchQuery.toLowerCase().replace(/\s+/g, "-")
    : "all";
  const date = new Date().toISOString().split("T")[0];
  const previewFilename = `hospitals-${cleanQuery}-${date}.csv`;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className="text-lg">📥</span>
          <h2 className="text-base font-semibold text-[#1A1A18]">
            Export to CSV
          </h2>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-lg bg-[#F1EFE8] flex items-center justify-center text-[#5F5E5A] hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-[#888780] uppercase tracking-wide mb-3">
            Select columns to include
          </p>

          <div className="flex flex-col gap-1 mb-5">
            {EXPORT_COLUMNS.map((column) => {
              const isChecked = selectedColumns.includes(column.key);

              return (
                <div
                  key={column.key}
                  onClick={() => toggleColumn(column.key)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#F6F5F0] transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                      isChecked
                        ? "bg-[#0F6E56] border-[#0F6E56]"
                        : "border-gray-300"
                    }`}
                  >
                    {isChecked && <span className="text-white text-xs">✓</span>}
                  </div>

                  <span className="text-sm text-[#1A1A18]">{column.label}</span>

                  {column.key === "name" && (
                    <span className="ml-auto text-xs text-[#888780]">
                      Required
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs font-medium text-[#888780] uppercase tracking-wide mb-2">
            Output filename
          </p>
          <div className="bg-[#F1EFE8] rounded-lg px-3 py-2.5 font-mono text-xs text-[#5F5E5A] mb-4">
            {previewFilename}
          </div>

          <p className="text-xs text-[#888780] mb-4">
            {hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""} will
            be exported · Downloads directly to your device
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-[#1A1A18] text-sm font-medium py-2.5 rounded-lg hover:bg-[#F6F5F0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selectedColumns.length === 0}
            className="flex-1 bg-[#0F6E56] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#085041] transition-colors disabled:opacity-40"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
