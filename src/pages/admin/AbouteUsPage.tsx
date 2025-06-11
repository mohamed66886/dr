import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/AdminLayout';
import { FaGraduationCap, FaTrophy, FaFlask, FaUserMd, FaStar, FaShieldAlt, FaMicroscope, FaHeart } from 'react-icons/fa';

const defaultData = {
  heroTitle: 'من نحن',
  heroDescription: 'تعرف على د. معاذ أشرف وفريقه المتخصص في تقديم أفضل خدمات طب الأسنان',
  doctorStory: [
    'بدأت رحلتي في طب الأسنان منذ أكثر من 15 عامًا بحلم واحد: أن أساعد الناس على استعادة ثقتهم بأنفسهم من خلال ابتسامة صحية وجميلة. تخرجت من كلية طب الأسنان بجامعة المنصورة بتقدير امتياز مع مرتبة الشرف.',
    'سافرت إلى الولايات المتحدة وأوروبا لأحصل على أفضل التدريبات في مجال زراعة الأسنان والطب التجميلي. عدت إلى المملكة مسلحًا بأحدث المعارف والتقنيات لأخدم مجتمعي.',
    'اليوم، أفتخر بأنني ساعدت آلاف المرضى في الحصول على الابتسامة التي يحلمون بها، وأن عيادتي أصبحت مكانًا يثق به الناس لعلاج أسنانهم.'
  ],
  achievements: [
    { title: 'التعليم والشهادات', description: 'دكتوراه في طب الأسنان من جامعة الملك سعود، وشهادات تخصصية من الولايات المتحدة وأوروبا' },
    { title: 'الجوائز والتقديرات', description: 'حاصل على عدة جوائز في مجال طب الأسنان التجميلي وزراعة الأسنان من الجمعيات المهنية' },
    { title: 'الأبحاث والمؤتمرات', description: 'مشارك في العديد من المؤتمرات العالمية ولديه أبحاث منشورة في مجلات طبية محكمة' },
    { title: 'الخبرة العملية', description: 'أكثر من 15 عامًا من الخبرة في علاج آلاف المرضى وإجراء عمليات زراعة وتجميل الأسنان' }
  ],
  vision: 'أن نكون الخيار الأول في المملكة العربية السعودية لطب الأسنان التجميلي والعلاجي، وأن نساهم في رفع مستوى الوعي بأهمية صحة الأسنان في المجتمع.',
  mission: 'تقديم خدمات طبية متميزة في مجال طب الأسنان باستخدام أحدث التقنيات والمعدات، مع التركيز على راحة المريض وتحقيق أفضل النتائج العلاجية والتجميلية.',
  values: [
    { title: 'الجودة والتميز', description: 'نلتزم بتقديم أعلى مستويات الجودة في جميع خدماتنا الطبية' },
    { title: 'الأمان والراحة', description: 'نوفر بيئة آمنة ومريحة لجميع مرضانا مع اتباع أعلى معايير التعقيم' },
    { title: 'التقنيات الحديثة', description: 'نستخدم أحدث التقنيات والمعدات الطبية لضمان أفضل النتائج' },
    { title: 'الرعاية الشخصية', description: 'نقدم رعاية شخصية مخصصة لكل مريض حسب احتياجاته الفردية' }
  ]
};

