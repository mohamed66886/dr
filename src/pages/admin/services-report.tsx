import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  MdOutlineMedicalServices, 
  MdPrint, 
  MdSearch,
  MdOutlineFilterList,
  MdInfoOutline
} from 'react-icons/md';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

const ServicesReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const servicesSnap = await getDocs(collection(db, 'services'));
      const servicesList: any[] = [];
      servicesSnap.forEach(doc => {
        servicesList.push({ id: doc.id, ...doc.data() });
      });
      setServices(servicesList);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedServices = [...services].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredServices = sortedServices.filter(service =>
    service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-purple-50"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <MdOutlineMedicalServices className="text-3xl text-purple-600" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">تقرير الخدمات الطبية</h1>
                <p className="text-sm text-gray-500">قائمة كاملة بجميع الخدمات المتاحة في العيادة</p>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-all"
                onClick={fetchServices}
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                <span>تحديث</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow transition-all"
                onClick={() => window.print()}
              >
                <MdPrint />
                <span>طباعة التقرير</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Filters Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-md p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <MdSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن خدمة..."
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdOutlineFilterList className="text-lg" />
                <span>ترتيب حسب:</span>
                <select
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  value={sortConfig.key}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="title">اسم الخدمة</option>
                  <option value="price">السعر</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* Table Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                <MdOutlineMedicalServices />
                قائمة الخدمات
              </h2>
              <div className="text-sm text-gray-500">
                {filteredServices.length} خدمة
              </div>
            </div>

            {/* Table Content */}
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-2"></div>
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <MdInfoOutline className="text-2xl text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">لا توجد خدمات</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لم يتم العثور على خدمات مسجلة'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto print-overflow-visible">
                <table className="min-w-full divide-y divide-gray-200 print-table border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-purple-50 print:bg-white">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">#</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">اسم الخدمة</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">الوصف</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">السعر</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredServices.map((service, idx) => (
                      <tr key={service.id} className="hover:bg-purple-50">
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-bold text-purple-700 border-b border-gray-100">{service.title || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">{service.description || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-bold border-b border-gray-100">{service.price ? `${service.price.toLocaleString()} ج.م` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Summary Section */}
          {!loading && filteredServices.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 mt-6"
            >
              <h3 className="text-lg font-bold text-gray-700 mb-4">ملخص الخدمات</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">إجمالي الخدمات</p>
                  <p className="text-2xl font-bold text-gray-800">{filteredServices.length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">أعلى سعر</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.max(...filteredServices.map(s => s.price || 0)).toLocaleString()} ج.م
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">متوسط السعر</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredServices.length > 0 
                      ? (filteredServices.reduce((sum, s) => sum + (s.price || 0), 0) / filteredServices.length).toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : 0} ج.م
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-table, .print-table * { visibility: visible !important; }
          .print-table { position: absolute; left: 0; top: 0; width: 100% !important; background: white !important; box-shadow: none !important; border-radius: 0 !important; }
          .print-table th, .print-table td { background: white !important; color: #222 !important; }
          .print-table thead { background: #f3e8ff !important; }
          .print-table tr { box-shadow: none !important; }
          .print-hidden { display: none !important; }
        }
      `}</style>
    </AdminLayout>
  );
};

export default ServicesReportPage;