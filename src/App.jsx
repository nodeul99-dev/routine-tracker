import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, Trash2, Check, Calendar, Sun, Info, ChevronLeft, ChevronRight, 
  LayoutGrid, X, AlertTriangle, Lock, Unlock, RotateCcw, Pencil, 
  Home, Activity, Zap, Quote 
} from 'lucide-react';

// --- [상수 데이터] 색상 팔레트 ---
const COLORS = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-400', 
  'bg-emerald-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-violet-500'
];

// --- [상수 데이터] 동기부여 명언 (30개) ---
const MOTIVATIONAL_QUOTES = [
  { text: "시작이 반이다.", author: "아리스토텔레스" },
  { text: "멈추지 않는 이상 얼마나 천천히 가는지는 문제가 되지 않는다.", author: "공자" },
  { text: "성공은 매일 반복되는 작은 노력들의 합이다.", author: "로버트 콜리어" },
  { text: "미래를 예측하는 최선의 방법은 미래를 창조하는 것이다.", author: "피터 드러커" },
  { text: "할 수 있다고 믿는다면, 이미 반은 성공한 것이다.", author: "시어도어 루스벨트" },
  { text: "실패는 다시 시작할 수 있는 기회다. 이번에는 더 현명하게.", author: "헨리 포드" },
  { text: "행동은 모든 성공의 기본 열쇠다.", author: "파블로 피카소" },
  { text: "꿈을 꿀 수 있다면, 그 꿈을 실현할 수도 있다.", author: "월트 디즈니" },
  { text: "오늘 할 일을 내일로 미루지 마라.", author: "벤자민 프랭클린" },
  { text: "가장 큰 위험은 위험을 감수하지 않는 것이다.", author: "마크 주커버그" },
  { text: "습관은 제2의 천성이다.", author: "키케로" },
  { text: "매일 아침 눈을 뜨면 새로운 기회가 기다리고 있다.", author: "작자 미상" },
  { text: "노력은 배신하지 않는다.", author: "작자 미상" },
  { text: "성공은 최종적인 것이 아니며, 실패는 치명적인 것이 아니다.", author: "윈스턴 처칠" },
  { text: "자신감은 성공의 첫 번째 비결이다.", author: "랄프 왈도 에머슨" },
  { text: "단순함은 궁극의 정교함이다.", author: "레오나르도 다빈치" },
  { text: "나약한 태도는 나약한 성격을 만든다.", author: "알버트 아인슈타인" },
  { text: "고통이 없으면 얻는 것도 없다.", author: "벤자민 프랭클린" },
  { text: "시간은 인간이 쓸 수 있는 가장 값진 것이다.", author: "테오프라스토스" },
  { text: "목표를 높게 잡아라. 그리고 멈추지 마라.", author: "보 잭슨" },
  { text: "당신의 한계는 당신의 상상력뿐이다.", author: "작자 미상" },
  { text: "기회는 일어나는 것이 아니라 만들어내는 것이다.", author: "크리스 그로서" },
  { text: "불가능은 소심한 자들의 환영일 뿐이다.", author: "무하마드 알리" },
  { text: "오늘 걷지 않으면 내일은 뛰어야 한다.", author: "카를레스 푸욜" },
  { text: "천재는 1%의 영감과 99%의 노력으로 이루어진다.", author: "토마스 에디슨" },
  { text: "늦었다고 생각할 때가 가장 빠르다.", author: "작자 미상" },
  { text: "성공의 8할은 일단 출석하는 것이다.", author: "우디 앨런" },
  { text: "나는 생각한다, 고로 존재한다.", author: "데카르트" },
  { text: "이 또한 지나가리라.", author: "솔로몬" },
  { text: "중요한 것은 꺾이지 않는 마음.", author: "작자 미상" }
];

// --- [헬퍼 함수] 날짜 및 데이터 처리 ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getDayOfWeek = (year, month, day) => new Date(year, month, day).getDay();

// 데이터 구조 호환성 처리 (구버전 데이터도 읽을 수 있게)
const getHistoryData = (habit, dateKey) => {
  const data = habit.history[dateKey];
  if (data === undefined) return { completed: false, note: '' };
  if (typeof data === 'boolean') return { completed: data, note: '' };
  return { completed: data.completed || false, note: data.note || '' };
};

