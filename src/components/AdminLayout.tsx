import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarInset, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarTrigger } from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import { 
  FiHome, 
  FiCalendar, 
  FiSettings, 
  FiUsers, 
  FiPieChart, 
  FiDollarSign,
  FiFileText,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { MdOutlineMedicalServices } from 'react-icons/md';
import { IoMdAnalytics } from 'react-icons/io';
import { useClinicName } from '@/hooks/useClinicName';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminLinks = [
  { 
    to: '/admin/dashboard', 
    label: 'لوحة التحكم',
    icon: <FiHome className="text-lg" />,
    exact: true
  },
  { 
    to: '/admin/appointments', 
    label: 'المواعيد',
    icon: <FiCalendar className="text-lg" />
  },
  { 
    to: '/admin/services', 
    label: 'الخدمات',
    icon: <MdOutlineMedicalServices className="text-lg" />
  },
  {
    label: 'المصروفات',
    icon: <FiDollarSign className="text-lg" />,
    dropdown: [
      { 
        to: '/admin/expenses/direct', 

        label: 'اضافة مصروفات ',
        icon: <FiFileText className="text-sm" />
      },
      { 
        to: '/admin/expenses', 
        label: 'انواع المصروفات  ',
        icon: <FiFileText className="text-sm" />
      },
    ],
  },
  { 
    to: '/admin/users', 
    label: 'المستخدمين',
    icon: <FiUsers className="text-lg" />
  },
  { 
    to: '/admin/reports', 
    label: 'التقارير',
    icon: <IoMdAnalytics className="text-lg" />
  },
  { 
    to: '/admin/settings', 
    label: 'الإعدادات',
    icon: <FiSettings className="text-lg" />
  },
  {
    to : '/admin/financial-year',
    label: 'السنه المالية',
    icon: <FiPieChart className="text-lg" />



  },
  {
    to : '/admin/database',
    label: 'قاعد البيانات',
    icon: <FiFileText className="text-lg" />
    
  }
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const { clinicName } = useClinicName();

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isActiveLink = (to: string, exact = false) => {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-dental-blue flex-row-reverse" dir="rtl">
        {/* الشريط الجانبي */}
        <Sidebar className="border-l border-white/20 bg-dental-blue shadow-2xl text-white">
          <SidebarHeader className='bg-dental-blue'>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
              className="flex items-center justify-center py-6"
            >
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <MdOutlineMedicalServices className="text-3xl" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white drop-shadow-lg">
                  {clinicName || 'عيادة الأسنان'}
                </span>
              </div>
            </motion.div>
          </SidebarHeader>
          {/* زر فتح القائمة الجانبية للموبايل */}
          <div className="md:hidden flex justify-end px-4 pt-2">
            <SidebarTrigger className="text-white" />
          </div>
          
          <SidebarContent className='bg-dental-blue'>
            <SidebarMenu className="space-y-1">
              {adminLinks.map((link, index) => (
                <motion.div
                  key={link.to || link.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { 
                      delay: index * 0.05,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20
                    } 
                  }}
                  whileHover={{ x: -8, scale: 1.03, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="rounded-xl overflow-hidden"
                >
                  {link.dropdown ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={link.dropdown.some(sub => isActiveLink(sub.to))}
                        onClick={() => toggleSubmenu(link.label)}
                        className={`flex items-center justify-between px-5 py-3 hover:bg-white/15 transition-all rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200/60 group ${
                          openSubmenus[link.label] ? 'bg-white/10' : ''
                        } ${
                          link.dropdown.some(sub => isActiveLink(sub.to)) ? 'bg-gradient-to-l from-blue-200/20 to-white/10 font-bold text-blue-100' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`transition-colors ${link.dropdown.some(sub => isActiveLink(sub.to)) ? 'text-blue-300' : 'text-blue-100 group-hover:text-blue-200'}`}>{link.icon}</span>
                          <span className="font-medium text-base tracking-wide">{link.label}</span>
                        </div>
                        <motion.span
                          animate={{ rotate: openSubmenus[link.label] ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {openSubmenus[link.label] ? 
                            <FiChevronUp className="text-sm" /> : 
                            <FiChevronDown className="text-sm" />
                          }
                        </motion.span>
                      </SidebarMenuButton>
                      
                      <AnimatePresence>
                        {openSubmenus[link.label] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ 
                              height: 'auto', 
                              opacity: 1,
                              transition: {
                                height: { duration: 0.2 },
                                opacity: { duration: 0.15, delay: 0.05 }
                              }
                            }}
                            exit={{ 
                              height: 0, 
                              opacity: 0,
                              transition: {
                                height: { duration: 0.15 },
                                opacity: { duration: 0.1 }
                              }
                            }}
                            className="overflow-hidden"
                          >
                            <SidebarMenuSub className="mt-1 space-y-1">
                              {link.dropdown.map(sub => (
                                <SidebarMenuSubItem key={sub.to}>
                                  <Link to={sub.to}>
                                    <SidebarMenuSubButton 
                                      isActive={isActiveLink(sub.to)}
                                      className={`flex items-center gap-3 px-6 py-2.5 mx-2 hover:bg-white/10 transition-all rounded-lg ${
                                        isActiveLink(sub.to) ? 'bg-gradient-to-l from-blue-200/20 to-white/10 font-semibold text-blue-100' : ''
                                      }`}
                                    >
                                      <span className={`transition-colors ${isActiveLink(sub.to) ? 'text-blue-300' : 'text-blue-100'}`}>{sub.icon}</span>
                                      <span>{sub.label}</span>
                                    </SidebarMenuSubButton>
                                  </Link>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </SidebarMenuItem>
                  ) : (
                    <SidebarMenuItem>
                      <Link to={link.to}>
                        <SidebarMenuButton 
                          isActive={isActiveLink(link.to, link.exact)}
                          className={`flex items-center gap-3 px-5 py-3 hover:bg-white/15 transition-all rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200/60 group ${
                            isActiveLink(link.to, link.exact) ? 'bg-gradient-to-l from-blue-200/20 to-white/10 font-bold text-blue-100' : ''
                          }`}
                        >
                          <span className={`transition-colors ${isActiveLink(link.to, link.exact) ? 'text-blue-300' : 'text-blue-100 group-hover:text-blue-200'}`}>{link.icon}</span>
                          <span className="font-medium text-base tracking-wide">{link.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  )}
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* المحتوى الرئيسي */}
        <SidebarInset>
          <div className="h-screen flex flex-col overflow-hidden">
            {/* الهيدر */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 120 }}
              className="bg-dental-blue shadow-md"
            >
              <AdminHeader />
            </motion.div>
            
            {/* محتوى الصفحة */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 30 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { 
                  duration: 0.3,
                  type: 'spring',
                  stiffness: 150,
                  damping: 15
                } 
              }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6"
              
            >
              {children}
            </motion.div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};


export default AdminLayout;