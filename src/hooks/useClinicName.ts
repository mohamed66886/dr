import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export function useClinicName() {
  const [clinicName, setClinicName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinicName = async () => {
      try {
        const docRef = doc(db, 'config', 'clinicSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClinicName(docSnap.data().clinicName || '');
        }
      } catch (e) {
        setClinicName('');
      } finally {
        setLoading(false);
      }
    };
    fetchClinicName();
  }, []);

  return { clinicName, loading };
}
