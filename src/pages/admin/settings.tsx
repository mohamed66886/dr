import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FiSave, FiClock, FiMapPin, FiMail, FiPhone, FiFacebook, FiInstagram, FiPlus, FiTrash2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import AdminLayout from '@/components/AdminLayout';
import { Loader2 } from 'lucide-react';
import { isAdminAuthenticated } from "@/lib/auth";

const defaultSettings = {
  clinicName: 'عيادة د. محمد رشاد لطب الأسنان',
  price: '', // سعر الكشف
  phone: '01551290902',
  email: 'Mohamed@gmail.com',
  address: 'دكرنس، الدقهلية، مصر',
  workingHours: [
    { day: 'السبت - الأربعاء', time: '9:00 ص - 9:00 م' },
    { day: 'الخميس', time: '9:00 ص - 6:00 م' },
    { day: 'الجمعة', time: 'مغلق' }
  ],
  facebook: 'facebook.com/dentalclinic',
  instagram: 'instagram.com/dentalclinic',
  whatsapp: '01551290902',
  about: 'عيادة متخصصة في طب الأسنان توفر أحدث التقنيات وعلاجات الأسنان بجودة عالية وبرعاية فريق طبي متخصص.',
  expenseTypes: [
    { value: 'rent', label: 'إيجار', isDirect: true },
    { value: 'salary', label: 'رواتب', isDirect: true },
    { value: 'supplies', label: 'مستلزمات', isDirect: true },
    { value: 'maintenance', label: 'صيانة', isDirect: true },
    { value: 'other', label: 'أخرى', isDirect: false },
  ],
};

