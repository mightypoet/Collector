import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Store, Loader2 } from 'lucide-react';

export default function LandingPage({ onLogin }: { onLogin: (role: 'customer' | 'brand', session: any) => void }) {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'brand' | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleRoleSelect = (role: 'customer' | 'brand') => {
    setSelectedRole(role);
  };

  const handleGoogleLogin = async () => {
    if (!selectedRole) return;
    setIsAuthenticating(true);
    
    // Save role to localStorage so we can retrieve it after OAuth redirect
    localStorage.setItem('collector_pending_role', selectedRole);

    // Mock login for now
    setTimeout(() => {
      onLogin(selectedRole, { user: { email: 'demo@example.com' } });
      setIsAuthenticating(false);
    }, 1000);
  };

  return (
    <div className="mx-auto w-full max-w-md h-[100dvh] flex flex-col justify-center p-8 bg-slate-50 relative overflow-hidden font-sans text-slate-900 shadow-2xl">
      {/* Soft Background Blurs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-slate-200/40 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
      
      <div className="relative z-10 flex flex-col h-full justify-between py-12">
        <div className="flex flex-col items-center text-center mt-12">
          {/* Minimalist Logo */}
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-8 border border-slate-100">
             <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
               <rect width="40" height="40" rx="12" fill="currentColor" className="text-slate-900" />
               <path d="M12 20h16M20 12v16" stroke="white" strokeWidth="4" strokeLinecap="round" />
             </svg>
          </div>
          <h1 className="text-[32px] font-bold tracking-tight mb-3">Collector</h1>
          <p className="text-[15px] text-slate-500 font-medium">The modern digital loyalty platform.</p>
        </div>
        
        <div className="flex flex-col gap-4 mt-auto mb-8">
          <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2">Select your role</p>
          
          <button 
            onClick={() => handleRoleSelect('customer')} 
            className={`w-full bg-white p-5 rounded-3xl flex items-center gap-5 transition-all duration-300 ease-out ${selectedRole === 'customer' ? 'ring-2 ring-slate-900 shadow-md scale-[1.02]' : 'border border-slate-100 shadow-sm hover:shadow-md'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${selectedRole === 'customer' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>
              <User className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 text-[17px] mb-0.5">Customer</h3>
              <p className="text-[13px] text-slate-500 font-medium">Collect stamps & earn rewards</p>
            </div>
          </button>

          <button 
            onClick={() => handleRoleSelect('brand')} 
            className={`w-full bg-white p-5 rounded-3xl flex items-center gap-5 transition-all duration-300 ease-out ${selectedRole === 'brand' ? 'ring-2 ring-slate-900 shadow-md scale-[1.02]' : 'border border-slate-100 shadow-sm hover:shadow-md'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${selectedRole === 'brand' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>
              <Store className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 text-[17px] mb-0.5">Brand Owner</h3>
              <p className="text-[13px] text-slate-500 font-medium">Manage your loyalty program</p>
            </div>
          </button>
        </div>

        {/* Google OAuth Button Reveal */}
        <div className={`transition-all duration-500 ease-out overflow-hidden flex justify-center ${selectedRole ? 'opacity-100 translate-y-0 h-16' : 'opacity-0 translate-y-4 h-0'}`}>
          <button 
            onClick={handleGoogleLogin}
            disabled={isAuthenticating || !selectedRole}
            className="w-full bg-slate-900 text-white rounded-full py-4 px-6 font-semibold text-[15px] flex items-center justify-center gap-3 shadow-lg shadow-slate-200 active:scale-95 transition-all disabled:opacity-80"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
