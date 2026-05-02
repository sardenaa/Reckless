import React, { useState } from "react";
import { CreditCard, ShieldCheck, Diamond, Star, AlertTriangle, Loader2, CheckCircle2, Lock, ArrowRight, X, Heart, Zap, Globe, Cpu, Info } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "../components/Toast";

export default function Donations() {
  const [selectedTier, setSelectedTier] = useState<any>(null);

  const goalProgress = 74; // 74% of server cost met

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-10 bg-(--accent) shadow-[0_0_15px_var(--glow)]" />
             <div>
               <h1 className="text-3xl font-black uppercase tracking-tighter italic font-display">Supporter Perks</h1>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] -mt-1 opacity-60">Help the community & unlock extra features</p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-black/40 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-2xl">
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Global Uptime</span>
             <span className="text-xs font-mono font-black text-emerald-500 neon-text">99.98%</span>
           </div>
           <div className="w-[1px] h-8 bg-white/10" />
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Active Nodes</span>
             <span className="text-xs font-mono font-black text-(--accent) neon-text">12/12</span>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Goal Tracker */}
          <div className="portal-card relative overflow-hidden group p-8 bg-black/40 backdrop-blur-md">
            <div className="absolute top-0 right-0 p-4 opacity-5 italic text-[11px] font-black tracking-widest font-mono">MAINTENANCE_GOAL</div>
            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-3 font-display neon-text">
                    <Heart className="text-red-500 animate-pulse" size={18} /> Monthly Goal
                  </h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">Covers hosting, protection, and development</p>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-2xl font-black text-white font-display leading-none">$259.00</span>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1 opacity-40">Target: $350.00</span>
                </div>
              </div>
              
              <div className="relative group/bar">
                <div className="w-full h-4 bg-black/80 border border-white/10 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goalProgress}%` }}
                    transition={{ duration: 2, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-orange-600 via-(--accent) to-cyan-400 relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[marquee_2s_linear_infinite]" />
                    <motion.div 
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-white/20"
                    />
                  </motion.div>
                </div>
                <div className="absolute -top-10 left-[74%] -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-(--accent) text-black px-2 py-1 text-[10px] font-black uppercase font-mono shadow-lg">
                   {goalProgress}%_CAPACITY
                </div>
              </div>

              <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Status: Healthy
                </span>
                <span className={clsx("transition-colors", goalProgress > 50 ? "text-emerald-500" : "text-orange-500")}>
                  {goalProgress}% Finished
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <DonationTier 
              title="Bronze" 
              price="2.50" 
              icon={<Star className="text-orange-400" size={24} />}
              onSelect={() => setSelectedTier({ title: "Bronze Donator", price: "2.50", icon: <Star className="text-orange-400" size={24} /> })}
              features={[
                "Orange Chat Identity",
                "1x Custom License Plate",
                "Official Discord Rank",
                "Infinite Connection AFK"
              ]}
            />
            <DonationTier 
              title="Gold" 
              price="5.00" 
              icon={<Star className="text-yellow-500" size={24} />}
              onSelect={() => setSelectedTier({ title: "Gold Donator", price: "5.00", icon: <Star className="text-yellow-500" size={24} /> })}
              features={[
                "Yellow Chat Identity",
                "Extra Car Slot (+1)",
                "Priority Support Access",
                "Custom Entry Message",
                "V-Color Permissions"
              ]}
            />
            <DonationTier 
              title="Platinum" 
              price="10.00" 
              icon={<ShieldCheck className="text-cyan-400" size={24} />}
              featured={true}
              onSelect={() => setSelectedTier({ title: "Platinum Donator", price: "10.00", icon: <ShieldCheck className="text-cyan-400" size={24} />, featured: true })}
              features={[
                "Cyan Chat Identity",
                "Personalized Safehouse",
                "Extra Car Slots (+3)",
                "Dynamic Job Switching",
                "Survival Metabolism Lock",
                "Personal /tag Identity"
              ]}
            />
            <DonationTier 
              title="Diamond" 
              price="25.00" 
              icon={<Diamond className="text-pink-400" size={24} />}
              onSelect={() => setSelectedTier({ title: "Diamond Donator", price: "25.00", icon: <Diamond className="text-pink-400" size={24} /> })}
              features={[
                "Pink Chat Identity",
                "Personal Guard NPC",
                "Archive Access (Car Slots)",
                "Elite Lobby Access",
                "Custom Log-in Protocol",
                "Unique Forum Metadata"
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="portal-card h-fit">
            <div className="portal-header flex items-center gap-2">
              <Globe size={14} className="text-blue-500" />
              Top Supporters
            </div>
            <div className="p-6 flex flex-col gap-1 text-center py-12">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">No contributors detected yet.</p>
            </div>
          </div>

          <div className="portal-card h-fit border-blue-500/20 bg-blue-500/5">
             <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/20 rounded">
                      <Zap size={18} className="text-blue-500" />
                   </div>
                   <h4 className="text-xs font-black uppercase text-blue-400 leading-tight">Instant Updates</h4>
                </div>
                <p className="text-[10px] text-blue-200/60 font-medium leading-relaxed">
                   All perks are processed instantly. Your rank will update in game almost immediately after purchase.
                </p>
             </div>
          </div>

          <div className="portal-card overflow-hidden">
            <div className="portal-header">Manual Sync</div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">If you paid through another method and need to update your rank manually:</p>
              <div className="flex flex-col gap-2">
                <input className="bg-black/60 border border-white/10 p-3 text-[10px] font-mono outline-none focus:border-(--accent) text-white" placeholder="Transaction ID..." />
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 font-black uppercase text-[10px] tracking-widest transition-all">Submit ID</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
           <Info size={18} className="text-gray-500" />
           <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Common Questions</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
           {[
             { q: "Is the rank permanent?", a: "Negative. Ranks are valid for exactly 30 cycles. One-time cosmetic items are retained unless specified otherwise." },
             { q: "Can I transfer perks?", a: "Restricted. Sanctions apply to the Identity ID (UID). Reassigning perks to other network accounts is forbidden." },
             { q: "Refund policy?", a: "All transactions are final contributions to the infrastructure. No liquidation is possible after confirm." },
             { q: "What if the server reboots?", a: "Persistence is guaranteed. Your rank metadata is mirrored across our global backup nodes." }
           ].map(faq => (
             <div key={faq.q} className="p-5 bg-black/40 border border-white/5 rounded">
                <h4 className="text-[10px] font-black uppercase text-(--accent) mb-2">{faq.q}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{faq.a}</p>
             </div>
           ))}
        </div>
      </div>

      <div className="portal-card bg-red-950/20 border-red-500/30 p-6 flex gap-4">
        <AlertTriangle className="text-red-500 shrink-0" size={24} />
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Service Terms Override</h3>
          <p className="text-xs leading-relaxed text-red-200/70">
            By executing a contribution, you acknowledge these are virtual items with no real-world monetary value. 
            Rank abuse (network harassment, identity theft, or system exploitation) will result in a global ban without recourse.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {selectedTier && (
          <CheckoutModal tier={selectedTier} onClose={() => setSelectedTier(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckoutModal({ tier, onClose }: any) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto' | 'wallet' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLog, setTerminalLog] = useState<string[]>([]);
  const { toast } = useToast();

  const handlePay = () => {
    setIsProcessing(true);
    setTerminalLog(["INITIALIZING_HANDSHAKE...", "ENCRYPTING_IDENTITY_TOKEN...", "CONTACTING_EXTERNAL_NODE..."]);
    
    setTimeout(() => {
      setTerminalLog(prev => [...prev, "NODE_CONFIRMED: AUTH_GRANT_SUCCESS", "SYNCHRONIZING_METADATA..."]);
    }, 1200);

    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
      toast("success", "Handshake Successful", "Your transaction has been written to the network.");
    }, 3500);
  };

  const PAYMENT_METHODS = [
    { id: 'card', name: 'Credit Card', icon: <CreditCard size={18} />, color: 'blue' },
    { id: 'paypal', name: 'PayPal', icon: <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-4" />, color: 'blue' },
    { id: 'crypto', name: 'Crypto', icon: <Lock size={18} />, color: 'orange' },
    { id: 'wallet', name: 'E-Wallet', icon: <CreditCard size={18} />, color: 'emerald' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-(--card-bg) border border-(--border-color) relative z-10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
      >
        <div className="bg-(--accent) text-black p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock size={14} />
            <span className="text-xs font-black uppercase tracking-widest">Secure Uplink Portal v4.2</span>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="p-8 flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-2xl">
              {tier.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">{tier.title}</h2>
              <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest">Support the Network</p>
            </div>
            <div className="text-2xl font-black text-(--accent)">${tier.price}</div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                {!paymentMethod ? (
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Select Infrastructure</label>
                    <div className="grid grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className="flex items-center gap-3 p-4 bg-black/40 border border-white/10 hover:border-(--accent) transition-all group"
                        >
                          <div className="text-(--accent) group-hover:scale-110 transition-transform">{m.icon}</div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <button 
                      onClick={() => setPaymentMethod(null)}
                      className="text-[9px] font-black uppercase text-(--accent) hover:underline w-fit"
                    >
                      &larr; Change Payment Method
                    </button>

                    <div className="bg-black/40 border border-white/5 p-5 flex flex-col gap-5">
                      {paymentMethod === 'card' && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase text-gray-500">Identity on Card</label>
                            <input className="bg-black border border-white/10 p-3 text-sm font-mono outline-none focus:border-(--accent) w-full" placeholder="OPERATOR NAME" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase text-gray-500">Encrypted Card Number</label>
                            <div className="relative">
                               <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                               <input className="bg-black border border-white/10 p-3 pl-10 text-sm font-mono outline-none focus:border-(--accent) w-full" placeholder="**** **** **** 4242" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input className="bg-black border border-white/10 p-3 text-sm font-mono focus:border-(--accent)" placeholder="MM / YY" />
                            <input className="bg-black border border-white/10 p-3 text-sm font-mono focus:border-(--accent)" placeholder="CVC" />
                          </div>
                        </>
                      )}

                      {paymentMethod === 'paypal' && (
                        <div className="py-6 flex flex-col items-center gap-6 text-center">
                          <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-10" />
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest px-4">
                            You will be redirected to PayPal's secure node to finalize the transaction.
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'crypto' && (
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-black uppercase text-gray-500">Asset Type</label>
                             <select className="bg-black border border-white/10 p-3 text-xs font-black uppercase outline-none focus:border-orange-500">
                               <option>Bitcoin (BTC)</option>
                               <option>Ethereum (ETH)</option>
                               <option>Litecoin (LTC)</option>
                             </select>
                          </div>
                          <div className="p-4 bg-orange-500/5 border border-orange-500/20 text-center flex flex-col gap-2">
                             <span className="text-[9px] font-black uppercase text-orange-500">System Wallet Hash</span>
                             <span className="text-[10px] font-mono select-all text-white break-all">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</span>
                             <span className="text-[8px] font-bold text-gray-500 uppercase mt-2">Send precisely ${tier.price} USD worth of asset</span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'wallet' && (
                        <div className="flex flex-col gap-4">
                           <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-black uppercase text-gray-500">Provider Service</label>
                             <div className="grid grid-cols-2 gap-2">
                               {['Skrill', 'Neteller', 'WebMoney', 'Paysafe'].map(w => (
                                 <button key={w} className="p-3 border border-white/10 text-[10px] font-black uppercase hover:bg-white/5 transition-all">{w}</button>
                               ))}
                             </div>
                           </div>
                           <input className="bg-black border border-white/10 p-3 text-sm outline-none focus:border-emerald-500" placeholder="Wallet Email / Account ID" />
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handlePay}
                      disabled={isProcessing}
                      className="w-full bg-(--accent) text-black py-4 font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-50"
                    >
                      <motion.div 
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        animate={isProcessing ? { x: "100%" } : { x: "-100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                      {isProcessing ? (
                        <div className="flex flex-col gap-4 py-8">
                           <div className="flex items-center justify-center gap-3">
                             <Loader2 className="animate-spin text-(--accent)" size={24} />
                             <span className="text-sm font-black uppercase italic tracking-widest text-white">Execution in Progress</span>
                           </div>
                           <div className="bg-black/60 border border-white/5 p-4 rounded-sm font-mono text-[9px] text-gray-500 overflow-hidden h-24">
                              {terminalLog.map((log, i) => (
                                <motion.div 
                                  key={i} 
                                  initial={{ opacity: 0, x: -5 }} 
                                  animate={{ opacity: 1, x: 0 }}
                                  className="mb-1"
                                >
                                  {`[${new Date().toLocaleTimeString()}] ${log}`}
                                </motion.div>
                              ))}
                           </div>
                        </div>
                      ) : (
                        <>
                          Authorize Transaction <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 text-center py-8"
              >
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-emerald-400">Transaction Approved</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Rank details have been synchronized with your game ID: SN-142</p>
                </div>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-black/60 p-4 flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
          <span>Stripe Verfied</span>
          <div className="w-1 h-1 bg-gray-700 rounded-full" />
          <span>PCI DSS Compliant</span>
          <div className="w-1 h-1 bg-gray-700 rounded-full" />
          <span>SSL Encryption</span>
        </div>
      </motion.div>
    </div>
  );
}

function DonationTier({ title, price, icon, features, featured, onSelect }: any) {
  return (
    <div className={clsx(
      "portal-card flex flex-col transition-all hover:-translate-y-2 duration-500 overflow-hidden group",
      featured ? "border-(--accent) shadow-[0_0_40px_rgba(56,189,248,0.15)] ring-1 ring-(--accent)/30" : "border-white/5"
    )}>
      {featured && <div className="bg-(--accent) text-black text-[10px] font-black uppercase text-center py-1 tracking-[0.3em] font-display">Most Calibrated Tier</div>}
      <div className="p-10 flex flex-col items-center gap-6 text-center border-b border-white/5 relative bg-gradient-to-b from-black/40 to-transparent">
        <div className="absolute inset-0 bg-(--accent)/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-16 h-16 bg-black/40 border-2 border-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-(--accent)/10 group-hover:border-(--accent)/30 transition-all group-hover:scale-110 shadow-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-white font-display italic group-hover:text-(--accent) transition-colors">{title}</h3>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="text-sm font-black text-gray-600 font-mono">$</span>
            <span className="text-5xl font-black text-white font-display tracking-tight leading-none">{price}</span>
            <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">/mo</span>
          </div>
        </div>
      </div>
      <div className="p-8 flex-1 bg-black/20 backdrop-blur-sm">
        <ul className="flex flex-col gap-4">
          {features.map((f: string) => (
            <li key={f} className="text-[11px] font-black uppercase tracking-[0.1em] text-gray-400 flex items-center gap-3 group/item">
              <div className="w-1.5 h-1.5 bg-(--accent) rounded-full shadow-[0_0_10px_var(--glow)] group-hover/item:scale-150 transition-transform" /> 
              <span className="group-hover/item:text-white transition-colors">{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-8 bg-black/40 border-t border-white/5">
        <button 
          onClick={onSelect}
          className={clsx(
            "w-full py-4 font-black uppercase text-xs tracking-[0.3em] transition-all transform active:scale-95 shadow-xl font-display",
            featured ? "bg-(--accent) text-black hover:bg-white neon-shadow" : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
          )}
        >
          Get Access
        </button>
      </div>
    </div>
  );
}
