import React from "react";
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FiPlus, FiDollarSign, FiCalendar, FiType, FiFileText, FiEdit, FiTrash, FiChevronRight, FiChevronLeft, FiChevronsRight, FiChevronsLeft } from 'react-icons/fi';
import { doc, getDoc, addDoc, collection, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { isAdminAuthenticated } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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

const expenseTypeColors: Record<string, string> = {
  rent: 'bg-blue-100 text-blue-800',
  salary: 'bg-purple-100 text-purple-800',
  supplies: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
};

const DirectExpenses = () => {
  const getToday = () => new Date().toISOString().split('T')[0];
  const controls = useAnimation();

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
  const rowsPerPage = 5;
  const totalPages = Math.ceil(expenses.length / rowsPerPage);
  const paginatedExpenses = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return expenses.slice(start, start + rowsPerPage);
  }, [expenses, page]);
  const totalAmount = useMemo(() => expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0), [expenses]);
  const [expenseCategory, setExpenseCategory] = useState<'direct' | 'indirect'>(() => {
    const saved = localStorage.getItem('expenseCategory');
    return saved === 'direct' || saved === 'indirect' ? saved : 'direct';
  });
  const [financialYear, setFinancialYear] = useState<{from: string, to: string} | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const fetchExpenseTypes = async () => {
    try {
      const docRef = doc(db, 'config', 'clinicSettings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.expenseTypes)) {
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

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const q = await getDocs(collection(db, 'expenses'));
      const data: ExpenseItem[] = q.docs
        .filter(d => {
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
      await controls.start("show");
    } catch (e) {
      toast.error('خطأ في تحميل المصروفات');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFinancialYear = async () => {
    const q = await getDocs(collection(db, 'financialYears'));
    const years = q.docs.map(d => d.data());
    if (years.length > 0) {
      years.sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime());
      setFinancialYear({ from: years[0].from, to: years[0].to });
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
    fetchFinancialYear();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [loading, expenseCategory]);

  const isDateInFinancialYear = (date: string) => {
    if (!financialYear) return true;
    return date >= financialYear.from && date <= financialYear.to;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!type) {
      toast.error('يجب اختيار نوع المصروف', { position: 'top-center' });
      setLoading(false);
      return;
    }
    
    if (!isDateInFinancialYear(date)) {
      await controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.6 }
      });
      
      toast.error(`تاريخ المصروف خارج السنة المالية (${financialYear?.from} إلى ${financialYear?.to})`, {
        position: 'top-center',
        icon: '⏳',
      });
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
        expenseType: expenseCategory,
        createdAt: new Date(),
      });
      
      await Promise.all([
        controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.3 }
        }),
        new Promise(resolve => {
          toast.success('تمت إضافة المصروف بنجاح!', {
            position: 'top-center',
            duration: 2000,
            icon: '💰',
          });
          setTimeout(resolve, 2000);
        })
      ]);
      
      // Reset form
      setDate(getToday());
      setAmount('');
      setType('');
      setNotes('');
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المصروف', {
        position: 'top-center',
        icon: '❌',
      });
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteExpenseId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteExpenseId) return;
    try {
      await deleteDoc(doc(db, 'expenses', deleteExpenseId));
      setExpenses(expenses.filter(e => e.id !== deleteExpenseId));
      
      toast.success('تم حذف المصروف بنجاح', {
        icon: '🗑️',
      });
    } catch {
      toast.error('حدث خطأ أثناء الحذف', {
        icon: '❌',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteExpenseId(null);
    }
  };

  const handleEdit = (expense: ExpenseItem) => {
    setEditId(expense.id);
    setEditData({ ...expense });
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
      setLoading(l => !l);
      
      toast.success('تم التعديل بنجاح', {
        icon: '✏️',
      });
    } catch {
      toast.error('حدث خطأ أثناء التعديل', {
        icon: '❌',
      });
    } finally {
      setEditDialogOpen(false);
    }
  };

  const filteredExpenseTypes = expenseTypes.filter(t => 
    expenseCategory === 'direct' ? t.isDirect : t.isDirect === false
  );

  const handleCategoryChange = (value: 'direct' | 'indirect') => {
    setExpenseCategory(value);
    localStorage.setItem('expenseCategory', value);
    setType('');
  };

  useEffect(() => {
    setType('');
  }, [expenseCategory]);

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

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen p-2 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="max-w-full mx-auto" style={{ width: '100%', maxWidth: '100vw', minWidth: '280px' }}>
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <motion.h1 
                  className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <FiDollarSign className="text-blue-600" />
                  إدارة المصروفات
                </motion.h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  قم بإدارة مصروفات العيادة اليومية والمباشرة وغير المباشرة
                </p>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex gap-2"
              >
                <Badge variant={expenseCategory === 'direct' ? 'default' : 'secondary'} className="cursor-pointer">
                  <span onClick={() => handleCategoryChange('direct')}>مباشرة</span>
                </Badge>
                <Badge variant={expenseCategory === 'indirect' ? 'default' : 'secondary'} className="cursor-pointer">
                  <span onClick={() => handleCategoryChange('indirect')}>غير مباشرة</span>
                </Badge>
              </motion.div>
            </div>
          </motion.div>

          {/* Add Expense Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <motion.div 
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
              whileHover={{ y: -2 }}
            >
              <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              
              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                >
                  {/* التاريخ */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-blue-500" />
                        <span>التاريخ</span>
                      </div>
                    </label>
                    <Input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                      className="w-full"
                    />
                  </motion.div>

                  {/* المبلغ */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-blue-500" />
                        <span>المبلغ (جنيه)</span>
                      </div>
                    </label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full"
                    />
                  </motion.div>

                  {/* نوع المصروف */}
                  <motion.div variants={itemVariants} className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FiType className="text-blue-500" />
                        <span>نوع المصروف</span>
                      </div>
                    </label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختر نوع المصروف" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredExpenseTypes.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* الملاحظات */}
                  <motion.div variants={itemVariants} className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FiFileText className="text-blue-500" />
                        <span>الملاحظات</span>
                      </div>
                    </label>
                    <Textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="أضف ملاحظاتك هنا..."
                      className="min-h-[100px]"
                    />
                  </motion.div>
                </motion.div>

                {/* زر الإضافة */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6"
                >
                  <Button
                    type="submit"
                    className="w-full py-3 rounded-lg shadow-md"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {loading ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        <FiPlus className="w-5 h-5" />
                      </motion.span>
                    ) : (
                      <>
                        <FiPlus className="ml-2" />
                        إضافة مصروف جديد
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>

          {/* Expenses Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  سجل المصروفات ({expenseCategory === 'direct' ? 'مباشرة' : 'غير مباشرة'})
                </h2>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                    className="px-2"
                  >
                    <FiChevronsRight className="transform rotate-180" />
                  </Button>
                  <Button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                    className="px-2"
                  >
                    <FiChevronRight className="transform rotate-180" />
                  </Button>
                  <span className="text-sm font-medium">
                    الصفحة {page} من {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                    className="px-2"
                  >
                    <FiChevronRight />
                  </Button>
                  <Button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                    className="px-2"
                  >
                    <FiChevronsRight />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table className="min-w-[600px] sm:min-w-full text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">التاريخ</TableHead>
                      <TableHead className="text-right min-w-[100px]">المبلغ</TableHead>
                      <TableHead className="min-w-[150px]">النوع</TableHead>
                      <TableHead>الملاحظات</TableHead>
                      <TableHead className="text-center min-w-[120px]">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: rowsPerPage }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Skeleton className="h-8 w-8 rounded" />
                              <Skeleton className="h-8 w-8 rounded" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : paginatedExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center gap-2 text-gray-500"
                          >
                            <FiFileText className="w-10 h-10" />
                            <p>لا توجد مصروفات مسجلة</p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence>
                        {paginatedExpenses.map((expense) => (
                          <motion.tr
                            key={expense.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="border-t hover:bg-gray-50"
                          >
                            <TableCell>
                              {new Date(expense.date).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className="font-medium text-right">
                              {expense.amount.toLocaleString('ar-EG', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })} ج.م
                            </TableCell>
                            <TableCell>
                              <Badge className={expenseTypeColors[expense.type] || 'bg-gray-100 text-gray-800'}>
                                {expense.typeLabel || expense.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {expense.notes || '---'}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-1">
                                <Button
                                  onClick={() => handleEdit(expense)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-yellow-50"
                                >
                                  <FiEdit className="w-4 h-4 text-yellow-600" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(expense.id)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                >
                                  <FiTrash className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Summary Section */}
            <motion.div 
              className="border-t border-gray-200 bg-gray-50 p-2 sm:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">إجمالي المصروفات</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {totalAmount.toLocaleString('ar-EG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} ج.م
                  </p>
                </div>
                <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">عدد المصروفات</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {expenses.length}
                  </p>
                </div>
                <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">متوسط المصروف</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {expenses.length > 0 
                      ? (totalAmount / expenses.length).toLocaleString('ar-EG', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                      : '0.00'} ج.م
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <AlertDialogTitle className="flex items-center gap-2">
                <FiTrash className="text-red-500" />
                تأكيد الحذف
              </AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد أنك تريد حذف هذا المصروف؟ لا يمكن التراجع عن هذه العملية.
              </AlertDialogDescription>
            </motion.div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2"
            >
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                تأكيد الحذف
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Confirmation Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <AlertDialogTitle className="flex items-center gap-2">
                <FiEdit className="text-blue-500" />
                تأكيد التعديل
              </AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد أنك تريد حفظ التعديلات على هذا المصروف؟
              </AlertDialogDescription>
            </motion.div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2"
            >
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleEditSave}
                className="bg-blue-500 hover:bg-blue-600"
              >
                حفظ التعديلات
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default DirectExpenses;