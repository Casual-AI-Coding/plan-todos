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
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('list');

  const viewModes = [
    { id: 'list', icon: '📋', label: '列表视图' },
    { id: 'board', icon: '📊', label: '看板视图' },
    { id: 'calendar', icon: '📅', label: '日历视图' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#134E4A' }}>视图查看</h2>
      
      {/* View Mode Selector */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>选择视图模式</h3>
        <div className="flex gap-4">
          {viewModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as typeof viewMode)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                viewMode === mode.id 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-200 hover:border-teal-200'
              }`}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="font-medium" style={{ color: viewMode === mode.id ? '#0D9488' : '#374151' }}>
                {mode.label}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* View Preview */}
      <Card>
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>视图预览</h3>
        {viewMode === 'list' && (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <p>列表视图 - 层级展示所有数据</p>
            <p className="text-sm mt-2 text-gray-400">按类型分组，显示进度和状态</p>
          </div>
        )}
        {viewMode === 'board' && (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p>看板视图 - 按状态列展示</p>
            <p className="text-sm mt-2 text-gray-400">待处理 / 进行中 / 已完成</p>
          </div>
        )}
        {viewMode === 'calendar' && (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <p>日历视图 - 时间线展示</p>
            <p className="text-sm mt-2 text-gray-400">按日期查看所有带截止日期的项目</p>
          </div>
        )}
      </Card>

      {/* Coming Soon Notice */}
      <Card className="mt-6 bg-orange-50 border-orange-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <div className="font-medium text-orange-700">功能开发中</div>
            <div className="text-sm text-orange-600">更多视图自定义选项即将推出</div>
          </div>
        </div>
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
            <span className="font-medium">1.0.0</span>
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
