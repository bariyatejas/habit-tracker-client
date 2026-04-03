import { Trophy, Zap, Hourglass, Check, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export const Dashboard = ({ habits, theme, onToggle }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  // Get all habits NOT done today
  const pendingTasks = habits.filter(h => !h.completedDates.includes(todayStr));
  
  const nextTask = pendingTasks[0];      // The immediate next task
  const followingTask = pendingTasks[1]; // The one after that

  const isAllDone = habits.length > 0 && pendingTasks.length === 0;

  const dailyTotalMins = habits.reduce((acc, h) => acc + (parseInt(h.duration) || 0), 0);
  const weeklyTotalMins = dailyTotalMins * 7;
  const monthlyTotalMins = dailyTotalMins * 30;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      
      {/* Next Task Card */}
      <div className={`p-5 rounded-2xl ${theme.card} lg:col-span-2 relative overflow-hidden flex flex-col justify-between`}>
         {isAllDone ? (
           <div className="flex flex-col items-center justify-center text-center h-full py-6">
              <div className="p-3 bg-yellow-100 rounded-full mb-3 animate-bounce">
                <Trophy size={32} className="text-yellow-500 fill-yellow-500" />
              </div>
              <h3 className={`text-2xl font-black ${theme.text}`}>All Tasks Completed!</h3>
              <p className={`text-slate-500 font-medium mt-1`}>You crushed it today. Enjoy your free time.</p>
           </div>
         ) : (
           <>
             {/* Header */}
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded-lg"><Zap size={16} className="text-red-500" /></div>
                  <span className={`text-xs font-black uppercase tracking-widest text-slate-500`}>Up Next</span>
               </div>
               <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                 {pendingTasks.length} Remaining
               </span>
             </div>

             {/* Main Focus Task */}
             <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`text-3xl md:text-4xl font-serif font-black ${theme.text} mb-2 leading-tight`}>{nextTask?.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200`}>
                      {nextTask?.duration} mins
                    </span>
                    <span className="text-xs text-slate-400 font-medium animate-pulse">Push through!</span>
                  </div>
                </div>
                
                {/* Complete Button */}
                <button 
                  onClick={() => onToggle(nextTask._id, todayStr)}
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all ${theme.solidBtn}`}
                  title="Complete Task"
                >
                  <Check size={28} strokeWidth={3} />
                </button>
             </div>

             {/* Up Next Preview */}
             {followingTask && (
               <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex items-center gap-2 text-slate-400">
                 <ArrowRight size={14} />
                 <span className="text-xs font-bold uppercase tracking-wide">After that:</span>
                 <span className={`text-xs font-bold ${theme.text}`}>{followingTask.name}</span>
                 <span className="text-[10px] bg-slate-50 px-1 rounded border border-slate-100">{followingTask.duration}m</span>
               </div>
             )}
           </>
         )}
      </div>

      {/* Time Forecast Card */}
      <div className={`p-5 rounded-2xl ${theme.card} flex flex-col justify-between`}>
         <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-100 rounded-lg"><Hourglass size={16} className="text-blue-500" /></div>
            <span className={`text-xs font-black uppercase tracking-widest text-slate-500`}>Time Forecast</span>
         </div>
         <div className="space-y-3">
            {[
              { label: 'Today', val: dailyTotalMins },
              { label: 'This Week', val: weeklyTotalMins },
              { label: 'This Month', val: monthlyTotalMins },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0">
                 <span className={`text-xs font-bold text-slate-500`}>{item.label}</span>
                 <span className={`text-sm font-black ${theme.text}`}>{formatDuration(item.val)}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};