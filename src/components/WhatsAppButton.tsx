import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaWhatsapp, FaCommentAlt, FaTimes } from 'react-icons/fa';
import { RiSendPlaneFill } from 'react-icons/ri';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = "201062097359"; // تم تحديث الرقم ليبدأ بكود مصر الدولي الصحيح
    const defaultMessage = message || "مرحباً، أود حجز موعد في عيادة د. أحمد العليمي";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
    setIsExpanded(false);
    setMessage('');
  };

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
    setIsHovered(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 15 }}
          className="fixed bottom-6 left-6 z-50"
        >
          {!isExpanded ? (
            <motion.div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative"
            >
              {/* زر واتساب رئيسي */}
              <motion.button
                onClick={toggleChat}
                className="relative whatsapp-button flex items-center justify-center bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-full p-5 shadow-xl hover:shadow-[#25D366]/50 transition-all duration-300 focus:outline-none"
                aria-label="فتح دردشة واتساب"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* تأثيرات متحركة */}
                <motion.span
                  className="absolute inset-0 rounded-full bg-[#25D366]/20 blur-md z-0"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.9, 0.6]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
                
                {/* تأثير نبض */}
                <motion.span
                  className="absolute inset-0 border-2 border-[#25D366]/50 rounded-full"
                  animate={{ 
                    scale: [1, 1.5],
                    opacity: [0.8, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: 'easeOut'
                  }}
                />
                
                <FaWhatsapp className="text-3xl z-10" />
              </motion.button>

              {/* نص الطفو */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute left-full ml-3 bottom-0 bg-white text-[#128C7E] px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
                    style={{ boxShadow: '0 4px 20px rgba(37, 211, 102, 0.3)' }}
                  >
                    <div className="text-sm font-bold">تواصل معنا مباشرة</div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white transform rotate-45"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl overflow-hidden w-80"
              style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
            >
              {/* شريط العنوان */}
              <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FaWhatsapp className="text-white text-xl mr-2" />
                  <span className="text-white font-bold">واتساب العيادة</span>
                </div>
                <button 
                  onClick={toggleChat}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* محتوى الدردشة */}
              <div className="p-4">
                <div className="flex items-start mb-4">
                  <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
                    <p className="text-gray-800 text-sm">مرحباً! كيف يمكننا مساعدتك؟</p>
                  </div>
                </div>

                <div className="mb-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 resize-none"
                    rows={3}
                  />
                </div>

                <motion.button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-3 rounded-lg flex items-center justify-center font-bold shadow hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RiSendPlaneFill className="ml-2" />
                  إرسال عبر واتساب
                </motion.button>
              </div>

              {/* تأثيرات خلفية */}
              <motion.div
                className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#25D366]/10 rounded-full z-0"
                animate={{
                  scale: [1, 1.5],
                  opacity: [0.1, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            </motion.div>
          )}

          {/* فقاعة إشعار */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                whileHover={{ rotate: [0, 15, -15, 0] }}
              >
                1
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppButton;