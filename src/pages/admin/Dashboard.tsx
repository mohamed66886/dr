import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChartContainer } from '@/components/ui/chart';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { FiUsers, FiDollarSign, FiCheckCircle, FiTrendingUp, FiSearch, FiCalendar, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Update {
  id: string;
  type: string;
  name: string;
  date: string;
  status: string;
  service: string;
  price?: number;
}

interface ChartDatum {
  name: string;
  الإيرادات: number;
  المصروفات: number;
}

interface ServiceStat {
  service: string;
  count: number;
  revenue: number;
}

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [recentUpdates, setRecentUpdates] = useState<Update[]>([]);
  const [search, setSearch] = useState('');
  const [chartData, setChartData] = useState<ChartDatum[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [barChartFilter, setBarChartFilter] = useState('6months');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users count
        const usersSnap = await getDocs(collection(db, 'users'));
        setUserCount(usersSnap.size);

        // جلب سعر الكشف من إعدادات العيادة
        let visitPrice = 0;
        try {
          const settingsRef = collection(db, 'config');
          const settingsSnap = await getDocs(settingsRef);
          settingsSnap.forEach(doc => {
            const data = doc.data();
            if (doc.id === 'clinicSettings' && data.price) {
              visitPrice = parseFloat(data.price) || 0;
            }
          });
        } catch (e) { /* ignore */ }

        // Fetch appointments and calculate metrics
        const appointmentsSnap = await getDocs(collection(db, 'appointments'));
        let done = 0;
        let totalRevenue = 0;
        const updates: Update[] = [];
        const servicesMap = new Map<string, { count: number, revenue: number }>();
        // Prepare months for the last 6 months, this year, and last year
        const monthsMap = new Map<string, { revenue: number, expenses: number }>();
        const now = new Date();
        let monthsRange: { key: string, name: string }[] = [];
        if (barChartFilter === '6months') {
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            monthsMap.set(key, { revenue: 0, expenses: 0 });
            monthsRange.push({ key, name: d.toLocaleString('ar-EG', { month: 'long' }) });
          }
        } else if (barChartFilter === 'year') {
          for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), i, 1);
            const key = `${d.getFullYear()}-${i + 1}`;
            monthsMap.set(key, { revenue: 0, expenses: 0 });
            monthsRange.push({ key, name: d.toLocaleString('ar-EG', { month: 'long' }) });
          }
        } else if (barChartFilter === 'lastyear') {
          for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear() - 1, i, 1);
            const key = `${d.getFullYear()}-${i + 1}`;
            monthsMap.set(key, { revenue: 0, expenses: 0 });
            monthsRange.push({ key, name: d.toLocaleString('ar-EG', { month: 'long' }) });
          }
        }

        appointmentsSnap.forEach(doc => {
          const d = doc.data();
          const updateItem: Update = {
            id: doc.id,
            type: 'appointment',
            name: d.name || 'غير معروف',
            date: d.date || '--',
            status: d.status || 'pending',
            service: d.service || 'غير محدد',
            price: d.price || visitPrice
          };
          updates.push(updateItem);

          // Only count done and confirmed appointments for revenue
          if (d.status === 'done' || d.status === 'confirmed') {
            const price = d.price ? Number(d.price) : 0;
            totalRevenue += price;
            if (d.status === 'done') done++;
            // Track service stats
            const serviceName = d.service || 'غير محدد';
            if (servicesMap.has(serviceName)) {
              const current = servicesMap.get(serviceName)!;
              servicesMap.set(serviceName, {
                count: current.count + 1,
                revenue: current.revenue + price
              });
            } else {
              servicesMap.set(serviceName, {
                count: 1,
                revenue: price
              });
            }
            // Track by month
            if (d.date) {
              const dateObj = new Date(d.date);
              const key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;
              if (monthsMap.has(key)) {
                const m = monthsMap.get(key)!;
                monthsMap.set(key, { ...m, revenue: m.revenue + price });
              }
            }
          }
        });

        setCompletedBookings(done);
        setRevenue(totalRevenue);
        setRecentUpdates(updates.slice(-5).reverse());

        // Convert service stats to array and sort
        const servicesArray = Array.from(servicesMap.entries()).map(([service, stats]) => ({
          service,
          ...stats
        })).sort((a, b) => b.revenue - a.revenue);
        setServiceStats(servicesArray);

        // Fetch expenses and map to months
        const expensesSnap = await getDocs(collection(db, 'expenses'));
        let totalExpenses = 0;
        expensesSnap.forEach(doc => {
          const d = doc.data();
          const amount = Number(d.amount) || 0;
          totalExpenses += amount;
          if (d.date) {
            const dateObj = new Date(d.date);
            const key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;
            if (monthsMap.has(key)) {
              const m = monthsMap.get(key)!;
              monthsMap.set(key, { ...m, expenses: m.expenses + amount });
            }
          }
        });
        setExpenses(totalExpenses);

        // Prepare chart data for selected range
        const monthsData: ChartDatum[] = monthsRange.map(({ key, name }) => {
          const m = monthsMap.get(key) || { revenue: 0, expenses: 0 };
          return { name, الإيرادات: m.revenue, المصروفات: m.expenses };
        });
        setChartData(monthsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [barChartFilter]);

  // Protect route for regular users
  React.useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "user" && !window.location.pathname.includes("/admin/appointments")) {
          window.location.href = "/admin/appointments";
        }
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Chart configurations
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true
      },
      title: {
        display: true,
        text: 'الإيرادات والمصروفات الشهرية',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  };

  const barChartData = {
    labels: chartData.map(d => d.name),
    datasets: [
      {
        label: 'الإيرادات',
        data: chartData.map(d => d.الإيرادات),
        backgroundColor: '#3b82f6', // أزرق
        borderRadius: 6
      },
      {
        label: 'المصروفات',
        data: chartData.map(d => d.المصروفات),
        backgroundColor: '#ef4444', // أحمر
        borderRadius: 6
      }
    ]
  };

  const pieChartData = {
    labels: serviceStats.map(s => s.service),
    datasets: [
      {
        label: 'عدد الحجوزات',
        data: serviceStats.map(s => s.count),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#6366f1',
          '#ec4899',
          '#14b8a6'
        ],
        borderWidth: 0
        
      }
    ]
  };

  const profitChartData = {
    labels: chartData.map(d => d.name),
    datasets: [
      {
        label: 'الأرباح',
        data: chartData.map(d => d.الإيرادات - d.المصروفات),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        tension: 0.3
      }
    ]
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex w-full items-center justify-center h-screen">
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-full h-12 border-4 border-dental-blue border-t-transparent rounded-full"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div
        className="p-1 sm:p-3 md:p-8 w-full max-w-full mx-auto space-y-2 sm:space-y-6 md:space-y-8 overflow-x-hidden"
        style={{ width: '100%', maxWidth: '100vw', minWidth: '380px' }}
      >
        {/* Header with Search */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4"
        >
          <div>
            <h1 className="text-base sm:text-2xl md:text-3xl font-bold text-dental-blue">لوحة التحكم</h1>
            <p className="text-gray-500 mt-1 text-[11px] sm:text-base">نظرة عامة على أداء العيادة</p>
          </div>
          <div className="flex-1 flex justify-end w-full md:w-auto">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative w-full max-w-xs"
            >
              <Input
                placeholder="بحث في المستخدمين أو الحجوزات..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pr-10 text-[11px] sm:text-sm"
              />
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="flex items-start p-6">
                <div className="p-3 rounded-full bg-blue-50 text-dental-blue mr-4">
                  <FiUsers className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">المستخدمين</p>
                  <h3 className="text-2xl font-bold mt-1">{userCount}</h3>
                  <p className="text-green-600 text-xs mt-1 flex items-center">
                    <FiTrendingUp className="ml-1" /> +12% عن الشهر الماضي
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow border-2 border-blue-400/70 shadow-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-blue-100">
              <CardContent className="flex items-start p-6">
                <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4 border border-blue-200 shadow-sm">
                  <FiDollarSign className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">إجمالي الإيرادات</p>
                  <h3 className="text-2xl font-bold mt-1 text-blue-700">{revenue.toLocaleString()} ج.م</h3>
                  <p className="text-blue-600 text-xs mt-1 flex items-center">
                    <FiTrendingUp className="ml-1" /> +18% عن الشهر الماضي
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="flex items-start p-6">
                <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mr-4">
                  <FiCheckCircle className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">الحجوزات المكتملة</p>
                  <h3 className="text-2xl font-bold mt-1">{completedBookings}</h3>
                  <p className="text-green-600 text-xs mt-1 flex items-center">
                    <FiTrendingUp className="ml-1" /> +8% عن الشهر الماضي
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="flex items-start p-6">
                <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4">
                  <FiTrendingUp className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">إجمالي المصروفات</p>
                  <h3 className="text-2xl font-bold mt-1">{expenses.toLocaleString()} ج.م</h3>
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <FiTrendingUp className="ml-1 transform rotate-180" /> -5% عن الشهر الماضي
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-md p-2 sm:p-3 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <FiActivity className="ml-2" /> الإيرادات والمصروفات
              </h2>
              <select
                className="text-sm border rounded px-3 py-1 bg-gray-50"
                value={barChartFilter}
                onChange={e => setBarChartFilter(e.target.value)}
              >
                <option value="6months">آخر 6 شهور</option>
                <option value="year">هذا العام</option>
                <option value="lastyear">العام الماضي</option>
              </select>
            </div>
            <div className="h-64 sm:h-80">
              <Bar options={barChartOptions} data={barChartData} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-2 sm:p-3 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <FiCalendar className="ml-2" /> توزيع الخدمات
              </h2>
              <select className="text-sm border rounded px-3 py-1 bg-gray-50">
                <option>هذا الشهر</option>
                <option>هذا العام</option>
              </select>
            </div>
            <div className="h-64 sm:h-80">
              <Pie data={pieChartData} options={{
                plugins: {
                  legend: {
                    position: 'right',
                    rtl: true,
                    labels: {
                      usePointStyle: true,
                      padding: 20
                    }
                  }
                }
              }} />
            </div>
          </motion.div>
        </div>

        {/* Profit Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-2 sm:p-3 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FiTrendingUp className="ml-2" /> الأرباح الشهرية
            </h2>
            <select className="text-sm border rounded px-3 py-1 bg-gray-50">
              <option>آخر 6 شهور</option>
              <option>هذا العام</option>
            </select>
          </div>
          <div className="h-64 sm:h-80">
            <Bar options={{
              ...barChartOptions,
              plugins: {
                ...barChartOptions.plugins,
                title: {
                  ...barChartOptions.plugins.title,
                  text: 'الأرباح الشهرية'
                }
              }
            }} data={profitChartData} />
          </div>
        </motion.div>

        {/* Recent Updates */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-x-auto"
        >
          <div className="p-2 sm:p-3 md:p-6 border-b">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">آخر التعديلات</h2>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-[500px] sm:min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخدمة</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {recentUpdates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-400">لا توجد تعديلات حديثة</td>
                    </tr>
                  ) : (
                    recentUpdates.filter(u => !search || (u.name && u.name.includes(search))).map((u, i) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.service}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.price ? `${u.price.toLocaleString()} ج.م` : '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.status === 'done' ? 'bg-emerald-100 text-emerald-800' :
                            u.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {u.status === 'done' ? 'مكتمل' : u.status === 'pending' ? 'معلق' : 'ملغي'}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;