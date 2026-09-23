import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Fuse from 'fuse.js';
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, X, Globe,
  HelpCircle, Compass, ArrowDown, ShoppingBag, Flame
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   VOICE PRODUCT CATALOG (All Juices + Preset Bowls)
   ═══════════════════════════════════════════════════════ */
const VOICE_CATALOG = [
  { id:'j1', name:'Green Detox Juice',            cat:'JUICE',  price:149, protein:2.0, cal:95,  carbs:22, fat:0.3, kw:['green detox','green juice','hara juice','detox juice','detox'] },
  { id:'j2', name:'Beetroot Boost Juice',          cat:'JUICE',  price:149, protein:3.0, cal:110, carbs:25, fat:0.4, kw:['beetroot','chukandar','red juice','beet juice','boost juice','beet'] },
  { id:'j3', name:'Amla Immunity Shot',            cat:'JUICE',  price:99,  protein:1.0, cal:35,  carbs:8,  fat:0.1, kw:['amla','immunity shot','amla shot','vitamin c'] },
  { id:'j4', name:'Pure Aloe Vera Hydration',      cat:'JUICE',  price:79,  protein:0.4, cal:25,  carbs:6,  fat:0.0, kw:['aloe vera','aloe','hydration'] },
  
  { id:'b1', name:'High-Protein Sprouts Bowl',     cat:'PRESET', price:199, protein:32.5,cal:420, carbs:45, fat:8.5, kw:['sprouts bowl','protein bowl','high protein bowl'] },
  { id:'b2', name:'Paneer Tofu Power Bowl',        cat:'PRESET', price:249, protein:38.0,cal:490, carbs:32, fat:16,  kw:['paneer bowl','tofu bowl','power bowl','paneer power','paneer'] },
  { id:'s1', name:'Mixed Sprouted Moong & Chana',  cat:'PRESET', price:129, protein:18.0,cal:210, carbs:30, fat:2.0, kw:['moong chana','mixed sprouts','ankurit','moong'] },
];

/* ═══════════════════════════════════════════════════════
   BOWL INGREDIENTS CATALOG
   ═══════════════════════════════════════════════════════ */
const BOWL_INGREDIENTS = [
  { id:'i1', name:'Sprouted Moong', price:40, protein:8.0, kw:['moong','mung','hara moong'] },
  { id:'i2', name:'Sprouted Chana', price:40, protein:7.5, kw:['chana','chhole'] },
  { id:'i3', name:'Paneer Cubes',   price:60, protein:14,  kw:['paneer','cheese'] },
  { id:'i4', name:'Tofu Cubes',     price:60, protein:16,  kw:['tofu','soya paneer'] },
  { id:'i6', name:'Peanuts',        price:30, protein:7.0, kw:['peanut','mungfali','moongfali'] },
  { id:'i7', name:'Almonds',        price:50, protein:6.0, kw:['almond','badam'] },
];

/* ═══════════════════════════════════════════════════════
   INTENT MAP — Scored phrase-to-action matching.
   ═══════════════════════════════════════════════════════ */
