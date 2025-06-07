import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FaGraduationCap, FaTrophy, FaFlask, FaUserMd, FaStar, FaShieldAlt, FaMicroscope, FaHeart } from 'react-icons/fa';

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

const About = () => {
  const achievements = [
    {
      icon: <FaGraduationCap className="text-4xl text-dental-blue" />,
      title: 'التعليم والشهادات',
      description: 'دكتوراه في طب الأسنان من جامعة الملك سعود، وشهادات تخصصية من الولايات المتحدة وأوروبا'
    },
    {
      icon: <FaTrophy className="text-4xl text-dental-blue" />,
      title: 'الجوائز والتقديرات',
      description: 'حاصل على عدة جوائز في مجال طب الأسنان التجميلي وزراعة الأسنان من الجمعيات المهنية'
    },
    {
      icon: <FaFlask className="text-4xl text-dental-blue" />,
      title: 'الأبحاث والمؤتمرات',
      description: 'مشارك في العديد من المؤتمرات العالمية ولديه أبحاث منشورة في مجلات طبية محكمة'
    },
    {
      icon: <FaUserMd className="text-4xl text-dental-blue" />,
      title: 'الخبرة العملية',
      description: 'أكثر من 15 عامًا من الخبرة في علاج آلاف المرضى وإجراء عمليات زراعة وتجميل الأسنان'
    }
  ];

  const values = [
    {
      icon: <FaStar className="text-3xl text-dental-blue" />,
      title: 'الجودة والتميز',
      description: 'نلتزم بتقديم أعلى مستويات الجودة في جميع خدماتنا الطبية'
    },
    {
      icon: <FaShieldAlt className="text-3xl text-dental-blue" />,
      title: 'الأمان والراحة',
      description: 'نوفر بيئة آمنة ومريحة لجميع مرضانا مع اتباع أعلى معايير التعقيم'
    },
    {
      icon: <FaMicroscope className="text-3xl text-dental-blue" />,
      title: 'التقنيات الحديثة',
      description: 'نستخدم أحدث التقنيات والمعدات الطبية لضمان أفضل النتائج'
    },
    {
      icon: <FaHeart className="text-3xl text-dental-blue" />,
      title: 'الرعاية الشخصية',
      description: 'نقدم رعاية شخصية مخصصة لكل مريض حسب احتياجاته الفردية'
    }
  ];

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
            من نحن
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
          >
            تعرف على د. أحمد العليمي وفريقه المتخصص في تقديم أفضل خدمات طب الأسنان
          </motion.p>
        </div>
      </motion.section>

      {/* Doctor's Story Section with Animation */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1622902046617-e3b2a2a587d1?q=80&w=600" 
                alt="د. أحمد العليمي في العيادة"
                className="rounded-xl shadow-2xl w-full transform transition-transform duration-500 hover:shadow-3xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">قصة د. محمد رشاد</h2>
              <p className="text-gray-600 mb-4 leading-relaxed text-lg">
                بدأت رحلتي في طب الأسنان منذ أكثر من 15 عامًا بحلم واحد: أن أساعد الناس على استعادة ثقتهم 
                بأنفسهم من خلال ابتسامة صحية وجميلة. تخرجت من كلية طب الأسنان بجامعة المنصورة بتقدير امتياز 
                مع مرتبة الشرف.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed text-lg">
                سافرت إلى الولايات المتحدة وأوروبا لأحصل على أفضل التدريبات في مجال زراعة الأسنان والطب 
                التجميلي. عدت إلى المملكة مسلحًا بأحدث المعارف والتقنيات لأخدم مجتمعي.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                اليوم، أفتخر بأنني ساعدت آلاف المرضى في الحصول على الابتسامة التي يحلمون بها، وأن عيادتي 
                أصبحت مكانًا يثق به الناس لعلاج أسنانهم.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Section with Animation */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">المؤهلات والإنجازات</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              خبرة واسعة ومؤهلات عالمية في طب الأسنان
            </p>
          </motion.div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {achievements.map((achievement, index) => (
              <motion.div 
                key={index}
                variants={item}
                whileHover={{ y: -5 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="bg-dental-blue/10 p-4 rounded-full">
                        {achievement.icon}
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">
                          {achievement.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission Section with Animation */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-dental-blue/5 to-dental-teal/5 p-8 rounded-xl"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center lg:text-right">رؤيتنا</h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 text-center lg:text-right">
                أن نكون الخيار الأول في المملكة العربية السعودية لطب الأسنان التجميلي والعلاجي، 
                وأن نساهم في رفع مستوى الوعي بأهمية صحة الأسنان في المجتمع.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-dental-teal/5 to-dental-blue/5 p-8 rounded-xl"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center lg:text-right">رسالتنا</h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 text-center lg:text-right">
                تقديم خدمات طبية متميزة في مجال طب الأسنان باستخدام أحدث التقنيات والمعدات، 
                مع التركيز على راحة المريض وتحقيق أفضل النتائج العلاجية والتجميلية.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section with Animation */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-dental-blue/10 to-dental-teal/10">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">قيمنا ومبادئنا</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              المبادئ التي نسير عليها في تقديم خدماتنا
            </p>
          </motion.div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => (
              <motion.div 
                key={index}
                variants={item}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="text-center border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    <div className="bg-dental-blue/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {value.description}
                    </p>
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

export default About;