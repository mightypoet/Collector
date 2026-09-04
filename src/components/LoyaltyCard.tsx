import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Coffee, Star, Trophy, Sparkles } from 'lucide-react';

interface LoyaltyCardProps {
  brandName: string;
  brandColor?: string;
  currentStamps: number;
  rewardThreshold: number;
  rewardType: string;
  onScan?: () => void;
}

export function LoyaltyCard({
  brandName,
  brandColor = 'bg-neo-cyan',
  currentStamps,
  rewardThreshold,
  rewardType,
  onScan,
}: LoyaltyCardProps) {
  const [isStamping, setIsStamping] = useState(false);
  const [localStamps, setLocalStamps] = useState(currentStamps);

  // Sync external prop changes
  useEffect(() => {
    if (currentStamps > localStamps) {
      setIsStamping(true);
      setTimeout(() => {
        setLocalStamps(currentStamps);
        setTimeout(() => setIsStamping(false), 500); // Reset animation state
      }, 300); // Delay stamp appearance slightly to sync with the "hit"
    } else {
      setLocalStamps(currentStamps);
    }
  }, [currentStamps]);

  const stampsArray = Array.from({ length: rewardThreshold }, (_, i) => i);
  const isRewardReady = localStamps >= rewardThreshold;

  return (
    <div className="relative w-full max-w-sm mx-auto perspective-1000">
      <motion.div
        whileHover={{ scale: 1.02, rotate: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative overflow-hidden border-4 border-black p-6 transition-all duration-200",
          "shadow-brutal hover:shadow-brutal-hover active:shadow-brutal-active",
          isRewardReady ? "bg-neo-yellow" : "bg-white"
        )}
      >
        {/* Header Ribbon */}
        <div className={cn("absolute top-0 left-0 w-full h-4 border-b-4 border-black", brandColor)} />

        {/* Card Content */}
        <div className="mt-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">{brandName}</h2>
            <p className="text-sm font-bold mt-1 text-gray-700 bg-neo-pink inline-block px-2 py-1 text-white border-2 border-black">
              {localStamps} / {rewardThreshold} STAMPS
            </p>
          </div>
          <div className="w-12 h-12 border-4 border-black rounded-full flex items-center justify-center bg-neo-cyan">
            <Coffee className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        {/* Stamps Grid */}
        <div className="mt-8 grid grid-cols-5 gap-3">
          {stampsArray.map((index) => {
            const isStamped = index < localStamps;
            const isJustStamped = isStamping && index === localStamps - 1;

            return (
              <div
                key={index}
                className="relative aspect-square border-4 border-black rounded-full bg-gray-100 flex items-center justify-center overflow-visible"
              >
                <AnimatePresence>
                  {isStamped && (
                    <motion.div
                      initial={isJustStamped ? { scale: 5, opacity: 0, rotate: -45 } : { scale: 1, opacity: 1, rotate: 0 }}
                      animate={{ scale: 1, opacity: 1, rotate: [-10, 10, 0] }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 400, 
                        damping: 15,
                        mass: 1.5,
                      }}
                      className="absolute inset-0 flex items-center justify-center text-neo-pink z-10"
                    >
                      <Star className="w-8 h-8 fill-current stroke-black stroke-[2]" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Visual impact ripples when stamping */}
                {isJustStamped && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-4 border-neo-pink z-0"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Reward Section */}
        <div className="mt-8 border-4 border-black p-4 bg-white relative overflow-hidden">
          {isRewardReady && (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -right-4 -top-4 w-24 h-24 bg-neo-yellow opacity-50 blur-xl"
            />
          )}
          <div className="relative flex items-center justify-between z-10">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-gray-500">Reward</span>
              <span className="text-lg font-bold flex items-center gap-2">
                {rewardType}
                {isRewardReady && <Sparkles className="w-4 h-4 text-neo-pink animate-bounce" />}
              </span>
            </div>
            {isRewardReady ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-neo-pink text-white font-arcade text-[10px] px-4 py-2 border-2 border-black shadow-brutal-sm"
              >
                REDEEM
              </motion.button>
            ) : (
              <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
                <Trophy className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        </div>

        {/* Demo trigger overlay */}
        {onScan && (
           <button 
             onClick={onScan}
             className="mt-6 w-full py-3 bg-black text-white font-black uppercase tracking-widest border-2 border-black hover:bg-neo-cyan hover:text-black transition-colors"
           >
             SIMULATE SCAN
           </button>
        )}
      </motion.div>
    </div>
  );
}
