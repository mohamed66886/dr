import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTooth } from 'react-icons/fa';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'الرئيسية' },
    { path: '/about', label: 'من نحن' },
    { path: '/services', label: 'خدماتنا' },
    { path: '/appointment', label: 'حجز موعد' },
    { path: '/testimonials', label: 'آراء المرضى' },
    { path: '/gallery', label: 'معرض الصور' },
    { path: '/contact', label: 'اتصل بنا' },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const mobileMenuVariants = {
    open: { 
      opacity: 1,
      height: "auto",
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    closed: { 
      opacity: 0,
      height: 0,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.header 
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-white/90 backdrop-blur-sm shadow-sm py-4'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo with animation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center space-x-2 space-x-reverse">
              <motion.div 
                className="w-12 h-12 relative flex items-center justify-center"
                whileHover={{ scale: 1.08, rotate: 6 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* خلفية متغيرة الألوان بتأثير احترافي */}
                <motion.span
                  className="absolute inset-0 rounded-full shadow-lg blur-sm"
                  animate={{
                    background: [
                      'linear-gradient(135deg, #0ea5e9 0%, #0f766e 100%)',
                      'linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%)',
                      'linear-gradient(135deg, #0ea5e9 0%, #0f766e 100%)'
                    ],
                    scale: [1, 1.12, 1],
                    rotate: [0, 10, -10, 0],
                    opacity: [0.85, 1, 0.85]
                  }}
                  transition={{
                    background: { duration: 8, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  style={{ zIndex: 1 }}
                />
                {/* دائرة خلفية إضافية */}
                <motion.span
                  className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.5, 0.7, 0.5]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  style={{ zIndex: 0 }}
                />
                <FaTooth className="text-white text-3xl relative z-10 drop-shadow-lg" />
              </motion.div>
              <div>
                <h1
                  className="text-[19px] md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark font-serif italic tracking-wider drop-shadow-lg"
                  style={{ fontFamily: 'Georgia, Times New Roman, serif', letterSpacing: '0.06em', lineHeight: 1.1 }}

                >
                  Dr. Mohamed Rashad
                </h1>
                <p className="text-sm text-gray-600">طبيب الأسنان</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden md:flex space-x-8 space-x-reverse"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {navItems.map((item) => (
              <motion.div key={item.path} variants={itemVariants}>
                <Link
                  to={item.path}
                  className={`relative text-gray-700 hover:text-primary transition-colors duration-200 font-medium px-2 py-1 ${
                    isActive(item.path) ? 'text-primary' : ''
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.span 
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          {/* CTA Button with animation */}
          <motion.div 
            className="hidden md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/appointment">
              <Button 
                className="relative bg-gradient-to-r from-primary to-primary-dark hover:from-primary/90 hover:to-primary-dark/90 text-white px-6 py-2 rounded-lg font-medium overflow-hidden group"
              >
                <span className="relative z-10">احجز موعدك الآن</span>
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%', opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </Button>
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {!isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation with animation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="md:hidden overflow-hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="py-4 border-t border-gray-100">
                {navItems.map((item) => (
                  <motion.div
                    key={item.path}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      className={`block py-3 px-4 text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors duration-200 rounded-lg mx-2 ${
                        isActive(item.path) ? 'text-primary bg-primary/10 font-medium' : ''
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div 
                  className="mt-4 px-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link to="/appointment" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary/90 hover:to-primary-dark/90 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-primary/20 transition-all">
                      احجز موعدك الآن
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;