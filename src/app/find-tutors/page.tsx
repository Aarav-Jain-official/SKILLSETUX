'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, MapPin, Star, ArrowRight, Loader2, 
  Filter, SlidersHorizontal, DollarSign 
} from 'lucide-react';

// --- Types ---
interface Teacher {
  id: string;
  name: string;
  bio: string | null;
  profileImage: string | null;
  hourlyRate: number | null;
  location: string | null;
  averageRating: number;
  totalReviews: number;
  skillsToTeach: { id: string; name: string; category: string }[];
}

export default function FindTutorsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.append('query', debouncedQuery);
        
        const res = await fetch(`/api/teachers?${params.toString()}`);
        const data = await res.json();
        setTeachers(data.teachers || []);
      } catch (error) {
        console.error('Failed to fetch teachers', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      
      {/* --- Search Header --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Logo/Back */}
            <Link href="/" className="font-bold text-xl tracking-tight mr-4 hidden md:block">
              SkillSetu
            </Link>

            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white border-2 border-transparent focus:border-black rounded-xl py-3 pl-12 pr-4 transition-all outline-none font-medium"
                placeholder="What do you want to learn? (e.g. Python, Piano, Yoga)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Buttons (Visual Only for MVP) */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              <button className="px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm hover:border-black flex items-center gap-2 whitespace-nowrap bg-white">
                <SlidersHorizontal size={16} /> Filters
              </button>
              <button className="px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm hover:border-black flex items-center gap-2 whitespace-nowrap bg-white">
                <DollarSign size={16} /> Price
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Finding the best mentors for you...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold">
                {searchQuery ? `Results for "${searchQuery}"` : "Top Rated Mentors"}
              </h2>
              <span className="text-sm text-gray-500 font-medium">{teachers.length} teachers found</span>
            </div>

            {/* Teacher Grid */}
            {teachers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-[2rem] border border-gray-200 p-12 text-center max-w-2xl mx-auto mt-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No teachers found</h3>
                <p className="text-gray-500 mb-8">
                  We couldn't find any mentors matching "{searchQuery}". Try searching for a broader category like "Music" or "Code".
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
                >
                  View All Teachers
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// --- Sub-Component: Teacher Card ---
function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 border border-gray-200 hover:border-black hover:shadow-lg transition-all group flex flex-col h-full relative overflow-hidden">
      
      {/* Top: Profile & Rating */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
            <img 
              src={teacher.profileImage || `https://ui-avatars.com/api/?name=${teacher.name}`} 
              className="w-full h-full object-cover" 
              alt={teacher.name}
            />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{teacher.name}</h3>
            {teacher.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 font-medium">
                <MapPin size={12} /> {teacher.location}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 font-bold text-sm">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            {teacher.averageRating.toFixed(1)}
          </div>
          <span className="text-xs text-gray-400">({teacher.totalReviews} reviews)</span>
        </div>
      </div>

      {/* Bio Truncated */}
      <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
        {teacher.bio || "No bio available. Ask me about my teaching style!"}
      </p>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {teacher.skillsToTeach.length > 0 ? (
          teacher.skillsToTeach.map(skill => (
            <span key={skill.id} className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-md border border-gray-100">
              {skill.name}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">No specific skills listed</span>
        )}
      </div>

      {/* Footer: Price & Action */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rate</span>
          <div className="text-xl font-black">
            ${teacher.hourlyRate || 0}<span className="text-sm font-medium text-gray-400">/hr</span>
          </div>
        </div>
        
        {/* Note: This button would link to a detailed profile page */}
        <Link href={`/tutors/${teacher.id}`} className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
          <ArrowRight size={20} />
        </Link>
      </div>

    </div>
  );
}