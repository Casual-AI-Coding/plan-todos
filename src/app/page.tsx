'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, Button, Modal, Input, ProgressBar, Checkbox } from '@/components/ui';
import { 
  getTodos, getPlans, getTargets, getMilestones,
  createTodo, updateTodo, deleteTodo,
  createPlan, updatePlan, deletePlan,
  createTarget, deleteTarget,
  createMilestone, updateMilestone, deleteMilestone,
  getTasksByPlan, createTask, updateTask, deleteTask,
  getSteps, createStep, updateStep, deleteStep,
  Todo, Plan, Task, Target, Step, Milestone
} from '@/lib/api';

// Dashboard View
function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);

  async function loadData() {
    try {
      const [todosData, plansData, targetsData] = await Promise.all([
        getTodos(),
        getPlans(),
        getTargets(),
      ]);
      setTodos(todosData);
      setPlans(plansData);
      setTargets(targetsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const todayTodos = todos.filter(t => t.due_date?.startsWith(today));
  const upcomingTodos = todos.filter(t => t.due_date && t.due_date > today && t.due_date <= threeDaysLater);
  const completedToday = todos.filter(t => t.status === 'done' && t.updated_at.startsWith(today));
  const activePlans = plans.filter(p => p.status === 'active');
  const activeTargets = targets.filter(t => t.status === 'active');

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>
        今日总览
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{todayTodos.length}</div>
          <div className="text-sm text-gray-500 mt-1">今日待办</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-500">{upcomingTodos.length}</div>
          <div className="text-sm text-gray-500 mt-1">即将到期 (3天内)</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{completedToday.length}</div>
          <div className="text-sm text-gray-500 mt-1">今日完成</div>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>今日待办</h3>
        {todayTodos.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无今日待办</p>
        ) : (
          <div className="space-y-2">
            {todayTodos.map(todo => (
              <div key={todo.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <Checkbox checked={todo.status === 'done'} readOnly />
                <span className={todo.status === 'done' ? 'line-through text-gray-400' : ''}>
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Active Plans & Targets */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>进行中的计划</h3>
          {activePlans.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无进行中的计划</p>
          ) : (
            <div className="space-y-3">
              {activePlans.slice(0, 3).map(plan => (
                <div key={plan.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{plan.title}</span>
                  </div>
                  <ProgressBar value={0} color="teal" size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>进行中的目标</h3>
          {activeTargets.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无进行中的目标</p>
          ) : (
            <div className="space-y-3">
              {activeTargets.slice(0, 3).map(target => (
                <div key={target.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{target.title}</span>
                    <span className="text-teal-600">{target.progress}%</span>
                  </div>
                  <ProgressBar value={target.progress} color="orange" size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Todos View
function TodosView() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');

  async function loadTodos() {
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadTodos(); }, []);

  const filteredTodos = todos.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    if (filter === 'today') return t.due_date?.startsWith(today);
    if (filter === 'upcoming') return t.due_date && t.due_date > today;
    if (filter === 'completed') return t.status === 'done';
    return true;
  });

  async function handleSubmit() {
    if (!title.trim()) return;
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, { title, content: content || undefined, due_date: dueDate || undefined });
      } else {
        await createTodo({ title, content: content || undefined, due_date: dueDate || undefined });
      }
      setShowForm(false);
      setEditingTodo(null);
      setTitle('');
      setContent('');
      setDueDate('');
      loadTodos();
    } catch (e) { console.error(e); }
  }

  async function handleToggle(todo: Todo) {
    const next = todo.status === 'done' ? 'pending' : 'done';
    await updateTodo(todo.id, { status: next });
    loadTodos();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete?')) return;
    await deleteTodo(id);
    loadTodos();
  }

  const filters = [
    { id: 'all', label: '全部' },
    { id: 'today', label: '今日' },
    { id: 'upcoming', label: '即将到期' },
    { id: 'completed', label: '已完成' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>TODOS</h2>
        <Button onClick={() => setShowForm(true)}>+ 新建</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id 
                ? 'bg-teal-100 text-teal-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredTodos.map(todo => (
          <Card key={todo.id} hoverable onClick={() => { setEditingTodo(todo); setTitle(todo.title); setContent(todo.content || ''); setDueDate(todo.due_date || ''); setShowForm(true); }}>
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={todo.status === 'done'} 
                onChange={() => handleToggle(todo)}
                onClick={e => e.stopPropagation()}
              />
              <div className="flex-1">
                <div className={todo.status === 'done' ? 'line-through text-gray-400' : ''}>
                  {todo.title}
                </div>
                {todo.due_date && (
                  <div className="text-xs text-gray-500 mt-1">
                    📅 {new Date(todo.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(todo.id); }}
                className="text-gray-400 hover:text-red-500 px-2"
              >
                🗑️
              </button>
            </div>
          </Card>
        ))}
        {filteredTodos.length === 0 && (
          <p className="text-gray-400 text-center py-8">暂无数据</p>
        )}
      </div>

      {/* Modal */}
      <Modal 
        open={showForm} 
        title={editingTodo ? '编辑 Todo' : '新建 Todo'} 
        onClose={() => { setShowForm(false); setEditingTodo(null); setTitle(''); setContent(''); setDueDate(''); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingTodo(null); setTitle(''); setContent(''); setDueDate(''); }}>取消</Button>
            <Button onClick={handleSubmit}>{editingTodo ? '保存' : '创建'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="标题" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="输入任务标题..."
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="输入任务内容..."
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={3}
            />
          </div>
          <Input 
            label="截止日期" 
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

// Plans View
function PlansView() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function loadPlans() {
    try {
      const data = await getPlans();
      setPlans(data);
      // Load tasks for each plan
      const taskMap: Record<string, Task[]> = {};
      for (const plan of data) {
        taskMap[plan.id] = await getTasksByPlan(plan.id);
      }
      setTasks(taskMap);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadPlans(); }, []);

  async function togglePlan(planId: string) {
    setExpandedPlans(prev => {
      const next = new Set(prev);
      if (next.has(planId)) next.delete(planId);
      else next.add(planId);
      return next;
    });
  }

  async function handleSubmitPlan() {
    if (!title.trim()) return;
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, { title, description: description || undefined, start_date: startDate || undefined, end_date: endDate || undefined });
      } else {
        await createPlan({ title, description: description || undefined, start_date: startDate || undefined, end_date: endDate || undefined });
      }
      setShowForm(false);
      setEditingPlan(null);
      setTitle(''); setDescription(''); setStartDate(''); setEndDate('');
      loadPlans();
    } catch (e) { console.error(e); }
  }

  async function handleSubmitTask() {
    if (!title.trim() || !selectedPlanId) return;
    try {
      await createTask({ plan_id: selectedPlanId, title, start_date: startDate || undefined, end_date: endDate || undefined });
      setShowTaskForm(false);
      setTitle(''); setStartDate(''); setEndDate('');
      loadPlans();
    } catch (e) { console.error(e); }
  }

  async function handleDeletePlan(id: string) {
    if (!confirm('Delete plan and all tasks?')) return;
    await deletePlan(id);
    loadPlans();
  }

  async function handleDeleteTask(id: string) {
    await deleteTask(id);
    loadPlans();
  }

  async function handleToggleTask(task: Task) {
    const next = task.status === 'done' ? 'pending' : 'done';
    await updateTask(task.id, { status: next });
    loadPlans();
  }

  // Calculate progress for plan
  const getPlanProgress = (planId: string) => {
    const planTasks = tasks[planId] || [];
    if (planTasks.length === 0) return 0;
    const doneCount = planTasks.filter(t => t.status === 'done').length;
    return Math.round((doneCount / planTasks.length) * 100);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>PLANS</h2>
        <Button onClick={() => setShowForm(true)}>+ 新建 Plan</Button>
      </div>

      <div className="space-y-4">
        {plans.filter(p => p.status !== 'archived').map(plan => {
          const progress = getPlanProgress(plan.id);
          const planTasks = tasks[plan.id] || [];
          const doneCount = planTasks.filter(t => t.status === 'done').length;
          
          return (
            <Card key={plan.id}>
              <div onClick={() => togglePlan(plan.id)} className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{expandedPlans.has(plan.id) ? '▼' : '▶'}</span>
                    <span className="font-semibold" style={{ color: '#134E4A' }}>{plan.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-teal-600 text-sm">{progress}%</span>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedPlanId(plan.id); setShowTaskForm(true); }} className="text-teal-600 hover:bg-teal-50 px-2 py-1 rounded text-sm">+ Task</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }} className="text-gray-400 hover:text-red-500 px-2">🗑️</button>
                  </div>
                </div>
                <ProgressBar value={progress} color="teal" size="sm" className="mt-2" />
                <div className="text-xs text-gray-500 mt-1">
                  {plan.start_date && `📅 ${plan.start_date}`} {plan.start_date && plan.end_date && '~'} {plan.end_date || '进行中'} 
                  {planTasks.length > 0 && <span className="ml-2">({doneCount}/{planTasks.length} Task)</span>}
                </div>
                {expandedPlans.has(plan.id) && (
                  <div className="mt-4 pl-6 space-y-2 border-l-2 border-teal-200 ml-4">
                    {planTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <Checkbox checked={task.status === 'done'} onChange={() => handleToggleTask(task)} />
                        <span className={task.status === 'done' ? 'line-through text-gray-400 flex-1' : 'flex-1'}>{task.title}</span>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
                      </div>
                    ))}
                    {planTasks.length === 0 && (
                      <p className="text-gray-400 text-sm">暂无任务</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {plans.filter(p => p.status !== 'archived').length === 0 && (
          <p className="text-gray-400 text-center py-8">暂无计划</p>
        )}
      </div>

      {/* Plan Modal */}
      <Modal open={showForm} title={editingPlan ? '编辑 Plan' : '新建 Plan'} onClose={() => { setShowForm(false); setEditingPlan(null); setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); }}
        footer={<><Button variant="secondary" onClick={() => { setShowForm(false); setEditingPlan(null); }}>取消</Button><Button onClick={handleSubmitPlan}>{editingPlan ? '保存' : '创建'}</Button></>}>
        <div className="space-y-4">
          <Input label="标题" value={title} onChange={e => setTitle(e.target.value)} placeholder="计划标题..." autoFocus />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="开始日期" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input label="结束日期" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* Task Modal */}
      <Modal open={showTaskForm} title="新建 Task" onClose={() => { setShowTaskForm(false); setTitle(''); setStartDate(''); setEndDate(''); }}
        footer={<><Button variant="secondary" onClick={() => { setShowTaskForm(false); setTitle(''); }}>取消</Button><Button onClick={handleSubmitTask}>创建</Button></>}>
        <div className="space-y-4">
          <Input label="标题" value={title} onChange={e => setTitle(e.target.value)} placeholder="任务标题..." autoFocus />
          <div className="grid grid-cols-2 gap-4">
            <Input label="开始日期" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input label="结束日期" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Goals View (Target/Step)
function GoalsView() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [steps, setSteps] = useState<Record<string, Step[]>>({});
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [showStepForm, setShowStepForm] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState(0);

  async function loadTargets() {
    try {
      const data = await getTargets();
      setTargets(data);
      const stepMap: Record<string, Step[]> = {};
      for (const target of data) {
        stepMap[target.id] = await getSteps(target.id);
      }
      setSteps(stepMap);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadTargets(); }, []);

  async function toggleTarget(targetId: string) {
    setExpandedTargets(prev => {
      const next = new Set(prev);
      if (next.has(targetId)) next.delete(targetId);
      else next.add(targetId);
      return next;
    });
  }

  async function handleSubmitTarget() {
    if (!title.trim()) return;
    try {
      await createTarget({ title, description: description || undefined, due_date: dueDate || undefined });
      setShowForm(false);
      setTitle(''); setDescription(''); setDueDate('');
      loadTargets();
    } catch (e) { console.error(e); }
  }

  async function handleSubmitStep() {
    if (!title.trim() || !selectedTargetId) return;
    try {
      await createStep({ target_id: selectedTargetId, title, weight });
      setShowStepForm(false);
      setTitle(''); setWeight(0);
      loadTargets();
    } catch (e: unknown) { 
      alert(e instanceof Error ? e.message : 'Weight would exceed 100%'); 
    }
  }

  async function handleDeleteTarget(id: string) {
    if (!confirm('Delete target and all steps?')) return;
    await deleteTarget(id);
    loadTargets();
  }

  async function handleDeleteStep(id: string) {
    await deleteStep(id);
    loadTargets();
  }

  async function handleToggleStep(step: Step) {
    const next = step.status === 'completed' ? 'pending' : 'completed';
    await updateStep(step.id, { status: next });
    loadTargets();
  }

  // Calculate total weight
  const getTotalWeight = (targetId: string) => {
    const targetSteps = steps[targetId] || [];
    return targetSteps.reduce((sum, s) => sum + s.weight, 0);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>GOALS</h2>
        <Button onClick={() => setShowForm(true)}>+ 新建 Target</Button>
      </div>

      <div className="space-y-4">
        {targets.filter(t => t.status !== 'archived').map(target => {
          const totalWeight = getTotalWeight(target.id);
          const targetSteps = steps[target.id] || [];
          
          return (
            <Card key={target.id}>
              <div onClick={() => toggleTarget(target.id)} className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{expandedTargets.has(target.id) ? '▼' : '▶'}</span>
                    <span className="font-semibold" style={{ color: '#134E4A' }}>{target.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-orange-500 font-medium">{target.progress}%</span>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedTargetId(target.id); setShowStepForm(true); }} className="text-orange-500 hover:bg-orange-50 px-2 py-1 rounded text-sm">+ Step</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTarget(target.id); }} className="text-gray-400 hover:text-red-500 px-2">🗑️</button>
                  </div>
                </div>
                <ProgressBar value={target.progress} color="orange" size="sm" className="mt-2" />
                <div className="text-xs text-gray-500 mt-1">
                  权重总和: {totalWeight}/100
                  {target.due_date && <span className="ml-2">📅 {target.due_date}</span>}
                </div>
                {expandedTargets.has(target.id) && (
                  <div className="mt-4 pl-6 space-y-2 border-l-2 border-orange-200 ml-4">
                    {targetSteps.map(step => (
                      <div key={step.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <Checkbox checked={step.status === 'completed'} onChange={() => handleToggleStep(step)} />
                        <span className="flex-1">{step.title}</span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{step.weight}%</span>
                        <button onClick={() => handleDeleteStep(step.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
                      </div>
                    ))}
                    {targetSteps.length === 0 && (
                      <p className="text-gray-400 text-sm">暂无步骤</p>
                    )}
                    {totalWeight < 100 && (
                      <p className="text-xs text-orange-500 mt-2">剩余可用权重: {100 - totalWeight}%</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {targets.filter(t => t.status !== 'archived').length === 0 && (
          <p className="text-gray-400 text-center py-8">暂无目标</p>
        )}
      </div>

      <Modal open={showForm} title="新建 Target" onClose={() => { setShowForm(false); setTitle(''); setDescription(''); setDueDate(''); }}
        footer={<><Button variant="secondary" onClick={() => setShowForm(false)}>取消</Button><Button onClick={handleSubmitTarget}>创建</Button></>}>
        <div className="space-y-4">
          <Input label="标题" value={title} onChange={e => setTitle(e.target.value)} placeholder="目标标题..." autoFocus />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={3} /></div>
          <Input label="截止日期" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </Modal>

      <Modal open={showStepForm} title="新建 Step" onClose={() => { setShowStepForm(false); setTitle(''); setWeight(0); }}
        footer={<><Button variant="secondary" onClick={() => setShowStepForm(false)}>取消</Button><Button onClick={handleSubmitStep}>创建</Button></>}>
        <div className="space-y-4">
          <Input label="标题" value={title} onChange={e => setTitle(e.target.value)} placeholder="步骤标题..." autoFocus />
          <Input label="权重 (%)" type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
        </div>
      </Modal>
    </div>
  );
}

// Milestones View
function MilestonesView() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [linkType, setLinkType] = useState<'plan' | 'target'>('plan');
  const [linkId, setLinkId] = useState('');

  async function loadData() {
    try {
      const [m, p, t] = await Promise.all([getMilestones(), getPlans(), getTargets()]);
      setMilestones(m);
      setPlans(p);
      setTargets(t);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSubmit() {
    if (!title.trim() || !linkId) return;
    try {
      await createMilestone({ 
        title, 
        target_date: targetDate || undefined,
        plan_id: linkType === 'plan' ? linkId : undefined,
        target_id: linkType === 'target' ? linkId : undefined,
      });
      setShowForm(false);
      setTitle(''); setTargetDate(''); setLinkId('');
      loadData();
    } catch (e: unknown) { 
      alert(e instanceof Error ? e.message : 'Failed to create milestone'); 
    }
  }

  async function handleDelete(id: string) {
    await deleteMilestone(id);
    loadData();
  }

  async function handleToggle(m: Milestone) {
    const next = m.status === 'completed' ? 'pending' : 'completed';
    await updateMilestone(m.id, { status: next });
    loadData();
  }

  const getLinkLabel = (m: Milestone) => {
    if (m.plan_id) return `🚀 ${plans.find(p => p.id === m.plan_id)?.title || 'Plan'}`;
    if (m.target_id) return `🎯 ${targets.find(t => t.id === m.target_id)?.title || 'Target'}`;
    return '未关联';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>MILESTONES</h2>
        <Button onClick={() => setShowForm(true)}>+ 新建</Button>
      </div>

      <div className="space-y-4">
        {milestones.map(m => (
          <Card key={m.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold" style={{ color: '#134E4A' }}>{m.title}</div>
                <div className="text-sm text-gray-500 mt-1">{getLinkLabel(m)}</div>
                {m.target_date && <div className="text-xs text-gray-400 mt-1">目标日期: {m.target_date}</div>}
                <ProgressBar value={m.progress} color="teal" size="sm" className="mt-2" />
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm px-2 py-1 rounded ${m.status === 'completed' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                  {m.status === 'completed' ? '已完成' : '进行中'}
                </span>
                <button onClick={() => handleToggle(m)} className="text-teal-600 hover:bg-teal-50 px-2 py-1 rounded text-sm">
                  {m.status === 'completed' ? '↩️' : '✅'}
                </button>
                <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
              </div>
            </div>
          </Card>
        ))}
        {milestones.length === 0 && <p className="text-gray-400 text-center py-8">暂无里程碑</p>}
      </div>

      <Modal open={showForm} title="新建 Milestone" onClose={() => { setShowForm(false); setTitle(''); setTargetDate(''); setLinkId(''); }}
        footer={<><Button variant="secondary" onClick={() => setShowForm(false)}>取消</Button><Button onClick={handleSubmit}>创建</Button></>}>
        <div className="space-y-4">
          <Input label="标题" value={title} onChange={e => setTitle(e.target.value)} placeholder="里程碑标题..." autoFocus />
          <Input label="目标日期" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联类型</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="linkType" checked={linkType === 'plan'} onChange={() => { setLinkType('plan'); setLinkId(''); }} />
                <span>Plan</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="linkType" checked={linkType === 'target'} onChange={() => { setLinkType('target'); setLinkId(''); }} />
                <span>Target</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择{linkType === 'plan' ? '计划' : '目标'}</label>
            <select value={linkId} onChange={e => setLinkId(e.target.value)} className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">请选择...</option>
              {linkType === 'plan' ? plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>) : targets.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Views View - 视图切换和自定义视图
function ViewsView() {
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
        <div className="text-sm font-medium">{('title' in data) ? data.title : ''}</div>
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
              <div 
                className="h-full bg-teal-500 rounded" 
                style={{ width: `${data.progress}%` }}
              ></div>
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
    
    // Calculate first day of month (0 = Sunday, adjust for Monday start)
    let firstDay = new Date(currentYear, currentMonth, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday=0 to Monday=0
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    
    // Get items with due dates
    const getItemsForDay = (day: number) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const items: { type: string; data: Todo | Task | Plan | Target | Milestone }[] = [];
      
      if (filters.todo) todos.filter(t => t.due_date === dateStr).forEach(t => items.push({ type: 'todo', data: t }));
      if (filters.task) Object.values(tasks).flat().filter(t => t.end_date === dateStr).forEach(t => items.push({ type: 'task', data: t }));
      if (filters.target) targets.filter(t => t.due_date === dateStr).forEach(t => items.push({ type: 'target', data: t }));
      if (filters.milestone) milestones.filter(m => m.target_date === dateStr).forEach(m => items.push({ type: 'milestone', data: m }));
      
      return items;
    };

    // Day names starting from Monday
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

    // Check if day is weekend
    const isWeekend = (day: number) => {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    };

    return (
      <div className="relative">
        {renderTooltip()}
        {/* Month Header with Navigation */}
        <div className="flex items-center justify-center mb-4 gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            ◀️
          </button>
          <h3 className="text-xl font-semibold" style={{ color: '#134E4A' }}>
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            ▶️
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, i) => (
            <div 
              key={day} 
              className={`text-center text-sm font-medium py-2 ${
                i >= 5 ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for first week */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-28 bg-gray-50 rounded"></div>
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const items = getItemsForDay(day);
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const isWeekendDay = isWeekend(day);
            
            return (
              <div 
                key={day} 
                className={`h-28 p-1 border rounded transition-colors ${
                  isToday ? 'bg-teal-50 border-teal-300' : 
                  isWeekendDay ? 'bg-red-50/50 border-red-100' : 
                  'bg-white border-gray-200'
                }`}
              >
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

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-100"></span>
            <span className="text-xs text-gray-600">待办</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-teal-100"></span>
            <span className="text-xs text-gray-600">任务</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-100"></span>
            <span className="text-xs text-gray-600">目标</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-100"></span>
            <span className="text-xs text-gray-600">里程碑</span>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <span className="w-3 h-3 rounded bg-red-50 border border-red-100"></span>
            <span className="text-xs text-gray-600">周末</span>
          </div>
        </div>
      </div>
    );
  };

  // ========== GANTT/TIMELINE VIEW ==========
  const renderGanttView = () => {
    const today = new Date();
    // Calculate date range based on zoom (number of months)
    const monthsToShow = ganttZoom;
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + monthsToShow - 1, 0);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate month headers
    const months: { label: string; startPercent: number; widthPercent: number }[] = [];
    let currentMonth = startDate.getMonth();
    let currentYear = startDate.getFullYear();
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    while (currentYear < today.getFullYear() + 2 || (currentYear === today.getFullYear() + 1 && currentMonth <= endDate.getMonth())) {
      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth + 1, 0);
      const daysInMonth = monthEnd.getDate();
      
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

    // Collect all items with their positions
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

    // Calculate dynamic width based on zoom
    const timelineWidth = Math.max(800, 100 * ganttZoom);

    return (
      <div className="w-full">
        {/* Time Range Control */}
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

        {/* Timeline with dynamic width */}
        <div className="overflow-hidden">
          <div style={{ width: `${timelineWidth}px` }}>
            {/* Timeline Header */}
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

            {/* Grid Background */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: `${100 / (monthsToShow * 4)}% 24px`,
              }}
            ></div>

            {/* Items */}
            <div className="relative space-y-1 z-10">
          {allItems.map((item, idx) => {
            const startPos = item.start ? getPosition(item.start) : (item.due ? getPosition(item.due) : null);
            const width = item.start && item.end ? getWidth(item.start, item.end) : 5;
            
            if (startPos === null) return null;
            
            return (
              <div key={`${item.type}-${idx}`} className="flex items-center h-6 group">
                <div className="w-28 flex-shrink-0 text-xs truncate pr-2 text-gray-600">{item.title}</div>
                <div className="flex-1 h-full relative">
                  {/* Bar */}
                  <div 
                    className={`absolute h-4 top-1 rounded-sm ${getTypeColor(item.type, item.status)}`}
                    style={{ 
                      left: `${startPos}%`, 
                      width: `${Math.max(width || 3, 3)}%`,
                      minWidth: '16px'
                    }}
                  >
                    {/* Progress indicator */}
                    {item.progress !== undefined && item.progress < 100 && (
                      <div 
                        className="absolute h-full bg-white/30 rounded-sm"
                        style={{ width: `${100 - item.progress}%`, right: 0 }}
                      ></div>
                    )}
                  </div>
                  {/* Today line */}
                  {isToday(item.start || item.due) && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${startPos}%` }}></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Today indicator */}
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

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-400"></span>
            <span className="text-gray-600">计划</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-400"></span>
            <span className="text-gray-600">目标</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-400"></span>
            <span className="text-gray-600">待办</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-pink-400"></span>
            <span className="text-gray-600">里程碑</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-1 rounded bg-red-500"></span>
            <span className="text-gray-600">今日</span>
          </div>
        </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4" style={{ color: '#134E4A' }}>视图查看</h2>
      
      {/* Compact View Mode Selector */}
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
        {viewMode === 'board' && renderBoardView()}
        {viewMode === 'calendar' && renderCalendarView()}
        {viewMode === 'gantt' && renderGanttView()}
      </Card>
    </div>
  );
}

// Statistics View
function StatisticsView() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  async function loadData() {
    try {
      const [t, p, tg, m] = await Promise.all([
        getTodos(), getPlans(), getTargets(), getMilestones()
      ]);
      setTodos(t);
      setPlans(p);
      setTargets(tg);
      setMilestones(m);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadData(); }, []);

  const stats = {
    totalTodos: todos.length,
    completedTodos: todos.filter(t => t.status === 'done').length,
    totalPlans: plans.length,
    activePlans: plans.filter(p => p.status === 'active').length,
    totalTargets: targets.length,
    activeTargets: targets.filter(t => t.status === 'active').length,
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter(m => m.status === 'completed').length,
  };

  const completionRate = stats.totalTodos > 0 
    ? Math.round((stats.completedTodos / stats.totalTodos) * 100) 
    : 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#134E4A' }}>数据统计</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{stats.totalTodos}</div>
          <div className="text-sm text-gray-500 mt-1">总待办</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.completedTodos}</div>
          <div className="text-sm text-gray-500 mt-1">已完成</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-500">{stats.activePlans}</div>
          <div className="text-sm text-gray-500 mt-1">进行中计划</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{stats.activeTargets}</div>
          <div className="text-sm text-gray-500 mt-1">进行中目标</div>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>待办完成率</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <ProgressBar value={completionRate} color="teal" size="md" />
          </div>
          <div className="text-2xl font-bold text-teal-600">{completionRate}%</div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>计划统计</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总计划数</span>
              <span className="font-medium">{stats.totalPlans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">进行中</span>
              <span className="font-medium text-orange-500">{stats.activePlans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已完成</span>
              <span className="font-medium text-green-600">{plans.filter(p => p.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已归档</span>
              <span className="font-medium text-gray-400">{plans.filter(p => p.status === 'archived').length}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>目标统计</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总目标数</span>
              <span className="font-medium">{stats.totalTargets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">进行中</span>
              <span className="font-medium text-orange-500">{stats.activeTargets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已完成</span>
              <span className="font-medium text-green-600">{targets.filter(t => t.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">里程碑</span>
              <span className="font-medium text-teal-600">{stats.totalMilestones}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Settings View
function SettingsView() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupPath, setBackupPath] = useState('');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#134E4A' }}>设置</h2>
      
      {/* Appearance */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>外观</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">主题</label>
            <div className="flex gap-3">
              {[
                { id: 'light', label: '浅色', icon: '☀️' },
                { id: 'dark', label: '深色', icon: '🌙' },
                { id: 'auto', label: '自动', icon: '⚙️' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as typeof theme)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    theme === t.id 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 hover:border-teal-200'
                  }`}
                >
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className="text-sm font-medium">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
            <select 
              value={language}
              onChange={e => setLanguage(e.target.value as typeof language)}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>数据管理</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">自动备份</div>
              <div className="text-sm text-gray-500">每次打开应用时自动备份</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoBackup}
                onChange={e => setAutoBackup(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备份路径</label>
            <div className="flex gap-2">
              <Input 
                value={backupPath}
                onChange={e => setBackupPath(e.target.value)}
                placeholder="选择备份目录..."
                className="flex-1"
              />
              <Button variant="secondary">浏览</Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1">
              导出数据 (JSON)
            </Button>
            <Button variant="secondary" className="flex-1">
              导入数据
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card>
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>关于</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">应用名称</span>
            <span className="font-medium">Plan Todos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">版本</span>
            <span className="font-medium">0.2.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">构建</span>
            <span className="font-medium">Tauri + Next.js</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Main App
export default function Home() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <Dashboard />;
      case 'todos':
      case 'todos-all':
      case 'todos-today':
      case 'todos-upcoming':
      case 'todos-completed': return <TodosView />;
      case 'plans':
      case 'plans-active':
      case 'plans-archived': return <PlansView />;
      case 'goals':
      case 'goals-active':
      case 'goals-completed': return <GoalsView />;
      case 'milestones': return <MilestonesView />;
      case 'views': return <ViewsView />;
      case 'statistics': return <StatisticsView />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F0FDFA', fontFamily: 'Fira Sans, sans-serif' }}>
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
