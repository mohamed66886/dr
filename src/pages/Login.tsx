import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { setAdminAuthenticated } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" })
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError("");

    // تحقق من بيانات الأدمن
    if (data.email === "rashad@rashad.com" && data.password === "123456") {
      setIsLoading(false);
      setAdminAuthenticated(true);
      setLoginSuccess(true);
      // حفظ بيانات الأدمن في localStorage
      localStorage.setItem("currentUser", JSON.stringify({
        name: "الأدمن",
        email: data.email,
        role: "admin",
        allowedPages: [
          "dashboard",
          "appointments",
          "users",
          "services",
          "settings",
          "expenses-direct",
          "expenses-report",
          "reports"
        ]
      }));
      setTimeout(() => {
        window.location.href = "/admin/Dashboard";
      }, 1500);
      return;
    }

    // تحقق من بيانات المستخدم من قاعدة البيانات
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", data.email), where("password", "==", data.password));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setIsLoading(false);
        setLoginSuccess(true);
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem("currentUser", JSON.stringify({
          name: userData.name || "مستخدم",
          email: userData.email,
          role: "user",
          allowedPages: userData.allowedPages || ["appointments"]
        }));
        setTimeout(() => {
          window.location.href = "/admin/appointments";
        }, 1500);
        return;
      }
    } catch (error) {
      setIsLoading(false);
      setLoginError("حدث خطأ أثناء الاتصال بقاعدة البيانات");
      return;
    }

    // إذا كانت البيانات غير صحيحة
    setIsLoading(false);
    setLoginError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6 relative overflow-hidden"
      >
        {/* Success overlay */}
        <AnimatePresence>
          {loginSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-500/10 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-white p-6 rounded-lg shadow-lg text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.6 }}
                  className="text-green-500 text-5xl mb-4"
                >
                  ✓
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800">تم تسجيل الدخول بنجاح!</h3>
                <p className="text-gray-600 mt-2">جاري تحويلك إلى لوحة التحكم...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-center mb-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-1">تسجيل الدخول</h2>
          <p className="text-center text-gray-500">أدخل بياناتك للوصول إلى حسابك</p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block mb-2 text-right font-medium text-gray-700">البريد الإلكتروني</label>
              <Input 
                type="email" 
                {...form.register("email")}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${form.formState.errors.email ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}`}
                placeholder="example@email.com" 
                dir="ltr"
              />
              {form.formState.errors.email && (
                <motion.span 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 block mt-1 text-right"
                >
                  {form.formState.errors.email.message}
                </motion.span>
              )}
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-2">
                <label className="block text-right font-medium text-gray-700">كلمة المرور</label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">نسيت كلمة المرور؟</a>
              </div>
              <Input 
                type="password" 
                {...form.register("password")}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${form.formState.errors.password ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}`}
                placeholder="••••••••" 
                dir="ltr"
              />
              {form.formState.errors.password && (
                <motion.span 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 block mt-1 text-right"
                >
                  {form.formState.errors.password.message}
                </motion.span>
              )}
            </motion.div>

            {/* Remember me checkbox */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-end"
            >
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-700">
                تذكرني
              </label>
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </motion.div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-red-600 font-bold mt-2"
              >
                {loginError}
              </motion.div>
            )}
          </form>
        </Form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-gray-500"
        >
          ليس لديك حساب؟{" "}
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
            سجل الآن
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}