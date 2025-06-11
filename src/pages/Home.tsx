import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FaTooth, FaTeeth, FaTeethOpen, FaClinicMedical, FaSmile } from 'react-icons/fa';
import { GiToothbrush, GiTooth } from 'react-icons/gi';
import { MdMedicalServices, MdHealthAndSafety } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import * as FaIcons from 'react-icons/fa';
import * as GiIcons from 'react-icons/gi';
import * as MdIcons from 'react-icons/md';

interface HomeData {
  title: string;
  subtitle: string;
  heroImage: string;
  doctorBio: string;
  doctorImage?: string;
  experienceYears?: string;
  happyPatients?: string;
  services: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
}

const Home = () => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'pages', 'home');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          setHomeData({
            title: d.title || '',
            subtitle: d.subtitle || '',
            heroImage: d.heroImage || '',
            doctorBio: d.doctorBio || '',
            doctorImage: d.doctorImage || '',
            experienceYears: d.experienceYears || '15+',
            happyPatients: d.happyPatients || '5000+',
            services: d.services || [],
          });
        }
      } catch {
        setHomeData(null);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-32">جاري التحميل...</div>;
  if (!homeData) return <div className="text-center py-32 text-red-500">تعذر تحميل الصفحة</div>;

  const services = homeData.services && homeData.services.length > 0
    ? homeData.services.map(service => {
        let IconComponent = null;
        if (service.icon?.startsWith('Fa')) IconComponent = FaIcons[service.icon];
        else if (service.icon?.startsWith('Gi')) IconComponent = GiIcons[service.icon];
        else if (service.icon?.startsWith('Md')) IconComponent = MdIcons[service.icon];
        return {
          ...service,
          icon: IconComponent ? <IconComponent className="text-4xl text-dental-blue" /> : null
        };
      })
    : [
      {
        icon: <FaTeeth className="text-4xl text-dental-blue" />,
        title: 'تبييض الأسنان',
        description: 'احصل على ابتسامة بيضاء ومشرقة باستخدام أحدث تقنيات التبييض الآمنة'
      },
      {
        icon: <GiTooth className="text-4xl text-dental-blue" />,
        title: 'زراعة الأسنان',
        description: 'حلول متقدمة لاستبدال الأسنان المفقودة بزراعات عالية الجودة'
      },
      {
        icon: <FaTeethOpen className="text-4xl text-dental-blue" />,
        title: 'تقويم الأسنان',
        description: 'تقويم الأسنان بأحدث التقنيات للحصول على ابتسامة مثالية ومنتظمة'
      }
    ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 md:py-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.85), rgba(14, 165, 233, 0.85)), url('${homeData.heroImage || "/images/dental-hero.jpg"}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed'
        }}
      >
        {/* أسنان متحركة في الخلفية */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(isMobile ? 5 : 7)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute"
              style={{
                left: `${10 + i * (isMobile ? 15 : 12)}%`,
                top: `${15 + (i % 2 === 0 ? 0 : 10)}%`,
                filter: 'blur(2px)',
                opacity: 0.18 + (i % 2) * 0.07,
              }}
              animate={{
                y: [0, 30, 0],
                scale: [1, 1.15, 1],
                rotate: [0, i % 2 === 0 ? 10 : -10, 0]
              }}
              transition={{
                duration: 7 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.7
              }}
            >
              <svg width={isMobile ? 40 : 54} height={isMobile ? 40 : 54} viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M27 4C34.1797 4 40 9.8203 40 17C40 24.1797 34.1797 30 27 30C19.8203 30 14 24.1797 14 17C14 9.8203 19.8203 4 27 4Z" fill="#fff" fillOpacity="0.7"/>
                <ellipse cx="27" cy="40" rx="10" ry="12" fill="#fff" fillOpacity="0.5"/>
              </svg>
            </motion.span>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/20 z-10 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 text-center relative z-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              variants={fadeIn}
              className="relative text-4xl sm:text-5xl md:text-6xl font-black mb-4 md:mb-6 leading-tight drop-shadow-xl font-display tracking-tight bg-gradient-to-r from-white via-sky-200 to-dental-blue bg-clip-text text-transparent [text-shadow:0_2px_16px_rgba(14,165,233,0.18)]"
              style={{ fontFamily: 'Cairo, Tajawal, "Noto Kufi Arabic", "Segoe UI", Arial, sans-serif', letterSpacing: '0.01em' }}
            >
              <span className="pointer-events-none select-none">
                {!isMobile && (
                  <>
                    <motion.span
                      className="hidden md:block absolute -top-8 -right-8 z-20"
                      initial={{ y: -10, x: 10, rotate: 0 }}
                      animate={{ y: [0, -10, 0], x: [0, 10, 0], rotate: [0, 15, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                    >
                      <svg width="38" height="38" viewBox="0 0 54 54" fill="none"><path d="M27 4C34.1797 4 40 9.8203 40 17C40 24.1797 34.1797 30 27 30C19.8203 30 14 24.1797 14 17C14 9.8203 19.8203 4 27 4Z" fill="#fff" fillOpacity="0.9"/><ellipse cx="27" cy="40" rx="10" ry="12" fill="#bae6fd" fillOpacity="0.7"/></svg>
                    </motion.span>
                    <motion.span
                      className="hidden md:block absolute -top-8 -left-8 z-20"
                      initial={{ y: -10, x: -10, rotate: 0 }}
                      animate={{ y: [0, -10, 0], x: [0, -10, 0], rotate: [0, -15, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                    >
                      <svg width="32" height="32" viewBox="0 0 54 54" fill="none"><path d="M27 4C34.1797 4 40 9.8203 40 17C40 24.1797 34.1797 30 27 30C19.8203 30 14 24.1797 14 17C14 9.8203 19.8203 4 27 4Z" fill="#fff" fillOpacity="0.8"/><ellipse cx="27" cy="40" rx="9" ry="10" fill="#bae6fd" fillOpacity="0.6"/></svg>
                    </motion.span>
                    <motion.span
                      className="hidden md:block absolute -bottom-8 -right-6 z-20"
                      initial={{ y: 10, x: 10, rotate: 0 }}
                      animate={{ y: [0, 10, 0], x: [0, 8, 0], rotate: [0, -10, 0] }}
                      transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                    >
                      <svg width="28" height="28" viewBox="0 0 54 54" fill="none"><path d="M27 4C34.1797 4 40 9.8203 40 17C40 24.1797 34.1797 30 27 30C19.8203 30 14 24.1797 14 17C14 9.8203 19.8203 4 27 4Z" fill="#fff" fillOpacity="0.7"/><ellipse cx="27" cy="40" rx="8" ry="9" fill="#bae6fd" fillOpacity="0.5"/></svg>
                    </motion.span>
                    <motion.span
                      className="hidden md:block absolute -bottom-8 -left-6 z-20"
                      initial={{ y: 10, x: -10, rotate: 0 }}
                      animate={{ y: [0, 10, 0], x: [0, -8, 0], rotate: [0, 10, 0] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 1.7 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 54 54" fill="none"><path d="M27 4C34.1797 4 40 9.8203 40 17C40 24.1797 34.1797 30 27 30C19.8203 30 14 24.1797 14 17C14 9.8203 19.8203 4 27 4Z" fill="#fff" fillOpacity="0.7"/><ellipse cx="27" cy="40" rx="7" ry="8" fill="#bae6fd" fillOpacity="0.4"/></svg>
                    </motion.span>
                  </>
                )}
                {isMobile && (
                  <motion.span
                    className="block md:hidden absolute -top-7 left-1/2 -translate-x-1/2 z-20"
                    initial={{ y: -8, rotate: 0 }}
                    animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    <svg width="28" height="28" viewBox="0 0 54 54" fill="none"><path d="M27 4C34.1797 4 40 9.8203 40 17C40 24.1797 34.1797 30 27 30C19.8203 30 14 24.1797 14 17C14 9.8203 19.8203 4 27 4Z" fill="#fff" fillOpacity="0.8"/><ellipse cx="27" cy="40" rx="8" ry="9" fill="#bae6fd" fillOpacity="0.5"/></svg>
                  </motion.span>
                )}
              </span>
              {homeData.title || 'ابتسامتك سر ثقتك'}
            </motion.h1>
            <motion.p 
              variants={fadeIn}
              className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-90 drop-shadow-lg max-w-2xl mx-auto"
            >
              {homeData.subtitle || 'مع د. معاذ أشرف احصل على الابتسامة التي تحلم بها'}
            </motion.p>
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse w-full max-w-xl mx-auto"
            >
              <Link to="/appointment" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-dental-blue via-sky-400 to-cyan-400 text-white hover:from-sky-400 hover:to-dental-blue px-8 sm:px-10 py-6 sm:py-8 text-lg sm:text-xl font-semibold rounded-full shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-4 group justify-center">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 15.487A9.001 9.001 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9a9.001 9.001 0 01-6.862 8.487M15 19v2m-6-2v2" /></svg>
                  احجز موعدك الآن
                </Button>
              </Link>
              <Link to="/services" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto border-2 border-dental-blue text-dental-blue hover:bg-dental-blue hover:text-white px-8 sm:px-10 py-6 sm:py-8 text-lg sm:text-xl font-semibold rounded-full flex items-center gap-4 transition-all duration-200 group justify-center"
                >
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-dental-blue group-hover:text-white transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7m0 4l-4-4m4 4l4-4" /></svg>
                  تعرف على خدماتنا
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Doctor Bio Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full max-w-md mx-auto flex justify-center items-center">
                <motion.div
                  initial={{ scale: 0.92, boxShadow: '0 0 0 0 #38bdf8' }}
                  animate={{ scale: [0.92, 1.04, 0.98, 1], boxShadow: [
                    '0 0 0 0 #38bdf8',
                    '0 0 0 12px #bae6fd44',
                    '0 0 0 6px #38bdf822',
                    '0 0 0 0 #38bdf800',
                    '0 0 0 0 #38bdf8'
                  ] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                  className="rounded-full overflow-hidden shadow-2xl border-4 border-white"
                  style={{ 
                    width: isMobile ? '220px' : '260px', 
                    height: isMobile ? '220px' : '260px',
                    minWidth: '180px', 
                    minHeight: '180px', 
                    background: 'white' 
                  }}
                >
                  <img 
                    src={homeData.doctorImage || "/dr.JPG"} 
                    alt="د. معاذ أشرف"
                    className="w-full h-full object-cover rounded-full animate-fadeInUp"
                    style={{ animationDuration: '1.2s' }}
                    loading="lazy"
                  />
                </motion.div>
                {/* نجوم متحركة حول الصورة */}
                {[...Array(isMobile ? 4 : 6)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute"
                    style={{
                      left: `${18 + i * (isMobile ? 15 : 12)}%`,
                      top: `${i % 2 === 0 ? 10 : 85}%`,
                      zIndex: 2
                    }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.7, 1.2, 0.7] }}
                    transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, delay: i * 0.5 }}
                  >
                    <svg width={isMobile ? 12 : 16} height={isMobile ? 12 : 16} viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="2" fill="#bae6fd"/>
                      <circle cx="8" cy="8" r="4" stroke="#38bdf8" strokeWidth="1" opacity="0.5"/>
                    </svg>
                  </motion.span>
                ))}
              </div>
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100">
                <FaSmile className="text-3xl md:text-4xl text-dental-blue" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-dental-blue via-sky-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg" style={{fontFamily: 'Cairo, Tajawal, "Noto Kufi Arabic", Arial, sans-serif', letterSpacing: '0.01em'}}>د. معاذ أشرف</span>
                </span>
                <motion.span
                  initial={{ y: 0 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block"
                >
                  <svg width={isMobile ? 32 : 38} height={isMobile ? 32 : 38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="19" cy="19" rx="15" ry="15" fill="#f9fafb" stroke="#38bdf8" strokeWidth="2"/>
                    <path d="M19 10C21.5 10 23.5 12.5 23.5 15.5C23.5 18.5 21.5 21 19 21C16.5 21 14.5 18.5 14.5 15.5C14.5 12.5 16.5 10 19 10Z" fill="#38bdf8"/>
                    <ellipse cx="19" cy="28" rx="6" ry="2.5" fill="#bae6fd"/>
                  </svg>
                </motion.span>
              </h2>
              <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6 leading-relaxed">
                {homeData.doctorBio || 'طبيب أسنان متخصص مع أكثر من 15 عامًا من الخبرة في مجال طب الأسنان التجميلي والعلاجي. حاصل على شهادات عالمية في زراعة الأسنان وتقويم الأسنان من أفضل الجامعات الأوروبية والأمريكية.'}
              </p>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
                نؤمن بأن كل مريض يستحق أفضل رعاية طبية، ولذلك نستخدم أحدث التقنيات والمعدات 
                الطبية لضمان حصولك على أفضل النتائج في بيئة مريحة وآمنة.
              </p>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
                  viewport={{ once: true }}
                  className="relative bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl text-center border border-blue-100 overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-dental-blue/20 to-cyan-400/10 rounded-full blur-2xl group-hover:blur-md transition-all duration-300"></div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-dental-blue drop-shadow-lg animate-pulse">{homeData.experienceYears || '15+'}</h3>
                  <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base font-medium tracking-wide">سنة خبرة</p>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: [0.8, 1.1, 0.95, 1], opacity: [0.5, 1, 0.7, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-1 right-1 md:bottom-2 md:right-2"
                  >
                    <svg width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="4" fill="#bae6fd"/>
                      <circle cx="11" cy="11" r="8" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4"/>
                    </svg>
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2, type: 'spring', bounce: 0.4 }}
                  viewport={{ once: true }}
                  className="relative bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl text-center border border-blue-100 overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-cyan-400/20 to-dental-blue/10 rounded-full blur-2xl group-hover:blur-md transition-all duration-300"></div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-dental-blue drop-shadow-lg animate-pulse">{homeData.happyPatients || '5000+'}</h3>
                  <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base font-medium tracking-wide">مريض سعيد</p>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: [0.8, 1.1, 0.95, 1], opacity: [0.5, 1, 0.7, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-1 left-1 md:bottom-2 md:left-2"
                  >
                    <svg width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="4" fill="#bae6fd"/>
                      <circle cx="11" cy="11" r="8" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4"/>
                    </svg>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-white via-blue-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 md:w-64 md:h-64 bg-gradient-to-tr from-dental-blue/10 to-cyan-400/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{filter:'blur(60px)', top:'-80px', left:'-80px'}}></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-br from-cyan-400/10 to-dental-blue/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{filter:'blur(60px)', bottom:'-80px', right:'-80px'}}></div>
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-dental-blue via-sky-400 to-cyan-400 drop-shadow-lg mb-3 md:mb-4 animate-gradient-x">خدماتنا المتميزة</h2>
            <div className="w-20 h-1 md:w-24 md:h-1 bg-gradient-to-r from-dental-blue via-sky-400 to-cyan-400 mx-auto mb-4 md:mb-6 rounded-full animate-pulse"></div>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-medium">نقدم مجموعة شاملة من خدمات طب الأسنان باستخدام أحدث التقنيات العالمية</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.12, type: 'spring', bounce: 0.35 }}
                viewport={{ once: true }}
              >
                <Card className="relative group bg-white/90 hover:bg-gradient-to-br from-dental-blue/10 to-cyan-400/10 border-0 shadow-lg md:shadow-xl hover:shadow-2xl rounded-xl md:rounded-2xl p-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-dental-blue/10 to-cyan-400/10 rounded-full blur-2xl group-hover:blur-md transition-all duration-300"></div>
                  <CardContent className="p-6 md:p-8 lg:p-10 text-center flex flex-col items-center">
                    <div className="bg-gradient-to-tr from-dental-blue/20 to-cyan-400/10 p-4 md:p-5 lg:p-6 rounded-full mb-4 md:mb-5 lg:mb-7 shadow-md animate-bounce-slow">
                      {service.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-dental-blue mb-2 md:mb-3 drop-shadow-md group-hover:text-cyan-600 transition-all duration-200">
                      {service.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 md:mb-5 lg:mb-7 font-medium">
                      {service.description}
                    </p>
                    <Link to="/services" className="inline-block mt-auto px-4 py-2 md:px-6 md:py-2 rounded-full bg-dental-blue text-white font-semibold shadow-md hover:scale-105 transition-all duration-200 text-sm md:text-base">
                      المزيد من التفاصيل
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12 md:mt-16"
          >
            <Link to="/services">
              <Button className="bg-gradient-to-r from-dental-blue via-sky-400 to-cyan-400 hover:from-sky-400 hover:to-dental-blue text-white px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl rounded-full shadow-xl hover:shadow-2xl transition-all font-bold animate-pulse">
                اكتشف جميع خدماتنا
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-dental-blue via-sky-400 to-cyan-400 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-tr from-white/10 to-cyan-400/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{filter:'blur(60px)', top:'-90px', left:'-90px'}}></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-br from-cyan-400/10 to-white/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{filter:'blur(60px)', bottom:'-100px', right:'-100px'}}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-white/10 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center gap-6"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-200 to-dental-blue drop-shadow-lg animate-gradient-x">
              احجز موعدك اليوم وابدأ رحلة ابتسامتك الجديدة
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-4 md:mb-6 max-w-xl mx-auto">
              فريقنا المتخصص جاهز لخدمتك وتقديم أفضل رعاية طبية باستخدام أحدث التقنيات في طب الأسنان.
            </p>
            <Link to="/appointment">
              <Button className="bg-white text-dental-blue font-bold px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl rounded-full shadow-xl hover:bg-dental-blue hover:text-white transition-all animate-pulse">
                احجز موعدك الآن
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer or any additional sections can go here */}
    </div>
  );
};

export default Home;