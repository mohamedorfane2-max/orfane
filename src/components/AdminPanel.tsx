import React, { useEffect, useState } from 'react';
import { Lead } from '../types';
import { getLeads, getSettings, saveSettings as saveLocalSettings, updateLeadStatus, deleteLead as deleteLocalLead, subscribeLeads, markLeadAsSynced, markMultipleLeadsAsSynced } from '../lib/storage';
import { 
  initAuth as initSheetsAuth, 
  googleSignIn as sheetsGoogleSignIn, 
  logout as sheetsLogout, 
  createSpreadsheet, 
  appendRowsToSpreadsheet 
} from '../lib/sheets';
import { 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  User, 
  MapPin, 
  TrendingUp, 
  ShoppingBag, 
  Search, 
  Filter, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  Settings,
  Table,
  LayoutGrid,
  Image as ImageIcon,
  Save,
  Check,
  Globe,
  RefreshCw,
  Upload,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    // Validate file size (under 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("حجم الصورة كبير بزاف! خاص يكون قل من 15 ميغا بايت.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          // Set base64 string directly as url for pure client-side persistence
          onChange(base64Data);
        } catch (err: any) {
          setUploadError("حدث خطأ أثناء معالجة الصورة.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError("فشل قراءة الملف.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError("حدث خطأ غير متوقع.");
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  return (
    <div className="space-y-2 text-right">
      <span className="text-[11px] font-bold text-natural-dark/75 block">{label}</span>
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-natural-sand/80 hover:border-natural-primary bg-natural-bg/40 hover:bg-natural-bg p-4 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] group relative overflow-hidden"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {value ? (
          <div className="w-full flex flex-col sm:flex-row items-center gap-4 text-right" dir="rtl">
            <img 
              src={value} 
              alt="Preview" 
              className="h-20 w-20 object-cover rounded-xl border border-natural-sand/50 shadow-xs shrink-0 bg-white" 
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-emerald-600 font-bold mb-1 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>تم تحميل الصورة بنجاح! 🎉</span>
              </p>
              <p className="text-[10px] text-natural-dark/65 font-mono truncate bg-natural-cream/30 px-2 py-1 rounded select-all" title={value}>{value}</p>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2.5 text-[10px] bg-white text-natural-primary hover:text-white hover:bg-natural-primary px-3 py-1.5 rounded-lg border border-natural-sand/60 font-bold transition-all cursor-pointer shadow-xs"
              >
                تغيير الصورة 🔄
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="h-10 w-10 bg-natural-cream rounded-full flex items-center justify-center text-natural-primary mb-2 group-hover:scale-110 transition-transform">
              {isUploading ? (
                <div className="animate-spin h-5 w-5 border-2 border-natural-primary border-t-transparent rounded-full"></div>
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>
            {isUploading ? (
              <p className="text-xs font-bold text-natural-dark/70 animate-pulse">جاري الرفع والحفظ على السيرفر... ⏳</p>
            ) : (
              <>
                <p className="text-xs font-extrabold text-natural-dark">اسحب وصورة هنا أو اضغط للاختيار من جهازك 💻📱</p>
                <p className="text-[10px] text-natural-dark/50 mt-1">تنسيقات مدعومة: JPG, PNG, WEBP (حجم أقصى 15MB)</p>
              </>
            )}
          </>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin h-7 w-7 border-3 border-natural-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-xs font-extrabold text-natural-dark">جاري الرفع والمزامنة... 🚀</p>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{uploadError}</span>
        </p>
      )}
    </div>
  );
}

interface AdminPanelProps {
  onBack: () => void;
  mode?: 'orders' | 'settings';
}

