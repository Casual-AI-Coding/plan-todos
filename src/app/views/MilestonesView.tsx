'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, ProgressBar } from '@/components/ui';
import { 
  getMilestones, getPlans, getTargets, createMilestone, updateMilestone, deleteMilestone,
  Milestone, Plan, Target 
} from '@/lib/api';

export function MilestonesView() {
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