// 루틴 통계 계산 로직
const calculateHabitStats = (habit) => {
  const today = new Date();
  const historyKeys = Object.keys(habit.history).filter(k => {
    const entry = habit.history[k];
    return entry === true || (typeof entry === 'object' && entry.completed);
  });

  // 1. 총 누적
  const totalCount = historyKeys.length;
  
  // 2. 이번 달
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthCount = historyKeys.filter(k => k.startsWith(currentMonthStr)).length;

  // 3. 올해
  const currentYearStr = today.getFullYear().toString();
  const yearCount = historyKeys.filter(k => k.startsWith(currentYearStr)).length;

  // 4. 이번 주 (일~토 기준)
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  sunday.setHours(0,0,0,0);
  const thisWeekCount = historyKeys.filter(k => new Date(k) >= sunday).length;

  // 5. 주간 평균 (총 횟수 / 경과 주)
  let weeklyAvg = 0;
  if (historyKeys.length > 0) {
    const sortedDates = historyKeys.map(k => new Date(k)).sort((a, b) => a - b);
    const diffTime = Math.abs(today - sortedDates[0]);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const weeksPassed = Math.max(1, diffDays / 7);
    weeklyAvg = (totalCount / weeksPassed).toFixed(1);
  }

  // 6. 최근 7일 페이스 (그래프용)
  const weeklyPace = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i)); 
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const entry = habit.history[dateKey];
    return entry === true || (typeof entry === 'object' && entry.completed);
  });

  return { totalCount, monthCount, yearCount, thisWeekCount, weeklyAvg, weeklyPace };
};

