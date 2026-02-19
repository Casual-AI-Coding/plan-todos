'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Input, Checkbox } from '@/components/ui';
import { Calendar } from '@/components/ui/Calendar';
import { getTodos, createTodo, updateTodo, deleteTodo, Todo, Priority, Tag, getTags, getEntityTags, setEntityTags } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'todo' | 'task' | 'plan' | 'milestone';
}

export function TodosView() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('P2');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const isLoaded = useRef(false);

  async function loadTodos() {
    try {
      const data = await getTodos();
      // Load tags for each todo
      const todosWithTags = await Promise.all(
        data.map(async (todo) => {
          const tags = await getEntityTags('todo', todo.id);
          return { ...todo, tags };
        })
      );
      if (isLoaded.current) setTodos(todosWithTags);
    } catch (e) { console.error(e); }
  }

  async function loadTags() {
    try {
      const tags = await getTags();
      if (isLoaded.current) setAllTags(tags);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { if (isLoaded.current) return; isLoaded.current = true; loadTodos(); }, []); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => { if (isLoaded.current) return; isLoaded.current = true; loadTags(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

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
    // Priority filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
      return false;
    }
    // Tag filter (OR logic - multiple tags)
    if (tagFilters.length > 0) {
      const todoTagIds = (t.tags || []).map(tag => tag.id);
      const hasTag = tagFilters.some(tagId => todoTagIds.includes(tagId));
      if (!hasTag) return false;
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
      let todoId: string;
      if (editingTodo) {
        await updateTodo(editingTodo.id, { title, content: content || undefined, due_date: dueDate || undefined, priority });
        todoId = editingTodo.id;
      } else {
        const newTodo = await createTodo({ title, content: content || undefined, due_date: dueDate || undefined, priority });
        todoId = newTodo.id;
      }
      // Save tags
      await setEntityTags('todo', todoId, selectedTags);
      setShowForm(false);
      setEditingTodo(null);
      setTitle('');
      setContent('');
      setDueDate('');
      setPriority('P2');
      setSelectedTags([]);
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>TODOS</h2>
        <Button onClick={() => setShowForm(true)}>+ 新建</Button>
      </div>

      {/* Row 1: Status tabs + View toggle */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            列表
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'calendar' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            日历
          </button>
        </div>
      </div>

      {/* Row 2: Priority dropdown + Tag dropdown + Search */}
      <div className="flex gap-2 mb-4 items-center">
        {/* Priority dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowPriorityDropdown(!showPriorityDropdown); setShowTagDropdown(false); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1 ${
              priorityFilter !== 'all' 
                ? 'border-teal-500 bg-teal-50 text-teal-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {priorityFilter === 'all' ? '优先级' : priorityFilter}
            <span className="text-xs">▼</span>
          </button>
          {showPriorityDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px] overflow-visible">
              {(['all', 'P0', 'P1', 'P2', 'P3'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => { setPriorityFilter(p); setShowPriorityDropdown(false); }}
                  className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${
                    priorityFilter === p ? 'text-teal-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  {p === 'all' ? '全部' : p === 'P0' ? 'P0 紧急' : p === 'P1' ? 'P1 重要' : p === 'P2' ? 'P2 普通' : 'P3 低'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tag dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowTagDropdown(!showTagDropdown); setShowPriorityDropdown(false); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1 ${
              tagFilters.length > 0 
                ? 'border-teal-500 bg-teal-50 text-teal-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tagFilters.length === 0 ? '标签' : `+${tagFilters.length} 标签`}
            <span className="text-xs">▼</span>
          </button>
          {showTagDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[150px] overflow-visible">
              {allTags.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">暂无标签</div>
              ) : (
                allTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setTagFilters(prev => 
                      prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]
                    )}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                      tagFilters.includes(tag.id) ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
                    }`}>
                      {tagFilters.includes(tag.id) && <span className="text-white text-xs">✓</span>}
                    </span>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className={tagFilters.includes(tag.id) ? 'font-medium' : ''}>{tag.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="w-64 relative ml-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索..."
            className="w-full px-3 py-1.5 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showPriorityDropdown || showTagDropdown) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => { setShowPriorityDropdown(false); setShowTagDropdown(false); }}
        />
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        /* List */
        <div className="space-y-2">
        {filteredTodos.map(todo => (
          <Card key={todo.id} hoverable onClick={() => { setEditingTodo(todo); setTitle(todo.title); setContent(todo.content || ''); setDueDate(todo.due_date || ''); setPriority(todo.priority); setSelectedTags(todo.tags?.map(t => t.id) || []); setShowForm(true); }}>
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={todo.status === 'done'} 
                onChange={() => handleToggle(todo)}
                onClick={e => e.stopPropagation()}
              />
              {/* Priority badge */}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                todo.priority === 'P0' ? 'bg-red-100 text-red-700' :
                todo.priority === 'P1' ? 'bg-orange-100 text-orange-700' :
                todo.priority === 'P2' ? 'bg-gray-100 text-gray-600' :
                'bg-blue-100 text-blue-700'
              }`}>
                {todo.priority}
              </span>
              <div className="flex-1">
                <div className={todo.status === 'done' ? 'line-through text-gray-400' : ''}>
                  {todo.title}
                </div>
                {/* Tags display */}
                {todo.tags && todo.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {todo.tags.map(tag => (
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
        onClose={() => { setShowForm(false); setEditingTodo(null); setTitle(''); setContent(''); setDueDate(''); setPriority('P2'); setSelectedTags([]); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingTodo(null); setTitle(''); setContent(''); setDueDate(''); setPriority('P2'); setSelectedTags([]); }}>取消</Button>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
            <select 
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="P0">P0 - 紧急重要</option>
              <option value="P1">P1 - 重要</option>
              <option value="P2">P2 - 普通</option>
              <option value="P3">P3 - 低优先级</option>
            </select>
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
                      prev.includes(tag.id) 
                        ? prev.filter(id => id !== tag.id)
                        : [...prev, tag.id]
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
    </div>
  );
}
