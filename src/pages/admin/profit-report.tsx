import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/auth';
import React from 'react';
import { FiRefreshCw, FiArrowLeft, FiTrendingUp, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { FaClipboardCheck } from 'react-icons/fa';

const ProfitReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [profit, setProfit] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [expenseTotal, setExpenseTotal] = useState<number>(0);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [confirmedAppointments, setConfirmedAppointments] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    let visitPrice = 0;
    try {
      const settingsRef = doc(db, 'config', 'clinicSettings');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        visitPrice = parseFloat(data.price) || 0;
      }
    } catch (e) {
      console.error("Error fetching clinic settings:", e);
    }

    // Calculate expenses
    const expensesSnap = await getDocs(collection(db, 'expenses'));
    let expenseSum = 0;
    expensesSnap.forEach(doc => {
      const d = doc.data();
      if (fromDate && toDate) {
        const date = d.date ? new Date(d.date) : null;
        if (date && (date < new Date(fromDate) || date > new Date(toDate))) return;
      }
      if (typeof d.amount === 'number') expenseSum += d.amount;
      else if (d.amount) expenseSum += parseFloat(d.amount);
    });
    setExpenseTotal(expenseSum);

    // Calculate confirmed appointments and revenue
    const appointmentsSnap = await getDocs(collection(db, 'appointments'));
    let confirmedCount = 0;
    appointmentsSnap.forEach(doc => {
      const d = doc.data();
      if (fromDate && toDate) {
        const date = d.date ? new Date(d.date) : null;
        if (date && (date < new Date(fromDate) || date > new Date(toDate))) return;
      }
      if (d.status === 'confirmed') confirmedCount++;
    });
    
    setConfirmedAppointments(confirmedCount);
    const calculatedRevenue = confirmedCount * visitPrice;
    setRevenue(calculatedRevenue);
    setProfit(calculatedRevenue - expenseSum);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  const loadingVariants = {
    pulse: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity
      }
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <FiTrendingUp className="text-3xl text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">تقرير الأرباح المالية</h1>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm"
              >
                <label className="text-gray-700 text-sm whitespace-nowrap">من:</label>
                <input 
                  type="date" 
                  value={fromDate} 
                  onChange={e => setFromDate(e.target.value)} 
                  className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm"
              >
                <label className="text-gray-700 text-sm whitespace-nowrap">إلى:</label>
                <input 
                  type="date" 
                  value={toDate} 
                  onChange={e => setToDate(e.target.value)} 
                  className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                onClick={fetchData}
                disabled={loading}
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiRefreshCw className="animate-spin" />
                  </motion.span>
                ) : (
                  <FiRefreshCw />
                )}
                <span>تحديث البيانات</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-all" 
                onClick={() => navigate('/admin/reports')}
              >
                <FiArrowLeft />
                <span>رجوع</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {/* Confirmed Appointments */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              variants={cardVariants}
              className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">المواعيد المؤكدة</p>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={loading ? 'loading' : confirmedAppointments}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-bold text-gray-800 mt-1"
                    >
                      {loading ? (
                        <motion.span 
                          className="inline-block h-8 w-12 bg-gray-200 rounded"
                          animate="pulse"
                          variants={loadingVariants}
                        />
                      ) : (
                        confirmedAppointments.toLocaleString()
                      )}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaClipboardCheck size={20} />
                </div>
              </div>
            </motion.div>

            {/* Revenue Card */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              variants={cardVariants}
              className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">إجمالي الإيرادات</p>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={loading ? 'loading' : revenue}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-bold text-gray-800 mt-1"
                    >
                      {loading ? (
                        <motion.span 
                          className="inline-block h-8 w-12 bg-gray-200 rounded"
                          animate="pulse"
                          variants={loadingVariants}
                        />
                      ) : (
                        `${revenue.toLocaleString()} ج.م`
                      )}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FiDollarSign size={20} />
                </div>
              </div>
            </motion.div>

            {/* Expenses Card */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              variants={cardVariants}
              className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">إجمالي المصروفات</p>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={loading ? 'loading' : expenseTotal}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-bold text-gray-800 mt-1"
                    >
                      {loading ? (
                        <motion.span 
                          className="inline-block h-8 w-12 bg-gray-200 rounded"
                          animate="pulse"
                          variants={loadingVariants}
                        />
                      ) : (
                        `${expenseTotal.toLocaleString()} ج.م`
                      )}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <FiDollarSign size={20} />
                </div>
              </div>
            </motion.div>

            {/* Profit Card */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              variants={cardVariants}
              className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">صافي الأرباح</p>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={loading ? 'loading' : profit}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={`text-2xl font-bold mt-1 ${
                        profit >= 0 ? 'text-purple-600' : 'text-red-600'
                      }`}
                    >
                      {loading ? (
                        <motion.span 
                          className="inline-block h-8 w-12 bg-gray-200 rounded"
                          animate="pulse"
                          variants={loadingVariants}
                        />
                      ) : (
                        `${profit.toLocaleString()} ج.م`
                      )}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FiPieChart size={20} />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Report Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiTrendingUp className="text-blue-600" />
                ملخص الأداء المالي
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {fromDate && toDate 
                  ? `الفترة من ${new Date(fromDate).toLocaleDateString('ar-EG')} إلى ${new Date(toDate).toLocaleDateString('ar-EG')}`
                  : 'جميع البيانات المتاحة'}
              </p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">تحليل الأرباح</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الإيرادات:</span>
                    <span className="font-medium text-green-600">
                      {loading ? '...' : `${revenue.toLocaleString()} ج.م`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">المصروفات:</span>
                    <span className="font-medium text-red-600">
                      {loading ? '...' : `${expenseTotal.toLocaleString()} ج.م`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-semibold">صافي الربح:</span>
                      <span className={`font-bold ${
                        profit >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {loading ? '...' : `${profit.toLocaleString()} ج.م`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">مؤشرات الأداء</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">معدل الربح لكل موعد:</span>
                    <span className="font-medium text-blue-600">
                      {loading || confirmedAppointments === 0 
                        ? '...' 
                        : `${(profit / confirmedAppointments).toLocaleString(undefined, { maximumFractionDigits: 2 })} ج.م`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">نسبة المصروفات إلى الإيرادات:</span>
                    <span className="font-medium text-orange-600">
                      {loading || revenue === 0 
                        ? '...' 
                        : `${((expenseTotal / revenue) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">هامش الربح:</span>
                    <span className="font-medium text-green-600">
                      {loading || revenue === 0 
                        ? '...' 
                        : `${((profit / revenue) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center">
                {profit >= 0 ? (
                  "أداء مالي ممتاز! استمر في هذا النجاح."
                ) : (
                  "هناك فرص لتحسين الأداء المالي. راجع المصروفات واستراتيجيات التسعير."
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default ProfitReportPage;