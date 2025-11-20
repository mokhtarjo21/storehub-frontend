import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { Search, RefreshCcw } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/admin/orders/?search=${search}&status=${status}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">إدارة الطلبات</h1>

      <Card className="p-4">
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            <Input
              placeholder="ابحث برقم الطلب أو اسم العميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="حالة الطلب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">الكل</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="confirmed">تم التأكيد</SelectItem>
              <SelectItem value="shipped">تم الشحن</SelectItem>
              <SelectItem value="delivered">تم التوصيل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchOrders} disabled={loading} className="flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> تحديث
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_number}>
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.total_price} EGP</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100">{order.status}</span>
                  </TableCell>
                  <TableCell>{order.created_at}</TableCell>
                  <TableCell>
                    <Button size="sm" className="rounded-xl" onClick={() => (window.location = `/admin/orders/${order.order_number}`)}>
                      عرض
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

<!-- إدارة حالة الطلب -->
<div class="mt-8 bg-white p-6 rounded-2xl shadow">
  <h2 class="text-xl font-semibold mb-4">إدارة حالة الطلب</h2>
  <div class="space-y-4">
    <label class="block">
      <span class="text-gray-700">تغيير حالة الطلب</span>
      <select class="w-full p-2 border rounded-xl">
        <option>جديد</option>
        <option>جاري التحضير</option>
        <option>تم الشحن</option>
        <option>مكتمل</option>
        <option>ملغي</option>
      </select>
    </label>
    <button class="bg-blue-600 text-white px-4 py-2 rounded-xl w-full">تحديث الحالة</button>
    <button class="bg-red-500 text-white px-4 py-2 rounded-xl w-full">إلغاء الطلب</button>
  </div>
</div>

<!-- تفاصيل الطلب -->
<div class="mt-8 bg-white p-6 rounded-2xl shadow">
  <h2 class="text-xl font-semibold mb-4">تفاصيل الطلب</h2>
  <ul class="space-y-2 text-gray-700">
    <li>رقم الطلب: #12345</li>
    <li>العميل: محمد أحمد</li>
    <li>العنوان: القاهرة - مصر الجديدة</li>
    <li>المبلغ الإجمالي: 1500 جنيه</li>
    <li>طريقة الدفع: عند الاستلام</li>
  </ul>
</div>
