import React from "react";
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiDollarSign, FiCalendar, FiType, FiFileText, FiEdit, FiTrash, FiChevronRight } from 'react-icons/fi';
import { doc, getDoc, addDoc, collection, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { isAdminAuthenticated } from "@/lib/auth";

type ExpenseItem = {
  id: string;
  date: string;
  amount: number;
  type: string;
  typeLabel?: string;
  notes?: string;
  expenseType?: string;
  createdAt?: Date | string | null;
};

const DirectExpenses = () => {
  // Helper to get today's date in yyyy-mm-dd format
  const getToday = () => new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(getToday());
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState<{ value: string; label: string; isDirect?: boolean }[]>([
    { value: 'rent', label: 'إيجار', isDirect: true },
    { value: 'salary', label: 'رواتب', isDirect: true },
    { value: 'supplies', label: 'مستلزمات', isDirect: true },
    { value: 'maintenance', label: 'صيانة', isDirect: true },
    { value: 'other', label: 'أخرى', isDirect: false },
  ]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ExpenseItem>>({});
  const [page, setPage] = useState(1);
  const rowsPerPage = 3;
  const totalPages = Math.ceil(expenses.length / rowsPerPage);
  const paginatedExpenses = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return expenses.slice(start, start + rowsPerPage);
  }, [expenses, page]);
  const totalAmount = useMemo(() => expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0), [expenses]);
  const [expenseCategory, setExpenseCategory] = useState<'direct' | 'indirect'>('direct');

  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const docRef = doc(db, 'config', 'clinicSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.expenseTypes)) {
            // جلب isDirect
            const validTypes = data.expenseTypes
              .filter(t => t && typeof t.value === 'string' && typeof t.label === 'string')
              .map(t => ({ value: t.value, label: t.label, isDirect: t.isDirect }));
            if (validTypes.length > 0) {
              setExpenseTypes(validTypes);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching expense types:', e);
      }
    };
    fetchExpenseTypes();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const q = await getDocs(collection(db, 'expenses'));
        const data: ExpenseItem[] = q.docs
          .filter(d => {
            // دعم المصروفات التي ليس لها expenseType (قديمة) أو تساوي التصنيف الحالي
            const docType = d.data().expenseType;
            if (!docType && expenseCategory === 'direct') return true;
            return docType === expenseCategory;
          })
          .map(d => {
            const docData = d.data();
            return {
              id: d.id,
              date: docData.date || '',
              amount: typeof docData.amount === 'number' ? docData.amount : parseFloat(docData.amount || '0'),
              type: docData.type || '',
              typeLabel: docData.typeLabel,
              notes: docData.notes,
              expenseType: docData.expenseType,
              createdAt: docData.createdAt,
            };
          });
        setExpenses(data);
      } catch (e) {
        toast.error('خطأ في تحميل المصروفات');
      }
    };
    fetchExpenses();
  }, [loading, expenseCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!type) {
      toast.error('يجب اختيار نوع المصروف', { position: 'top-center' });
      setLoading(false);
      return;
    }
    const selectedType = expenseTypes.find(t => t.value === type);
    const typeLabel = selectedType ? selectedType.label : type;
    try {
      await addDoc(collection(db, 'expenses'), {
        date,
        amount: parseFloat(amount),
        type,
        typeLabel,
        notes,
        expenseType: expenseCategory, // حفظ التصنيف
        createdAt: new Date(),
      });
      toast.success('تمت إضافة المصروف بنجاح!', {
        position: 'top-center',
        duration: 3000,
      });
      // Reset form
      setDate(getToday());
      setAmount('');
      setType('');
      setNotes('');
      setExpenseCategory('direct');
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المصروف', {
        position: 'top-center',
      });
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await deleteDoc(doc(db, 'expenses', id));
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success('تم حذف المصروف بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (expense: ExpenseItem) => {
    setEditId(expense.id);
    setEditData({ ...expense });
  };

  const handleEditChange = (field: keyof ExpenseItem, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editId) return;
    try {
      await updateDoc(doc(db, 'expenses', editId), {
        date: editData.date,
        amount: typeof editData.amount === 'string' ? parseFloat(editData.amount) : editData.amount,
        type: editData.type,
        typeLabel: expenseTypes.find(t => t.value === editData.type)?.label || editData.type,
        notes: editData.notes,
      });
      setEditId(null);
      setLoading(l => !l); // لإعادة التحميل
      toast.success('تم التعديل بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء التعديل');
    }
  };

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

  // فلترة أنواع المصروفات حسب التصنيف
  const filteredExpenseTypes = expenseTypes.filter(t => expenseCategory === 'direct' ? t.isDirect : t.isDirect === false);

  // إعادة تعيين نوع المصروف عند تغيير التصنيف
  useEffect(() => {
    setType('');
  }, [expenseCategory]);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen p-2 sm:p-4 md:p-8 bg-gray-50"
      >
        <div className="max-w-full sm:max-w-4xl mx-auto">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="mb-4 sm:mb-8"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <FiDollarSign className="text-dental-blue" />
