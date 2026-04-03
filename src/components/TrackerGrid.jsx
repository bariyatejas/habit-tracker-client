import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameDay, isBefore, startOfDay, parseISO, eachDayOfInterval, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Trash2, Check, Flame } from 'lucide-react';

export const TrackerGrid = ({ habits, toggleHabit, deleteHabit, addHabit, theme, input, setInput, durationInput, setDurationInput, userCreatedAt }) => {
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 1. DATE GENERATION
  const columns = useMemo(() => {
    const signupDate = userCreatedAt ? startOfDay(parseISO(userCreatedAt)) : new Date(2020, 0, 1);
    let dates = [];
    if (viewMode === 'week') dates = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    else if (viewMode === 'month') dates = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
    else if (viewMode === 'year') dates = eachDayOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) });
    return dates.filter(date => !isBefore(date, signupDate));
  }, [viewMode, currentDate, userCreatedAt]);

  // 2. HEATMAP CALCULATIONS
  const dailyScores = useMemo(() => {
    if (viewMode !== 'year') return {};
    const scores = {};
    let maxScore = 0;

    columns.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let dailyMins = 0;
      let tasksDone = 0;
      habits.forEach(h => {
        if (h.completedDates.includes(dateStr)) {
          tasksDone++;
          dailyMins += parseInt(h.duration || 0);
        }
      });
      // Score Formula: (Tasks * 20) + Minutes
      // Giving tasks slightly higher weight to encourage checking boxes
      const score = (tasksDone * 20) + dailyMins;
      scores[dateStr] = { score, tasks: tasksDone, mins: dailyMins };
      if (score > maxScore) maxScore = score;
    });
    // Set a baseline maxScore to prevent 1 minute of work looking "Black" if it's the only data
    return { scores, maxScore: Math.max(maxScore, 60) }; 
  }, [habits, columns, viewMode]);

  // 3. SPECTRUM COLOR ENGINE
  const getSpectrumColor = (dateStr) => {
    const data = dailyScores.scores[dateStr];
    if (!data || data.score === 0) return '#f1f5f9'; // Slate-100 (Empty)

    const intensity = data.score / (dailyScores.maxScore || 1); // 0 to 1

    // Color Logic: White -> Blue -> Green -> Red -> Black
    // We divide the 0-1 range into 4 segments of 0.25 each.
    
    // Segment 1: Low (0 - 0.25) -> White to Blue
    if (intensity <= 0.25) {
      // White (255,255,255) -> Blue (59, 130, 246)
      const t = intensity / 0.25; 
      return `rgb(${255 - (196 * t)}, ${255 - (125 * t)}, 255)`; 
    }
    // Segment 2: Medium-Low (0.25 - 0.5) -> Blue to Green
    else if (intensity <= 0.5) {
      // Blue (59, 130, 246) -> Green (34, 197, 94)
      const t = (intensity - 0.25) / 0.25;
      return `rgb(${59 - (25 * t)}, ${130 + (67 * t)}, ${246 - (152 * t)})`;
    }
    // Segment 3: Medium-High (0.5 - 0.75) -> Green to Red
    else if (intensity <= 0.75) {
      // Green (34, 197, 94) -> Red (239, 68, 68)
      const t = (intensity - 0.5) / 0.25;
      return `rgb(${34 + (205 * t)}, ${197 - (129 * t)}, ${94 - (26 * t)})`;
    }
    // Segment 4: High (0.75 - 1.0) -> Red to Black
    else {
      // Red (239, 68, 68) -> Black (0, 0, 0)
      const t = (intensity - 0.75) / 0.25;
      return `rgb(${239 - (239 * t)}, ${68 - (68 * t)}, ${68 - (68 * t)})`;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Controls */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl ${theme.sidebar} border ${theme.gridBorder}`}>
        <div className="flex gap-1 p-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {['week', 'month', 'year'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === m ? theme.activeTab : 'text-slate-600 hover:bg-black/5'}`}>{m}</button>
          ))}
        </div>
        {viewMode === 'month' && (
           <div className={`flex items-center gap-2 md:gap-3 px-4 py-2 rounded-xl bg-white border ${theme.gridBorder} text-xs md:text-sm font-bold shadow-sm w-full sm:w-auto justify-between`}>
             <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="hover:scale-110 text-slate-700"><ChevronLeft size={16}/></button>
             <span className="min-w-[100px] text-center text-slate-800">{format(currentDate, 'MMMM yyyy')}</span>
             <button onClick={() => setCurrentDate(subMonths(currentDate, -1))} className="hover:scale-110 text-slate-700"><ChevronRight size={16}/></button>
           </div>
        )}
      </div>

      <div className={`rounded-2xl overflow-hidden border ${theme.gridBorder} shadow-lg bg-white`}>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header */}
            <div className={`flex border-b ${theme.gridBorder} bg-[#fafafa]`}>
              <div className={`sticky left-0 z-20 w-40 md:w-80 p-3 md:p-5 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 bg-[#fafafa] border-r ${theme.gridBorder}`}>Habit Routine</div>
              {viewMode !== 'year' ? (
                columns.map(date => (
                  <div key={date.toString()} className={`min-w-[50px] md:min-w-[70px] py-3 md:py-4 text-center border-r ${theme.gridBorder} ${isSameDay(date, new Date()) ? theme.accent : ''}`}>
                    <div className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 mb-1">{format(date, 'EEE')}</div>
                    <div className={`text-sm md:text-base font-serif font-bold ${isSameDay(date, new Date()) ? theme.text : 'text-slate-400'}`}>{format(date, 'd')}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 flex items-center gap-6 w-full">
                   <div className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2"><Flame size={14} className="text-orange-500"/> Intensity Map</div>
                   <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      <span>Low</span>
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-black"></div>
                      <span>Max</span>
                   </div>
                </div>
              )}
            </div>

            {/* GLOBAL HEATMAP ROW (Year Mode) */}
            {viewMode === 'year' && (
              <div className={`flex items-start border-b ${theme.gridBorder} bg-slate-50/30`}>
                <div className={`sticky left-0 z-10 w-40 md:w-80 p-4 border-r ${theme.gridBorder} bg-white/95 backdrop-blur flex flex-col justify-center`}>
                   <div className={`font-serif text-sm font-bold ${theme.text}`}>Total Daily Output</div>
                   <div className="text-[10px] text-slate-400 mt-0.5">Tasks + Duration</div>
                </div>
                <div className="flex flex-wrap gap-[2px] p-4 max-w-5xl">
                   {columns.map(date => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const stats = dailyScores.scores[dateStr] || { tasks: 0, mins: 0, score: 0 };
                      return (
                        <div 
                          key={dateStr}
                          className="w-3.5 h-3.5 rounded-[1px] transition-all hover:scale-150 hover:z-10 hover:shadow-lg border border-white/10"
                          style={{ backgroundColor: getSpectrumColor(dateStr) }}
                          title={`${format(date, 'MMM d')}: ${stats.tasks} tasks, ${stats.mins}m (Score: ${stats.score})`}
                        />
                      )
                   })}
                </div>
              </div>
            )}

            {/* Habit Rows */}
            {habits.map(habit => (
              <div key={habit._id || habit.id} className={`flex items-stretch border-b ${theme.gridBorder} group hover:bg-slate-50`}>
                <div className={`sticky left-0 z-10 w-40 md:w-80 p-3 md:p-5 flex items-center justify-between border-r ${theme.gridBorder} bg-white group-hover:bg-slate-50`}>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`font-serif text-sm md:text-lg font-bold ${theme.text} truncate`}>{habit.name}</span>
                    <span className={`text-[9px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mt-1`}>
                      <Clock size={10} /> {habit.duration}m
                    </span>
                  </div>
                  <button onClick={() => deleteHabit(habit._id)} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                </div>

                {viewMode === 'year' ? (
                  <div className="flex flex-wrap gap-[2px] p-4 max-w-5xl items-center">
                    {columns.map(date => {
                       const isDone = habit.completedDates.includes(format(date, 'yyyy-MM-dd'));
                       // Individual dots just show binary status (Done/Not Done) to keep it clean
                       return <div key={date.toString()} className={`w-3.5 h-3.5 rounded-full ${isDone ? '' : 'bg-slate-100'}`} style={{backgroundColor: isDone ? theme.secondary : undefined}} title={format(date, 'MMM d')} />
                    })}
                  </div>
                ) : (
                  columns.map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isDone = habit.completedDates.includes(dateStr);
                    const isToday = isSameDay(date, new Date());
                    const isClickable = isToday; 

                    return (
                      <div key={dateStr} className={`min-w-[50px] md:min-w-[70px] flex items-center justify-center border-r ${theme.gridBorder} ${isToday ? theme.accent : ''}`}>
                         <button 
                            onClick={() => isClickable && toggleHabit(habit._id, dateStr)} 
                            disabled={!isClickable}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ease-out 
                              ${isDone 
                                ? 'scale-100 rotate-0 shadow-sm' // Done state
                                : isClickable 
                                  ? 'scale-90 hover:scale-110 hover:rotate-3 bg-white border-2 border-slate-200 hover:border-slate-400 cursor-pointer' // Hover state
                                  : 'scale-75 opacity-20 cursor-default' // Disabled state
                              }
                            `} 
                            style={{
                              backgroundColor: isDone ? theme.primary : undefined, 
                              borderColor: !isDone && isClickable ? undefined : 'transparent',
                            }}
                          >
                            {/* Add a subtle animation to the check icon */}
                            {isDone && <Check size={16} className="text-white animate-in zoom-in duration-300" strokeWidth={4} />}
                          </button>
                      </div>
                    )
                  })
                )}
              </div>
            ))}

            <form onSubmit={addHabit} className={`flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-5 sticky left-0 z-10 max-w-2xl bg-white/95 backdrop-blur-md border-r border-b rounded-br-2xl ${theme.gridBorder}`}>
               <div className={`flex-1 flex items-center gap-2 border-2 ${theme.gridBorder} bg-white rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-slate-200`}>
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="New routine..." className={`bg-transparent outline-none w-full ${theme.text} placeholder:text-slate-400 font-serif text-sm md:text-lg font-medium`} />
               </div>
               <div className="flex gap-2">
                 <div className={`flex items-center gap-2 w-full md:w-28 border-2 ${theme.gridBorder} bg-white rounded-xl px-3 py-2`}>
                    <input type="number" min="1" value={durationInput} onChange={e => setDurationInput(e.target.value)} className={`bg-transparent outline-none w-full ${theme.text} text-right font-bold`} />
                    <span className="text-xs font-bold uppercase text-slate-400">min</span>
                 </div>
                 <button type="submit" className={`flex-1 md:flex-none px-6 md:px-8 py-2.5 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all ${theme.solidBtn}`}>Add</button>
               </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};