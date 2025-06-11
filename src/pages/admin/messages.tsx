import { useEffect, useState, useCallback } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { FiMail, FiPhone, FiUser, FiClock, FiTrash2 } from 'react-icons/fi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt?: { seconds: number; nanoseconds: number };
  isNew?: boolean;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const messagesQuery = query(
        collection(db, 'contactMessages'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(messagesQuery);
      
      const msgs: Message[] = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        isNew: docSnap.data().createdAt?.seconds > Date.now() / 1000 - 86400 // New if < 24h old
      } as Message));
      
      setMessages(msgs);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'خطأ في تحميل الرسائل',
        description: 'حدث خطأ أثناء محاولة تحميل الرسائل. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'contactMessages', id));
      setMessages(prev => prev.filter(m => m.id !== id));
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف الرسالة بنجاح.',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'خطأ في الحذف',
        description: 'حدث خطأ أثناء محاولة حذف الرسالة. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setOpenDeleteDialog(false);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (seconds: number) => {
    return format(new Date(seconds * 1000), 'dd MMM yyyy - hh:mm a', {
      locale: arSA,
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dental-blue">رسائل التواصل</h1>
            <p className="text-muted-foreground mt-2">
              إدارة رسائل الزوار والمراجعين
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <Input
              placeholder="ابحث في الرسائل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              {searchTerm ? (
                <div className="space-y-2">
                  <p className="text-gray-600">لا توجد نتائج بحث مطابقة</p>
                  <Button variant="ghost" onClick={() => setSearchTerm('')}>
                    مسح البحث وعرض الكل
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-600">لا توجد رسائل حتى الآن</p>
                  <Button variant="ghost" onClick={fetchMessages}>
                    تحديث الصفحة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map(msg => (
              <Card key={msg.id} className="border-l-4 border-dental-blue hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <FiUser className="text-dental-blue" />
                      <span>{msg.name}</span>
                      {msg.isNew && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          جديد
                        </Badge>
                      )}
                    </CardTitle>
                    {msg.createdAt?.seconds && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FiClock className="mr-1" size={14} />
                        {formatDate(msg.createdAt.seconds)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <FiMail className="mr-2 text-dental-blue" />
                      <a href={`mailto:${msg.email}`} className="hover:underline">
                        {msg.email}
                      </a>
                    </div>
                    {msg.phone && (
                      <div className="flex items-center text-sm">
                        <FiPhone className="mr-2 text-dental-blue" />
                        <a href={`tel:${msg.phone}`} className="hover:underline">
                          {msg.phone}
                        </a>
                      </div>
                    )}
                    {msg.subject && (
                      <div className="text-sm">
                        <span className="font-medium">الموضوع:</span> {msg.subject}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="whitespace-pre-line text-gray-800">{msg.message}</p>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDeletingId(msg.id);
                        setOpenDeleteDialog(true);
                      }}
                      disabled={deletingId === msg.id}
                    >
                      <FiTrash2 className="mr-2" size={14} />
                      {deletingId === msg.id ? 'جاري الحذف...' : 'حذف الرسالة'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف هذه الرسالة نهائياً ولن تتمكن من استرجاعها.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingId && handleDelete(deletingId)}
                className="bg-destructive hover:bg-destructive/90"
              >
                تأكيد الحذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}