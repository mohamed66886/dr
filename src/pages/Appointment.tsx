import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock,
  FaUser,
  FaTooth,
  FaGift,
  FaCheckCircle
} from 'react-icons/fa';
import { MdOutlineWork } from 'react-icons/md';
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode';
import { addDoc, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Appointment = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lastData, setLastData] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [clinicInfo, setClinicInfo] = useState({
    name: 'عيادة د. محمد رشاد لطب الأسنان',
    price: '',
    phone: '01551290902',
    whatsapp: '01551290902',
    email: 'Mohamed@gmail.com',
    address: 'دكرنس، الدقهلية، مصر',
    workingHours: [
      { day: 'السبت - الأربعاء', time: '9:00 ص - 9:00 م' },
      { day: 'الخميس', time: '9:00 ص - 6:00 م' },
      { day: 'الجمعة', time: 'مغلق' }
    ],
    socialMedia: [
      { name: 'فيسبوك', url: 'facebook.com/dentalclinic' },
      { name: 'إنستجرام', url: 'instagram.com/dentalclinic' }
    ]
  });
  const [showPrice, setShowPrice] = useState(false);
  const [services, setServices] = useState<{ id: string; title: string; price: number }[]>([]);
  const [selectedServicePrice, setSelectedServicePrice] = useState<number | null>(null);
  const [workTimeWarning, setWorkTimeWarning] = useState<string | null>(null);
  const [selectedDayName, setSelectedDayName] = useState<string | null>(null);
  const [arabicDay, setArabicDay] = useState<string | null>(null);
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [nextDateForDay, setNextDateForDay] = useState<string | null>(null);

  // استخراج الأيام المتاحة فقط (بدون أيام مغلقة) بشكل ديناميكي
  const availableDays = useMemo(() => {
    if (!clinicInfo.workingHours || !Array.isArray(clinicInfo.workingHours)) return [];
    // إصلاح: تجاهل أي عنصر ليس له day أو time
    return clinicInfo.workingHours
      .filter((wh) => wh && typeof wh.day === 'string' && wh.time && !wh.time.includes('مغلق'))
      .flatMap((wh) => wh.day.split(',').map((s) => s.replace(/يوم /g, '').trim()))
      .filter((v, i, arr) => v && arr.indexOf(v) === i); // إزالة التكرار وتجاهل الفراغات
  }, [clinicInfo.workingHours]);

  // دالة لحساب أقرب تاريخ قادم ليوم معين
  const getNextDateForDay = (arabicDay: string) => {
    const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const today = new Date();
    const todayIdx = today.getDay();
    const targetIdx = weekDays.indexOf(arabicDay);
    if (targetIdx === -1) return null;
    let diff = targetIdx - todayIdx;
    if (diff < 0) diff += 7;
    // إذا اليوم هو نفسه اليوم الحالي، نسمح بالحجز اليوم دائماً
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    return nextDate.toISOString().split('T')[0];
  };

  // عند اختيار اليوم من الدروب داون
  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    const nextDate = getNextDateForDay(day);
    setNextDateForDay(nextDate);
    setFormData((prev) => ({ ...prev, date: nextDate || '' }));
    setArabicDay(day);
    setDateWarning(null);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'config', 'clinicSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClinicInfo({
            name: data.clinicName || '',
            price: data.price || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            email: data.email || '',
            address: data.address || '',
            workingHours: Array.isArray(data.workingHours) ? data.workingHours : [],
            socialMedia: [
              { name: 'فيسبوك', url: data.facebook || '' },
              { name: 'إنستجرام', url: data.instagram || '' }
            ]
          });
        }
      } catch (e) {
        // يمكن إضافة لوج أو رسالة خطأ هنا إذا رغبت
      }
    };
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const servicesList = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || '',
            price: typeof data.price === 'number' ? data.price : Number(data.price) || 0
          };
        });
        setServices(servicesList);
      } catch (e) {
        // يمكن إضافة لوج أو رسالة خطأ هنا إذا رغبت
      }
    };
    fetchSettings();
    fetchServices();
  }, []);

  // دالة لتوليد الأوقات المتاحة من فترة العمل (مثلاً: 9:00 ص - 5:00 م)
  const generateTimeSlotsFromWorkingHours = (selectedDay: string | null) => {
    if (!selectedDay || !clinicInfo.workingHours) return [];
    // ابحث عن فترة العمل لليوم المختار
    let workTimeStr = '';
    for (const wh of clinicInfo.workingHours) {
      if (!wh.day || !wh.time) continue;
      const whDays = wh.day.split(',').map((d: string) => d.replace(/يوم /g, '').trim());
      if (whDays.includes(selectedDay)) {
        workTimeStr = wh.time;
        break;
      }
    }
    if (!workTimeStr || workTimeStr.includes('مغلق')) return [];
    const [from, to] = workTimeStr.split('-').map(s => s.trim());
    if (!from || !to) return [];
    // تحويل الوقت إلى دقائق
    const parseTime = (t: string) => {
      const [h, m] = t.split(':');
      let hour = parseInt(h);
      const minute = parseInt(m);
      if (t.includes('م') && hour < 12) hour += 12;
      if (t.includes('ص') && hour === 12) hour = 0;
      return hour * 60 + minute;
    };
    const start = parseTime(from);
    const end = parseTime(to);
    // توليد الأوقات كل نصف ساعة
    const slots: string[] = [];
    for (let t = start; t <= end; t += 30) {
      const hour = Math.floor(t / 60);
      const minute = t % 60;
      const period = hour >= 12 ? 'م' : 'ص';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      slots.push(`${displayHour}:${minute.toString().padStart(2, '0')} ${period}`);
    }
    return slots;
  };

  // استبدال timeSlots الثابتة
  const timeSlots = useMemo(() => generateTimeSlotsFromWorkingHours(selectedDay), [clinicInfo.workingHours, selectedDay]); // eslint-disable-line

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.service || !formData.date || !formData.time) {
      toast({
        title: "خطأ في البيانات",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    try {
      // جلب سعر الخدمة المختارة
      const selectedService = services.find(s => s.title === formData.service);
      const price = selectedService ? selectedService.price : clinicInfo.price;
      await addDoc(collection(db, 'appointments'), { ...formData, price });
      setLastData({ ...formData, price });
      setSubmitted(true);
      toast({
        title: "تم إرسال طلبك بنجاح",
        description: "سيتم التواصل معك خلال 24 ساعة لتأكيد الموعد",
      });
      setFormData({ name: '', phone: '', service: '', date: '', time: '', notes: '' });
    } catch (err) {
      toast({
        title: "حدث خطأ أثناء الحجز",
        description: "يرجى المحاولة مرة أخرى أو التواصل مع العيادة",
        variant: "destructive",
      });
    }
  };

const handleGeneratePDF = async () => {
    setPdfLoading(true);
    
    // جلب سعر الخدمة المختارة
    const selectedService = services.find(s => s.title === lastData?.service);
    const servicePrice = selectedService ? selectedService.price : clinicInfo.price;
    
    // Generate QR code مع إضافة لمسة احترافية
    const qrData = `عيادة ${clinicInfo.name}\nمعلومات الحجز:\nالاسم: ${lastData?.name}\nالجوال: ${lastData?.phone}\nالخدمة: ${lastData?.service}\nالتاريخ: ${lastData?.date}\nالوقت: ${lastData?.time}\nالسعر: ${servicePrice} جنيه\nرقم الحجز: #${Math.floor(1000 + Math.random() * 9000)}`;
    const qrImage = await QRCode.toDataURL(qrData, { 
        width: 150,
        margin: 2,
        color: {
            dark: '#1a365d', // أزرق داكن بدل الأسود
            light: '#ffffff00' // شفاف
        }
    });

    // SVG Icons بألوان متناسقة
    const icons = {
        logo: `<svg viewBox="0 0 24 24" width="24" height="24" fill="#1a365d" stroke="#1a365d"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6v6l4 2"/></svg>`,
        user: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#2d3748" stroke="#2d3748"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        phone: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#2d3748" stroke="#2d3748"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
        calendar: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#2d3748" stroke="#2d3748"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        clock: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#2d3748" stroke="#2d3748"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
        money: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#2d3748" stroke="#2d3748"><path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z"/></svg>`,
        clinic: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#2d3748" stroke="#2d3748"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
        whatsapp: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366" stroke="#25D366"><path d="M3 20l1.65-3.8a9 9 0 1 1 3.4 2.9L3 20z"/><path d="M9 11a1 1 0 1 0-2 0 1 1 0 0 0 2 0z"/><path d="M15 11a1 1 0 1 0-2 0 1 1 0 0 0 2 0z"/></svg>`,
        location: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#e53e3e" stroke="#e53e3e"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
        email: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#2d3748" stroke="#2d3748"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
    };

    // إنشاء محتوى PDF مع تصميم احترافي
    const pdfDiv = document.createElement('div');
    pdfDiv.dir = 'rtl';
    pdfDiv.style.fontFamily = 'Cairo, Arial, sans-serif';
    pdfDiv.style.width = '210mm';
    pdfDiv.style.minHeight = '297mm';
    pdfDiv.style.padding = '0';
    pdfDiv.style.margin = '0 auto';
    pdfDiv.style.background = '#ffffff';
    pdfDiv.style.color = '#2d3748';
    pdfDiv.style.fontSize = '14px';
    pdfDiv.style.lineHeight = '1.6';

    pdfDiv.innerHTML = `
        <!-- Header with Clinic Branding -->
        <div style="background: linear-gradient(135deg, #1a365d 0%, #2a4365 100%); color: white; padding: 1.5rem; text-align: center; border-bottom: 4px solid #e2e8f0;">
            <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                <div style="width: 60px; height: 60px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    ${icons.logo}
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 1.8rem; font-weight: 700;">${clinicInfo.name}</h1>
                    <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">تأكيد حجز الموعد الطبي</p>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 0.8rem; border-radius: 8px; margin-top: 1rem;">
                <div style="text-align: right; color: #2d3748;">
                    <p style="margin: 0; font-weight: 600;">رقم الحجز: #${Math.floor(1000 + Math.random() * 9000)}</p>
                    <p style="margin: 0; font-size: 0.9rem;">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}</p>
                </div>
                <img src="${qrImage}" width="100" height="100" alt="QR Code" style="border: 1px solid #e2e8f0; border-radius: 4px;"/>
            </div>
        </div>

        <!-- Patient Information Section -->
        <div style="padding: 1.5rem; background: white;">
            <div style="background: #f8fafc; border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="margin: 0 0 1rem 0; color: #1a365d; font-size: 1.2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                    <span style="display:inline-block;">${icons.user}</span> معلومات المريض
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="background: #edf2f7; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2d3748;">
                            ${icons.user}
                        </div>
                        <div>
                            <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">الاسم الكامل</p>
                            <p style="margin: 0; font-weight: 600; color: #1a365d;">${lastData?.name || 'غير محدد'}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="background: #edf2f7; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2d3748;">
                            ${icons.phone}
                        </div>
                        <div>
                            <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">رقم الجوال</p>
                            <p style="margin: 0; font-weight: 600; color: #1a365d;">${lastData?.phone || 'غير محدد'}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="background: #edf2f7; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2d3748;">
                            ${icons.calendar}
                        </div>
                        <div>
                            <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">تاريخ الموعد</p>
                            <p style="margin: 0; font-weight: 600; color: #1a365d;">${lastData?.date || 'غير محدد'}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="background: #edf2f7; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2d3748;">
                            ${icons.clock}
                        </div>
                        <div>
                            <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">وقت الموعد</p>
                            <p style="margin: 0; font-weight: 600; color: #1a365d;">${lastData?.time || 'غير محدد'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Appointment Details -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="margin: 0 0 1rem 0; color: #1a365d; font-size: 1.2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                    <span style="display:inline-block;">${icons.clinic}</span> تفاصيل الموعد
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="background: #edf2f7; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2d3748;">
                            ${icons.clinic}
                        </div>
                        <div>
                            <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">نوع الخدمة</p>
                            <p style="margin: 0; font-weight: 600; color: #1a365d;">${lastData?.service || 'غير محدد'}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="background: #edf2f7; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2d3748;">
                            ${icons.money}
                        </div>
                        <div>
                            <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">سعر الخدمة</p>
                            <p style="margin: 0; font-weight: 600; color: #1a365d;">${servicePrice ? servicePrice + ' جنيه مصري' : 'غير محدد'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Clinic Information -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="margin: 0 0 1rem 0; color: #1a365d; font-size: 1.2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                    <span style="display:inline-block;">${icons.clinic}</span> معلومات العيادة
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <h3 style="margin: 0 0 0.8rem 0; font-size: 1rem; color: #2d3748; display: flex; align-items: center; gap: 6px;">
                            ${icons.phone} معلومات التواصل
                        </h3>
                        <ul style="margin: 0; padding: 0; list-style: none;">
                            <li style="margin-bottom: 0.7rem; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="flex-shrink: 0;">${icons.phone}</span>
                                <div>
                                    <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">الهاتف</p>
                                    <p style="margin: 0; font-weight: 600; color: #1a365d;">${clinicInfo.phone}</p>
                                </div>
                            </li>
                            <li style="margin-bottom: 0.7rem; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="flex-shrink: 0;">${icons.whatsapp}</span>
                                <div>
                                    <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">واتساب</p>
                                    <p style="margin: 0; font-weight: 600; color: #1a365d;">${clinicInfo.whatsapp}</p>
                                </div>
                            </li>
                            <li style="margin-bottom: 0.7rem; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="flex-shrink: 0;">${icons.email}</span>
                                <div>
                                    <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">البريد الإلكتروني</p>
                                    <p style="margin: 0; font-weight: 600; color: #1a365d;">${clinicInfo.email}</p>
                                </div>
                            </li>
                            <li style="display: flex; align-items: flex-start; gap: 8px;">
                                <span style="flex-shrink: 0;">${icons.location}</span>
                                <div>
                                    <p style="margin: 0 0 2px 0; font-size: 0.85rem; color: #4a5568;">العنوان</p>
                                    <p style="margin: 0; font-weight: 600; color: #1a365d;">${clinicInfo.address}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 style="margin: 0 0 0.8rem 0; font-size: 1rem; color: #2d3748; display: flex; align-items: center; gap: 6px;">
                            ${icons.clock} ساعات العمل
                        </h3>
                        <div style="background: white; border-radius: 6px; padding: 0.8rem; border: 1px solid #e2e8f0;">
                            <ul style="margin: 0; padding: 0; list-style: none;">
                                ${clinicInfo.workingHours.map(hour => `
                                    <li style="margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center;">
                                        <span style="font-size: 0.9rem; color: #4a5568;">${hour.day}</span>
                                        <span style="font-weight: 600; color: #1a365d; background: #ebf8ff; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">${hour.time}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Important Notes -->
            <div style="background: #fff5f5; border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem; border: 1px solid #fed7d7; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="margin: 0 0 1rem 0; color: #c53030; font-size: 1.2rem; border-bottom: 2px solid #fed7d7; padding-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#c53030" stroke="#c53030"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    تعليمات هامة
                </h2>
                <ul style="margin: 0; padding: 0 0 0 1.2rem; color: #2d3748;">
                    <li style="margin-bottom: 0.7rem; font-size: 0.9rem;">يرجى الحضور قبل الموعد بـ 15 دقيقة لتعبئة البيانات المطلوبة</li>
                     
                    <li style="margin-bottom: 0.7rem; font-size: 0.9rem;">في حالة الرغبة في إلغاء الموعد، يرجى التواصل قبل 24 ساعة على الأقل</li>
                    <li style="margin-bottom: 0.7rem; font-size: 0.9rem;">عدم الحضور في الوقت المحدد قد يؤدي إلى إلغاء الموعد</li>
                    <li style="font-size: 0.9rem;">يمكن استخدام رمز الاستجابة السريعة (QR Code) للتحقق من الموعد عند الوصول</li>
                </ul>
            </div>

            <!-- Payment Summary -->
            <div style="background: #f0fff4; border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem; border: 1px solid #c6f6d5; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="margin: 0 0 1rem 0; color: #2f855a; font-size: 1.2rem; border-bottom: 2px solid #c6f6d5; padding-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#2f855a" stroke="#2f855a"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></svg>
                    ملخص الدفع
                </h2>
                <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 0.8rem; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <div>
                        <p style="margin: 0 0 4px 0; font-size: 0.9rem; color: #4a5568;">سعر الخدمة</p>
                        <p style="margin: 0; font-weight: 600; color: #2f855a; font-size: 1.1rem;">${servicePrice ? servicePrice + ' جنيه مصري' : 'غير محدد'}</p>
                    </div>
                    <div style="text-align: left;">
                        <p style="margin: 0 0 4px 0; font-size: 0.9rem; color: #4a5568;">طريقة الدفع</p>
                        <p style="margin: 0; font-weight: 600; color: #2d3748;">دفع عند الوصول</p>
                    </div>
                </div>
                <p style="margin: 0.8rem 0 0 0; font-size: 0.8rem; color: #718096; text-align: center;">
                    ملاحظة: السعر لا يشمل أي إجراءات إضافية قد تتطلبها حالتك خلال الزيارة
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #1a365d; color: white; padding: 1.2rem; text-align: center; border-top: 4px solid #e2e8f0;">
            <div style="display: flex; justify-content: center; gap: 1.5rem; margin-bottom: 1rem;">
                ${clinicInfo.socialMedia.map(social => `
                    <a href="https://${social.url}" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 6px; font-size: 0.85rem;">
                        ${social.name === 'فيسبوك' ? 
                            '<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>' : 
                            '<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5" fill="none" stroke="white"/></svg>'
                        }
                        ${social.name}
                    </a>
                `).join('')}
            </div>
            <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">شكراً لثقتكم في خدماتنا الطبية</p>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; opacity: 0.8;">© ${new Date().getFullYear()} ${clinicInfo.name}. جميع الحقوق محفوظة</p>
        </div>
    `;

    document.body.appendChild(pdfDiv);
    try {
        await html2pdf().set({
            margin: 0,
            filename: `حجز_موعد_${lastData?.name || 'مريض'}_${new Date().toISOString().slice(0,10)}.pdf`,
            html2canvas: { 
                scale: 3, // دقة أعلى
                logging: false,
                useCORS: true,
                allowTaint: true,
                windowWidth: 793,
                windowHeight: 1122
            },
            jsPDF: { 
                orientation: 'portrait', 
                unit: 'mm', 
                format: 'a4',
                hotfixes: ['px_scaling']
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        }).from(pdfDiv).save();
    } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          title: "حدث خطأ أثناء إنشاء ملف PDF",
          description: "يرجى المحاولة مرة أخرى أو التواصل مع العيادة",
          variant: "destructive",
        });
    } finally {
        document.body.removeChild(pdfDiv);
        setPdfLoading(false);
    }
};

  const isTimeWithinWorkingHours = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr || !clinicInfo.workingHours || !Array.isArray(clinicInfo.workingHours)) return true;
    try {
      const dateObj = new Date(dateStr);
      const dayOfWeekIdx = dateObj.getDay();
      const weekDaysArr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const arabicDayStr = weekDaysArr[dayOfWeekIdx];
      let found = false;
      let workTimeStr = '';
      for (const wh of clinicInfo.workingHours) {
        const whDays = wh.day.split(',').map(d => d.trim());
        if (whDays.includes(arabicDayStr)) {
          found = true;
          workTimeStr = wh.time;
          break;
        }
      }
      if (!found) return false;
      if (!workTimeStr || workTimeStr.includes('مغلق')) return false;
      const [from, to] = workTimeStr.split('-').map(s => s.trim());
      if (!from || !to) return true;
      const parseTime = (t: string) => {
        const [h, m] = t.split(':');
        let hour = parseInt(h);
        const minute = parseInt(m);
        if (t.includes('م') && hour < 12) hour += 12;
        if (t.includes('ص') && hour === 12) hour = 0;
        return hour * 60 + minute;
      };
      const selectedTime = parseTime(timeStr);
      const startTime = parseTime(from);
      const endTime = parseTime(to);
      return selectedTime >= startTime && selectedTime <= endTime;
    } catch {
      return true;
    }
  };

  // تحديث isDateAvailable ليعالج مشكلة الفراغات الزائدة ويطابق اليوم بدقة
  const isDateAvailable = (dateStr: string) => {
    if (!dateStr || !clinicInfo.workingHours || !Array.isArray(clinicInfo.workingHours)) return true;
    const dateObj = new Date(dateStr);
    const dayOfWeekIdx = dateObj.getDay();
    const weekDaysArr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const arabicDayStr = weekDaysArr[dayOfWeekIdx].replace(/يوم /g, '').trim();
    let found = false;
    let workTimeStr = '';
    for (const wh of clinicInfo.workingHours) {
      let whDays: string[] = [];
      if (Array.isArray(wh.day)) {
        whDays = wh.day.map((d: string) => d.replace(/يوم /g, '').trim());
      } else if (typeof wh.day === 'string') {
        whDays = wh.day.split(',').map((d: string) => d.replace(/يوم /g, '').trim());
      }
      if (whDays.some(d => d === arabicDayStr)) {
        found = true;
        workTimeStr = wh.time;
        break;
      }
    }
    if (!found) return false;
    if (!workTimeStr || workTimeStr.includes('مغلق')) return false;
    return true;
  };

  const getArabicDayName = (dateStr: string) => {
    if (!dateStr) return null;
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'date') {
      setArabicDay(getArabicDayName(value));
      if (!isDateAvailable(value)) {
        setFormData(prev => ({ ...prev, date: '' }));
        setArabicDay(null);
        setDateWarning('اليوم المختار غير متاح للحجز. يرجى اختيار يوم آخر من أيام عمل العيادة.');
        return;
      } else {
        setDateWarning(null);
      }
    }
    if ((field === 'date' || field === 'time')) {
      const d = field === 'date' ? value : formData.date;
      const t = field === 'time' ? value : formData.time;
      if (d && t) {
        if (!isTimeWithinWorkingHours(d, t)) {
          setWorkTimeWarning('الميعاد المختار خارج أوقات العمل الرسمية للعيادة. يرجى اختيار وقت آخر.');
        } else {
          setWorkTimeWarning(null);
        }
      }
    }
  };

  // استخراج الأيام المتاحة من workingHours
  useEffect(() => {
    if (clinicInfo.workingHours && Array.isArray(clinicInfo.workingHours)) {
      const daysSet = new Set<string>();
      clinicInfo.workingHours.forEach(wh => {
        let whDays: string[] = [];
        if (Array.isArray(wh.day)) {
          whDays = wh.day.map((d: string) => d.replace(/يوم /g, '').trim());
        } else if (typeof wh.day === 'string') {
          whDays = wh.day.split(',').map((d: string) => d.replace(/يوم /g, '').trim());
        }
        whDays.forEach(d => {
          if (d && !wh.time.includes('مغلق')) daysSet.add(d);
        });
      });
    }
  }, [clinicInfo.workingHours]);

  useEffect(() => {
    if (availableDays.length > 0 && !selectedDay) {
      setSelectedDay(availableDays[0]);
      const nextDate = getNextDateForDay(availableDays[0]);
      setNextDateForDay(nextDate);
      setFormData((prev) => ({ ...prev, date: nextDate || '' }));
      setArabicDay(availableDays[0]);
      setDateWarning(null);
    }
  }, [availableDays, selectedDay]);

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section with Animation */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-dental-blue to-dental-teal text-white py-20 md:py-28"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            احجز موعدك
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
          >
            احجز موعدك الآن واحصل على استشارة مجانية مع د. معاذ أشرف
          </motion.p>
        </div>
      </motion.section>

      {/* Appointment Form Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* Form Card with Animation */}
            <motion.div variants={item}>
              <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl text-center text-gray-800">
                    نموذج حجز الموعد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!submitted ? (
                    <>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div variants={item}>
                          <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2">
                            <FaUser className="text-dental-blue" />
                            الاسم الكامل *
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="أدخل اسمك الكامل"
                            className="mt-1"
                            required
                          />
                        </motion.div>

                        <motion.div variants={item}>
                          <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center gap-2">
                            <FaPhone className="text-dental-blue" />
                            رقم الجوال *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="05xxxxxxxx"
                            className="mt-1"
                            required
                          />
                        </motion.div>

                        <motion.div variants={item}>
                          <Label htmlFor="service" className="text-gray-700 font-medium flex items-center gap-2">
                            <FaTooth className="text-dental-blue" />
                            نوع الخدمة *
                          </Label>
                          <Select value={formData.service} onValueChange={(value) => {
                            handleInputChange('service', value);
                            const found = services.find(s => s.title === value);
                            setSelectedServicePrice(found ? found.price : null);
                            setShowPrice(!!value);
                          }}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="اختر نوع الخدمة" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.title}>
                                  {service.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formData.service && selectedServicePrice !== null && (
                            <div className="mt-2 text-dental-blue text-base font-semibold animate-fade-in">
                              سعر الخدمة: {selectedServicePrice} جنيه
                            </div>
                          )}
                        </motion.div>

                        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="day" className="text-gray-700 font-medium flex items-center gap-2">
                              <FaCalendarAlt className="text-dental-blue" />
                              اليوم المتاح *
                            </Label>
                            <Select value={selectedDay || ''} onValueChange={handleDaySelect} disabled={availableDays.length === 0}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder={availableDays.length === 0 ? "لا توجد أيام متاحة" : "اختر اليوم"} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDays.length === 0 ? (
                                  <div className="px-4 py-2 text-gray-500">لا توجد أيام عمل متاحة حالياً</div>
                                ) : (
                                  availableDays.map((day, idx) => (
                                    <SelectItem key={idx} value={day}>
                                      {day}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {selectedDay && nextDateForDay && (
                              <div className="mt-2 text-dental-blue text-base font-semibold animate-fade-in">
                                التاريخ القادم: {nextDateForDay}
                              </div>
                            )}
                            {dateWarning && (
                              <div className="mt-2 text-red-600 text-base font-semibold animate-fade-in">
                                {dateWarning}
                              </div>
                            )}
                            {availableDays.length === 0 && (
                              <div className="mt-2 text-red-600 text-base font-semibold animate-fade-in">
                                لم يتم العثور على أيام عمل متاحة. يرجى مراجعة إعدادات العيادة أو المحاولة لاحقاً.
                              </div>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="time" className="text-gray-700 font-medium flex items-center gap-2">
                              <FaClock className="text-dental-blue" />
                              الوقت المفضل *
                            </Label>
                            <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="اختر الوقت" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.length === 0 ? (
                                  <div className="px-4 py-2 text-gray-500">لا توجد أوقات متاحة لهذا اليوم</div>
                                ) : (
                                  timeSlots.map((time, index) => (
                                    <SelectItem key={index} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </motion.div>

                        <motion.div variants={item}>
                          <Label htmlFor="notes" className="text-gray-700 font-medium">
                            ملاحظات إضافية
                          </Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="أي معلومات إضافية تود مشاركتها..."
                            className="mt-1"
                            rows={4}
                          />
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          variants={item}
                        >
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-dental-blue to-dental-teal hover:from-dental-blue/90 hover:to-dental-teal/90 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            إرسال طلب الحجز
                          </Button>
                        </motion.div>
                      </form>
                      {/* Warning message below the form */}
                      <div className="mt-8">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-rose-100 to-amber-100 border border-amber-300 rounded-lg px-4 py-3 shadow-sm">
                          <svg width="24" height="24" fill="none" stroke="#eab308" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                          <div>
                            <span className="block text-amber-700 font-semibold text-base">تنبيه هام</span>
                            <span className="block text-amber-700 text-sm">سيتم إلغاء الحجز تلقائيًا إذا لم يتم الحضور خلال ٢٤ ساعة من الموعد المحدد.</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', duration: 0.7 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <FaCheckCircle className="text-green-500 text-6xl mb-4 animate-bounce" />
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إرسال الطلب بنجاح!</h2>
                      <p className="text-gray-600 mb-6">يمكنك تحميل تفاصيل طلبك كملف PDF</p>
                      <Button
                        className="bg-gradient-to-r from-dental-blue to-dental-teal text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={handleGeneratePDF}
                        disabled={pdfLoading}
                      >
                        {pdfLoading ? 'جاري التحميل...' : 'عرض الطلب (PDF)'}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information Section */}
            <motion.div variants={item} className="space-y-8">
              <motion.div variants={item}>
                <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center gap-2">
                      <FaPhone className="text-dental-blue" />
                      معلومات التواصل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-dental-blue/10 p-3 rounded-full">
                        <FaPhone className="text-dental-blue text-xl" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">رقم الهاتف</p>
                        <p className="text-gray-600">{clinicInfo.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-dental-blue/10 p-3 rounded-full">
                        <FaEnvelope className="text-dental-blue text-xl" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">البريد الإلكتروني</p>
                        <p className="text-gray-600">{clinicInfo.email}</p>

                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-dental-blue/10 p-3 rounded-full">
                        <FaMapMarkerAlt className="text-dental-blue text-xl" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">العنوان</p>
                        <p className="text-gray-600">{clinicInfo.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl text-gray-800 flex items-center gap-2">
                      <MdOutlineWork className="text-dental-blue" />
                      ساعات العمل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clinicInfo.workingHours.map((h, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-800 font-medium">{h.day}</span>
                          <span className="text-gray-600">{h.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div 
                variants={item}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
              >
                <Card className="bg-gradient-to-r from-dental-blue/10 to-dental-teal/10 border-dental-blue/20 hover:border-dental-blue/40 transition-all duration-300">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="bg-dental-blue/20 p-3 rounded-full">
                      <FaGift className="text-dental-blue text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">
                        عرض خاص للمرضى الجدد
                      </h3>
                      <p className="text-gray-600">
                        احصل على استشارة مجانية وخصم 20% على أول جلسة علاج
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
//ddsdscdscdcds

export default Appointment;
