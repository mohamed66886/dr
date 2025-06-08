import AdminLayout from '@/components/AdminLayout';
import { motion } from 'framer-motion';
import { FiBarChart2, FiDollarSign, FiUsers, FiFileText, FiDownload, FiFilter, FiCalendar } from 'react-icons/fi';
import { MdOutlineMedicalServices, MdOutlineInsights } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated } from "@/lib/auth";
import React from "react";

const ReportsPage = () => {
  // بيانات التقارير
  const [loading, setLoading] = useState(true);
  const [expenseTotal, setExpenseTotal] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [serviceCount, setServiceCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      window.location.href = "/login";
    }
  }, []);

  // منع المستخدم العادي من الوصول لأي صفحة أدمن غير المواعيد
  React.useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "user" && !window.location.pathname.includes("/admin/appointments")) {
          window.location.href = "/admin/appointments";
        }
      } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // إجمالي المصروفات
      const expensesSnap = await getDocs(collection(db, 'expenses'));
      let expenseSum = 0;
      expensesSnap.forEach(doc => {
        const d = doc.data();
        if (typeof d.amount === 'number') expenseSum += d.amount;
        else if (d.amount) expenseSum += parseFloat(d.amount);
      });
      setExpenseTotal(expenseSum);
      // عدد المستخدمين
      const usersSnap = await getDocs(collection(db, 'users'));
      setUserCount(usersSnap.size);
      // عدد الخدمات
      const servicesSnap = await getDocs(collection(db, 'services'));
      setServiceCount(servicesSnap.size);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100"
      >
        <div className="max-w-6xl mx-auto">
          {/* العنوان والتحكم */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FiBarChart2 className="text-dental-blue" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-dental-blue to-dental-teal">
                  التقارير والإحصائيات
                </span>
              </h1>
              <p className="text-gray-600 mt-2">شاهد ملخصات الأداء المالي والإداري للعيادة</p>
            </div>
            
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-all">
                <FiFilter />
                <span>تصفية</span>
              </button>
              <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-all">
                <FiCalendar />
                <span>الفترة</span>
              </button>
              <button className="flex items-center gap-2 bg-dental-blue hover:bg-dental-blue-dark text-white px-4 py-2 rounded-lg shadow-md transition-all">
                <FiDownload />
                <span>تصدير</span>
              </button>
            </motion.div>
          </motion.div>

          {/* بطاقات التقارير */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-2 w-full"></div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <FiDollarSign className="text-2xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">تقرير المصروفات</h2>
                  </div>
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {loading ? '...' : expenseTotal.toLocaleString() + ' ر.س'}
                  </span>
                </div>
                <p className="text-gray-600">عرض وتحليل جميع المصروفات المباشرة وغير المباشرة</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400">آخر تحديث: اليوم</span>
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 transition-opacity shadow-md"
                    onClick={() => navigate('/admin/expenses-report')}
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 h-2 w-full"></div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <FiUsers className="text-2xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">تقرير المستخدمين</h2>
                </div>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-end">
                  {loading ? '...' : userCount + ' مستخدم'}
                </span>
                <p className="text-gray-600">إحصائيات حول المستخدمين والنشاطات الإدارية</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400">آخر تحديث: اليوم</span>
                  <button className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-br from-emerald-500 to-emerald-600 hover:opacity-90 transition-opacity shadow-md">عرض التفاصيل</button>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 h-2 w-full"></div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <MdOutlineMedicalServices className="text-2xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">تقرير الخدمات</h2>
                </div>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-end">
                  {loading ? '...' : serviceCount + ' خدمة'}
                </span>
                <p className="text-gray-600">ملخص عن الخدمات المقدمة وعدد الجلسات</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400">آخر تحديث: اليوم</span>
                  <button className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-br from-purple-500 to-purple-600 hover:opacity-90 transition-opacity shadow-md">عرض التفاصيل</button>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 h-2 w-full"></div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <MdOutlineInsights className="text-2xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">تقرير عام</h2>
                </div>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-end">--</span>
                <p className="text-gray-600">نظرة شاملة على أداء العيادة خلال الفترة المختارة</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400">آخر تحديث: اليوم</span>
                  <button className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-br from-amber-500 to-amber-600 hover:opacity-90 transition-opacity shadow-md">عرض التفاصيل</button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* قسم إضافي للإحصائيات */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MdOutlineInsights className="text-dental-blue" />
                <span>نظرة عامة على الأداء</span>
              </h2>
              <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue focus:border-transparent">
                <option>آخر 30 يومًا</option>
                <option>هذا الشهر</option>
                <option>هذا العام</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-100"
              >
                <p className="text-gray-500">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-blue-600">45,320 ر.س</p>
                <p className="text-sm text-green-500 mt-1">↑ 12% عن الشهر الماضي</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-100"
              >
                <p className="text-gray-500">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">12,450 ر.س</p>
                <p className="text-sm text-green-500 mt-1">↓ 8% عن الشهر الماضي</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-100"
              >
                <p className="text-gray-500">عدد المواعيد</p>
                <p className="text-2xl font-bold text-purple-600">124</p>
                <p className="text-sm text-green-500 mt-1">↑ 22% عن الشهر الماضي</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-100"
              >
                <p className="text-gray-500">رضا العملاء</p>
                <p className="text-2xl font-bold text-green-600">94%</p>
                <p className="text-sm text-green-500 mt-1">↑ 3% عن الشهر الماضي</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default ReportsPage;