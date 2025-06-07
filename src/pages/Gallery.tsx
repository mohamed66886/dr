import React, { useState } from 'react';

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'clinic', name: 'العيادة' },
    { id: 'equipment', name: 'المعدات' },
    { id: 'treatments', name: 'العلاجات' },
    { id: 'results', name: 'النتائج' }
  ];

  const images = [
    {
      id: 1,
      category: 'clinic',
      title: 'غرفة الاستقبال',
      description: 'منطقة استقبال مريحة ومجهزة بأحدث التقنيات',
      image: '/api/placeholder/400/300'
    },
    {
      id: 2,
      category: 'clinic',
      title: 'غرفة العلاج الرئيسية',
      description: 'غرفة علاج مجهزة بأحدث المعدات الطبية',
      image: '/api/placeholder/400/300'
    },
    {
      id: 3,
      category: 'equipment',
      title: 'جهاز الأشعة الرقمي',
      description: 'أحدث أجهزة التصوير الرقمي للأسنان',
      image: '/api/placeholder/400/300'
    },
    {
      id: 4,
      category: 'equipment',
      title: 'جهاز التبييض بالليزر',
      description: 'تقنية متطورة لتبييض الأسنان بالليزر',
      image: '/api/placeholder/400/300'
    },
    {
      id: 5,
      category: 'treatments',
      title: 'جلسة تقويم',
      description: 'متابعة دورية لحالة تقويم الأسنان',
      image: '/api/placeholder/400/300'
    },
    {
      id: 6,
      category: 'treatments',
      title: 'عملية زراعة',
      description: 'إجراء زراعة أسنان بأحدث التقنيات',
      image: '/api/placeholder/400/300'
    },
    {
      id: 7,
      category: 'results',
      title: 'نتيجة تبييض',
      description: 'قبل وبعد عملية تبييض الأسنان',
      image: '/api/placeholder/400/300'
    },
    {
      id: 8,
      category: 'results',
      title: 'نتيجة تقويم',
      description: 'تحسن ملحوظ بعد انتهاء علاج التقويم',
      image: '/api/placeholder/400/300'
    }
  ];

  const filteredImages = activeFilter === 'all' 
    ? images 
    : images.filter(image => image.category === activeFilter);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-dental-lightBlue to-white">
        <div className="container-max section-padding">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-dental-darkGray mb-6 animate-fade-in">
              معرض الصور
            </h1>
            <p className="text-xl text-dental-darkGray max-w-3xl mx-auto leading-relaxed animate-fade-in">
              تجول في عيادتنا واطلع على أحدث المعدات والتقنيات التي نستخدمها
            </p>
          </div>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-12 bg-white">
        <div className="container-max section-padding">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeFilter === category.id
                    ? 'bg-dental-blue text-white shadow-lg transform scale-105'
                    : 'bg-dental-lightBlue text-dental-darkGray hover:bg-dental-blue/10'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-2xl shadow-lg card-hover animate-on-scroll cursor-pointer"
                onClick={() => setSelectedImage(index)}
              >
                {/* Placeholder for image */}
                <div className="w-full h-64 bg-gradient-to-br from-dental-blue/20 to-dental-blue/40 flex items-center justify-center">
                  <div className="text-center text-dental-blue">
                    <div className="w-16 h-16 bg-dental-blue/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">📷</span>
                    </div>
                    <p className="font-semibold">{image.title}</p>
                  </div>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                    <p className="text-sm opacity-90">{image.description}</p>
                  </div>
                </div>

                {/* Hover zoom effect */}
                <div className="absolute inset-0 bg-dental-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-4xl">🔍</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for image preview */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full bg-white rounded-2xl overflow-hidden animate-scale-in">
            <div className="relative">
              {/* Image placeholder */}
              <div className="w-full h-96 bg-gradient-to-br from-dental-blue/20 to-dental-blue/40 flex items-center justify-center">
                <div className="text-center text-dental-blue">
                  <div className="w-24 h-24 bg-dental-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📷</span>
                  </div>
                  <p className="text-xl font-semibold">{filteredImages[selectedImage].title}</p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors duration-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold text-dental-darkGray mb-2">
                {filteredImages[selectedImage].title}
              </h3>
              <p className="text-dental-darkGray leading-relaxed">
                {filteredImages[selectedImage].description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Before/After Section */}
      <section className="py-20 bg-dental-lightBlue">
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dental-darkGray mb-4">قبل وبعد</h2>
            <p className="text-xl text-dental-darkGray">شاهد التحولات المذهلة لمرضانا</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[1, 2].map((item) => (
              <div key={item} className="bg-white rounded-2xl p-8 shadow-lg animate-on-scroll">
                <h3 className="text-2xl font-bold text-dental-darkGray mb-6 text-center">
                  حالة تبييض رقم {item}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-dental-darkGray mb-3">قبل العلاج</h4>
                    <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">صورة قبل</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="font-semibold text-dental-darkGray mb-3">بعد العلاج</h4>
                    <div className="w-full h-40 bg-dental-lightBlue rounded-lg flex items-center justify-center">
                      <span className="text-dental-blue">صورة بعد</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-dental-darkGray leading-relaxed">
                    تحسن ملحوظ في لون الأسنان ونظافتها بعد جلسة تبييض واحدة باستخدام أحدث التقنيات
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-dental-darkGray mb-6">
            هل تريد نتائج مماثلة؟
          </h2>
          <p className="text-xl text-dental-darkGray mb-8 max-w-2xl mx-auto">
            احجز استشارتك المجانية الآن مع د. محمد رشاد واحصل على ابتسامة أحلامك
          </p>
          <a href="/appointment">
            <button className="btn-primary text-lg px-8 py-4">
              احجز استشارة مجانية
            </button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
