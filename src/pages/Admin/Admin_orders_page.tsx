import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApi } from '../../hooks/useApi';
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext"
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const { fetchorders,updateorders} =useAuth();
  const { t, language } = useLanguage();

  const fetchOrders = async () => {
    setLoading(true);
    try {
       const [cRes] = await Promise.allSettled([
         fetchorders(search,status),
      ]);
      console.log(cRes);

      if (cRes.status === "fulfilled") {
        const cdata = (cRes.value.results ?? cRes.value.data);
        if (Array.isArray(cdata)) setOrders(cdata);
      }

      // const res = fetchorders(search,status);
      // console.log(res.json())
      // setOrders(res?.results || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.order_status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      const num =selectedOrder.order_number;
      updateorders(num,orderStatus);
      fetchOrders();
      alert(t("updateStatusBtn"));
    } catch (error) {
      console.error(error);
      alert(t("updateStatusBtn"));
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      await useApi(`/api/orders/${selectedOrder.order_number}/cancel/`);
      fetchOrders();
      alert(t("cancelOrderBtn"));
      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      alert(t("cancelOrderBtn"));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">{t("pageTitle")}</h1>

      {/* بحث وفلترة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="border p-2 rounded-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded-md"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t("filterAll")}</option>
          <option value="pending">{t("filterPending")}</option>
          <option value="confirmed">{t("filterConfirmed")}</option>
          <option value="shipped">{t("filterShipped")}</option>
          <option value="delivered">{t("filterDelivered")}</option>
          <option value="cancelled">{t("filterCancelled")}</option>
        </select>
        <button className="bg-blue-600 text-white p-2 rounded-md" onClick={fetchOrders}>
          {loading ? t("loading") : t("refreshBtn")}
        </button>
      </div>

      {/* جدول الطلبات */}
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">{t("orderNumber")}</th>
              <th className="px-4 py-2 text-left">{t("customer")}</th>
              <th className="px-4 py-2 text-left">{t("total")}</th>
              <th className="px-4 py-2 text-left">{t("status")}</th>
              <th className="px-4 py-2 text-left">{t("createdAt")}</th>
              <th className="px-4 py-2 text-left">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.order_number}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectOrder(order)}
              >
                <td className="px-4 py-2">{order.order_number}</td>
                <td className="px-4 py-2">{order.user_name}</td>
                <td className="px-4 py-2">{order.total_price} EGP</td>
                <td className="px-4 py-2">{order.order_status}</td>
                <td className="px-4 py-2">{order.created_at}</td>
                <td className="px-4 py-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded-md"
                    onClick={() => handleSelectOrder(order)}
                  >
                    {t("view")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* تفاصيل الطلب */}
      {selectedOrder && (
        <div className="space-y-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{t("manageStatus")}</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700">{t("changeStatus")}</span>
                <select
                  className="w-full p-2 border rounded-md"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  <option value="pending">{t("filterPending")}</option>
                  <option value="processing">{t("filterPending")}</option>
                  <option value="shipped">{t("filterShipped")}</option>
                  <option value="delivered">{t("filterDelivered")}</option>
                  <option value="cancelled">{t("filterCancelled")}</option>
                </select>
              </label>
              <button
                className="w-full bg-blue-600 text-white p-2 rounded-md"
                onClick={handleUpdateStatus}
              >
                {t("updateStatusBtn")}
              </button>
              <button
                className="w-full bg-red-500 text-white p-2 rounded-md"
                onClick={handleCancelOrder}
              >
                {t("cancelOrderBtn")}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{t("orderDetails")}</h2>
            <ul className="space-y-2 text-gray-700">
              <li>{t("orderNumber")}: {selectedOrder.order_number}</li>
              <li>{t("customer")}: {selectedOrder.user_name}</li>
              <li>{t("shippingAddress")}: {selectedOrder.shipping_address}</li>
              <li>{t("total")}: {selectedOrder.total_price} جنيه</li>
              <li>{t("paymentMethod")}: {selectedOrder.payment_status}</li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
}
