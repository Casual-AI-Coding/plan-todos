'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Checkbox } from '@/components/ui';
import { Calendar } from '@/components/ui/Calendar';
import { getTodos, createTodo, updateTodo, deleteTodo, Todo } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'todo' | 'task' | 'plan' | 'milestone';
}

export function TodosView() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
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

  // Convert todos to calendar events
  const calendarEvents: CalendarEvent[] = todos
    .filter(t => t.due_date)
    .map(t => ({
      id: t.id,
      title: t.title,
      date: t.due_date!,
      type: 'todo' as const
    }));

  const filteredTodos = todos.filter(t => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && 
          !(t.content?.toLowerCase().includes(q))) {
        return false;
      }
    }
    // Status filter
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
      <div className="flex gap-2 mb-4">
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

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索..."
          className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* View mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'list' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          列表
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'calendar' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          日历
        </button>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        /* List */
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
      ) : (
        /* Calendar */
        <Card>
          <Calendar 
            events={calendarEvents} 
            onEventClick={(e) => console.log('Clicked:', e)}
          />
        </Card>
      )}

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
