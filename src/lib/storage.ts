import { Lead } from '../types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export const defaultSettings = {
  storeName: "بيتك ديكور • HOME DECOR",
  storeLogo: "",
  productName: "طاولة ميني MDF الأنيقة متعددة الاستعمالات",
  price: 199,
  originalPrice: 299,
  whatsappNumber: "212600000000",
  notificationWhatsapp: "212636415659",
  enableAutoRedirect: true,
  spreadsheetId: "",
  spreadsheetName: "",
  spreadsheetUrl: "",
  image_natural: "/src/assets/images/table_colors_1783722948300.jpg",
  image_dark: "/src/assets/images/hero_table_1783722935630.jpg",
  image_white: "/src/assets/images/table_utility_1783722963162.jpg",
  image_hero: "/src/assets/images/regenerated_image_1783728041366.png",
  image_features: "/src/assets/images/regenerated_image_1783728417810.png",
  image_dimensions: "/src/assets/images/table_dimensions_1783724171797.jpg"
};

const seedLeads: Lead[] = [
  {
    id: "lead-1",
    name: "محمد العمراني",
    phone: "0661234567",
    city: "الدار البيضاء",
    address: "حي المعاريف، زنقة جابر بن حيان رقم 12",
    quantity: 1,
    tableType: "طاولة MDF - لون طبيعي دافئ (Chêne Naturel)",
    notes: "المرجو الاتصال بي بعد الساعة الرابعة زوالاً لتأكيد التوصيل.",
    status: "مؤكد",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: "lead-2",
    name: "سارة الفاسي",
    phone: "0672345678",
    city: "الرباط",
    address: "أكدال، شارع الأبطال عمارة 5 شقة 3",
    quantity: 2,
    tableType: "طاولة MDF - لون بني داكن فاخر (Noyer Foncé)",
    notes: "بغيتها قبل نهاية الأسبوع جزاكم الله خيراً.",
    status: "جديد",
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: "lead-3",
    name: "يوسف التازي",
    phone: "0650987654",
    city: "طنجة",
    address: "طنجة البالية، مجمع الهدى بلوك ج",
    quantity: 1,
    tableType: "طاولة MDF - أبيض عصري (Blanc Moderne)",
    notes: "",
    status: "تم الاتصال",
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  }
];

const SETTINGS_KEY = 'home_decor_settings_v1';
const LEADS_KEY = 'home_decor_leads_v1';

export const getSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'default');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...defaultSettings, ...docSnap.data() };
    } else {
      // First time initialization in Firestore
      await setDoc(docRef, defaultSettings);
      return { ...defaultSettings };
    }
  } catch (err) {
    console.error('Error reading settings from Firestore:', err);
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error reading settings from localStorage fallback:', e);
    }
    return { ...defaultSettings };
  }
};

export const saveSettings = async (settings: any) => {
  try {
    const docRef = doc(db, 'settings', 'default');
    await setDoc(docRef, settings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
    return true;
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
    return false;
  }
};

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const leadsCol = collection(db, 'leads');
    const q = query(leadsCol, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      leads.push({ id: doc.id, ...doc.data() } as Lead);
    });
    
    if (leads.length === 0) {
      // Seed initial leads if empty
      for (const lead of seedLeads) {
        const { id, ...leadData } = lead;
        await setDoc(doc(db, 'leads', id), leadData);
        leads.push(lead);
      }
    }
    return leads;
  } catch (err) {
    console.error('Error reading leads from Firestore:', err);
    try {
      const saved = localStorage.getItem(LEADS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return seedLeads;
  }
};

export const saveLeads = async (leads: Lead[]) => {
  try {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    return true;
  } catch (err) {
    console.error('Error saving leads to localStorage:', err);
    return false;
  }
};

export const addLead = async (leadData: Omit<Lead, 'id' | 'status' | 'createdAt'>): Promise<Lead> => {
  const newLeadData = {
    ...leadData,
    status: 'جديد' as const,
    createdAt: new Date().toISOString()
  };
  
  try {
    const leadsCol = collection(db, 'leads');
    const docRef = await addDoc(leadsCol, newLeadData);
    const newLead: Lead = {
      id: docRef.id,
      ...newLeadData
    };
    return newLead;
  } catch (err) {
    console.error('Error adding lead to Firestore:', err);
    const id = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newLead = { id, ...newLeadData };
    try {
      const saved = localStorage.getItem(LEADS_KEY);
      const leads = saved ? JSON.parse(saved) : [];
      leads.unshift(newLead);
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    } catch (e) {}
    return newLead;
  }
};

export const updateLeadStatus = async (id: string, status: 'جديد' | 'تم الاتصال' | 'مؤكد' | 'ملغي'): Promise<Lead | null> => {
  try {
    const docRef = doc(db, 'leads', id);
    await updateDoc(docRef, { status });
    
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Lead;
    }
    return null;
  } catch (err) {
    console.error('Error updating lead status in Firestore:', err);
    try {
      const saved = localStorage.getItem(LEADS_KEY);
      if (saved) {
        const leads = JSON.parse(saved) as Lead[];
        const index = leads.findIndex(l => l.id === id);
        if (index !== -1) {
          leads[index].status = status;
          localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
          return leads[index];
        }
      }
    } catch (e) {}
    return null;
  }
};

export const deleteLead = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'leads', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting lead from Firestore:', err);
    try {
      const saved = localStorage.getItem(LEADS_KEY);
      if (saved) {
        const leads = JSON.parse(saved) as Lead[];
        const filtered = leads.filter(l => l.id !== id);
        if (filtered.length !== leads.length) {
          localStorage.setItem(LEADS_KEY, JSON.stringify(filtered));
          return true;
        }
      }
    } catch (e) {}
    return false;
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const subscribeLeads = (
  onUpdate: (leads: Lead[]) => void,
  onError: (error: any) => void
) => {
  const leadsCol = collection(db, 'leads');
  const q = query(leadsCol, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      leads.push({ id: doc.id, ...doc.data() } as Lead);
    });
    onUpdate(leads);
  }, (error) => {
    console.error('Error subscribing to leads:', error);
    try {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    } catch (e) {
      onError(e);
    }
  });
};

export const markLeadAsSynced = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'leads', id);
    await updateDoc(docRef, { sheetSynced: true });
    return true;
  } catch (err) {
    console.error('Error marking lead as synced in Firestore:', err);
    return false;
  }
};

export const markMultipleLeadsAsSynced = async (ids: string[]): Promise<boolean> => {
  try {
    for (const id of ids) {
      const docRef = doc(db, 'leads', id);
      await updateDoc(docRef, { sheetSynced: true });
    }
    return true;
  } catch (err) {
    console.error('Error marking multiple leads as synced:', err);
    return false;
  }
};
