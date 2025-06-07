import { useState } from 'react';
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
  FaGift
} from 'react-icons/fa';
import { MdOutlineWork } from 'react-icons/md';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.service || !formData.date || !formData.time) {
      toast({
        title: "خطأ في البيانات",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Appointment data:', formData);
    
    toast({
      title: "تم إرسال طلبك بنجاح",
      description: "سيتم التواصل معك خلال 24 ساعة لتأكيد الموعد",
    });

    // Reset form
    setFormData({
      name: '',
      phone: '',
      service: '',
      date: '',
      time: '',
      notes: ''
    });
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
                      <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
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
                        <p className="text-gray-600">01551290902</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-dental-blue/10 p-3 rounded-full">
                        <FaEnvelope className="text-dental-blue text-xl" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">البريد الإلكتروني</p>
                        <p className="text-gray-600">Mohamed@gamil.com</p>

                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-dental-blue/10 p-3 rounded-full">
                        <FaMapMarkerAlt className="text-dental-blue text-xl" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">العنوان</p>
                        <p className="text-gray-600">دكرنس، الدقهلية</p>
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
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-800 font-medium">السبت - الأربعاء</span>
                        <span className="text-gray-600">9:00 ص - 9:00 م</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-800 font-medium">الخميس</span>
                        <span className="text-gray-600">9:00 ص - 6:00 م</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-800 font-medium">الجمعة</span>
                        <span className="text-gray-600">مغلق</span>
                      </div>
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

export default Appointment;