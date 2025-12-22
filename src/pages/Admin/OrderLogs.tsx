import React, { useState, useEffect } from "react";
import { getLogs, addLogs, deleteLogs } from "../../utils/axiosInstance"; // المسار حسب مشروعك
import usericon from "../../assets/user.png"
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
export default function OrderLogs({ orderId }) {
  const [logs, setLogs] = useState([]);
  const [newLog, setNewLog] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();
  const{user}=useAuth();
  // Fetch logs
  const fetchLogs = async () => {
    try {
      const { data } = await getLogs(orderId);
      setLogs(data.results);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [orderId]);

  // Add new log
  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLog.trim()) return;

    setLoading(true);
    try {
      const { data } = await addLogs({ order: orderId, content: newLog });
      setLogs([data, ...logs]);
      setNewLog("");
    } catch (error) {
      console.error("Error adding log:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete log
  const handleDeleteLog = async (logId) => {
    try {
      await deleteLogs(logId);
      setLogs(logs.filter((log) => log.id !== logId));
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  return (
    <div className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
      <h2 className="text-xl font-bold ">{language=='ar'?"Order Logs":"سجل الطلب"}</h2>

      {/* Add new log */}
      <form onSubmit={handleAddLog} className="mb-4 gap-4 flex">
        <input
          type="text"
          placeholder={language=='ar'?"Add log.":"اضف سجل"}
          className="w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl 
                     bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white 
                     placeholder-gray-500 dark:placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200
                     text-sm md:text-base"
          value={newLog}
          onChange={(e) => setNewLog(e.target.value)}
        />
        <button
          type="submit"
          className=" px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          disabled={loading}
        >
          {loading ? language=='ar'?"Posting....":"جاري الاضافة" : language=='ar'?"Post":"اضافة"}
        </button>
      </form>

      {/* Logs list */}
      <div className="space-y-4">
        {logs.length === 0 && <p className="text-gray-500">{language=='ar'?"No logs yet.":"لا توجد سجلات "}</p>}
        {logs.map((log) => (
          <div key={log.id} className="flex space-x-3">
            <img
              src={log.user.avatar ||usericon}
              alt={log.user.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">{log.user.full_name}</p>
              <p className="text-gray-700">{log.content}</p>
              <p className="text-gray-400 text-sm">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
            {user.id ==log.user.id&&(
            <button
              onClick={() => handleDeleteLog(log.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>)}
          </div>
        ))}
      </div>
    </div>
  );
}
