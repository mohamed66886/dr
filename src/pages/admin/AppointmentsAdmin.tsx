import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiCheckCircle, FiXCircle, FiClock, FiEdit2, FiPhone, FiCalendar, FiUser } from 'react-icons/fi';
import { useAdminMessage } from '@/components/AdminMessage';
import AdminLayout from '@/components/AdminLayout';
import { isAdminAuthenticated } from "@/lib/auth";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status?: 'pending' | 'done' | 'canceled';
}

const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-800', icon: <FiClock className="text-amber-500" /> },
  done: { color: 'bg-teal-100 text-teal-800', icon: <FiCheckCircle className="text-teal-500" /> },
  canceled: { color: 'bg-rose-100 text-rose-800', icon: <FiXCircle className="text-rose-500" /> }
};

const AppointmentsAdmin = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showMessage, MessageComponent } = useAdminMessage();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string>('');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'appointments'));
        const fetchedAppointments = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          name: docSnap.data().name || '',
          phone: docSnap.data().phone || '',
          service: docSnap.data().service || '',
          date: docSnap.data().date || '',
          time: docSnap.data().time || '',
          notes: docSnap.data().notes || '',
          status: docSnap.data().status || 'pending'
        }));
        setAppointments(fetchedAppointments);
      } catch (error) {
        showMessage('حدث خطأ في جلب المواعيد', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
      setAppointments(appointments.filter(a => a.id !== id));
      showMessage('تم حذف الموعد بنجاح', 'success');
    } catch (error) {
      showMessage('حدث خطأ أثناء الحذف', 'error');
    }
  };

  const updateStatus = async (id: string, status: 'pending' | 'done' | 'canceled') => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      showMessage(
        `تم ${status === 'done' ? 'إكمال' : status === 'canceled' ? 'إلغاء' : 'تعليق'} الموعد بنجاح`,
        status === 'done' ? 'success' : status === 'canceled' ? 'error' : 'info'
      );
    } catch (error) {
      showMessage('حدث خطأ أثناء تحديث الحالة', 'error');
    }
  };

  // Get unique services for filter dropdown
  const uniqueServices = Array.from(new Set(appointments.map(a => a.service).filter(Boolean)));

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {MessageComponent}
        
        {/* Service Filter Dropdown */}
        {uniqueServices.length > 0 && (
          <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
            <label className="font-medium text-gray-700">تصفية حسب الخدمة:</label>
            <select
              className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-dental-blue"
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
            >
              <option value="">كل الخدمات</option>
              {uniqueServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-dental-blue">إدارة المواعيد</h2>
          <p className="text-gray-600 mt-2">عرض وتعديل جميع مواعيد المرضى</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-dental-blue/20 rounded-full mb-4"></div>
              <p className="text-dental-blue font-medium">جاري تحميل المواعيد...</p>
            </div>
          </div>
        ) : (serviceFilter ? appointments.filter(a => a.service === serviceFilter) : appointments).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center"
          >
            <div className="text-gray-400 mb-4">
              <FiCalendar size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-700">لا توجد مواعيد مسجلة</h3>
            <p className="text-gray-500 mt-2">سيظهر هنا أي مواعيد جديدة يتم حجزها</p>
          </motion.div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 bg-gradient-to-r from-dental-blue to-blue-400 p-4 text-white font-medium">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-2">المريض</div>
              <div className="col-span-2">معلومات التواصل</div>
              <div className="col-span-2">الخدمة</div>
              <div className="col-span-2">الموعد</div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-2 text-center">الإجراءات</div>
            </div>
            
            <AnimatePresence>
              {(serviceFilter ? appointments.filter(a => a.service === serviceFilter) : appointments).map((appointment, idx) => (
                <motion.div
                  key={appointment.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                    appointment.status === 'canceled' ? 'bg-rose-50/30' : ''
                  }`}
                >
                  {/* Mobile View */}
                  <div className="md:hidden flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusConfig[appointment.status || 'pending'].color}`}>
                        {appointment.status === 'pending' ? 'معلق' : appointment.status === 'done' ? 'مكتمل' : 'ملغي'}
                      </span>
                      <span className="font-medium">{appointment.name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.date} - {appointment.time}
                    </div>
                  </div>
                  
                  {/* Number */}
                  <div className="hidden md:flex items-center justify-center text-gray-500">
                    {idx + 1}
                  </div>
                  
                  {/* Patient Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <FiUser size={18} />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.name}</p>
                        <p className="text-sm text-gray-500">{appointment.service}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FiPhone className="text-gray-400" />
                      <a href={`tel:${appointment.phone}`} className="text-blue-600 hover:underline">
                        {appointment.phone}
                      </a>
                    </div>
                    {appointment.notes && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{appointment.notes}</p>
                    )}
                  </div>
                  
                  {/* Service (Desktop) */}
                  <div className="hidden md:flex items-center col-span-2">
                    <p className="text-gray-700">{appointment.service}</p>
                  </div>
                  
                  {/* Date & Time */}
                  <div className="hidden md:flex flex-col col-span-2">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-gray-400" size={16} />
                      <span className="text-gray-700">{appointment.date}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      الساعة: {appointment.time}
                    </div>
                  </div>
                  
                  {/* Status (Desktop) */}
                  <div className="hidden md:flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                      statusConfig[appointment.status || 'pending'].color
                    }`}>
                      {statusConfig[appointment.status || 'pending'].icon}
                      {appointment.status === 'pending' ? 'معلق' : appointment.status === 'done' ? 'مكتمل' : 'ملغي'}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="md:col-span-2 flex justify-end md:justify-center gap-2">
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg ${
                          appointment.status === 'done' ? 'bg-teal-100 text-teal-600' : 'bg-teal-600 text-white'
                        }`}
                        onClick={() => updateStatus(appointment.id, 'done')}
                        disabled={appointment.status === 'done'}
                      >
                        <FiCheckCircle size={18} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg ${
                          appointment.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-amber-600 text-white'
                        }`}
                        onClick={() => updateStatus(appointment.id, 'pending')}
                        disabled={appointment.status === 'pending'}
                      >
                        <FiClock size={18} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg ${
                          appointment.status === 'canceled' ? 'bg-rose-100 text-rose-600' : 'bg-rose-600 text-white'
                        }`}
                        onClick={() => updateStatus(appointment.id, 'canceled')}
                        disabled={appointment.status === 'canceled'}
                      >
                        <FiXCircle size={18} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <FiTrash2 size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AppointmentsAdmin;