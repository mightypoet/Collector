import { useState, useEffect } from 'react';
import { 
  FlaskConical, Search, Map as MapIcon, Check, Zap, Plus, 
  History, MapPin, Coffee, Activity, User, QrCode, ArrowLeft, 
  MoreVertical, Star, Gift, X, Info, Keyboard, Heart, Pizza, Leaf, Gamepad2, Medal, Store, Settings, LogOut, LayoutDashboard,
  CheckCircle2, Globe, Instagram, Image as ImageIcon, TrendingUp, Users, BarChart3, ChevronRight
} from 'lucide-react';
import { supabase } from './lib/supabase';
import LandingPage from './components/LandingPage';

type Brand = {
  id: string;
  name: string;
  iconName: string;
  themeColor: string;
  websiteUrl: string;
  instagramUrl: string;
};

type Program = {
  id: string;
  brandId: string;
  programName: string;
  targetProduct: string;
  rewardThreshold: number;
  rewardOffer: string;
  isActive: boolean;
};

type WalletItem = {
  programId: string;
  stamps: number;
};

const initialBrands: Brand[] = [
  { id: '1', name: 'Retro Coffee', iconName: 'Coffee', themeColor: '#d92d20', websiteUrl: 'retro.coffee', instagramUrl: '@retrocoffee' },
  { id: '2', name: 'Neon Arcade', iconName: 'Gamepad2', themeColor: '#065ee8', websiteUrl: 'neon.app', instagramUrl: '@neonarcade' }
];

const initialPrograms: Program[] = [
  { id: 'p1', brandId: '1', programName: 'Signature Brew Pass', targetProduct: 'All Lattes', rewardThreshold: 5, rewardOffer: 'Free Latte', isActive: true },
  { id: 'p2', brandId: '2', programName: 'Gamer Pass', targetProduct: 'Arcade Tokens', rewardThreshold: 10, rewardOffer: '$10 Credit', isActive: true }
];

const initialWallet: WalletItem[] = [
  { programId: 'p1', stamps: 4 },
  { programId: 'p2', stamps: 2 }
];

const Icon = ({ name, className, style }: { name: string, className?: string, style?: any }) => {
  const icons: Record<string, any> = { Coffee, Gamepad2, Pizza, Leaf, Heart, Medal, Star };
  const Comp = icons[name] || Star;
  return <Comp className={className} style={style} />;
};

export default function App() {
  const [role, setRole] = useState<'customer' | 'brand' | null>(null);
  const [session, setSession] = useState<any>(null);
  
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [wallet, setWallet] = useState<WalletItem[]>(initialWallet);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        const storedRole = localStorage.getItem('collector_pending_role') as 'customer' | 'brand' | null;
        if (storedRole) setRole(storedRole);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        const storedRole = localStorage.getItem('collector_pending_role') as 'customer' | 'brand' | null;
        if (storedRole) setRole(storedRole);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setSession(null);
  };

  if (!session || !role) {
    return <LandingPage onLogin={(r, s) => { setRole(r); setSession(s); }} />;
  }

  if (role === 'brand') {
    return <BrandApp goBack={handleLogout} brands={brands} setBrands={setBrands} programs={programs} setPrograms={setPrograms} session={session} />;
  }

  return <CustomerApp goBack={handleLogout} brands={brands} programs={programs} wallet={wallet} setWallet={setWallet} session={session} />;
}


function BrandApp({ goBack, brands, setBrands, programs, setPrograms }: any) {
  const [myBrand, setMyBrand] = useState<Brand>(brands[0]); // assume logged in as brand 1
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md min-h-screen bg-slate-50 shadow-2xl relative flex flex-col font-sans text-slate-800">
      {isEditingProfile ? (
        <BrandProfileSetup 
           brand={myBrand} 
           onSave={(updated: Brand) => {
              setBrands(brands.map((b: Brand) => b.id === updated.id ? updated : b));
              setMyBrand(updated);
              setIsEditingProfile(false);
           }}
           onCancel={() => setIsEditingProfile(false)}
        />
      ) : (
        <BrandDashboard 
           brand={myBrand} 
           programs={programs.filter((p: Program) => p.brandId === myBrand.id)}
           onEditProfile={() => setIsEditingProfile(true)} 
           onAddProgram={(prog: Program) => setPrograms([...programs, prog])}
           goBack={goBack} 
        />
      )}
    </div>
  );
}

