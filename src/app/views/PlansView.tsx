'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, ProgressBar, Checkbox } from '@/components/ui';
import { 
  getPlans, getTasksByPlan, createPlan, updatePlan, deletePlan,
  createTask, updateTask, deleteTask, Plan, Task 
} from '@/lib/api';

export function PlansView() {
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
