import { useState, useMemo } from 'react';
import { format, subDays, subMonths, subYears, eachDayOfInterval } from 'date-fns';
import { AreaChart, Area, BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Clock, Trophy } from 'lucide-react';

export const AnalyticsView = ({ habits, theme }) => {
  const [range, setRange] = useState('1M');

  // 1. Date Logic
  const dateInterval = useMemo(() => {
    const end = new Date();
    let start = subDays(end, 7);
    if (range === '1M') start = subDays(end, 30);
    if (range === '3M') start = subMonths(end, 3);
    if (range === '1Y') start = subYears(end, 1);
    return eachDayOfInterval({ start, end });
  }, [range]);

  // 2. Data Transformation
  const data = useMemo(() => {
    return dateInterval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let dailyMinutes = 0;
      let completedCount = 0;
      habits.forEach(h => {
        if (h.completedDates.includes(dateStr)) {
          completedCount++;
          dailyMinutes += parseInt(h.duration || 20);
        }
      });
      const totalHabits = habits.length || 1;
      return {
        date: format(date, range === '1W' ? 'EEE' : 'MMM d'),
        fullDate: dateStr,
        minutes: dailyMinutes,
        consistency: Math.round((completedCount / totalHabits) * 100),
      };
    });
  }, [dateInterval, habits, range]);

  // 3. Comparison Logic (This Week vs Last Week)
  const comparisonData = useMemo(() => {
    const currentWeekStart = subDays(new Date(), 6);
    const currentWeekDays = eachDayOfInterval({ start: currentWeekStart, end: new Date() });
    return currentWeekDays.map((day) => {
      const prevDay = subDays(day, 7);
      const currDateStr = format(day, 'yyyy-MM-dd');
      const prevDateStr = format(prevDay, 'yyyy-MM-dd');
      let currMins = 0;
      let prevMins = 0;
      habits.forEach(h => { 
        if(h.completedDates.includes(currDateStr)) currMins += parseInt(h.duration || 20);
        if(h.completedDates.includes(prevDateStr)) prevMins += parseInt(h.duration || 20);
      });
      return { name: format(day, 'EEE'), "Current": currMins, "Previous": prevMins };
    });
  }, [habits]);

  // 4. Summary Stats
  const totalMinutes = data.reduce((acc, curr) => acc + curr.minutes, 0);
  const avgConsistency = Math.round(data.reduce((acc, curr) => acc + curr.consistency, 0) / (data.length || 1));
  const peakDay = Math.max(...data.map(d => d.minutes));

  // 5. Custom Tooltip (Readable)
  const CleanTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-sm z-50">
          <p className="font-bold mb-2 text-slate-800">{label}</p>
          {payload.map((e, i) => (
             <div key={i} style={{color: e.color}} className="flex items-center gap-2 font-medium">
               <span className="capitalize">{e.name}:</span> <span className="font-bold">{e.value}</span>
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* Range Tabs (Scrollable on mobile) */}
      <div className="flex justify-end overflow-x-auto no-scrollbar">
        <div className={`flex p-1 rounded-xl ${theme.sidebar} border ${theme.gridBorder}`}>
          {['1W', '1M', '3M', '1Y'].map(r => (
            <button key={r} onClick={() => setRange(r)} className={`px-4 md:px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r ? theme.activeTab : 'opacity-60 hover:opacity-100'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards (Stack on mobile, Grid on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { title: "Consistency", value: `${avgConsistency}%`, icon: Target, desc: "Avg completion rate" },
          { title: "Time Invested", value: `${(totalMinutes/60).toFixed(1)}h`, icon: Clock, desc: "Total focus time" },
          { title: "Peak Day", value: `${peakDay}m`, icon: Trophy, desc: "Best daily effort" }
        ].map((card, i) => (
          <div key={i} className={`p-5 md:p-6 rounded-2xl ${theme.card} hover:-translate-y-1 transition-transform duration-300`}>
            <div className="flex justify-between items-start">
               <div>
                 <p className={`text-xs font-black uppercase tracking-widest ${theme.subtext} opacity-70`}>{card.title}</p>
                 <h3 className={`text-3xl md:text-4xl font-serif font-bold mt-3 ${theme.text}`}>{card.value}</h3>
                 <p className={`text-xs mt-2 font-bold opacity-60 ${theme.subtext}`}>{card.desc}</p>
               </div>
               <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100`}>
                 <card.icon size={24} style={{color: theme.primary}} />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Comparison */}
        <div className={`p-4 md:p-6 rounded-2xl ${theme.card}`}>
          <h3 className={`font-serif text-lg md:text-xl font-bold mb-6 ${theme.text}`}>Weekly Comparison</h3>
          <div className="h-[250px] md:h-[300px] w-full text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barGap={8}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} stroke="#64748b" />
                <Tooltip content={<CleanTooltip />} cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="Current" fill={theme.primary} radius={[4,4,4,4]} barSize={16} />
                <Bar dataKey="Previous" fill="#cbd5e1" radius={[4,4,4,4]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consistency Trend */}
        <div className={`p-4 md:p-6 rounded-2xl ${theme.card}`}>
          <h3 className={`font-serif text-lg md:text-xl font-bold mb-6 ${theme.text}`}>Consistency Trend</h3>
          <div className="h-[250px] md:h-[300px] w-full text-xs font-bold">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                 <XAxis dataKey="date" axisLine={false} tickLine={false} dy={10} stroke="#64748b" />
                 <Tooltip content={<CleanTooltip />} />
                 <Area type="monotone" dataKey="consistency" stroke={theme.primary} fill={theme.secondary} fillOpacity={0.3} strokeWidth={3} />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};