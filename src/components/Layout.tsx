import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAdminDashboard = location.pathname.startsWith('/admin');
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {!isLoginPage && !isAdminDashboard && <Header />}
      <main>{children}</main>
      {!isLoginPage && !isAdminDashboard && <Footer />}
      {!isLoginPage && !isAdminDashboard && <WhatsAppButton />}
    </div>
  );
};

export default Layout;
