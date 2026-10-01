import { useState, useRef } from 'react';
import { Share2, Copy, CheckCircle2, Image as ImageIcon, SmilePlus, Trash2, Edit3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import LZString from 'lz-string';
import type { CardData, StickerData } from '../types';
import BannerImage from '../Banner/BannerHBD.png';

// ใช้ import.meta.glob เพื่อดึงรูปทั้งหมดในโฟลเดอร์ src/sticker อัตโนมัติ
const stickerModules = import.meta.glob('../sticker/*.{png,jpg,jpeg,svg,webp}', { eager: true });
const STICKER_URLS = Object.values(stickerModules).map((mod: any) => mod.default);

export default function CreateCard() {
  const [formData, setFormData] = useState<CardData>({
    sender: '',
    receiver: '',
    message: 'สุขสันต์วันเกิดนะ! ขอให้มีความสุขมากๆ',
    bgColor: '#d4b8b1',
    envelopeColor: '#f43f5e',
    fontColor: '#5A4F48',
    imageUrl: '',
    stickers: [],
  });

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imgLinkInput, setImgLinkInput] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400; // ลดขนาดลงอีกเพื่อไม่ให้ล้นโควต้า
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // บีบอัดให้เล็กสุดๆ
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          setFormData({ ...formData, imageUrl: dataUrl });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addSticker = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      stickers: [
        ...prev.stickers,
        { id: Math.random().toString(36).substr(2, 9), emojiOrUrl: url, x: 100, y: 100 },
      ],
    }));
  };

  const removeSticker = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      stickers: prev.stickers.filter((s) => s.id !== id),
    }));
  };

  const updateStickerPosition = (id: string, x: number, y: number) => {
    setFormData((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => (s.id === id ? { ...s, x, y } : s)),
    }));
  };

  const handleGenerateLink = () => {
    try {
      if ((!formData.sender && !isAnonymous) || !formData.receiver) {
        alert("กรุณากรอกชื่อของคุณ และ ชื่อผู้รับให้ครบถ้วนก่อนบันทึกครับ 💌");
        return;
      }
      const finalData = { ...formData, sender: isAnonymous ? 'ไม่ระบุชื่อ' : formData.sender };

    // ถ้ารูปเป็น Base64 (อัปโหลดจากเครื่อง) ข้อมูลจะใหญ่มาก ต้องเซฟลง LocalStorage
    if (finalData.imageUrl && finalData.imageUrl.startsWith('data:image')) {
      // ล้างข้อมูลการ์ดเก่าๆ ทิ้งก่อนเพื่อเคลียร์พื้นที่ LocalStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('card_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      const cardId = Date.now().toString(36);
      localStorage.setItem(`card_${cardId}`, JSON.stringify(finalData));
      setShareUrl(`${window.location.origin}/card?id=${cardId}`);
    } else {
      // ถ้าไม่ได้อัปโหลดรูป (หรือใช้ลิงก์รูปสั้นๆ) สามารถบีบอัดลง URL ได้เลย
      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(finalData));
      setShareUrl(`${window.location.origin}/card?data=${compressed}`);
    }
    setCopied(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการสร้างลิงก์: " + err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontColor = formData.fontColor || '#5A4F48';

  return (
    <div
      className="min-h-screen text-gray-200 pb-20 font-sans relative"
      style={{
        backgroundImage: `url(${BannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 pt-12 relative flex flex-col lg:flex-row gap-8 items-start z-10">

        {/* Left Panel: Form */}
        <div className="w-full lg:w-[60%] space-y-6">

          {/* Section: Title */}
          <div className="bg-[#1E1E1E] rounded-[32px] p-6 shadow-sm border border-[#2A2A2A] flex items-center gap-4">
            <div className="w-14 h-14 bg-[#2A2A2A] rounded-full flex items-center justify-center text-gray-300">
              <Edit3 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">เขียนคำอวยพร</h1>
              <p className="text-sm text-gray-400 mt-1">กรอกข้อมูลของคุณ แล้วส่งคำอวยพรให้กันนะ ♡</p>
            </div>
          </div>

          {/* Section: Sender Name */}
          <div className="bg-[#1E1E1E] rounded-[32px] p-6 shadow-sm border border-[#2A2A2A] space-y-4">
            <label className="font-bold flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
              ชื่อของคุณ <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="เช่น ชื่อเล่น หรือชื่อในแชท"
              disabled={isAnonymous}
              value={formData.sender}
              onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
              className="w-full px-5 py-3 border-2 border-[#2A2A2A] rounded-2xl outline-none focus:border-[#D6CFC4] transition disabled:bg-gray-50 disabled:opacity-50"
            />
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 rounded border-[#3A3A3A] text-rose-500 focus:ring-rose-500 bg-[#121212]"
              />
              <span className="text-gray-300">ส่งแบบไม่ระบุชื่อ</span>
            </label>
          </div>

          {/* Section: Receiver Name */}
          <div className="bg-[#1E1E1E] rounded-[32px] p-6 shadow-sm border border-[#2A2A2A] space-y-4">
            <label className="font-bold flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                <SmilePlus size={16} />
              </div>
              ส่งถึงใคร? <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="เช่น น้องส้มโอ"
              value={formData.receiver}
              onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
              className="w-full px-5 py-3 border-2 border-[#2A2A2A] rounded-2xl outline-none focus:border-[#D6CFC4] transition"
            />
          </div>

          {/* Section: Image Upload */}
          <div className="bg-[#1E1E1E] rounded-[32px] p-6 shadow-sm border border-[#2A2A2A] space-y-4">
            <label className="font-bold flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                <ImageIcon size={16} />
              </div>
              แนบรูปภาพ <span className="text-gray-400 text-sm font-normal">(ไม่บังคับ)</span>
            </label>

            <div className="flex gap-4 items-center">
              {/* Dropzone */}
              <div className="flex-1 border-2 border-dashed border-[#3A3A3A] rounded-2xl p-6 relative hover:bg-[#2A2A2A] transition cursor-pointer flex flex-col items-center justify-center bg-[#121212]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <ImageIcon size={32} className="text-[#4A4A4A] mb-2" />
                <span className="font-bold text-gray-300">คลิกเพื่อเลือกไฟล์</span>
                <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, WebP</p>
              </div>

              {/* Polaroid Preview */}
              <div className="w-28 h-32 bg-[#1E1E1E] border border-[#2A2A2A] shadow-sm p-2 flex flex-col transform rotate-3 shrink-0">
                <div className="flex-1 bg-[#121212] flex items-center justify-center overflow-hidden">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full striped-bg"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Link Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="หรือวางลิงก์รูป https://..."
                value={imgLinkInput}
                onChange={(e) => setImgLinkInput(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-[#2A2A2A] rounded-2xl outline-none focus:border-[#D6CFC4] text-sm"
              />
              <button
                onClick={() => {
                  if (imgLinkInput) setFormData({ ...formData, imageUrl: imgLinkInput });
                }}
                className="px-6 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-gray-200 font-bold rounded-2xl transition whitespace-nowrap"
              >
                ใช้ลิงก์
              </button>
            </div>
            {formData.imageUrl && (
              <button onClick={() => setFormData({ ...formData, imageUrl: '' })} className="text-red-400 text-sm underline mt-2">
                ลบรูปภาพ
              </button>
            )}
          </div>

          {/* Section: Message & Stickers */}
          <div className="bg-[#1E1E1E] rounded-[32px] p-6 shadow-sm border border-[#2A2A2A] space-y-6">
            <div>
              <label className="font-bold flex items-center gap-2 text-lg mb-2">ข้อความอวยพร</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-5 py-4 border-2 border-[#2A2A2A] rounded-2xl outline-none focus:border-[#D6CFC4] transition resize-none custom-scrollbar"
              />
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] flex flex-col items-center">
                <label className="text-xs font-bold mb-2 text-center w-full">สีซองจดหมาย</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.envelopeColor}
                    onChange={(e) => setFormData({ ...formData, envelopeColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-sm bg-transparent"
                  />
                </div>
              </div>
              <div className="p-3 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] flex flex-col items-center">
                <label className="text-xs font-bold mb-2 text-center w-full">สีการ์ด</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.bgColor}
                    onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-sm bg-transparent"
                  />
                </div>
              </div>
              <div className="p-3 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] flex flex-col items-center">
                <label className="text-xs font-bold mb-2 text-center w-full">สีข้อความ</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFormData({ ...formData, fontColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-sm bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold flex items-center gap-2 text-lg mb-3">
                ตกแต่งด้วยสติกเกอร์ <span className="text-gray-400 text-sm font-normal">(ลากวางในการ์ดขวามือ)</span>
              </label>

              {/* Sticker List from Folder */}
              <div className="flex flex-wrap gap-3 p-4 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] max-h-56 overflow-y-auto custom-scrollbar">
                {STICKER_URLS.length === 0 ? (
                  <p className="text-sm text-gray-400 w-full text-center py-4">ไม่พบสติกเกอร์ในโฟลเดอร์ src/sticker</p>
                ) : (
                  STICKER_URLS.map((url) => (
                    <button
                      key={url}
                      onClick={() => addSticker(url)}
                      className="w-16 h-16 hover:scale-110 transition-transform p-1 bg-[#2A2A2A] rounded-xl shadow-sm border border-[#2A2A2A] flex items-center justify-center shrink-0"
                    >
                      <img src={url} alt="Sticker" className="max-w-full max-h-full object-contain pointer-events-none" draggable="false" />
                    </button>
                  ))
                )}
              </div>

            </div>
          </div>

          <button
            onClick={handleGenerateLink}
            className="relative z-50 w-full py-4 bg-[#D1A08D] hover:bg-[#C2907D] text-white rounded-[24px] font-bold text-lg flex items-center justify-center gap-2 transition shadow-md"
          >
            <Share2 size={24} />
            บันทึกและสร้างลิงก์สำหรับส่ง
          </button>

          {shareUrl && (
            <div className="p-5 bg-[#1E1E1E] border-2 border-[#2A2A2A] rounded-[24px] space-y-3">
              <p className="text-sm font-bold text-green-400">✨ สร้างลิงก์สำเร็จแล้ว!</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-4 py-2 bg-[#121212] border border-[#E8E2D2] rounded-xl text-sm text-gray-300 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-3 bg-[#2A2A2A] rounded-xl hover:bg-[#3A3A3A] transition text-gray-200"
                >
                  {copied ? <CheckCircle2 size={20} className="text-green-400" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Live Preview */}
        <div className="w-full lg:w-[40%] flex flex-col items-center sticky top-8">
          <div className="bg-[#1E1E1E] px-6 py-2 rounded-full shadow-sm border border-[#2A2A2A] mb-6 font-bold flex items-center gap-2">
            ✨ พรีวิวการ์ด
          </div>

          <div
            ref={constraintsRef}
            className="w-[400px] max-w-[95vw] h-[600px] rounded-[32px] shadow-xl overflow-hidden relative border-[6px] border-white flex flex-col"
            style={{ backgroundColor: formData.bgColor }}
          >
            {/* Header */}
            <div className="h-28 flex items-center justify-center shrink-0">
              <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-sm" style={{ color: formData.envelopeColor }}>
                Happy Birthday!
              </h1>
            </div>

            {/* Content (Stationery Paper) */}
            <div className="relative mx-5 mb-5 flex-1 bg-white/70 rounded-2xl shadow-sm border border-white/60 overflow-hidden flex flex-col pointer-events-none">

              {/* Cute Tape at top */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/40 rotate-[2deg] shadow-sm backdrop-blur-md border border-white/30 z-20"></div>

              <div className="p-5 flex flex-col h-full relative z-10">
                <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: fontColor }}>
                  ถึง {formData.receiver || '...'} 🎂
                </h2>

                {formData.imageUrl && (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden shadow-sm border-[4px] border-white flex-shrink-0 rotate-[2deg]">
                    <img src={formData.imageUrl} className="w-full h-full object-cover pointer-events-none" />
                  </div>
                )}

                <div
                  className="w-full flex-1 overflow-y-auto mb-2 custom-scrollbar pointer-events-auto"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, rgba(0,0,0,0.06) 35px, rgba(0,0,0,0.06) 36px)',
                    backgroundAttachment: 'local'
                  }}
                >
                  <p
                    className="text-lg font-medium whitespace-pre-wrap px-2 text-left leading-[36px]"
                    style={{ color: fontColor }}
                  >
                    {formData.message || 'ข้อความอวยพร...'}
                  </p>
                </div>

                <div className="mt-auto pt-3 w-full flex flex-col items-center">
                  <span
                    className="text-xs uppercase tracking-widest opacity-40 font-bold mb-1"
                    style={{ color: fontColor }}
                  >
                    From
                  </span>
                  <span className="text-xl font-bold" style={{ color: fontColor }}>
                    {isAnonymous ? 'ไม่ระบุชื่อ' : (formData.sender || '...')}
                  </span>
                </div>
              </div>
            </div>

            {/* Draggable Image Stickers */}
            {formData.stickers.map((sticker) => (
              <motion.div
                key={sticker.id}
                id={`sticker-${sticker.id}`}
                drag
                dragConstraints={constraintsRef}
                dragElastic={0}
                dragMomentum={false}
                initial={{ x: sticker.x, y: sticker.y }}
                onDragEnd={() => {
                  const node = document.getElementById(`sticker-${sticker.id}`);
                  const container = constraintsRef.current;
                  if (node && container) {
                    const rect = node.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    const newX = rect.left - containerRect.left - 6;
                    const newY = rect.top - containerRect.top - 6;
                    updateStickerPosition(sticker.id, newX, newY);
                  }
                }}
                className="absolute top-0 left-0 cursor-move select-none z-20 flex group max-w-[120px] max-h-[120px]"
                style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }}
              >
                <img src={sticker.emojiOrUrl} draggable="false" className="w-full h-full object-contain pointer-events-none" />
                <button
                  onClick={() => removeSticker(sticker.id)}
                  className="absolute -top-3 -right-3 bg-[#2A2A2A] border border-[#3A3A3A] text-red-400 rounded-full p-2 shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-auto"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
