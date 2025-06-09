import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiDownload, FiTrash2, FiCopy, FiUpload, FiDatabase } from 'react-icons/fi';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const collectionsToHandle = ['users', 'services', 'appointments', 'expenses'];

const DatabaseAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState({
    download: false,
    delete: false,
    copy: false,
    import: false
  });
  const [dialogOpen, setDialogOpen] = useState({
    delete: false,
    import: false
  });
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Download all data as JSON
  const handleDownload = async () => {
    setLoading({ ...loading, download: true });
    try {
      const allData: Record<string, unknown[]> = {};
      for (const col of collectionsToHandle) {
        const snap = await getDocs(collection(db, col));
        allData[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      
      const json = JSON.stringify(allData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clinic-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'تم تصدير البيانات بنجاح',
        description: 'تم تنزيل نسخة احتياطية من قاعدة البيانات',
        className: 'bg-green-100 text-green-800'
      });
    } catch (error) {
      toast({
        title: 'خطأ في التصدير',
        description: 'حدث خطأ أثناء محاولة تصدير البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading({ ...loading, download: false });
    }
  };

  // Copy all data to clipboard
  const handleCopy = async () => {
    setLoading({ ...loading, copy: true });
    try {
      const allData: Record<string, unknown[]> = {};
      for (const col of collectionsToHandle) {
        const snap = await getDocs(collection(db, col));
        allData[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      
      const json = JSON.stringify(allData, null, 2);
      await navigator.clipboard.writeText(json);
      
      toast({
        title: 'تم النسخ بنجاح',
        description: 'تم نسخ بيانات قاعدة البيانات إلى الحافظة',
        className: 'bg-blue-100 text-blue-800'
      });
    } catch (error) {
      toast({
        title: 'خطأ في النسخ',
        description: 'حدث خطأ أثناء محاولة نسخ البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading({ ...loading, copy: false });
    }
  };

  // Delete all data
  const handleDelete = async () => {
    setLoading({ ...loading, delete: true });
    try {
      for (const col of collectionsToHandle) {
        const snap = await getDocs(collection(db, col));
        const totalDocs = snap.docs.length;
        let processed = 0;
        
        for (const d of snap.docs) {
          await deleteDoc(doc(db, col, d.id));
          processed++;
          setImportProgress(Math.round((processed / totalDocs) * 100));
        }
      }
      
      toast({
        title: 'تم المسح بنجاح',
        description: 'تم حذف جميع البيانات من قاعدة البيانات',
        className: 'bg-red-100 text-red-800'
      });
    } catch (error) {
      toast({
        title: 'خطأ في المسح',
        description: 'حدث خطأ أثناء محاولة حذف البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading({ ...loading, delete: false });
      setDialogOpen({ ...dialogOpen, delete: false });
      setImportProgress(0);
    }
  };

  // Import data from JSON
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading({ ...loading, import: true });
    setImportProgress(0);
    
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      // Validate structure
      for (const col of collectionsToHandle) {
        if (!Array.isArray(json[col])) {
          throw new Error('هيكل الملف غير صالح');
        }
      }
      
      // Delete existing data first
      for (const col of collectionsToHandle) {
        const snap = await getDocs(collection(db, col));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, col, d.id));
        }
      }
      
      // Import new data with progress tracking
      let totalItems = 0;
      let processedItems = 0;
      
      // Calculate total items
      for (const col of collectionsToHandle) {
        totalItems += json[col].length;
      }
      
      // Import data
      for (const col of collectionsToHandle) {
        for (const item of json[col]) {
          const { id, ...data } = item;
          const firestore = await import('firebase/firestore');
          
          if (id) {
            await firestore.setDoc(firestore.doc(db, col, id), data);
          } else {
            await firestore.addDoc(firestore.collection(db, col), data);
          }
          
          processedItems++;
          setImportProgress(Math.round((processedItems / totalItems) * 100));
        }
      }
      
      toast({
        title: 'تم الاستيراد بنجاح',
        description: 'تم استيراد البيانات إلى قاعدة البيانات',
        className: 'bg-green-100 text-green-800'
      });
    } catch (error) {
      toast({
        title: 'خطأ في الاستيراد',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء محاولة استيراد البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading({ ...loading, import: false });
      setDialogOpen({ ...dialogOpen, import: false });
      setImportProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة قاعدة البيانات</h1>
              <p className="text-gray-600 mt-1">
                أدوات النسخ الاحتياطي واستعادة البيانات للنظام
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2 self-start">
              <FiDatabase className="h-4 w-4" />
              <span>حالة النظام: نشط</span>
            </Badge>
          </div>
          <Separator className="my-4" />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Export Card */}
          <motion.div variants={cardVariants}>
            <Card className="h-full border border-blue-100 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-3">
                  <FiDownload className="h-6 w-6" />
                  <span>تصدير البيانات</span>
                </CardTitle>
                <CardDescription>
                  إنشاء نسخة احتياطية من جميع بيانات النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleDownload}
                    disabled={loading.download}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading.download ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري التصدير...
                      </>
                    ) : (
                      <>
                        <FiDownload className="mr-2" />
                        تصدير إلى ملف JSON
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleCopy}
                    disabled={loading.copy}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {loading.copy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري النسخ...
                      </>
                    ) : (
                      <>
                        <FiCopy className="mr-2" />
                        نسخ إلى الحافظة
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Import/Delete Card */}
          <motion.div variants={cardVariants}>
            <Card className="h-full border border-red-100 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-3">
                  <FiUpload className="h-6 w-6" />
                  <span>استيراد/مسح البيانات</span>
                </CardTitle>
                <CardDescription>
                  إدارة البيانات الموجودة في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setDialogOpen({ ...dialogOpen, import: true })}
                    disabled={loading.import}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <FiUpload className="mr-2" />
                    استيراد من ملف
                  </Button>
                  
                  <Button
                    onClick={() => setDialogOpen({ ...dialogOpen, delete: true })}
                    disabled={loading.delete}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {loading.delete ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري المسح...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="mr-2" />
                        مسح جميع البيانات
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={dialogOpen.delete} 
          onOpenChange={(open) => setDialogOpen({ ...dialogOpen, delete: open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                ⚠️ تأكيد مسح جميع البيانات
              </AlertDialogTitle>
              <AlertDialogDescription>
                هذا الإجراء سيقوم بحذف جميع البيانات في المجموعات التالية:
                <ul className="list-disc list-inside mt-2 text-red-700">
                  {collectionsToHandle.map(col => (
                    <li key={col} className="capitalize">{col}</li>
                  ))}
                </ul>
                <p className="mt-3 font-semibold">
                  لا يمكن التراجع عن هذا الإجراء!
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {loading.delete && (
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <p className="text-sm text-gray-500 text-center">
                  جاري حذف البيانات... {importProgress}%
                </p>
              </div>
            )}
            
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading.delete}>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={loading.delete}
                className="bg-red-600 hover:bg-red-700"
              >
                نعم، مسح الكل
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import Dialog */}
        <AlertDialog 
          open={dialogOpen.import} 
          onOpenChange={(open) => setDialogOpen({ ...dialogOpen, import: open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-600">
                استيراد بيانات من ملف
              </AlertDialogTitle>
              <AlertDialogDescription>
                سيتم استبدال جميع البيانات الحالية بالبيانات من الملف المحدد.
                <p className="mt-2 font-semibold">
                  يرجى التأكد من صحة البيانات قبل الاستيراد!
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImport}
                disabled={loading.import}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              
              {loading.import && (
                <div className="space-y-2">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-gray-500 text-center">
                    جاري استيراد البيانات... {importProgress}%
                  </p>
                </div>
              )}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading.import}>إلغاء</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default DatabaseAdmin;