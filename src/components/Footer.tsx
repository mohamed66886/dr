import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTooth, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaHome, FaUserMd, FaTeeth, FaCalendarAlt } from 'react-icons/fa';
import { GiToothbrush, GiTooth } from 'react-icons/gi';
import { FaTeethOpen } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const Footer = () => {
  const [clinic, setClinic] = useState({
    clinicName: 'عيادة د. محمد رشاد لطب الأسنان',
    phone: '01551290902',
    email: 'Mohamed@gmail.com',
    address: 'دكرنس، الدقهلية',
    workingHours: [
      { day: 'السبت - الأربعاء', time: '9:00 ص - 9:00 م' },
      { day: 'الخميس', time: '9:00 ص - 6:00 م' },
      { day: 'الجمعة', time: 'مغلق' }
    ],
    facebook: 'facebook.com/dentalclinic',
    instagram: 'instagram.com/dentalclinic',
    whatsapp: '01551290902',
    about: 'عيادة متخصصة في طب الأسنان تقدم أفضل الخدمات العلاجية والتجميلية باستخدام أحدث التقنيات والمعدات الطبية.'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'config', 'clinicSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClinic({
            clinicName: data.clinicName || '',
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            workingHours: Array.isArray(data.workingHours) ? data.workingHours : [],
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            whatsapp: data.whatsapp || '',
            about: data.about || ''
          });
        }
      } catch (e) {
        // يمكن إضافة لوج أو رسالة خطأ هنا إذا رغبت
      }
    };
    fetchSettings();
  }, []);

  // Animations
  const fadeIn = {
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

  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white text-sm md:text-base">
      <div className="container mx-auto px-2 sm:px-4 py-8 md:py-12">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 text-center md:text-right place-items-center md:place-items-stretch"
          initial="hidden"
          whileInView="visible"
          variants={staggerContainer}
          viewport={{ once: true }}
        >
          {/* About Section */}
          <motion.div variants={fadeIn} className="w-full flex flex-col items-center md:items-start">
            <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-2 md:space-x-reverse mb-4">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full flex items-center justify-center mb-2 md:mb-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTooth className="text-white text-xl" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold">{clinic.clinicName}</h3>
                <p className="text-sm text-gray-300">طبيب الأسنان</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {clinic.about}
            </p>
            {/* Animated Tooth Icon */}
            <motion.div 
              className="mt-4"
              animate={{
                rotate: [0, 10, -10, 0],
                y: [0, -5, 5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <GiTooth className="text-teal-300 text-2xl" />
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeIn} className="w-full flex flex-col items-center md:items-start">
            <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-3">
              <motion.li whileHover={{ x: 5 }}>
                <Link to="/" className="text-gray-300 hover:text-teal-300 transition-colors flex items-center">
                  <FaHome className="ml-2" />
                  الرئيسية
                </Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <Link to="/about" className="text-gray-300 hover:text-teal-300 transition-colors flex items-center">
                  <FaUserMd className="ml-2" />
                  من نحن
                </Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <Link to="/services" className="text-gray-300 hover:text-teal-300 transition-colors flex items-center">
                  <FaTeeth className="ml-2" />
                  خدماتنا
                </Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <Link to="/appointment" className="text-gray-300 hover:text-teal-300 transition-colors flex items-center">
                  <FaCalendarAlt className="ml-2" />
                  حجز موعد
                </Link>
              </motion.li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={fadeIn} className="w-full flex flex-col items-center md:items-start">
            <h4 className="text-lg font-semibold mb-4">خدماتنا</h4>
            <ul className="space-y-3">
              <motion.li 
                className="text-gray-300 flex items-center"
                whileHover={{ x: 5 }}
              >
                <GiToothbrush className="ml-2 text-teal-300" />
                تبييض الأسنان
              </motion.li>
              <motion.li 
                className="text-gray-300 flex items-center"
                whileHover={{ x: 5 }}
              >
                <GiTooth className="ml-2 text-teal-300" />
                تنظيف الأسنان
              </motion.li>
              <motion.li 
                className="text-gray-300 flex items-center"
                whileHover={{ x: 5 }}
              >
                <FaTeethOpen className="ml-2 text-teal-300" />
                زراعة الأسنان
              </motion.li>
              <motion.li 
                className="text-gray-300 flex items-center"
                whileHover={{ x: 5 }}
              >
                <GiTooth className="ml-2 text-teal-300" />
                تقويم الأسنان
              </motion.li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={fadeIn} className="w-full flex flex-col items-center md:items-start">
            <h4 className="text-lg font-semibold mb-4">معلومات التواصل</h4>
            <div className="space-y-4 w-full flex flex-col items-center md:items-start">
              <motion.p 
                className="text-gray-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <span className="bg-blue-500 p-2 rounded-full mr-2">
                  <FaPhone className="text-white" />
                </span>
                <span>{clinic.phone}</span>
              </motion.p>
              <motion.p 
                className="text-gray-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <span className="bg-red-500 p-2 rounded-full mr-2">
                  <FaEnvelope className="text-white" />
                </span>
                <span>{clinic.email}</span>
              </motion.p>
              <motion.p 
                className="text-gray-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <span className="bg-green-500 p-2 rounded-full mr-2">
                  <FaMapMarkerAlt className="text-white" />
                </span>
                <span>{clinic.address}</span>
              </motion.p>
            </div>
            {/* Social Media */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-3 text-center md:text-right">تابعنا على</h5>
              <div className="flex justify-center md:justify-start space-x-4 space-x-reverse">
                <motion.a 
                  href={clinic.facebook} 
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                  whileHover={{ y: -3 }}
                >
                  <FaFacebook className="text-2xl" />
                </motion.a>
                <motion.a 
                  href={clinic.instagram} 
                  className="text-gray-300 hover:text-pink-500 transition-colors"
                  whileHover={{ y: -3 }}
                >
                  <FaInstagram className="text-2xl" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-300 hover:text-blue-300 transition-colors"
                  whileHover={{ y: -3 }}
                >
                  <FaTwitter className="text-2xl" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </motion.div>
        <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-2 md:gap-0 text-center">
            <motion.p 
              className="text-gray-300 text-xs md:text-sm"
              whileHover={{ scale: 1.01 }}
            >
              © 2025 
              <a href="https://codexaa.tech" target="_blank" rel="noopener noreferrer" className="text-white bg-gradient-to-r from-teal-400 to-blue-500 px-2 py-0.5 rounded font-bold underline hover:text-teal-300 transition-colors shadow-md">شركة Codexa</a>. جميع الحقوق محفوظة.
            </motion.p>
            <motion.p 
              className="text-gray-300 text-xs md:text-sm mt-2 md:mt-0"
              whileHover={{ scale: 1.01 }}
            >
              ساعات العمل: {clinic.workingHours && clinic.workingHours.length > 0 ? clinic.workingHours.map((hour, index) => `${hour.day}: ${hour.time}${index < clinic.workingHours.length - 1 ? '، ' : ''}`).join('') : 'السبت - الخميس، 9:00 ص - 9:00 م'}
            </motion.p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;