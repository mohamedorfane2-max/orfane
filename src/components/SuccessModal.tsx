import { CheckCircle, PhoneCall, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  whatsappNumber?: string;
  tableType?: string;
  quantity?: number;
  price?: number;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  customerName,
  whatsappNumber = '212600000000',
  tableType = '',
  quantity = 1,
  price = 199
}: SuccessModalProps) {
  if (!isOpen) return null;

  const cleanPhone = whatsappNumber.trim().replace(/[\s+()]/g, '');
  const formattedWhatsapp = cleanPhone.startsWith('0') 
    ? '212' + cleanPhone.substring(1) 
    : cleanPhone;

  const messageText = `السلام عليكم، أنا ${customerName}. قمت للتو بطلب طاولة ميني MDF بلون "${tableType}" (الكمية: ${quantity})، بمبلغ إجمالي قدره ${quantity * price} درهم. أريد تأكيد وتسريع الطلب ديالي من فضلكم.`;
  const whatsappUrl = `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(messageText)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-natural-dark/60 backdrop-blur-xs"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-natural-bg p-6 shadow-2xl border border-natural-sand/60 text-center rtl"
          dir="rtl"
        >
          {/* Top Natural Bar decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-natural-dark via-natural-primary to-natural-accent" />

          {/* Icon */}
          <div className="mx-auto my-4 flex h-16 w-16 items-center justify-center rounded-full bg-natural-cream text-natural-primary">
            <CheckCircle className="h-10 w-10 animate-bounce" />
          </div>

          {/* Headline */}
          <h3 className="text-xl font-bold text-natural-dark font-sans">
            شكراً بزاف على ثقتك، {customerName}! 🎉
          </h3>
          <p className="mt-2 text-sm text-natural-dark/85 leading-relaxed font-sans">
            لقد تم تسجيل الطلب ديالك بنجاح. فريق الدعم ديالنا غادي يتصل بيك في الهاتف في أقل من <span className="font-semibold text-natural-primary">24 ساعة</span> لتأكيد العنوان وإرسال الطاولة ديالك.
          </p>

          {/* Order Details Preview Info */}
          <div className="my-6 rounded-xl bg-natural-cream/50 p-4 border border-natural-sand/40 text-right">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-natural-primary flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-natural-primary" />
              الخطوات المقبلة:
            </h4>
            <ul className="space-y-2 text-xs text-natural-dark/90">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-natural-sand text-natural-dark font-bold">1</span>
                <span>غادي نتصلوا بيك فالتلفون باش نأكدوا معاك الطلب.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-natural-sand text-natural-dark font-bold">2</span>
                <span>غادي نوجدو الطاولة ونصيفطوها ليك فابور (توصيل مجاني).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-natural-sand text-natural-dark font-bold">3</span>
                <span>غادي تخلص كاش حتى تشد الطاولة وتفحص الجودة ديالها بيدك!</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-natural-primary hover:bg-natural-primary-dark py-3.5 px-4 font-black text-white transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg text-sm"
              id="close-success-modal-btn"
            >
              مفهوم، شكراً جزبلاً! 👍
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
