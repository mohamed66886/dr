import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTooth, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaHome, FaUserMd, FaTeeth, FaCalendarAlt } from 'react-icons/fa';
import { GiToothbrush, GiTooth } from 'react-icons/gi';
import { FaTeethOpen } from 'react-icons/fa';

const Footer = () => {
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
          className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          variants={staggerContainer}
          viewport={{ once: true }}
        >
          {/* About Section */}
          <motion.div variants={fadeIn}>
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTooth className="text-white text-xl" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold">د. محمد رشاد</h3>
                <p className="text-sm text-gray-300">طبيب الأسنان</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              عيادة متخصصة في طب الأسنان تقدم أفضل الخدمات العلاجية والتجميلية باستخدام أحدث التقنيات والمعدات الطبية.
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
          <motion.div variants={fadeIn}>
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
          <motion.div variants={fadeIn}>
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
          <motion.div variants={fadeIn}>
            <h4 className="text-lg font-semibold mb-4">معلومات التواصل</h4>
            <div className="space-y-4">
              <motion.p 
                className="text-gray-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <span className="bg-blue-500 p-2 rounded-full mr-2">
                  <FaPhone className="text-white" />
                </span>
                <span>01551290902</span>
              </motion.p>
              <motion.p 
                className="text-gray-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <span className="bg-red-500 p-2 rounded-full mr-2">
                  <FaEnvelope className="text-white" />
                </span>
                <span>info@dr-ahmed.com</span>
              </motion.p>
              <motion.p 
                className="text-gray-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <span className="bg-green-500 p-2 rounded-full mr-2">
                  <FaMapMarkerAlt className="text-white" />
                </span>
                <span>دكرنس، الدقهلية</span>
              </motion.p>
            </div>
            
            {/* Social Media */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-3">تابعنا على</h5>
              <div className="flex space-x-4 space-x-reverse">
                <motion.a 
                  href="#" 
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                  whileHover={{ y: -3 }}
                >
                  <FaFacebook className="text-2xl" />
                </motion.a>
                <motion.a 
                  href="#" 
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 text-center">
            <motion.p 
              className="text-gray-300 text-xs md:text-sm"
              whileHover={{ scale: 1.01 }}
            >
              © 2024 د. محد رشاد. جميع الحقوق محفوظة.

            </motion.p>
            <motion.p 
              className="text-gray-300 text-xs md:text-sm mt-2 md:mt-0"
              whileHover={{ scale: 1.01 }}
            >
              ساعات العمل: السبت - الخميس، 9:00 ص - 9:00 م
            </motion.p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;