const INTENT_MAP = [
  // ── BOWL & ORDERING ──
  { intent:'BUILD_BOWL',     p:['sprout','bowl bana','make bowl','build bowl','custom bowl','protein bowl','बाउल बना','स्प्राउट','बनाओ'] },
  { intent:'ADD_INGREDIENT', p:['add ingredient','ingredient dal','bowl me dal','bowl mein dal','add kar','bowl mein add','डालो','ऐड करो'] },
  { intent:'ADD_TO_CART',    p:['order kar','dalo cart','cart me dal','cart mein dal','chahiye','le aao','mangao','add to cart','ऑर्डर करो','कार्ट में डालो','चाहिए','मंगाओ'] },
  { intent:'CART_SUMMARY',   p:['my cart','cart summary','total bill','kitna bill','bill kitna','kitna hua','kitna protein','cart me kya','cart mein kya','cart status','cart details','bill batao','bill','बिल कितना','क्या है'] },
  { intent:'CLEAR_CART',     p:['clear cart','cart khali','khali karo','empty cart','cart saaf','sab hatao','cart empty','cart clear','कार्ट खाली','साफ़ करो'] },
  { intent:'REMOVE_ITEM',    p:['remove','hatao','delete','nikal do','hata do','item hatao','हटाओ','निकाल दो'] },
  { intent:'OPEN_CART',      p:['open cart','cart khol','show cart','cart dikha','basket','cart open','khat','कार्ट खोलो','दिखाओ'] },
  { intent:'CHECKOUT',       p:['checkout','pay now','payment','khareed','proceed to checkout','order place','place order','check out','पेमेंट','खरीद','चेकआउट'] },

  // ── AUTH ──
  { intent:'LOGIN',    p:['login','sign in','log in','लॉगिन'] },
  { intent:'LOGOUT',   p:['logout','sign out','log out','log off','लॉगआउट','बाहर'] },
  { intent:'REGISTER', p:['register','sign up','account bana','khata bana','registration','signup','अकाउंट','खाता'] },

  // ── ALL NAVIGATION ROUTES ──
  { intent:'NAV_HOME',         p:['home','ghar','main page','shuruat','hom','होम','घर','मुख्य पृष्ठ'] },
  { intent:'NAV_ABOUT',        p:['about','hamare baare','baare mein','अबाउट','हमारे बारे में'] },
  { intent:'NAV_CONTACT',      p:['contact','sampark','कांटेक्ट','संपर्क'] },
  { intent:'NAV_CATEGORIES',   p:['categories','category','vibhag','कैटेगरी','विभाग'] },
  { intent:'NAV_JUICES',       p:['juice','जूस'] },
  { intent:'NAV_BOWL_BUILDER', p:['bowl builder','bowl page','custom bowl','customizer','बाउल बिल्डर'] },
  { intent:'NAV_SUBSCRIPTION', p:['subscription','subcription','sabscription','plan','membership','monthly','sabskription','सब्सक्रिप्शन','प्लान','सदस्यता'] },
  { intent:'NAV_FAQ',          p:['faq','questions','sawal jawab','help','सवाल','मदद'] },
  { intent:'NAV_TERMS',        p:['terms','niyam','नियम'] },
  { intent:'NAV_PRIVACY',      p:['privacy','policy','प्राइवेसी'] },
  { intent:'NAV_MENU',         p:['menu','poora menu','मेनू'] },
  
  // Customer Routes
  { intent:'NAV_DASHBOARD',     p:['dashboard','my dashboard','my account','profile','mera account','डैशबोर्ड','मेरा अकाउंट','प्रोफाइल'] },
  { intent:'NAV_ORDERS',        p:['my orders','orders','order history','mere orders','aadar','aarder','ऑर्डर','मेरे ऑर्डर'] },
  { intent:'NAV_SUBSCRIPTIONS', p:['my subscription','my subscriptions','mere subscriptions','मेरे सब्सक्रिप्शन'] },
  { intent:'NAV_ANALYTICS',     p:['analytics','my analytics','nutrition analytics','protein analytics','एनालिटिक्स'] },
  { intent:'NAV_PROFILE',       p:['my profile','edit profile','profile edit','मेरी प्रोफाइल'] },
  
  // Admin Routes
  { intent:'NAV_ADMIN',              p:['admin','एडमिन'] },
  { intent:'NAV_ADMIN_ORDERS',       p:['admin order','manage order','एडमिन ऑर्डर'] },
  { intent:'NAV_ADMIN_INGREDIENTS',  p:['admin ingredient','manage ingredient','एडमिन सामग्री'] },
  { intent:'NAV_ADMIN_PRODUCTS',     p:['admin product','manage product','एडमिन प्रोडक्ट'] },
  { intent:'NAV_ADMIN_CUSTOMERS',    p:['admin customer','manage customer','एडमिन ग्राहक'] },
  { intent:'NAV_ADMIN_INVENTORY',    p:['admin inventory','manage inventory','stock','एडमिन इन्वेंटरी','स्टॉक'] },
  { intent:'NAV_ADMIN_CMS',          p:['admin cms','manage cms','content','एडमिन सीएमएस'] },
  { intent:'NAV_ADMIN_SETTINGS',     p:['admin setting','manage setting','एडमिन सेटिंग'] },
  { intent:'NAV_ADMIN_REPORTS',      p:['admin report','manage report','एडमिन रिपोर्ट'] },
  { intent:'NAV_ADMIN_CONTACT',      p:['admin contact','contact message','एडमिन कांटेक्ट'] },
  { intent:'NAV_ADMIN_NEWSLETTER',   p:['admin newsletter','एडमिन न्यूज़लेटर'] },
  { intent:'NAV_ADMIN_SUBS',         p:['admin subscription','एडमिन सब्सक्रिप्शन'] },
  { intent:'NAV_ADMIN_SPROUTS_CAT',  p:['admin sprout category','एडमिन स्प्राउट कैटेगरी'] },
  { intent:'NAV_ADMIN_SPROUTS_ING',  p:['admin sprout ingredient','एडमिन स्प्राउट सामग्री'] },

  // ── SCROLL ──
  { intent:'SCROLL_DOWN',   p:['scroll down','neeche','niche','down','नीचे'] },
  { intent:'SCROLL_UP',     p:['scroll up','upar','up','ऊपर'] },
  { intent:'SCROLL_TOP',    p:['scroll top','sabse upar','top','सबसे ऊपर'] },
  { intent:'SCROLL_BOTTOM', p:['scroll bottom','sabse neeche','bottom','end','सबसे नीचे','अंत'] },

  // ── VOICE SETTINGS ──
  { intent:'MUTE',   p:['mute','chup','aawaz band','silence','awaz band','चुप','आवाज़ बंद'] },
  { intent:'UNMUTE', p:['unmute','aawaz chalu','bolo','speak','awaz chalu','आवाज़ चालू','बोलो'] },

  // ── FORM / DOM ACTIONS ──
  { intent:'SUBMIT_FORM', p:['submit','send','bhej','सबमिट','भेजो'] },
  { intent:'SEARCH',      p:['search','find','dhoond','खोजो','ढूंढो','सर्च'] },
  { intent:'WHERE_AM_I',  p:['where am i','kahan hoon','which page','konsa page','kya page hai','कहाँ हूँ','कौनसा पेज'] },
  { intent:'GO_BACK',     p:['go back','back','peeche','piche','wapas','पीछे','वापस'] },
  { intent:'REFRESH',     p:['refresh','reload','रिफ्रेश'] },
  { intent:'NEXT_SLIDE',  p:['next','agle','agla','आगे','अगला'] },
  { intent:'PREV_SLIDE',  p:['previous','prev','pichla','pehle','पीछे','पिछला'] },
  { intent:'NEWSLETTER',  p:['newsletter','email subscribe','न्यूज़लेटर'] },
  { intent:'CLICK_BUTTON',p:['click','press','dabao','dabado','दबाओ','क्लिक'] },
];

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    addToCart, clearCart, removeFromCart, cart, subtotal, totalProtein, 
    toggleIngredientInBowl, clearCustomBowl, addCustomBowlToCart 
  } = useCart();
  const { user, logout } = useAuth();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Settings
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [language, setLanguage] = useState('hi-IN'); // Hinglish optimized
  const [audioLevel, setAudioLevel] = useState(1);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const actionTimeoutRef = useRef(null);
  const lastProcessedRef = useRef({ text: '', time: 0 });
  const orbIntervalRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += t;
          else interimTranscript += t;
        }
        const display = finalTranscript || interimTranscript;
        setTranscript(display);

        if (finalTranscript) {
          handleVoiceCommand(finalTranscript.toLowerCase());
        }
      };

      recognitionRef.current.onerror = (e) => console.log('Speech error:', e.error);
      recognitionRef.current.onend = () => { if (isListening) recognitionRef.current.start(); };
    }
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, [isListening, language]);

  /* ─── Fake Audio Level for Orb Animation ─────────────── */
  useEffect(() => {
    if (isListening) {
      orbIntervalRef.current = setInterval(() => {
        setAudioLevel(prev => {
          if (prev > 1.2) return prev - 0.3;
          return 1 + (Math.random() * 0.4);
        });
      }, 100);
    } else {
      if (orbIntervalRef.current) clearInterval(orbIntervalRef.current);
      setAudioLevel(1);
    }
  }, [isListening]);


  /* ─── AI Response UI & TTS ───────────────────────────── */
  const setAction = useCallback((type, text, speechText) => {
    setAiResponse(speechText || text);
    
    // Play TTS Voice
    if (voiceFeedback && speechText && synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = language === 'hi-IN' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      
      const voices = synthRef.current.getVoices();
      const femaleHi = voices.find(v => v.lang.includes('hi') && (v.name.includes('Female') || v.name.includes('Zira')));
      const femaleEn = voices.find(v => v.lang.includes('en-IN') && (v.name.includes('Female') || v.name.includes('Heera')));
      if (femaleHi) utterance.voice = femaleHi;
      else if (femaleEn) utterance.voice = femaleEn;
      
      synthRef.current.speak(utterance);
    }

    // Auto-hide popup
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    actionTimeoutRef.current = setTimeout(() => {
      setAiResponse('');
      setTranscript('');
    }, 6000);
  }, [voiceFeedback, language]);


  const playChime = (type) => {
    if (!voiceFeedback) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type === 'success' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(type === 'success' ? 880 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };


  /* ─── Phonetic Normalizer (Hinglish Support) ─────────── */
  const normalize = useCallback((text) => {
    let t = text.toLowerCase().trim();
    const rules = [
      [/sabscription|subsciption|sabskription/g, 'subscription'],
      [/\b(khol|dikha|bata|batao|kholo|jao|ja|open|show|go)\b/g, 'open'],
      [/\b(aadar|aarder|order|orders)\b/g, 'orders'],
      [/\b(ispraut|eshprut|sprout)\b/g, 'sprouts'],
      [/\b(khat|cart|card)\b/g, 'cart'],
      [/\b(par|pe|pa)\b/g, 'per'],
    ];
    rules.forEach(([reg, rep]) => { t = t.replace(reg, rep); });
    return t.replace(/\s+/g, ' ').trim();
  }, []);

  /* ─── Intent Matching (Fuse.js Powered) ──────────────── */
  const detectIntent = useCallback((speech) => {
    const phrases = [];
    INTENT_MAP.forEach(entry => entry.p.forEach(phrase => phrases.push({ intent: entry.intent, phrase })));
    const fuse = new Fuse(phrases, { keys: ['phrase'], ignoreLocation: true, threshold: 0.35, includeScore: true });
    const results = fuse.search(speech);
    
    let bestMatch = null, bestScore = 0;
    for (const entry of INTENT_MAP) {
      for (const phrase of entry.p) {
        if (speech.includes(phrase) && phrase.length > bestScore) {
          bestScore = phrase.length; bestMatch = entry.intent;
        }
      }
    }
    
    if (results.length > 0 && results[0].score < 0.4) {
      return results[0].item.intent;
    }
    return bestMatch;
  }, []);

  const findProduct = useCallback((speech) => {
    const products = [];
    VOICE_CATALOG.forEach(item => item.kw.forEach(kw => products.push({ item, kw })));
    const fuse = new Fuse(products, { keys: ['kw'], ignoreLocation: true, threshold: 0.35 });
    const res = fuse.search(speech);
    if (res.length > 0) return res[0].item.item;

    let best = null, score = 0;
    for (const item of VOICE_CATALOG) {
      for (const kw of item.kw) {
        if (speech.includes(kw) && kw.length > score) { score = kw.length; best = item; }
      }
    }
    return best;
  }, []);

  /* ═══════════════════════════════════════════════════════
     COMMAND PROCESSOR
     ═══════════════════════════════════════════════════════ */
  const handleVoiceCommand = useCallback((rawSpeech) => {
    const speech = normalize(rawSpeech);
    if (!speech || speech.length < 2) return;

    const now = Date.now();
    if (lastProcessedRef.current.text === speech && now - lastProcessedRef.current.time < 3000) return;
    lastProcessedRef.current = { text: speech, time: now };

    playChime('success');
    setCommandHistory(prev => [...prev.slice(-14), { text: speech, t: new Date().toLocaleTimeString() }]);

    const intent = detectIntent(speech);
    const hi = language === 'hi-IN';

    switch (intent) {
      case 'OPEN_CART':
        const btn = document.querySelector('button[aria-label="Shopping Cart"]');
        if (btn) { btn.click(); setAction('action', '', hi ? 'Cart khul gaya' : 'Cart opened'); }
        return;
      case 'CHECKOUT':
        navigate(user ? '/checkout' : '/login?redirect=/checkout');
        setAction('action', '', hi ? 'Checkout page par le jaa raha hoon' : 'Going to checkout');
        return;
      case 'NAV_HOME':         navigate('/');               setAction('action', '', 'Home'); return;
      case 'NAV_ABOUT':        navigate('/about');          setAction('action', '', 'About Us'); return;
      case 'NAV_SUBSCRIPTION': navigate('/subscription');   setAction('action', '', 'Subscription Plans'); return;
      case 'NAV_ORDERS':       navigate('/customer/orders');setAction('action', '', 'My Orders'); return;
      
      // SCROLL
      case 'SCROLL_DOWN':   window.scrollBy({ top: 600, behavior:'smooth' }); setAction('action', '', hi ? 'Neeche scroll kiya' : 'Scrolled down'); return;
      case 'SCROLL_UP':     window.scrollBy({ top:-600, behavior:'smooth' }); setAction('action', '', hi ? 'Upar scroll kiya' : 'Scrolled up'); return;
      
      // REFRESH / BACK
      case 'GO_BACK':       window.history.back(); setAction('action', '', hi ? 'Peeche ja rahe hain' : 'Going back'); return;
      case 'REFRESH':       window.location.reload(); return;

      default: break;
    }

    // DIRECT PRODUCT MATCH
    const directProduct = findProduct(speech);
    if (directProduct) {
      addToCart({ id:directProduct.id, productId:directProduct.id, name:directProduct.name, category:directProduct.cat, price:directProduct.price, protein:directProduct.protein, calories:directProduct.cal, carbs:directProduct.carbs, fat:directProduct.fat, quantity:1 });
      setAction('success', '', hi ? `${directProduct.name} add ho gaya` : `Added ${directProduct.name}`);
      return;
    }

    // 🌟 FALLBACK DOM TEXT MATCHING USING FUSE.JS 🌟
    const clickables = Array.from(document.querySelectorAll('button:not([disabled]), a[href], input[type="submit"]'));
    const domItems = clickables.map(el => ({ el, text: (el.innerText || el.ariaLabel || '').toLowerCase().trim() })).filter(e => e.text.length > 2);
    const domFuse = new Fuse(domItems, { keys: ['text'], threshold: 0.3, ignoreLocation: true, minMatchCharLength: 3 });
    const domRes = domFuse.search(speech);
    
    if (domRes.length > 0) {
      domRes[0].item.el.click();
      setAction('action', '', `Clicked ${domRes[0].item.text}`);
      return;
    }

    setAction('info', `I heard: "${speech}"`, hi ? 'Maaf kijiye, main samajh nahi paya' : 'Sorry, I did not understand that');
  });

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setTranscript('');
        setAiResponse('');
        try { recognitionRef.current.start(); } catch (e) {}
        setIsListening(true);
      } else {
        setAction('error', 'Browser mic access denied or not supported.');
      }
    }
  };


  return (
    <>
      <style>{`
        @keyframes orbPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .va-orb-active { animation: orbPulse 1.5s infinite; }
      `}</style>

      {/* ─── SIRI-STYLE BOTTOM OVERLAY ─── */}
      {isListening && (
        <div className="fixed bottom-0 left-0 right-0 z-[9998] pointer-events-none flex flex-col items-center justify-end pb-8"
             style={{ height: '35vh', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)', backdropFilter: 'blur(2px)' }}>
          
          <div className="text-center mb-6 max-w-2xl px-6 pointer-events-auto">
            <p className="text-white font-semibold text-3xl drop-shadow-lg leading-tight">{transcript || 'Sun raha hoon...'}</p>
          </div>

          <div className="pointer-events-auto relative flex items-center justify-center cursor-pointer" onClick={toggleListening}>
            <div className="absolute rounded-full bg-emerald-500 blur-xl transition-all duration-150 ease-out" 
                 style={{ width: `${80 * audioLevel}px`, height: `${80 * audioLevel}px`, opacity: 0.6 + (audioLevel * 0.1) }}>
            </div>
            <button className="relative z-10 w-20 h-20 rounded-full bg-slate-900 border-2 border-emerald-400/50 flex items-center justify-center shadow-2xl va-orb-active hover:scale-105 transition-transform">
              <Mic className="w-8 h-8 text-emerald-400" />
            </button>
          </div>
          <p className="mt-4 text-emerald-300/80 text-sm font-bold pointer-events-auto">Hindi/Hinglish mein bolein</p>
        </div>
      )}


      {/* ─── FLOATING WIDGET ─── */}
      {!isListening && (
        <div className="relative z-[100] flex flex-col items-end gap-1 select-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          
          {aiResponse && (
            <div className="absolute top-12 right-0 px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 w-max max-w-[250px] border border-slate-700/50 bg-slate-900/95 text-slate-100 text-xs font-semibold animate-fade-in-up" 
                 style={{ backdropFilter: 'blur(16px)' }}>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="leading-snug">{aiResponse}</span>
            </div>
          )}

          <div className="flex items-center">
            <button onClick={toggleListening}
              className="relative flex items-center justify-center w-10 h-10 rounded-full font-bold text-white shadow-md transition-all duration-300 hover:scale-105 bg-gradient-to-br from-slate-800 to-black hover:from-emerald-700 hover:to-emerald-900"
              title="Voice Assistant">
              <MicOff className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      )}


      {/* ─── HELP DRAWER MODAL ─── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60" style={{ backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsDrawerOpen(false); }}>
          <div className="relative w-full max-w-xl bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>

            <div className="p-6 text-white flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 shadow-inner">
                  <Flame className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">Smart Voice Assistant</h3>
                  <p className="text-xs text-emerald-200/80 font-medium mt-0.5">Powered by Browser NLP</p>
                </div>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
              <p className="text-slate-600 font-medium">Aap kuch bhi bol sakte hain, AI khud samajh kar click karega. Ye 100% Free aur Fast hai!</p>
              
              {[
                { icon: <ShoppingBag className="w-5 h-5 text-orange-500" />, title: 'Try saying...', cmds: [
                  ['"Mujhe sprouts bowl chahiye"'],
                  ['"Subscription page kholo"'],
                  ['"Thoda neeche scroll karo"']
                ]}
              ].map((section, si) => (
                <div key={si} className={si > 0 ? 'pt-5 border-t border-slate-100' : ''}>
                  <div className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-3">
                    {section.icon} {section.title}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {section.cmds.map(([cmd], ci) => (
                      <div key={ci} className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
                        <div className="font-bold text-emerald-800 text-xs mb-1">{cmd}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
