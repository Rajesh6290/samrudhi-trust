/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle special characters and quotes
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          if (
            stringValue.includes(",") ||
            stringValue.includes("\n") ||
            stringValue.includes('"')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${Date.now()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any[], filename: string) {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${Date.now()}.json`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to Excel format (simple CSV with .xlsx extension)
 * For true Excel format, you would need a library like xlsx or exceljs
 */
export function exportToExcel(data: any[], filename: string) {
  // For now, this uses CSV format with xlsx extension
  // To generate true Excel files, you'd need to install and use 'xlsx' package
  exportToCSV(data, filename);
}

/**
 * Prepare data for export by flattening nested objects and formatting dates
 */
export function prepareDataForExport(
  data: any[],
  options?: {
    excludeFields?: string[];
    flattenObjects?: boolean;
    formatDates?: boolean;
  }
) {
  const {
    excludeFields = ["__v", "updatedAt"],
    flattenObjects = true,
    formatDates = true,
  } = options || {};

  return data.map((item) => {
    const processed: any = {};

    Object.keys(item).forEach((key) => {
      // Skip excluded fields
      if (excludeFields.includes(key)) return;

      let value = item[key];

      // Format dates
      if (formatDates && value instanceof Date) {
        value = new Date(value).toLocaleString();
      } else if (
        formatDates &&
        typeof value === "string" &&
        isValidDate(value)
      ) {
        value = new Date(value).toLocaleString();
      }

      // Flatten nested objects
      if (
        flattenObjects &&
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.keys(value).forEach((nestedKey) => {
          processed[`${key}_${nestedKey}`] = value[nestedKey];
        });
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        processed[key] = value.join(", ");
      } else {
        processed[key] = value;
      }
    });

    return processed;
  });
}

/**
 * Check if string is a valid date
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Export component/button helper
 */
export interface ExportButtonProps {
  data: any[];
  filename: string;
  format?: "csv" | "json" | "excel";
  label?: string;
  className?: string;
  prepareOptions?: {
    excludeFields?: string[];
    flattenObjects?: boolean;
    formatDates?: boolean;
  };
}

export function handleExport({
  data,
  filename,
  format = "csv",
  prepareOptions,
}: Omit<ExportButtonProps, "label" | "className">) {
  const preparedData = prepareDataForExport(data, prepareOptions);

  switch (format) {
    case "csv":
      exportToCSV(preparedData, filename);
      break;
    case "json":
      exportToJSON(data, filename); // Use original data for JSON
      break;
    case "excel":
      exportToExcel(preparedData, filename);
      break;
    default:
      exportToCSV(preparedData, filename);
  }
}
