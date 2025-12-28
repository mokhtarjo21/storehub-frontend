import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface BulkProductUploadButtonProps {
  title?: string;
  onUpload: (formData: FormData) => Promise<{ data: any }>;
  onDownloadTemplate?: () => Promise<{ data: Blob }>;
}

export default function BulkProductUploadButton({
  title,
  onUpload,
  onDownloadTemplate,
}: BulkProductUploadButtonProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await onUpload(formData);
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloaddata = async () => {
    if (!onDownloadTemplate) return;
    const res = await onDownloadTemplate();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 text-xs sm:text-sm font-medium whitespace-nowrap min-w-fit"
      >
        {title || "Bulk Upload CSV"}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-black/70 z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 pr-8">
              {title || "Bulk Upload CSV"}
            </h2>

            {onDownloadTemplate && (
              <button
                type="button"
                onClick={downloaddata}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium underline mb-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Download Template
              </button>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-50 dark:file:bg-blue-900/30
                             file:text-blue-700 dark:file:text-blue-300
                             hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                             cursor-pointer
                             border border-gray-300 dark:border-gray-600
                             rounded-lg p-2
                             bg-white dark:bg-gray-700"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white font-semibold py-2.5 sm:py-3 rounded-lg shadow hover:bg-blue-700 dark:hover:bg-blue-600
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                           hover:shadow-md active:scale-[0.98] text-sm sm:text-base"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>

            {result && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                {result.created !== undefined && (
                  <p className="text-green-600 dark:text-green-400 font-medium text-sm">
                    ✓ Created: {result.created}
                  </p>
                )}
                {result.updated !== undefined && (
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                    ✓ Updated: {result.updated}
                  </p>
                )}
              </div>
            )}

            {result?.errors &&
              Array.isArray(result.errors) &&
              result.errors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="font-semibold mb-2 text-red-600 dark:text-red-400 text-sm">
                    Errors:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-red-600 dark:text-red-400">
                    {result.errors.map((e: string, i: number) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