اضافة مصروف
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-base">أدخل تفاصيل المصروف للعيادة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-3 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {/* التصنيف */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="md:col-span-2"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    تصنيف المصروف
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-dental-blue focus:border-dental-blue outline-none transition"
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as 'direct' | 'indirect')}
                    required
                  >
                    <option value="direct">مباشر</option>
                    <option value="indirect">غير مباشر</option>
                  </select>
                </motion.div>

                {/* التاريخ */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiCalendar className="text-dental-blue" />
                    التاريخ
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-dental-blue focus:border-dental-blue outline-none transition"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    min="1900-01-01"
                    max="2100-12-31"
                    // اجعل القيمة الافتراضية تاريخ اليوم
                    defaultValue={date === '' ? new Date().toISOString().split('T')[0] : date}
                  />
                </motion.div>

                {/* المبلغ */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiDollarSign className="text-dental-blue" />
                    المبلغ (جنيه)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-dental-blue focus:border-dental-blue outline-none transition"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </motion.div>

                {/* نوع المصروف */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="md:col-span-2"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiType className="text-dental-blue" />
                    نوع المصروف
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-dental-blue focus:border-dental-blue outline-none transition"
                    value={type}
                    onChange={e => setType(String(e.target.value))}
                    required
                  >
                    <option value="">اختر نوع المصروف</option>
                    {filteredExpenseTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </motion.div>

                {/* الملاحظات */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="md:col-span-2"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiFileText className="text-dental-blue" />
                    الملاحظات
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-dental-blue focus:border-dental-blue outline-none transition min-h-[100px]"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="أضف ملاحظاتك هنا..."
                  />
                </motion.div>
              </div>

              {/* زر الإضافة */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 sm:mt-6"
              >
                <Button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 rounded-lg bg-dental-blue text-white font-semibold shadow-md hover:bg-dental-blue/90 transition"
                  disabled={loading}
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة مصروف جديد'}
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* جدول المصروفات */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 sm:mt-10"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                قائمة المصروفات
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 font-medium shadow-sm hover:bg-gray-300 transition"
                >
                  <FiChevronRight className="transform rotate-180" />
                </Button>
                <Button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 font-medium shadow-sm hover:bg-gray-300 transition"
                >
                  السابق
                </Button>
                <Button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 font-medium shadow-sm hover:bg-gray-300 transition"
                >
                  التالي
                </Button>
                <Button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 font-medium shadow-sm hover:bg-gray-300 transition"
                >
                  <FiChevronRight />
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">التاريخ</TableHead>
                  <TableHead className="text-center">المبلغ</TableHead>
                  <TableHead className="text-center">النوع</TableHead>
                  <TableHead className="text-center">الملاحظات</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      لا توجد مصروفات لعرضها
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedExpenses.map(expense => (
                    <TableRow key={expense.id} className="hover:bg-gray-50 transition">
                      <TableCell className="text-center">
                        {new Date(expense.date).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell className="text-center">
                        {expense.amount.toFixed(2)} جنيه
                      </TableCell>
                      <TableCell className="text-center">
                        {expense.typeLabel}
                      </TableCell>
                      <TableCell className="text-center">
                        {expense.notes}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            onClick={() => handleEdit(expense)}
                            className="px-3 py-1.5 rounded-lg bg-yellow-500 text-white font-medium shadow-sm hover:bg-yellow-400 transition"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(expense.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-medium shadow-sm hover:bg-red-400 transition"
                          >
                            <FiTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* معلومات إضافية عن المصروفات */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-4 sm:p-6 bg-gray-100 rounded-lg shadow-md"
            >
              <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-3">
                معلومات إضافية
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">إجمالي المصروفات:</span>
                  <span className="font-semibold text-gray-800">
                    {totalAmount.toFixed(2)} جنيه
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">عدد الصفحات:</span>
                  <span className="font-semibold text-gray-800">
                    {totalPages}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">الصفحة الحالية:</span>
                  <span className="font-semibold text-gray-800">
                    {page}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default DirectExpenses;
