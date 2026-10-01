import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import LZString from 'lz-string';
import type { CardData } from '../types';
import BannerImage from '../Banner/BannerHBD.png';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ViewCard() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<CardData | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idParam = searchParams.get('id');
        const dataParam = searchParams.get('data');
        
        if (idParam) {
          // Fetch from Firestore
          const docRef = doc(db, 'cards', idParam);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setData(docSnap.data() as CardData);
          } else {
            // Fallback to localStorage for old cards
            const storedData = localStorage.getItem(`card_${idParam}`);
            if (storedData) {
              setData(JSON.parse(storedData));
            } else {
              setError(true);
            }
          }
        } else if (dataParam) {
          const json = LZString.decompressFromEncodedURIComponent(dataParam);
          if (json) {
            setData(JSON.parse(json));
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (e) {
        console.error(e);
        setError(true);
      }
    };
    fetchData();
  }, [searchParams]);

  const handleOpen = () => {
    if (step !== 0) return;
    setStep(1); // เปิดฝาซอง
    setTimeout(() => setStep(2), 600); // การ์ดเลื่อนขึ้น
    setTimeout(() => setStep(3), 1400); // ซองจางหาย การ์ดขยายเต็ม
  };

  if (error || !data) {
    return (
      <div 
        className="min-h-screen flex flex-col gap-4 items-center justify-center text-gray-200 font-sans relative"
        style={{
          backgroundImage: `url(${BannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>
        <p className="text-xl font-bold z-10">ไม่พบข้อมูลจดหมาย 🥺</p>
        <a href="/" className="text-[#D1A08D] font-bold hover:underline bg-[#2A2A2A] px-6 py-2 text-white rounded-full z-10">กลับไปหน้าสร้างการ์ด</a>
      </div>
    );
  }

  const fontColor = data.fontColor || '#5A4F48';

  return (
    <div 
      className="min-h-screen flex items-center justify-center overflow-hidden font-sans text-gray-200 relative"
      style={{
        backgroundImage: `url(${BannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>
      <div className="relative flex items-center justify-center w-full h-full min-h-[600px] z-10">
        
        {/* The Actual Card */}
        <motion.div
          initial={{ scale: 0.35, y: 20, opacity: 0 }}
          animate={{
            scale: step === 0 ? 0.35 : 
                   step === 1 ? 0.35 : 
                   step === 2 ? 0.45 : 1,
            y: step === 0 ? 20 : 
               step === 1 ? 20 : 
               step === 2 ? -280 : 0,
            opacity: step === 0 ? 0 : 1,
            zIndex: step >= 3 ? 50 : 20,
            rotate: step === 2 ? -3 : 0
          }}
          transition={{ 
            duration: step === 3 ? 0.8 : 0.6, 
            ease: step === 3 ? "backOut" : "easeInOut" 
          }}
          className="absolute w-[400px] max-w-[95vw] h-[600px] rounded-[32px] shadow-2xl overflow-hidden border-[6px] border-white flex flex-col"
          style={{ backgroundColor: data.bgColor }}
        >
          {/* Header */}
          <div className="h-28 flex items-center justify-center shrink-0">
            <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-sm" style={{ color: data.envelopeColor }}>
              Happy Birthday!
            </h1>
          </div>

          {/* Content (Stationery Paper) */}
          <div className="relative mx-5 mb-5 flex-1 bg-white/70 rounded-2xl shadow-sm border border-white/60 overflow-hidden flex flex-col">
            
            {/* Cute Tape at top */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/40 rotate-[2deg] shadow-sm backdrop-blur-md border border-white/30 z-20"></div>

            <div className="p-5 flex flex-col h-full relative z-10">
              <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: fontColor }}>
                ถึง {data.receiver} 🎂
              </h2>
              
              {data.imageUrl && (
                <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden shadow-sm border-[4px] border-white flex-shrink-0 rotate-[2deg]">
                  <img src={data.imageUrl} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div 
                className="w-full flex-1 overflow-y-auto mb-2 custom-scrollbar"
                style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 35px, rgba(0,0,0,0.06) 35px, rgba(0,0,0,0.06) 36px)',
                  backgroundAttachment: 'local'
                }}
              >
                <p 
                  className="text-lg font-medium whitespace-pre-wrap px-2 text-left leading-[36px]"
                  style={{ color: fontColor }}
                >
                  {data.message}
                </p>
              </div>
              
              <div className="mt-auto pt-3 w-full flex flex-col items-center">
                <span 
                  className="text-xs uppercase tracking-widest opacity-40 font-bold mb-1"
                  style={{ color: fontColor }}
                >
                  From
                </span>
                <span className="text-xl font-bold" style={{ color: fontColor }}>{data.sender}</span>
              </div>
            </div>
          </div>

          {/* Render Stickers */}
          {data.stickers.map((sticker) => (
            <div
              key={sticker.id}
              className="absolute top-0 left-0 select-none z-20 max-w-[120px] max-h-[120px]"
              style={{ 
                transform: `translate(${sticker.x}px, ${sticker.y}px)`,
                filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))'
              }}
            >
              <img src={sticker.emojiOrUrl} draggable="false" className="w-full h-full object-contain pointer-events-none" />
            </div>
          ))}
        </motion.div>

        {/* The Envelope */}
        <motion.div 
          className="absolute w-[360px] h-[240px] max-w-[90vw] cursor-pointer flex flex-col items-center justify-center"
          style={{ perspective: '1000px', zIndex: step === 3 ? 0 : 30 }}
          animate={{ 
            scale: step === 3 ? 0.8 : 1,
            opacity: step === 3 ? 0 : 1,
            y: step === 3 ? 100 : 0
          }}
          transition={{ duration: 0.6 }}
          onClick={handleOpen}
        >
          {/* Back of Envelope */}
          <div 
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: data.envelopeColor, filter: 'brightness(0.85)' }}
          />

          {/* Front Flaps (Left, Right, Bottom) */}
          <div className="absolute inset-0 z-30 pointer-events-none rounded-xl overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundColor: data.envelopeColor, clipPath: 'polygon(0 0, 50% 50%, 0 100%)', filter: 'brightness(0.95)' }} />
            <div className="absolute inset-0" style={{ backgroundColor: data.envelopeColor, clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)', filter: 'brightness(0.92)' }} />
            <div className="absolute inset-0" style={{ backgroundColor: data.envelopeColor, clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)', filter: 'brightness(1.02)' }} />
          </div>

          {/* Animated Top Flap */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-full origin-top"
            animate={{ 
              rotateX: step >= 1 ? 180 : 0,
              zIndex: step >= 2 ? 10 : 40 
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ 
              backgroundColor: data.envelopeColor, 
              clipPath: 'polygon(0 0, 100% 0, 50% 55%)',
              filter: 'brightness(1.05)'
            }}
          >
            {/* Heart Sticker on Flap */}
            <motion.div 
              className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ opacity: step >= 1 ? 0 : 1, scale: step >= 1 ? 0 : 1 }}
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl" style={{ color: data.envelopeColor }}>💌</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Click to open button */}
        <motion.div 
          className="absolute mt-80 bg-[#1E1E1E] px-8 py-4 rounded-full shadow-md text-gray-200 font-bold text-lg border-2 border-[#2A2A2A] flex items-center gap-2 cursor-pointer z-40 hover:scale-105 transition-transform"
          animate={{ opacity: step === 0 ? 1 : 0, y: step === 0 ? 0 : 20, pointerEvents: step === 0 ? 'auto' : 'none' }}
          onClick={handleOpen}
        >
          เปิดจดหมายจาก {data.sender} <span className="animate-pulse">✨</span>
        </motion.div>

      </div>
    </div>
  );
}
