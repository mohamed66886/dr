import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiSave, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { db } from '@/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useAdminMessage } from '@/components/AdminMessage';
import AdminLayout from '@/components/AdminLayout';
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

// أنواع البيانات
type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  features: string[];
};

interface ServiceForm {
  title: string;
  description: string;
  image: string;
  icon: string;
  features: string[];
}

// تأثيرات الحركة
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4
    }
  },
  exit: { opacity: 0, x: -50 }
};

const formVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 }
};

const ServicesAdmin = () => {
  // الحالات
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState<ServiceForm>({ 
    title: '', 
    description: '', 
    image: '', 
    icon: '', 
    features: [''] 
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editService, setEditService] = useState<ServiceForm>({ 
    title: '', 
    description: '', 
    image: '', 
    icon: '', 
    features: [''] 
  });
  const [isAdding, setIsAdding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const { showMessage, MessageComponent } = useAdminMessage();

  // المصادقة والصلاحيات
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      window.location.href = "/login";
      return;
    }

    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "user" && !window.location.pathname.includes("/admin/appointments")) {
          window.location.href = "/admin/appointments";
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // جلب البيانات
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const servicesData = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Service));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
        showMessage('حدث خطأ أثناء جلب البيانات', 'error');
      }
    };
    
    fetchServices();
  }, [showMessage]);

  // معالجة إضافة خدمة جديدة
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.title.trim()) {
      showMessage('يرجى إدخال اسم الخدمة', 'warning');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'services'), {
        ...newService,
        features: newService.features.filter(f => f.trim() !== '')
      });
      
      setServices(prev => [
        ...prev,
        { 
          id: docRef.id, 
          ...newService, 
          features: newService.features.filter(f => f.trim() !== '') 
        }
      ]);
      
      setNewService({ 
        title: '', 
        description: '', 
        image: '', 
        icon: '', 
        features: [''] 
      });
      
      setIsAdding(false);
      showMessage('تمت إضافة الخدمة بنجاح', 'success');
    } catch (error) {
      console.error("Error adding service:", error);
      showMessage('حدث خطأ أثناء إضافة الخدمة', 'error');
    }
  };

  // معالجة الحذف
  const handleDelete = (id: string) => {
    setDeleteServiceId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteServiceId) return;
    
    try {
      await deleteDoc(doc(db, 'services', deleteServiceId));
      setServices(prev => prev.filter(s => s.id !== deleteServiceId));
      showMessage('تم حذف الخدمة بنجاح', 'success');
    } catch (error) {
      console.error("Error deleting service:", error);
      showMessage('حدث خطأ أثناء حذف الخدمة', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteServiceId(null);
    }
  };

  // معالجة التعديل
  const handleEdit = (service: Service) => {
    setEditId(service.id);
    setEditService({ 
      ...service, 
      features: service.features.length ? service.features : [''] 
    });
  };

  const handleSaveEdit = (id: string) => {
    if (!editService.title.trim()) {
      showMessage('يرجى إدخال اسم الخدمة', 'warning');
      return;
    }
    setPendingEditId(id);
    setEditDialogOpen(true);
  };

  const confirmSaveEdit = async () => {
    if (!pendingEditId) return;
    
    try {
      await updateDoc(doc(db, 'services', pendingEditId), {
        ...editService,
        features: editService.features.filter(f => f.trim() !== '')
      });
      
      setServices(prev => prev.map(s =>
        s.id === pendingEditId ? { 
          ...s, 
          ...editService, 
          features: editService.features.filter(f => f.trim() !== '') 
        } : s
      ));
      
      setEditId(null);
      showMessage('تم تعديل الخدمة بنجاح', 'success');
    } catch (error) {
      console.error("Error updating service:", error);
      showMessage('حدث خطأ أثناء تعديل الخدمة', 'error');
    } finally {
      setEditDialogOpen(false);
      setPendingEditId(null);
    }
  };

  // إدارة المميزات
  const handleFeatureChange = (
    features: string[],
    idx: number,
    value: string,
    setFn: React.Dispatch<React.SetStateAction<ServiceForm>>
  ) => {
    const updated = [...features];
    updated[idx] = value;
    setFn(prev => ({ ...prev, features: updated }));
  };

  const handleAddFeature = (
    features: string[],
    setFn: React.Dispatch<React.SetStateAction<ServiceForm>>
  ) => {
    setFn(prev => ({ ...prev, features: [...features, ''] }));
  };

  const handleRemoveFeature = (
    features: string[],
    idx: number,
    setFn: React.Dispatch<React.SetStateAction<ServiceForm>>
  ) => {
    const updated = features.filter((_, i) => i !== idx);
    setFn(prev => ({ ...prev, features: updated.length ? updated : [''] }));
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8 max-w-full mx-auto bg-gray-50 min-h-screen">
        {MessageComponent}
        
        {/* العنوان الرئيسي */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            إدارة الخدمات الطبية
          </h1>
          <p className="text-gray-600 text-center mt-2">
            قم بإضافة وتعديل وحذف خدمات العيادة
          </p>
        </motion.div>

        {/* لوحة التحكم */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* شريط الأدوات */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              قائمة الخدمات ({services.length})
            </h2>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsAdding(!isAdding)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center transition-colors ${
                  isAdding 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <FiPlus /> {isAdding ? 'إلغاء الإضافة' : 'إضافة خدمة'}
              </motion.button>
            </div>
          </div>

          {/* فورم الإضافة */}
          <AnimatePresence>
            {isAdding && (
              <motion.form
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleAdd}
                className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50"
              >
                <h3 className="font-bold text-lg mb-4 text-blue-600 flex items-center gap-2">
                  <FiPlus /> نموذج إضافة خدمة جديدة
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم الخدمة <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: تنظيف الأسنان"
                      value={newService.title}
                      onChange={e => setNewService({ ...newService, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وصف الخدمة
                    </label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="وصف مختصر للخدمة"
                      value={newService.description}
                      onChange={e => setNewService({ ...newService, description: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رابط صورة الخدمة
                    </label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="رابط الصورة من الإنترنت"
                      value={newService.image}
                      onChange={e => setNewService({ ...newService, image: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      أيقونة الخدمة
                    </label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: FaTooth من FontAwesome"
                      value={newService.icon}
                      onChange={e => setNewService({ ...newService, icon: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مميزات الخدمة:
                  </label>
                  
                  <div className="space-y-2">
                    {newService.features.map((f, i) => (
                      <motion.div 
                        key={i}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex items-center gap-2"
                      >
                        <input
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={f}
                          onChange={e => handleFeatureChange(newService.features, i, e.target.value, setNewService)}
                          placeholder={`الميزة ${i + 1}`}
                        />
                        <motion.button 
                          type="button" 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-red-500 rounded-full hover:bg-red-50 transition-colors"
                          onClick={() => handleRemoveFeature(newService.features, i, setNewService)}
                        >
                          <FiMinus />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-2 text-blue-600 flex items-center gap-1 text-sm font-medium"
                    onClick={() => handleAddFeature(newService.features, setNewService)}
                  >
                    <FiPlus /> إضافة ميزة جديدة
                  </motion.button>
                </div>
                
                <div className="flex justify-end gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={() => setIsAdding(false)}
                  >
                    إلغاء
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    حفظ الخدمة
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* جدول الخدمات */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الخدمة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الوصف
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المميزات
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الصورة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {services.length > 0 ? (
                    services.map((service, idx) => (
                      <motion.tr
                        key={service.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        {/* رقم الصف */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {idx + 1}
                        </td>
                        
                        {/* اسم الخدمة */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editId === service.id ? (
                            <input
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={editService.title}
                              onChange={e => setEditService({ ...editService, title: e.target.value })}
                              required
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {service.title}
                            </div>
                          )}
                        </td>
                        
                        {/* الوصف */}
                        <td className="px-6 py-4 max-w-xs">
                          {editId === service.id ? (
                            <input
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={editService.description}
                              onChange={e => setEditService({ ...editService, description: e.target.value })}
                            />
                          ) : (
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {service.description || 'لا يوجد وصف'}
                            </div>
                          )}
                        </td>
                        
                        {/* المميزات */}
                        <td className="px-6 py-4 max-w-xs">
                          {editId === service.id ? (
                            <div className="space-y-1">
                              {editService.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <input
                                    className="flex-1 p-1 border border-gray-300 rounded-lg text-sm"
                                    value={f}
                                    onChange={e => handleFeatureChange(editService.features, i, e.target.value, setEditService)}
                                  />
                                  <button 
                                    type="button" 
                                    className="text-red-500 p-1 hover:text-red-700"
                                    onClick={() => handleRemoveFeature(editService.features, i, setEditService)}
                                  >
                                    <FiMinus size={14} />
                                  </button>
                                </div>
                              ))}
                              <button 
                                type="button" 
                                className="text-xs text-blue-600 mt-1 flex items-center gap-1 hover:text-blue-800"
                                onClick={() => handleAddFeature(editService.features, setEditService)}
                              >
                                <FiPlus size={12} /> إضافة ميزة
                              </button>
                            </div>
                          ) : (
                            <ul className="list-disc pr-4 text-sm text-gray-600 space-y-1">
                              {service.features.length > 0 ? (
                                service.features.map((f, i) => (
                                  <li key={i}>{f}</li>
                                ))
                              ) : (
                                <li className="text-gray-400">لا توجد مميزات</li>
                              )}
                            </ul>
                          )}
                        </td>
                        
                        {/* الصورة */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.image ? (
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="inline-block"
                            >
                              <img 
                                src={service.image} 
                                alt={service.title}
                                className="w-12 h-12 rounded-md object-cover shadow-sm"
                              />
                            </motion.div>
                          ) : (
                            <span className="text-gray-400">لا يوجد</span>
                          )}
                        </td>
                        
                        {/* الإجراءات */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {editId === service.id ? (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                  onClick={() => handleSaveEdit(service.id)}
                                >
                                  <FiSave />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                                  onClick={() => setEditId(null)}
                                >
                                  <FiX />
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                  onClick={() => handleEdit(service)}
                                >
                                  <FiEdit2 />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  onClick={() => handleDelete(service.id)}
                                >
                                  <FiTrash2 />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        لا توجد خدمات متاحة. قم بإضافة خدمة جديدة.
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* حوارات التأكيد */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الخدمة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذه الخدمة؟ سيتم حذف جميع البيانات المرتبطة بها ولا يمكن استرجاعها لاحقًا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تعديل الخدمة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حفظ التغييرات على هذه الخدمة؟ سيتم تحديث البيانات للمستخدمين فورًا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={confirmSaveEdit}
            >
              حفظ التغييرات
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ServicesAdmin;