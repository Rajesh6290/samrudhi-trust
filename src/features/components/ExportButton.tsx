"use client";

import { Download, FileDown } from "lucide-react";
import { useState } from "react";
import { handleExport, ExportButtonProps } from "@/lib/exportUtils";

interface ExportDropdownProps extends Omit<ExportButtonProps, "format"> {
  formats?: ("csv" | "json" | "excel")[];
}

export default function ExportButton({
  data,
  filename,
  formats = ["csv", "json"],
  label = "Export",
  className = "",
  prepareOptions,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportClick = (format: "csv" | "json" | "excel") => {
    handleExport({ data, filename, format, prepareOptions });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all ${className}`}
      >
        <FileDown className="w-5 h-5" />
        {label}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden">
            {formats.includes("csv") && (
              <button
                onClick={() => handleExportClick("csv")}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700 font-medium"
              >
                <Download className="w-4 h-4" />
                Export as CSV
              </button>
            )}
            {formats.includes("json") && (
              <button
                onClick={() => handleExportClick("json")}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700 font-medium border-t border-slate-100"
              >
                <Download className="w-4 h-4" />
                Export as JSON
              </button>
            )}
            {formats.includes("excel") && (
              <button
                onClick={() => handleExportClick("excel")}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700 font-medium border-t border-slate-100"
              >
                <Download className="w-4 h-4" />
                Export as Excel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
