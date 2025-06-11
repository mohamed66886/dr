import React from "react";
import { FaTooth } from "react-icons/fa";
import { motion } from "framer-motion";

const DentalLoader: React.FC = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm dark:bg-gray-900/90">
    {/* Animated tooth icon with pulse effect */}
    <div className="relative">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="text-dental-blue dark:text-dental-lightBlue"
      >
        <FaTooth className="text-5xl" />
      </motion.div>
      
      {/* Pulsing circle animation */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dental-blue/30 dark:border-dental-lightBlue/30"
        animate={{
          scale: [1, 1.5, 2],
          opacity: [0.5, 0.3, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeOut",
          repeat: Infinity,
        }}
      />
    </div>
    
    {/* Text with fade animation */}
    <motion.p
      className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300"
      animate={{
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    >
      جاري تحميل عيادة د. معاذ اشرف ...
    </motion.p>

    

    {/* Subtle progress indicator */}
    <div className="w-40 h-1 mt-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-dental-blue dark:bg-dental-lightBlue"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  </div>
);

export default DentalLoader;