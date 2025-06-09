import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiCheckCircle, FiXCircle, FiClock, FiEdit2, FiPhone, FiCalendar, FiUser, FiFilter, FiSearch } from 'react-icons/fi';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface Appointment {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'done' | 'canceled';
  createdAt?: string;
}

const statusConfig = {
  pending: { 
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', 
    icon: <FiClock className="text-amber-500 dark:text-amber-300" />,
    label: 'معلق'
  },
  confirmed: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: <FiCheckCircle className="text-blue-500 dark:text-blue-300" />,
    label: 'مؤكد'
  },
  done: { 
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', 
    icon: <FiCheckCircle className="text-teal-500 dark:text-teal-300" />,
    label: 'مكتمل'
  },
  canceled: { 
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200', 
    icon: <FiXCircle className="text-rose-500 dark:text-rose-300" />,
    label: 'ملغي'
  }
};

const statusOptions = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'pending', label: 'معلق' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'done', label: 'مكتمل' },
  { value: 'canceled', label: 'ملغي' }
];

const AppointmentsAdmin = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showMessage, MessageComponent } = useAdminMessage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      window.location.href = "/login";
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'appointments'), orderBy('date', dateSort));
      const querySnapshot = await getDocs(q);
      
      const fetchedAppointments = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        name: docSnap.data().name || '',
        phone: docSnap.data().phone || '',
        service: docSnap.data().service || '',
        date: docSnap.data().date || '',
        time: docSnap.data().time || '',
        notes: docSnap.data().notes || '',
        status: docSnap.data().status || 'pending',
        createdAt: docSnap.data().createdAt || ''
      }));
      
      setAppointments(fetchedAppointments);
      applyFilters(fetchedAppointments, searchTerm, serviceFilter, statusFilter);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showMessage('حدث خطأ في جلب المواعيد', 'error');
    } finally {
      setLoading(false);
    }
  }, [dateSort]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const applyFilters = (
    data: Appointment[],
    search: string,
    service: string,
    status: string
  ) => {
    let result = [...data];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(app => 
        app.name.toLowerCase().includes(searchLower) || 
        app.phone.includes(search) ||
        app.service.toLowerCase().includes(searchLower) ||
        app.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply service filter
    if (service && service !== 'all') {
      result = result.filter(app => app.service === service);
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      result = result.filter(app => app.status === status);
    }
    
    setFilteredAppointments(result);
  };

  useEffect(() => {
    applyFilters(appointments, searchTerm, serviceFilter, statusFilter);
  }, [appointments, searchTerm, serviceFilter, statusFilter]);

  const handleDelete = (id: string) => {
    setDeleteAppointmentId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteAppointmentId) return;
    try {
      await deleteDoc(doc(db, 'appointments', deleteAppointmentId));
      setAppointments(appointments.filter(a => a.id !== deleteAppointmentId));
      showMessage('تم حذف الموعد بنجاح', 'success');
    } catch (error) {
      showMessage('حدث خطأ أثناء الحذف', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteAppointmentId(null);
    }
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      
      let message = '';
      switch (status) {
        case 'confirmed':
          message = 'تم تأكيد الموعد بنجاح';
          break;
        case 'done':
          message = 'تم إكمال الموعد بنجاح';
          break;
        case 'canceled':
          message = 'تم إلغاء الموعد بنجاح';
          break;
        default:
          message = 'تم تعليق الموعد بنجاح';
      }
      
      showMessage(message, 'success');
    } catch (error) {
      showMessage('حدث خطأ أثناء تحديث الحالة', 'error');
    }
  };

  // Get unique services for filter dropdown
  const uniqueServices = Array.from(new Set(appointments.map(a => a.service).filter(Boolean)));

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'yyyy-MM-dd', { locale: arSA });
    } catch {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {MessageComponent}
        
        {/* Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-dental-blue">إدارة المواعيد</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">عرض وتعديل جميع مواعيد المرضى</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDateSort(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {dateSort === 'asc' ? 'الأقدم أولاً' : 'الأحدث أولاً'}
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
              <div className="text-gray-500 dark:text-gray-400 text-sm">إجمالي المواعيد</div>
              <div className="text-2xl font-bold mt-1">{appointments.length}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
              <div className="text-gray-500 dark:text-gray-400 text-sm">معلقة</div>
              <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {appointments.filter(a => a.status === 'pending').length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
              <div className="text-gray-500 dark:text-gray-400 text-sm">مؤكدة</div>
              <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                {appointments.filter(a => a.status === 'confirmed').length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700">
              <div className="text-gray-500 dark:text-gray-400 text-sm">مكتملة</div>
              <div className="text-2xl font-bold mt-1 text-teal-600 dark:text-teal-400">
                {appointments.filter(a => a.status === 'done').length}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث عن موعد..."
                className="pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <FiFilter size={16} />
                    <SelectValue placeholder="الخدمة" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الخدمات</SelectItem>
                  {uniqueServices.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <FiFilter size={16} />
                    <SelectValue placeholder="الحالة" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700"
          >
            <div className="text-gray-400 mb-4">
              <FiCalendar size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">لا توجد مواعيد مسجلة</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {searchTerm || serviceFilter !== 'all' || statusFilter !== 'all' 
                ? 'لم يتم العثور على مواعيد تطابق معايير البحث'
                : 'سيظهر هنا أي مواعيد جديدة يتم حجزها'}
            </p>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 bg-gradient-to-r from-dental-blue to-blue-500 p-4 text-white font-medium dark:from-dental-blue/90 dark:to-blue-600">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-2">المريض</div>
              <div className="col-span-2">معلومات التواصل</div>
              <div className="col-span-2">الخدمة</div>
              <div className="col-span-2">الموعد</div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-2 text-center">الإجراءات</div>
            </div>
            
            <AnimatePresence>
              {filteredAppointments.map((appointment, idx) => (
                <motion.div
                  key={appointment.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors ${
                    appointment.status === 'canceled' ? 'bg-rose-50/30 dark:bg-rose-900/20' : ''
                  }`}
                >
                  {/* Mobile View Header */}
                  <div className="md:hidden flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge variant={appointment.status as any}>
                        {statusConfig[appointment.status].label}
                      </Badge>
                      <span className="font-medium">{appointment.name}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(appointment.date)} - {appointment.time}
                    </div>
                  </div>
                  
                  {/* Number */}
                  <div className="hidden md:flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {idx + 1}
                  </div>
                  
                  {/* Patient Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full text-blue-600 dark:text-blue-300">
                        <FiUser size={18} />
                      </div>
                      <div>
                        <p className="font-medium dark:text-gray-200">{appointment.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.service}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FiPhone className="text-gray-400 dark:text-gray-500" />
                      <a 
                        href={`tel:${appointment.phone}`} 
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {appointment.phone}
                      </a>
                    </div>
                    {appointment.notes && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 cursor-default">
                              {appointment.notes}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{appointment.notes}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  {/* Service (Desktop) */}
                  <div className="hidden md:flex items-center col-span-2">
                    <p className="text-gray-700 dark:text-gray-300">{appointment.service}</p>
                  </div>
                  
                  {/* Date & Time */}
                  <div className="hidden md:flex flex-col col-span-2">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-gray-400 dark:text-gray-500" size={16} />
                      <span className="text-gray-700 dark:text-gray-300">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      الساعة: {appointment.time}
                    </div>
                  </div>
                  
                  {/* Status (Desktop) */}
                  <div className="hidden md:flex items-center justify-center">
                    <Badge 
                      variant={appointment.status as any}
                      className="flex items-center gap-1"
                    >
                      {statusConfig[appointment.status].icon}
                      {statusConfig[appointment.status].label}
                    </Badge>
                  </div>
                  
                  {/* Actions */}
                  <div className="md:col-span-2 flex justify-end md:justify-center">
                    <div className="flex gap-2">
                      <TooltipProvider>
                        {/* Confirm Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={appointment.status === 'confirmed' ? 'default' : 'outline'}
                              size="icon"
                              className={`h-9 w-9 rounded-full ${
                                appointment.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' : ''
                              }`}
                              onClick={() => updateStatus(appointment.id, 'confirmed')}
                              disabled={appointment.status === 'confirmed'}
                            >
                              <FiCheckCircle size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>تأكيد الموعد</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Complete Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={appointment.status === 'done' ? 'default' : 'outline'}
                              size="icon"
                              className={`h-9 w-9 rounded-full ${
                                appointment.status === 'done' ? 'bg-teal-600 hover:bg-teal-700' : ''
                              }`}
                              onClick={() => updateStatus(appointment.id, 'done')}
                              disabled={appointment.status === 'done'}
                            >
                              <FiCheckCircle size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>إكمال الموعد</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Cancel Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={appointment.status === 'canceled' ? 'default' : 'outline'}
                              size="icon"
                              className={`h-9 w-9 rounded-full ${
                                appointment.status === 'canceled' ? 'bg-rose-600 hover:bg-rose-700' : ''
                              }`}
                              onClick={() => updateStatus(appointment.id, 'canceled')}
                              disabled={appointment.status === 'canceled'}
                            >
                              <FiXCircle size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>إلغاء الموعد</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Delete Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                              onClick={() => handleDelete(appointment.id)}
                            >
                              <FiTrash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>حذف الموعد</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف هذا الموعد؟ لا يمكن التراجع عن هذه العملية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AppointmentsAdmin;