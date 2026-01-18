'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, MapPin, Clock, DollarSign, Star, Calendar, 
  Settings, Plus, Trash2, Edit3, Save, Loader2, CheckCircle2, Camera, Video, MonitorPlay, AlertCircle 
} from 'lucide-react';

// --- Types ---
interface Skill {
  id: string;
  name: string;
  myStats?: {
    lessonsTaught: number;
    averageRating: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  scheduledAt: string;
  status: string; // 'PENDING' | 'CONFIRMED'
  student: { name: string; profileImage: string | null };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  location: string | null;
  hourlyRate: number | null;
  profileImage: string | null;
  skillsToTeach: Skill[];
  stats: {
    lessonsAsTeacher: number;
    averageRating: number;
    totalReviews: number;
  };
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TeacherProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [teacherLessons, setTeacherLessons] = useState<Lesson[]>([]);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', location: '', hourlyRate: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Availability State
  const [schedule, setSchedule] = useState<Record<number, AvailabilitySlot[]>>({});
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  // Skill State
  const [skillInput, setSkillInput] = useState('');
  
  // --- 1. Fetch Data ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel Fetch: Profile, Skills, Availability, AND Lessons
      const [profileRes, skillsRes, availRes, lessonsRes] = await Promise.all([
        fetch('/api/users/me', { headers }),
        fetch('/api/users/me/skills', { headers }),
        fetch('/api/availability', { headers }),
        // FIX: Removed "&status=CONFIRMED" so we get PENDING requests too
        fetch('/api/lessons?role=teacher', { headers }) 
      ]);

      const profileData = await profileRes.json();
      const skillsData = await skillsRes.json();
      const availData = await availRes.json();
      const lessonsData = await lessonsRes.json();

      // Set Profile
      setUser({
        ...profileData,
        skillsToTeach: skillsData.teaching || []
      });
      
      setEditForm({
        name: profileData.name,
        bio: profileData.bio || '',
        location: profileData.location || '',
        hourlyRate: profileData.hourlyRate || 0
      });

      // Set Schedule
      setSchedule(availData.schedule || {});

      // Set Lessons (Filter for future only, exclude Cancelled)
      const future = (lessonsData.lessons || [])
        .filter((l: any) => new Date(l.scheduledAt) > new Date() && l.status !== 'CANCELLED')
        .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      
      setTeacherLessons(future);

    } catch (error) {
      console.error('Load failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. Action Handlers ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('type', 'profile');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setUser(prev => prev ? { ...prev, profileImage: data.url } : null);
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(editForm)
    });
    setUser(prev => prev ? { ...prev, ...editForm } : null);
    setIsEditing(false);
  };

  const handleAddSkill = async () => {
    if (!skillInput.trim()) return;
    const token = localStorage.getItem('token');
    await fetch('/api/users/me/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ skillName: skillInput, type: 'teach' })
    });
    setSkillInput('');
    fetchData(); 
  };

  const handleAddSlot = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...newSlot,
        dayOfWeek: Number(newSlot.dayOfWeek),
        isRecurring: true
      })
    });

    if (res.ok) {
      fetchData(); 
      setIsAddingSlot(false);
    } else {
      alert('Failed to add slot. Check for overlaps.');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/availability?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 font-sans">
      
      {/* Header / Cover */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
          
          {/* Avatar Section */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-gray-200 overflow-hidden shadow-lg border-4 border-white">
              <img 
                src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}`} 
                className="w-full h-full object-cover" 
                alt="Profile"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-black text-white rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                <div className="flex gap-4 text-sm text-gray-500 font-medium mb-4">
                  <span className="flex items-center gap-1"><MapPin size={16} /> {user.location || 'Remote'}</span>
                  <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500 fill-yellow-500" /> {user.stats.averageRating} ({user.stats.totalReviews} reviews)</span>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in mt-4">
                <input className="p-2 rounded border" placeholder="Full Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                <input className="p-2 rounded border" placeholder="Location" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                <input className="p-2 rounded border" type="number" placeholder="Hourly Rate ($)" value={editForm.hourlyRate} onChange={e => setEditForm({...editForm, hourlyRate: Number(e.target.value)})} />
                <textarea className="p-2 rounded border md:col-span-2 h-24" placeholder="Bio..." value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
                <button onClick={handleSaveProfile} className="md:col-span-2 bg-black text-white py-2 rounded font-bold hover:bg-gray-800">Save Changes</button>
              </div>
            ) : (
              <p className="text-gray-600 max-w-2xl leading-relaxed">{user.bio || "No bio yet. Tell students about yourself!"}</p>
            )}
          </div>

          {/* Rate Card */}
          <div className="bg-black text-white p-6 rounded-2xl shadow-xl min-w-[200px] text-center hidden md:block">
            <div className="text-sm font-medium opacity-80 mb-1">Hourly Rate</div>
            <div className="text-4xl font-bold flex items-center justify-center gap-1">
              <span className="text-2xl">$</span>{user.hourlyRate || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 grid md:grid-cols-12 gap-8">
        
        {/* --- LEFT: Skills & Stats (Span 4) --- */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Lessons</div>
              <div className="text-2xl font-black">{user.stats.lessonsAsTeacher}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1">Earned</div>
              <div className="text-2xl font-black text-green-600">$0</div>
            </div>
          </div>

          {/* Teaching Skills */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4">I Can Teach</h3>
            
            <div className="flex gap-2 mb-4">
              <input 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors"
                placeholder="Add skill (e.g. React)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <button onClick={handleAddSkill} className="bg-black text-white p-2 rounded-lg hover:bg-gray-800"><Plus size={18} /></button>
            </div>

            <div className="space-y-3">
              {user.skillsToTeach.map(skill => (
                <div key={skill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                  <div>
                    <div className="font-bold text-sm">{skill.name}</div>
                    <div className="text-xs text-gray-500">{skill.myStats?.lessonsTaught || 0} lessons • {skill.myStats?.averageRating || 0} ★</div>
                  </div>
                  <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                </div>
              ))}
              {user.skillsToTeach.length === 0 && <div className="text-center text-gray-400 text-sm py-2">Add skills to appear in search!</div>}
            </div>
          </div>
        </div>

        {/* --- RIGHT: Schedule & Lessons (Span 8) --- */}
        <div className="md:col-span-8 space-y-8">
          
          {/* --- NEW: Upcoming Lessons to Teach --- */}
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><MonitorPlay size={20} /> Upcoming Classes to Teach</h2>
            {teacherLessons.length > 0 ? (
              <div className="space-y-3">
                {teacherLessons.map(lesson => (
                  <div key={lesson.id} className={`bg-white p-4 rounded-2xl border flex items-center justify-between hover:shadow-md transition-all ${lesson.status === 'PENDING' ? 'border-yellow-200 bg-yellow-50/50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      {/* Date Badge */}
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-sm ${lesson.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-black text-white'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(lesson.scheduledAt).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-xl font-black">{new Date(lesson.scheduledAt).getDate()}</span>
                      </div>
                      
                      {/* Lesson Details */}
                      <div>
                        <div className="font-bold text-lg flex items-center gap-2">
                          {lesson.title}
                          {lesson.status === 'PENDING' && <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">REQUEST</span>}
                        </div>
                        <div className="text-gray-500 text-sm flex items-center gap-2 font-medium">
                          <Clock size={14} />
                          {new Date(lesson.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          with <span className="text-indigo-600 font-bold">{lesson.student.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    {lesson.status === 'CONFIRMED' ? (
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black transition-colors">
                        <Video size={16} /> Start
                      </button>
                    ) : (
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
                        <Clock size={16} /> Pending
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No upcoming classes scheduled.</p>
              </div>
            )}
          </div>

          {/* Schedule Management */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Calendar size={20} /> Weekly Availability</h2>
              <button 
                onClick={() => setIsAddingSlot(!isAddingSlot)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Add Slot
              </button>
            </div>

            {/* Add Slot Form */}
            {isAddingSlot && (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-4 items-end animate-in slide-in-from-top-2 mb-4">
                <div>
                  <label className="text-xs font-bold text-indigo-800 uppercase">Day</label>
                  <select className="block w-32 p-2 rounded border border-indigo-200 text-sm" value={newSlot.dayOfWeek} onChange={e => setNewSlot({...newSlot, dayOfWeek: Number(e.target.value)})}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-indigo-800 uppercase">Start</label>
                  <input type="time" className="block p-2 rounded border border-indigo-200 text-sm" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-indigo-800 uppercase">End</label>
                  <input type="time" className="block p-2 rounded border border-indigo-200 text-sm" value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} />
                </div>
                <button onClick={handleAddSlot} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-indigo-700">Save</button>
              </div>
            )}

            {/* Schedule Grid */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {DAYS.map((dayName, dayIndex) => {
                const slots = schedule[dayIndex] || [];
                const isToday = new Date().getDay() === dayIndex;
                
                return (
                  <div key={dayIndex} className={`flex border-b border-gray-100 last:border-0 ${isToday ? 'bg-indigo-50/30' : ''}`}>
                    <div className={`w-24 p-4 border-r border-gray-100 font-bold text-sm ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {dayName}
                    </div>
                    <div className="flex-1 p-4 flex flex-wrap gap-2">
                      {slots.length > 0 ? (
                        slots.map(slot => (
                          <div key={slot.id} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm group">
                            {slot.startTime} - {slot.endTime}
                            <button 
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-300 text-sm italic">Unavailable</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}