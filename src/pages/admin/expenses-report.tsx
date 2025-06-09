import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { FiFilter, FiCalendar, FiDownload, FiLoader } from 'react-icons/fi';
import { MdOutlineAttachMoney, MdOutlineDescription } from 'react-icons/md';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { isAdminAuthenticated } from "@/lib/auth";
import React from "react";

const expenseTypes = [
  { label: 'كل المصروفات', value: 'all', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  { label: 'مباشرة', value: 'direct', color: 'bg-gradient-to-r from-green-500 to-green-600' },
  { label: 'غير مباشرة', value: 'indirect', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
];

type Expense = {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  notes?: string;
  expenseType?: string; // إضافة هذا الحقل لدعم الفلترة حسب نوع المصروف الرئيسي
};

const ExpensesReportPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtered, setFiltered] = useState<Expense[]>([]);
  const [expenseTypeNames, setExpenseTypeNames] = useState<Record<string, string>>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [expandedTypes, setExpandedTypes] = useState<string[]>([]);

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
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'expenses'));
        const data = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            date: d.date || '',
            type: d.type || '',
            description: d.description || '',
            amount: typeof d.amount === 'number' ? d.amount : parseFloat(d.amount || '0'),
            notes: d.notes || '',
            expenseType: d.expenseType || '', // إضافة هذا السطر لجلب نوع المصروف الرئيسي
          };
        });
        setExpenses(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  useEffect(() => {
    let result = [...expenses];
    if (type === 'direct' || type === 'indirect') {
      result = result.filter(e => (e.expenseType || '') === type);
    } else if (type !== 'all') {
      result = result.filter(e => e.type === type);
    }
    if (dateFrom) result = result.filter(e => e.date >= dateFrom);
    if (dateTo) result = result.filter(e => e.date <= dateTo);
    
    // حساب المجموع الكلي
    const sum = result.reduce((acc, curr) => acc + curr.amount, 0);
    setTotalAmount(sum);
    
    setFiltered(result);
  }, [expenses, type, dateFrom, dateTo]);

  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const snap = await getDocs(collection(db, 'expenseTypes'));
        const types: Record<string, string> = {};
        snap.forEach(doc => {
          const d = doc.data();
          if (d.value && d.label) types[d.value] = d.label;
        });
        setExpenseTypeNames(types);
      } catch (e) {
        console.error("Error fetching expense types:", e);
      }
    };
    fetchExpenseTypes();
  }, []);

  const getExpenseTypeLabel = (type: string) => {
    if (expenseTypeNames[type]) return expenseTypeNames[type];
    switch (type) {
      case 'direct': return 'مباشرة';
      case 'indirect': return 'غير مباشرة';
      case 'rent': return 'إيجار';
      case 'salary': return 'رواتب';
      case 'maintenance': return 'صيانة';
      default: return type || '-';
    }
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((exp, i) => ({
      '#': i + 1,
      'التاريخ': format(new Date(exp.date), 'yyyy-MM-dd', { locale: arSA }),
      'النوع': getExpenseTypeLabel(exp.type),
      'الوصف': exp.description,
      'ملاحظات': exp.notes || '-',
      'المبلغ': exp.amount,
      'العملة': 'جنيه'
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المصروفات');
    XLSX.writeFile(wb, `تقرير-المصروفات-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'yyyy/MM/dd', { locale: arSA });
  };

  // تجميع المصروفات حسب النوع
  const groupedExpenses = filtered.reduce<Record<string, Expense[]>>((acc, exp) => {
    if (!acc[exp.type]) acc[exp.type] = [];
    acc[exp.type].push(exp);
    return acc;
  }, {});

  const handleToggleType = (type: string) => {
    setExpandedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <HiOutlineDocumentReport className="text-dental-blue text-3xl" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-dental-blue to-dental-teal">
                تقرير المصروفات
              </span>
            </h1>
            <p className="text-gray-600 mt-2">تحليل مفصل لجميع مصروفات العيادة</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-gradient-to-r from-dental-blue to-dental-teal hover:from-dental-blue-dark hover:to-dental-teal-dark text-white px-5 py-3 rounded-xl shadow-lg transition-all"
          >
            <FiDownload className="text-lg" />
            <span>تصدير إلى Excel</span>
          </motion.button>
        </motion.div>

        {/* فلترة البيانات */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع المصروف</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-dental-blue focus:border-transparent bg-gray-50"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {expenseTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-dental-blue focus:border-transparent bg-gray-50"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-dental-blue focus:border-transparent bg-gray-50"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ملخص المصروفات */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-600">إجمالي المصروفات</h3>
              <MdOutlineAttachMoney className="text-blue-500 text-xl" />
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-600">
              {totalAmount.toLocaleString()} جنيه
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-green-50 to-green-100 border border-green-100 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-600">عدد السجلات</h3>
              <FiFilter className="text-green-500 text-xl" />
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {filtered.length}
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-100 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-600">متوسط المصروف</h3>
              <MdOutlineAttachMoney className="text-purple-500 text-xl" />
            </div>
            <p className="text-2xl font-bold mt-2 text-purple-600">
              {filtered.length > 0 ? (totalAmount / filtered.length).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} جنيه
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-100 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-600">آخر تحديث</h3>
              <FiCalendar className="text-amber-500 text-xl" />
            </div>
            <p className="text-2xl font-bold mt-2 text-amber-600">
              {format(new Date(), 'yyyy/MM/dd', { locale: arSA })}
            </p>
          </motion.div>
        </motion.div>

        {/* توضيح نوع الفلتر الحالي */}
        {type !== 'all' && (
          <div className="mb-4 text-right text-sm text-blue-700 font-bold">
            عرض فقط المصروفات: {getExpenseTypeLabel(type)}
          </div>
        )}

        {/* جدول المصروفات */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* جدول في الديسكتوب، بطاقات في الموبايل */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المجموع الكلي</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد العمليات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تفاصيل</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center items-center gap-2"
                        >
                          <FiLoader className="animate-spin text-dental-blue text-xl" />
                          <span>جاري تحميل البيانات...</span>
                        </motion.div>
                      </td>
                    </tr>
                  ) : Object.keys(groupedExpenses).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        لا توجد بيانات متاحة للعرض
                      </td>
                    </tr>
                  ) : (
                    Object.entries(groupedExpenses).map(([typeKey, exps], idx) => (
                      <React.Fragment key={typeKey}>
                        <tr
                          className="bg-gray-50 cursor-pointer hover:bg-blue-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{getExpenseTypeLabel(typeKey)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">{exps.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} جنيه</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{exps.length}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              className="text-dental-blue underline"
                              onClick={e => {
                                e.stopPropagation();
                                handleToggleType(typeKey);
                              }}
                            >
                              {expandedTypes.includes(typeKey) ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                            </button>
                          </td>
                        </tr>
                        <AnimatePresence>
                          {expandedTypes.includes(typeKey) && (
                            <motion.tr
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <td colSpan={5} className="bg-white px-6 py-2">
                                <table className="w-full text-sm border">
                                  <thead>
                                    <tr>
                                      <th className="px-2 py-1">#</th>
                                      <th className="px-2 py-1">التاريخ</th>
                                      <th className="px-2 py-1">ملاحظات</th>
                                      <th className="px-2 py-1">المبلغ</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {exps.map((exp, i) => (
                                      <tr key={exp.id} className="border-t">
                                        <td className="px-2 py-1">{i + 1}</td>
                                        <td className="px-2 py-1">{formatDate(exp.date)}</td>
                                        <td className="px-2 py-1">{exp.notes || '-'}</td>
                                        <td className="px-2 py-1 text-red-600">{exp.amount.toLocaleString()} جنيه</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {/* بطاقات في الموبايل */}
          <div className="sm:hidden flex flex-col gap-3 p-2">
            <AnimatePresence>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center items-center gap-2"
                  >
                    <FiLoader className="animate-spin text-dental-blue text-xl" />
                    <span>جاري تحميل البيانات...</span>
                  </motion.div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  لا توجد بيانات متاحة للعرض
                </div>
              ) : (
                filtered.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg shadow p-3 flex flex-col gap-2 border border-gray-100"
                  >
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>#{i + 1}</span>
                      <span>{formatDate(exp.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        exp.type === 'direct' ? 'bg-green-100 text-green-800' :
                        exp.type === 'indirect' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getExpenseTypeLabel(exp.type)}
                      </span>
                      <span className="text-red-600 font-bold">{exp.amount.toLocaleString()} جنيه</span>
                    </div>
                    {exp.notes && (
                      <div className="text-xs text-gray-600">{exp.notes}</div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ExpensesReportPage;