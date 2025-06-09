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
  const [date, setDate] = useState('');
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
          .filter(d => d.data().expenseType === 'direct')
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
  }, [loading]);

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
      setDate('');
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
              <div className="mt-4 sm:mt-6 flex flex-col md:flex-row gap-2 sm:gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                >
                  حفظ المصروف
                </Button>
              </div>
            </form>
          </motion.div>

          {/* جدول المصروفات */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6 sm:mt-8"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2 sm:mb-4">
              قائمة المصروفات المباشرة
            </h2>

            {expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm sm:text-base">
                لا توجد مصروفات مباشرة مسجلة بعد.
              </p>
            ) : (
              <div>
                {/* جدول في الديسكتوب، بطاقات في الموبايل */}
                <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">التاريخ</TableHead>
                        <TableHead className="whitespace-nowrap">المبلغ</TableHead>
                        <TableHead className="whitespace-nowrap">النوع</TableHead>
                        <TableHead className="whitespace-nowrap">الملاحظات</TableHead>
                        <TableHead className="whitespace-nowrap text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedExpenses.map(expense => (
                        <TableRow key={expense.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(expense.date).toLocaleDateString('ar-EG')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {expense.amount.toFixed(2)} جنيه
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {expense.typeLabel}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {expense.notes}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(expense)}
                              >
                                <FiEdit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDelete(expense.id)}
                              >
                                <FiTrash className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* بطاقات في الموبايل */}
                <div className="sm:hidden flex flex-col gap-3 mt-2">
                  {paginatedExpenses.map(expense => (
                    <div key={expense.id} className="bg-white rounded-lg shadow p-3 flex flex-col gap-2 border border-gray-100">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{new Date(expense.date).toLocaleDateString('ar-EG')}</span>
                        <span className="font-bold text-dental-blue">{expense.amount.toFixed(2)} جنيه</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-700">{expense.typeLabel}</div>
                      {expense.notes && (
                        <div className="text-xs text-gray-600">{expense.notes}</div>
                      )}
                      <div className="flex justify-end gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="!p-2"
                          onClick={() => handleEdit(expense)}
                        >
                          <FiEdit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="!p-2"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <FiTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* ترقيم الصفحات وإجمالي المصروفات */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                  <div className="text-gray-500 text-sm sm:text-base">
                    إجمالي المصروفات: <strong>{totalAmount.toFixed(2)} جنيه</strong>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="text-xs sm:text-base"
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="text-xs sm:text-base"
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default DirectExpenses;