function BrandDashboard({ brand, programs, onEditProfile, onAddProgram, goBack }: any) {
  const [isAddingProgram, setIsAddingProgram] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-32 relative">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-full transition-colors shadow-sm">
            <LogOut className="w-4 h-4 text-slate-800 stroke-[2.5]" />
          </button>
          <span className="font-bold text-lg tracking-tight">Brand Workspace</span>
        </div>
      </header>

      <main className="px-5 mt-2">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-200 mb-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-[18px] flex items-center justify-center text-white shadow-sm flex-shrink-0" style={{ backgroundColor: brand.themeColor }}>
            <Icon name={brand.iconName} className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="flex-grow min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{brand.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
               {brand.websiteUrl && <a href={`https://${brand.websiteUrl}`} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-primary flex items-center gap-1"><Globe className="w-3 h-3" /> {brand.websiteUrl}</a>}
            </div>
          </div>
          <button onClick={onEditProfile} className="p-2.5 bg-slate-50 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors flex-shrink-0">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <h2 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-2 flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> Performance</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Stamps Issued</div>
            <div className="text-3xl font-bold text-slate-900">842</div>
          </div>
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Gift className="w-3.5 h-3.5" /> Rewards Claimed</div>
            <div className="text-3xl font-bold text-slate-900">124</div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-5 opacity-10">
            <TrendingUp className="w-16 h-16" />
          </div>
          <div className="flex justify-between items-center mb-3 relative z-10">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Table Turns (Return Rate)</div>
             <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">+12% vs last mo</span>
          </div>
          <div className="flex items-end gap-2 relative z-10">
            <div className="text-4xl font-bold text-slate-900 tracking-tight">3.2</div>
            <div className="text-sm font-semibold text-slate-500 mb-1">visits / customer / mo</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 ml-2">
          <h2 className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Active Programs</h2>
          <button onClick={() => setIsAddingProgram(true)} className="text-primary text-[12px] font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
             <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add New
          </button>
        </div>

        <div className="space-y-4">
          {programs.map((prog: any) => (
             <div key={prog.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200 group">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-[17px] text-slate-900 leading-tight mb-1">{prog.programName}</h3>
                   <p className="text-xs font-semibold text-slate-500">Applies to: {prog.targetProduct}</p>
                 </div>
                 <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${prog.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                   {prog.isActive ? 'Active' : 'Paused'}
                 </div>
               </div>
               <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-[13px] font-medium text-slate-700 bg-slate-50 px-3 py-2.5 rounded-[12px] border border-slate-100">
                   <CheckCircle2 className="w-4 h-4 text-slate-400" /> 
                   <span>Require <span className="font-bold">{prog.rewardThreshold}</span> stamps</span>
                 </div>
                 <div className="flex items-center gap-2 text-[13px] font-medium text-slate-700 bg-slate-50 px-3 py-2.5 rounded-[12px] border border-slate-100">
                   <Gift className="w-4 h-4 text-slate-400" /> 
                   <span>Reward: <span className="font-bold">{prog.rewardOffer}</span></span>
                 </div>
               </div>
             </div>
          ))}
          {programs.length === 0 && (
             <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-[20px] text-slate-400 text-sm font-medium">
                No active programs. Create one to get started.
             </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-5 pb-safe pt-2 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-20">
         <button className="w-full text-white rounded-[20px] py-[18px] font-semibold flex items-center justify-center gap-2 text-base shadow-lg shadow-slate-300 transition-transform hover:scale-[1.02]" style={{ backgroundColor: brand.themeColor }}>
           <QrCode className="w-5 h-5 stroke-[2]" />
           Issue Stamp
         </button>
      </div>

      {isAddingProgram && (
        <ProgramSetup brand={brand} onSave={(p: any) => { onAddProgram(p); setIsAddingProgram(false); }} onCancel={() => setIsAddingProgram(false)} />
      )}
    </div>
  );
}

function ProgramSetup({ brand, onSave, onCancel }: any) {
  const [programName, setProgramName] = useState('');
  const [targetProduct, setTargetProduct] = useState('');
  const [rewardThreshold, setRewardThreshold] = useState(5);
  const [rewardOffer, setRewardOffer] = useState('');

  return (
    <div className="fixed inset-0 max-w-md mx-auto z-50 flex flex-col bg-slate-900/40 backdrop-blur-sm justify-end">
       <div className="bg-white rounded-t-[32px] p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom-8">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold tracking-tight">New Program</h3>
           <button onClick={onCancel} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
         </div>
         <div className="space-y-5">
           <div>
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Program Name</label>
             <input type="text" placeholder="e.g. Signature Brew Pass" value={programName} onChange={e => setProgramName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3.5 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 shadow-sm transition-colors" />
           </div>
           <div>
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Product/Category</label>
             <input type="text" placeholder="e.g. All Lattes" value={targetProduct} onChange={e => setTargetProduct(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3.5 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 shadow-sm transition-colors" />
           </div>
           <div>
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Reward Offer</label>
             <input type="text" placeholder="e.g. Free Pastry" value={rewardOffer} onChange={e => setRewardOffer(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3.5 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 shadow-sm transition-colors" />
           </div>
           <div className="bg-slate-50 p-5 rounded-[20px] border border-slate-200 shadow-sm">
             <label className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
               <span>Stamps Required</span>
               <span className="text-lg text-slate-900">{rewardThreshold}</span>
             </label>
             <input type="range" min="3" max="12" value={rewardThreshold} onChange={e => setRewardThreshold(parseInt(e.target.value))} className="w-full accent-slate-900" />
             <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 px-1">
                <span>3</span><span>12</span>
             </div>
           </div>
           <button 
             onClick={() => {
                if(programName && targetProduct && rewardOffer) {
                    onSave({ id: 'p' + Date.now(), brandId: brand.id, programName, targetProduct, rewardThreshold, rewardOffer, isActive: true });
                }
             }} 
             disabled={!programName || !targetProduct || !rewardOffer}
             className="w-full text-white rounded-[20px] py-4 font-bold mt-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
             style={{ backgroundColor: brand.themeColor }}
           >
             Create Program
           </button>
         </div>
       </div>
    </div>
  );
}

function BrandProfileSetup({ brand, onSave, onCancel }: any) {
  const [name, setName] = useState(brand.name);
  const [iconName, setIconName] = useState(brand.iconName);
  const [themeColor, setThemeColor] = useState(brand.themeColor);
  const [websiteUrl, setWebsiteUrl] = useState(brand.websiteUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(brand.instagramUrl || '');

  const colors = ['#d92d20', '#ea580c', '#eab308', '#0b9e43', '#065ee8', '#8b5cf6', '#ec4899', '#0f172a'];
  const icons = ['Coffee', 'Pizza', 'Gamepad2', 'Leaf', 'Heart', 'Star', 'Medal'];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-10">
      <header className="flex items-center justify-between px-4 py-4 bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-800 stroke-[2]" />
          </button>
          <span className="font-bold text-xl tracking-tight">Brand Profile</span>
        </div>
      </header>

      <main className="px-6 flex-grow space-y-6 mt-2">
        <div className="flex justify-center mb-4">
           <div className="w-24 h-24 rounded-[24px] flex items-center justify-center text-white shadow-md relative" style={{ backgroundColor: themeColor }}>
              <Icon name={iconName} className="w-10 h-10 stroke-[2]" />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 text-slate-500">
                 <ImageIcon className="w-4 h-4" />
              </div>
           </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Brand Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-[16px] px-4 py-3.5 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 shadow-sm" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Website</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="yoursite.com" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="w-full bg-white border border-slate-200 rounded-[16px] pl-10 pr-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:border-slate-400 shadow-sm text-sm" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Instagram</label>
            <div className="relative">
              <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="@handle" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className="w-full bg-white border border-slate-200 rounded-[16px] pl-10 pr-4 py-3.5 text-slate-900 font-medium focus:outline-none focus:border-slate-400 shadow-sm text-sm" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Theme Color</label>
          <div className="flex flex-wrap gap-3">
            {colors.map(c => (
              <button 
                key={c} 
                onClick={() => setThemeColor(c)} 
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform shadow-sm ${themeColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'}`} 
                style={{ backgroundColor: c }}
              >
                {themeColor === c && <Check className="w-5 h-5 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Brand Icon</label>
          <div className="flex flex-wrap gap-3">
            {icons.map(i => (
              <button 
                key={i} 
                onClick={() => setIconName(i)} 
                className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all shadow-sm ${iconName === i ? 'text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                style={{ backgroundColor: iconName === i ? themeColor : undefined }}
              >
                <Icon name={i} className="w-6 h-6 stroke-[2]" />
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => onSave({ ...brand, name, iconName, themeColor, websiteUrl, instagramUrl })} 
          className="w-full text-white rounded-[20px] py-4 font-bold mt-6 shadow-md transition-transform hover:scale-[1.01] text-lg"
          style={{ backgroundColor: themeColor }}
        >
          Save Profile
        </button>
      </main>
    </div>
  );
}

function CustomerApp({ goBack, brands, programs, wallet, setWallet, session }: any) {
  const [screen, setScreen] = useState<'home' | 'detail' | 'scan'>('home');
  const [activeTab, setActiveTab] = useState('wallet');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [scanProgramId, setScanProgramId] = useState<string | null>(null);

  const openDetail = (id: string) => {
    setSelectedProgramId(id);
    setScreen('detail');
  };

  const handleScan = () => {
    if (scanProgramId) {
      setWallet((prev: WalletItem[]) => prev.map(w => w.programId === scanProgramId ? {
        ...w,
        stamps: Math.min(w.stamps + 1, programs.find((p: Program) => p.id === scanProgramId)?.rewardThreshold || 10)
      } : w));
    } else {
      // Demo: Add stamp to first program if scanned globally
      setWallet((prev: WalletItem[]) => {
        const first = prev[0];
        if (!first) return prev;
        const prog = programs.find((p: Program) => p.id === first.programId);
        return [
          { ...first, stamps: Math.min(first.stamps + 1, prog?.rewardThreshold || 10) },
          ...prev.slice(1)
        ];
      });
    }
    setScreen(selectedProgramId ? 'detail' : 'home');
  };

  return (
    <div className="mx-auto w-full max-w-md min-h-screen bg-slate-50 shadow-2xl relative flex flex-col font-sans text-slate-800">
      {screen === 'home' && (
        <Home 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          openDetail={openDetail}
          openScan={() => { setScanProgramId(null); setScreen('scan'); }}
          goBack={goBack}
          brands={brands}
          programs={programs}
          wallet={wallet}
          session={session}
        />
      )}
      {screen === 'detail' && selectedProgramId && (
        <BrandDetail 
          goBack={() => setScreen('home')} 
          openScan={() => { setScanProgramId(selectedProgramId); setScreen('scan'); }}
          program={programs.find((p: Program) => p.id === selectedProgramId)}
          brand={brands.find((b: Brand) => b.id === programs.find((p: Program) => p.id === selectedProgramId)?.brandId)}
          walletItem={wallet.find((w: WalletItem) => w.programId === selectedProgramId)}
        />
      )}
      {screen === 'scan' && (
        <Scanner close={() => setScreen(selectedProgramId ? 'detail' : 'home')} onSimulateScan={handleScan} />
      )}
    </div>
  );
}

function Home({ activeTab, setActiveTab, openDetail, openScan, goBack, brands, programs, wallet, session }: any) {
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-50 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <FlaskConical className="w-6 h-6 stroke-[2.5]" />
          <span className="tracking-tight">Collector</span>
        </div>
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-700 stroke-[2.5]" />
          <button onClick={goBack} className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs tracking-wider cursor-pointer hover:bg-blue-200 transition-colors" title="Logout">
            {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>
        </div>
      </header>

      <main className="px-6 flex-grow">
        <div className="mt-2 mb-6">
          <p className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">Personal Dashboard</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Welcome</h1>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Your collection of active experiments and rewards is growing. Keep exploring to earn more stamps.
          </p>
        </div>

        <div className="bg-slate-100 rounded-[20px] p-6 text-center mb-6 border border-slate-200">
          <div className="text-5xl font-semibold text-primary mb-1">
            {wallet.reduce((acc: number, cur: WalletItem) => acc + cur.stamps, 0).toString().padStart(2, '0')}
          </div>
          <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Total Stamps</div>
        </div>

        <div className="bg-slate-100 rounded-[20px] p-6 relative flex flex-col items-center justify-center h-32 mb-8 border border-slate-200">
          <div className="absolute top-3 right-3 bg-primary text-white text-[11px] font-bold px-4 py-1.5 rounded-full">Map View</div>
          <div className="absolute bottom-3 left-3 bg-white text-primary text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm border border-slate-100">
            <MapPin className="w-3 h-3" /> Nearby Labs
          </div>
          <MapIcon className="w-10 h-10 text-slate-400 opacity-60 stroke-[1.5]" />
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[19px] font-semibold">Active Discoveries</h2>
            <button className="text-primary text-[11px] font-bold flex items-center gap-1">View All <span className="text-[10px]">❯</span></button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <DiscoveryItem icon={<Coffee />} label="Retro" active color="text-primary" bgColor="bg-blue-50" borderColor="border-primary" />
            <DiscoveryItem icon={<Gamepad2 />} label="Arcade" color="text-slate-500" bgColor="bg-slate-100" />
            <DiscoveryItem icon={<Pizza />} label="Pizza Lab" color="text-slate-500" bgColor="bg-slate-100" />
            <DiscoveryItem icon={<Leaf />} label="Grocer" color="text-slate-500" bgColor="bg-slate-100" />
            <DiscoveryItem icon={<Plus />} label="More" color="text-slate-500" bgColor="bg-slate-100" />
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[19px] font-semibold">Active Passes</h2>
            <button className="text-primary text-[11px] font-bold flex items-center gap-1">View All <span className="text-[10px]">❯</span></button>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {wallet.map((item: WalletItem) => {
              const prog = programs.find((p: Program) => p.id === item.programId);
              if (!prog) return null;
              const brand = brands.find((b: Brand) => b.id === prog.brandId);
              if (!brand) return null;

              return (
                <div 
                  key={prog.id}
                  onClick={() => openDetail(prog.id)}
                  className="snap-center shrink-0 w-[85%] bg-white rounded-[20px] p-5 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white" style={{ backgroundColor: brand.themeColor }}>
                        <Icon name={brand.iconName} className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg leading-tight tracking-tight text-slate-900">{brand.name}</h3>
                        <p className="text-[13px] text-slate-500 font-medium">{prog.programName}</p>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                      {item.stamps}/{prog.rewardThreshold}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5 mb-6">
                    {Array.from({ length: Math.min(prog.rewardThreshold, 10) }).map((_, i) => {
                      const isStamped = i < item.stamps;
                      return isStamped ? (
                        <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: brand.themeColor }}>
                          {brand.iconName === 'Gamepad2' ? <Zap className="w-4 h-4 fill-current" /> : <Check className="w-5 h-5 stroke-[3]" />}
                        </div>
                      ) : (
                        <div key={i} className={`w-8 h-8 rounded-full border-[1.5px] border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold ${i === prog.rewardThreshold - 1 ? 'border-dashed' : ''}`}>
                          {i === prog.rewardThreshold - 1 ? prog.rewardThreshold : ''}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center gap-4">
                    <div className="text-[12px] font-medium text-slate-600 whitespace-nowrap">Next reward: {prog.rewardOffer}</div>
                    <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(item.stamps / prog.rewardThreshold) * 100}%`, backgroundColor: brand.themeColor }} />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="snap-center shrink-0 w-[85%] rounded-[20px] py-8 border-[1.5px] border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400 bg-transparent cursor-pointer hover:bg-slate-100/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                <Plus className="w-4 h-4 text-slate-600 stroke-[2]" />
              </div>
              <div className="font-semibold text-slate-800 text-sm tracking-tight">Add New Pass</div>
              <div className="text-xs text-slate-500">Scan a code to start a journey</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[19px] font-semibold mb-4">Activity Trends</h2>
          
          <div className="bg-slate-50 rounded-[20px] p-6 border border-slate-200 mb-4 flex flex-col justify-between h-32">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Top Brand</div>
            <div className="flex justify-between items-end">
              <div className="text-[28px] font-medium text-primary tracking-tight leading-none">Retro Coffee</div>
              <div className="text-[11px] font-bold text-success">+12% this week</div>
            </div>
          </div>

          <div className="bg-[#e6f7ec] rounded-[20px] p-6 border border-[#c3f0d4] mb-4 h-32 flex flex-col justify-between">
            <div className="text-[10px] font-bold uppercase tracking-widest text-success">Rewards Ready</div>
            <div className="text-5xl font-semibold text-[#0b9e43]">0</div>
          </div>

          <div className="bg-[#fee4e2] rounded-[20px] p-6 border border-[#fecdca] h-32 flex flex-col justify-between mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-danger">Active Offers</div>
            <div className="text-5xl font-semibold text-[#d92d20]">3</div>
          </div>
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} openScan={openScan} />
    </div>
  );
}

function DiscoveryItem({ icon, label, active = false, color, bgColor, borderColor }: any) {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bgColor} ${color} ${active ? `border-[1.5px] ${borderColor}` : ''}`}>
        {icon}
      </div>
      <span className={`text-xs font-semibold ${active ? 'text-primary' : 'text-slate-600'}`}>{label}</span>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab, openScan }: any) {
  const tabs = [
    { id: 'wallet', label: 'Wallet', icon: <div className="w-5 h-5 rounded border-2 border-current flex items-center justify-center"><div className="w-2.5 h-1 border-t-2 border-current" /></div> },
    { id: 'discover', label: 'Discover', icon: <MapIcon className="w-5 h-5 stroke-[2]" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-5 h-5 stroke-[2]" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5 stroke-[2]" /> }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-50/90 backdrop-blur-md border-t border-slate-200 flex justify-between px-2 pb-safe pt-1 pb-3 z-50">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center w-1/5 py-2 ${activeTab === tab.id ? 'text-primary bg-blue-100/50 rounded-[14px]' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <div className="mb-1">{tab.icon}</div>
          <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
        </button>
      ))}
      <div className="absolute -top-6 right-6">
        <button 
          onClick={openScan}
          className="w-[52px] h-[52px] bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-blue-700 transition-colors"
        >
          <QrCode className="w-6 h-6 stroke-[2]" />
        </button>
      </div>
    </div>
  );
}

function BrandDetail({ goBack, openScan, program, brand, walletItem }: any) {
  if (!program || !brand || !walletItem) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-24 relative">
      <header className="flex items-center justify-between px-4 py-4 bg-slate-50/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-800 stroke-[2]" />
          </button>
        </div>
      </header>

      <main className="px-5 flex-grow pt-2">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 mb-1 tracking-tight">{brand.name}</h1>
          <p className="text-sm text-slate-600 font-medium">{program.programName}</p>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 relative overflow-hidden mb-6">
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Loyalty Pass</div>
              <Icon name={brand.iconName} className="w-5 h-5 stroke-[2]" style={{ color: brand.themeColor }} />
            </div>

            <div className="flex flex-wrap justify-center gap-5 mb-12 px-2">
              {Array.from({ length: program.rewardThreshold }).map((_, i) => {
                const isStamped = i < walletItem.stamps;
                return isStamped ? (
                  <div key={i} className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: brand.themeColor }}>
                    <Check className="w-7 h-7 stroke-[2.5]" />
                  </div>
                ) : (
                  <div key={i} className={`w-[60px] h-[60px] rounded-full border-[1.5px] border-slate-300 flex items-center justify-center text-slate-400 font-bold text-lg bg-slate-50 ${i === program.rewardThreshold - 1 ? 'border-dashed' : ''}`}>
                    {i === program.rewardThreshold - 1 ? program.rewardThreshold : ''}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200/60 pt-5 flex justify-between items-end">
              <div>
                <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase mb-1">Stamps Collected</div>
                <div className="text-xl font-medium text-slate-400"><span style={{ color: brand.themeColor }}>{walletItem.stamps}</span> / {program.rewardThreshold}</div>
              </div>
              <div className="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                {program.rewardThreshold - walletItem.stamps} Left!
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-4 border border-slate-200 flex items-center gap-4 mb-8 shadow-sm">
          <div className="w-12 h-12 rounded-[16px] flex items-center justify-center text-white flex-shrink-0 shadow-sm" style={{ backgroundColor: brand.themeColor }}>
            <Gift className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex-grow">
            <div className="text-[12px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Next Reward</div>
            <div className="text-[15px] font-semibold text-slate-900">{program.rewardOffer}</div>
          </div>
          <div className="text-slate-400 text-sm"><ChevronRight className="w-5 h-5"/></div>
        </div>

        <button onClick={openScan} className="w-full text-white rounded-[20px] py-[18px] font-semibold flex items-center justify-center gap-2 mb-10 shadow-md text-base transition-transform hover:scale-[1.02]" style={{ backgroundColor: brand.themeColor }}>
          <QrCode className="w-5 h-5 stroke-[2]" />
          Scan to Stamp
        </button>

        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-slate-400 stroke-[2.5]" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Last Visit</div>
            <div className="text-[15px] font-medium text-slate-900">Yesterday, 8:45 AM</div>
          </div>

          <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
              <MapIcon className="w-4 h-4 text-slate-400 stroke-[2.5]" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Nearest Lab</div>
            <div className="text-[15px] font-medium text-slate-900">Downtown Annex</div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Scanner({ close, onSimulateScan }: any) {
  return (
    <div className="fixed inset-0 max-w-md mx-auto z-[100] flex flex-col bg-slate-900/90 backdrop-blur-xl text-white">
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <FlaskConical className="w-6 h-6 stroke-[2.5]" />
          <span className="tracking-tight">Collector</span>
        </div>
        <button onClick={close} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6 stroke-[2]" />
        </button>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold mb-2">Ready to Scan</h2>
          <p className="text-slate-300 font-medium max-w-[260px] mx-auto text-[15px] leading-snug">
            Position a QR code within the frame to automatically collect your stamp.
          </p>
        </div>

        <div className="relative w-72 h-72 mb-16">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-[24px]"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-[24px]"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-[24px]"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-[24px]"></div>
          
          <div className="absolute inset-0 border-[1px] border-white/20 rounded-[24px]"></div>
          
          <div className="absolute inset-4 flex items-center justify-center bg-white/10 rounded-[16px] backdrop-blur-sm">
             <QrCode className="w-16 h-16 text-white/50" />
          </div>
        </div>

        <div className="w-full flex flex-col gap-6 mt-auto">
          <button 
            onClick={onSimulateScan}
            className="w-full bg-primary hover:bg-blue-600 text-white rounded-[20px] py-[16px] font-bold flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/30 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            SIMULATE SCAN
          </button>
          
          <div className="bg-white/10 backdrop-blur-md rounded-full py-[14px] px-4 flex items-center gap-2 text-[11px] font-bold tracking-wide justify-center w-full uppercase border border-white/10">
            <Info className="w-4 h-4 stroke-[2]" />
            Align QR code to collect your stamp
          </div>
        </div>
      </div>
    </div>
  );
}
