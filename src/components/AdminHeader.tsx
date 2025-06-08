import { FiUser, FiLogOut } from 'react-icons/fi';
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
      // Here you would typically call your logout API
      // await authService.logout();
      
      // Clear user data
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken");
      navigate('/login');
      toast({ title: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "فشل تسجيل الخروج", variant: "destructive" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-primary-600 shadow-sm w-full sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* زر الهامبرجر للموبايل */}
            {isMobile && (
              <SidebarTrigger className="text-white md:hidden mr-2" />
            )}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500">
              <FiUser className="text-white text-xl" />
            </div>
            <span className="text-lg font-semibold text-white truncate max-w-xs">
              {userName}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;