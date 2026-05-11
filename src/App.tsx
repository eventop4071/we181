import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  ExternalLink, 
  Settings, 
  X, 
  Plus, 
  Trash2, 
  Save, 
  LogOut, 
  LogIn,
  ChevronRight,
  Menu,
  MoreVertical
} from 'lucide-react';
import { 
  auth, 
  db, 
  signIn, 
  logOut, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { LandingPageContent, DEFAULT_CONTENT, Link, InfoItem } from './types';

// Components
const Popup = ({ url, title, onClose }: { url: string; title: string; onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
      id="popup-overlay"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full h-full max-w-6xl bg-[#fcfaf7] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#e5e1da]"
        id="popup-content"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e5e1da] bg-white/50 backdrop-blur-sm">
          <h3 className="text-xl font-serif italic text-[#1a1a1a]">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#8fa28a]/10 rounded-full transition-colors text-[#1a1a1a]/50 hover:text-[#1a1a1a]"
            id="close-popup"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 w-full relative bg-[#fcfaf7]">
          <iframe 
            src={url} 
            className="w-full h-full border-none"
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="mb-8 overflow-hidden">
    <motion.h2 
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
    >
      {title}
    </motion.h2>
    <motion.div 
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="h-1 w-20 bg-emerald-600 mt-2 origin-left"
    />
  </div>
);

export default function App() {
  const [content, setContent] = useState<LandingPageContent>(DEFAULT_CONTENT);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activePopup, setActivePopup] = useState<{ url: string; title: string } | null>(null);

  // Sync content from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'landingPage'), (snapshot) => {
      if (snapshot.exists()) {
        setContent(snapshot.data() as LandingPageContent);
      } else {
        // Initialize if empty
        setDoc(doc(db, 'config', 'landingPage'), DEFAULT_CONTENT);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'config/landingPage');
    });

    return () => unsub();
  }, []);

  // Auth state
  useEffect(() => {
    return auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const adminDoc = await getDoc(doc(db, 'admins', u.uid));
        setIsAdmin(adminDoc.exists() || u.email === 'eventop4071@gmail.com');
      } else {
        setIsAdmin(false);
        setIsEditing(false);
      }
    });
  }, []);

  const handleSave = async (newContent: LandingPageContent) => {
    try {
      await updateDoc(doc(db, 'config', 'landingPage'), {
        ...newContent,
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'config/landingPage');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#1a1a1a] font-sans selection:bg-[#8fa28a]/20 selection:text-[#1a1a1a]">
      {/* Navigation / Header */}
      <nav className="fixed top-0 w-full z-40 bg-[#fcfaf7]/80 backdrop-blur-md border-b border-[#e5e1da]">
        <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#8fa28a] rounded-full flex items-center justify-center text-white font-serif italic shadow-sm">
              W
            </div>
            <span className="text-xs tracking-[0.2em] font-semibold uppercase hidden sm:block">we 181</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-widest font-medium opacity-60">
              <a href="#" className="hover:opacity-100 transition-opacity">Worship</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Connect</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Sermons</a>
            </div>

            <div className="flex items-center gap-4 border-l border-[#e5e1da] pl-4">
              {isAdmin && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-full transition-all ${isEditing ? 'bg-[#8fa28a] text-white' : 'hover:bg-[#8fa28a]/10 text-[#8fa28a]'}`}
                  id="toggle-edit"
                >
                  <Settings size={18} />
                </button>
              )}
              {!user ? (
                <button 
                  onClick={signIn}
                  className="text-[11px] uppercase tracking-widest font-medium text-[#8fa28a] italic hover:opacity-70 transition-opacity flex items-center gap-2"
                  id="login-btn"
                >
                  <LogIn size={14} />
                  <span>Admin Login</span>
                </button>
              ) : (
                <button 
                  onClick={logOut}
                  className="text-[11px] uppercase tracking-widest font-medium text-red-500/70 hover:text-red-500 transition-colors flex items-center gap-2"
                  id="logout-btn"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 h-screen min-h-[700px] grid grid-cols-1 md:grid-cols-12 border-b border-[#e5e1da]">
        {/* Hero Left Content */}
        <div className="md:col-span-7 p-10 md:p-20 flex flex-col justify-center border-r border-[#e5e1da]">
          <div className="relative mb-12">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] uppercase tracking-[0.3em] text-[#8fa28a] mb-4 block font-semibold"
            >
              Weekly Highlight
            </motion.span>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-serif leading-[0.9] italic -ml-1 mb-8"
            >
              {content.hero.title.split(' ').map((word, i) => (
                <React.Fragment key={i}>
                  {word} {i === 0 && <br/>}
                </React.Fragment>
              ))}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-[#666] mb-12 max-w-sm font-light italic leading-relaxed"
            >
              {content.hero.subtitle}
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="group relative p-6 bg-white/50 border border-dashed border-[#d1cec8] rounded-md max-w-md"
            >
              <p className="text-sm leading-relaxed italic text-[#555]">
                "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105
              </p>
              <span className="absolute top-2 right-2 text-[8px] uppercase tracking-widest opacity-30 font-bold">Scripture</span>
            </motion.div>
          </div>
        </div>

        {/* Hero Right Media */}
        <div className="md:col-span-5 p-10 flex flex-col justify-center bg-[#f7f4ef]">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative w-full aspect-[4/5] bg-[#2d2d2d] rounded-2xl overflow-hidden shadow-2xl border-8 border-white group"
          >
            <img 
              src={content.hero.imageUrl} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" 
              alt="Church"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
              {content.hero.youtubeUrl && (
                <button 
                  onClick={() => setActivePopup({ url: content.hero.youtubeUrl, title: 'YouTube Stream' })}
                  className="mb-6 group/btn"
                  id="play-video"
                >
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover/btn:scale-110 group-hover/btn:bg-white/30 transition-all">
                    <Play size={24} fill="white" className="ml-1" />
                  </div>
                </button>
              )}
              <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-80">Watch Our Latest Sermon</span>
              <h3 className="text-2xl font-serif italic mt-4">Join Us Live</h3>
              
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {content.hero.links.map((link, i) => (
                  <a 
                    key={i}
                    href={link.url}
                    className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-white/40 hover:bg-white hover:text-black rounded-full transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Action Apps Section */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* Prayer Forest */}
        <div 
          onClick={() => content.prayerForest.active && setActivePopup({ url: content.prayerForest.url, title: content.prayerForest.title })}
          className="group border-b md:border-b-0 md:border-r border-[#e5e1da] p-20 flex flex-col justify-center items-start hover:bg-[#8fa28a]/5 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 border border-[#8fa28a] rounded-full flex items-center justify-center mb-6 text-[#8fa28a] group-hover:bg-[#8fa28a] group-hover:text-white transition-all">
             <Plus size={20} />
          </div>
          <h2 className="text-5xl font-serif mb-4 italic leading-tight">{content.prayerForest.title}</h2>
          <p className="text-[11px] text-[#666] leading-relaxed uppercase tracking-[0.2em] mb-8">Interactive Web App • Submit Prayer Requests</p>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2 border border-[#1a1a1a] rounded-full group-hover:bg-[#1a1a1a] group-hover:text-white transition-all">Launch App</span>
        </div>

        {/* Monthly 181 */}
        <div 
          onClick={() => content.monthly181.active && setActivePopup({ url: content.monthly181.url, title: content.monthly181.title })}
          className="group p-20 flex flex-col justify-center items-start hover:bg-[#c2b280]/5 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 border border-[#c2b280] rounded-full flex items-center justify-center mb-6 text-[#c2b280] group-hover:bg-[#c2b280] group-hover:text-white transition-all">
             <ExternalLink size={20} />
          </div>
          <h2 className="text-5xl font-serif mb-4 italic leading-tight">{content.monthly181.title}</h2>
          <p className="text-[11px] text-[#666] leading-relaxed uppercase tracking-[0.2em] mb-8">Digital Flipbook • Parish Magazine Edition</p>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2 border border-[#1a1a1a] rounded-full group-hover:bg-[#1a1a1a] group-hover:text-white transition-all">Read Issue</span>
        </div>
      </section>

      {/* Info/Editor Area (Dark Accent) */}
      <section className="bg-[#2d2d2d] text-white py-24 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-4 block font-bold">General Announcements</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {content.generalInfo.map((info, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h4 className="text-lg font-serif italic text-white/90 border-b border-white/10 pb-2">{info.title}</h4>
                  <p className="text-sm font-light text-white/60 leading-relaxed whitespace-pre-wrap">{info.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-32 flex gap-4 md:flex-col items-center">
            <div className="h-0.5 md:h-12 w-12 md:w-0.5 bg-white/10"></div>
            <div className="h-0.5 md:h-12 w-12 md:w-0.5 bg-white/40"></div>
            <div className="h-0.5 md:h-12 w-12 md:w-0.5 bg-white/10"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-24 border-t border-[#e5e1da] px-10 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1a1a]/40 bg-white">
        <div>© 2026 은혜의 숲 교회. Established 1982.</div>
        <div className="flex gap-10">
          <span className="hover:text-[#1a1a1a] transition-colors cursor-pointer">Directions</span>
          <span className="hover:text-[#1a1a1a] transition-colors cursor-pointer">Contact</span>
          <span className="hover:text-[#1a1a1a] transition-colors cursor-pointer">Giving</span>
        </div>
      </footer>

      {/* Popups */}
      <AnimatePresence>
        {activePopup && (
          <Popup 
            url={activePopup.url} 
            title={activePopup.title} 
            onClose={() => setActivePopup(null)} 
          />
        )}
        
        {isEditing && (
          <Editor 
            content={content} 
            onSave={handleSave} 
            onClose={() => setIsEditing(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Editor Overlay Component
const Editor = ({ content, onSave, onClose }: { 
  content: LandingPageContent; 
  onSave: (val: LandingPageContent) => void;
  onClose: () => void;
}) => {
  const [localContent, setLocalContent] = useState(content);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed top-0 right-0 w-full md:w-[600px] h-full bg-[#fcfaf7] z-50 shadow-2xl flex flex-col p-10 overflow-y-auto border-l border-[#e5e1da]"
      id="editor-pane"
    >
      <div className="flex items-center justify-between mb-12 sticky top-0 bg-[#fcfaf7]/90 backdrop-blur-sm z-10 pb-6 border-b border-[#e5e1da]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8fa28a] rounded-full flex items-center justify-center text-white font-serif italic">E</div>
          <h2 className="text-2xl font-serif italic">Edition Mode</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSave(localContent)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a1a1a] text-white text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-black transition-all shadow-lg active:scale-95"
            id="save-changes"
          >
            <Save size={14} /> Save Changes
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
            id="close-editor"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {/* Hero Edit */}
        <section>
          <h3 className="text-[10px] font-bold text-[#8fa28a] uppercase tracking-[0.2em] mb-6">Hero Section</h3>
          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 ml-1 text-[#666]">Main Title</label>
              <textarea 
                value={localContent.hero.title}
                onChange={e => setLocalContent({ ...localContent, hero: { ...localContent.hero, title: e.target.value }})}
                className="w-full p-4 bg-white rounded-xl border border-[#e5e1da] shadow-sm focus:ring-1 focus:ring-[#8fa28a] outline-none font-serif italic text-xl"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 ml-1 text-[#666]">Subtitle</label>
              <input 
                value={localContent.hero.subtitle}
                onChange={e => setLocalContent({ ...localContent, hero: { ...localContent.hero, subtitle: e.target.value }})}
                className="w-full p-4 bg-white rounded-xl border border-[#e5e1da] shadow-sm focus:ring-1 focus:ring-[#8fa28a] outline-none font-light"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 ml-1 text-[#666]">Background Image</label>
                <input 
                  value={localContent.hero.imageUrl}
                  onChange={e => setLocalContent({ ...localContent, hero: { ...localContent.hero, imageUrl: e.target.value }})}
                  className="w-full p-3 bg-white rounded-xl border border-[#e5e1da] text-[11px] outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 ml-1 text-[#666]">YouTube Embed URL</label>
                <input 
                  value={localContent.hero.youtubeUrl}
                  onChange={e => setLocalContent({ ...localContent, hero: { ...localContent.hero, youtubeUrl: e.target.value }})}
                  className="w-full p-3 bg-white rounded-xl border border-[#e5e1da] text-[11px] outline-none"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
            </div>
            <div>
              <label className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold mb-4 ml-1 text-[#666]">
                Interaction Links
                <button 
                  onClick={() => {
                    const links = [...localContent.hero.links, { label: 'New Link', url: '#' }];
                    setLocalContent({ ...localContent, hero: { ...localContent.hero, links }});
                  }}
                  className="p-1 hover:bg-[#8fa28a]/10 text-[#8fa28a] rounded"
                >
                  <Plus size={16} />
                </button>
              </label>
              <div className="space-y-3">
                {localContent.hero.links.map((link, i) => (
                  <div key={i} className="flex gap-2 bg-white p-3 rounded-xl border border-[#e5e1da] shadow-sm group">
                    <input 
                      value={link.label}
                      onChange={e => {
                        const links = [...localContent.hero.links];
                        links[i].label = e.target.value;
                        setLocalContent({ ...localContent, hero: { ...localContent.hero, links }});
                      }}
                      className="w-1/3 bg-[#fcfaf7] p-2 rounded-lg border border-[#e5e1da] text-[11px] font-bold uppercase tracking-widest"
                      placeholder="Label"
                    />
                    <input 
                      value={link.url}
                      onChange={e => {
                        const links = [...localContent.hero.links];
                        links[i].url = e.target.value;
                        setLocalContent({ ...localContent, hero: { ...localContent.hero, links }});
                      }}
                      className="flex-1 bg-[#fcfaf7] p-2 rounded-lg border border-[#e5e1da] text-[11px]"
                      placeholder="URL"
                    />
                    <button 
                      onClick={() => {
                        const links = localContent.hero.links.filter((_, idx) => idx !== i);
                        setLocalContent({ ...localContent, hero: { ...localContent.hero, links }});
                      }}
                      className="p-2 text-red-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Action Blocks */}
        <section className="grid grid-cols-1 gap-10">
          <div className="bg-white p-6 rounded-2xl border border-[#e5e1da] shadow-sm">
            <h3 className="text-[10px] font-bold text-[#8fa28a] uppercase tracking-[0.2em] mb-4">App 01: Prayer Forest</h3>
            <div className="space-y-4">
              <input 
                value={localContent.prayerForest.title}
                onChange={e => setLocalContent({ ...localContent, prayerForest: { ...localContent.prayerForest, title: e.target.value }})}
                className="w-full p-3 bg-[#fcfaf7] rounded-xl border border-[#e5e1da] font-serif italic text-lg"
                placeholder="Title"
              />
              <input 
                value={localContent.prayerForest.url}
                onChange={e => setLocalContent({ ...localContent, prayerForest: { ...localContent.prayerForest, url: e.target.value }})}
                className="w-full p-3 bg-[#fcfaf7] rounded-xl border border-[#e5e1da] text-xs"
                placeholder="App URL"
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#e5e1da] shadow-sm">
            <h3 className="text-[10px] font-bold text-[#c2b280] uppercase tracking-[0.2em] mb-4">App 02: Monthly 181</h3>
            <div className="space-y-4">
              <input 
                value={localContent.monthly181.title}
                onChange={e => setLocalContent({ ...localContent, monthly181: { ...localContent.monthly181, title: e.target.value }})}
                className="w-full p-3 bg-[#fcfaf7] rounded-xl border border-[#e5e1da] font-serif italic text-lg"
                placeholder="Title"
              />
              <input 
                value={localContent.monthly181.url}
                onChange={e => setLocalContent({ ...localContent, monthly181: { ...localContent.monthly181, url: e.target.value }})}
                className="w-full p-3 bg-[#fcfaf7] rounded-xl border border-[#e5e1da] text-xs"
                placeholder="App URL"
              />
            </div>
          </div>
        </section>

        {/* Announcements */}
        <section>
          <label className="flex items-center justify-between text-[10px] font-bold text-[#666] uppercase tracking-[0.3em] mb-8">
            Global Announcements
            <button 
              onClick={() => {
                setLocalContent({ ...localContent, generalInfo: [...localContent.generalInfo, { title: 'New Topic', content: '' }]});
              }}
              className="p-2 bg-[#1a1a1a] text-white rounded-full hover:bg-black transition-colors"
            >
              <Plus size={16} />
            </button>
          </label>
          <div className="space-y-6">
            {localContent.generalInfo.map((info, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-[#e5e1da] shadow-md relative group overflow-hidden">
                <button 
                  onClick={() => {
                    const list = localContent.generalInfo.filter((_, idx) => idx !== i);
                    setLocalContent({ ...localContent, generalInfo: list });
                  }}
                  className="absolute top-4 right-4 p-2 text-red-200 hover:text-red-500 transition-all"
                >
                  <Trash2 size={18} />
                </button>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#8fa28a]/20 group-hover:bg-[#8fa28a] transition-all" />
                <input 
                  value={info.title}
                  onChange={e => {
                    const list = [...localContent.generalInfo];
                    list[i].title = e.target.value;
                    setLocalContent({ ...localContent, generalInfo: list });
                  }}
                  className="w-full bg-transparent p-0 mb-4 text-2xl font-serif italic border-none focus:ring-0"
                  placeholder="Topic Title"
                />
                <textarea 
                  value={info.content}
                  onChange={e => {
                    const list = [...localContent.generalInfo];
                    list[i].content = e.target.value;
                    setLocalContent({ ...localContent, generalInfo: list });
                  }}
                  rows={4}
                  className="w-full bg-[#fcfaf7] p-4 rounded-xl border border-[#e5e1da] text-sm font-light leading-relaxed outline-none"
                  placeholder="Tell the community something..."
                />
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="pb-24" />
    </motion.div>
  );
};