export default function AbouteUsPage() {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const docRef = doc(db, 'pages', 'about');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setData(snap.data() as typeof defaultData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, idx, subfield, value) => {
    setData(prev => {
      const arr = [...prev[field]];
      if (subfield) arr[idx][subfield] = value;
      else arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, 'pages', 'about'), data);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (loading) return <div className="p-8">جاري التحميل...</div>;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <Card className="shadow-none border-0 bg-gradient-to-r from-dental-blue/10 to-dental-teal/10">
          <CardContent className="space-y-4 p-8">
            <h2 className="font-bold text-2xl mb-2 text-dental-blue text-center">الهيدر الرئيسي</h2>
            <input className="input w-full text-lg font-bold text-center bg-white/80 border border-dental-blue/30 rounded-lg py-2" value={data.heroTitle} onChange={e => handleChange('heroTitle', e.target.value)} />
            <textarea className="input w-full text-base text-center bg-white/80 border border-dental-blue/20 rounded-lg py-2" value={data.heroDescription} onChange={e => handleChange('heroDescription', e.target.value)} />
          </CardContent>
        </Card>
        <Card className="shadow-none border-0 bg-gradient-to-r from-dental-blue/5 to-dental-teal/5">
          <CardContent className="space-y-4 p-8">
            <h2 className="font-bold text-2xl mb-2 text-dental-blue text-center">قصة الدكتور</h2>
            <div className="space-y-3">
              {data.doctorStory.map((story, idx) => (
                <textarea key={idx} className="input w-full bg-white/80 border border-dental-blue/20 rounded-lg py-2" value={story} onChange={e => handleArrayChange('doctorStory', idx, null, e.target.value)} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none border-0 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="space-y-4 p-8">
            <h2 className="font-bold text-2xl mb-2 text-dental-blue text-center">الإنجازات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-white/70 rounded-xl p-4 shadow-sm border border-dental-blue/10">
                  <span className="mt-2 text-3xl text-dental-blue">
                    {idx === 0 && <FaGraduationCap />}
                    {idx === 1 && <FaTrophy />}
                    {idx === 2 && <FaFlask />}
                    {idx === 3 && <FaUserMd />}
                  </span>
                  <div className="flex-1">
                    <input className="input w-full mb-1 font-semibold text-dental-blue bg-white/80 border-b border-dental-blue/20" value={ach.title} onChange={e => handleArrayChange('achievements', idx, 'title', e.target.value)} placeholder="العنوان" />
                    <textarea className="input w-full text-gray-700 bg-white/80 border-b border-dental-blue/10" value={ach.description} onChange={e => handleArrayChange('achievements', idx, 'description', e.target.value)} placeholder="الوصف" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-none border-0 bg-gradient-to-br from-dental-blue/5 to-dental-teal/5">
            <CardContent className="space-y-4 p-8">
              <h2 className="font-bold text-2xl mb-2 text-dental-blue text-center">الرؤية</h2>
              <textarea className="input w-full text-center bg-white/80 border border-dental-blue/20 rounded-lg py-2" value={data.vision} onChange={e => handleChange('vision', e.target.value)} />
            </CardContent>
          </Card>
          <Card className="shadow-none border-0 bg-gradient-to-br from-dental-teal/5 to-dental-blue/5">
            <CardContent className="space-y-4 p-8">
              <h2 className="font-bold text-2xl mb-2 text-dental-blue text-center">الرسالة</h2>
              <textarea className="input w-full text-center bg-white/80 border border-dental-blue/20 rounded-lg py-2" value={data.mission} onChange={e => handleChange('mission', e.target.value)} />
            </CardContent>
          </Card>
        </div>
        <Card className="shadow-none border-0 bg-gradient-to-br from-dental-blue/10 to-dental-teal/10">
          <CardContent className="space-y-4 p-8">
            <h2 className="font-bold text-2xl mb-2 text-dental-blue text-center">القيم والمبادئ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.values.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center bg-white/70 rounded-xl p-4 shadow-sm border border-dental-blue/10 h-full">
                  <span className="mb-2 text-3xl text-dental-blue">
                    {idx === 0 && <FaStar />}
                    {idx === 1 && <FaShieldAlt />}
                    {idx === 2 && <FaMicroscope />}
                    {idx === 3 && <FaHeart />}
                  </span>
                  <input className="input w-full mb-1 font-semibold text-center text-dental-blue bg-white/80 border-b border-dental-blue/20" value={val.title} onChange={e => handleArrayChange('values', idx, 'title', e.target.value)} placeholder="العنوان" />
                  <textarea className="input w-full text-center text-gray-700 bg-white/80 border-b border-dental-blue/10" value={val.description} onChange={e => handleArrayChange('values', idx, 'description', e.target.value)} placeholder="الوصف" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 items-center justify-center pt-4">
          <Button onClick={handleSave} disabled={saving} className="bg-dental-blue hover:bg-dental-teal text-white px-8 py-3 rounded-lg text-lg font-bold shadow-md transition-all">
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </Button>
          {success && <span className="text-green-600 font-semibold">تم الحفظ بنجاح!</span>}
        </div>
      </div>
    </AdminLayout>
  );
}
