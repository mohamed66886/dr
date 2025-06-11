import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiSave, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as FaIcons from 'react-icons/fa';
import * as GiIcons from 'react-icons/gi';
import * as MdIcons from 'react-icons/md';

const HomePageAdmin = () => {
  const [data, setData] = useState({
    title: '',
    subtitle: '',
    heroImage: '',
    doctorBio: '',
    doctorImage: '',
    experienceYears: '',
    happyPatients: '',
    services: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'pages', 'home');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          setData({
            title: d.title || '',
            subtitle: d.subtitle || '',
            heroImage: d.heroImage || '',
            doctorBio: d.doctorBio || '',
            doctorImage: d.doctorImage || '',
            experienceYears: d.experienceYears || '',
            happyPatients: d.happyPatients || '',
            services: d.services || [],
          });
        } else {
          // Initialize with empty data if document doesn't exist
          await setDoc(docRef, {
            title: '',
            subtitle: '',
            heroImage: '',
            doctorBio: '',
            doctorImage: '',
            experienceYears: '',
            happyPatients: '',
            services: [],
          });
        }
      } catch (err) {
        setError('حدث خطأ أثناء جلب البيانات');
        setTimeout(() => setError(''), 5000);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (idx, field, value) => {
    const updated = [...data.services];
    updated[idx][field] = value;
    setData({ ...data, services: updated });
  };

  const handleAddService = () => {
    setData({
      ...data,
      services: [...data.services, { icon: '', title: '', description: '' }]
    });
  };

  const handleRemoveService = (idx) => {
    const updated = [...data.services];
    updated.splice(idx, 1);
    setData({ ...data, services: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await setDoc(doc(db, 'pages', 'home'), data);
      setSuccess('تم حفظ التعديلات بنجاح');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('حدث خطأ أثناء الحفظ');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full min-h-screen p-6 bg-white rounded-none shadow-none"
      >
        <h1 className="text-2xl font-bold mb-6 text-primary">تعديل الصفحة الرئيسية</h1>
        
        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
            >
              <FiAlertCircle className="ml-2" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg"
            >
              <FiCheckCircle className="ml-2" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* Hero Section */}
          <motion.div 
            className="p-4 border rounded-lg bg-gray-50"
            whileHover={{ scale: 1.005 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-700">قسم الهيرو</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">العنوان الرئيسي</label>
                <Input name="title" value={data.title} onChange={handleChange} />
              </div>
              <div>
                <label className="block mb-1 font-medium">العنوان الفرعي</label>
                <Input name="subtitle" value={data.subtitle} onChange={handleChange} />
              </div>
              <div>
                <label className="block mb-1 font-medium">رابط صورة الهيرو</label>
                <div className="flex items-center space-x-2">
                  <Input name="heroImage" value={data.heroImage} onChange={handleChange} />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <FiInfo className="text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>يجب أن يكون الرابط صورة بتنسيق JPG, PNG أو SVG</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Doctor Section */}
          <motion.div 
            className="p-4 border rounded-lg bg-gray-50"
            whileHover={{ scale: 1.005 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-700">معلومات الطبيب</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">نبذة عن الطبيب</label>
                <Textarea 
                  name="doctorBio" 
                  value={data.doctorBio} 
                  onChange={handleChange} 
                  rows={4}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">رابط صورة الطبيب</label>
                <Input name="doctorImage" value={data.doctorImage} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">سنوات الخبرة</label>
                  <Input 
                    name="experienceYears" 
                    value={data.experienceYears} 
                    onChange={handleChange} 
                    placeholder="مثال: 15+" 
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">عدد المرضى السعداء</label>
                  <Input 
                    name="happyPatients" 
                    value={data.happyPatients} 
                    onChange={handleChange} 
                    placeholder="مثال: 5000+" 
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Services Section */}
          <motion.div 
            className="p-4 border rounded-lg bg-gray-50"
            whileHover={{ scale: 1.005 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">الخدمات</h2>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddService}
                className="flex items-center gap-2"
              >
                <FiPlus /> إضافة خدمة
              </Button>
            </div>
            <div className="mb-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
              <FiInfo className="text-blue-400" />
              لإضافة أيقونة للخدمة، استخدم اسم الأيقونة من مكتبة <a href="https://react-icons.github.io/react-icons/" target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-900">react-icons</a> (مثال: <b>FaTeeth</b> أو <b>GiTooth</b>)
            </div>

            <AnimatePresence>
              {data.services.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg"
                >
                  لا توجد خدمات مضافة
                </motion.div>
              )}

              {data.services.map((service, idx) => {
                let IconComponent = null;
                if (service.icon?.startsWith('Fa')) IconComponent = FaIcons[service.icon];
                else if (service.icon?.startsWith('Gi')) IconComponent = GiIcons[service.icon];
                else if (service.icon?.startsWith('Md')) IconComponent = MdIcons[service.icon];

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 p-4 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-700">الخدمة #{idx + 1}</h3>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveService(idx)}
                        className="flex items-center gap-1"
                      >
                        <FiTrash2 size={14} /> حذف
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-1">الأيقونة</label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            value={service.icon} 
                            onChange={e => handleServiceChange(idx, 'icon', e.target.value)} 
                            placeholder="مثال: FaTeeth" 
                          />
                          {IconComponent && (
                            <span className="text-2xl text-blue-500"><IconComponent /></span>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <FiInfo className="text-gray-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>استخدم أسماء أيقونات من مكتبة react-icons</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1">العنوان</label>
                        <Input 
                          value={service.title} 
                          onChange={e => handleServiceChange(idx, 'title', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block mb-1">الوصف</label>
                        <Textarea 
                          value={service.description} 
                          onChange={e => handleServiceChange(idx, 'description', e.target.value)} 
                          rows={3}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Save Button */}
          <motion.div
            className="flex justify-end pt-4"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="flex items-center gap-2 min-w-32"
              size="lg"
            >
              {saving ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FiSave />
                  حفظ التعديلات
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default HomePageAdmin;