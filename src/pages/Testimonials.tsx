import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FaStar, FaPlay, FaUser, FaCalendarAlt, FaThumbsUp, FaClock } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

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

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'أحمد م.',
      rating: 5,
      text: 'تجربة رائعة مع د. أحمد العليمي. زراعة الأسنان كانت بدون ألم والنتيجة أكثر من ممتاز. أنصح بشدة!',
      service: 'زراعة الأسنان',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      name: 'فاطمة ع.',
      rating: 5,
      text: 'الدكتور محترف جداً وطاقمه ممتاز. حصلت على تبييض أسنان رائع وأصبحت أبتسم بثقة أكبر.',
      service: 'تبييض الأسنان',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      id: 3,
      name: 'محمد س.',
      rating: 5,
      text: 'عيادة نظيفة جداً وخدمة راقية. الدكتور صبور ويشرح كل شيء بوضوح. تقويم أسناني كان ناجح جداً.',
      service: 'تقويم الأسنان',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
      id: 4,
      name: 'نورا ح.',
      rating: 5,
      text: 'كنت خائفة من طبيب الأسنان لكن د. أحمد جعلني مرتاحة تماماً. العلاج كان سريع وبدون ألم.',
      service: 'علاج الجذور',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 5,
      name: 'خالد ب.',
      rating: 5,
      text: 'أفضل عيادة أسنان جربتها. التعامل احترافي والنتائج ممتازة. شكراً د. أحمد على الخدمة الرائعة.',
      service: 'تنظيف الأسنان',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
      id: 6,
      name: 'مريم ي.',
      rating: 5,
      text: 'الحشوات التجميلية كانت في غاية الدقة والجودة. لا يمكن ملاحظتها أبداً. عمل فني رائع!',
      service: 'حشوات تجميلية',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
    },
    {
      id: 7,
      name: 'سامي ر.',
      rating: 5,
      text: 'موظفو الاستقبال والممرضات كلهم رائعون. العيادة حديثة والمعدات متطورة. تجربة استثنائية.',
      service: 'فحص شامل',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
    },
    {
      id: 8,
      name: 'ليلى ت.',
      rating: 5,
      text: 'د. أحمد حل مشكلة أسناني التي عانيت منها لسنوات. الآن أكل براحة تامة. جزاه الله خير.',
      service: 'زراعة الأسنان',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar 
        key={index}
        className={`text-lg ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
      />
    ));
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
            آراء مرضانا
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
          >
            اكتشف تجارب مرضانا الذين حصلوا على ابتسامة أحلامهم في عيادة د. محمد رشاد
          </motion.p>
        </div>
      </motion.section>

      {/* Statistics Section with Animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: '5000+', label: 'مريض سعيد', icon: <FaUser className="text-dental-blue text-2xl mx-auto mb-2" /> },
              { value: '15+', label: 'سنة خبرة', icon: <FaCalendarAlt className="text-dental-blue text-2xl mx-auto mb-2" /> },
              { value: '98%', label: 'نسبة الرضا', icon: <FaThumbsUp className="text-dental-blue text-2xl mx-auto mb-2" /> },
              { value: '24/7', label: 'خدمة الطوارئ', icon: <FaClock className="text-dental-blue text-2xl mx-auto mb-2" /> }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {stat.icon}
                <h3 className="text-3xl font-bold text-dental-blue mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Grid with Animation */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">ماذا يقول مرضانا</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              شهادات حقيقية من مرضى حصلوا على أفضل رعاية طبية
            </p>
          </motion.div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial) => (
              <motion.div 
                key={testimonial.id}
                variants={item}
                whileHover={{ y: -5 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-dental-blue/20"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                          <div className="flex">
                            {renderStars(testimonial.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-dental-blue font-medium">{testimonial.service}</p>
                      </div>
                    </div>
                    
                    <blockquote className="text-gray-600 leading-relaxed relative pl-4 border-r-2 border-dental-blue/20">
                      "{testimonial.text}"
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Video Testimonials Section with Animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-gradient-to-br from-dental-blue/10 to-dental-teal/10"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">شهادات فيديو</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              استمع لتجارب مرضانا بأصواتهم
            </p>
          </motion.div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* فيديوهات حقيقية */}
            <motion.div 
              variants={item}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative group">
                  <iframe
                    width="100%"
                    height="250"
                    src="https://www.youtube.com/embed/2Vv-BfVoq4g"
                    title="شهادة مريض 1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-48 md:h-56 object-cover"
                  ></iframe>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">شهادة المريض 1</h3>
                  <p className="text-sm text-gray-600">تجربة علاج ناجحة</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div 
              variants={item}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative group">
                  <iframe
                    width="100%"
                    height="250"
                    src="https://www.youtube.com/embed/1w7OgIMMRc4"
                    title="شهادة مريض 2"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-48 md:h-56 object-cover"
                  ></iframe>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">شهادة المريض 2</h3>
                  <p className="text-sm text-gray-600">تجربة علاج ناجحة</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div 
              variants={item}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative group">
                  <iframe
                    width="100%"
                    height="250"
                    src="https://www.youtube.com/embed/3JZ_D3ELwOQ"
                    title="شهادة مريض 3"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-48 md:h-56 object-cover"
                  ></iframe>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">شهادة المريض 3</h3>
                  <p className="text-sm text-gray-600">تجربة علاج ناجحة</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section with Animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-gradient-to-r from-dental-blue to-dental-teal text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            هل تريد أن تكون التالي؟
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto"
          >
            انضم إلى آلاف المرضى السعداء واحصل على ابتسامة أحلامك
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col md:flex-row justify-center gap-4"
          >
            <motion.a 
              href="/appointment" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-white text-dental-blue hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                احجز موعدك الآن
              </Button>
            </motion.a>
            <motion.a 
              href="/contact" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" className="border-white border-2 text-white hover:bg-white hover:text-dental-blue px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                استشارة مجانية
              </Button>
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Testimonials;