const SettingsAdmin = () => {
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

  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // جلب الإعدادات من Firestore عند التحميل
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'config', 'clinicSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            clinicName: data.clinicName || '',
            price: data.price || '',
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            workingHours: Array.isArray(data.workingHours) ? data.workingHours : [],
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            whatsapp: data.whatsapp || '',
            about: data.about || '',
            expenseTypes: Array.isArray(data.expenseTypes) ? data.expenseTypes : [],
          });
        }
      } catch (e) {
        console.error('Error fetching settings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkingHourChange = (idx, key, value) => {
    setSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((h, i) => i === idx ? { ...h, [key]: value } : h)
    }));
  };

  const addWorkingHour = () => {
    setSettings(prev => ({
      ...prev,
      workingHours: [...prev.workingHours, { day: '', time: '' }]
    }));
  };

  const removeWorkingHour = (idx) => {
    if (settings.workingHours.length > 1) {
      setSettings(prev => ({
        ...prev,
        workingHours: prev.workingHours.filter((_, i) => i !== idx)
      }));
    }
  };

  const handleExpenseTypeChange = (idx, key, value) => {
    setSettings(prev => ({
      ...prev,
      expenseTypes: prev.expenseTypes.map((t, i) => i === idx ? { ...t, [key]: value } : t)
    }));
  };

  const handleExpenseTypeCheckbox = (idx, checked) => {
    setSettings(prev => ({
      ...prev,
      expenseTypes: prev.expenseTypes.map((t, i) => i === idx ? { ...t, isDirect: checked } : t)
    }));
  };

  const addExpenseType = () => {
    setSettings(prev => ({
      ...prev,
      expenseTypes: [...prev.expenseTypes, { value: '', label: '', isDirect: true }]
    }));
  };

  const removeExpenseType = (idx) => {
    if (settings.expenseTypes.length > 1) {
      setSettings(prev => ({
        ...prev,
        expenseTypes: prev.expenseTypes.filter((_, i) => i !== idx)
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'clinicSettings'), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-dental-blue" />
            <p className="text-gray-600">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-0 rounded-xl overflow-hidden w-full">
            <CardHeader className="bg-gradient-to-r from-dental-blue to-dental-teal">
              <CardTitle className="text-2xl text-center text-white">
                إعدادات العيادة
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 md:p-8 w-full">
              <form className="space-y-6 w-full" onSubmit={handleSave}>
                {/* رسالة النجاح */}
                <AnimatePresence>
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                    >
                      <span className="block sm:inline">تم حفظ الإعدادات بنجاح!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* القسم الأول: المعلومات الأساسية */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* معلومات العيادة */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                      <FiMapPin className="text-dental-blue" />
                      معلومات العيادة
                    </h3>
                    
                    <div>
                      <Label htmlFor="clinicName">اسم العيادة</Label>
                      <Input 
                        id="clinicName" 
                        value={settings.clinicName} 
                        onChange={e => handleChange('clinicName', e.target.value)} 
                        required 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price">سعر الكشف (جنيه)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={settings.price}
                        onChange={e => handleChange('price', e.target.value)}
                        placeholder="مثال: 200"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">العنوان</Label>
                      <Input 
                        id="address" 
                        value={settings.address} 
                        onChange={e => handleChange('address', e.target.value)} 
                        required 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* معلومات التواصل */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                      <FiPhone className="text-dental-blue" />
                      معلومات التواصل
                    </h3>
                    
                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input 
                        id="phone" 
                        value={settings.phone} 
                        onChange={e => handleChange('phone', e.target.value)} 
                        required 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={settings.email} 
                        onChange={e => handleChange('email', e.target.value)} 
                        required 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="whatsapp">واتساب</Label>
                      <Input 
                        id="whatsapp" 
                        value={settings.whatsapp} 
                        onChange={e => handleChange('whatsapp', e.target.value)} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                </motion.div>
                
                {/* القسم الثاني: وسائل التواصل الاجتماعي */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <FiFacebook className="text-dental-blue" />
                    وسائل التواصل الاجتماعي
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <Label htmlFor="facebook">فيسبوك</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500">facebook.com/</span>
                        <Input 
                          id="facebook" 
                          value={settings.facebook} 
                          onChange={e => handleChange('facebook', e.target.value)} 
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="instagram">إنستجرام</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500">instagram.com/</span>
                        <Input 
                          id="instagram" 
                          value={settings.instagram} 
                          onChange={e => handleChange('instagram', e.target.value)} 
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* القسم الثالث: ساعات العمل */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <FiClock className="text-dental-blue" />
                    ساعات العمل
                  </h3>
                  
                  <div className="space-y-3 mt-4">
                    {settings.workingHours.map((h, idx) => (
                      <motion.div 
                        key={idx} 
                        className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        <div>
                          <Label>اليوم</Label>
                          <Input 
                            value={h.day} 
                            onChange={e => handleWorkingHourChange(idx, 'day', e.target.value)} 
                            placeholder="مثال: السبت - الأربعاء"
                          />
                        </div>
                        <div>
                          <Label>الوقت</Label>
                          <Input 
                            value={h.time} 
                            onChange={e => handleWorkingHourChange(idx, 'time', e.target.value)} 
                            placeholder="مثال: 9:00 ص - 9:00 م"
                          />
                        </div>
                        <div className="flex items-end h-full">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeWorkingHour(idx)}
                            className="text-red-500 hover:bg-red-50 h-10 w-full"
                            disabled={settings.workingHours.length <= 1}
                          >
                            <FiTrash2 className="mr-2" />
                            حذف
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addWorkingHour}
                      className="mt-2 text-dental-blue hover:bg-blue-50 w-full md:w-auto"
                    >
                      <FiPlus className="mr-2" />
                      إضافة وقت عمل
                    </Button>
                  </div>
                </motion.div>
                
                {/* القسم الرابع: عن العيادة */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    عن العيادة
                  </h3>
                  <Textarea 
                    value={settings.about}
                    onChange={e => handleChange('about', e.target.value)}
                    placeholder="اكتب نبذة عن العيادة..."
                    className="mt-4"
                    rows={5}
                  />
                </motion.div>
                
                {/* القسم الخامس: أنواع الصرف */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <FiPlus className="text-dental-blue" />
                    أنواع الصرف
                  </h3>
                  <div className="space-y-3 mt-4">
                    {settings.expenseTypes.map((t, idx) => (
                      <motion.div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        <div>
                          <Label>القيمة (بالإنجليزية)</Label>
                          <Input
                            value={t.value}
                            onChange={e => handleExpenseTypeChange(idx, 'value', e.target.value)}
                            placeholder="مثال: rent"
                          />
                        </div>
                        <div>
                          <Label>الاسم الظاهر</Label>
                          <Input
                            value={t.label}
                            onChange={e => handleExpenseTypeChange(idx, 'label', e.target.value)}
                            placeholder="مثال: إيجار"
                          />
                        </div>
                        <div className="flex items-center h-full pt-6">
                          <input
                            type="checkbox"
                            id={`isDirect-${idx}`}
                            checked={t.isDirect || false}
                            onChange={e => handleExpenseTypeCheckbox(idx, e.target.checked)}
                            className="mr-2"
                          />
                          <Label htmlFor={`isDirect-${idx}`}>{t.isDirect ? 'مباشر' : 'غير مباشر'}</Label>
                        </div>
                        <div className="flex items-end h-full">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeExpenseType(idx)}
                            className="text-red-500 hover:bg-red-50 h-10 w-full"
                            disabled={settings.expenseTypes.length <= 1}
                          >
                            <FiTrash2 className="mr-2" />
                            حذف
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addExpenseType}
                      className="mt-2 text-dental-blue hover:bg-blue-50 w-full sm:w-auto"
                    >
                      <FiPlus className="mr-2" />
                      إضافة نوع صرف
                    </Button>
                  </div>
                </motion.div>
                
                {/* زر الحفظ */}
                <motion.div
                  className="flex justify-end pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    type="submit" 
                    className="min-w-[150px]"
                    disabled={saving}
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        حفظ الإعدادات
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default SettingsAdmin;