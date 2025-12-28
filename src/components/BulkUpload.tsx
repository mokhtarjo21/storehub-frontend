import { useState } from "react";

export default function BulkProductUploadButton({ title, onUpload, onDownloadTemplate }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
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
    } catch (err) {
      setError(err?.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloaddata = async () => {
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
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {title || "Bulk Upload CSV"}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Bulk Upload CSV</h2>

            {onDownloadTemplate && (
              <button
                type="button"
                onClick={downloaddata}
                className="text-sm text-blue-600 font-medium underline mb-4"
              >
                Download Template
              </button>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-100 file:text-blue-700
                           hover:file:bg-blue-200 cursor-pointer"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-blue-700
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>

            {result && (
              <div className="mt-4 text-sm space-y-1">
                {result.created !== undefined && (
                  <p className="text-green-600 font-medium">Created: {result.created}</p>
                )}
                {result.updated !== undefined && (
                  <p className="text-blue-600 font-medium">Updated: {result.updated}</p>
                )}
              </div>
            )}

            {result?.errors?.length > 0 && (
              <div className="mt-3 text-red-600 text-sm">
                <p className="font-semibold mb-1">Errors:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className="text-red-600 mt-3 text-sm font-medium">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
