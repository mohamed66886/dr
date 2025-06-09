import React, { useState, useEffect } from "react";
import AdminLayout from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase';
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { isAdminAuthenticated } from '@/lib/auth';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { CalendarIcon, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

// Animation variants
const fadeIn = (direction = 'up', delay = 0, duration = 0.5) => ({
  hidden: {
    opacity: 0,
    y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
    x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
  },
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      type: 'tween',
      ease: 'easeOut',
      delay,
      duration,
    },
  },
});

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

type FinancialYear = {
  id: string;
  from: string;
  to: string;
  createdAt: Date;
  isActive?: boolean;
};

const FinancialYearPage = () => {
  const [formData, setFormData] = useState({
    from: "",
    to: ""
  });
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState<FinancialYear[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    from: "",
    to: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Check authentication and fetch data
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    fetchFinancialYears();
  }, []);

  const fetchFinancialYears = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'financialYears'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedYears = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as FinancialYear[];
      
      // Mark the most recent year as active (for demo purposes)
      if (fetchedYears.length > 0) {
        fetchedYears[0].isActive = true;
      }
      
      setYears(fetchedYears);
    } catch (error) {
      console.error("Error fetching financial years:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب السنوات المالية.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateYear = (from: string, to: string) => {
    if (!from || !to) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يرجى إدخال تاريخ البداية والنهاية",
      });
      return false;
    }

    if (new Date(from) >= new Date(to)) {
      toast({
        variant: "destructive",
        title: "تاريخ غير صحيح",
        description: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
      });
      return false;
    }

    // Check for overlapping years
    const isOverlapping = years.some(year => {
      if (editId === year.id) return false; // Skip the year being edited
      return (
        (new Date(from) >= new Date(year.from) && new Date(from) <= new Date(year.to)) ||
        (new Date(to) >= new Date(year.from) && new Date(to) <= new Date(year.to))
      );
    });

    if (isOverlapping) {
      toast({
        variant: "destructive",
        title: "تعارض في الفترات",
        description: "هذه السنة المالية تتداخل مع سنة مالية موجودة مسبقاً",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateYear(formData.from, formData.to)) {
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'financialYears'), {
        ...formData,
        createdAt: new Date(),
      });
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة السنة المالية بنجاح",
        className: "bg-green-100 border-green-200 text-green-800",
      });
      
      setFormData({ from: "", to: "" });
      fetchFinancialYears();
    } catch (error) {
      console.error("Error adding financial year:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ السنة المالية",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (year: FinancialYear) => {
    setEditId(year.id);
    setEditData({
      from: year.from,
      to: year.to
    });
  };

  const handleEditSave = async () => {
    if (!editId) return;
    setIsSubmitting(true);

    if (!validateYear(editData.from, editData.to)) {
      setIsSubmitting(false);
      return;
    }

    try {
      await updateDoc(doc(db, 'financialYears', editId), {
        from: editData.from,
        to: editData.to,
      });
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث السنة المالية بنجاح",
        className: "bg-green-100 border-green-200 text-green-800",
      });
      
      setEditId(null);
      fetchFinancialYears();
    } catch (error) {
      console.error("Error updating financial year:", error);
      toast({
        variant: "destructive",
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء محاولة تحديث السنة المالية",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'financialYears', id));
      
      toast({
        title: "تم الحذف",
        description: "تم حذف السنة المالية بنجاح",
        className: "bg-green-100 border-green-200 text-green-800",
      });
      
      fetchFinancialYears();
    } catch (error) {
      console.error("Error deleting financial year:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف السنة المالية",
      });
    }
  };

  const confirmDelete = (id: string) => {
    toast({
      title: "هل أنت متأكد؟",
      description: "سيتم حذف السنة المالية بشكل دائم",
      className: "bg-yellow-100 border-yellow-200 text-yellow-800",
      action: (
        <ToastAction 
          altText="حذف" 
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={() => handleDelete(id)}
        >
          حذف
        </ToastAction>
      ),
    });
  };

  return (
    <AdminLayout>
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer()}
        className="container py-8"
      >
        {/* Add New Financial Year Card */}
        <motion.div variants={fadeIn('up', 0.1)} className="mb-8">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                إضافة سنة مالية جديدة
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ البداية
                    </label>
                    <Input
                      type="date"
                      name="from"
                      value={formData.from}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ النهاية
                    </label>
                    <Input
                      type="date"
                      name="to"
                      value={formData.to}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      min={formData.from}
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full md:w-auto mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ السنة المالية"
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="bg-gray-50 px-6 py-4 border-t">
              <div className="text-xs text-gray-500">
                <p>• السنة المالية تمثل الفترة الزمنية المستخدمة لإعداد التقارير المالية</p>
                <p>• تأكد من صحة التواريخ المدخلة قبل الحفظ</p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Financial Years List */}
        <motion.div variants={fadeIn('up', 0.2)}>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                السنوات المالية المسجلة
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : years.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد سنوات مالية مسجلة بعد
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الفترة</TableHead>
                        <TableHead>المدة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ الإضافة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {years.map((year) => (
                        <TableRow key={year.id}>
                          <TableCell>
                            {editId === year.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="date"
                                  name="from"
                                  value={editData.from}
                                  onChange={handleEditChange}
                                  className="w-32"
                                />
                                <span>إلى</span>
                                <Input
                                  type="date"
                                  name="to"
                                  value={editData.to}
                                  onChange={handleEditChange}
                                  className="w-32"
                                />
                              </div>
                            ) : (
                              <>
                                {format(new Date(year.from), 'yyyy/MM/dd')} - {format(new Date(year.to), 'yyyy/MM/dd')}
                              </>
                            )}
                          </TableCell>
                          <TableCell>
                            {Math.ceil(
                              (new Date(year.to).getTime() - new Date(year.from).getTime()) / 
                              (1000 * 60 * 60 * 24)
                            )} يوم
                          </TableCell>
                          <TableCell>
                            {year.isActive ? (
                              <Badge variant="default">نشطة</Badge>
                            ) : (
                              <Badge variant="secondary">غير نشطة</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(year.createdAt), 'yyyy/MM/dd')}
                          </TableCell>
                          <TableCell className="text-right">
                            {editId === year.id ? (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditId(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleEditSave}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(year)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => confirmDelete(year.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default FinancialYearPage;