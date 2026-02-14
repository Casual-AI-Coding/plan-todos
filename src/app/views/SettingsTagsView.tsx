'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { getTags, createTag, updateTag, deleteTag, Tag } from '@/lib/api';

export function SettingsTagsView() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const colorOptions = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ];

  async function loadTags() {
    try {
      const data = await getTags();
      setTags(data);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadTags(); }, []);

  async function handleSubmit() {
    if (!name.trim()) {
      alert('标签名称不能为空');
      return;
    }
    // Check for duplicate name
    const trimmedName = name.trim();
    const exists = tags.some(t => 
      t.name.toLowerCase() === trimmedName.toLowerCase() && 
      (!editingTag || t.id !== editingTag.id)
    );
    if (exists) {
      alert('标签名称已存在');
      return;
    }
    try {
      if (editingTag) {
        await updateTag(editingTag.id, { name: trimmedName, color });
      } else {
        await createTag(trimmedName, color);
      }
      setShowForm(false);
      setEditingTag(null);
      setName('');
      setColor('#3B82F6');
      loadTags();
    } catch (e) { console.error(e); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tag?')) return;
    try {
      await deleteTag(id);
      loadTags();
    } catch (e) { console.error(e); }
  }

  function handleEdit(tag: Tag) {
    setEditingTag(tag);
    setName(tag.name);
    setColor(tag.color);
    setShowForm(true);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>
          设置 &gt; 标签管理
        </h2>
        <Button onClick={() => { setShowForm(true); setEditingTag(null); setName(''); setColor('#3B82F6'); }}>
          + 新建标签
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>
            {editingTag ? '编辑标签' : '新建标签'}
          </h3>
          <div className="space-y-4">
            <Input
              label="名称"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入标签名称..."
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">颜色</label>
              <div className="flex gap-2">
                {colorOptions.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === c ? 'border-gray-800 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setShowForm(false); setEditingTag(null); }}>
                取消
              </Button>
              <Button onClick={handleSubmit}>{editingTag ? '保存' : '创建'}</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tags List */}
      <Card>
        {tags.length === 0 ? (
          <p className="text-gray-400 text-center py-8">暂无标签</p>
        ) : (
          <div className="space-y-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-medium">{tag.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="text-teal-600 hover:text-teal-700 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
