import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FaTooth, 
  FaTeeth, 
  FaTeethOpen,
  FaCalendarAlt,
  FaStethoscope,
  FaFileMedical,
  FaUserMd
} from 'react-icons/fa';
import { MdOutlineCleaningServices, MdOutlineScience, MdOutlineCleaningServices as MdToothbrush } from 'react-icons/md'; // بدائل الأيقونات

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

// Helper to map icon name string to React element
const iconMap: Record<string, JSX.Element> = {
  FaTooth: <FaTooth className="text-3xl text-dental-blue" />,
  FaTeeth: <FaTeeth className="text-3xl text-dental-blue" />,
  FaTeethOpen: <FaTeethOpen className="text-3xl text-dental-blue" />,
  MdOutlineCleaningServices: <MdOutlineCleaningServices className="text-3xl text-dental-blue" />,
  MdToothbrush: <MdToothbrush className="text-3xl text-dental-blue" />,
  MdOutlineScience: <MdOutlineScience className="text-3xl text-dental-blue" />,
};

// Service type for fetched data
interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  features: string[];
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, 'services'));
      setServices(querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          icon: data.icon || '',
          features: Array.isArray(data.features) ? data.features : [],
        };
      }));
      setLoading(false);
    };
    fetchServices();
  }, []);

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
            خدماتنا الطبية
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
          >
            نقدم مجموعة شاملة من خدمات طب الأسنان العلاجية والتجميلية باستخدام أحدث التقنيات
          </motion.p>
        </div>
      </motion.section>

      {/* Services Grid with Staggered Animation */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-10 text-dental-blue font-bold text-xl">جاري التحميل...</div>
          ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service) => (
              <motion.div key={service.id} variants={item}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-2 h-full flex flex-col">
                  <div className="relative group">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dental-blue/60 to-dental-blue/20"></div>
                    <div className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg">
                      {iconMap[service.icon] || <FaTooth className="text-3xl text-dental-blue" />}
                    </div>
                  </div>
                  <CardContent className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">مميزات الخدمة:</h4>
                      <ul className="space-y-2">
                        {(service.features || []).map((feature: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-dental-blue mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          )}
        </div>
      </section>

      {/* Process Section with Icons */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">كيف نعمل</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              خطوات بسيطة للحصول على أفضل رعاية طبية
            </p>
          </motion.div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
          >
            {[
              { 
                title: 'احجز موعدك', 
                description: 'احجز موعدك بسهولة عبر الموقع أو الهاتف',
                icon: <FaCalendarAlt className="text-2xl" />
              },
              { 
                title: 'الفحص الأولي', 
                description: 'فحص شامل وتشخيص دقيق لحالتك',
                icon: <FaStethoscope className="text-2xl" />
              },
              { 
                title: 'خطة العلاج', 
                description: 'وضع خطة علاج مخصصة ومناقشة الخيارات',
                icon: <FaFileMedical className="text-2xl" />
              },
              { 
                title: 'العلاج والمتابعة', 
                description: 'تنفيذ العلاج ومتابعة النتائج',
                icon: <FaUserMd className="text-2xl" />
              }
            ].map((itemData, index) => (
              <motion.div 
                key={index} 
                variants={item}
                className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-dental-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {itemData.icon}
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{itemData.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{itemData.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section with Pulse Animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 md:py-20 bg-gradient-to-r from-dental-blue to-dental-teal text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            هل تحتاج إلى استشارة طبية؟
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            احجز موعدك اليوم واحصل على استشارة مجانية مع د. معاذ أشرف
          </p>
          <Link to="/appointment">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-white text-dental-blue hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                احجز موعدك الآن
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Services;