import { useEffect, useState } from 'react';
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
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
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
  const [lastData, setLastData] = useState<typeof formData | null>(null);
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
    fetchSettings();
  }, []);

  const services = [
    'تبييض الأسنان',
    'تنظيف الأسنان',
    'زراعة الأسنان',
    'تقويم الأسنان',
    'حشوات تجميلية',
    'علاج الجذور',
    'خدمة أخرى'
  ];

  const timeSlots = [
    '9:00 ص', '10:00 ص', '11:00 ص', '12:00 م',
    '2:00 م', '3:00 م', '4:00 م', '5:00 م',
    '6:00 م', '7:00 م', '8:00 م'
  ];

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
      await addDoc(collection(db, 'appointments'), formData);
      setLastData(formData);
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
    
    // Generate QR code with clinic logo or icon
    const qrData = `عيادة د. محمد رشاد\nمعلومات الحجز:\nالاسم: ${lastData?.name}\nالجوال: ${lastData?.phone}\nالخدمة: ${lastData?.service}\nالتاريخ: ${lastData?.date}\nالوقت: ${lastData?.time}\nسعر الكشف: ${clinicInfo.price}`;
    const qrImage = await QRCode.toDataURL(qrData, { 
        width: 150,
        margin: 2,
        color: {
            dark: '#0e7490', // Dark blue color for QR
            light: '#f8fafc' // Light background
        }
    });

    // SVG Icons
    const icons = {
        logo: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6v6l4 2"/>
              </svg>`,
        user: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>`,
        phone: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>`,
        tooth: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6v6l4 2"/>
              </svg>`,
        calendar: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>`,
        clock: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>`,
        notes: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>`,
        clinic: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/>
                <line x1="10" y1="1" x2="10" y2="4"/>
                <line x1="14" y1="1" x2="14" y2="4"/>
              </svg>`,
        whatsapp: `<svg viewBox="0 0 24 24" width="24" height="24" fill="#25D366" stroke="#25D366" stroke-width="2">
                <path d="M3 20l1.65-3.8a9 9 0 1 1 3.4 2.9L3 20z"/>
                <path d="M9 11a1 1 0 1 0-2 0 1 1 0 0 0 2 0z" fill="#fff"/>
                <path d="M15 11a1 1 0 1 0-2 0 1 1 0 0 0 2 0z" fill="#fff"/>
              </svg>`,
        email: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>`,
        location: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>`,
        info: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12" y2="8"/>
              </svg>`,
        facebook: `<svg viewBox="0 0 24 24" width="24" height="24" fill="#3b5998" stroke="#3b5998" stroke-width="2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>`,
        instagram: `<svg viewBox="0 0 24 24" width="24" height="24" fill="url(#instagram-gradient)" stroke="#E1306C" stroke-width="2">
                <defs>
                  <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f09433"/>
                    <stop offset="25%" stop-color="#e6683c"/>
                    <stop offset="50%" stop-color="#dc2743"/>
                    <stop offset="75%" stop-color="#cc2366"/>
                    <stop offset="100%" stop-color="#bc1888"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="5" fill="none" stroke="#fff" stroke-width="2"/>
              </svg>`
    };

    // Clinic information
    // const clinicInfo = { ... } // <-- احذف هذا التعريف القديم

    // Create PDF content
    const pdfDiv = document.createElement('div');
    pdfDiv.dir = 'rtl';
    pdfDiv.style.fontFamily = 'Cairo, Arial, sans-serif';
    pdfDiv.style.width = '100%';
    pdfDiv.style.maxWidth = '800px';
    pdfDiv.style.margin = '0 auto';
    pdfDiv.style.color = '#1e293b';
    
    pdfDiv.innerHTML = `
        <!-- Header with gradient background -->
        <div style="
            background: linear-gradient(135deg, #0e7490, #06b6d4);
            color: white;
            padding: 1.5rem;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="
                    background: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #0e7490;
                ">
                    ${icons.logo}
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 1.5rem; font-weight: 700;">${clinicInfo.name}</h1>
                    <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">تأكيد حجز موعد</p>
                </div>
            </div>
            
            <div style="
                background: white;
                padding: 8px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <img src="${qrImage}" width="100" height="100" alt="QR Code" />
            </div>
        </div>
        
        <!-- Main content -->
        <div style="
            padding: 2rem;
            background: #f8fafc;
            border-radius: 0 0 12px 12px;
            border: 1px solid #e2e8f0;
            border-top: none;
        ">
            <!-- Appointment details -->
            <div style="
                background: white;
                border-radius: 10px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            ">
                <h2 style="
                    margin: 0 0 1rem 0;
                    color: #0e7490;
                    font-size: 1.3rem;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span style="width:24px;height:24px;display:inline-block;">${icons.notes}</span> تفاصيل الحجز
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <div style="
                            background: #ecfdf5;
                            width: 36px;
                            height: 36px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #10b981;
                        ">
                            ${icons.user}
                        </div>
                        <div>
                            <p style="margin: 0; font-size: 0.9rem; color: #64748b;">الاسم</p>
                            <p style="margin: 0; font-weight: 600; color: #0f172a;">${lastData?.name || 'غير محدد'}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <div style="
                            background: #eff6ff;
                            width: 36px;
                            height: 36px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #3b82f6;
                        ">
                            ${icons.phone}
                        </div>
                        <div>
                            <p style="margin: 0; font-size: 0.9rem; color: #64748b;">الجوال</p>
                            <p style="margin: 0; font-weight: 600; color: #0f172a;">${lastData?.phone || 'غير محدد'}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <div style="
                            background: #fef2f2;
                            width: 36px;
                            height: 36px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #ef4444;
                        ">
                            ${icons.tooth}
                        </div>
                        <div>
                            <p style="margin: 0; font-size: 0.9rem; color: #64748b;">الخدمة</p>
                            <p style="margin: 0; font-weight: 600; color: #0f172a;">${lastData?.service || 'غير محدد'}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <div style="
                            background: #fef9c3;
                            width: 36px;
                            height: 36px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #eab308;
                        ">
                            ${icons.calendar}
                        </div>
                        <div>
                            <p style="margin: 0; font-size: 0.9rem; color: #64748b;">التاريخ</p>
                            <p style="margin: 0; font-weight: 600; color: #0f172a;">${lastData?.date || 'غير محدد'}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <div style="
                            background: #f3e8ff;
                            width: 36px;
                            height: 36px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #a855f7;
                        ">
                            ${icons.clock}
                        </div>
                        <div>
                            <p style="margin: 0; font-size: 0.9rem; color: #64748b;">الوقت</p>
                            <p style="margin: 0; font-weight: 600; color: #0f172a;">${lastData?.time || 'غير محدد'}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; align-items: center; grid-column: 1 / -1;">
                        <div style="
                            background: #f0fdf4;
                            width: 36px;
                            height: 36px;
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #0e7490;
                        ">
                            ${icons.info}
                        </div>
                        <div>
                            <p style="margin: 0; font-size: 0.9rem; color: #64748b;">سعر الكشف</p>
                            <p style="margin: 0; font-weight: 600; color: #0f172a;">${clinicInfo.price ? clinicInfo.price + ' جنيه' : 'غير محدد'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Clinic information -->
            <div style="
                background: white;
                border-radius: 10px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            ">
                <h2 style="
                    margin: 0 0 1rem 0;
                    color: #0e7490;
                    font-size: 1.3rem;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span style="width:24px;height:24px;display:inline-block;">${icons.clinic}</span> معلومات العيادة
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #475569;">اتصل بنا</h3>
                        <ul style="margin: 0; padding: 0; list-style: none;">
                            <li style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                                <span style="width:20px;height:20px;display:inline-block;">${icons.phone}</span> ${clinicInfo.phone}
                            </li>
                            <li style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                                <span style="width:20px;height:20px;display:inline-block;">${icons.whatsapp}</span> ${clinicInfo.whatsapp} (واتساب)
                            </li>
                            <li style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                                <span style="width:20px;height:20px;display:inline-block;">${icons.email}</span> ${clinicInfo.email}
                            </li>
                            <li style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                                <span style="width:20px;height:20px;display:inline-block;">${icons.location}</span> ${clinicInfo.address}
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #475569;">ساعات العمل</h3>
                        <ul style="margin: 0; padding: 0; list-style: none;">
                            ${clinicInfo.workingHours.map(hour => `
                                <li style="margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
                                    <span>${hour.day}</span>
                                    <span style="font-weight: 600; color: #0f172a;">${hour.time}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div>
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #475569;">وسائل التواصل الاجتماعي</h3>
                        <ul style="margin: 0; padding: 0; list-style: none;">
                            ${clinicInfo.socialMedia.map(social => `
                                <li style="margin-bottom: 0.5rem;">
                                    <a href="https://${social.url}" style="
                                        color: #3b82f6;
                                        text-decoration: none;
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                    ">
                                        <span>${social.name === 'فيسبوك' ? '📘' : '📸'}</span>
                                        ${social.name}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Instructions -->
            <div style="
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1.5rem;
            ">
                <h3 style="
                    margin: 0 0 0.5rem 0;
                    color: #166534;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span style="width:20px;height:20px;display:inline-block;">${icons.info}</span> تعليمات هامة
                </h3>
                <ul style="margin: 0; padding: 0 0 0 1rem;">
                    <li style="margin-bottom: 0.5rem; color: #166534;">يرجى الحضور قبل الموعد بـ 10 دقائق</li>
                    <li style="margin-bottom: 0.5rem; color: #166534;">إحضار بطاقة الهوية عند الحضور</li>
                    <li style="margin-bottom: 0.5rem; color: #166534;">في حالة الرغبة في إلغاء الموعد، يرجى التواصل قبل 24 ساعة</li>
                    <li style="color: #166534;">يمكن استخدام رمز الاستجابة السريعة (QR) للتحقق من الموعد</li>
                </ul>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; color: #64748b; font-size: 0.8rem;">
                <p style="margin: 0 0 0.5rem 0;">شكراً لثقتكم في عيادتنا</p>
                <p style="margin: 0; font-size: 0.7rem;">© ${new Date().getFullYear()} ${clinicInfo.name}. جميع الحقوق محفوظة</p>
            </div>
        </div>
    `;

    document.body.appendChild(pdfDiv);
    
    try {
        await html2pdf().set({
            margin: 0,
            filename: `حجز_موعد_${lastData?.name || 'مريض'}.pdf`,
            html2canvas: { 
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            },
            jsPDF: { 
                orientation: 'portrait', 
                unit: 'mm', 
                format: 'a4',
                hotfixes: ['px_scaling']
            }
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
            احجز موعدك الآن واحصل على استشارة مجانية مع د. محمد رشاد
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
                          <Select value={formData.service} onValueChange={(value) => { handleInputChange('service', value); setShowPrice(!!value); }}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="اختر نوع الخدمة" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((service, index) => (
                                <SelectItem key={index} value={service}>
                                  {service}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {showPrice && clinicInfo.price && (
                            <div className="mt-2 text-dental-blue text-base font-semibold animate-fade-in">
                              سعر الكشف: {clinicInfo.price} جنيه
                            </div>
                          )}
                        </motion.div>

                        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="date" className="text-gray-700 font-medium flex items-center gap-2">
                              <FaCalendarAlt className="text-dental-blue" />
                              التاريخ المفضل *
                            </Label>
                            <Input
                              id="date"
                              type="date"
                              value={formData.date}
                              onChange={(e) => handleInputChange('date', e.target.value)}
                              className="mt-1"
                              min={new Date().toISOString().split('T')[0]}
                              required
                            />
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
                                {timeSlots.map((time, index) => (
                                  <SelectItem key={index} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
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
