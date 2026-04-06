"use client";

import { useState } from "react";

type ScheduleItem = {
  id?: string;
  day_index: number;
  time_slot: string;
  topic: string;
  difficulty: string;
  resource_url: string;
  status: string;
};

export default function Dashboard({ schedule }: { schedule: { items: ScheduleItem[] } }) {
  const [items, setItems] = useState(schedule.items || []);

  const toggleStatus = async (item: ScheduleItem, idx: number) => {
    const newStatus = item.status === "completed" ? "pending" : "completed";
    
    const newItems = [...items];
    newItems[idx].status = newStatus;
    setItems(newItems);
    
    try {
      await fetch("http://localhost:8000/api/v1/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.id || "mock-id", status: newStatus })
      });
    } catch (e) {
       console.error("Failed to update progress", e);
    }
  };

  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const getStatusIcon = (status: string) => {
    if (status === "completed") {
      return <span className="material-symbols-outlined text-emerald-500" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>;
    }
    if (status === "skipped") {
      return <span className="material-symbols-outlined text-error">cancel</span>;
    }
    return <span className="material-symbols-outlined text-amber-500 animate-pulse">schedule</span>;
  };

  const completedCount = items.filter((i) => i.status === "completed").length;
  const totalCount = items.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-center items-center h-16 px-6 max-w-[1100px] left-1/2 -translate-x-1/2 bg-[#0e0e13] border-b border-[#35343a]">
        <div className="flex items-center justify-between w-full">
          <div className="text-xl font-medium tracking-tighter text-[#f97316]">Precision Editorial</div>
          <nav className="hidden md:flex items-center gap-8 font-['Inter'] font-medium tracking-tight text-sm">
            <a className="text-[#f97316] border-b-2 border-[#f97316] pb-1 shadow-[0_4px_12px_rgba(249,115,22,0.3)] transition-all duration-200" href="#">Dashboard</a>
            <a className="text-slate-400 hover:text-slate-200 hover:text-[#c0c1ff] transition-all duration-200" href="#">Schedule</a>
            <a className="text-slate-400 hover:text-slate-200 hover:text-[#c0c1ff] transition-all duration-200" href="#">Progress</a>
            <a className="text-slate-400 hover:text-slate-200 hover:text-[#c0c1ff] transition-all duration-200" href="#">Settings</a>
          </nav>
          <button className="bg-[#f97316] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#ea580c] transition-all duration-200 active:scale-95">
            Upgrade to Pro
          </button>
        </div>
      </header>
      
      <main className="pt-24 pb-20 px-6 max-w-[1100px] mx-auto min-h-screen">
        <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-medium tracking-tighter text-on-surface mb-2">Welcome back, Rohit</h1>
            <p className="text-on-surface-variant text-sm font-label tracking-wide uppercase">Mapping your placement week</p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container px-4 py-2 rounded-xl ghost-border">
            <span className="text-xl">🔥</span>
            <span className="text-lg font-bold tracking-tight">7 days</span>
            <span className="text-xs text-on-surface-variant font-label">STREAK</span>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-12">
          {dayNames.map((dayName, dIdx) => {
            const dayItems = items.filter(it => it.day_index === dIdx);
            const isRestDay = dIdx === 6 || dayItems.length === 0;

            if (isRestDay) {
              return (
                <div key={dayName} className="flex flex-col gap-4">
                  <div className={`text-xs font-bold tracking-widest uppercase mb-2 ${dIdx === 6 ? 'text-primary' : 'text-on-surface-variant'}`}>{dayName}</div>
                  <div className="bg-orange-500/10 p-4 rounded-xl ghost-border flex flex-col items-center justify-center gap-2 min-h-[200px] border-dashed border-orange-500/30">
                    <span className="material-symbols-outlined text-orange-500" style={{fontVariationSettings: "'FILL' 1"}}>weekend</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Rest Day</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={dayName} className="flex flex-col gap-4">
                <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">{dayName}</div>
                {dayItems.map((item) => {
                  const globalIdx = items.indexOf(item);
                  return (
                    <div 
                      key={item.id || globalIdx} 
                      className={`p-4 rounded-xl ghost-border flex flex-col gap-4 min-h-[200px] transition-colors group cursor-pointer select-none ${item.status === 'completed' ? 'bg-surface-container-highest' : 'bg-surface-container hover:bg-surface-container-high'}`}
                      onClick={() => toggleStatus(item, globalIdx)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-on-surface-variant break-words max-w-[70%]">{item.time_slot}</span>
                        {getStatusIcon(item.status)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold leading-tight mb-1">{item.topic}</h3>
                        <p className="text-xs text-on-surface-variant capitalize">{item.difficulty} Level</p>
                      </div>
                      <a className="mt-auto text-[10px] uppercase tracking-wider text-primary font-bold group-hover:underline" href={item.resource_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        Open Resource
                      </a>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 bg-surface-container p-8 rounded-xl ghost-border relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h2 className="text-2xl font-medium tracking-tight mb-4">Placement Insights: Q3 2024</h2>
                <p className="text-on-surface-variant max-w-md text-sm leading-relaxed mb-6">
                  Editorial: Top tier firms are pivoting towards observability and infrastructure resilience questions. Update your prep list.
                </p>
              </div>
              <div className="flex gap-4">
                <button className="bg-secondary text-on-secondary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary transition-all duration-200">Read Editorial</button>
                <button className="border border-outline-variant text-on-surface px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-surface-bright transition-all duration-200">Archive</button>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 group-hover:opacity-30 transition-opacity">
              <img className="w-full h-full object-cover grayscale" alt="abstract visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6J4c02iPSZ4dczeQn6gJyLhOuXyym5HqIVIeBaFYTE7kU0T5utAUNqiCipVPy6BjHQEkhizhfkSChwr_b2a-o1RrwtYVDza25Ri8Kccu9zl0QKNwAIp3I1N6fzebPfnAtVwRrtgwtRv8XsfhzZ8b8I0RXUdE44ZHFw5HKeQn6Mqw-EAT9QOS_c1fLVUD3npGKFTlhMa5sweCjNNuSJj8E9xNRqD0lAoGQHKm8q0htH3DI4YVjWtfi-CCvALhnpnrAQyI43F1UD-Mc"/>
            </div>
          </div>
          
          <div className="bg-surface-container-high p-8 rounded-xl ghost-border flex flex-col justify-center text-center">
             <h4 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-6">Weekly Progress</h4>
             <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path className="text-surface-container-lowest stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
                  <path className="text-primary stroke-current transition-all duration-1000 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${progressPercent}, 100`} strokeLinecap="round" strokeWidth="3"></path>
                  <text className="fill-current text-[8px] font-bold text-center" textAnchor="middle" x="18" y="20.35">{progressPercent}%</text>
                </svg>
             </div>
             <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Target: 40 hrs</p>
          </div>
        </div>

        <div className="w-full bg-[#f97316] p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative active:scale-[0.98] transition-transform duration-200">
           <div className="relative z-10 text-white">
              <h3 className="text-lg font-bold tracking-tight">Upgrade to Pro — ₹29/mo via UPI</h3>
              <p className="text-white/80 text-xs">Unlock detailed placement roadmaps and mock interview analysis.</p>
           </div>
           <button 
              onClick={() => alert("Redirecting to Razorpay...")}
              className="relative z-10 bg-white text-[#f97316] px-6 py-3 rounded-xl text-sm font-extrabold uppercase tracking-widest shadow-xl"
            >
              Get Started
           </button>
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </main>

      <footer className="w-full py-8 flex flex-col items-center gap-4 max-w-[1100px] mx-auto bg-[#0e0e13] border-t border-[#35343a]">
        <div className="flex gap-8">
           <a className="text-slate-500 font-['Inter'] text-xs uppercase tracking-widest hover:text-white transition-colors" href="#">Terms</a>
           <a className="text-slate-500 font-['Inter'] text-xs uppercase tracking-widest hover:text-white transition-colors" href="#">Privacy</a>
           <a className="text-slate-500 font-['Inter'] text-xs uppercase tracking-widest hover:text-white transition-colors" href="#">Support</a>
        </div>
        <div className="text-[#f97316] font-['Inter'] text-xs uppercase tracking-widest opacity-50">
            © 2024 Precision Editorial
        </div>
      </footer>
    </>
  );
}
