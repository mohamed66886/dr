import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FiPlus, FiTrash2, FiSave, FiLoader } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';
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

const ExpensesTypesSection = () => {
  const [expenseTypes, setExpenseTypes] = useState([
    { value: 'rent', label: 'إيجار', isDirect: true },
    { value: 'salary', label: 'رواتب', isDirect: true },
    { value: 'supplies', label: 'مستلزمات', isDirect: true },
    { value: 'maintenance', label: 'صيانة', isDirect: true },
    { value: 'other', label: 'أخرى', isDirect: false },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editIdx, setEditIdx] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pendingEditIdx, setPendingEditIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const docRef = doc(db, 'config', 'clinicSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.expenseTypes)) {
            setExpenseTypes(data.expenseTypes);
          }
        }
      } catch (e) {
        console.error("Error fetching expense types:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenseTypes();
  }, []);

  const addExpenseType = () => {
    // تحقق إذا كان هناك صف غير مكتمل
    const hasEmpty = expenseTypes.some(t => !t.value.trim() || !t.label.trim());
    if (hasEmpty) {
      setErrors(prev => ({
        ...prev,
        global: 'يرجى إكمال جميع الحقول قبل إضافة نوع جديد.'
      }));
      return;
    }
    const newExpenseTypes = [...expenseTypes, { value: '', label: '', isDirect: true }];
    setExpenseTypes(newExpenseTypes);
    setEditIdx(newExpenseTypes.length - 1); // اجعل الصف الجديد في وضع التحرير
  };

  const removeExpenseType = (idx) => {
    if (expenseTypes.length > 1) {
      setExpenseTypes(expenseTypes.filter((_, i) => i !== idx));
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[`value-${idx}`];
        delete newErrors[`label-${idx}`];
        return newErrors;
      });
    }
  };

  const handleChange = (idx, key, value) => {
    setExpenseTypes(expenseTypes.map((t, i) => i === idx ? { ...t, [key]: value } : t));
    
    // Clear error when user starts typing
    if (errors[`${key}-${idx}`]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[`${key}-${idx}`];
        return newErrors;
      });
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    let isValid = true;

    expenseTypes.forEach((type, idx) => {
      if (!type.value.trim()) {
        newErrors[`value-${idx}`] = 'القيمة مطلوبة';
        isValid = false;
      }
      if (!type.label.trim()) {
        newErrors[`label-${idx}`] = 'الاسم الظاهر مطلوب';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'config', 'clinicSettings');
      await setDoc(docRef, { expenseTypes }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Error saving expense types:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExpenseType = (idx) => {
    setDeleteIdx(idx);
    setDeleteDialogOpen(true);
  };

  const confirmRemoveExpenseType = () => {
    if (deleteIdx !== null && expenseTypes.length > 1) {
      setExpenseTypes(expenseTypes.filter((_, i) => i !== deleteIdx));
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[`value-${deleteIdx}`];
        delete newErrors[`label-${deleteIdx}`];
        return newErrors;
      });
    }
    setDeleteDialogOpen(false);
    setDeleteIdx(null);
  };

  const handleEditSave = (idx) => {
    setPendingEditIdx(idx);
    setEditDialogOpen(true);
  };

  const confirmEditSave = () => {
    if (pendingEditIdx !== null) {
      handleSave();
      setEditIdx(null);
    }
    setEditDialogOpen(false);
    setPendingEditIdx(null);
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { opacity: 0, x: -20 }
  };

  const notificationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="bg-dental-blue/10 p-2 rounded-lg text-dental-blue">
                <FiPlus className="text-lg" />
              </span>
              إدارة أنواع المصروفات
            </h2>
            <p className="text-gray-500 mt-1 text-sm">يمكنك إضافة وتعديل أنواع المصروفات المالية للعيادة</p>
          </div>

          <div className="p-6">
            <AnimatePresence>
              {saved && (
                <motion.div
                  variants={notificationVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-6 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="bg-green-100 p-1 rounded-full mr-2">
                      <FiSave className="text-green-600" />
                    </span>
                    تم حفظ التغييرات بنجاح
                  </div>
                  <button onClick={() => setSaved(false)} className="text-green-600 hover:text-green-800">
                    &times;
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {errors.global && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 mb-4 text-center">
                {errors.global}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-dental-blue"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {expenseTypes.map((t, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="md:col-span-3">
                        <Label htmlFor={`value-${idx}`} className="block mb-1 text-sm font-medium text-gray-700">
                          القيمة (بالإنجليزية) *
                        </Label>
                        <Input
                          id={`value-${idx}`}
                          value={t.value}
                          onChange={e => editIdx === idx ? handleChange(idx, 'value', e.target.value) : null}
                          placeholder="مثال: rent"
                          className={errors[`value-${idx}`] ? 'border-red-500' : ''}
                          readOnly={editIdx !== idx}
                        />
                        {errors[`value-${idx}`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`value-${idx}`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-3">
                        <Label htmlFor={`label-${idx}`} className="block mb-1 text-sm font-medium text-gray-700">
                          الاسم الظاهر *
                        </Label>
                        <Input
                          id={`label-${idx}`}
                          value={t.label}
                          onChange={e => editIdx === idx ? handleChange(idx, 'label', e.target.value) : null}
                          placeholder="مثال: إيجار"
                          className={errors[`label-${idx}`] ? 'border-red-500' : ''}
                          readOnly={editIdx !== idx}
                        />
                        {errors[`label-${idx}`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`label-${idx}`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-3 flex items-center gap-3 pt-6">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={t.isDirect}
                            onChange={e => handleChange(idx, 'isDirect', e.target.checked)}
                            id={`isDirect-${idx}`}
                            className="sr-only"
                          />
                          <div
                            className={`block w-12 h-6 rounded-full ${t.isDirect ? 'bg-dental-blue' : 'bg-gray-300'}`}
                            onClick={() => handleChange(idx, 'isDirect', !t.isDirect)}
                            style={{ cursor: 'pointer' }}
                          ></div>
                          <div
                            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${t.isDirect ? 'transform translate-x-6' : ''}`}
                            onClick={() => handleChange(idx, 'isDirect', !t.isDirect)}
                            style={{ cursor: 'pointer' }}
                          ></div>
                        </div>
                        <Label htmlFor={`isDirect-${idx}`} className="text-sm text-gray-700">
                          {t.isDirect ? 'مصروف مباشر' : 'مصروف غير مباشر'}
                        </Label>
                      </div>

                      <div className="md:col-span-3 flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (editIdx === idx) {
                              handleEditSave(idx);
                            } else {
                              setEditIdx(idx);
                            }
                          }}
                          className={editIdx === idx ? 'text-green-600 hover:bg-green-50 hover:text-green-700' : 'text-blue-500 hover:bg-blue-50 hover:text-blue-600'}
                        >
                          {editIdx === idx ? (
                            <>
                              <FiSave className="ml-2" />
                              حفظ
                            </>
                          ) : (
                            <>
                              <FiSave className="ml-2" />
                              تعديل
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExpenseType(idx)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          disabled={expenseTypes.length <= 1}
                        >
                          <FiTrash2 className="ml-2" />
                          حذف
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-2"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addExpenseType}
                    className="text-dental-blue border-dental-blue hover:bg-dental-blue/10 w-full"
                  >
                    <FiPlus className="ml-2" />
                    إضافة نوع مصروف جديد
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-dental-blue hover:bg-dental-blue/90 text-white px-6 py-2 rounded-lg shadow-sm flex items-center"
              >
                {saving ? (
                  <>
                    <FiLoader className="animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FiSave className="ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف نوع المصروف هذا؟ لا يمكن التراجع عن هذه العملية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveExpenseType}>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد التعديل</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حفظ التعديلات على نوع المصروف هذا؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditDialogOpen(false)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEditSave}>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ExpensesTypesSection;