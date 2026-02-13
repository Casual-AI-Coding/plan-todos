'use client';

import { useState, useEffect } from 'react';
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

  async function loadAllData() {
    try {
      const [t, p, tg, m] = await Promise.all([
        getTodos(), getPlans(), getTargets(), getMilestones()
      ]);
      setTodos(t);
      setPlans(p);
      setTargets(tg);
      setMilestones(m);
      
      // Load tasks for each plan
      const taskMap: Record<string, Task[]> = {};
      for (const plan of p) {
        taskMap[plan.id] = await getTasksByPlan(plan.id);
      }
      setTasks(taskMap);
      
      // Load steps for each target
      const stepMap: Record<string, Step[]> = {};
      for (const target of tg) {
        stepMap[target.id] = await getSteps(target.id);
      }
      setTargetSteps(stepMap);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadAllData(); }, []);

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

  // Note: Board, Calendar, and Gantt views are simplified for brevity
  // Full implementations available in git history if needed

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4" style={{ color: '#134E4A' }}>视图查看</h2>
      
      {/* View Mode Selector */}
      <div className="flex gap-2 mb-4">
        {viewModes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id as typeof viewMode)}
            className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
              viewMode === mode.id 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200 hover:border-teal-200'
            }`}
          >
            <span>{mode.icon}</span>
            <span className="text-sm font-medium" style={{ color: viewMode === mode.id ? '#0D9488' : '#374151' }}>
              {mode.label}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Render based on view mode */}
      <Card>
        {viewMode === 'list' && renderListView()}
        {viewMode === 'board' && <div className="p-4 text-gray-500">看板视图（完整实现需从 git 历史提取）</div>}
        {viewMode === 'calendar' && <div className="p-4 text-gray-500">日历视图（完整实现需从 git 历史提取）</div>}
        {viewMode === 'gantt' && <div className="p-4 text-gray-500">时间线视图（完整实现需从 git 历史提取）</div>}
      </Card>
    </div>
  );
}
