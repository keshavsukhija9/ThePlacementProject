"use client";

import { Check, Clock } from "lucide-react";
import { useState } from "react";

type ScheduleItem = {
  day_index: number;
  time_slot: string;
  topic: string;
  difficulty: string;
  resource_url: string;
  status: string;
};

export default function Dashboard({ schedule }: { schedule: { items: ScheduleItem[] } }) {
  const [items, setItems] = useState(schedule.items || []);

  const toggleStatus = async (idx: number, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    
    const newItems = [...items];
    newItems[idx].status = newStatus;
    setItems(newItems);
    
    try {
      await fetch("http://localhost:8000/api/v1/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: "mock-id", status: newStatus })
      });
    } catch (e) {
       console.error("Failed to update progress", e);
    }
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-0 my-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-h1 mb-2">Weekly Plan</h1>
          <p className="text-body text-secondary">Your deterministic placement track</p>
        </div>
        <div className="flex gap-4">
          <div className="card px-4 py-2 text-center">
            <div className="text-small text-secondary uppercase tracking-wider">Streak</div>
            <div className="text-h2 text-warning flex items-center gap-1 justify-center">🔥 5</div>
          </div>
          <div className="card px-4 py-2 text-center border-accent">
            <div className="text-small text-secondary uppercase tracking-wider">Readiness</div>
            <div className="text-h2 text-accent">68%</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day, dIdx) => {
          const dayItems = items.filter(it => it.day_index === dIdx);
          
          return (
            <div key={day} className="flex flex-col gap-3 min-w-[140px]">
              <div className="text-body font-medium mb-1">{day}</div>
              
              {dayItems.length === 0 ? (
                <div className="text-small text-secondary italic">Rest Day</div>
              ) : (
                dayItems.map((item, iIdx) => {
                  const globalIdx = items.indexOf(item);
                  const isDone = item.status === "completed";
                  return (
                    <div key={iIdx} className={`card p-3 flex flex-col gap-2 transition-all ${isDone ? 'opacity-60 border-success/30 bg-success/5' : ''}`}>
                      <div className="text-[11px] text-secondary flex items-center justify-between">
                        <span>{item.time_slot}</span>
                        <span className={`px-1.5 rounded text-[10px] uppercase border ${item.difficulty === 'hard' ? 'border-error text-error' : item.difficulty === 'medium' ? 'border-warning text-warning' : 'border-success text-success'}`}>
                            {item.difficulty}
                        </span>
                      </div>
                      <div className="text-small font-medium">{item.topic}</div>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                        <button 
                          type="button"
                          onClick={() => toggleStatus(globalIdx, item.status)}
                          className={`p-1.5 rounded-full transition-colors ${isDone ? 'bg-success text-white' : 'bg-surface border border-border text-secondary hover:text-primary hover:border-primary'}`}
                        >
                          {isDone ? <Check size={14} /> : <Clock size={14} />}
                        </button>
                        <a href={item.resource_url} target="_blank" rel="noreferrer" className="text-[12px] text-accent hover:underline">
                          Resource &rarr;
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      {/* Pro Banner */}
      <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-accent/20 to-surface border border-accent/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-h2 font-medium mb-1 flex items-center gap-2">Upgrade to Pro 🚀</h3>
          <p className="text-body text-secondary">Unlock WhatsApp reminders, readiness scoring, and rescue mode.</p>
        </div>
        <button 
          onClick={() => alert("Mock Redirecting to Razorpay UPI Intent... Payment Webhook will process the capture.")}
          className="btn whitespace-nowrap"
        >
          Go Pro - ₹29/mo via UPI
        </button>
      </div>
    </div>
  );
}
