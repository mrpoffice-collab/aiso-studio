'use client';

import { useState, useEffect } from 'react';
import DashboardNav from '@/components/DashboardNav';
import { AISOMascotLoading } from '@/components/AISOMascot';

interface Topic {
  id: number;
  title: string;
  status: string;
  target_publish_date?: string;
  strategy_id: number;
  client_name: string;
  industry: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  topics: Topic[];
}

export default function ContentCalendarPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/topics');
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayTopics = topics.filter((t) => {
        if (!t.target_publish_date) return false;
        return t.target_publish_date.split('T')[0] === dateStr;
      });

      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.getTime() === today.getTime(),
        topics: dayTopics,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'scheduled':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get upcoming topics for sidebar
  const upcomingTopics = topics
    .filter((t) => t.target_publish_date && new Date(t.target_publish_date) >= new Date())
    .sort((a, b) => new Date(a.target_publish_date!).getTime() - new Date(b.target_publish_date!).getTime())
    .slice(0, 10);

  // Get topics without dates
  const unscheduledTopics = topics.filter((t) => !t.target_publish_date);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <DashboardNav />
        <main className="container mx-auto px-6 py-12">
          <AISOMascotLoading message="Loading content calendar..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Content Calendar</h1>
            <p className="text-slate-600 mt-1">
              Plan and track your content publishing schedule
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${
                  viewMode === 'month' ? 'bg-orange-100 text-orange-700' : 'text-slate-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${
                  viewMode === 'list' ? 'bg-orange-100 text-orange-700' : 'text-slate-600'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            {viewMode === 'month' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-900">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    <button
                      onClick={handleToday}
                      className="px-3 py-1 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition"
                    >
                      Today
                    </button>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-slate-200">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-semibold text-slate-600 bg-slate-50"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {getCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border-b border-r border-slate-100 ${
                        !day.isCurrentMonth ? 'bg-slate-50' : ''
                      } ${day.isToday ? 'bg-orange-50' : ''}`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          day.isToday
                            ? 'w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center'
                            : day.isCurrentMonth
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {day.topics.slice(0, 3).map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className={`w-full text-left px-2 py-1 text-xs font-medium rounded truncate border ${getStatusColor(
                              topic.status
                            )} hover:opacity-80 transition`}
                          >
                            {topic.title}
                          </button>
                        ))}
                        {day.topics.length > 3 && (
                          <div className="text-xs text-slate-500 px-2">
                            +{day.topics.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">All Scheduled Content</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {topics
                    .filter((t) => t.target_publish_date)
                    .sort((a, b) => new Date(a.target_publish_date!).getTime() - new Date(b.target_publish_date!).getTime())
                    .map((topic) => (
                      <div
                        key={topic.id}
                        className="p-4 hover:bg-slate-50 cursor-pointer transition"
                        onClick={() => setSelectedTopic(topic)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-slate-900">{topic.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                              {topic.client_name} • {topic.industry}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-slate-900">
                              {new Date(topic.target_publish_date!).toLocaleDateString()}
                            </div>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border ${getStatusColor(
                                topic.status
                              )}`}
                            >
                              {topic.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  {topics.filter((t) => t.target_publish_date).length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      No scheduled content yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">Upcoming</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {upcomingTopics.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">No upcoming content</div>
                ) : (
                  upcomingTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className="w-full p-3 text-left hover:bg-slate-50 transition"
                    >
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {topic.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(topic.target_publish_date!).toLocaleDateString()} • {topic.client_name}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Unscheduled */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Unscheduled</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {unscheduledTopics.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {unscheduledTopics.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">All content scheduled!</div>
                ) : (
                  unscheduledTopics.slice(0, 10).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className="w-full p-3 text-left hover:bg-slate-50 transition"
                    >
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {topic.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{topic.client_name}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-bold text-slate-900 mb-3">Status Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-slate-200"></div>
                  <span className="text-sm text-slate-600">Idea</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-200"></div>
                  <span className="text-sm text-slate-600">Draft</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-200"></div>
                  <span className="text-sm text-slate-600">Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-200"></div>
                  <span className="text-sm text-slate-600">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-200"></div>
                  <span className="text-sm text-slate-600">Published</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedTopic(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
              <button
                onClick={() => setSelectedTopic(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-6">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded border mb-3 ${getStatusColor(
                    selectedTopic.status
                  )}`}
                >
                  {selectedTopic.status}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedTopic.title}</h2>
                <p className="text-slate-500 mb-4">
                  {selectedTopic.client_name} • {selectedTopic.industry}
                </p>

                {selectedTopic.target_publish_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Scheduled: {new Date(selectedTopic.target_publish_date).toLocaleDateString()}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <a
                    href={`/dashboard/strategies/${selectedTopic.strategy_id}`}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition text-center"
                  >
                    View in Strategy
                  </a>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
