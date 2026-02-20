'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Input, ProgressBar, Checkbox } from '@/components/ui';
import { 
  getTargets, getSteps, createTarget, deleteTarget,
  createStep, updateStep, deleteStep, Target, Step, Tag,
  getTags, getEntityTags, setEntityTags 
} from '@/lib/api';

export function TargetsView() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [steps, setSteps] = useState<Record<string, Step[]>>({});
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [targetTags, setTargetTags] = useState<Record<string, Tag[]>>({});
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [showStepForm, setShowStepForm] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const isLoaded = useRef(false);

  async function loadTargets() {
    try {
      const data = await getTargets();
      // Load tags for each target
      const tagsMap: Record<string, Tag[]> = {};
      for (const target of data) {
        tagsMap[target.id] = await getEntityTags('target', target.id);
      }
      if (isLoaded.current) {
        setTargetTags(tagsMap);
        setTargets(data);
      }
      const stepMap: Record<string, Step[]> = {};
      for (const target of data) {
        stepMap[target.id] = await getSteps(target.id);
      }
      if (isLoaded.current) setSteps(stepMap);
    } catch (e) { console.error(e); }
  }

  async function loadTags() {
    try {
      const tags = await getTags();
      if (isLoaded.current) setAllTags(tags);
    } catch (e) { console.error(e); }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isLoaded.current) return; isLoaded.current = true; loadTargets(); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isLoaded.current) return; isLoaded.current = true; loadTags(); }, []);

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
      let targetId: string;
      if (selectedTargetId && targets.find(t => t.id === selectedTargetId)) {
        // This is actually an update - but we don't have updateTarget for target yet
        // For now, just create new
        const newTarget = await createTarget({ title, description: description || undefined, due_date: dueDate || undefined });
        targetId = newTarget.id;
      } else {
        const newTarget = await createTarget({ title, description: description || undefined, due_date: dueDate || undefined });
        targetId = newTarget.id;
      }
      // Save tags
      await setEntityTags('target', targetId, selectedTags);
      setShowForm(false);
      setTitle(''); setDescription(''); setDueDate(''); setSelectedTags([]);
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

  const getTotalWeight = (targetId: string) => {
    const targetSteps = steps[targetId] || [];
    return targetSteps.reduce((sum, s) => sum + s.weight, 0);
  };

  // Filter targets by tags (OR logic)
  const filteredTargets = targets.filter(t => {
    if (t.status === 'archived') return false;
    if (tagFilters.length === 0) return true;
    const targetTagIds = (targetTags[t.id] || []).map(t => t.id);
    return tagFilters.some(tagId => targetTagIds.includes(tagId));
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>GOALS</h2>
        <Button onClick={() => { setSelectedTargetId(''); setShowForm(true); }}>+ 新建 Target</Button>
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
        {filteredTargets.map(target => {
          const totalWeight = getTotalWeight(target.id);
          const targetSteps = steps[target.id] || [];
          
          return (
            <Card key={target.id}>
              <div onClick={() => toggleTarget(target.id)} className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{expandedTargets.has(target.id) ? '▼' : '▶'}</span>
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{target.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-orange-500 font-medium">{target.progress}%</span>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedTargetId(target.id); setShowStepForm(true); }} className="text-orange-500 hover:bg-orange-50 px-2 py-1 rounded text-sm">+ Step</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTarget(target.id); }} className="text-gray-400 hover:text-red-500 px-2">🗑️</button>
                  </div>
                </div>
                <ProgressBar value={target.progress} color="orange" size="sm" className="mt-2" />
                {/* Tags display */}
                {targetTags[target.id] && targetTags[target.id].length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {targetTags[target.id].map(tag => (
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
        {filteredTargets.length === 0 && (
          <p className="text-gray-400 text-center py-8">暂无目标</p>
        )}
      </div>

      <Modal open={showForm} title="新建 Target" onClose={() => { setShowForm(false); setTitle(''); setDescription(''); setDueDate(''); setSelectedTags([]); }}
        footer={<><Button variant="secondary" onClick={() => { setShowForm(false); setSelectedTags([]); }}>取消</Button><Button onClick={handleSubmitTarget}>创建</Button></>}>
        <div className="space-y-4">
          <Input label="标题" value={title} onChange={e => setTitle(e.target.value)} placeholder="目标标题..." autoFocus />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" rows={3} /></div>
          <Input label="截止日期" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
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
