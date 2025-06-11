import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit, FiSave, FiX } from 'react-icons/fi';

const defaultCategories = [
  { id: 'clinic', name: 'العيادة' },
  { id: 'equipment', name: 'المعدات' },
  { id: 'treatments', name: 'العلاجات' },
  { id: 'results', name: 'النتائج' }
];

const GalleryAdminPage = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    category: defaultCategories[0].id
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'gallery'));
        setImages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {
        setError('حدث خطأ أثناء جلب الصور');
      }
      setLoading(false);
    };
    fetchImages();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.title || !form.image) {
      setError('العنوان ورابط الصورة مطلوبان');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'gallery'), form);
      setImages([...images, { ...form, id: docRef.id }]);
      setForm({ title: '', description: '', image: '', category: defaultCategories[0].id });
      setSuccess('تمت الإضافة بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('حدث خطأ أثناء الإضافة');
    }
  };

  const handleEdit = img => {
    setEditing(img.id);
    setForm({ title: img.title, description: img.description, image: img.image, category: img.category });
  };

  const handleSave = async () => {
    if (!form.title || !form.image) {
      setError('العنوان ورابط الصورة مطلوبان');
      return;
    }
    try {
      await updateDoc(doc(db, 'gallery', editing), form);
      setImages(images.map(img => img.id === editing ? { ...img, ...form } : img));
      setEditing(null);
      setForm({ title: '', description: '', image: '', category: defaultCategories[0].id });
      setSuccess('تم التعديل بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('حدث خطأ أثناء التعديل');
    }
  };

  const handleDelete = async id => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
      setImages(images.filter(img => img.id !== id));
      setSuccess('تم الحذف بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full min-h-screen p-6 bg-white">
        <h1 className="text-2xl font-bold mb-6 text-primary">إدارة معرض الصور</h1>
        <AnimatePresence>
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</motion.div>}
          {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</motion.div>}
        </AnimatePresence>
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">إضافة / تعديل صورة</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">العنوان</label>
              <Input name="title" value={form.title} onChange={handleChange} />
            </div>
            <div>
              <label className="block mb-1 font-medium">التصنيف</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded p-2">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">الوصف</label>
              <Textarea name="description" value={form.description} onChange={handleChange} rows={2} />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">رابط الصورة</label>
              <Input name="image" value={form.image} onChange={handleChange} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {editing ? (
              <Button onClick={handleSave} className="flex items-center gap-2"><FiSave /> حفظ التعديل</Button>
            ) : (
              <Button onClick={handleAdd} className="flex items-center gap-2"><FiPlus /> إضافة</Button>
            )}
            {editing && <Button variant="outline" onClick={() => { setEditing(null); setForm({ title: '', description: '', image: '', category: defaultCategories[0].id }); }} className="flex items-center gap-2"><FiX /> إلغاء</Button>}
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? <div>جاري التحميل...</div> : images.length === 0 ? <div>لا توجد صور</div> : images.map(img => (
            <motion.div key={img.id} className="relative bg-white border rounded-xl shadow p-4 flex flex-col gap-2">
              <img src={img.image} alt={img.title} className="w-full h-48 object-cover rounded-lg mb-2" />
              <div className="font-bold text-lg">{img.title}</div>
              <div className="text-sm text-gray-600 mb-1">{categories.find(c => c.id === img.category)?.name || img.category}</div>
              <div className="text-gray-700 text-sm flex-1">{img.description}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(img)} className="flex items-center gap-1"><FiEdit /> تعديل</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(img.id)} className="flex items-center gap-1"><FiTrash2 /> حذف</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default GalleryAdminPage;
