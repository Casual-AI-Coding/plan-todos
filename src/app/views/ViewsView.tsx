'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, ProgressBar } from '@/components/ui';
import { 
  getTodos, getPlans, getTargets, getMilestones,
  getTasksByPlan, getSteps, Todo, Plan, Task, Target, Step, Milestone 
} from '@/lib/api';

export function ViewsView() {
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar' | 'gantt'>('list');
  
  // Filter states
  const [filters, setFilters] = useState({
    todo: true,
    task: true,
    plan: true,
    target: true,
    milestone: true,
  });

  // Hover state for tooltips
  const [hoveredItem, setHoveredItem] = useState<{ type: string; data: Todo | Task | Plan | Target | Milestone } | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  
  // Calendar navigation state
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Gantt timeline zoom state (number of months)
  const [ganttZoom, setGanttZoom] = useState(3);
  
  // Data states
  const [todos, setTodos] = useState<Todo[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetSteps, setTargetSteps] = useState<Record<string, Step[]>>({});
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const isMounted = useRef(false);

  async function loadAllData() {
    try {
      const [t, p, tg, m] = await Promise.all([
        getTodos(), getPlans(), getTargets(), getMilestones()
      ]);
      if (isMounted.current) {
        setTodos(t);
        setPlans(p);
        setTargets(tg);
        setMilestones(m);
      }
      
      // Load tasks for each plan
      const taskMap: Record<string, Task[]> = {};
      for (const plan of p) {
        taskMap[plan.id] = await getTasksByPlan(plan.id);
      }
      if (isMounted.current) setTasks(taskMap);
      
      // Load steps for each target
      const stepMap: Record<string, Step[]> = {};
      for (const target of tg) {
        stepMap[target.id] = await getSteps(target.id);
      }
      if (isMounted.current) setTargetSteps(stepMap);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { isMounted.current = true; loadAllData(); return () => { isMounted.current = false; }; }, []);

  const viewModes = [
    { id: 'list', icon: '📋', label: '列表' },
    { id: 'board', icon: '📊', label: '看板' },
    { id: 'calendar', icon: '📅', label: '日历' },
    { id: 'gantt', icon: '📈', label: '时间线' },
  ];

  const filterOptions = [
    { id: 'plan', label: '计划', color: 'purple' },
    { id: 'task', label: '任务', color: 'teal' },
    { id: 'target', label: '目标', color: 'orange' },
    { id: 'todo', label: '待办', color: 'blue' },
    { id: 'milestone', label: '里程碑', color: 'pink' },
  ];

  // Filter component with checkboxes
  const renderFilters = () => {
    const allSelected = Object.values(filters).every(v => v);
    const noneSelected = Object.values(filters).every(v => !v);
    
    const handleSelectAll = () => {
      setFilters({ todo: true, task: true, plan: true, target: true, milestone: true });
    };
    
    const handleInvert = () => {
      setFilters({
        todo: !filters.todo,
        task: !filters.task,
        plan: !filters.plan,
        target: !filters.target,
        milestone: !filters.milestone,
      });
    };

    return (
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            disabled={allSelected}
            className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            全选
          </button>
          <button
            onClick={handleInvert}
            disabled={noneSelected}
            className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            取反
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {filterOptions.map(item => (
            <label
              key={item.id}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-sm cursor-pointer transition-all ${
                filters[item.id as keyof typeof filters]
                  ? `bg-${item.color}-100 text-${item.color}-700 border border-${item.color}-300`
                  : 'bg-gray-50 text-gray-400 border border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={filters[item.id as keyof typeof filters]}
                onChange={() => setFilters(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                className="sr-only"
              />
              <span className="w-3 h-3 rounded border flex items-center justify-center">
                {filters[item.id as keyof typeof filters] && (
                  <span className="text-[10px]">✓</span>
                )}
              </span>
              {item.label}
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Tooltip component
  const renderTooltip = () => {
    if (!hoveredItem) return null;
    
    const data = hoveredItem.data;
    const typeLabels: Record<string, string> = {
      todo: '待办',
      task: '任务',
      plan: '计划',
      target: '目标',
      milestone: '里程碑',
    };
    
    return (
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]"
        style={{ 
          left: hoverPosition.x + 10, 
          top: hoverPosition.y + 10,
          pointerEvents: 'none'
        }}
      >
        <div className="font-medium text-sm mb-2" style={{ color: '#134E4A' }}>
          {typeLabels[hoveredItem.type]}详情
        </div>
        <div className="text-sm font-medium">{'title' in data ? data.title : ''}</div>
        {'description' in data && data.description && (
          <div className="text-xs text-gray-500 mt-1">{data.description}</div>
        )}
        {'status' in data && (
          <div className="text-xs mt-2">
            状态: <span className={`px-1.5 py-0.5 rounded ${
              data.status === 'done' || data.status === 'completed' ? 'bg-green-100 text-green-700' :
              data.status === 'in-progress' || data.status === 'active' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-600'
            }`}>{data.status}</span>
          </div>
        )}
        {'progress' in data && (
          <div className="mt-2">
            <div className="text-xs text-gray-500">进度: {data.progress}%</div>
            <div className="w-full h-1.5 bg-gray-200 rounded mt-1">
              <div className="h-full bg-teal-500 rounded" style={{ width: `${data.progress}%` }}></div>
            </div>
          </div>
        )}
        {'due_date' in data && data.due_date && (
          <div className="text-xs text-gray-500 mt-1">📅 {data.due_date}</div>
        )}
        {'start_date' in data && data.start_date && (
          <div className="text-xs text-gray-500">开始: {data.start_date}</div>
        )}
        {'end_date' in data && data.end_date && (
          <div className="text-xs text-gray-500">结束: {data.end_date}</div>
        )}
      </div>
    );
  };

  // ========== LIST VIEW ==========
  const renderListView = () => (
    <div className="space-y-6">
      {/* Plans with Tasks */}
      {filters.plan && (
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>🚀 计划 (Plans)</h3>
          {plans.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无计划</p>
          ) : (
            <div className="space-y-4">
              {plans.map(plan => (
                <div key={plan.id} className="border-l-4 border-teal-400 pl-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{plan.title}</div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      plan.status === 'active' ? 'bg-teal-100 text-teal-700' :
                      plan.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{plan.status}</span>
                  </div>
                  {plan.description && <p className="text-sm text-gray-500 mt-1">{plan.description}</p>}
                  {plan.start_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      📅 {plan.start_date} {plan.end_date && `~ ${plan.end_date}`}
                    </p>
                  )}
                  {/* Tasks under plan */}
                  {filters.task && (tasks[plan.id] || []).length > 0 && (
                    <div className="mt-2 pl-4 space-y-2">
                      {(tasks[plan.id] || []).map(task => (
                        <div key={task.id} className="flex items-center gap-2 text-sm">
                          <span className={`w-2 h-2 rounded-full ${
                            task.status === 'done' ? 'bg-green-500' :
                            task.status === 'in-progress' ? 'bg-orange-500' :
                            'bg-gray-300'
                          }`}></span>
                          <span className={task.status === 'done' ? 'line-through text-gray-400' : ''}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Targets with Steps */}
      {filters.target && (
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>🎯 目标 (Targets)</h3>
          {targets.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无目标</p>
          ) : (
            <div className="space-y-4">
              {targets.map(target => (
                <div key={target.id} className="border-l-4 border-orange-400 pl-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{target.title}</div>
                    <span className="text-orange-500 font-medium">{target.progress}%</span>
                  </div>
                  {target.description && <p className="text-sm text-gray-500 mt-1">{target.description}</p>}
                  {target.due_date && <p className="text-xs text-gray-400 mt-1">📅 {target.due_date}</p>}
                  <ProgressBar value={target.progress} color="orange" size="sm" className="mt-2" />
                  {/* Steps under target */}
                  {(targetSteps[target.id] || []).length > 0 && (
                    <div className="mt-2 pl-4 space-y-2">
                      {(targetSteps[target.id] || []).map(step => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          <span className={`w-2 h-2 rounded-full ${
                            step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`}></span>
                          <span className={step.status === 'completed' ? 'line-through text-gray-400' : ''}>
                            {step.title}
                          </span>
                          <span className="text-xs bg-gray-200 px-1 rounded">{step.weight}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Standalone Todos - hide completed */}
      {filters.todo && (
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>✅ 待办 (Todos)</h3>
          {todos.filter(t => t.status !== 'done').length === 0 ? (
            <p className="text-gray-400 text-sm">暂无待办</p>
          ) : (
            <div className="space-y-2">
              {todos.filter(t => t.status !== 'done').map(todo => (
                <div key={todo.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <span className={`w-2 h-2 rounded-full ${
                    todo.status === 'done' ? 'bg-green-500' :
                    todo.status === 'in-progress' ? 'bg-orange-500' :
                    'bg-gray-300'
                  }`}></span>
                  <span className={todo.status === 'done' ? 'line-through text-gray-400 flex-1' : 'flex-1'}>
                    {todo.title}
                  </span>
                  {todo.due_date && <span className="text-xs text-gray-500">📅 {todo.due_date}</span>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Milestones */}
      {filters.milestone && (
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>🏁 里程碑 (Milestones)</h3>
          {milestones.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无里程碑</p>
          ) : (
            <div className="space-y-2">
              {milestones.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <span className={`w-2 h-2 rounded-full ${
                    m.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  <span className="flex-1">{m.title}</span>
                  <span className="text-xs text-gray-500">{m.progress}%</span>
                  {m.target_date && <span className="text-xs text-gray-500">📅 {m.target_date}</span>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );

  // ========== BOARD VIEW ==========
  const renderBoardView = () => {
    const columns = [
      { id: 'pending', label: '待处理', color: 'gray' },
      { id: 'in-progress', label: '进行中', color: 'orange' },
      { id: 'done', label: '已完成', color: 'green' },
    ];

    const getItemsByStatus = (status: string) => {
      const items: { type: string; data: Todo | Task | Plan | Target | Milestone }[] = [];
      
      if (filters.todo) todos.filter(t => t.status === status).forEach(t => items.push({ type: 'todo', data: t }));
      if (filters.task) Object.values(tasks).flat().filter(t => t.status === status).forEach(t => items.push({ type: 'task', data: t }));
      if (filters.plan) plans.filter(p => p.status === (status === 'done' ? 'completed' : status === 'pending' ? 'active' : 'active'))
        .forEach(p => items.push({ type: 'plan', data: p }));
      if (filters.target) targets.filter(t => t.status === (status === 'done' ? 'completed' : status === 'pending' ? 'active' : 'active'))
        .forEach(t => items.push({ type: 'target', data: t }));
      if (filters.milestone) milestones.filter(m => m.status === (status === 'done' ? 'completed' : 'pending'))
        .forEach(m => items.push({ type: 'milestone', data: m }));

      return items;
    };

    const handleMouseEnter = (e: React.MouseEvent, item: { type: string; data: Todo | Task | Plan | Target | Milestone }) => {
      setHoveredItem(item);
      setHoverPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
      setHoveredItem(null);
    };

    return (
      <div className="relative">
        {renderTooltip()}
        <div className="grid grid-cols-3 gap-4">
          {columns.map(col => (
            <div key={col.id} className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: `#${col.color === 'gray' ? '6B7280' : col.color === 'orange' ? 'F97316' : '22C55E'}` }}>
                <span className={`w-3 h-3 rounded-full bg-${col.color}-500`}></span>
                {col.label}
                <span className="ml-auto text-sm text-gray-500">{getItemsByStatus(col.id).length}</span>
              </h3>
              <div className="space-y-1.5">
                {getItemsByStatus(col.id).map((item, idx) => (
                  <div
                    key={`${item.type}-${idx}`}
                    onMouseEnter={(e) => handleMouseEnter(e, item)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Card className="p-2 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] px-1 py-0.5 rounded ${
                          item.type === 'todo' ? 'bg-blue-100 text-blue-700' :
                          item.type === 'task' ? 'bg-teal-100 text-teal-700' :
                          item.type === 'plan' ? 'bg-purple-100 text-purple-700' :
                          item.type === 'target' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{item.type}</span>
                      </div>
                      <div className="font-medium text-xs">
                        {'title' in item.data ? item.data.title : ''}
                      </div>
                      {'progress' in item.data && (
                        <div className="mt-1.5">
                          <ProgressBar value={item.data.progress} color={col.color === 'green' ? 'teal' : col.color as 'gray' | 'orange' | 'teal'} size="sm" />
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
                {getItemsByStatus(col.id).length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">无</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ========== CALENDAR VIEW ==========
  const renderCalendarView = () => {
    const currentMonth = calendarDate.getMonth();
    const currentYear = calendarDate.getFullYear();
    
    let firstDay = new Date(currentYear, currentMonth, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    
    const getItemsForDay = (day: number) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const items: { type: string; data: Todo | Task | Plan | Target | Milestone }[] = [];
      
      if (filters.todo) todos.filter(t => t.due_date === dateStr).forEach(t => items.push({ type: 'todo', data: t }));
      if (filters.task) Object.values(tasks).flat().filter(t => t.end_date === dateStr).forEach(t => items.push({ type: 'task', data: t }));
      if (filters.target) targets.filter(t => t.due_date === dateStr).forEach(t => items.push({ type: 'target', data: t }));
      if (filters.milestone) milestones.filter(m => m.target_date === dateStr).forEach(m => items.push({ type: 'milestone', data: m }));
      
      return items;
    };

    const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
    const today = new Date();

    const prevMonth = () => setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCalendarDate(new Date(currentYear, currentMonth + 1, 1));

    const handleMouseEnter = (e: React.MouseEvent, item: { type: string; data: Todo | Task | Plan | Target | Milestone }) => {
      setHoveredItem(item);
      setHoverPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
      setHoveredItem(null);
    };

    const isWeekend = (day: number) => {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    };

    return (
      <div className="relative">
        {renderTooltip()}
        <div className="flex items-center justify-center mb-4 gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">◀️</button>
          <h3 className="text-xl font-semibold" style={{ color: '#134E4A' }}>
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">▶️</button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, i) => (
            <div key={day} className={`text-center text-sm font-medium py-2 ${i >= 5 ? 'text-red-500' : 'text-gray-500'}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-28 bg-gray-50 rounded"></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const items = getItemsForDay(day);
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const isWeekendDay = isWeekend(day);
            
            return (
              <div key={day} className={`h-28 p-1 border rounded transition-colors ${
                isToday ? 'bg-teal-50 border-teal-300' : isWeekendDay ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-200'
              }`}>
                <div className={`text-sm font-medium ${isToday ? 'text-teal-600' : isWeekendDay ? 'text-red-500' : 'text-gray-700'}`}>
                  {day}
                </div>
                <div className="mt-1 space-y-1 overflow-y-auto max-h-18">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 ${
                        item.type === 'todo' ? 'bg-blue-100 text-blue-700' :
                        item.type === 'task' ? 'bg-teal-100 text-teal-700' :
                        item.type === 'target' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}
                      onMouseEnter={(e) => handleMouseEnter(e, item)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {'title' in item.data ? item.data.title : ''}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100"></span><span className="text-xs text-gray-600">待办</span></div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-100"></span><span className="text-xs text-gray-600">任务</span></div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100"></span><span className="text-xs text-gray-600">目标</span></div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-100"></span><span className="text-xs text-gray-600">里程碑</span></div>
          <div className="flex items-center gap-1 ml-4"><span className="w-3 h-3 rounded bg-red-50 border border-red-100"></span><span className="text-xs text-gray-600">周末</span></div>
        </div>
      </div>
    );
  };

  // ========== GANTT/TIMELINE VIEW ==========
  const renderGanttView = () => {
    const today = new Date();
    const monthsToShow = ganttZoom;
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + monthsToShow - 1, 0);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const months: { label: string; startPercent: number; widthPercent: number }[] = [];
    let currentMonth = startDate.getMonth();
    let currentYear = startDate.getFullYear();
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    while (currentYear < today.getFullYear() + 2 || (currentYear === today.getFullYear() + 1 && currentMonth <= endDate.getMonth())) {
      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth + 1, 0);
      
      const startPercent = Math.max(0, (monthStart.getTime() - startDate.getTime()) / (totalDays * 24 * 60 * 60 * 1000) * 100);
      const endPercent = Math.min(100, (monthEnd.getTime() - startDate.getTime()) / (totalDays * 24 * 60 * 60 * 1000) * 100);
      
      months.push({
        label: monthNames[currentMonth],
        startPercent,
        widthPercent: endPercent - startPercent,
      });
      
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    const getPosition = (dateStr: string | null) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      const days = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (days < 0 || days > totalDays) return null;
      return (days / totalDays) * 100;
    };

    const getWidth = (startDateStr: string | null, endDateStr: string | null) => {
      if (!startDateStr || !endDateStr) return null;
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (days <= 0) return null;
      return (days / totalDays) * 100;
    };

    const isToday = (dateStr: string | null | undefined) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return date.toDateString() === today.toDateString();
    };

    const allItems: { type: string; title: string; start?: string | null; end?: string | null; due?: string | null; status: string; progress?: number }[] = [];
    
    if (filters.plan) {
      plans.forEach(p => {
        const pos = getPosition(p.start_date);
        if (pos !== null) {
          allItems.push({
            type: 'plan',
            title: p.title,
            start: p.start_date,
            end: p.end_date,
            status: p.status,
            progress: 100,
          });
        }
      });
    }
    
    if (filters.target) {
      targets.forEach(t => {
        const pos = getPosition(t.due_date);
        if (pos !== null) {
          allItems.push({
            type: 'target',
            title: t.title,
            due: t.due_date,
            status: t.status,
            progress: t.progress,
          });
        }
      });
    }
    
    if (filters.todo) {
      todos.filter(t => t.due_date).forEach(t => {
        const pos = getPosition(t.due_date);
        if (pos !== null) {
          allItems.push({
            type: 'todo',
            title: t.title,
            due: t.due_date,
            status: t.status,
          });
        }
      });
    }
    
    if (filters.milestone) {
      milestones.filter(m => m.target_date).forEach(m => {
        const pos = getPosition(m.target_date);
        if (pos !== null) {
          allItems.push({
            type: 'milestone',
            title: m.title,
            due: m.target_date,
            status: m.status,
            progress: m.progress,
          });
        }
      });
    }

    const getTypeColor = (type: string, status: string) => {
      const completed = status === 'done' || status === 'completed';
      if (type === 'plan') return completed ? 'bg-purple-500' : 'bg-purple-400';
      if (type === 'target') return completed ? 'bg-orange-500' : 'bg-orange-400';
      if (type === 'todo') return completed ? 'bg-blue-500' : 'bg-blue-400';
      if (type === 'milestone') return completed ? 'bg-pink-500' : 'bg-pink-400';
      return 'bg-gray-400';
    };

    const timelineWidth = Math.max(800, 100 * ganttZoom);

    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4 px-2">
          <span className="text-xs text-gray-500">显示范围:</span>
          <input
            type="range"
            min="1"
            max="12"
            value={ganttZoom}
            onChange={(e) => setGanttZoom(Number(e.target.value))}
            className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <span className="text-xs text-gray-600 w-12">{ganttZoom} 个月</span>
        </div>

        <div className="overflow-hidden">
          <div style={{ width: `${timelineWidth}px` }}>
            <div className="relative h-8 border-b border-gray-300 mb-2">
              {months.map((month, i) => (
                <div 
                  key={i}
                  className="absolute text-xs text-gray-600 border-l border-gray-300 pl-1 font-medium"
                  style={{ left: `${month.startPercent}%`, width: `${month.widthPercent}%` }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            <div className="relative space-y-1">
              {allItems.map((item, idx) => {
                const startPos = item.start ? getPosition(item.start) : (item.due ? getPosition(item.due) : null);
                const width = item.start && item.end ? getWidth(item.start, item.end) : 5;
                
                if (startPos === null) return null;
                
                return (
                  <div key={`${item.type}-${idx}`} className="flex items-center h-6 group">
                    <div className="w-28 flex-shrink-0 text-xs truncate pr-2 text-gray-600">{item.title}</div>
                    <div className="flex-1 h-full relative">
                      <div 
                        className={`absolute h-4 top-1 rounded-sm ${getTypeColor(item.type, item.status)}`}
                        style={{ left: `${startPos}%`, width: `${Math.max(width || 3, 3)}%`, minWidth: '16px' }}
                      >
                        {item.progress !== undefined && item.progress < 100 && (
                          <div className="absolute h-full bg-white/30 rounded-sm" style={{ width: `${100 - item.progress}%`, right: 0 }}></div>
                        )}
                      </div>
                      {isToday(item.start || item.due) && (
                        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${startPos}%` }}></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center mt-4 text-xs text-gray-500">
              <div className="w-28 flex-shrink-0">📅 今日</div>
              <div className="flex-1 relative h-4">
                <div 
                  className="absolute w-0.5 bg-red-500 top-0 bottom-0 flex flex-col items-center"
                  style={{ left: `${(today.getTime() - startDate.getTime()) / (totalDays * 24 * 60 * 60 * 1000) * 100}%` }}
                >
                  <span className="text-red-500 -mt-4 text-[10px] whitespace-nowrap">今天</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-400"></span><span className="text-gray-600">计划</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400"></span><span className="text-gray-600">目标</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400"></span><span className="text-gray-600">待办</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-400"></span><span className="text-gray-600">里程碑</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-red-500"></span><span className="text-gray-600">今日</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4" style={{ color: '#134E4A' }}>视图查看</h2>
      
      <div className="flex gap-2 mb-4">
        {viewModes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id as typeof viewMode)}
            className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
              viewMode === mode.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200'
            }`}
          >
            <span>{mode.icon}</span>
            <span className="text-sm font-medium" style={{ color: viewMode === mode.id ? '#0D9488' : '#374151' }}>
              {mode.label}
            </span>
          </button>
        ))}
      </div>

      {renderFilters()}

      <Card>
        {viewMode === 'list' && renderListView()}
        {viewMode === 'board' && renderBoardView()}
        {viewMode === 'calendar' && renderCalendarView()}
        {viewMode === 'gantt' && renderGanttView()}
      </Card>
    </div>
  );
}
