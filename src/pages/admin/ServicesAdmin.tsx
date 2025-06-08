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

type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  features: string[];
};

// تعريف نوع للفورم
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

const ServicesAdmin = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({ 
    title: '', 
    description: '', 
    image: '', 
    icon: '', 
    features: [''] 
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editService, setEditService] = useState({ 
    title: '', 
    description: '', 
    image: '', 
    icon: '', 
    features: [''] 
  });
  const [isAdding, setIsAdding] = useState(false);
  const { showMessage, MessageComponent } = useAdminMessage();

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

  // جلب الخدمات من Firestore
  useEffect(() => {
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, 'services'));
      setServices(querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Service)));
    };
    fetchServices();
  }, []);

  // إضافة خدمة جديدة إلى Firestore
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.title) return;
    const docRef = await addDoc(collection(db, 'services'), {
      ...newService,
      features: newService.features.filter(f => f.trim() !== '')
    });
    setServices([
      ...services,
      { id: docRef.id, ...newService, features: newService.features.filter(f => f.trim() !== '') }
    ]);
    setNewService({ title: '', description: '', image: '', icon: '', features: [''] });
    setIsAdding(false);
    showMessage('تمت إضافة الخدمة بنجاح', 'success');
  };

  // حذف خدمة من Firestore
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'services', id));
    setServices(services.filter(s => s.id !== id));
    showMessage('تم حذف الخدمة بنجاح', 'success');
  };

  // بدء التعديل
  const handleEdit = (service: Service) => {
    setEditId(service.id);
    setEditService({ ...service, features: service.features.length ? service.features : [''] });
  };

  // حفظ التعديل في Firestore
  const handleSaveEdit = async (id: string) => {
    await updateDoc(doc(db, 'services', id), {
      ...editService,
      features: editService.features.filter(f => f.trim() !== '')
    });
    setServices(services.map(s => 
      s.id === id ? { ...s, ...editService, features: editService.features.filter(f => f.trim() !== '') } : s
    ));
    setEditId(null);
    showMessage('تم تعديل الخدمة بنجاح', 'success');
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
      <div className="p-2 sm:p-6 max-w-full sm:max-w-6xl mx-auto">
        {MessageComponent}
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-dental-blue text-center"
        >
          إدارة الخدمات
        </motion.h2>

        {/* زر إضافة خدمة جديدة */}
        <div className="flex flex-col sm:flex-row justify-end mb-4 sm:mb-6 gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(!isAdding)}
            className="bg-dental-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
          >
            <FiPlus /> {isAdding ? 'إلغاء الإضافة' : 'إضافة خدمة جديدة'}
          </motion.button>
        </div>

        {/* فورم إضافة خدمة جديدة */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              className="bg-white p-3 sm:p-6 rounded-xl shadow-lg mb-6 sm:mb-8 overflow-hidden"
            >
              <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-dental-blue">إضافة خدمة جديدة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخدمة</label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                    placeholder="اسم الخدمة"
                    value={newService.title}
                    onChange={e => setNewService({ ...newService, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">وصف الخدمة</label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                    placeholder="وصف الخدمة"
                    value={newService.description}
                    onChange={e => setNewService({ ...newService, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة</label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                    placeholder="رابط الصورة"
                    value={newService.image}
                    onChange={e => setNewService({ ...newService, image: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الأيقونة</label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                    placeholder="مثال: FaTooth"
                    value={newService.icon}
                    onChange={e => setNewService({ ...newService, icon: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">المميزات:</label>
                {newService.features.map((f, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center mb-2 gap-2"
                  >
                    <input
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                      value={f}
                      onChange={e => handleFeatureChange(newService.features, i, e.target.value, setNewService)}
                      placeholder={`ميزة ${i + 1}`}
                    />
                    <motion.button 
                      type="button" 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-red-500 p-2 rounded-full hover:bg-red-50"
                      onClick={() => handleRemoveFeature(newService.features, i, setNewService)}
                    >
                      <FiMinus />
                    </motion.button>
                  </motion.div>
                ))}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2 text-dental-blue flex items-center gap-1 text-sm font-medium"
                  onClick={() => handleAddFeature(newService.features, setNewService)}
                >
                  <FiPlus /> إضافة ميزة
                </motion.button>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-4 sm:mt-6 bg-dental-blue text-white px-6 py-2 rounded-lg w-full shadow-md hover:bg-blue-600 transition-colors"
              >
                إضافة الخدمة
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* قائمة الخدمات */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header for desktop, hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-2">الخدمة</div>
            <div className="col-span-3">الوصف</div>
            <div className="col-span-2">المميزات</div>
            <div className="col-span-2 text-center">الصورة</div>
            <div className="col-span-2 text-center">إجراءات</div>
          </div>
          <AnimatePresence>
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="sm:grid sm:grid-cols-12 p-3 sm:p-4 border-b border-gray-200 items-center hover:bg-gray-50 transition-colors flex flex-col gap-2 sm:gap-0"
              >
                {/* رقم الخدمة */}
                <div className="sm:col-span-1 text-center text-gray-500 w-full sm:w-auto text-xs sm:text-base">
                  <span className="sm:hidden font-bold"># </span>{idx + 1}
                </div>
                {/* اسم الخدمة */}
                <div className="sm:col-span-2 w-full sm:w-auto">
                  {editId === service.id ? (
                    <input
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue text-sm"
                      value={editService.title}
                      onChange={e => setEditService({ ...editService, title: e.target.value })}
                    />
                  ) : (
                    <div className="font-medium text-sm sm:text-base">{service.title}</div>
                  )}
                </div>
                {/* وصف الخدمة */}
                <div className="sm:col-span-3 w-full sm:w-auto">
                  {editId === service.id ? (
                    <input
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue text-sm"
                      value={editService.description}
                      onChange={e => setEditService({ ...editService, description: e.target.value })}
                    />
                  ) : (
                    <div className="text-gray-600 line-clamp-2 text-xs sm:text-sm">{service.description}</div>
                  )}
                </div>
                {/* المميزات */}
                <div className="sm:col-span-2 w-full sm:w-auto">
                  {editId === service.id ? (
                    <div>
                      {editService.features.map((f, i) => (
                        <div key={i} className="flex items-center mb-1 gap-1">
                          <input
                            className="flex-1 p-1 border border-gray-300 rounded-lg text-xs sm:text-sm"
                            value={f}
                            onChange={e => handleFeatureChange(editService.features, i, e.target.value, setEditService)}
                          />
                          <button 
                            type="button" 
                            className="text-red-500 p-1"
                            onClick={() => handleRemoveFeature(editService.features, i, setEditService)}
                          >
                            <FiMinus size={14} />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button" 
                        className="text-xs text-dental-blue mt-1 flex items-center gap-1"
                        onClick={() => handleAddFeature(editService.features, setEditService)}
                      >
                        <FiPlus size={12} /> إضافة ميزة
                      </button>
                    </div>
                  ) : (
                    <ul className="list-disc pr-4 text-xs sm:text-sm text-gray-600 space-y-1">
                      {service.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* الصورة */}
                <div className="sm:col-span-2 flex justify-center w-full sm:w-auto mt-2 sm:mt-0">
                  {service.image ? (
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      src={service.image} 
                      alt={service.title}
                      className="w-16 h-16 object-cover rounded-lg shadow"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      لا يوجد
                    </div>
                  )}
                </div>
                {/* الإجراءات */}
                <div className="sm:col-span-2 flex justify-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  {editId === service.id ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-green-500 text-white rounded-lg w-full sm:w-auto"
                        onClick={() => handleSaveEdit(service.id)}
                      >
                        <FiSave />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gray-400 text-white rounded-lg w-full sm:w-auto"
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
                        className="p-2 bg-blue-500 text-white rounded-lg w-full sm:w-auto"
                        onClick={() => handleEdit(service)}
                      >
                        <FiEdit2 />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-red-500 text-white rounded-lg w-full sm:w-auto"
                        onClick={() => handleDelete(service.id)}
                      >
                        <FiTrash2 />
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ServicesAdmin;