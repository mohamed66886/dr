import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiUserPlus, FiSave, FiX, FiUsers, FiUser, FiShield, FiCalendar } from 'react-icons/fi';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useForm } from "react-hook-form";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type User = {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<User>({
    defaultValues: { name: "", email: "", password: "", role: "user" }
  });

  // التحقق من المصادقة وجلب البيانات
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      window.location.href = "/login";
      return;
    }

    // جلب المستخدم الحالي (مثال - يجب استبداله بنظام المصادقة الخاص بك)
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        if (user.role === "user" && !window.location.pathname.includes("/admin/appointments")) {
          window.location.href = "/admin/appointments";
        }
      } catch {
        setCurrentUser(null);
      }
    }

    // جلب جميع المستخدمين
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        setUsers(snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "",
            email: data.email || "",
            password: data.password || "",
            role: data.role === "admin" ? "admin" : "user"
          };
        }));
      } catch (e) {
        setError("حدث خطأ أثناء جلب بيانات المستخدمين");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // إضافة مستخدم جديد
  const onAddUser = async (data: User) => {
    setError("");
    setSuccess("");
    try {
      const docRef = await addDoc(collection(db, "users"), data);
      setSuccess("تمت إضافة المستخدم بنجاح");
      setUsers(prev => [...prev, { ...data, id: docRef.id }]);
      reset();
    } catch (e) {
      setError("حدث خطأ أثناء إضافة المستخدم");
    }
  };

  // تعديل مستخدم
  const handleEdit = (user: User) => {
    setEditId(user.id!);
    setEditData({ name: user.name, email: user.email, role: user.role });
  };

  const handleEditSave = async (id: string) => {
    try {
      await updateDoc(doc(db, "users", id), editData);
      setUsers(users => users.map(u => u.id === id ? { ...u, ...editData } as User : u));
      setEditId(null);
      setSuccess("تم تعديل المستخدم بنجاح");
    } catch {
      setError("حدث خطأ أثناء التعديل");
    }
  };

  // حذف مستخدم
  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "users", deleteId));
      setUsers(users => users.filter(u => u.id !== deleteId));
      setSuccess("تم حذف المستخدم بنجاح");
    } catch {
      setError("حدث خطأ أثناء الحذف");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // إذا كان المستخدم عاديًا، عرض واجهة المواعيد فقط
  if (currentUser && currentUser.role === "user") {
    return (
      <AdminLayout>
        <div className="p-8">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"
          >
            <FiCalendar className="text-dental-blue" />
            <span>المواعيد الخاصة بك</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <p>يمكنك هنا رؤية المواعيد الخاصة بك فقط.</p>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-2 sm:p-6 md:p-8">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FiUsers className="text-dental-blue text-3xl" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-dental-blue to-dental-teal">
                إدارة المستخدمين
              </span>
            </h1>
            <p className="text-gray-600 mt-2">إضافة وتعديل وحذف مستخدمي النظام</p>
          </div>
        </motion.div>

        {/* رسائل الخطأ والنجاح */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* نموذج إضافة مستخدم */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-6 sm:mb-8"
        >
          <div className="p-3 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiUserPlus className="text-dental-blue" />
              <span>إضافة مستخدم جديد</span>
            </h2>
            <form onSubmit={handleSubmit(onAddUser)} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                  <input
                    {...register("name", { required: "حقل مطلوب" })}
                    className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-dental-blue focus:border-transparent`}
                    placeholder="أدخل الاسم الكامل"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input
                    {...register("email", { 
                      required: "حقل مطلوب",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "بريد إلكتروني غير صحيح"
                      }
                    })}
                    className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-dental-blue focus:border-transparent`}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                  <input
                    {...register("password", { 
                      required: "حقل مطلوب",
                      minLength: {
                        value: 6,
                        message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل"
                      }
                    })}
                    type="password"
                    className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-dental-blue focus:border-transparent`}
                    placeholder="أدخل كلمة المرور"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الصلاحية</label>
                  <select
                    {...register("role")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                  >
                    <option value="user">مستخدم عادي</option>
                    <option value="admin">مدير النظام</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-dental-blue to-dental-teal hover:from-dental-blue-dark hover:to-dental-teal-dark text-white px-4 sm:px-6 py-2 rounded-lg shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <FiUserPlus />
                  <span>إضافة مستخدم</span>
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* جدول المستخدمين */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-3 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <FiUsers className="text-dental-blue" />
              <span>قائمة المستخدمين</span>
            </h2>
            {loading ? (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-dental-blue"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                لا يوجد مستخدمين مسجلين
              </div>
            ) : (
              <>
                {/* جدول في الديسكتوب، بطاقات في الموبايل */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الصلاحية</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <AnimatePresence>
                        {users.map((user) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="hover:bg-gray-50"
                          >
                            {editId === user.id ? (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    value={editData.name || ''}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    value={editData.email || ''}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <select
                                    value={editData.role || 'user'}
                                    onChange={(e) => setEditData({ ...editData, role: e.target.value as 'admin' | 'user' })}
                                    className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                                  >
                                    <option value="user">مستخدم عادي</option>
                                    <option value="admin">مدير النظام</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleEditSave(user.id!)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                  >
                                    <FiSave size={14} />
                                    <span>حفظ</span>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setEditId(null)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                  >
                                    <FiX size={14} />
                                    <span>إلغاء</span>
                                  </motion.button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {user.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.role === 'admin' 
                                      ? 'bg-purple-100 text-purple-800 flex items-center gap-1'
                                      : 'bg-blue-100 text-blue-800 flex items-center gap-1'
                                  }`}>
                                    {user.role === 'admin' ? (
                                      <>
                                        <FiShield size={12} />
                                        <span>مدير النظام</span>
                                      </>
                                    ) : (
                                      <>
                                        <FiUser size={12} />
                                        <span>مستخدم عادي</span>
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleEdit(user)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                  >
                                    <FiEdit2 size={14} />
                                    <span>تعديل</span>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDelete(user.id!)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                  >
                                    <FiTrash2 size={14} />
                                    <span>حذف</span>
                                  </motion.button>
                                </td>
                              </>
                            )}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
                {/* بطاقات في الموبايل */}
                <div className="sm:hidden flex flex-col gap-3 mt-2">
                  <AnimatePresence>
                    {users.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-lg shadow p-3 flex flex-col gap-2 border border-gray-100"
                      >
                        {editId === user.id ? (
                          <>
                            <input
                              value={editData.name || ''}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-dental-blue focus:border-transparent mb-1"
                              placeholder="الاسم"
                            />
                            <input
                              value={editData.email || ''}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-dental-blue focus:border-transparent mb-1"
                              placeholder="البريد الإلكتروني"
                            />
                            <select
                              value={editData.role || 'user'}
                              onChange={(e) => setEditData({ ...editData, role: e.target.value as 'admin' | 'user' })}
                              className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-dental-blue focus:border-transparent mb-2"
                            >
                              <option value="user">مستخدم عادي</option>
                              <option value="admin">مدير النظام</option>
                            </select>
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditSave(user.id!)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex-1 flex items-center gap-1 justify-center"
                              >
                                <FiSave size={14} />
                                <span>حفظ</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setEditId(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg flex-1 flex items-center gap-1 justify-center"
                              >
                                <FiX size={14} />
                                <span>إلغاء</span>
                              </motion.button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-sm text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            <div className="mb-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800 flex items-center gap-1'
                                  : 'bg-blue-100 text-blue-800 flex items-center gap-1'
                              }`}>
                                {user.role === 'admin' ? (
                                  <>
                                    <FiShield size={12} />
                                    <span>مدير النظام</span>
                                  </>
                                ) : (
                                  <>
                                    <FiUser size={12} />
                                    <span>مستخدم عادي</span>
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-1">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEdit(user)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg flex-1 flex items-center gap-1 justify-center"
                              >
                                <FiEdit2 size={14} />
                                <span>تعديل</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(user.id!)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex-1 flex items-center gap-1 justify-center"
                              >
                                <FiTrash2 size={14} />
                                <span>حذف</span>
                              </motion.button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </motion.div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذه العملية.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>تأكيد</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default Users;