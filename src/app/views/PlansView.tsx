'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Input, ProgressBar, Checkbox } from '@/components/ui';
import { 
  getPlans, getTasksByPlan, createPlan, updatePlan, deletePlan,
  createTask, updateTask, deleteTask, Plan, Task, Tag, 
  getTags, getEntityTags, setEntityTags 
} from '@/lib/api';

export function PlansView() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [planTags, setPlanTags] = useState<Record<string, Tag[]>>({});
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const isLoaded = useRef(false);

  async function loadPlans() {
    try {
      const data = await getPlans();
      // Load tags for each plan
      const tagsMap: Record<string, Tag[]> = {};
      for (const plan of data) {
        tagsMap[plan.id] = await getEntityTags('plan', plan.id);
      }
      if (isLoaded.current) {
        setPlanTags(tagsMap);
        setPlans(data);
      }
      const taskMap: Record<string, Task[]> = {};
      for (const plan of data) {
        taskMap[plan.id] = await getTasksByPlan(plan.id);
      }
      if (isLoaded.current) setTasks(taskMap);
    } catch (e) { console.error(e); }
  }

  async function loadTags() {
    try {
      const tags = await getTags();
      if (isLoaded.current) setAllTags(tags);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { if (isLoaded.current) return; isLoaded.current = true; loadPlans(); }, []);
  useEffect(() => { if (isLoaded.current) return; isLoaded.current = true; loadTags(); }, []);

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
      let planId: string;
      if (editingPlan) {
        await updatePlan(editingPlan.id, { title, description: description || undefined, start_date: startDate || undefined, end_date: endDate || undefined });
        planId = editingPlan.id;
      } else {
        const newPlan = await createPlan({ title, description: description || undefined, start_date: startDate || undefined, end_date: endDate || undefined });
        planId = newPlan.id;
      }
      // Save tags
      await setEntityTags('plan', planId, selectedTags);
      setShowForm(false);
      setEditingPlan(null);
      setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); setSelectedTags([]);
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

  // Filter plans by tags (OR logic)
  const filteredPlans = plans.filter(p => {
    if (p.status === 'archived') return false;
    if (tagFilters.length === 0) return true;
    const planTagIds = (planTags[p.id] || []).map(t => t.id);
    return tagFilters.some(tagId => planTagIds.includes(tagId));
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>PLANS</h2>
        <Button onClick={() => setShowForm(true)}>+ 新建 Plan</Button>
      </div>

      {/* Tag filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="text-sm text-gray-600 py-2">标签:</span>
        <button
          onClick={() => setTagFilters([])}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            tagFilters.length === 0 ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {allTags.map(tag => (
          <button
            key={tag.id}
            onClick={() => setTagFilters(prev => 
              prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]
            )}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              tagFilters.includes(tag.id) ? 'text-white' : ''
            }`}
            style={{ backgroundColor: tagFilters.includes(tag.id) ? tag.color : `${tag.color}20`, color: tagFilters.includes(tag.id) ? 'white' : tag.color }}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredPlans.map(plan => {
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
                {/* Tags display */}
                {planTags[plan.id] && planTags[plan.id].length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {planTags[plan.id].map(tag => (
                      <span 
                        key={tag.id}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
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
        {filteredPlans.length === 0 && (
          <p className="text-gray-400 text-center py-8">暂无计划</p>
        )}
      </div>

      <Modal open={showForm} title={editingPlan ? '编辑 Plan' : '新建 Plan'} onClose={() => { setShowForm(false); setEditingPlan(null); setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); setSelectedTags([]); }}
        footer={<><Button variant="secondary" onClick={() => { setShowForm(false); setEditingPlan(null); setSelectedTags([]); }}>取消</Button><Button onClick={handleSubmitPlan}>{editingPlan ? '保存' : '创建'}</Button></>}>
        <div className="space-y-4">
          <Input label="标题" value={title} onChange={e => setTitle(e.target.value)} placeholder="计划标题..." autoFocus />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="开始日期" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input label="结束日期" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          {/* Tag selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
            <div className="flex gap-2 flex-wrap">
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                    );
                  }}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedTags.includes(tag.id) ? 'text-white' : ''
                  }`}
                  style={{ 
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}20`, 
                    color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                    border: `1px solid ${tag.color}`
                  }}
                >
                  {tag.name}
                </button>
              ))}
              {allTags.length === 0 && (
                <span className="text-sm text-gray-400">暂无标签，请在设置中创建</span>
              )}
            </div>
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
