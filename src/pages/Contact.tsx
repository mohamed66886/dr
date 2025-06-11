import { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaFacebook, FaInstagram, FaTwitter,
  FaClock, FaCalendarAlt, FaQuestionCircle,
  FaTooth, FaCar, FaFileInvoiceDollar,
  FaAmbulance
} from 'react-icons/fa';
import { GiToothbrush } from 'react-icons/gi';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [clinicInfo, setClinicInfo] = useState({
    phone: '01551290902',
    altPhone: '01000000000',
    email: 'info@dr-mohamedrashad.com',
    altEmail: 'appointments@dr-mohamedrashad.com',
    address1: 'شارع الملك فهد',
    address2: 'دكرنس، الدقهلية',
    workingHours: [
      { day: 'السبت - الأربعاء', time: '9:00 ص - 9:00 م' },
      { day: 'الخميس', time: '9:00 ص - 6:00 م' },
      { day: 'الجمعة', time: 'مغلق' }
    ],
    facebook: '',
    instagram: '',
    twitter: ''
  });

  // Animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "خطأ في البيانات",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "تم إرسال رسالتك بنجاح",
        description: "سيتم الرد عليك في أقرب وقت ممكن",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (e) {
      toast({
        title: "حدث خطأ",
        description: "تعذر إرسال الرسالة. حاول مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'config', 'clinicSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClinicInfo({
            phone: data.phone || '',
            altPhone: data.altPhone || '',
            email: data.email || '',
            altEmail: data.altEmail || '',
            address1: data.address1 || '',
            address2: data.address2 || data.address || '',
            workingHours: Array.isArray(data.workingHours) ? data.workingHours : [],
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            twitter: data.twitter || ''
          });
        }
      } catch (e) {
        // يمكن إضافة لوج أو رسالة خطأ هنا إذا رغبت
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <motion.section 
        className="bg-gradient-to-r from-dental-blue to-teal-600 text-white py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            اتصل بنا
          </motion.h1>
          <motion.p 
            className="text-xl opacity-90 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            نحن هنا للإجابة على جميع استفساراتك ومساعدتك في الحصول على أفضل رعاية طبية
          </motion.p>
          
          {/* Animated Tooth Icon */}
          <motion.div
            className="mt-8 flex justify-center"
            animate={pulseAnimation}
          >
            <FaTooth className="text-white text-4xl opacity-80" />
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <motion.div 
                    className="text-dental-blue text-4xl mb-4"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FaPhone className="inline-block" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">اتصل بنا</h3>
                  <p className="text-gray-600 mb-2">{clinicInfo.phone}</p>
                  {clinicInfo.altPhone && <p className="text-gray-600">{clinicInfo.altPhone}</p>}
                  <Button 
                    className="mt-4 bg-dental-blue hover:bg-dental-blue/90"
                    onClick={() => window.open('tel:01551290902')}
                  >
                    اتصل الآن
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <motion.div 
                    className="text-dental-blue text-4xl mb-4"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FaEnvelope className="inline-block" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">راسلنا</h3>
                  <p className="text-gray-600 mb-2">{clinicInfo.email}</p>
                  {clinicInfo.altEmail && <p className="text-gray-600">{clinicInfo.altEmail}</p>}
                  <Button 
                    className="mt-4 bg-dental-blue hover:bg-dental-blue/90"
                    onClick={() => window.open('mailto:info@dr-mohamedrashad.com')}
                  >
                    أرسل بريد
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <motion.div 
                    className="text-dental-blue text-4xl mb-4"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FaMapMarkerAlt className="inline-block" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">زرنا</h3>
                  <p className="text-gray-600 mb-2">{clinicInfo.address1}</p>
                  <p className="text-gray-600">{clinicInfo.address2}</p>
                  <Button 
                    className="mt-4 bg-dental-blue hover:bg-dental-blue/90"
                    onClick={() => window.open('https://maps.google.com', '_blank')}
                  >
                    عرض الخريطة
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 bg-dental-gray">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            {/* Contact Form */}
            <motion.div variants={fadeInUp}>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-gray-800">
                    أرسل لنا رسالة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">
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
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-gray-700 font-medium">
                          رقم الجوال
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="05xxxxxxxx"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        البريد الإلكتروني *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-gray-700 font-medium">
                        الموضوع
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="موضوع الرسالة"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-gray-700 font-medium">
                        الرسالة *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        className="mt-1"
                        rows={6}
                        required
                      />
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-dental-blue to-teal-500 hover:from-dental-blue/90 hover:to-teal-500/90 text-white py-3 text-lg font-semibold"
                      >
                        إرسال الرسالة
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Map and Additional Info */}
            <div className="space-y-8">
              {/* Map */}
              <motion.div variants={fadeInUp}>
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <FaMapMarkerAlt className="ml-2 text-dental-blue" />
                      موقع العيادة - دكرنس، الدقهلية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative rounded-lg overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                      >
                        <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.492402574618!2d31.5295355!3d31.0731534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f79e2a0e4b4d29%3A0x813b20a54c28f08d!2z2YbYp9mF2LnYqSDYp9mE2KrZg9ip!5e0!3m2!1sar!2seg!4v1717763800000" 
                          width="100%"
                          height="300"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="rounded-lg"
                        ></iframe>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Working Hours */}
              <motion.div variants={fadeInUp}>
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <FaClock className="ml-2 text-dental-blue" />
                      ساعات العمل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {clinicInfo.workingHours.map((h, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-800">{h.day}</span>
                          <span className={`font-medium ${h.time === 'مغلق' ? 'text-red-500' : 'text-dental-blue'}`}>{h.time}</span>
                        </div>
                      ))}
                    </div>
                    
                    <motion.div 
                      className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-100"
                      whileHover={{ y: -3 }}
                    >
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <FaAmbulance className="ml-2 text-red-500" />
                        خدمة الطوارئ
                      </h4>
                      <p className="text-gray-600 text-sm">متوفرة 24/7 للحالات الطارئة</p>
                      <p className="text-dental-blue font-medium mt-1 flex items-center">
                        <FaPhone className="ml-2" />
                        {clinicInfo.phone}
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Social Media */}
              <motion.div variants={fadeInUp}>
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <FaTwitter className="ml-2 text-dental-blue" />
                      تابعنا على
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <motion.a 
                        href={clinicInfo.facebook ? (clinicInfo.facebook.startsWith('http') ? clinicInfo.facebook : `https://${clinicInfo.facebook}`) : '#'}
                        className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        whileHover={{ y: -5 }}
                        target="_blank" rel="noopener noreferrer"
                      >
                        <FaFacebook className="text-blue-600 text-2xl mb-2" />
                        <span className="text-sm text-gray-600">فيسبوك</span>
                      </motion.a>
                      <motion.a 
                        href={clinicInfo.instagram ? (clinicInfo.instagram.startsWith('http') ? clinicInfo.instagram : `https://${clinicInfo.instagram}`) : '#'}
                        className="flex flex-col items-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                        whileHover={{ y: -5 }}
                        target="_blank" rel="noopener noreferrer"
                      >
                        <FaInstagram className="text-pink-600 text-2xl mb-2" />
                        <span className="text-sm text-gray-600">إنستغرام</span>
                      </motion.a>
                      <motion.a 
                        href={clinicInfo.twitter ? (clinicInfo.twitter.startsWith('http') ? clinicInfo.twitter : `https://${clinicInfo.twitter}`) : '#'}
                        className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        whileHover={{ y: -5 }}
                        target="_blank" rel="noopener noreferrer"
                      >
                        <FaTwitter className="text-blue-400 text-2xl mb-2" />
                        <span className="text-sm text-gray-600">تويتر</span>
                      </motion.a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">الأسئلة الشائعة</h2>
            <p className="text-lg text-gray-600">إجابات على أكثر الأسئلة شيوعاً</p>
          </motion.div>
          
          <motion.div 
            className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            {[
              {
                question: 'كيف يمكنني حجز موعد؟',
                answer: 'يمكنك حجز موعد عبر الموقع الإلكتروني أو بالاتصال على رقم العيادة.',
                icon: <FaCalendarAlt className="text-dental-blue text-xl" />
              },
              {
                question: 'هل تقبلون التأمين الطبي؟',
                answer: 'نعم، نتعامل مع معظم شركات التأمين الطبي الرئيسية في المملكة.',
                icon: <FaFileInvoiceDollar className="text-dental-blue text-xl" />
              },
              {
                question: 'ما هي تكلفة الاستشارة؟',
                answer: 'الاستشارة الأولى مجانية للمرضى الجدد. للتفاصيل اتصل بالعيادة.',
                icon: <FaQuestionCircle className="text-dental-blue text-xl" />
              },
              {
                question: 'هل تتوفر مواقف سيارات؟',
                answer: 'نعم، نوفر مواقف سيارات مجانية ومريحة لجميع مرضانا.',
                icon: <FaCar className="text-dental-blue text-xl" />
              }
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        {faq.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">{faq.question}</h3>
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;