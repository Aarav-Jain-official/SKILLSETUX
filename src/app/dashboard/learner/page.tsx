'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Clock, Calendar, Plus, X, 
  MapPin, Save, Loader2, Video, CheckCircle2, Camera, ArrowRight 
} from 'lucide-react';

// --- Types ---
interface Skill {
  id: string;
  name: string;
  category: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  location: string | null;
  profileImage: string | null;
  createdAt: string;
  skillsToLearn: Skill[];
  stats: {
    lessonsAsStudent: number;
    totalReviews: number;
    averageRating: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  teacher: { name: string; profileImage: string | null };
}

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', location: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Manual Skill Add State
  const [newSkillName, setNewSkillName] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // --- 1. Initial Data Fetch ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }

      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, lessonsRes] = await Promise.all([
        fetch('/api/users/me', { headers }),
        fetch('/api/lessons?role=student&status=CONFIRMED', { headers })
      ]);

      const userData = await userRes.json();
      const lessonsData = await lessonsRes.json();

      setUser(userData);
      setEditForm({ 
        name: userData.name, 
        bio: userData.bio || '', 
        location: userData.location || '' 
      });
      
      const future = (lessonsData.lessons || []).filter((l: any) => 
        new Date(l.scheduledAt) > new Date()
      );
      setUpcomingLessons(future);

    } catch (error) {
      console.error('Load failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. Action Handlers ---
  
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
      setUser(prev => prev ? { ...prev, profileImage: data.url } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // --- UPDATED: Manual Add Skill ---
  const handleAddManualSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsAddingSkill(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          skillName: newSkillName, // Send Name instead of ID
          type: 'learn' 
        })
      });
      
      if (res.ok) {
        setNewSkillName('');
        await fetchData(); // Refresh to see the new skill
      }
    } catch (error) {
      console.error('Failed to add skill', error);
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    const token = localStorage.getItem('token');
    await fetch('/api/users/me/skills', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ skillId, type: 'learn' })
    });
    setUser(prev => prev ? {
      ...prev,
      skillsToLearn: prev.skillsToLearn.filter(s => s.id !== skillId)
    } : null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return <div className="p-8 text-center">User not found. Please log in again.</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-20">
      
      {/* Header (Same as before) */}
      <div className="bg-black text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-800 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-end gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden bg-gray-800 shrink-0">
              <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=333&color=fff`} className="w-full h-full object-cover" alt="Profile" />
              {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-2 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform"><Camera size={16} /></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="flex-1 mb-2">
            <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
            <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
              <span className="flex items-center gap-1"><MapPin size={14} /> {user.location || 'No location set'}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(user.createdAt).getFullYear()}</span>
            </div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full font-bold text-sm transition-all">
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid md:grid-cols-12 gap-8">

          {/* Stats & Bio */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div><div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Lessons Taken</div><div className="text-3xl font-black">{user.stats?.lessonsAsStudent || 0}</div></div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center"><BookOpen size={24} /></div>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div className="flex justify-between items-center">
                <div><div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Reviews Given</div><div className="text-3xl font-black">{user.stats?.totalReviews || 0}</div></div>
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><CheckCircle2 size={24} /></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 text-lg">About Me</h3>
              {isEditing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Full Name</label><input className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-black transition-colors font-medium" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Location</label><input className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-black transition-colors font-medium" placeholder="e.g. New York, USA" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Bio</label><textarea className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-black transition-colors h-32 resize-none font-medium" placeholder="Tell teachers about your goals..." value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} /></div>
                  <button onClick={handleSaveProfile} className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-lg"><Save size={16} /> Save Changes</button>
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed text-sm">{user.bio || "No bio added yet. Click edit to introduce yourself!"}</p>
              )}
            </div>
          </div>

          {/* Right Col */}
          <div className="md:col-span-8 space-y-8">
            
            {/* Upcoming Schedule */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Clock size={20} /> Upcoming Lessons</h2>
              {upcomingLessons.length > 0 ? (
                <div className="space-y-3">
                  {upcomingLessons.map(lesson => (
                    <div key={lesson.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between hover:shadow-md transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="bg-black text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                          <span className="text-xs font-bold uppercase tracking-wider">{new Date(lesson.scheduledAt).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className="text-2xl font-black">{new Date(lesson.scheduledAt).getDate()}</span>
                        </div>
                        <div>
                          <div className="font-bold text-lg">{lesson.title}</div>
                          <div className="text-gray-500 text-sm flex items-center gap-2 font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{new Date(lesson.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • with {lesson.teacher.name}
                          </div>
                        </div>
                      </div>
                      <button className="p-3 bg-gray-100 rounded-full text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Video size={20} /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-10 text-center text-gray-400">
                  <Calendar size={40} className="mx-auto mb-4 opacity-20" /><p className="font-medium">No upcoming lessons booked.</p>
                </div>
              )}
            </div>

            {/* --- UPDATED: Manual Skill Add Section --- */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen size={20} /> Skills I Want to Learn
              </h2>
              
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-visible">
                
                {/* Manual Input Form */}
                <form onSubmit={handleAddManualSkill} className="relative mb-8 z-50 flex gap-2">
                  <div className="relative flex-1">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-4 pl-12 pr-4 font-medium outline-none focus:bg-white focus:border-black transition-all placeholder:text-gray-400 shadow-sm"
                      placeholder="Type a skill to add (e.g. 'Advanced Python')..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      disabled={isAddingSkill}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isAddingSkill || !newSkillName.trim()}
                    className="bg-black text-white px-6 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isAddingSkill ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                  </button>
                </form>

                {/* Skills List */}
                <div className="flex flex-wrap gap-3">
                  {user.skillsToLearn.length > 0 ? (
                    user.skillsToLearn.map(skill => (
                      <div key={skill.id} className="group bg-black text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-3 shadow-md transition-all hover:scale-105">
                        {skill.name}
                        <button 
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="bg-white/20 p-1 rounded-full hover:bg-white/40 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                      <p className="text-gray-400 text-sm font-medium">
                        Your skill list is empty.<br/>Type a skill above to start your journey!
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}