export default function AdminPanel({ onBack, mode = 'orders' }: AdminPanelProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const isInitialLoad = React.useRef(true);
  const previousLeadsCount = React.useRef(0);
  const [newOrderAlert, setNewOrderAlert] = useState<Lead | null>(null);

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // First note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);
      
      // Second note, slightly delayed
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.45);
      }, 120);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  // Active Tab state: 'orders' or 'settings'
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>(mode);

  // Product settings state
  const [settings, setSettings] = useState({
    storeName: "بيتك ديكور • HOME DECOR",
    storeLogo: "/uploads/uploaded_1783728842800_snufn.jpg",
    productName: "طاولة ميني MDF الأنيقة",
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
  });
  
  // Google Sheets integration state
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isSheetsAuthLoading, setIsSheetsAuthLoading] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Preset images for user reference
  const presetImages = [
    { path: '/src/assets/images/table_colors_1783722948300.jpg', label: 'طبيعي دافئ (الافتراضي)' },
    { path: '/src/assets/images/hero_table_1783722935630.jpg', label: 'بني داكن' },
    { path: '/src/assets/images/table_utility_1783722963162.jpg', label: 'أبيض عصري' },
    { path: '/src/assets/images/table_dimensions_1783724171797.jpg', label: 'صورة القياسات المخططة' }
  ];

  // Load settings from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      await fetchSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();

    setLoading(true);
    const unsubscribe = subscribeLeads(
      (data) => {
        if (isInitialLoad.current) {
          setLeads(data);
          previousLeadsCount.current = data.length;
          isInitialLoad.current = false;
          setLoading(false);
        } else {
          if (data.length > previousLeadsCount.current) {
            const latestNewLead = data[0];
            if (latestNewLead && latestNewLead.status === 'جديد') {
              setNewOrderAlert(latestNewLead);
              playNotificationSound();
            }
          }
          setLeads(data);
          previousLeadsCount.current = data.length;
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setError('حدث خطأ أثناء تحميل البيانات في الوقت الفعلي');
        setLoading(false);
      }
    );

    const sheetsAuthUnsubscribe = initSheetsAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );

    return () => {
      unsubscribe();
      sheetsAuthUnsubscribe();
    };
  }, []);

  // Save product settings
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSettingsLoading(true);
      setSaveSuccess(false);
      setSaveError(null);
      
      const success = await saveLocalSettings(settings);
      if (!success) throw new Error('فشل حفظ إعدادات المنتج');
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Google Sheets Helper Functions
  const syncLeadsToGoogleSheets = async (targetToken?: string) => {
    const token = targetToken || googleToken;
    if (!token) {
      setSyncStatusMsg({ type: 'error', text: 'المرجو ربط حساب Google أولاً لتتمكن من المزامنة.' });
      return;
    }

    const currentSpreadsheetId = settings.spreadsheetId;
    if (!currentSpreadsheetId) {
      setSyncStatusMsg({ type: 'error', text: 'المرجو إنشاء أو ربط جدول بيانات (Spreadsheet) أولاً.' });
      return;
    }

    setIsSyncingSheets(true);
    setSyncStatusMsg(null);

    try {
      // Filter out leads that are already marked as synced
      const unsyncedLeads = leads.filter(l => !l.sheetSynced);

      if (unsyncedLeads.length === 0) {
        setSyncStatusMsg({ type: 'success', text: 'جميع الطلبات الحالية متزامنة بالفعل مع Google Sheets! ✨' });
        setIsSyncingSheets(false);
        return;
      }

      // Format the data as row arrays
      const rows = unsyncedLeads.map(lead => [
        lead.id,
        lead.name,
        lead.phone,
        lead.city,
        lead.address,
        lead.tableType,
        lead.quantity,
        lead.quantity * settings.price,
        lead.status,
        new Date(lead.createdAt).toLocaleString('fr-FR')
      ]);

      await appendRowsToSpreadsheet(token, currentSpreadsheetId, 'الطلبات!A2', rows);

      // Update the status in Firestore
      const unsyncedIds = unsyncedLeads.map(l => l.id);
      await markMultipleLeadsAsSynced(unsyncedIds);

      setSyncStatusMsg({ 
        type: 'success', 
        text: `تمت بنجاح مزامنة ${unsyncedLeads.length} طلبات جديدة مع Google Sheets! 🚀` 
      });
    } catch (err: any) {
      console.error('Error syncing to Google Sheets:', err);
      setSyncStatusMsg({ 
        type: 'error', 
        text: `فشلت المزامنة: ${err.message || 'خطأ غير معروف'}` 
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleCreateNewSpreadsheet = async () => {
    if (!googleToken) {
      setSyncStatusMsg({ type: 'error', text: 'المرجو ربط حساب Google أولاً.' });
      return;
    }

    setIsSheetsAuthLoading(true);
    setSyncStatusMsg(null);

    try {
      const sheetTitle = `مبيعات طاولة ميني MDF - ${settings.storeName || 'بيتك ديكور'}`;
      const result = await createSpreadsheet(googleToken, sheetTitle);

      const updatedSettings = {
        ...settings,
        spreadsheetId: result.id,
        spreadsheetName: sheetTitle,
        spreadsheetUrl: result.url
      };

      setSettings(updatedSettings);
      await saveLocalSettings(updatedSettings);

      setSyncStatusMsg({ 
        type: 'success', 
        text: 'تم إنشاء جدول بيانات جديد بنجاح وربطه بالمتجر! 🎉' 
      });
    } catch (err: any) {
      console.error('Error creating spreadsheet:', err);
      setSyncStatusMsg({ 
        type: 'error', 
        text: `فشل إنشاء جدول البيانات: ${err.message || 'خطأ غير معروف'}` 
      });
    } finally {
      setIsSheetsAuthLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsSheetsAuthLoading(true);
    setSyncStatusMsg(null);
    try {
      const result = await sheetsGoogleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setSyncStatusMsg({ type: 'success', text: `تم ربط حساب Google بنجاح: ${result.user.email} 🟢` });
        
        if (settings.spreadsheetId) {
          setTimeout(() => {
            syncLeadsToGoogleSheets(result.accessToken);
          }, 800);
        }
      }
    } catch (err: any) {
      console.error('Failed to sign in to Google:', err);
      setSyncStatusMsg({ type: 'error', text: `فشل الاتصال بـ Google: ${err.message || 'خطأ غير معروف'}` });
    } finally {
      setIsSheetsAuthLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setIsSheetsAuthLoading(true);
    try {
      await sheetsLogout();
      setGoogleUser(null);
      setGoogleToken(null);
      setSyncStatusMsg({ type: 'success', text: 'تم إلغاء ربط حساب Google بنجاح.' });
    } catch (err: any) {
      console.error('Failed to logout Google:', err);
    } finally {
      setIsSheetsAuthLoading(false);
    }
  };

  // Update lead status
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await updateLeadStatus(id, newStatus as any);
      if (!updated) throw new Error('فشل تحديث الحالة');
      
      // Update local state
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus as any } : lead));
    } catch (err: any) {
      alert(err.message || 'خطأ في التحديث');
    }
  };

  // Delete lead
  const deleteLead = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    try {
      const success = await deleteLocalLead(id);
      if (!success) throw new Error('فشل حذف الطلب');
      
      // Update local state
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err: any) {
      alert(err.message || 'خطأ في الحذف');
    }
  };

  // Filter & Search Logic
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.phone.includes(searchTerm) || 
      lead.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesCity = cityFilter === 'all' || lead.city === cityFilter;

    return matchesSearch && matchesStatus && matchesCity;
  });

  // Unique Cities for filter
  const uniqueCities = Array.from(new Set(leads.map(l => l.city))).filter(Boolean);

  // Calculations
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'جديد').length,
    contacted: leads.filter(l => l.status === 'تم الاتصال').length,
    confirmed: leads.filter(l => l.status === 'مؤكد').length,
    cancelled: leads.filter(l => l.status === 'ملغي').length,
    totalTables: leads.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    potentialEarnings: leads.filter(l => l.status !== 'ملغي').reduce((acc, curr) => acc + ((curr.quantity || 1) * settings.price), 0),
  };

  // Format Date in Arabic
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ar-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-dark pb-16" dir="rtl">
      {/* Header bar */}
      <header className="bg-natural-cream/80 backdrop-blur-md border-b border-natural-sand/60 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-natural-sand/50 rounded-lg transition-colors text-natural-dark/70 flex items-center justify-center cursor-pointer font-bold"
              title="العودة لصفحة الهبوط"
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            {activeTab === 'orders' ? (
              <div>
                <h1 className="text-xl font-bold font-sans text-natural-dark flex items-center gap-2">
                  <span>لوحة تتبع طلبات الزبناء</span>
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-100 flex items-center gap-1">الطلبات 📦</span>
                </h1>
                <p className="text-xs text-natural-dark/60">تتبع طلبات الزبناء المستلمة في الوقت الفعلي وتحديث حالتها ومراسلتهم عبر الواتساب.</p>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold font-sans text-natural-dark flex items-center gap-2">
                  <span>لوحة تعديل بيانات المنتج والمعرض</span>
                  <span className="bg-natural-cream text-natural-primary text-xs px-2.5 py-0.5 rounded-full font-semibold border border-natural-sand/50 flex items-center gap-1">المتجر ⚙️</span>
                </h1>
                <p className="text-xs text-natural-dark/60">تعديل أثمنة وصور وخيارات الطاولة المعروضة في صفحة الهبوط.</p>
              </div>
            )}
          </div>

          {activeTab === 'orders' && (
            <button
              onClick={fetchLeads}
              className="text-xs font-semibold px-3 py-2 bg-natural-cream hover:bg-natural-sand text-natural-primary rounded-lg border border-natural-sand/50 transition-colors cursor-pointer shrink-0"
            >
              تحديث البيانات 🔄
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-sans">{error}</p>
          </div>
        )}

        {/* Stats Grid - Only shown on orders page */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-natural-cream/35 p-5 rounded-2xl border border-natural-sand/60 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-natural-dark/65">إجمالي الطلبات</p>
                <h3 className="text-2xl font-bold text-natural-dark mt-1 font-mono">{stats.total}</h3>
                <p className="text-xs text-natural-dark/45 mt-0.5">عدد زبناء المهتمين</p>
              </div>
              <div className="h-12 w-12 bg-natural-cream rounded-xl flex items-center justify-center text-natural-primary border border-natural-sand/40">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-natural-cream/35 p-5 rounded-2xl border border-natural-sand/60 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-natural-dark/65">الطلبات المؤكدة ✅</p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{stats.confirmed}</h3>
                <p className="text-xs text-natural-dark/45 mt-0.5">جاهزة للتوصيل والشحن</p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 border border-emerald-100">
                <CheckCircle className="h-6 w-6" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-natural-cream/35 p-5 rounded-2xl border border-natural-sand/60 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-natural-dark/65">تحت الإجراء ⏳</p>
                <h3 className="text-2xl font-bold text-blue-700 mt-1 font-mono">{stats.new + stats.contacted}</h3>
                <p className="text-xs text-natural-dark/45 mt-0.5">{stats.new} جديدة و {stats.contacted} تم الاتصال بها</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 border border-blue-100">
                <Clock className="h-6 w-6" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-natural-cream/35 p-5 rounded-2xl border border-natural-sand/60 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-natural-dark/65">رقم المبيعات المتوقع</p>
                <h3 className="text-2xl font-bold text-natural-primary mt-1 font-mono">{stats.potentialEarnings} <span className="text-xs">درهم</span></h3>
                <p className="text-xs text-natural-dark/45 mt-0.5">بناءً على سعر {settings.price} درهم/طاولة</p>
              </div>
              <div className="h-12 w-12 bg-natural-cream rounded-xl flex items-center justify-center text-natural-accent border border-natural-sand/40">
                <TrendingUp className="h-6 w-6" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Conditional Content based on activeTab */}
        {activeTab === 'orders' ? (
          <>
            {/* Google Sheets Sync Quick Bar */}
            {settings.spreadsheetId && (
              <div className="mb-6 bg-white border border-natural-sand/60 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0 text-sm">
                    📊
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-natural-dark block">مزامنة الطلبات مع Google Sheets</span>
                    {googleUser ? (
                      <span className="text-[10px] text-natural-dark/60 block">
                        الجدول النشط: <a href={settings.spreadsheetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">{settings.spreadsheetName} 🔗</a>
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-extrabold block">
                        الرجاء ربط حساب Google لتفعيل المزامنة مع الجدول. ⚠️
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                  {leads.filter(l => !l.sheetSynced).length > 0 ? (
                    <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1.5">
                      <span>{leads.filter(l => !l.sheetSynced).length} طلبات معلقة</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                      <span>كل الطلبات متزامنة</span>
                      <span>✨</span>
                    </div>
                  )}

                  {googleUser ? (
                    <button
                      onClick={() => syncLeadsToGoogleSheets()}
                      disabled={isSyncingSheets || leads.filter(l => !l.sheetSynced).length === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-100 disabled:text-neutral-400 text-white text-xs px-4 py-2 rounded-xl font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isSyncingSheets ? (
                        <>
                          <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>جاري المزامنة...</span>
                        </>
                      ) : (
                        <>
                          <span>مزامنة الآن 🔄</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectGoogle}
                      className="bg-natural-primary hover:bg-natural-primary-dark text-white text-xs px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer"
                    >
                      ربط الحساب 🚀
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Filters and Search controls */}
            <div className="bg-natural-cream/25 p-4 rounded-2xl border border-natural-sand/60 shadow-xs mb-6 flex flex-col md:flex-row gap-4">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3.5 h-4 w-4 text-natural-dark/50" />
                <input
                  type="text"
                  placeholder="البحث بالاسم، رقم الهاتف أو المدينة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-natural-bg border border-natural-sand/60 rounded-xl text-sm focus:outline-none focus:border-natural-primary focus:bg-white transition-colors text-natural-dark placeholder-natural-dark/40"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-natural-dark/50 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-natural-bg border border-natural-sand/60 rounded-xl px-3 py-2.5 text-xs text-natural-dark focus:outline-none focus:border-natural-primary"
                >
                  <option value="all">كل الحالات ({stats.total})</option>
                  <option value="جديد">جديد ({stats.new})</option>
                  <option value="تم الاتصال">تم الاتصال ({stats.contacted})</option>
                  <option value="مؤكد">مؤكد ({stats.confirmed})</option>
                  <option value="ملغي">ملغي ({stats.cancelled})</option>
                </select>
              </div>

              {/* City Filter */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-natural-dark/50 shrink-0" />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-natural-bg border border-natural-sand/60 rounded-xl px-3 py-2.5 text-xs text-natural-dark focus:outline-none focus:border-natural-primary"
                >
                  <option value="all">كل المدن ({uniqueCities.length})</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-natural-bg border border-natural-sand/60 rounded-xl p-1 gap-1 md:ms-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-natural-primary text-white shadow-sm'
                      : 'text-natural-dark/60 hover:text-natural-dark'
                  }`}
                  title="عرض كجدول مفصل"
                >
                  <Table className="h-3.5 w-3.5" />
                  <span>جدول</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-natural-primary text-white shadow-sm'
                      : 'text-natural-dark/60 hover:text-natural-dark'
                  }`}
                  title="عرض كبطاقات"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>بطاقات</span>
                </button>
              </div>
            </div>

            {/* Lead List Section */}
            {loading ? (
              <div className="text-center py-12 bg-natural-cream/20 rounded-2xl border border-natural-sand/50">
                <div className="animate-spin h-8 w-8 border-4 border-natural-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-natural-dark/60">جاري تحميل طلبات الزبناء...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-16 bg-natural-cream/20 rounded-2xl border border-natural-sand/50 text-natural-dark/60">
                <ShoppingBag className="h-12 w-12 mx-auto text-natural-dark/30 mb-3" />
                <h3 className="font-semibold text-natural-dark">حتى طلب ما مطابق للبحث</h3>
                <p className="text-xs mt-1">تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح، أو غير إعدادات التصفية.</p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="w-full overflow-x-auto bg-natural-cream/35 rounded-2xl border border-natural-sand/60 shadow-xs">
                <table className="w-full text-right border-collapse text-sm min-w-[800px]">
                  <thead>
                    <tr className="bg-natural-sand/20 border-b border-natural-sand/40 text-natural-dark font-bold">
                      <th className="p-4 text-right">الزبون / التاريخ</th>
                      <th className="p-4 text-right">الهاتف / المدينة</th>
                      <th className="p-4 text-right">تفاصيل الطلب</th>
                      <th className="p-4 text-right">المبلغ الإجمالي</th>
                      <th className="p-4 text-right">ملاحظات</th>
                      <th className="p-4 text-right">الحالة</th>
                      <th className="p-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-sand/30">
                    {filteredLeads.map((lead) => {
                      const getStatusStyles = (status: string) => {
                        switch(status) {
                          case 'مؤكد':
                            return 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          case 'تم الاتصال':
                            return 'bg-blue-50 text-blue-700 border-blue-100';
                          case 'ملغي':
                            return 'bg-rose-50 text-rose-700 border-rose-100';
                          default: // جديد
                            return 'bg-natural-cream text-natural-primary border-natural-sand/40';
                        }
                      };

                      return (
                        <tr key={lead.id} className="hover:bg-natural-sand/10 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-natural-dark">{lead.name}</span>
                              {settings.spreadsheetId && (
                                <span 
                                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${lead.sheetSynced ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}
                                  title={lead.sheetSynced ? 'متزامن مع Google Sheets' : 'غير متزامن بعد'}
                                >
                                  {lead.sheetSynced ? ' Sheets ✅' : ' Sheets ⏳'}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-natural-dark/50 flex items-center gap-1 mt-1 font-mono">
                              <Calendar className="h-3 w-3" />
                              {formatDate(lead.createdAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-mono tracking-wider text-natural-dark font-semibold">{lead.phone}</div>
                            <div className="text-xs text-natural-dark/60 mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-natural-dark/40" />
                              <span>{lead.city}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-natural-dark font-medium">{lead.tableType}</div>
                            <div className="text-xs text-natural-dark/50 mt-1">الكمية: {lead.quantity} طاولة</div>
                          </td>
                          <td className="p-4 font-mono font-bold text-natural-primary">
                            {(lead.quantity || 1) * settings.price} درهم
                          </td>
                          <td className="p-4 max-w-xs">
                            {lead.notes ? (
                              <p className="text-xs italic text-natural-dark/80 line-clamp-2" title={lead.notes}>
                                {lead.notes}
                              </p>
                            ) : (
                              <span className="text-natural-dark/30 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <select
                              value={lead.status}
                              onChange={(e) => updateStatus(lead.id, e.target.value)}
                              className={`bg-white border border-natural-sand/50 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-natural-primary text-natural-dark font-semibold ${getStatusStyles(lead.status)}`}
                            >
                              <option value="جديد">جديد ⏳</option>
                              <option value="تم الاتصال">تم الاتصال 📞</option>
                              <option value="مؤكد">مؤكد ✅</option>
                              <option value="ملغي">ملغي ❌</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <a
                                href={`tel:${lead.phone}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors cursor-pointer"
                                title="اتصال تلفوني"
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/${lead.phone.replace(/[\s+()]/g, '').startsWith('0') ? '212' + lead.phone.replace(/[\s+()]/g, '').substring(1) : lead.phone.replace(/[\s+()]/g, '')}?text=السلام%20عليكم%20معاك%20متجر%20MiniMDF.%20قمتي%20بطلب%20طاولة%20MDF%20صغيرة.%20بغينا%20نأكدوا%20معاك%20الطلب`}
                                target="_blank"
                                referrerPolicy="no-referrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors cursor-pointer"
                                title="مراسلة واتساب"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </a>
                              <button
                                onClick={() => deleteLead(lead.id)}
                                className="bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-500 p-2 rounded-lg transition-colors cursor-pointer"
                                title="حذف نهائي"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map((lead) => {
                  // Status Styling helper
                  const getStatusStyles = (status: string) => {
                    switch(status) {
                      case 'مؤكد':
                        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      case 'تم الاتصال':
                        return 'bg-blue-50 text-blue-700 border-blue-100';
                      case 'ملغي':
                        return 'bg-rose-50 text-rose-700 border-rose-100';
                      default: // جديد
                        return 'bg-natural-cream text-natural-primary border-natural-sand/40 animate-pulse';
                    }
                  };

                  return (
                    <motion.div
                      layout
                      key={lead.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-natural-cream/35 rounded-2xl border border-natural-sand/60 shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between"
                    >
                      {/* Card Header */}
                      <div className="p-5 border-b border-natural-sand/30">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(lead.status)}`}>
                            {lead.status}
                          </span>
                          <span className="text-xs text-natural-dark/50 flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3" />
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>

                        <h4 className="font-bold text-natural-dark text-base flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4 text-natural-dark/40 shrink-0" />
                            {lead.name}
                          </span>
                          {settings.spreadsheetId && (
                            <span 
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${lead.sheetSynced ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}
                              title={lead.sheetSynced ? 'متزامن مع Google Sheets' : 'غير متزامن بعد'}
                            >
                              {lead.sheetSynced ? 'Sheets ✅' : 'Sheets ⏳'}
                            </span>
                          )}
                        </h4>

                        <div className="mt-2 space-y-1.5 text-xs text-natural-dark/70">
                          <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-natural-dark/40 shrink-0" />
                            <span className="font-mono tracking-wider text-natural-dark font-semibold">{lead.phone}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-natural-dark/40 shrink-0" />
                            <span><strong>{lead.city}</strong> {lead.address ? ` - ${lead.address}` : ''}</span>
                          </p>
                        </div>
                      </div>

                      {/* Order Specifications */}
                      <div className="bg-natural-cream/60 p-4 border-b border-natural-sand/30 text-xs flex flex-wrap justify-between gap-3">
                        <div>
                          <span className="text-natural-dark/50 block">المنتج والنوع:</span>
                          <span className="font-semibold text-natural-dark">{lead.tableType}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-natural-dark/50 block">الكمية:</span>
                          <span className="font-bold text-natural-dark text-sm font-mono">{lead.quantity} طاولة</span>
                        </div>
                        <div className="text-left">
                          <span className="text-natural-dark/50 block">المبلغ الإجمالي:</span>
                          <span className="font-bold text-natural-primary text-sm font-mono">{(lead.quantity || 1) * settings.price} درهم</span>
                        </div>

                        {lead.notes && (
                          <div className="w-full mt-2 pt-2 border-t border-dashed border-natural-sand/50">
                            <span className="text-natural-dark/50 font-semibold block">ملاحظات الزبون:</span>
                            <p className="italic text-natural-dark/80">{lead.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions Area */}
                      <div className="p-4 bg-natural-cream/35 flex flex-col gap-3">
                        {/* Status Changer Select */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-natural-dark/50 shrink-0">تغيير الحالة:</span>
                          <select
                            value={lead.status}
                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                            className="bg-natural-bg border border-natural-sand/50 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-natural-primary flex-1 text-natural-dark"
                          >
                            <option value="جديد">جديد ⏳</option>
                            <option value="تم الاتصال">تم الاتصال 📞</option>
                            <option value="مؤكد">مؤكد ✅</option>
                            <option value="ملغي">ملغي ❌</option>
                          </select>
                        </div>

                        {/* Quick Call & Message Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <a
                            href={`tel:${lead.phone}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
                            title="اتصال تلفوني مباشر"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            اتصال
                          </a>

                          <a
                            href={`https://wa.me/${lead.phone.replace(/[\s+()]/g, '').startsWith('0') ? '212' + lead.phone.replace(/[\s+()]/g, '').substring(1) : lead.phone.replace(/[\s+()]/g, '')}?text=السلام%20عليكم%20معاك%20متجر%20MiniMDF.%20قمتي%20بطلب%20طاولة%20MDF%20صغيرة.%20بغينا%20نأكدوا%20معاك%20الطلب`}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
                            title="مراسلة عبر الواتساب"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            واتساب
                          </a>

                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-500 py-2 px-3 rounded-lg text-center flex items-center justify-center transition-colors cursor-pointer text-xs"
                            title="حذف الطلب نهائياً"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Product Settings Form Tab */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-natural-sand/60 shadow-xl p-6 md:p-8 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 border-b border-natural-sand/30 pb-4 mb-6">
              <div className="h-10 w-10 bg-natural-cream rounded-xl flex items-center justify-center text-natural-primary">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-natural-dark">تعديل معلومات المنتج المعروض 🏷️</h2>
                <p className="text-xs text-natural-dark/60">هنا تقدر تبدل اسم المنتج، الثمن ديالو، الصور ديال كل لون، وحتى رقم الواتساب.</p>
              </div>
            </div>

            {saveSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 animate-bounce">
                <Check className="h-5 w-5 shrink-0" />
                <p className="text-sm font-bold">تم حفظ جميع التعديلات بنجاح! سيتم تطبيقها في صفحة الزبناء مباشرة. ✅</p>
              </div>
            )}

            {saveError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-bold">{saveError}</p>
              </div>
            )}

            <form onSubmit={saveSettings} className="space-y-6 text-right">
              
              {/* Store Identity Settings Section */}
              <div className="bg-natural-cream/20 p-5 rounded-3xl border border-natural-sand/60 space-y-4">
                <h3 className="text-sm font-black text-natural-dark flex items-center gap-2 justify-start border-b border-natural-sand/20 pb-2">
                  <span className="text-base">🏠</span>
                  <span>هوية واسم المتجر (Store Identity)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Store Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-extrabold text-natural-dark block">اسم المتجر (Store Name) 🏪</label>
                    <input
                      type="text"
                      required
                      value={settings.storeName || ""}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-natural-sand/60 rounded-xl text-sm focus:outline-none focus:border-natural-primary transition-all text-natural-dark"
                      placeholder="مثال: بيتك ديكور • HOME DECOR"
                    />
                  </div>

                  {/* Store Logo */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-extrabold text-natural-dark block">شعار المتجر (Store Logo) 🖼️</label>
                    <ImageUploader 
                      value={settings.storeLogo}
                      onChange={(url) => setSettings({ ...settings, storeLogo: url })}
                      label="تحميل شعار جديد للمتجر 📤"
                    />
                    <div className="pt-2">
                      <label className="text-[11px] font-semibold text-natural-dark/70 block">رابط الشعار (URL):</label>
                      <input
                        type="text"
                        required
                        value={settings.storeLogo || ""}
                        onChange={(e) => setSettings({ ...settings, storeLogo: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-natural-sand/50 rounded-xl text-xs focus:outline-none focus:border-natural-primary text-left font-mono text-natural-dark"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-extrabold text-natural-dark block">اسم المنتج (Nome Montg) 📝</label>
                  <input
                    type="text"
                    required
                    value={settings.productName}
                    onChange={(e) => setSettings({ ...settings, productName: e.target.value })}
                    className="w-full px-4 py-3 bg-natural-bg border border-natural-sand/60 rounded-xl text-sm focus:outline-none focus:border-natural-primary focus:bg-white transition-all text-natural-dark"
                    placeholder="مثال: طاولة ميني MDF الأنيقة متعددة الاستعمالات"
                  />
                </div>

                {/* Selling Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-natural-dark block">ثمن البيع بالدرهم (Taman) 💰</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={settings.price}
                      onChange={(e) => setSettings({ ...settings, price: Number(e.target.value) })}
                      className="w-full pr-4 pl-12 py-3 bg-natural-bg border border-natural-sand/60 rounded-xl text-sm focus:outline-none focus:border-natural-primary focus:bg-white transition-all text-natural-dark font-mono font-bold"
                    />
                    <span className="absolute left-4 top-3 text-xs font-bold text-natural-dark/50">درهم (DH)</span>
                  </div>
                </div>

                {/* Original Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-natural-dark block">الثمن الأصلي قبل التخفيض (للشطب عليه) ❌</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={settings.originalPrice}
                      onChange={(e) => setSettings({ ...settings, originalPrice: Number(e.target.value) })}
                      className="w-full pr-4 pl-12 py-3 bg-natural-bg border border-natural-sand/60 rounded-xl text-sm focus:outline-none focus:border-natural-primary focus:bg-white transition-all text-natural-dark font-mono text-natural-dark/65"
                    />
                    <span className="absolute left-4 top-3 text-xs text-natural-dark/50">درهم (DH)</span>
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-extrabold text-natural-dark block">رقم الواتساب للطلب السريع (بالمفتاح الدولي بدون زائد، مثلا 212600000000) 💬</label>
                  <input
                    type="text"
                    required
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full px-4 py-3 bg-natural-bg border border-natural-sand/60 rounded-xl text-sm focus:outline-none focus:border-natural-primary focus:bg-white transition-all text-natural-dark font-mono"
                    placeholder="مثال: 212612345678"
                  />
                  <p className="text-[10px] text-natural-dark/50">هذا الرقم غادي يخدم مباشرة فاش الزبون يضغط على زر "طلب سريع عبر الواتساب".</p>
                </div>

                {/* Merchant WhatsApp Notification settings */}
                <div className="border-t border-natural-sand/30 pt-6 md:col-span-2 space-y-4">
                  <h3 className="text-sm font-black text-natural-dark flex items-center gap-1.5 justify-start">
                    <span>⚙️ إعدادات الإشعارات والطلب التلقائي عبر الواتساب للتاجر</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-natural-dark block">رقم هاتف استقبال الإشعارات (للتاجر) 📱</label>
                      <input
                        type="text"
                        required
                        value={settings.notificationWhatsapp || ''}
                        onChange={(e) => setSettings({ ...settings, notificationWhatsapp: e.target.value.replace(/[^0-9]/g, '') })}
                        className="w-full px-4 py-3 bg-natural-bg border border-natural-sand/60 rounded-xl text-sm focus:outline-none focus:border-natural-primary focus:bg-white transition-all text-natural-dark font-mono"
                        placeholder="مثال: 212636415659"
                      />
                      <p className="text-[10px] text-natural-dark/50">هذا هو الرقم اللي غادي توصلك فيه الرسائل ديال الطلبات الجديدة (الافتراضي: 0636415659).</p>
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-center">
                      <label className="text-xs font-extrabold text-natural-dark block mb-2">طريقة الإرسال والتوجيه 🛠️</label>
                      <label className="relative flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={settings.enableAutoRedirect ?? true}
                          onChange={(e) => setSettings({ ...settings, enableAutoRedirect: e.target.checked })}
                          className="h-4 w-4 text-natural-primary border-natural-sand/60 rounded-md focus:ring-natural-primary cursor-pointer"
                        />
                        <div className="text-xs font-semibold text-natural-dark">
                          توجيه تلقائي للزبون للواتساب بعد الضغط على "طلب الآن"
                        </div>
                      </label>
                      <p className="text-[10px] text-natural-dark/50 rtl:mr-7 mt-1">عند تفعيلها، بمجرد ما يضغط الزبون على "اطلب الآن"، غادي يتم فتح محادثة مباشرة معك فيها تفاصيل الطلب كاملة.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Sheets Integration Section */}
              <div className="border-t border-natural-sand/30 pt-6 mt-6 space-y-4">
                <h3 className="text-sm font-black text-natural-dark flex items-center gap-1.5 justify-start">
                  <span className="text-base">📊</span>
                  <span>ربط ومزامنة الطلبات مع Google Sheets</span>
                </h3>
                <p className="text-xs text-natural-dark/65 text-right">
                  هاد الخاصية كتمكنك باش توصل بجميع الطلبات الجديدة مباشرة فجدول بيانات Google Sheets ديالك بشكل تلقائي ومنظم.
                </p>

                <div className="bg-natural-cream/15 p-5 rounded-3xl border border-natural-sand/40 space-y-4">
                  {/* Auth Connection Status Card */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-natural-sand/30 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${googleUser ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-neutral-50 text-neutral-400 border border-neutral-200'}`}>
                        {googleUser ? '🟢' : '⚪'}
                      </div>
                      <div className="text-right col-reverse">
                        <span className="text-xs font-extrabold text-natural-dark block">حالة الاتصال بـ Google</span>
                        <span className="text-[11px] text-natural-dark/60 font-medium">
                          {googleUser ? `متصل بحساب: ${googleUser.email}` : 'غير متصل بحساب Google حالياً'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {googleUser ? (
                        <button
                          type="button"
                          onClick={handleDisconnectGoogle}
                          disabled={isSheetsAuthLoading}
                          className="bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-red-600 border border-neutral-200 text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          {isSheetsAuthLoading ? 'جاري إلغاء الربط...' : 'إلغاء ربط الحساب 🔌'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleConnectGoogle}
                          disabled={isSheetsAuthLoading}
                          className="bg-natural-primary hover:bg-natural-primary-dark text-white text-xs px-5 py-2.5 rounded-xl font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          {isSheetsAuthLoading ? (
                            <>
                              <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                              <span>جاري الاتصال...</span>
                            </>
                          ) : (
                            <>
                              <span>ربط حساب Google 🚀</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sync Status Info Message */}
                  {syncStatusMsg && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-bold ${syncStatusMsg.type === 'success' ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-red-50/50 border-red-200 text-red-800'}`}>
                      <span>{syncStatusMsg.type === 'success' ? '✅' : '⚠️'}</span>
                      <p className="flex-1">{syncStatusMsg.text}</p>
                    </div>
                  )}

                  {/* Spreadsheet Settings & Configuration (Only available if logged in) */}
                  {googleUser && (
                    <div className="space-y-4 pt-2 border-t border-natural-sand/20 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Create or view connected Spreadsheet */}
                        <div className="md:col-span-2 bg-natural-cream/20 p-4 rounded-2xl border border-natural-sand/30 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="text-right flex-1">
                            <span className="text-xs font-extrabold text-natural-dark block">جدول البيانات النشط (Active Spreadsheet)</span>
                            {settings.spreadsheetId ? (
                              <a
                                href={settings.spreadsheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 hover:underline font-bold mt-1 inline-flex items-center gap-1"
                              >
                                <span>{settings.spreadsheetName || 'فتح جدول البيانات في نافذة جديدة'}</span>
                                <span>🔗</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-amber-700 font-bold block mt-1">
                                لم تقم بإنشاء جدول بيانات حتى الآن. اضغط على الزر لإنشاء جدول منظم بشكل تلقائي.
                              </span>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCreateNewSpreadsheet}
                              disabled={isSheetsAuthLoading}
                              className="bg-white hover:bg-neutral-50 text-natural-dark border border-natural-sand/60 text-xs px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              {settings.spreadsheetId ? 'إنشاء جدول مبيعات جديد 📊' : 'إنشاء جدول مبيعات تلقائي 📊'}
                            </button>

                            {settings.spreadsheetId && (
                              <button
                                type="button"
                                onClick={() => syncLeadsToGoogleSheets()}
                                disabled={isSyncingSheets}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                {isSyncingSheets ? (
                                  <>
                                    <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>جاري المزامنة...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>مزامنة الطلبات المعلقة 🔄</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Manual entry for advanced users */}
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-extrabold text-natural-dark block">مُعرف جدول البيانات الحالي (Spreadsheet ID)</label>
                          <input
                            type="text"
                            value={settings.spreadsheetId || ''}
                            onChange={(e) => setSettings({ ...settings, spreadsheetId: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-natural-sand/60 rounded-xl text-xs focus:outline-none focus:border-natural-primary transition-all text-left font-mono text-natural-dark"
                            placeholder="مثال: 1a2B3c4D5e..."
                          />
                          <p className="text-[10px] text-natural-dark/50">هذا هو المعرف الفريد الخاص بـ Google Sheet للطلبات.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-extrabold text-natural-dark block">اسم جدول البيانات</label>
                          <input
                            type="text"
                            value={settings.spreadsheetName || ''}
                            onChange={(e) => setSettings({ ...settings, spreadsheetName: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-natural-sand/60 rounded-xl text-xs focus:outline-none focus:border-natural-primary transition-all text-natural-dark"
                            placeholder="مثال: مبيعات طاولة ميني MDF"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-extrabold text-natural-dark block">رابط جدول البيانات (Spreadsheet URL)</label>
                          <input
                            type="text"
                            value={settings.spreadsheetUrl || ''}
                            onChange={(e) => setSettings({ ...settings, spreadsheetUrl: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-natural-sand/60 rounded-xl text-xs focus:outline-none focus:border-natural-primary transition-all text-left font-mono text-natural-dark"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                          />
                        </div>
                      </div>

                      {/* Sync Status Badge */}
                      <div className="p-3.5 bg-natural-cream/30 rounded-2xl border border-natural-sand/30 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-natural-dark/70">حالة المزامنة الحالية:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-natural-dark">
                            {leads.filter(l => !l.sheetSynced).length} طلبات جديدة معلقة لم يتم مزامنتها بعد.
                          </span>
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Website Images Section */}
              <div className="border-t border-natural-sand/30 pt-6 mt-6 space-y-6">
                <h3 className="text-sm font-black text-natural-dark flex items-center gap-1.5 justify-start">
                  <ImageIcon className="h-4 w-4 text-natural-accent" />
                  <span>الصور الأساسية للموقع (الواجهة والمميزات والقياسات) 🖼️</span>
                </h3>

                {/* 1. Hero Image */}
                <div className="bg-natural-cream/15 p-4 rounded-2xl border border-natural-sand/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-natural-sand/20 pb-2">
                    <span className="text-xs font-bold text-natural-dark">1. الصورة الرئيسية للواجهة (Hero Image) 🌟</span>
                    <span className="text-[10px] bg-natural-accent/10 text-natural-accent font-extrabold px-2 py-0.5 rounded-full">أعلى الصفحة</span>
                  </div>

                  <ImageUploader 
                    value={settings.image_hero}
                    onChange={(url) => setSettings({ ...settings, image_hero: url })}
                    label="تحميل صورة رئيسية جديدة 📤"
                  />

                  <div className="space-y-1.5 pt-2 border-t border-natural-sand/20">
                    <label className="text-[11px] font-semibold text-natural-dark/70 block">رابط الصورة (URL):</label>
                    <input
                      type="text"
                      required
                      value={settings.image_hero}
                      onChange={(e) => setSettings({ ...settings, image_hero: e.target.value })}
                      className="w-full px-3 py-2 bg-natural-bg border border-natural-sand/50 rounded-xl text-xs focus:outline-none focus:border-natural-primary text-left font-mono text-natural-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-natural-dark/60 block">إرجاع للصورة الافتراضية:</span>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, image_hero: '/src/assets/images/regenerated_image_1783728041366.png' })}
                      className="text-[10px] bg-white hover:bg-neutral-50 text-natural-dark font-extrabold border border-natural-sand/50 px-3 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      إعادة لافتراضي المصنع 🔄
                    </button>
                  </div>
                </div>

                {/* 2. Features Image */}
                <div className="bg-natural-cream/15 p-4 rounded-2xl border border-natural-sand/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-natural-sand/20 pb-2">
                    <span className="text-xs font-bold text-natural-dark">2. صورة مميزات الاستعمال (Features Image) 🛋️</span>
                    <span className="text-[10px] bg-natural-accent/10 text-natural-accent font-extrabold px-2 py-0.5 rounded-full">وسط الصفحة</span>
                  </div>

                  <ImageUploader 
                    value={settings.image_features}
                    onChange={(url) => setSettings({ ...settings, image_features: url })}
                    label="تحميل صورة استعمال جديدة 📤"
                  />

                  <div className="space-y-1.5 pt-2 border-t border-natural-sand/20">
                    <label className="text-[11px] font-semibold text-natural-dark/70 block">رابط الصورة (URL):</label>
                    <input
                      type="text"
                      required
                      value={settings.image_features}
                      onChange={(e) => setSettings({ ...settings, image_features: e.target.value })}
                      className="w-full px-3 py-2 bg-natural-bg border border-natural-sand/50 rounded-xl text-xs focus:outline-none focus:border-natural-primary text-left font-mono text-natural-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-natural-dark/60 block">إرجاع للصورة الافتراضية:</span>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, image_features: '/src/assets/images/regenerated_image_1783728417810.png' })}
                      className="text-[10px] bg-white hover:bg-neutral-50 text-natural-dark font-extrabold border border-natural-sand/50 px-3 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      إعادة لافتراضي المصنع 🔄
                    </button>
                  </div>
                </div>

                {/* 3. Dimensions Image */}
                <div className="bg-natural-cream/15 p-4 rounded-2xl border border-natural-sand/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-natural-sand/20 pb-2">
                    <span className="text-xs font-bold text-natural-dark">3. صورة العبارات والأبعاد (Dimensions Blueprint) 📐</span>
                    <span className="text-[10px] bg-natural-accent/10 text-natural-accent font-extrabold px-2 py-0.5 rounded-full">القياسات</span>
                  </div>

                  <ImageUploader 
                    value={settings.image_dimensions}
                    onChange={(url) => setSettings({ ...settings, image_dimensions: url })}
                    label="تحميل مخطط القياسات الجديد 📤"
                  />

                  <div className="space-y-1.5 pt-2 border-t border-natural-sand/20">
                    <label className="text-[11px] font-semibold text-natural-dark/70 block">رابط الصورة (URL):</label>
                    <input
                      type="text"
                      required
                      value={settings.image_dimensions}
                      onChange={(e) => setSettings({ ...settings, image_dimensions: e.target.value })}
                      className="w-full px-3 py-2 bg-natural-bg border border-natural-sand/50 rounded-xl text-xs focus:outline-none focus:border-natural-primary text-left font-mono text-natural-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-natural-dark/60 block">إرجاع للصورة الافتراضية:</span>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, image_dimensions: '/src/assets/images/table_dimensions_1783724171797.jpg' })}
                      className="text-[10px] bg-white hover:bg-neutral-50 text-natural-dark font-extrabold border border-natural-sand/50 px-3 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      إعادة لافتراضي المصنع 🔄
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Images Sections */}
              <div className="border-t border-natural-sand/30 pt-6 mt-6 space-y-6">
                <h3 className="text-sm font-black text-natural-dark flex items-center gap-1.5 justify-start">
                  <ImageIcon className="h-4 w-4 text-natural-primary" />
                  <span>صور المنتج حسب الألوان المتوفرة (Photos) 📸</span>
                </h3>

                {/* Color Image 1: Natural Wood */}
                <div className="bg-natural-cream/15 p-4 rounded-2xl border border-natural-sand/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-natural-sand/20 pb-2">
                    <span className="text-xs font-bold text-natural-dark">1. اللون الطبيعي الدافئ (Chêne Naturel)</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  </div>

                  <ImageUploader 
                    value={settings.image_natural}
                    onChange={(url) => setSettings({ ...settings, image_natural: url })}
                    label="تحميل صورة جديدة مباشرة من جهازك (TiliCharga) 📤"
                  />

                  <div className="space-y-1.5 pt-2 border-t border-natural-sand/20">
                    <label className="text-[11px] font-semibold text-natural-dark/70 block">أو كتابة رابط الصورة يدوياً (URL):</label>
                    <input
                      type="text"
                      required
                      value={settings.image_natural}
                      onChange={(e) => setSettings({ ...settings, image_natural: e.target.value })}
                      className="w-full px-3 py-2 bg-natural-bg border border-natural-sand/50 rounded-xl text-xs focus:outline-none focus:border-natural-primary text-left font-mono text-natural-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-natural-dark/60 block">أو اختر صورة جاهزة بضغطة واحدة:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {presetImages.map((img) => (
                        <button
                          key={img.path}
                          type="button"
                          onClick={() => setSettings({ ...settings, image_natural: img.path })}
                          className={`p-1 bg-white border rounded-lg overflow-hidden transition-all text-center flex flex-col items-center justify-center cursor-pointer ${settings.image_natural === img.path ? 'border-natural-primary ring-2 ring-natural-primary/25' : 'border-neutral-200 hover:border-natural-sand'}`}
                        >
                          <img src={img.path} alt={img.label} className="h-10 w-full object-cover rounded-md" referrerPolicy="no-referrer" />
                          <span className="text-[9px] text-natural-dark/80 mt-1 truncate w-full px-0.5">{img.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Color Image 2: Dark Wood */}
                <div className="bg-natural-cream/15 p-4 rounded-2xl border border-natural-sand/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-natural-sand/20 pb-2">
                    <span className="text-xs font-bold text-natural-dark">2. اللون البني الداكن الفاخر (Noyer Foncé)</span>
                    <span className="w-2 h-2 rounded-full bg-yellow-950"></span>
                  </div>

                  <ImageUploader 
                    value={settings.image_dark}
                    onChange={(url) => setSettings({ ...settings, image_dark: url })}
                    label="تحميل صورة جديدة مباشرة من جهازك (TiliCharga) 📤"
                  />

                  <div className="space-y-1.5 pt-2 border-t border-natural-sand/20">
                    <label className="text-[11px] font-semibold text-natural-dark/70 block">أو كتابة رابط الصورة يدوياً (URL):</label>
                    <input
                      type="text"
                      required
                      value={settings.image_dark}
                      onChange={(e) => setSettings({ ...settings, image_dark: e.target.value })}
                      className="w-full px-3 py-2 bg-natural-bg border border-natural-sand/50 rounded-xl text-xs focus:outline-none focus:border-natural-primary text-left font-mono text-natural-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-natural-dark/60 block">أو اختر صورة جاهزة بضغطة واحدة:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {presetImages.map((img) => (
                        <button
                          key={img.path}
                          type="button"
                          onClick={() => setSettings({ ...settings, image_dark: img.path })}
                          className={`p-1 bg-white border rounded-lg overflow-hidden transition-all text-center flex flex-col items-center justify-center cursor-pointer ${settings.image_dark === img.path ? 'border-natural-primary ring-2 ring-natural-primary/25' : 'border-neutral-200 hover:border-natural-sand'}`}
                        >
                          <img src={img.path} alt={img.label} className="h-10 w-full object-cover rounded-md" referrerPolicy="no-referrer" />
                          <span className="text-[9px] text-natural-dark/80 mt-1 truncate w-full px-0.5">{img.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Color Image 3: Matte White */}
                <div className="bg-natural-cream/15 p-4 rounded-2xl border border-natural-sand/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-natural-sand/20 pb-2">
                    <span className="text-xs font-bold text-natural-dark">3. اللون الأبيض العصري (Blanc Moderne)</span>
                    <span className="w-2 h-2 rounded-full bg-neutral-200 border border-neutral-400"></span>
                  </div>

                  <ImageUploader 
                    value={settings.image_white}
                    onChange={(url) => setSettings({ ...settings, image_white: url })}
                    label="تحميل صورة جديدة مباشرة من جهازك (TiliCharga) 📤"
                  />

                  <div className="space-y-1.5 pt-2 border-t border-natural-sand/20">
                    <label className="text-[11px] font-semibold text-natural-dark/70 block">أو كتابة رابط الصورة يدوياً (URL):</label>
                    <input
                      type="text"
                      required
                      value={settings.image_white}
                      onChange={(e) => setSettings({ ...settings, image_white: e.target.value })}
                      className="w-full px-3 py-2 bg-natural-bg border border-natural-sand/50 rounded-xl text-xs focus:outline-none focus:border-natural-primary text-left font-mono text-natural-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-natural-dark/60 block">أو اختر صورة جاهزة بضغطة واحدة:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {presetImages.map((img) => (
                        <button
                          key={img.path}
                          type="button"
                          onClick={() => setSettings({ ...settings, image_white: img.path })}
                          className={`p-1 bg-white border rounded-lg overflow-hidden transition-all text-center flex flex-col items-center justify-center cursor-pointer ${settings.image_white === img.path ? 'border-natural-primary ring-2 ring-natural-primary/25' : 'border-neutral-200 hover:border-natural-sand'}`}
                        >
                          <img src={img.path} alt={img.label} className="h-10 w-full object-cover rounded-md" referrerPolicy="no-referrer" />
                          <span className="text-[9px] text-natural-dark/80 mt-1 truncate w-full px-0.5">{img.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-natural-sand/30 pt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('هل تريد إلغاء التغييرات والرجوع؟')) {
                      setActiveTab('orders');
                    }
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200 text-natural-dark px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء التعديل ❌
                </button>
                
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="bg-natural-primary hover:bg-natural-primary-dark text-white px-8 py-3 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  {settingsLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>حفظ جميع التغييرات 💾</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </main>

      {/* Real-time In-App Order Notification Toast */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-6 left-6 z-50 max-w-sm w-full bg-white border-2 border-emerald-500 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 overflow-hidden text-right rtl"
            dir="rtl"
          >
            {/* Pulse line decoration */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-500" />
            
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <ShoppingBag className="h-5 w-5 animate-bounce" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">طلب جديد مكتمل! 📦</span>
                  <button 
                    onClick={() => setNewOrderAlert(null)}
                    className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="text-sm font-black text-neutral-800">وصلك طلب جديد من {newOrderAlert.name}!</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  من مدينة {newOrderAlert.city} • {newOrderAlert.tableType} (الكمية: {newOrderAlert.quantity || 1})
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 justify-end border-t border-neutral-100 pt-2.5 mt-1">
              <button
                onClick={() => {
                  setSearchTerm(newOrderAlert.name);
                  setStatusFilter('all');
                  setCityFilter('all');
                  setActiveTab('orders');
                  setNewOrderAlert(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                عرض الطلب وتتبعه 🔍
              </button>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                إغلاق ❌
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