// --- [서브 컴포넌트] 연간 뷰 미니 달력 (렌더링 최적화) ---
const MiniMonthGrid = React.memo(({ habit, year, month, toggleDot, openNoteModal, isLocked }) => {
  const daysInThisMonth = getDaysInMonth(year, month);
  const startDayOfWeek = getDayOfWeek(year, month, 1);
  
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-gray-400 font-medium mb-1 pl-1">{month + 1}월</span>
      <div className="grid grid-cols-7 gap-[2px]">
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInThisMonth }).map((_, i) => {
          const day = i + 1;
          const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const data = getHistoryData(habit, dateKey);
          return (
            <div
              key={day}
              onClick={() => toggleDot(habit.id, year, month, day)}
              onContextMenu={(e) => openNoteModal(e, habit, year, month, day)}
              className={`
                relative aspect-square rounded-full flex items-center justify-center transition-colors duration-150
                ${data.completed ? habit.color : 'bg-gray-100 hover:bg-gray-200'}
                ${isLocked ? 'cursor-default opacity-90' : 'cursor-pointer'}
              `}
              title={`${month+1}월 ${day}일`}
            >
              {data.note && (
                <div className="absolute w-1 h-1 rounded-full bottom-0.5 right-0.5 bg-black" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ==========================================
// [메인 컴포넌트] DailyRoutineTracker
// ==========================================
const DailyRoutineTracker = () => {
  // --- State 정의 ---
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  
  const [isLocked, setIsLocked] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const [activeNote, setActiveNote] = useState(null); 
  const [noteInput, setNoteInput] = useState('');
  const [habitToDelete, setHabitToDelete] = useState(null); 

  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  // --- 명언 로직: 오늘 날짜를 시드값으로 사용하여 하루동안 고정 ---
  const dailyQuote = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[index];
  }, []);

  // --- 초기화 및 데이터 저장 ---
  useEffect(() => {
    const savedHabits = localStorage.getItem('myDailyHabits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      // 샘플 데이터
      setHabits([
        { id: 1, name: '아침 스트레칭', color: 'bg-emerald-500', history: {} },
        { id: 2, name: '독서 30분', color: 'bg-indigo-500', history: {} },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('myDailyHabits', JSON.stringify(habits));
  }, [habits]);

  // 외부 클릭 시 컬러 피커 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 날짜 핸들러 ---
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const changeDate = (increment) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + increment);
    else newDate.setFullYear(newDate.getFullYear() + increment);
    setCurrentDate(newDate);
  };

  // --- 알림(Toast) 핸들러 ---
  const showToast = (message, undoAction) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, onUndo: undoAction });
    toastTimer.current = setTimeout(() => setToast(null), 3000); 
  };

  const handleUndo = () => {
    if (toast && toast.onUndo) {
      toast.onUndo();
      setToast(null);
    }
  };

  // --- 루틴 CRUD 핸들러 ---
  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    if (isLocked) {
      showToast('잠금을 해제해야 루틴을 추가할 수 있습니다.', null);
      return;
    }

    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      color: selectedColor, 
      history: {} 
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const startEditing = (habit) => {
    if (isLocked) {
      showToast('잠금을 해제해야 이름을 변경할 수 있습니다.', null);
      return;
    }
    setEditingHabitId(habit.id);
    setEditingName(habit.name);
  };

  const saveEditing = () => {
    if (!editingName.trim()) {
      showToast('이름을 입력해주세요.', null);
      return;
    }
    setHabits(habits.map(h => h.id === editingHabitId ? { ...h, name: editingName } : h));
    setEditingHabitId(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingHabitId(null);
    setEditingName('');
  };

  const requestDelete = (habit) => {
    if (isLocked) {
      showToast('잠금을 해제해야 삭제할 수 있습니다.', null);
      return;
    }
    setHabitToDelete(habit);
  };

  const confirmDelete = () => {
    if (habitToDelete) {
      setHabits(habits.filter(h => h.id !== habitToDelete.id));
      setHabitToDelete(null);
    }
  };

  // --- 도트 토글 핸들러 ---
  const toggleDot = (habitId, year, month, day) => {
    if (isLocked) {
      showToast('편집하려면 잠금을 해제하세요.', null);
      return;
    }

    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;

    setHabits(prevHabits => prevHabits.map(habit => {
      if (habit.id === habitId) {
        const currentData = getHistoryData(habit, dateKey);
        const newHistory = { ...habit.history };
        
        const newCompleted = !currentData.completed;
        newHistory[dateKey] = { 
          completed: newCompleted, 
          note: currentData.note 
        };
        
        if (!newHistory[dateKey].completed && !newHistory[dateKey].note) {
          delete newHistory[dateKey];
        }

        return { ...habit, history: newHistory };
      }
      return habit;
    }));

    showToast('상태가 변경되었습니다.', () => toggleDot(habitId, year, month, day));
  };

  // --- 메모 핸들러 ---
  const openNoteModal = (e, habit, year, month, day) => {
    e.preventDefault();
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    const currentData = getHistoryData(habit, dateKey);

    setNoteInput(currentData.note);
    setActiveNote({
      habitId: habit.id,
      habitName: habit.name,
      habitColor: habit.color,
      dateKey: dateKey,
      year, month, day
    });
  };

  const saveNote = () => {
    if (isLocked) {
      alert('잠금을 해제해야 메모를 저장할 수 있습니다.');
      return;
    }
    if (!activeNote) return;

    setHabits(habits.map(habit => {
      if (habit.id === activeNote.habitId) {
        const currentData = getHistoryData(habit, activeNote.dateKey);
        const newHistory = { ...habit.history };
        
        newHistory[activeNote.dateKey] = {
          completed: currentData.completed,
          note: noteInput
        };

        if (!newHistory[activeNote.dateKey].completed && !newHistory[activeNote.dateKey].note) {
          delete newHistory[activeNote.dateKey];
        }

        return { ...habit, history: newHistory };
      }
      return habit;
    }));
    setActiveNote(null);
  };

  // --- [렌더링] 대시보드 화면 ---
  const renderDashboard = () => (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">
      <header className="bg-white border-b border-gray-200 px-6 py-10">
        <div className="max-w-xl mx-auto text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">홍승원의 루틴 트래커</h1>
          
          {/* 명언 카드 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
            <Quote size={20} className="text-gray-300 absolute top-3 left-3 opacity-50" />
            <div className="pt-2 px-4 pb-1">
              <p className="text-gray-700 font-medium italic font-serif text-lg leading-relaxed">
                '{dailyQuote.text}'
              </p>
              <p className="text-gray-400 text-sm mt-2 flex items-center justify-end gap-2">
                <span className="w-4 h-px bg-gray-300"></span>
                {dailyQuote.author}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-6">
        {habits.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <Sun size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">아직 루틴이 없습니다.</p>
            <button 
              onClick={() => setCurrentScreen('tracker')}
              className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              루틴 시작하기
            </button>
          </div>
        ) : (
          habits.map(habit => {
            const stats = calculateHabitStats(habit);
            return (
              <div 
                key={habit.id}
                onClick={() => setCurrentScreen('tracker')}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      {habit.name}
                      <span className={`w-3 h-3 rounded-full ${habit.color}`}></span>
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="font-medium text-gray-600">Total {stats.totalCount}회</span> 달성
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${habit.color} bg-opacity-10 flex items-center justify-center`}>
                    <Activity size={20} className="text-gray-700 opacity-70" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2 border-t border-gray-50 pt-4">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">This Week</p>
                    <p className="text-lg font-bold text-gray-800">{stats.thisWeekCount}<span className="text-xs font-normal text-gray-400 ml-0.5">회</span></p>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">This Month</p>
                    <p className="text-lg font-bold text-gray-800">{stats.monthCount}<span className="text-xs font-normal text-gray-400 ml-0.5">회</span></p>
                  </div>
                  <div className="text-center border-l border-gray-100 sm:border-l">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">This Year</p>
                    <p className="text-lg font-bold text-gray-800">{stats.yearCount}<span className="text-xs font-normal text-gray-400 ml-0.5">회</span></p>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Weekly Avg</p>
                    <div className="flex items-center justify-center gap-1">
                      <Zap size={12} className="text-amber-500 fill-amber-500" />
                      <p className="text-lg font-bold text-gray-800">{stats.weeklyAvg}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                   <span className="text-[10px] text-gray-400 font-medium">Last 7 Days Pace</span>
                   <div className="h-4 flex items-end gap-1">
                      {stats.weeklyPace.map((done, i) => (
                        <div 
                          key={i} 
                          className={`w-2 rounded-sm transition-all ${done ? habit.color : 'bg-gray-100'}`}
                          style={{ height: done ? '100%' : '20%' }}
                        />
                      ))}
                    </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );

  // --- [렌더링] 트래커(상세) 화면 ---
  const renderTracker = () => (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              title="대시보드로 돌아가기"
            >
              <Home size={18} />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight whitespace-nowrap hidden sm:block">Detailed Tracker</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm border
                  ${isLocked 
                    ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' 
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                {isLocked ? "잠김" : ""}
              </button>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => changeDate(-1)} className="p-1 hover:bg-white rounded-md transition-all text-gray-500"><ChevronLeft size={16} /></button>
                <span className="px-3 text-sm font-semibold text-gray-700 min-w-[100px] text-center">
                  {viewMode === 'month' ? `${currentYear}년 ${currentMonth + 1}월` : `${currentYear}년`}
                </span>
                <button onClick={() => changeDate(1)} className="p-1 hover:bg-white rounded-md transition-all text-gray-500"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto justify-center">
              <button onClick={() => setViewMode('month')} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Calendar size={14} /> 월간
              </button>
              <button onClick={() => setViewMode('year')} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'year' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <LayoutGrid size={14} /> 연간
              </button>
            </div>
            <form onSubmit={addHabit} className="flex-1 w-full md:w-auto flex gap-2">
              <div className="relative" ref={colorPickerRef}>
                <button type="button" onClick={() => setShowColorPicker(!showColorPicker)} className={`w-10 h-full min-h-[40px] rounded-lg shadow-sm border border-gray-200 ${selectedColor} flex items-center justify-center transition-transform active:scale-95`}>
                  <div className="w-4 h-4 rounded-full bg-white/30" />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-100 z-50 grid grid-cols-4 gap-2 w-48 animate-in fade-in zoom-in-95 duration-100">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => { setSelectedColor(c); setShowColorPicker(false); }} className={`w-8 h-8 rounded-full ${c} hover:scale-110 transition-transform shadow-sm ${selectedColor === c ? 'ring-2 ring-gray-400 ring-offset-2' : ''}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 flex shadow-sm rounded-lg overflow-hidden">
                <input type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="새 루틴..." disabled={isLocked} className="w-full md:w-48 px-3 py-2 bg-white border border-r-0 border-gray-300 focus:outline-none text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                <button type="submit" disabled={isLocked} className="bg-gray-900 text-white px-3 hover:bg-gray-800 transition-colors flex items-center justify-center disabled:bg-gray-300">
                  <Plus size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {habits.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Sun size={48} className="text-gray-300 mx-auto mb-4" />
            <p>등록된 루틴이 없습니다.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'month' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {habits.map((habit) => (
              <div key={habit.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300 flex flex-col">
                <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3 min-h-[46px]">
                  {editingHabitId === habit.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2 animate-in fade-in zoom-in-95 duration-200">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-2 py-1 text-lg font-bold border-b-2 border-gray-900 focus:outline-none bg-transparent"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <button onClick={saveEditing} className="p-1.5 hover:bg-green-50 text-green-600 rounded-full transition-colors"><Check size={16} /></button>
                      <button onClick={cancelEditing} className="p-1.5 hover:bg-red-50 text-red-500 rounded-full transition-colors"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="group flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          {habit.name}
                          <span className={`w-2 h-2 rounded-full ${habit.color}`}></span>
                        </h3>
                        <button
                          onClick={() => startEditing(habit)}
                          className={`text-gray-300 opacity-0 group-hover:opacity-100 transition-all p-1 hover:text-gray-600 rounded-md hover:bg-gray-100 ${isLocked ? 'hidden' : ''}`}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {viewMode === 'month' 
                          ? `${currentMonth + 1}월 달성: ${Object.keys(habit.history).filter(k => k.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`) && (habit.history[k] === true || habit.history[k].completed)).length}회`
                          : `${currentYear}년 전체 달성: ${Object.keys(habit.history).filter(k => k.startsWith(`${currentYear}`) && (habit.history[k] === true || habit.history[k].completed)).length}회`
                        }
                      </p>
                    </div>
                  )}

                  {editingHabitId !== habit.id && (
                    <button onClick={() => requestDelete(habit)} className={`text-gray-300 p-1 rounded-full transition-colors ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:text-red-500 hover:bg-red-50'}`}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {viewMode === 'month' ? (
                  <div className="mt-auto">
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                      {['일', '월', '화', '수', '목', '금', '토'].map(day => <span key={day} className="text-[10px] text-gray-400 font-medium">{day}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: getDayOfWeek(currentYear, currentMonth, 1) }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
                      {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, i) => {
                        const day = i + 1;
                        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const data = getHistoryData(habit, dateKey);
                        const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

                        return (
                          <button
                            key={day}
                            onClick={() => toggleDot(habit.id, currentYear, currentMonth, day)}
                            onContextMenu={(e) => openNoteModal(e, habit, currentYear, currentMonth, day)}
                            className={`
                              relative aspect-square rounded-full flex items-center justify-center transition-all duration-200
                              ${data.completed ? `${habit.color} text-white scale-100 shadow-sm` : 'bg-gray-100 text-transparent hover:bg-gray-200 scale-90'}
                              ${isToday ? 'ring-2 ring-gray-400 ring-offset-2' : ''}
                              ${isLocked ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                            `}
                          >
                            {data.completed ? <Check size={12} strokeWidth={4} /> : <span className="text-[10px] text-gray-400 font-medium">{day}</span>}
                            {data.note && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white bg-black" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-x-4 gap-y-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <MiniMonthGrid 
                        key={i} 
                        habit={habit} 
                        year={currentYear} 
                        month={i} 
                        toggleDot={toggleDot} 
                        openNoteModal={openNoteModal}
                        isLocked={isLocked}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-400 text-xs">
        <p className="flex items-center justify-center gap-2 mb-2"><Info size={14} /> 팁: <b>자물쇠 아이콘</b>을 눌러 편집을 잠그거나 풀 수 있습니다.</p>
      </footer>
    </div>
  );

  return (
    <>
      {currentScreen === 'dashboard' ? renderDashboard() : renderTracker()}

      {/* Undo Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-gray-900/90 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-4 backdrop-blur-sm">
            <span className="text-sm font-medium">{toast.message}</span>
            {toast.onUndo && (
              <button 
                onClick={handleUndo}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-bold flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={14} /> 실행 취소
              </button>
            )}
          </div>
        </div>
      )}

      {/* Memo Modal */}
      {activeNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`px-6 py-4 flex justify-between items-center border-b border-gray-100 ${activeNote.habitColor} text-white`}>
              <div>
                <h3 className="font-bold text-lg">{activeNote.habitName}</h3>
                <p className="text-xs opacity-90">{activeNote.year}년 {activeNote.month + 1}월 {activeNote.day}일 기록</p>
              </div>
              <button onClick={() => setActiveNote(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">메모 / 특이사항</label>
              <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="내용을 입력하세요..." className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-white text-sm resize-none" autoFocus />
              <div className="flex gap-2 mt-4">
                <button onClick={saveNote} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors text-sm">저장하기</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {habitToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">루틴 삭제</h3>
            <p className="text-sm text-gray-500 mb-6">'<span className="font-semibold text-gray-700">{habitToDelete.name}</span>' 루틴을 정말 삭제하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={() => setHabitToDelete(null)} className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">취소</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-500 rounded-xl text-white font-medium hover:bg-red-600 transition-colors text-sm">삭제</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyRoutineTracker;