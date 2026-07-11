import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  MessageCircle, 
  Phone, 
  ChevronDown, 
  Menu, 
  X,
  MapPin,
  Check,
  Smartphone,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SuccessModal from './SuccessModal';
import { getSettings, addLead } from '../lib/storage';

interface LandingPageProps {
  onAdminAccess: (mode: 'orders' | 'settings') => void;
}

export default function LandingPage({ onAdminAccess }: LandingPageProps) {
  // Mobile Nav toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dimensions Image Zoom state
  const [isZoomed, setIsZoomed] = useState(false);

  // Color Image Zoom state
  const [isColorZoomed, setIsColorZoomed] = useState(false);

  // Dynamic Product Settings State
  const [settings, setSettings] = useState({
    storeName: 'بيتك ديكور • HOME DECOR',
    storeLogo: '/uploads/uploaded_1783728842800_snufn.jpg',
    productName: 'طاولة ميني MDF الأنيقة متعددة الاستعمالات',
    price: 199,
    originalPrice: 299,
    whatsappNumber: '212600000000',
    notificationWhatsapp: '212636415659',
    enableAutoRedirect: true,
    image_natural: '/src/assets/images/table_colors_1783722948300.jpg',
    image_dark: '/src/assets/images/hero_table_1783722935630.jpg',
    image_white: '/src/assets/images/table_utility_1783722963162.jpg',
    image_hero: '/src/assets/images/regenerated_image_1783728041366.png',
    image_features: '/src/assets/images/regenerated_image_1783728417810.png',
    image_dimensions: '/src/assets/images/table_dimensions_1783724171797.jpg'
  });

  // Logo secret clicks for admin access
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastLogoClick, setLastLogoClick] = useState(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastLogoClick < 3000) {
      const nextClicks = logoClicks + 1;
      setLogoClicks(nextClicks);
      if (nextClicks >= 5) {
        setShowAdminPasscodeModal(true);
        setLogoClicks(0);
      }
    } else {
      setLogoClicks(1);
    }
    setLastLogoClick(now);
  };

  // Fetch settings on mount & check URL for admin query trigger
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
        if (data.storeName) {
          document.title = data.storeName;
        }
      } catch (err) {
        console.error('Failed to fetch settings on landing page:', err);
      }
    };
    fetchSettings();

    // Check for secret admin query or hash in URL (?admin=true, ?orders=true, ?settings=true, #admin, #orders, #settings)
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get('admin') === 'true' || 
      urlParams.get('orders') === 'true' || 
      urlParams.get('settings') === 'true' || 
      window.location.hash === '#admin' || 
      window.location.hash === '#orders' || 
      window.location.hash === '#settings'
    ) {
      setShowAdminPasscodeModal(true);
    }
  }, []);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('wood_natural'); // 'wood_natural', 'wood_dark', 'matte_white'
  const [notes, setNotes] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [submittedTableType, setSubmittedTableType] = useState('');
  const [submittedQuantity, setSubmittedQuantity] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  // Admin access passcode state
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pricePerTable = settings.price;
  const originalPrice = settings.originalPrice;

  const discountPercentage = originalPrice > pricePerTable 
    ? Math.round(((originalPrice - pricePerTable) / originalPrice) * 100)
    : 33;

  const getColorImage = () => {
    switch (selectedColor) {
      case 'wood_dark':
        return settings.image_dark || "/src/assets/images/hero_table_1783722935630.jpg";
      case 'matte_white':
        return settings.image_white || "/src/assets/images/table_utility_1783722963162.jpg";
      case 'wood_natural':
      default:
        return settings.image_natural || "/src/assets/images/table_colors_1783722948300.jpg";
    }
  };

  // Popular Moroccan cities for autocomplete suggestions
  const popularCities = [
    'الدار البيضاء', 'الرباط', 'مراكش', 'طنجة', 'فاس', 
    'سلا', 'أكادير', 'القنيطرة', 'وجدة', 'تطوان', 'مكناس',
    'الناظور', 'المحمدية', 'الجديدة', 'آسفي', 'بني ملال'
  ];

  const colors = {
    wood_natural: 'طبيعي دافئ (Chêne Naturel)',
    wood_dark: 'بني داكن فاخر (Noyer Foncé)',
    matte_white: 'أبيض عصري (Blanc Moderne)'
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!fullName.trim()) {
      setFormError('الرجاء إدخال الاسم الكامل ديالك');
      return;
    }
    if (!phone.trim()) {
      setFormError('الرجاء إدخال رقم الهاتف للتواصل معك');
      return;
    }
    
    // Moroccan phone validation: should start with 06, 07, 05 or +212, and contain at least 9 or 10 digits
    const cleanPhone = phone.replace(/[\s+()]/g, '');
    if (cleanPhone.length < 9) {
      setFormError('رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف صالح.');
      return;
    }

    if (!city.trim()) {
      setFormError('الرجاء إدخال المدينة ديالك');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Save lead to local storage database
      await addLead({
        name: fullName,
        phone,
        city,
        address,
        quantity,
        tableType: `طاولة MDF - لون ${colors[selectedColor as keyof typeof colors]}`,
        notes
      });

      setOrderName(fullName);
      const tableColorStr = colors[selectedColor as keyof typeof colors] || '';
      setSubmittedTableType(tableColorStr);
      setSubmittedQuantity(quantity);
      setShowSuccess(true);
      
      // Reset form
      setFullName('');
      setPhone('');
      setCity('');
      setAddress('');
      setQuantity(1);
      setNotes('');
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء تسجيل طلبك. المرجو المحاولة مجدداً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    if (cleanPass === 'homedecorstore') {
      setShowAdminPasscodeModal(false);
      setPasscode('');
      setPasscodeError('');
      onAdminAccess('orders');
    } else if (cleanPass === 'OR2002fane') {
      setShowAdminPasscodeModal(false);
      setPasscode('');
      setPasscodeError('');
      onAdminAccess('settings');
    } else {
      setPasscodeError('رقم السري خاطئ! المرجو المحاولة مجددا.');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const faqs = [
    {
      q: 'شحال كياخد التوصيل ديال الطاولة؟',
      a: 'التوصيل سريع بزاف! كياخد ما بين 24 لـ 48 ساعة حتال باب الدار في جميع مدن المغرب.'
    },
    {
      q: 'كيفاش كتدوز عملية الدفع؟',
      a: 'الدفع آمن 100%. ما كتخلص حتى شي حاجة مسبقاً، حتى كتوصلك الطاولة ديالك وتفحص الجودة ديال الخشب وتقيسها بيدك عاد كتخلص الموزع كاش (Cash on Delivery).'
    },
    {
      q: 'شنو هي المادة المصنوعة منها الطاولة؟',
      a: 'الطاولة مصنوعة بالكامل من خشب MDF الممتاز والمقاوم للماء والرطوبة والخدوش، مع أرجل قوية تضمن ثبات تام ومظهر عصري راقٍ.'
    },
    {
      q: 'شحال هما القياسات ديال الطاولة؟',
      a: 'الطاولة مصممة بحجم ذكي ومناسب جداً للغرف العصرية: الطول 55 سم، العرض 35 سم، والارتفاع 60 سم. مثالية للابتوب، القهوة، أو القراءة.'
    },
    {
      q: 'إلى لقيت فيها شي مشكل شنو المعمول؟',
      a: 'عندك ضمان كامل! إذا كان هناك أي خلل أو عيب في التصنيع، كنتكلفو بالتبديل مجاناً بدون أي مصاريف إضافية. هدفنا هو رضا الزبناء ديالنا.'
    }
  ];

  return (
    <div className="min-h-screen bg-natural-bg text-natural-dark font-sans selection:bg-natural-accent/20 selection:text-natural-dark" dir="rtl">
      
      {/* Top Shipping Promo Banner */}
      <div className="bg-gradient-to-r from-natural-dark via-natural-primary to-natural-accent py-2.5 px-4 text-center text-xs md:text-sm font-semibold text-white tracking-wide shadow-xs flex items-center justify-center gap-2">
        <Truck className="h-4 w-4 animate-bounce shrink-0" />
        <span>توصيل فابور (مجاني) لجميع المدن المغربية 🇲🇦 والدفع كاش عند الاستلام!</span>
      </div>

      {/* Main Sticky Navbar */}
      <nav className="bg-natural-bg/90 backdrop-blur-md sticky top-0 z-40 border-b border-natural-sand/50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span 
                className="text-lg md:text-2xl font-black text-natural-primary tracking-tight font-sans flex items-center gap-2 cursor-pointer select-none" 
                onClick={() => {
                  window.scrollTo({top: 0, behavior: 'smooth'});
                  handleLogoClick();
                }}
                title={settings.storeName || "بيتك ديكور • HOME DECOR"}
              >
                {settings.storeLogo ? (
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-natural-sand shadow-sm flex items-center justify-center">
                    <img 
                      src={settings.storeLogo} 
                      alt={settings.storeName || "Home Decor Logo"} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <span className="text-natural-primary bg-natural-cream p-1.5 rounded-xl border border-natural-sand/40">🪵</span>
                )}
                <span className="text-base md:text-xl font-black text-[#e1dc38]">{settings.storeName || "بيتك ديكور • HOME DECOR"}</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-natural-dark/80">
              <button onClick={() => scrollToSection('features')} className="hover:text-natural-primary transition-colors cursor-pointer">المميزات</button>
              <button onClick={() => scrollToSection('colors')} className="hover:text-natural-primary transition-colors cursor-pointer">الألوان المتوفرة</button>
              <button onClick={() => scrollToSection('reviews')} className="hover:text-natural-primary transition-colors cursor-pointer">آراء الزبناء</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-natural-primary transition-colors cursor-pointer">الأسئلة الشائعة</button>
            </div>

            {/* CTA Button only (Admin Access Button Hidden) */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => scrollToSection('order-form')}
                className="bg-natural-primary hover:bg-natural-primary-dark text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                اطلب الآن
              </button>
            </div>

            {/* Mobile Burger Menu Button only (Lock button Hidden) */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-natural-dark/70 hover:bg-natural-cream rounded-xl"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-natural-sand/40 bg-natural-bg shadow-lg overflow-hidden"
            >
              <div className="px-4 pt-3 pb-6 space-y-3 flex flex-col font-medium">
                <button onClick={() => scrollToSection('features')} className="text-right py-2 px-3 hover:bg-natural-cream rounded-lg text-natural-dark/80">المميزات</button>
                <button onClick={() => scrollToSection('colors')} className="text-right py-2 px-3 hover:bg-natural-cream rounded-lg text-natural-dark/80">الألوان المتوفرة</button>
                <button onClick={() => scrollToSection('reviews')} className="text-right py-2 px-3 hover:bg-natural-cream rounded-lg text-natural-dark/80">آراء الزبناء</button>
                <button onClick={() => scrollToSection('faq')} className="text-right py-2 px-3 hover:bg-natural-cream rounded-lg text-natural-dark/80">الأسئلة الشائعة</button>
                
                <div className="pt-3 border-t border-natural-sand/40 flex flex-col gap-2">
                  <button 
                    onClick={() => scrollToSection('order-form')}
                    className="w-full bg-natural-primary hover:bg-natural-primary-dark text-white font-bold py-3.5 rounded-xl text-center shadow-md flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    اضغط هنا للطلب مباشرة
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-24 bg-gradient-to-b from-natural-cream/50 via-natural-bg to-transparent">
        {/* Background Decorative Blobs */}
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-natural-accent/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-0 w-60 h-60 bg-natural-olive/10 rounded-full blur-2xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Text details */}
            <div className="space-y-6 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-natural-cream border border-natural-sand/60 px-3 py-1.5 rounded-full text-natural-primary text-xs md:text-sm font-semibold shadow-xs">
                <Sparkles className="h-4 w-4 text-natural-accent animate-spin" />
                <span>المنتج الأكثر مبيعاً في المغرب لعام 2026 🏆</span>
              </div>
              
              <h1 className="text-3.5xl md:text-5xl lg:text-5.5xl font-black text-natural-dark leading-tight tracking-tight font-sans">
                {settings.productName}
              </h1>

              <p className="text-base md:text-lg text-natural-dark/85 leading-relaxed max-w-xl mx-auto lg:mx-0">
                الحل العصري والأنيق اللي كتقلب عليه لصالونك، بيت النعاس، أو للمكتب! طاولة مصنوعة من خشب MDF الممتاز والمقاوم للماء، خفيفة وسهلة التنقل، كتصلح للابتوب، القهوة، أو كديكور راقٍ يزيد من جمالية منزلك.
              </p>

              {/* Pricing Cards */}
              <div className="flex items-center justify-center lg:justify-start gap-4 py-2">
                <div className="bg-natural-cream border border-natural-sand/60 px-5 py-3 rounded-2xl">
                  <span className="text-xs text-natural-dark/50 block line-through">{settings.originalPrice} درهم</span>
                  <span className="text-2xl md:text-3xl font-black text-natural-primary font-mono">{settings.price} <span className="text-sm font-semibold">درهم</span></span>
                </div>
                <div className="text-right">
                  <span className="bg-natural-olive text-white text-xs font-bold px-2.5 py-1 rounded-md inline-block uppercase animate-pulse">
                    تخفيض -{discountPercentage}% 🔥
                  </span>
                  <p className="text-xs text-emerald-600 font-bold mt-1">التوصيل مجاني لجميع المدن المغربية 🇲🇦</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => scrollToSection('order-form')}
                  className="w-full sm:w-auto bg-natural-primary hover:bg-natural-primary-dark text-white font-bold text-lg px-8 py-4.5 rounded-2xl transition-all shadow-lg hover:shadow-natural-primary/20 hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="h-5 w-5 animate-bounce" />
                  اطلب الآن (الدفع عند الاستلام)
                </button>
                
                <a
                  href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`السلام عليكم، بغيت نسول على طاولة ميني MDF بلون ${colors[selectedColor as keyof typeof colors]}`)}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-6 py-4.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="h-5 w-5 fill-white text-emerald-600" />
                  طلب سريع عبر الواتساب
                </a>
              </div>

              {/* Benefits badge triggers */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-natural-sand/40 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="h-9 w-9 bg-natural-cream rounded-lg flex items-center justify-center text-natural-primary mx-auto mb-1 border border-natural-sand/40">
                    <Truck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-natural-dark block">توصيل فابور</span>
                </div>
                <div className="text-center">
                  <div className="h-9 w-9 bg-natural-olive/10 rounded-lg flex items-center justify-center text-natural-olive mx-auto mb-1 border border-natural-olive/10">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-natural-dark block">الدفع عند الاستلام</span>
                </div>
                <div className="text-center">
                  <div className="h-9 w-9 bg-natural-cream rounded-lg flex items-center justify-center text-natural-accent mx-auto mb-1 border border-natural-sand/40">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-natural-dark block">ضمان الجودة 100%</span>
                </div>
              </div>
            </div>

            {/* Hero Image Presentation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-natural-primary/10 to-natural-accent/10 rounded-3xl -z-10 transform rotate-3 scale-102" />
              <div className="rounded-3xl border-4 border-natural-bg shadow-2xl overflow-hidden relative">
                {/* Real generated image */}
                <img 
                  src={settings.image_hero || "/src/assets/images/regenerated_image_1783728041366.png"} 
                  alt="MDF Mini Table Modern Setup" 
                  className="w-full object-cover max-h-[450px]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Mini promo badge overlaid */}
                <div className="absolute bottom-4 right-4 bg-natural-dark/95 text-natural-bg px-4 py-2.5 rounded-xl backdrop-blur-xs text-right border border-natural-sand/20 shadow-lg">
                  <p className="text-[10px] text-natural-accent font-bold uppercase tracking-wide">الخامة الفخمة</p>
                  <p className="text-xs font-bold mt-0.5">خشب MDF صلب مقاوم للماء والرطوبة</p>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-6 -left-6 bg-natural-bg/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-natural-sand/40 hidden md:flex items-center gap-3 max-w-xs text-right">
                <div className="h-10 w-10 rounded-full bg-natural-cream flex items-center justify-center font-bold text-natural-primary border border-natural-sand/40">س</div>
                <div>
                  <div className="flex text-yellow-400 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-xs font-bold text-natural-dark">"طاولة رائعة وخفيفة ونفعتني بزاف للخدمة"</p>
                  <span className="text-[10px] text-natural-dark/60 block mt-0.5">سناء من الرباط</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section id="features" className="py-16 bg-natural-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-black text-natural-dark font-sans">
              علاش هاد الطاولة خاصة وضرورية في كل دار مغربية؟ 🏡
            </h2>
            <p className="text-sm md:text-base text-natural-dark/75">
              صممنا هاد الطاولة الميني لتجمع بين المنظر الديكوري الراقي والمنفعة العملية الكبيرة في الحياة اليومية.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Practical Image Side */}
            <div className="relative">
              <div className="absolute inset-0 bg-natural-primary/5 rounded-3xl -z-10 transform -rotate-2 scale-102" />
              <div className="rounded-3xl border border-natural-sand/60 shadow-xl overflow-hidden">
                <img 
                  src={settings.image_features || "/src/assets/images/regenerated_image_1783728417810.png"} 
                  alt="Practical use mini MDF table next to sofa" 
                  className="w-full h-full object-cover max-h-[400px]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* List of Specs/Features details */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 bg-natural-cream rounded-2xl flex items-center justify-center text-natural-primary border border-natural-sand/40">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-natural-dark">خشب MDF ممتاز ومقاوم للرطوبة 💦</h3>
                  <p className="text-sm text-natural-dark/80 mt-1 leading-relaxed">
                    مغطي بطبقة عازلة كتحميه بالكامل من الماء، القهوة، أو العصير المنسكب. سهلة التنظيف بمسحة خفيفة فقط وكتدوم لسنوات طويلة بلا ما تتقشر.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 bg-natural-cream rounded-2xl flex items-center justify-center text-natural-primary border border-natural-sand/40">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-natural-dark">حجم ذكي وخفيفة للتحريك والرفع 🛋️</h3>
                  <p className="text-sm text-natural-dark/80 mt-1 leading-relaxed">
                    كتزن أقل من 3 كيلوغرام، مما كيسهل عليك تهزها وتديها معاك فين ما بغيتي: لبيت النعاس، الصالون، البالكون، أو حتى تستعملها كحامل للأكل فوق السرير.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 bg-natural-cream rounded-2xl flex items-center justify-center text-natural-primary border border-natural-sand/40">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-natural-dark">تصميم بوهيمي/عصري يناسب جميع الديكورات ✨</h3>
                  <p className="text-sm text-natural-dark/80 mt-1 leading-relaxed">
                    سواء كان صالونك بلدي مغربي أو رومي عصري، بفضل الألوان الراقية والأرجل المتينة المائلة، الطاولة كتعطي لمسة دافئة للمكان وكترتب الفضاء بشكل جمالي.
                  </p>
                </div>
              </div>

              {/* Order Button trigger */}
              <div className="pt-4 text-center lg:text-right">
                <button
                  onClick={() => scrollToSection('order-form')}
                  className="bg-natural-dark hover:bg-natural-primary text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  طلب الطاولة الآن 🛍️
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Table Dimensions & Blueprint Section */}
      <section id="dimensions" className="py-16 bg-natural-bg border-t border-natural-sand/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-natural-primary bg-natural-cream px-3 py-1 rounded-full border border-natural-sand/40">القياسات والأبعاد</span>
            <h2 className="text-3xl font-black text-natural-dark font-sans">
              شحال هو العبار ديال هاد الطاولة؟ 📐
            </h2>
            <p className="text-sm md:text-base text-natural-dark/75">
              قياسات مدروسة بدقة باش تناسب أي فضاء في بيتك بلا ما تضيق الصالون أو بيت النعاس ديالك.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Dimensions Image Column */}
            <div className="lg:col-span-5 relative order-last lg:order-first">
              <div className="absolute inset-0 bg-natural-primary/5 rounded-3xl -z-10 transform -rotate-3 scale-102" />
              <div 
                onClick={() => setIsZoomed(true)}
                className="rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white p-3 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-300 relative group"
                title="اضغط لتكبير صورة القياسات بوضوح"
              >
                <div className="relative overflow-hidden rounded-2xl bg-neutral-50/50 flex items-center justify-center">
                  <img 
                    src={settings.image_dimensions || "/src/assets/images/table_dimensions_1783724171797.jpg"} 
                    alt="قياسات وأبعاد الطاولة ميني MDF" 
                    className="w-full h-auto object-contain max-h-[420px] transition-transform duration-300 group-hover:scale-[1.01]"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Glassy Overlay on Hover */}
                  <div className="absolute inset-0 bg-natural-dark/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <span className="bg-white/95 backdrop-blur-md text-natural-dark text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                      <span>عرض الصورة كاملة وبشكل واضح 🔍</span>
                    </span>
                  </div>
                </div>
              </div>
              {/* Floating label */}
              <div className="absolute top-4 right-4 bg-natural-dark text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-natural-sand/20 shadow-lg">
                مخطط العبارات الحقيقية
              </div>
            </div>

            {/* Dimensions Specifications Column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-natural-cream/25 p-6 rounded-3xl border border-natural-sand/40 space-y-6">
                <h3 className="text-xl font-bold text-natural-dark border-b border-natural-sand/30 pb-3 flex items-center justify-start gap-2">
                  <span>الأبعاد والعبارات المضبوطة</span>
                  <span className="text-xl">📏</span>
                </h3>

                <div className="space-y-4">
                  {/* Total Height */}
                  <div className="flex justify-between items-center bg-natural-bg p-3.5 rounded-xl border border-natural-sand/30 shadow-xs">
                    <div className="space-y-0.5 text-right">
                      <span className="text-sm font-bold text-natural-dark block">الارتفاع الإجمالي للطاولة</span>
                      <span className="text-xs text-natural-dark/65 block">ارتفاع مثالي كيجي متناسق ومريح مع يد الصالون المغربي أو السرير.</span>
                    </div>
                    <span className="text-base font-black text-natural-primary font-sans">55 cm</span>
                  </div>

                  {/* Total Width */}
                  <div className="flex justify-between items-center bg-natural-bg p-3.5 rounded-xl border border-natural-sand/30 shadow-xs">
                    <div className="space-y-0.5 text-right">
                      <span className="text-sm font-bold text-natural-dark block">العرض الإجمالي</span>
                      <span className="text-xs text-natural-dark/65 block">مساحة كافية تهز ليك لابتوب، كاس القهوة، وكتوبة ديالك بكل أريحية.</span>
                    </div>
                    <span className="text-base font-black text-natural-primary font-sans">30 cm</span>
                  </div>

                  {/* Depth */}
                  <div className="flex justify-between items-center bg-natural-bg p-3.5 rounded-xl border border-natural-sand/30 shadow-xs">
                    <div className="space-y-0.5 text-right">
                      <span className="text-sm font-bold text-natural-dark block">العمق</span>
                      <span className="text-xs text-natural-dark/65 block">حجم ذكي ومدمج كيخليها ما كتاخدش المساحة بزاف في الغرفة.</span>
                    </div>
                    <span className="text-base font-black text-natural-primary font-sans">20 cm</span>
                  </div>

                  {/* Top Shelf */}
                  <div className="flex justify-between items-center bg-natural-bg p-3.5 rounded-xl border border-natural-sand/30 shadow-xs">
                    <div className="space-y-0.5 text-right">
                      <span className="text-sm font-bold text-natural-dark block">عمق الرف العلوي</span>
                      <span className="text-xs text-natural-dark/65 block">مخصص لوضع إطارات الصور، المنبه، أو الهواتف والديكورات الصغيرة.</span>
                    </div>
                    <span className="text-base font-black text-natural-primary font-sans">17 cm</span>
                  </div>

                  {/* Pillar Thickness */}
                  <div className="flex justify-between items-center bg-natural-bg p-3.5 rounded-xl border border-natural-sand/30 shadow-xs">
                    <div className="space-y-0.5 text-right">
                      <span className="text-sm font-bold text-natural-dark block">عرض العمود الداعم الرئيسي</span>
                      <span className="text-xs text-natural-dark/65 block">أعمدة سميكة ومتينة مصنوعة من خشب MDF الصلب لضمان توازن وثبات كاملين.</span>
                    </div>
                    <span className="text-base font-black text-natural-primary font-sans">8 cm</span>
                  </div>
                </div>
              </div>

              {/* Call to action card */}
              <div className="bg-natural-primary/5 border border-natural-primary/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-natural-dark">عجباتك القياسات ديال الطاولة؟ ✅</h4>
                  <p className="text-xs text-natural-dark/70">اطلبها دابا باللون المفضل عندك والتوصيل حتى لباب الدار فابور!</p>
                </div>
                <button
                  onClick={() => scrollToSection('order-form')}
                  className="bg-natural-primary hover:bg-natural-primary-dark text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  نعم، اطلب الآن 🛒
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Colors Showcase Section */}
      <section id="colors" className="py-16 bg-natural-cream/30 border-y border-natural-sand/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-natural-primary bg-natural-cream px-3 py-1 rounded-full border border-natural-sand/40">تشكيلة فخمة</span>
            <h2 className="text-3xl font-black text-natural-dark font-sans">ألوان راقية لجميع الأذواق 🎨</h2>
            <p className="text-sm text-natural-dark/85">
              اختر اللون المناسب اللي غايتماشى بامتياز مع أثاث وصالون بيتك!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Color Description & Selection preview */}
            <div className="space-y-6">
              
              <div className="bg-natural-bg p-5 rounded-2xl border border-natural-sand/40 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-natural-dark">الألوان المتوفرة الآن في المخزون:</h3>
                
                {/* Natural Wood Option */}
                <div 
                  onClick={() => setSelectedColor('wood_natural')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedColor === 'wood_natural' ? 'border-natural-primary bg-natural-cream/60 shadow-inner' : 'border-natural-sand/40 hover:border-natural-sand'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#d7ccc8] border border-amber-800" />
                    <div>
                      <h4 className="font-bold text-sm text-natural-dark">اللون الطبيعي الخشبي الدافئ</h4>
                      <p className="text-xs text-natural-dark/60">يعطي شعور بالدفء والراحة البوهيمية العصرية.</p>
                    </div>
                  </div>
                  {selectedColor === 'wood_natural' && <div className="h-5 w-5 rounded-full bg-natural-primary flex items-center justify-center text-white"><Check className="h-3 w-3" /></div>}
                </div>

                {/* Dark Walnut Option */}
                <div 
                  onClick={() => setSelectedColor('wood_dark')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedColor === 'wood_dark' ? 'border-natural-primary bg-natural-cream/60 shadow-inner' : 'border-natural-sand/40 hover:border-natural-sand'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-[#4e342e] border border-neutral-700" />
                    <div>
                      <h4 className="font-bold text-sm text-natural-dark">البني الداكن الملكي الفاخر</h4>
                      <p className="text-xs text-natural-dark/60">لإضفاء لمسة فخامة كلاسيكية وتناسق قوي مع الصالونات.</p>
                    </div>
                  </div>
                  {selectedColor === 'wood_dark' && <div className="h-5 w-5 rounded-full bg-natural-primary flex items-center justify-center text-white"><Check className="h-3 w-3" /></div>}
                </div>

                {/* White Option */}
                <div 
                  onClick={() => setSelectedColor('matte_white')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedColor === 'matte_white' ? 'border-natural-primary bg-natural-cream/60 shadow-inner' : 'border-natural-sand/40 hover:border-natural-sand'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-white border-2 border-neutral-300" />
                    <div>
                      <h4 className="font-bold text-sm text-natural-dark">الأبيض اللامع العصري الهادئ</h4>
                      <p className="text-xs text-natural-dark/60">مناسب لبيت النعاس أو مكاتب الأطفال والشباب المعاصرة.</p>
                    </div>
                  </div>
                  {selectedColor === 'matte_white' && <div className="h-5 w-5 rounded-full bg-natural-primary flex items-center justify-center text-white"><Check className="h-3 w-3" /></div>}
                </div>
              </div>

              <div className="text-center md:text-right">
                <button 
                  onClick={() => scrollToSection('order-form')}
                  className="bg-natural-primary hover:bg-natural-primary-dark text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  بغيت نطلب هاد اللون دابا 🛒
                </button>
              </div>

            </div>

            {/* Generated Colors Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-natural-dark/5 rounded-3xl -z-10 transform rotate-2 scale-102" />
              <div 
                onClick={() => setIsColorZoomed(true)}
                className="rounded-3xl border border-natural-sand/40 shadow-xl overflow-hidden bg-white p-3 sm:p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 relative group"
                title="اضغط لتكبير صورة اللون بوضوح"
              >
                <div className="relative overflow-hidden rounded-2xl bg-neutral-50/50 flex items-center justify-center min-h-[300px] md:min-h-[380px]">
                  <img 
                    src={getColorImage()} 
                    alt={`طاولة MDF بلون ${colors[selectedColor as keyof typeof colors]}`} 
                    className="w-full h-auto max-h-[400px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Glassy Overlay on Hover */}
                  <div className="absolute inset-0 bg-natural-dark/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <span className="bg-white/95 backdrop-blur-md text-natural-dark text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                      <span>عرض الصورة كاملة بوضوح 🔍</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main High-Converting Order Form Section */}
      <section id="order-form" className="py-16 md:py-24 bg-gradient-to-b from-transparent to-natural-cream/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="bg-natural-cream/40 rounded-3xl border border-natural-sand/60 shadow-2xl overflow-hidden relative">
            {/* Design accents */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-natural-dark via-natural-primary to-natural-accent" />

            <div className="p-6 md:p-10">
              
              <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
                <span className="text-xs font-bold bg-natural-cream border border-natural-sand/60 text-natural-primary px-3 py-1 rounded-full">استمارة سريعة للطلب</span>
                <h2 className="text-2.5xl md:text-3.5xl font-black text-natural-dark leading-tight">عمّر معلوماتك دابا وسجل الطلب ديالك! 🛒</h2>
                <p className="text-xs md:text-sm text-natural-dark/75">
                  ما كاين حتى شي دفع مسبق! عمّر الاستمارة دابا، وغادي نتصلو بيك في الهاتف في أقل من 24 ساعة باش نأكدو معاك الطلب والصيفطوها ليك فابور.
                </p>
              </div>

              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold text-right flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              {/* Form starts */}
              <form onSubmit={handleFormSubmit} className="space-y-6 text-right">
                
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-natural-dark mb-2">
                    الاسم الكامل ديالك (الاسم والنسب) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: محمد العلوي"
                    className="w-full px-4 py-3 bg-natural-bg border border-natural-sand/60 rounded-xl focus:outline-none focus:border-natural-primary text-base text-natural-dark"
                  />
                </div>

                {/* Phone Number & City Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-natural-dark mb-2">
                      رقم الهاتف (للاتصال بك وتأكيد الطلب) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="مثال: 0612345678"
                        dir="ltr"
                        className="w-full pl-4 pr-12 py-3 bg-natural-bg border border-natural-sand/60 rounded-xl focus:outline-none focus:border-natural-primary text-base text-right text-natural-dark font-mono"
                      />
                      <span className="absolute right-4 top-3.5 text-natural-dark/40 font-mono font-bold">+212</span>
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-bold text-natural-dark mb-2">
                      المدينة ديالك حالياً <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="مثال: الدار البيضاء، الرباط..."
                      className="w-full px-4 py-3 bg-natural-bg border border-natural-sand/60 rounded-xl focus:outline-none focus:border-natural-primary text-base text-natural-dark"
                      list="moroccan-cities"
                    />
                    <datalist id="moroccan-cities">
                      {popularCities.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                {/* Color Selection & Quantity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-bold text-natural-dark mb-2">
                      اختار اللون المفضل للطاولة:
                    </label>
                    <div className="flex gap-2">
                      {Object.entries(colors).map(([key, name]) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setSelectedColor(key)}
                          className={`flex-1 py-2 px-1 border-2 text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center ${selectedColor === key ? 'border-natural-primary bg-natural-cream text-natural-dark' : 'border-natural-sand/50 text-natural-dark/80 bg-natural-bg hover:border-natural-sand'}`}
                        >
                          {name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div>
                    <label className="block text-sm font-bold text-natural-dark mb-2">
                      الكمية المطلوبة:
                    </label>
                    <div className="flex items-center justify-center bg-natural-cream/60 p-1.5 rounded-xl border border-natural-sand/50 max-w-[180px] mx-auto md:mr-0">
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="h-9 w-9 bg-natural-bg hover:bg-natural-cream text-natural-dark font-bold text-lg rounded-lg shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold font-mono text-base text-natural-dark">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="h-9 w-9 bg-natural-bg hover:bg-natural-cream text-natural-dark font-bold text-lg rounded-lg shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-bold text-natural-dark mb-2">
                    العنوان أو ملاحظات إضافية (اختياري)
                  </label>
                  <textarea
                    id="address"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: عنوان السكن بالتفصيل أو وقت مفضل للاتصال..."
                    className="w-full px-4 py-3 bg-natural-bg border border-natural-sand/60 rounded-xl focus:outline-none focus:border-natural-primary text-base text-natural-dark"
                  />
                </div>

                {/* Dynamic Price Calculation display */}
                <div className="bg-natural-bg p-4 rounded-2xl border border-natural-sand/50 flex flex-col md:flex-row items-center justify-between gap-3 text-right">
                  <div>
                    <p className="text-xs text-natural-dark/60">ثمن الطاولة الواحدة: <span className="font-bold">{settings.price} درهم</span></p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">✓ التوصيل مجاني (فابور) 🇲🇦</p>
                    <p className="text-xs text-emerald-600 font-semibold">✓ الدفع عند الاستلام متاح</p>
                  </div>
                  <div className="border-t md:border-t-0 md:border-r border-natural-sand/30 pt-2 md:pt-0 md:pr-6 text-center md:text-left">
                    <span className="text-xs text-natural-dark/60 block">المبلغ الإجمالي الكلي:</span>
                    <span className="text-2xl font-black text-natural-primary font-mono">{quantity * pricePerTable} <span className="text-sm font-bold">درهم</span></span>
                  </div>
                </div>

                {/* Big Shining Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-natural-primary hover:bg-natural-primary-dark disabled:bg-natural-sand/65 text-white font-black text-lg py-4 px-6 rounded-2xl shadow-xl hover:shadow-natural-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>جاري تسجيل الطلب ديالك...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-6 w-6 animate-pulse" />
                        <span>أكّد الطلب ديالي دابا 🛒</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Secure Trust features badges */}
              <div className="mt-8 pt-8 border-t border-natural-sand/30 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-natural-cream/50 border border-natural-sand/20 rounded-xl flex items-center justify-center gap-2">
                  <span className="text-lg">📦</span>
                  <span className="text-xs font-bold text-natural-dark/85">تغليف آمن ومحمي ومثالي للسلامة</span>
                </div>
                <div className="p-3 bg-natural-cream/50 border border-natural-sand/20 rounded-xl flex items-center justify-center gap-2">
                  <span className="text-lg">🤝</span>
                  <span className="text-xs font-bold text-natural-dark/85">المعاينة والفحص عاد الخلاص</span>
                </div>
                <div className="p-3 bg-natural-cream/50 border border-natural-sand/20 rounded-xl flex items-center justify-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-xs font-bold text-natural-dark/85">خدمة دعم الزبناء متواصلة 24/7</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Social Proof & Customer Reviews */}
      <section id="reviews" className="py-16 bg-natural-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-black text-natural-dark font-sans">شنو كيقولو الناس اللي شراو هاد الطاولة؟ ⭐⭐⭐⭐⭐</h2>
            <p className="text-sm text-natural-dark/70">
              أكثر من 850 زبون مغربي وثقوا فينا وهاد بعض من الآراء ديالهم الحقيقية من مختلف المدن.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="bg-natural-cream/35 p-6 rounded-2xl border border-natural-sand/55 flex flex-col justify-between text-right">
              <div>
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-natural-dark/95 leading-relaxed italic">
                  "صراحة الطاولة غزالة بزاااف، الخشب ديالها متين واللون الطبيعي جا رائع مع الصالون ديالي. كنستعملها بزاف للبيسي المحمول ولا باش نشرب القهوة. شكراً على التوصيل السريع لمدينة مراكش وصلاتني في 24 ساعة فقط."
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-natural-sand/30 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-natural-primary text-white font-bold flex items-center justify-center">أ</div>
                <div>
                  <h4 className="text-sm font-bold text-natural-dark">أنس المراكشي</h4>
                  <span className="text-[10px] text-natural-dark/50 block">مراكش - زبون مؤكد ✓</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-natural-cream/35 p-6 rounded-2xl border border-natural-sand/55 flex flex-col justify-between text-right">
              <div>
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-natural-dark/95 leading-relaxed italic">
                  "خديت جوج من الطاولات، وحدة باللون الأبيض لبيت بنتي ووحدة بالبني للصالون. جودة خشب MDF فاجأتني صراحة، قوية وسهلة في التنظيف. الموزع اتصل بيا قبل ما يوصل وكان مؤدب بزاف. أنصح بالتعامل معهم."
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-natural-sand/30 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">ف</div>
                <div>
                  <h4 className="text-sm font-bold text-natural-dark">فاطمة الزهراء</h4>
                  <span className="text-[10px] text-natural-dark/50 block">الدار البيضاء - زبونة مؤكدة ✓</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-natural-cream/35 p-6 rounded-2xl border border-natural-sand/55 flex flex-col justify-between text-right">
              <div>
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-natural-dark/95 leading-relaxed italic">
                  "طاولة عملية بامتياز وتستحق كل درهم! خفيفة ومكتشدش البلاصة بزاف وفي نفس الوقت هازة ليا البيسي والكاس ديال القهوة والكتوبة. التوصيل كان فابور حتى لباب الدار في طنجة والدفع حتى شفت الجودة بعيني."
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-natural-sand/30 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-natural-dark text-white font-bold flex items-center justify-center">ي</div>
                <div>
                  <h4 className="text-sm font-bold text-natural-dark">يوسف العلمي</h4>
                  <span className="text-[10px] text-natural-dark/50 block">طنجة - زبون مؤكد ✓</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-natural-cream/20 border-t border-natural-sand/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <h2 className="text-3xl font-black text-natural-dark">الأسئلة الشائعة حول الطاولة ❓</h2>
            <p className="text-sm text-natural-dark/70">هنا غاتلقى الأجوبة على كاع الأسئلة اللي تقدر تكون عندك فبالك</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-natural-bg border border-natural-sand/50 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-right font-bold text-natural-dark hover:bg-natural-cream/40 transition-colors flex justify-between items-center cursor-pointer gap-4 text-sm md:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-natural-primary shrink-0 transform transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-natural-sand/30"
                    >
                      <p className="p-5 text-sm text-natural-dark/80 leading-relaxed bg-natural-cream/20">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Urgent Closing Promo Section */}
      <section className="py-16 bg-gradient-to-r from-natural-primary to-natural-dark text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] -z-10" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl md:text-4xl font-black">العرض محدود جداً! متضيعش هاد الفرصة ⏳</h2>
          <p className="text-base text-natural-sand leading-relaxed max-w-xl mx-auto">
            مخزون الطاولات محدود جداً وغادي يسالي قريباً. طلب الطاولة ديالك اليوم واستفد من <span className="font-bold underline text-white">التخفيض (-{discountPercentage}%)</span> والتوصيل الفابور لجميع المدن المغربية.
          </p>
          <div>
            <button
              onClick={() => scrollToSection('order-form')}
              className="bg-natural-cream hover:bg-natural-sand text-natural-dark font-black text-lg px-10 py-4.5 rounded-2xl shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              اضغط هنا للطلب بـ {settings.price} درهم فقط! 🛒
            </button>
          </div>
        </div>
      </section>

      {/* Floating direct WhatsApp Call To Action in lower right screen corner */}
      <a
        href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`سلام عليكم أريد طلب طاولة MDF ميني بلون ${colors[selectedColor as keyof typeof colors]} بـ ${settings.price} درهم`)}`}
        target="_blank"
        referrerPolicy="no-referrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white h-14 w-14 md:h-16 md:w-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-200 cursor-pointer"
        title="راسلنا على الواتساب مباشرة"
      >
        <MessageCircle className="h-7 w-7 md:h-8 md:w-8 fill-white text-emerald-600 animate-pulse" />
      </a>

      {/* Footer Area */}
      <footer className="bg-natural-dark text-natural-sand/70 py-12 border-t border-natural-sand/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div 
            className="flex items-center justify-center gap-2.5 text-white cursor-pointer select-none"
            onClick={handleLogoClick}
          >
            {settings.storeLogo ? (
              <img 
                src={settings.storeLogo} 
                alt={settings.storeName || "Home Decor Logo"} 
                className="h-10 w-10 object-cover rounded-full border border-natural-sand/30 shadow-sm bg-white"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl">🪵</span>
            )}
            <span className="text-lg font-bold">{settings.storeName || "بيتك ديكور • HOME DECOR"}</span>
          </div>
          <p className="text-xs max-w-md mx-auto text-natural-sand/40 font-medium">
            © 2026 متجر {settings.storeName || "بيتك ديكور • HOME DECOR"} لبيع الطاولات الخشبية الممتازة في المغرب. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">المميزات</button>
            <span className="text-natural-sand/30">|</span>
            <button onClick={() => scrollToSection('order-form')} className="hover:text-white transition-colors">اطلب الآن</button>
          </div>
        </div>
      </footer>

      {/* Success Modal Confirmation */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        customerName={orderName}
        whatsappNumber={settings.notificationWhatsapp || settings.whatsappNumber}
        tableType={submittedTableType}
        quantity={submittedQuantity}
        price={settings.price}
      />

      {/* Admin Passcode Modals Popup */}
      <AnimatePresence>
        {showAdminPasscodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAdminPasscodeModal(false); setPasscode(''); setPasscodeError(''); }}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-xs bg-natural-bg rounded-2xl p-6 shadow-2xl border border-natural-sand/65 text-center"
            >
              <h3 className="text-base font-bold text-natural-dark mb-2">الدخول للوحة التحكم للتاجر 🔑</h3>
              <p className="text-xs text-natural-dark/60 mb-4">أدخل الرقم السري للوصول لطلبات الزبناء المضافة.</p>
              
              {passcodeError && (
                <p className="text-xs text-red-600 font-bold mb-3">{passcodeError}</p>
              )}

              <form onSubmit={handleAdminAccess} className="space-y-3">
                <input
                  type="password"
                  placeholder="أدخل الرقم السري للوحة التحكم"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-natural-cream/40 border border-natural-sand/50 text-natural-dark rounded-lg text-center font-mono focus:outline-none focus:border-natural-primary"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full bg-natural-primary text-white font-bold py-2 rounded-lg text-xs hover:bg-natural-primary-dark transition-colors cursor-pointer"
                >
                  تأكيد الدخول
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAdminPasscodeModal(false); setPasscode(''); setPasscodeError(''); }}
                  className="w-full bg-natural-cream text-natural-dark/70 py-2 rounded-lg text-xs hover:bg-natural-sand transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Full-Screen Dimensions Lightbox (Modal Zoom) */}
        {isZoomed && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomed(false)}
              className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md cursor-zoom-out"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 10 }}
              className="relative max-w-4xl w-full bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-neutral-200 text-center z-10 flex flex-col justify-between max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-extrabold h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer text-sm shadow-xs hover:rotate-90 duration-200 z-20"
                title="إغلاق"
              >
                ✕
              </button>

              <div className="text-center mb-3 pr-10" dir="rtl">
                <h3 className="text-lg font-black text-natural-dark">مخطط قياسات وأبعاد الطاولة بالكامل 📏</h3>
                <p className="text-xs text-natural-dark/60 mt-0.5">صورة تفصيلية توضح كل العبارات والقياسات الحقيقية بدقة.</p>
              </div>
              
              {/* Image Frame with Zoom Scroll */}
              <div className="flex-1 flex items-center justify-center overflow-auto rounded-2xl bg-neutral-50 border border-neutral-100 p-2 sm:p-6 min-h-0">
                <img
                  src={settings.image_dimensions || "/src/assets/images/table_dimensions_1783724171797.jpg"}
                  alt="قياسات وأبعاد الطاولة ميني MDF"
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-xs mx-auto select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-center mt-3" dir="rtl">
                <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                  ✓ الأبعاد مضبوطة 100% ومناسبة للمنازل المغربية 🇲🇦
                </span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Full-Screen Color Image Lightbox (Modal Zoom) */}
        {isColorZoomed && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsColorZoomed(false)}
              className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md cursor-zoom-out"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 10 }}
              className="relative max-w-4xl w-full bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-neutral-200 text-center z-10 flex flex-col justify-between max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsColorZoomed(false)}
                className="absolute top-4 right-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-extrabold h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer text-sm shadow-xs hover:rotate-90 duration-200 z-20"
                title="إغلاق"
              >
                ✕
              </button>

              <div className="text-center mb-3 pr-10" dir="rtl">
                <h3 className="text-lg font-black text-natural-dark">صورة الطاولة بلونها الكامل والواضح 🪵</h3>
                <p className="text-xs text-natural-dark/60 mt-0.5">طاولة ميني MDF بلون: {colors[selectedColor as keyof typeof colors]} متميزة وواضحة جداً.</p>
              </div>
              
              {/* Image Frame */}
              <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-neutral-50 border border-neutral-100 p-2 sm:p-6 min-h-0">
                <img
                  src={getColorImage()}
                  alt={`طاولة MDF بلون ${colors[selectedColor as keyof typeof colors]}`}
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-xs mx-auto select-none bg-white"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-center mt-3" dir="rtl">
                <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                  ✓ جودة عالية جداً وتفاصيل حقيقية
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
