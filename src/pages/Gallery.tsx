import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FiX, FiZoomIn, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<{
    id: string;
    image: string;
    title?: string;
    description?: string;
    category?: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'gallery'));
        const imagesData = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            image: data.image || '',
            title: data.title || '',
            description: data.description || '',
            category: data.category || 'uncategorized'
          };
        });
        setGalleryImages(imagesData);
      } catch (error) {
        console.error("Error fetching images:", error);
        setGalleryImages([]);
      }
      setLoading(false);
    };
    fetchImages();
  }, []);

  // استخراج التصنيفات الفريدة من الصور
  const uniqueCategories = Array.from(new Set(galleryImages.map(img => img.category)));
  const categories = [
    { id: 'all', name: 'الكل', count: galleryImages.length },
    ...uniqueCategories.map(cat => ({
      id: cat,
      name: getCategoryName(cat),
      count: galleryImages.filter(img => img.category === cat).length
    }))
  ];

  function getCategoryName(cat: string) {
    const categoryNames: Record<string, string> = {
      'clinic': 'تصميم العيادة',
      'equipment': 'المعدات الطبية',
      'treatments': 'إجراءات العلاج',
      'results': 'نتائج المرضى',
      'team': 'فريق العمل',
      'uncategorized': 'أخرى'
    };
    return categoryNames[cat] || cat;
  }

  const filteredImages = activeFilter === 'all' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeFilter);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    if (direction === 'prev') {
      setSelectedImage(prev => 
        prev === 0 ? filteredImages.length - 1 : prev! - 1
      );
    } else {
      setSelectedImage(prev => 
        prev === filteredImages.length - 1 ? 0 : prev! + 1
      );
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateImage('next'),
    onSwipedRight: () => navigateImage('prev'),
    trackMouse: true
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-dental-blue/90 to-dental-teal/80 z-10"></div>
        <div className="absolute inset-0 bg-[url('/images/gallery-hero.jpg')] bg-cover bg-center z-0"></div>
        
        <div className="container mx-auto h-full flex flex-col justify-center relative z-20 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              معرض عيادتنا البصري
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              اكتشف عالم العناية بالأسنان من خلال عدستنا
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filter Tabs */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeFilter === category.id
                      ? 'bg-dental-blue text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.name}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeFilter === category.id 
                      ? 'bg-white/20' 
                      : 'bg-gray-100'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">لا توجد صور متاحة</div>
              <button 
                onClick={() => setActiveFilter('all')}
                className="text-dental-blue hover:underline"
              >
                عرض جميع الصور
              </button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => setSelectedImage(index)}
                >
                  <div className="aspect-square bg-gray-100">
                    <img 
                      src={image.image} 
                      alt={image.title || 'صورة المعرض'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-semibold text-lg line-clamp-1">
                        {image.title || 'بدون عنوان'}
                      </h3>
                      {image.category && (
                        <span className="inline-block px-2 py-1 mt-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm">
                          {getCategoryName(image.category)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute top-3 right-3 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FiZoomIn size={18} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 ${
              isFullscreen ? 'bg-black' : 'bg-black/90'
            }`}
            onClick={() => !isFullscreen && setSelectedImage(null)}
          >
            <div 
              className={`relative ${isFullscreen ? 'w-full h-full' : 'max-w-6xl max-h-[90vh]'}`}
              {...swipeHandlers}
            >
              {/* Navigation Arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full z-20 hover:bg-black/70 transition-colors"
              >
                <FiChevronLeft size={24} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full z-20 hover:bg-black/70 transition-colors"
              >
                <FiChevronRight size={24} />
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsFullscreen(false);
                  setSelectedImage(null);
                }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full z-20 hover:bg-black/70 transition-colors"
              >
                <FiX size={24} />
              </button>
              
              {/* Fullscreen Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(!isFullscreen);
                }}
                className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full z-20 hover:bg-black/70 transition-colors"
              >
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                )}
              </button>
              
              {/* Image Content */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full flex flex-col"
              >
                <div className={`flex-1 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
                  <img
                    src={filteredImages[selectedImage].image}
                    alt={filteredImages[selectedImage].title || 'صورة المعرض'}
                    className={`${isFullscreen ? 'object-contain' : 'object-cover'} w-full h-full rounded-lg`}
                  />
                </div>
                
                {!isFullscreen && (
                  <div className="bg-white p-4 rounded-b-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {filteredImages[selectedImage].title || 'بدون عنوان'}
                    </h3>
                    <p className="text-gray-600">
                      {filteredImages[selectedImage].description || 'لا يوجد وصف'}
                    </p>
                    {filteredImages[selectedImage].category && (
                      <div className="mt-3">
                        <span className="inline-block px-3 py-1 bg-dental-blue/10 text-dental-blue text-sm rounded-full">
                          {getCategoryName(filteredImages[selectedImage].category)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;