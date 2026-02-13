'use client';

import { useState, useEffect } from 'react';
import { getTodos, getPlans, createTodo, createPlan, updateTodo, deleteTodo, updatePlan, deletePlan, Todo, Plan } from '@/lib/api';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'all' | 'today' | 'plans'>('all');
  
  // Form states
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newPlanTitle, setNewPlanTitle] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [todosData, plansData] = await Promise.all([
        getTodos(),
        getPlans(),
      ]);
      setTodos(todosData);
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Todo handlers
  async function handleCreateTodo() {
    if (!newTodoTitle.trim()) return;
    try {
      await createTodo({
        title: newTodoTitle,
        plan_ids: [],
      });
      setNewTodoTitle('');
      setShowTodoForm(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  }

  async function handleToggleTodo(todo: Todo) {
    try {
      const newStatus = todo.status === 'done' ? 'pending' : 'done';
      await updateTodo(todo.id, { status: newStatus });
      await loadData();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  }

  async function handleDeleteTodo(id: string) {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTodo(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  }

  async function handleEditTodo() {
    if (!editingTodo || !newTodoTitle.trim()) return;
    try {
      await updateTodo(editingTodo.id, { title: newTodoTitle });
      setEditingTodo(null);
      setNewTodoTitle('');
      await loadData();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  }

  // Plan handlers
  async function handleCreatePlan() {
    if (!newPlanTitle.trim()) return;
    try {
      await createPlan({
        title: newPlanTitle,
      });
      setNewPlanTitle('');
      setShowPlanForm(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  }

  async function handleDeletePlan(id: string) {
    if (!confirm('Delete this plan and all its tasks?')) return;
    try {
      await deletePlan(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  }

  async function handleArchivePlan(id: string) {
    try {
      await updatePlan(id, { status: 'archived' });
      await loadData();
    } catch (error) {
      console.error('Failed to archive plan:', error);
    }
  }

  async function handleEditPlan() {
    if (!editingPlan || !newPlanTitle.trim()) return;
    try {
      await updatePlan(editingPlan.id, { title: newPlanTitle });
      setEditingPlan(null);
      setNewPlanTitle('');
      await loadData();
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  }

  const pendingTodos = todos.filter(t => t.status !== 'done');
  const completedTodos = todos.filter(t => t.status === 'done');
  const activePlans = plans.filter(p => p.status === 'active');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" 
           style={{ backgroundColor: '#F0FDFA', fontFamily: 'Fira Sans, sans-serif' }}>
        <div className="text-teal-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F0FDFA', fontFamily: 'Fira Sans, sans-serif' }}>
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-teal-100 p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-6" style={{ color: '#134E4A', fontFamily: 'Fira Code, monospace' }}>
          Plan Todos
        </h1>
        
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveView('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              activeView === 'all' ? 'bg-teal-100' : 'hover:bg-teal-50'
            }`}
            style={{ color: '#134E4A' }}
          >
            📋 All Tasks
          </button>
          <button
            onClick={() => setActiveView('today')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              activeView === 'today' ? 'bg-teal-100' : 'hover:bg-teal-50'
            }`}
            style={{ color: '#134E4A' }}
          >
            📅 Today
          </button>
          <button
            onClick={() => setActiveView('plans')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              activeView === 'plans' ? 'bg-teal-100' : 'hover:bg-teal-50'
            }`}
            style={{ color: '#134E4A' }}
          >
            🚀 Plans
          </button>
        </nav>

        <div className="border-t border-teal-100 pt-4 mt-4">
          <button
            onClick={() => setShowTodoForm(true)}
            className="w-full px-3 py-2 rounded-lg text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#0D9488' }}
          >
            + New Task
          </button>
          <button
            onClick={() => setShowPlanForm(true)}
            className="w-full mt-2 px-3 py-2 rounded-lg border transition-colors hover:bg-teal-50"
            style={{ borderColor: '#0D9488', color: '#0D9488' }}
          >
            + New Plan
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeView === 'all' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#134E4A' }}>
              All Tasks
            </h2>
            
            {/* Pending Todos */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3" style={{ color: '#14B8A6' }}>
                Pending ({pendingTodos.length})
              </h3>
              <div className="space-y-2">
                {pendingTodos.map(todo => (
                  <div
                    key={todo.id}
                    className="bg-white p-4 rounded-lg border border-teal-100 shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderColor: '#CCFBF1' }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.status === 'done'}
                        onChange={() => handleToggleTodo(todo)}
                        className="w-5 h-5 rounded border-teal-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="flex-1 text-gray-800">{todo.title}</span>
                      <button
                        onClick={() => { setEditingTodo(todo); setNewTodoTitle(todo.title); }}
                        className="text-gray-400 hover:text-teal-600 px-2"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-gray-400 hover:text-red-600 px-2"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                    {todo.due_date && (
                      <div className="mt-2 text-sm ml-8" style={{ color: '#64748B' }}>
                        📅 {new Date(todo.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
                {pendingTodos.length === 0 && (
                  <p className="text-gray-400 text-sm">No pending tasks</p>
                )}
              </div>
            </div>

            {/* Completed Todos */}
            <div>
              <h3 className="text-sm font-medium mb-3" style={{ color: '#14B8A6' }}>
                Completed ({completedTodos.length})
              </h3>
              <div className="space-y-2">
                {completedTodos.map(todo => (
                  <div
                    key={todo.id}
                    className="bg-white p-4 rounded-lg border border-gray-100 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked
                        onChange={() => handleToggleTodo(todo)}
                        className="w-5 h-5 rounded border-teal-300 text-teal-600 cursor-pointer"
                        readOnly
                      />
                      <span className="flex-1 text-gray-500 line-through">{todo.title}</span>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-gray-400 hover:text-red-600 px-2"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'plans' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#134E4A' }}>
              My Plans
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activePlans.map(plan => (
                <div
                  key={plan.id}
                  className="bg-white p-4 rounded-lg border border-teal-100 shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderColor: '#CCFBF1' }}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg" style={{ color: '#134E4A' }}>
                      {plan.title}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingPlan(plan); setNewPlanTitle(plan.title); }}
                        className="text-gray-400 hover:text-teal-600"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleArchivePlan(plan.id)}
                        className="text-gray-400 hover:text-teal-600"
                        title="Archive"
                      >
                        📦
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {plan.description && (
                    <p className="mt-2 text-sm" style={{ color: '#64748B' }}>
                      {plan.description}
                    </p>
                  )}
                  {plan.target_date && (
                    <div className="mt-3 text-sm" style={{ color: '#14B8A6' }}>
                      🎯 Target: {new Date(plan.target_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
              {activePlans.length === 0 && (
                <p className="text-gray-400 text-sm col-span-full">No plans yet. Create one to get started!</p>
              )}
            </div>
          </div>
        )}

        {activeView === 'today' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#134E4A' }}>
              Today&apos;s Tasks
            </h2>
            <p className="text-gray-400">Tasks due today will appear here</p>
          </div>
        )}
      </main>

      {/* Todo Form Modal */}
      {(showTodoForm || editingTodo) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#134E4A' }}>
              {editingTodo ? 'Edit Task' : 'New Task'}
            </h3>
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && (editingTodo ? handleEditTodo() : handleCreateTodo())}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowTodoForm(false); setEditingTodo(null); setNewTodoTitle(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTodo ? handleEditTodo : handleCreateTodo}
                className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#0D9488' }}
              >
                {editingTodo ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Form Modal */}
      {(showPlanForm || editingPlan) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#134E4A' }}>
              {editingPlan ? 'Edit Plan' : 'New Plan'}
            </h3>
            <input
              type="text"
              value={newPlanTitle}
              onChange={(e) => setNewPlanTitle(e.target.value)}
              placeholder="Plan title..."
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && (editingPlan ? handleEditPlan() : handleCreatePlan())}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowPlanForm(false); setEditingPlan(null); setNewPlanTitle(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingPlan ? handleEditPlan : handleCreatePlan}
                className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#0D9488' }}
              >
                {editingPlan ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
