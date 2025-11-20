'use client';

import { useState, useEffect } from 'react';
import DashboardNav from '@/components/DashboardNav';

interface FeedbackItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: 'bug' | 'feature' | 'design' | 'question' | 'improvement';
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'reviewing' | 'in_progress' | 'need_info' | 'done' | 'wont_fix';
  screenshots: string[];
  created_at: string;
  updated_at: string;
  comment_count: number;
}

const TYPE_CONFIG = {
  bug: { label: 'Bug', icon: '🐛', color: 'bg-red-100 text-red-800 border-red-300' },
  feature: { label: 'Feature', icon: '✨', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  design: { label: 'Design', icon: '🎨', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  question: { label: 'Question', icon: '❓', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  improvement: { label: 'Improvement', icon: '📈', color: 'bg-green-100 text-green-800 border-green-300' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
};

const STATUS_COLUMNS = [
  { id: 'new', title: 'New', color: 'bg-blue-50 border-blue-200' },
  { id: 'reviewing', title: 'Reviewing', color: 'bg-purple-50 border-purple-200' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-orange-50 border-orange-200' },
  { id: 'need_info', title: 'Need Info', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'done', title: 'Done', color: 'bg-green-50 border-green-200' },
];

export default function FeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/feedback');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (itemId: string, newStatus: string) => {
    try {
      await fetch(`/api/feedback/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getItemsByStatus = (status: string) => {
    return items.filter(item => item.status === status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-deep-indigo via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Team Feedback
            </h1>
            <p className="text-lg text-slate-700">
              Track bugs, features, and improvements. Leave feedback anytime, review during business hours.
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Feedback
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {STATUS_COLUMNS.map((column) => (
              <div key={column.id} className={`rounded-xl border-2 ${column.color} p-4`}>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                  {column.title}
                  <span className="text-xs bg-white rounded-full px-2 py-1">
                    {getItemsByStatus(column.id).length}
                  </span>
                </h3>

                <div className="space-y-3">
                  {getItemsByStatus(column.id).map((item) => {
                    const typeConfig = TYPE_CONFIG[item.type];
                    const priorityConfig = PRIORITY_CONFIG[item.priority];

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="bg-white rounded-lg p-4 border-2 border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${typeConfig.color}`}>
                            {typeConfig.icon} {typeConfig.label}
                          </span>
                          {item.priority !== 'low' && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityConfig.color}`}>
                              {priorityConfig.label}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 mb-1 line-clamp-2">
                          {item.title}
                        </h4>

                        {item.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          {item.comment_count > 0 && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {item.comment_count}
                            </span>
                          )}
                        </div>

                        {/* Quick status change dropdown */}
                        <select
                          value={item.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateStatus(item.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 w-full text-xs px-2 py-1 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ color: '#0f172a' }}
                        >
                          {STATUS_COLUMNS.map(col => (
                            <option key={col.id} value={col.id}>{col.title}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}

                  {getItemsByStatus(column.id).length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No items
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Feedback Modal */}
        {showNewModal && (
          <NewFeedbackModal
            onClose={() => setShowNewModal(false)}
            onSubmit={() => {
              setShowNewModal(false);
              fetchItems();
            }}
          />
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={fetchItems}
          />
        )}
      </main>
    </div>
  );
}

function NewFeedbackModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'bug' | 'feature' | 'design' | 'question' | 'improvement'>('bug');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, type, priority }),
      });

      if (response.ok) {
        onSubmit();
      }
    } catch (error) {
      console.error('Failed to create feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-black text-slate-900 mb-6">New Feedback</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key as any)}
                  className={`p-3 rounded-lg border-2 font-bold text-sm transition-all ${
                    type === key ? config.color : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div>{config.icon}</div>
                  <div className="text-xs mt-1">{config.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key as any)}
                  className={`p-2 rounded-lg border-2 font-bold text-sm transition-all ${
                    priority === key ? config.color + ' border-current' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Brief summary of the feedback"
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              style={{ color: '#0f172a' }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Detailed description, steps to reproduce, expected behavior, etc."
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              style={{ color: '#0f172a' }}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ItemDetailModal({
  item,
  onClose,
  onUpdate,
}: {
  item: FeedbackItem;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [item.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/feedback/${item.id}/comments`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/feedback/${item.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this feedback item?')) return;

    try {
      await fetch(`/api/feedback/${item.id}`, { method: 'DELETE' });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const typeConfig = TYPE_CONFIG[item.type];
  const priorityConfig = PRIORITY_CONFIG[item.priority];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full border ${typeConfig.color}`}>
              {typeConfig.icon} {typeConfig.label}
            </span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h2>

        {item.description && (
          <p className="text-slate-700 mb-6 whitespace-pre-wrap">{item.description}</p>
        )}

        <div className="mb-6 flex items-center gap-4 text-sm text-slate-600">
          <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="font-bold text-slate-900 mb-4">Comments ({comments.length})</h3>

          <div className="space-y-4 mb-6">
            {loading ? (
              <div className="text-center py-4 text-slate-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-slate-500">No comments yet</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">{comment.user_email}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{comment.comment}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              style={{ color: '#0f172a' }}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-6 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>

        <div className="border-t border-slate-200 mt-6 pt-6 flex justify-between">
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-all"
          >
            Delete Item
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
