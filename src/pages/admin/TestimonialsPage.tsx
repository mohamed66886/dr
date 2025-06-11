import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/AdminLayout';

interface Testimonial {
  id?: string;
  name: string;
  rating: number;
  text: string;
  service: string;
  avatar: string;
}

const emptyForm: Testimonial = {
  name: '',
  rating: 5,
  text: '',
  service: '',
  avatar: ''
};

interface VideoTestimonial {
  id?: string;
  title: string;
  url: string;
  description: string;
}

const emptyVideoForm: VideoTestimonial = {
  title: '',
  url: '',
  description: ''
};

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [form, setForm] = useState<Testimonial>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Video testimonials state
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [videoForm, setVideoForm] = useState<VideoTestimonial>(emptyVideoForm);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'testimonials'));
    setTestimonials(
      querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial))
    );
    setLoading(false);
  };

  // Fetch video testimonials
  const fetchVideoTestimonials = async () => {
    const querySnapshot = await getDocs(collection(db, 'videoTestimonials'));
    setVideoTestimonials(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoTestimonial)));
  };

  useEffect(() => {
    fetchTestimonials();
    fetchVideoTestimonials();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      const { id, ...formData } = form;
      await updateDoc(doc(db, 'testimonials', editingId), formData);
    } else {
      await addDoc(collection(db, 'testimonials'), form);
    }
    setForm(emptyForm);
    setEditingId(null);
    fetchTestimonials();
  };

  const handleEdit = (testimonial: Testimonial) => {
    setForm(testimonial);
    setEditingId(testimonial.id!);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف الشهادة؟')) {
      setLoading(true);
      await deleteDoc(doc(db, 'testimonials', id));
      fetchTestimonials();
    }
  };

  // Video form handlers
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVideoForm(prev => ({ ...prev, [name]: value }));
  };
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingVideoId) {
      const { id, ...formData } = videoForm;
      await updateDoc(doc(db, 'videoTestimonials', editingVideoId), formData);
    } else {
      await addDoc(collection(db, 'videoTestimonials'), videoForm);
    }
    setVideoForm(emptyVideoForm);
    setEditingVideoId(null);
    fetchVideoTestimonials();
    setLoading(false);
  };
  const handleVideoEdit = (video: VideoTestimonial) => {
    setVideoForm(video);
    setEditingVideoId(video.id!);
  };
  const handleVideoDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف شهادة الفيديو؟')) {
      setLoading(true);
      await deleteDoc(doc(db, 'videoTestimonials', id));
      fetchVideoTestimonials();
      setLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    // يدعم روابط يوتيوب العادية والمختصرة
    try {
      const regExp = /^.*(?:youtu.be\/|v=|embed\/|shorts\/)([a-zA-Z0-9_-]{11}).*/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return url; // fallback
    } catch {
      return url;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">إدارة الشهادات</h1>
        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="اسم المريض"
            className="border p-2 rounded"
            required
          />
          <input
            name="service"
            value={form.service}
            onChange={handleChange}
            placeholder="الخدمة"
            className="border p-2 rounded"
            required
          />
          <input
            name="avatar"
            value={form.avatar}
            onChange={handleChange}
            placeholder="رابط الصورة الشخصية"
            className="border p-2 rounded"
          />
          <input
            name="rating"
            type="number"
            min={1}
            max={5}
            value={form.rating}
            onChange={handleChange}
            placeholder="التقييم من 1 إلى 5"
            className="border p-2 rounded"
            required
          />
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            placeholder="نص الشهادة"
            className="border p-2 rounded col-span-1 md:col-span-2"
            required
          />
          <Button type="submit" className="col-span-1 md:col-span-2">
            {editingId ? 'تحديث الشهادة' : 'إضافة شهادة'}
          </Button>
        </form>
        {loading && <div>جاري التحميل...</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full border" />
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm text-dental-blue">{t.service}</div>
                  </div>
                </div>
                <div className="mb-2 text-yellow-500">
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                </div>
                <blockquote className="text-gray-700 mb-2">{t.text}</blockquote>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => handleEdit(t)}>
                    تعديل
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => handleDelete(t.id!)}>
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* قسم شهادات الفيديو */}
      <div className="container mx-auto py-10">
        <h2 className="text-2xl font-bold mb-4">شهادات فيديو</h2>
        <form onSubmit={handleVideoSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="title"
            value={videoForm.title}
            onChange={handleVideoChange}
            placeholder="عنوان الفيديو"
            className="border p-2 rounded"
            required
          />
          <input
            name="url"
            value={videoForm.url}
            onChange={handleVideoChange}
            placeholder="رابط يوتيوب"
            className="border p-2 rounded"
            required
          />
          <input
            name="description"
            value={videoForm.description}
            onChange={handleVideoChange}
            placeholder="وصف مختصر"
            className="border p-2 rounded"
            required
          />
          <Button type="submit" className="col-span-1 md:col-span-3">
            {editingVideoId ? 'تحديث الفيديو' : 'إضافة فيديو'}
          </Button>
        </form>
        {loading && <div>جاري التحميل...</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoTestimonials.map((v) => (
            <Card key={v.id}>
              <CardContent className="p-0">
                <div className="relative">
                  <iframe
                    width="100%"
                    height="250"
                    src={getYoutubeEmbedUrl(v.url)}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-48 md:h-56 object-cover"
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-600">{v.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant="outline" onClick={() => handleVideoEdit(v)}>
                      تعديل
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => handleVideoDelete(v.id!)}>
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TestimonialsPage;
