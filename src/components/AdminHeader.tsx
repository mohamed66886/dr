import { FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const getUserData = () => {
      try {
        const user = localStorage.getItem("currentUser");
        const defaultName = "الأدمن";
        
        if (!user) {
          setUserName(defaultName);
          return;
        }

        const parsed = JSON.parse(user);
        setUserName(parsed.name || defaultName);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setUserName("الأدمن");
      }
    };

    getUserData();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken");
      // منع الرجوع للخلف بعد تسجيل الخروج
      window.location.replace('/login');
      toast({ title: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "فشل تسجيل الخروج", variant: "destructive" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-primary-600 shadow-md w-full sticky top-0 z-50">
      <div className="w-full max-w-full px-2 sm:px-6 py-2 sm:py-3 mx-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 sm:gap-4 rtl:flex-row-reverse">
            {/* زر الرجوع للموقع */}
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-blue-400 to-primary-500 shadow-lg border border-white/20 hover:scale-105 transition-transform"
              title="العودة للموقع"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-white text-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
            </button>
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-blue-400 to-primary-500 shadow-lg border border-white/20">
              <FiUser className="text-white text-xl sm:text-2xl" />
            </div>
            <span className="text-base sm:text-lg font-bold text-white truncate max-w-[120px] sm:max-w-xs drop-shadow-sm tracking-wide">
              {userName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 bg-white text-primary-600 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-200/60 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
              aria-label="تسجيل الخروج"
            >
              {isLoggingOut ? (
                <span className="animate-pulse">جاري التحميل...</span>
              ) : (
                <>
                  <FiLogOut className="text-lg" />
                  <span>تسجيل الخروج</span>
                </>
              )}
            </button>
            {/* زر الهامبرجر للموبايل بعد زر تسجيل الخروج */}
            {isMobile && (
              <SidebarTrigger className="text-white md:hidden mr-2 focus:outline-none focus:ring-2 focus:ring-blue-200/60">
                <FiMenu className="text-2xl" />
              </SidebarTrigger>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;