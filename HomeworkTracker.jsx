const HomeworkTracker = () => {
const { useState, useEffect } = React;

const [password, setPassword] = useState('');
const [isParentMode, setIsParentMode] = useState(false);
const [showPasswordModal, setShowPasswordModal] = useState(false);
const [parentPassword, setParentPassword] = useState('1234');
const [editingGoal, setEditingGoal] = useState(null);
const [goalInput, setGoalInput] = useState('');
const [expandedSubject, setExpandedSubject] = useState(null);
const [editingSubject, setEditingSubject] = useState(null);
const [editSubjectName, setEditSubjectName] = useState('');
const [editSubjectUnit, setEditSubjectUnit] = useState('枚');
const [editSubjectIcon, setEditSubjectIcon] = useState('📚');
const [draggedSubject, setDraggedSubject] = useState(null);
const [addingSubject, setAddingSubject] = useState(false);
const [subjectNameInput, setSubjectNameInput] = useState('');
const [subjectUnitInput, setSubjectUnitInput] = useState('枚');
const [subjectIconInput, setSubjectIconInput] = useState('📚');
const [showGraph, setShowGraph] = useState(false);
const [graphViewMode, setGraphViewMode] = useState('week');

const defaultSubjects = [
{ id: 1, name: '算数', color: 'blue', icon: '🔢', unit: '枚' },
{ id: 2, name: '国語', color: 'green', icon: '📖', unit: '枚' },
{ id: 3, name: '英語', color: 'amber', icon: '🗣️', unit: '枚' }
];

// localStorageからデータを読み込む関数
const loadFromStorage = (key, defaultValue) => {
try {
const saved = localStorage.getItem(key);
return saved ? JSON.parse(saved) : defaultValue;
} catch (error) {
console.error(`Error loading ${key}:`, error);
return defaultValue;
}
};

const [subjects, setSubjects] = useState(() => loadFromStorage('subjects', defaultSubjects));
const [goals, setGoals] = useState(() => loadFromStorage('goals', {}));
const [holidays, setHolidays] = useState(() => loadFromStorage('holidays', [0, 6]));
const [records, setRecords] = useState(() => loadFromStorage('records', {}));
const [monthStartDate, setMonthStartDate] = useState(() => loadFromStorage('monthStartDate', 1));
const [editingPassword, setEditingPassword] = useState(false);
const [newPasswordInput, setNewPasswordInput] = useState('');
const [childName, setChildName] = useState(() => loadFromStorage('childName', ''));
const [childHonorific, setChildHonorific] = useState(() => loadFromStorage('childHonorific', 'ちゃん'));
const [parentName, setParentName] = useState(() => loadFromStorage('parentName', 'ママ'));
const [dailyComments, setDailyComments] = useState(() => loadFromStorage('dailyComments', {}));
const [selectedDate, setSelectedDate] = useState(new Date());

// localStorageへの保存用useEffect
useEffect(() => {
localStorage.setItem('subjects', JSON.stringify(subjects));
}, [subjects]);

useEffect(() => {
localStorage.setItem('goals', JSON.stringify(goals));
}, [goals]);

useEffect(() => {
localStorage.setItem('holidays', JSON.stringify(holidays));
}, [holidays]);

useEffect(() => {
localStorage.setItem('records', JSON.stringify(records));
}, [records]);

useEffect(() => {
localStorage.setItem('monthStartDate', JSON.stringify(monthStartDate));
}, [monthStartDate]);

useEffect(() => {
localStorage.setItem('childName', JSON.stringify(childName));
}, [childName]);

useEffect(() => {
localStorage.setItem('childHonorific', JSON.stringify(childHonorific));
}, [childHonorific]);

useEffect(() => {
localStorage.setItem('parentName', JSON.stringify(parentName));
}, [parentName]);

useEffect(() => {
localStorage.setItem('dailyComments', JSON.stringify(dailyComments));
}, [dailyComments]);

const today = new Date();
const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
const selectedDateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;

const colorMap = {
blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500', borderColor: '#3b82f6' },
green: { bg: 'bg-green-500', bgLight: 'bg-green-50', text: 'text-green-600', border: 'border-green-500', borderColor: '#22c55e' },
amber: { bg: 'bg-amber-500', bgLight: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-500', borderColor: '#f59e0b' },
purple: { bg: 'bg-purple-500', bgLight: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500', borderColor: '#a855f7' }
};

const availableIcons = ['📚', '✏️', '📝', '📓', '📕', '📗', '📘', '📙', '🎓', '✨'];

const getWorkingDaysInWeek = () => 7 - holidays.length;

const isHoliday = (date) => {
  return holidays.includes(date.getDay());
};

const calculateTargets = (monthlyTarget) => {
const workingDays = getWorkingDaysInWeek();
const weeklyTarget = Math.ceil(monthlyTarget / 4);
const dailyTarget = workingDays > 0 ? Math.ceil(weeklyTarget / workingDays) : 0;

if (monthStartDate > 1) {
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  let remainingWorkingDays = 0;
  
  for (let day = monthStartDate; day <= daysInMonth; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    if (!holidays.includes(date.getDay())) remainingWorkingDays++;
  }
  
  return { weeklyTarget, dailyTarget, adjustedMonthlyTarget: remainingWorkingDays * dailyTarget };
}

return { weeklyTarget, dailyTarget, adjustedMonthlyTarget: monthlyTarget };
};

const updateRecord = (subjectId, value) => {
setRecords(prev => ({
...prev,
[selectedDateKey]: { ...prev[selectedDateKey], [subjectId]: parseInt(value) || 0 }
}));
};

const getSelectedDateRecord = (subjectId) => records[selectedDateKey]?.[subjectId] || 0;

const getTodayRecord = (subjectId) => records[todayKey]?.[subjectId] || 0;

const isAchieved = (subjectId) => {
const goal = goals[subjectId];
if (!goal) return false;
const { dailyTarget } = calculateTargets(goal.monthly);
return getTodayRecord(subjectId) >= dailyTarget;
};

const getConsecutiveDays = (subjectId) => {
const goal = goals[subjectId];
if (!goal) return 0;

const { dailyTarget } = calculateTargets(goal.monthly);
let consecutive = 0;
let currentDate = new Date(today);

while (consecutive < 30) {
  const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
  const record = records[dateKey]?.[subjectId] || 0;
  if (record >= dailyTarget) {
    consecutive++;
    currentDate.setDate(currentDate.getDate() - 1);
  } else break;
}
return consecutive;
};

const getMonthlyProgress = (subjectId) => {
const goal = goals[subjectId];
if (!goal) return { completed: 0, target: 0, percentage: 0 };

const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();
let completed = 0;

Object.keys(records).forEach(dateKey => {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (year === currentYear && month === currentMonth && day >= monthStartDate) {
    completed += records[dateKey][subjectId] || 0;
  }
});

const { adjustedMonthlyTarget } = calculateTargets(goal.monthly);
return { 
  completed, 
  target: adjustedMonthlyTarget, 
  percentage: Math.min(100, Math.round((completed / adjustedMonthlyTarget) * 100))
};
};

const toggleParentMode = () => {
if (isParentMode) {
setIsParentMode(false);
} else {
setShowPasswordModal(true);
}
};

const handlePasswordSubmit = () => {
if (password === parentPassword) {
setIsParentMode(true);
setShowPasswordModal(false);
setPassword('');
} else {
alert('パスワードが違います');
setPassword('');
}
};

const addSubject = () => {
setAddingSubject(true);
setSubjectNameInput('');
setSubjectUnitInput('枚');
setSubjectIconInput('📚');
};

const saveNewSubject = () => {
if (subjectNameInput?.trim()) {
setSubjects([...subjects, {
id: Date.now(),
name: subjectNameInput.trim(),
color: 'purple',
icon: subjectIconInput,
unit: subjectUnitInput
}]);
setAddingSubject(false);
setSubjectNameInput('');
setSubjectUnitInput('枚');
setSubjectIconInput('📚');
}
};

const setGoal = (subjectId) => {
setEditingGoal(subjectId);
const currentGoal = goals[subjectId];
setGoalInput(currentGoal ? String(currentGoal.monthly) : '');
};

const saveGoal = () => {
if (editingGoal && goalInput && !isNaN(goalInput) && parseInt(goalInput) > 0) {
setGoals(prev => ({ ...prev, [editingGoal]: { monthly: parseInt(goalInput) } }));
setEditingGoal(null);
setGoalInput('');
}
};

const cancelEdit = () => {
setEditingGoal(null);
setGoalInput('');
setAddingSubject(false);
setSubjectNameInput('');
setSubjectUnitInput('枚');
setSubjectIconInput('📚');
setEditingSubject(null);
setEditSubjectName('');
setEditSubjectUnit('枚');
setEditSubjectIcon('📚');
setExpandedSubject(null);
};

const toggleSubjectExpansion = (subjectId) => {
if (expandedSubject === subjectId) {
setExpandedSubject(null);
setEditingSubject(null);
} else {
setExpandedSubject(subjectId);
setEditingSubject(null);
}
};

const editSubject = (subject) => {
setEditingSubject(subject.id);
setEditSubjectName(subject.name);
setEditSubjectUnit(subject.unit || '枚');
setEditSubjectIcon(subject.icon);
};

const saveSubjectEdit = () => {
if (editSubjectName?.trim()) {
setSubjects(subjects.map(s => 
  s.id === editingSubject 
    ? { ...s, name: editSubjectName.trim(), unit: editSubjectUnit, icon: editSubjectIcon }
    : s
));
setEditingSubject(null);
setEditSubjectName('');
setEditSubjectUnit('枚');
setEditSubjectIcon('📚');
}
};

const deleteSubject = (subjectId) => {
const subject = subjects.find(s => s.id === subjectId);
if (!subject) return;

if (window.confirm(`${subject.name}を削除してもよろしいですか？\n目標と記録もすべて削除されます。`)) {
setSubjects(subjects.filter(s => s.id !== subjectId));
const newGoals = { ...goals };
delete newGoals[subjectId];
setGoals(newGoals);

const newRecords = { ...records };
Object.keys(newRecords).forEach(dateKey => {
  if (newRecords[dateKey][subjectId]) {
    delete newRecords[dateKey][subjectId];
  }
});
setRecords(newRecords);
setExpandedSubject(null);
setEditingSubject(null);
}
};

const handleDragStart = (e, index) => {
setDraggedSubject(index);
e.dataTransfer.effectAllowed = 'move';
};

const handleDragOver = (e, index) => {
e.preventDefault();
if (draggedSubject === null || draggedSubject === index) return;

const newSubjects = [...subjects];
const draggedItem = newSubjects[draggedSubject];
newSubjects.splice(draggedSubject, 1);
newSubjects.splice(index, 0, draggedItem);

setSubjects(newSubjects);
setDraggedSubject(index);
};

const handleDragEnd = () => {
setDraggedSubject(null);
};

const savePassword = () => {
if (newPasswordInput?.trim()) {
setParentPassword(newPasswordInput.trim());
setEditingPassword(false);
setNewPasswordInput('');
}
};

const updateComment = (dateKey, type, value) => {
setDailyComments(prev => ({
...prev,
[dateKey]: { ...prev[dateKey], [type]: value }
}));
};

const getTotalProgress = () => {
let totalDailyCompleted = 0, totalDailyTarget = 0;
let totalMonthlyCompleted = 0, totalMonthlyTarget = 0;

subjects.forEach(subject => {
  const goal = goals[subject.id];
  if (goal) {
    const targets = calculateTargets(goal.monthly);
    totalDailyCompleted += getTodayRecord(subject.id);
    totalDailyTarget += targets.dailyTarget;
    
    const monthlyProgress = getMonthlyProgress(subject.id);
    totalMonthlyCompleted += monthlyProgress.completed;
    totalMonthlyTarget += monthlyProgress.target;
  }
});

return {
  dailyCompleted: totalDailyCompleted,
  dailyTarget: totalDailyTarget,
  dailyPercentage: totalDailyTarget > 0 ? Math.min(100, Math.round((totalDailyCompleted / totalDailyTarget) * 100)) : 0,
  monthlyCompleted: totalMonthlyCompleted,
  monthlyTarget: totalMonthlyTarget,
  monthlyPercentage: totalMonthlyTarget > 0 ? Math.min(100, Math.round((totalMonthlyCompleted / totalMonthlyTarget) * 100)) : 0
};
};

const getAchievementMessage = (consecutive) => {
const messages = [
  { emoji: '⭐', text: 'よくできました！' },
  { emoji: '🌟', text: 'すばらしい！' },
  { emoji: '✨', text: 'かんぺき！' },
  { emoji: '💯', text: '花まる！' },
  { emoji: '👏', text: 'すごいぞ！' },
  { emoji: '🎉', text: 'やったね！' },
  { emoji: '🌈', text: 'さいこう！' },
  { emoji: '💪', text: 'がんばったね！' },
  { emoji: '🎊', text: 'パーフェクト！' },
  { emoji: '⚡', text: 'いいぞ！' }
];

if (consecutive >= 3) {
  return { emoji: '🏆', text: 'すごい！' };
}

const index = Math.floor(Math.random() * messages.length);
return messages[index];
};

return (
<div className="min-h-dvh bg-blue-50 p-4">
<div className="max-w-4xl mx-auto">
{/* Header */}
<div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 mb-6">
<div className="flex justify-between items-center gap-3">
<div className="flex-1 min-w-0">
<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-balance">
📚 がんばりノート
</h1>
<p className="text-xs sm:text-sm text-gray-500 mt-1">
{today.getMonth() + 1}月{today.getDate()}日（{['日','月','火','水','木','金','土'][today.getDay()]}）
</p>
</div>
<div className="flex gap-2 shrink-0">
{!isParentMode && (
<button
onClick={() => {
  setShowGraph(!showGraph);
  if (!showGraph) setGraphViewMode('week');
}}
className={`size-10 sm:size-12 rounded-xl ${ showGraph ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600' }`}
aria-label="グラフ表示"
>
📊
</button>
)}
<button
onClick={toggleParentMode}
className={`size-10 sm:size-12 rounded-xl ${ isParentMode ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600' }`}
aria-label="保護者メニュー"
>
⚙️
</button>
</div>
</div>
</div>

{/* Total Progress (Child Mode Only) */}
{!isParentMode && !showGraph && subjects.some(s => goals[s.id]) && (() => {
  const totalProgress = getTotalProgress();
  const allAchieved = totalProgress.dailyCompleted >= totalProgress.dailyTarget && totalProgress.dailyTarget > 0;
  
  return (
    <div className="bg-white rounded-3xl shadow-lg p-5 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-balance">
        {allAchieved ? '🎉 目標達成！' : '📊 今日の合計進捗'}
      </h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="font-semibold text-gray-700">今日</span>
          <span className="font-bold text-blue-600 tabular-nums">
            {totalProgress.dailyCompleted} / {totalProgress.dailyTarget}枚
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-blue-500"
            style={{ width: `${totalProgress.dailyPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right tabular-nums">
          {totalProgress.dailyPercentage}%達成
        </p>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="font-semibold text-gray-700">今月</span>
          <span className="font-bold text-green-600 tabular-nums">
            {totalProgress.monthlyCompleted} / {totalProgress.monthlyTarget}枚
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-green-500"
            style={{ width: `${totalProgress.monthlyPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right tabular-nums">
          {totalProgress.monthlyPercentage}%達成
        </p>
      </div>
    </div>
  );
})()}

{isParentMode ? (
  <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 text-balance">
      🔒 保護者メニュー
    </h2>
    
    <div>
      <h3 className="font-semibold text-lg mb-3 text-balance">教科と目標設定</h3>
      <div className="space-y-3">
        {subjects.map((subject, index) => {
          const goal = goals[subject.id];
          const targets = goal ? calculateTargets(goal.monthly) : { weeklyTarget: 0, dailyTarget: 0 };
          const isExpanded = expandedSubject === subject.id;
          const isEditingThis = editingSubject === subject.id;
          const colors = colorMap[subject.color];
          
          return (
            <div 
              key={subject.id} 
              className={`border-2 ${colors.border} rounded-xl overflow-hidden ${
                draggedSubject === index ? 'opacity-50' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, index)}
            >
              {/* ヘッダー部分 - クリックで展開/折りたたみ */}
              <div 
                className={`p-4 ${colors.bgLight} flex items-center gap-3`}
              >
                <div 
                  className="text-gray-400 cursor-move px-2 py-1"
                  draggable={isEditingThis ? "false" : "true"}
                  onDragStart={(e) => {
                    if (!isEditingThis) {
                      handleDragStart(e, index);
                      e.stopPropagation();
                    }
                  }}
                  onDragEnd={handleDragEnd}
                >
                  ☰
                </div>
                <div 
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                  onClick={() => !isEditingThis && toggleSubjectExpansion(subject.id)}
                >
                  <span className="text-2xl">{subject.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{subject.name}</div>
                    {goal && (
                      <div className="text-xs text-gray-600 tabular-nums">
                        月間: {goal.monthly}{subject.unit || '枚'} / 1日: {targets.dailyTarget}{subject.unit || '枚'}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </div>
              </div>
              
              {/* 展開コンテンツ */}
              {isExpanded && (
                <div className="p-4 bg-white border-t-2 border-gray-100">
                  {isEditingThis ? (
                    /* 編集UI */
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">教科名</label>
                        <input
                          type="text"
                          value={editSubjectName}
                          onChange={(e) => setEditSubjectName(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">単位</label>
                        <select
                          value={editSubjectUnit}
                          onChange={(e) => setEditSubjectUnit(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                          <option value="枚">枚</option>
                          <option value="ページ">ページ</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">アイコン</label>
                        <div className="grid grid-cols-5 gap-2">
                          {availableIcons.map(icon => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => setEditSubjectIcon(icon)}
                              className={`aspect-square text-2xl rounded-lg border-2 ${
                                editSubjectIcon === icon
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSubject(null);
                          }}
                          className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveSubjectEdit();
                          }}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 通常表示 - 目標設定と操作ボタン */
                    <div className="space-y-3">
                      {editingGoal === subject.id ? (
                        /* 目標設定UI */
                        <div className="space-y-2">
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              value={goalInput}
                              onChange={(e) => setGoalInput(e.target.value)}
                              placeholder="月間目標"
                              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                              autoFocus
                            />
                            <span className="text-sm text-gray-600 shrink-0 tabular-nums">
                              {subject.unit || '枚'}/月
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEdit();
                              }}
                              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg"
                            >
                              キャンセル
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveGoal();
                              }}
                              className="flex-1 py-2 bg-green-500 text-white rounded-lg"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : goal ? (
                        /* 目標表示 */
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-1 tabular-nums">
                          <div className="flex justify-between">
                            <span>📅 月間目標:</span>
                            <span className="font-semibold">{goal.monthly}{subject.unit || '枚'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>📊 週間目標:</span>
                            <span className="font-semibold">{targets.weeklyTarget}{subject.unit || '枚'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>⭐ 1日目標:</span>
                            <span className="font-semibold">{targets.dailyTarget}{subject.unit || '枚'}</span>
                          </div>
                        </div>
                      ) : (
                        /* 目標未設定 */
                        <div className="text-sm text-gray-500 text-center py-2">
                          目標が設定されていません
                        </div>
                      )}
                      
                      {/* 操作ボタン */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGoal(subject.id);
                          }}
                          className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm"
                        >
                          {goal ? '目標変更' : '目標設定'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editSubject(subject);
                          }}
                          className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                        >
                          編集
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSubject(subject.id);
                          }}
                          className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {addingSubject ? (
          <div className="border-2 border-gray-300 rounded-xl p-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">教科名</label>
              <input
                type="text"
                value={subjectNameInput}
                onChange={(e) => setSubjectNameInput(e.target.value)}
                placeholder="教科名を入力"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-2 block">単位</label>
              <select
                value={subjectUnitInput}
                onChange={(e) => setSubjectUnitInput(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="枚">枚</option>
                <option value="ページ">ページ</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-2 block">アイコン</label>
              <div className="grid grid-cols-5 gap-2">
                {availableIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSubjectIconInput(icon)}
                    className={`aspect-square text-2xl rounded-lg border-2 ${
                      subjectIconInput === icon
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={saveNewSubject}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg"
              >
                追加
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={addSubject}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 flex items-center justify-center gap-2"
          >
            ➕ 教科を追加
          </button>
        )}
      </div>
    </div>

    <div className="border-t pt-4">
      <h3 className="font-semibold text-lg mb-3 text-balance">休日設定</h3>
      <div className="flex gap-2">
        {['日','月','火','水','木','金','土'].map((day, idx) => (
          <button
            key={idx}
            onClick={() => setHolidays(prev => 
              prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
            )}
            className={`flex-1 py-3 rounded-lg font-semibold ${
              holidays.includes(idx)
                ? 'bg-red-100 text-red-600 border-2 border-red-300'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>

    <div className="border-t pt-4">
      <h3 className="font-semibold text-lg mb-3 text-balance">月の開始日設定</h3>
      <p className="text-sm text-gray-600 mb-3 text-pretty">
        月の途中から始めた場合は開始日を選択してください
      </p>
      <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <div className="text-center">
          <span className="text-sm text-gray-600">現在の設定：</span>
          <span className="ml-2 text-lg font-bold text-blue-600 tabular-nums">
            {today.getFullYear()}年{today.getMonth() + 1}月{monthStartDate}日から開始
          </span>
        </div>
      </div>
      <div className="mb-2 text-center">
        <span className="text-base font-semibold text-gray-700 tabular-nums">
          {today.getFullYear()}年{today.getMonth() + 1}月
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日','月','火','水','木','金','土'].map((day, idx) => (
          <div key={idx} className="text-center text-xs font-semibold text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {(() => {
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
          const days = [];
          
          for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="aspect-square" />);
          }
          
          for (let day = 1; day <= daysInMonth; day++) {
            days.push(
              <button
                key={day}
                onClick={() => setMonthStartDate(day)}
                className={`aspect-square p-2 rounded-lg text-sm font-semibold tabular-nums ${
                  monthStartDate === day
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {day}
              </button>
            );
          }
          return days;
        })()}
      </div>
    </div>

    <div className="border-t pt-4">
      <h3 className="font-semibold text-lg mb-3 text-balance">パスワード設定</h3>
      {editingPassword ? (
        <div className="space-y-2">
          <input
            type="password"
            value={newPasswordInput}
            onChange={(e) => setNewPasswordInput(e.target.value)}
            placeholder="新しいパスワード"
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={cancelEdit}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg"
            >
              キャンセル
            </button>
            <button
              onClick={savePassword}
              className="flex-1 py-2 bg-green-500 text-white rounded-lg"
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingPassword(true)}
          className="w-full py-3 bg-blue-500 text-white rounded-lg"
        >
          パスワードを変更
        </button>
      )}
    </div>

    <div className="border-t pt-4">
      <h3 className="font-semibold text-lg mb-3 text-balance">名前設定</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">
            お子さんの名前（敬称込み）
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="例：たろう"
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <select
              value={childHonorific}
              onChange={(e) => setChildHonorific(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="ちゃん">ちゃん</option>
              <option value="くん">くん</option>
              <option value="さん">さん</option>
            </select>
          </div>
          {childName && (
            <p className="text-xs text-gray-500 mt-1">
              表示名：{childName}{childHonorific}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-2 block">
            保護者の呼び方
          </label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="例：ママ、パパ"
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  </div>
) : showGraph ? (
  <div className="bg-white rounded-3xl shadow-lg p-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-balance">
        📊 がんばりグラフ
      </h2>
      <div className="flex gap-2">
        <button
          onClick={() => setGraphViewMode('week')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            graphViewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          週
        </button>
        <button
          onClick={() => setGraphViewMode('month')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            graphViewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          月
        </button>
        <button
          onClick={() => setGraphViewMode('calendar')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            graphViewMode === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          📅
        </button>
      </div>
    </div>

    <div className="mb-10">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-balance">今日の達成状況</h3>
      <div className="flex gap-2 sm:gap-4 items-end justify-center h-64 sm:h-80 border-b-2 border-gray-200 pb-4">
        {(() => {
          const totalTarget = subjects.filter(s => goals[s.id]).reduce((sum, s) => {
            const g = goals[s.id];
            if (g) {
              const t = calculateTargets(g.monthly);
              return sum + t.dailyTarget;
            }
            return sum;
          }, 0);
          
          const totalActual = subjects.filter(s => goals[s.id]).reduce((sum, s) => {
            return sum + getTodayRecord(s.id);
          }, 0);
          
          const maxValue = Math.max(totalTarget, totalActual);
          
          return (
            <>
              <div className="flex-1 max-w-24 sm:max-w-32 flex flex-col items-center h-full justify-end">
                <div className="w-full h-full flex flex-col-reverse justify-start">
                  {subjects.filter(s => goals[s.id]).map((subject, idx) => {
                    const goal = goals[subject.id];
                    const targets = calculateTargets(goal.monthly);
                    const height = maxValue > 0 ? (targets.dailyTarget / maxValue) * 100 : 0;
                    const colors = colorMap[subject.color];
                    
                    return (
                      <div
                        key={subject.id}
                        className={`w-full ${colors.bgLight} flex items-center justify-center text-xs font-semibold text-gray-700 tabular-nums`}
                        style={{ 
                          height: `${height}%`,
                          border: `2px solid ${colors.borderColor}`,
                          borderTopWidth: idx > 0 ? '0' : '2px'
                        }}
                      >
                        {targets.dailyTarget > 0 && targets.dailyTarget}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs sm:text-sm font-semibold text-gray-600 text-center tabular-nums">
                  目標<br/>{totalTarget}枚
                </div>
              </div>
              
              <div className="flex-1 max-w-24 sm:max-w-32 flex flex-col items-center h-full justify-end">
                <div className="w-full h-full flex flex-col-reverse justify-start">
                  {subjects.filter(s => goals[s.id]).map((subject, idx) => {
                    const todayRecord = getTodayRecord(subject.id);
                    const height = maxValue > 0 ? (todayRecord / maxValue) * 100 : 0;
                    const colors = colorMap[subject.color];
                    
                    return (
                      <div
                        key={subject.id}
                        className={`w-full ${colors.bg} flex items-center justify-center text-xs font-semibold text-white tabular-nums`}
                        style={{ 
                          height: `${height}%`,
                          minHeight: todayRecord > 0 ? '1.25rem' : '0',
                          borderTop: idx > 0 ? '1px solid white' : 'none'
                        }}
                      >
                        {todayRecord > 0 && todayRecord}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs sm:text-sm font-semibold text-gray-600 text-center tabular-nums">
                  実績<br/>{totalActual}枚
                </div>
              </div>
            </>
          );
        })()}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2 sm:gap-3 justify-center">
        {subjects.filter(s => goals[s.id]).map(subject => {
          const colors = colorMap[subject.color];
          return (
            <div key={subject.id} className="flex items-center gap-2">
              <div className={`size-3 sm:size-4 ${colors.bg} rounded`} />
              <span className="text-xs sm:text-sm text-gray-700">{subject.icon} {subject.name}</span>
            </div>
          );
        })}
      </div>
    </div>
    
    <div className="border-t-2 border-gray-200 pt-8">
      {graphViewMode === 'week' && (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-balance">今週の推移</h3>
          <div className="mb-6">
            <div className="flex gap-2 h-64 items-end border-b-2 border-gray-200 pb-2">
              {(() => {
                const daysData = [];
                let maxDailyTotal = 0;
                
                for (let i = 6; i >= 0; i--) {
                  const date = new Date(today);
                  date.setDate(date.getDate() - i);
                  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                  
                  let totalForDay = 0;
                  subjects.filter(s => goals[s.id]).forEach(subject => {
                    totalForDay += records[dateKey]?.[subject.id] || 0;
                  });
                  maxDailyTotal = Math.max(maxDailyTotal, totalForDay);
                  daysData.push({ date, dateKey });
                }
                
                const totalTarget = subjects.filter(s => goals[s.id]).reduce((sum, s) => {
                  const g = goals[s.id];
                  if (g) {
                    const t = calculateTargets(g.monthly);
                    return sum + t.dailyTarget;
                  }
                  return sum;
                }, 0);
                maxDailyTotal = Math.max(maxDailyTotal, totalTarget);
                
                const maxHeight = 200;
                
                return daysData.map(({ date, dateKey }) => (
                  <div key={dateKey} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div className="w-full flex flex-col-reverse relative">
                      {subjects.filter(s => goals[s.id]).map((subject, idx) => {
                        const count = records[dateKey]?.[subject.id] || 0;
                        const height = maxDailyTotal > 0 ? (count / maxDailyTotal) * maxHeight : 0;
                        const colors = colorMap[subject.color];
                        const isLast = idx === subjects.filter(s => goals[s.id]).length - 1;
                        
                        return (
                          <div
                            key={subject.id}
                            className={`w-full ${colors.bg} ${isLast ? 'rounded-t' : ''}`}
                            style={{
                              height: `${height}px`,
                              minHeight: count > 0 ? '0.1875rem' : '0',
                              borderTop: idx > 0 ? '1px solid white' : 'none'
                            }}
                            title={`${subject.name}: ${count}枚`}
                          />
                        );
                      })}
                      {(() => {
                        const totalForDay = subjects.filter(s => goals[s.id]).reduce((sum, s) => {
                          return sum + (records[dateKey]?.[s.id] || 0);
                        }, 0);
                        
                        return totalForDay > 0 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs sm:text-sm font-bold text-gray-700 whitespace-nowrap tabular-nums">
                            {totalForDay}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="mt-2 text-xs text-gray-600 text-center">
                      <div className="font-semibold">{['日','月','火','水','木','金','土'][date.getDay()]}</div>
                      <div className="tabular-nums">{date.getMonth() + 1}/{date.getDate()}</div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </>
      )}
      
      {graphViewMode === 'month' && (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-balance">今月の推移</h3>
          <div className="mb-6">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-1 min-w-max h-64 items-end border-b-2 border-gray-200 pb-2">
                {(() => {
                  let maxDailyTotal = 0;
                  
                  for (let day = 1; day <= today.getDate(); day++) {
                    const date = new Date(today.getFullYear(), today.getMonth(), day);
                    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    
                    let totalForDay = 0;
                    subjects.filter(s => goals[s.id]).forEach(subject => {
                      totalForDay += records[dateKey]?.[subject.id] || 0;
                    });
                    maxDailyTotal = Math.max(maxDailyTotal, totalForDay);
                  }
                  
                  const totalTarget = subjects.filter(s => goals[s.id]).reduce((sum, s) => {
                    const g = goals[s.id];
                    if (g) {
                      const t = calculateTargets(g.monthly);
                      return sum + t.dailyTarget;
                    }
                    return sum;
                  }, 0);
                  maxDailyTotal = Math.max(maxDailyTotal, totalTarget);
                  
                  const days = [];
                  const maxHeight = 200;
                  
                  for (let day = 1; day <= today.getDate(); day++) {
                    const date = new Date(today.getFullYear(), today.getMonth(), day);
                    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    
                    days.push(
                      <div key={dateKey} className="flex-1 min-w-6 flex flex-col items-center h-full justify-end">
                        <div className="w-full flex flex-col-reverse relative">
                          {subjects.filter(s => goals[s.id]).map((subject, idx) => {
                            const count = records[dateKey]?.[subject.id] || 0;
                            const height = maxDailyTotal > 0 ? (count / maxDailyTotal) * maxHeight : 0;
                            const colors = colorMap[subject.color];
                            const isLast = idx === subjects.filter(s => goals[s.id]).length - 1;
                            
                            return (
                              <div
                                key={subject.id}
                                className={`w-full ${colors.bg} ${isLast ? 'rounded-t' : ''}`}
                                style={{
                                  height: `${height}px`,
                                  minHeight: count > 0 ? '0.1875rem' : '0',
                                  borderTop: idx > 0 ? '1px solid white' : 'none'
                                }}
                                title={`${subject.name}: ${count}枚`}
                              />
                            );
                          })}
                          {(() => {
                            const totalForDay = subjects.filter(s => goals[s.id]).reduce((sum, s) => {
                              return sum + (records[dateKey]?.[s.id] || 0);
                            }, 0);
                            
                            return totalForDay > 0 && (
                              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap tabular-nums">
                                {totalForDay}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 [writing-mode:vertical-rl] text-orientation-mixed">
                          {date.getMonth() + 1}/{date.getDate()}
                        </div>
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>
            </div>
          </div>
        </>
      )}
      
      {graphViewMode === 'calendar' && (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-balance">カレンダー表示</h3>
          <div className="mb-6">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日','月','火','水','木','金','土'].map((day, idx) => (
                <div key={idx} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
                const days = [];
                
                for (let i = 0; i < firstDayOfMonth; i++) {
                  days.push(<div key={`empty-${i}`} className="aspect-square" />);
                }
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(today.getFullYear(), today.getMonth(), day);
                  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                  const isPast = date <= today;
                  
                  let totalForDay = 0;
                  subjects.filter(s => goals[s.id]).forEach(subject => {
                    totalForDay += records[dateKey]?.[subject.id] || 0;
                  });
                  
                  const totalTarget = subjects.filter(s => goals[s.id]).reduce((sum, s) => {
                    const g = goals[s.id];
                    if (g && !isHoliday(date)) {
                      const t = calculateTargets(g.monthly);
                      return sum + t.dailyTarget;
                    }
                    return sum;
                  }, 0);
                  
                  const achieved = totalForDay >= totalTarget && totalTarget > 0;
                  const isToday = dateKey === todayKey;
                  
                  days.push(
                    <div
                      key={day}
                      className={`aspect-square p-2 rounded-lg border-2 relative ${
                        isToday
                          ? 'border-blue-500 bg-blue-50'
                          : isPast
                          ? 'border-gray-200 bg-white'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start">
                          <div className={`text-xs font-semibold ${
                            isToday ? 'text-blue-600' : 'text-gray-700'
                          } tabular-nums`}>
                            {day}
                          </div>
                          {isPast && achieved && (
                            <div className="text-sm">⭐</div>
                          )}
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          {isPast && totalForDay > 0 && (
                            <div className="text-base font-bold text-gray-700 tabular-nums">
                              {totalForDay}
                            </div>
                          )}
                          {isPast && isHoliday(date) && totalForDay === 0 && (
                            <div className="text-xs text-red-500">休</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return days;
              })()}
            </div>
          </div>
        </>
      )}
      
      <div className="mt-6 flex flex-wrap gap-3 justify-center border-t pt-6">
        {subjects.filter(s => goals[s.id]).map(subject => {
          const colors = colorMap[subject.color];
          return (
            <div key={subject.id} className="flex items-center gap-2">
              <div className={`size-4 ${colors.bg} rounded`} />
              <span className="text-sm text-gray-700">{subject.icon} {subject.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
) : (
  <div className="space-y-6">
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-balance">
        📅 記録する日を選択
      </h3>
      <div className="flex gap-2 items-center justify-center">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
          aria-label="前の日"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <p className="text-2xl font-bold text-gray-800 tabular-nums">
            {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
          </p>
          <p className="text-sm text-gray-600">
            ({['日','月','火','水','木','金','土'][selectedDate.getDay()]})
            {selectedDateKey === todayKey && <span className="ml-2 text-blue-600 font-semibold">今日</span>}
            {isHoliday(selectedDate) && <span className="ml-2 text-red-600 font-semibold">休日</span>}
          </p>
        </div>
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            if (newDate <= today) {
              setSelectedDate(newDate);
            }
          }}
          disabled={selectedDateKey === todayKey}
          className={`px-4 py-2 rounded-lg ${
            selectedDateKey === todayKey ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700'
          }`}
          aria-label="次の日"
        >
          →
        </button>
        {selectedDateKey !== todayKey && (
          <button
            onClick={() => setSelectedDate(new Date(today))}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            今日
          </button>
        )}
      </div>
    </div>

    {subjects.map(subject => {
      const goal = goals[subject.id];
      if (!goal) return null;
      
      const targets = calculateTargets(goal.monthly);
      const selectedRecord = getSelectedDateRecord(subject.id);
      const achieved = !isHoliday(selectedDate) && selectedRecord >= targets.dailyTarget;
      const consecutive = getConsecutiveDays(subject.id);
      const monthlyProgress = getMonthlyProgress(subject.id);
      const colors = colorMap[subject.color];
      const isSelectedHoliday = isHoliday(selectedDate);
      
      return (
        <div key={subject.id} className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className={`p-6 ${colors.bgLight}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{subject.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 text-balance">{subject.name}</h2>
                {!isSelectedHoliday ? (
                  <p className="text-sm text-gray-600 tabular-nums">
                    {selectedDateKey === todayKey ? '今日' : `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`}の目標: {targets.dailyTarget}{subject.unit || '枚'}
                  </p>
                ) : (
                  <p className="text-sm text-red-600">休日（目標なし）</p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-700 font-semibold">
                  {selectedDateKey === todayKey ? '今日' : `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`}やった{subject.unit || '枚数'}:
                </label>
                <span className={`text-3xl font-bold ${colors.text} tabular-nums`}>{selectedRecord}{subject.unit || '枚'}</span>
              </div>
              <input
                type="range"
                min="0"
                max={targets.dailyTarget * 3}
                value={selectedRecord}
                onChange={(e) => updateRecord(subject.id, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
              />
            </div>
            
            {achieved && selectedDateKey === todayKey && (
              <div className="text-center py-4 bg-white rounded-2xl mb-4">
                <div className="text-6xl mb-2">
                  {getAchievementMessage(consecutive).emoji}
                </div>
                <p className={`text-xl font-bold ${colors.text}`}>
                  {getAchievementMessage(consecutive).text}
                </p>
                {consecutive >= 3 && (
                  <p className="text-sm text-gray-600 mt-1 tabular-nums">
                    {consecutive}日連続達成！
                  </p>
                )}
              </div>
            )}
            
            {!isSelectedHoliday && (
              <div className="bg-white rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="font-semibold text-gray-700">
                    {selectedDateKey === todayKey ? '今日' : `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`}の達成率
                  </span>
                  <span className={`font-bold ${colors.text} tabular-nums`}>
                    {selectedRecord} / {targets.dailyTarget}{subject.unit || '枚'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${colors.bg}`}
                    style={{ width: `${Math.min(100, Math.round((selectedRecord / targets.dailyTarget) * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right tabular-nums">
                  {Math.min(100, Math.round((selectedRecord / targets.dailyTarget) * 100))}%達成
                </p>
              </div>
            )}
            
            <div className="bg-white rounded-2xl p-4 mt-3">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-semibold text-gray-700">今月の進捗</span>
                <span className={`font-bold ${colors.text} tabular-nums`}>
                  {monthlyProgress.completed} / {monthlyProgress.target}{subject.unit || '枚'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full ${colors.bg}`}
                  style={{ width: `${monthlyProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right tabular-nums">
                {monthlyProgress.percentage}%達成
                {monthStartDate > 1 && (
                  <span className="ml-2 text-amber-600">
                    ({monthStartDate}日開始)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      );
    })}
    
    {subjects.filter(s => goals[s.id]).length > 0 && (
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-balance">
          💭 {selectedDateKey === todayKey ? '今日' : `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`}のひとこと
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">
              {childName ? `${childName}${childHonorific}のひとこと` : 'あなたのひとこと'}
            </label>
            <textarea
              value={dailyComments[selectedDateKey]?.child || ''}
              onChange={(e) => updateComment(selectedDateKey, 'child', e.target.value)}
              placeholder="今日はどうだった？"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none min-h-20"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">
              {parentName}からのひとこと
            </label>
            <textarea
              value={dailyComments[selectedDateKey]?.parent || ''}
              onChange={(e) => updateComment(selectedDateKey, 'parent', e.target.value)}
              placeholder="今日のがんばりにコメント"
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none min-h-20"
            />
          </div>
        </div>
      </div>
    )}
    
    {subjects.filter(s => goals[s.id]).length === 0 && (
      <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg text-pretty">
          保護者メニューから目標を設定してください
        </p>
      </div>
    )}
  </div>
)}

{showPasswordModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
      <h3 className="text-2xl font-bold mb-4 text-gray-800 text-balance">保護者パスワード</h3>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
        placeholder="パスワードを入力"
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl mb-4 focus:border-blue-500 focus:outline-none text-lg"
        autoFocus
      />
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowPasswordModal(false);
            setPassword('');
          }}
          className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl"
        >
          キャンセル
        </button>
        <button
          onClick={handlePasswordSubmit}
          className="flex-1 py-3 bg-blue-500 text-white rounded-xl"
        >
          OK
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center tabular-nums">
        デフォルトパスワード: 1234
      </p>
    </div>
  </div>
)}
</div>
</div>
);
};

// グローバルに公開
window.HomeworkTracker = HomeworkTracker;
