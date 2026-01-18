'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  MapPin, Star, Clock, Calendar, ShieldCheck, 
  ArrowLeft, CheckCircle2, Loader2, BookOpen 
} from 'lucide-react';

// --- Types ---
interface TeacherProfile {
  id: string;
  name: string;
  bio: string;
  profileImage: string;
  location: string;
  hourlyRate: number;
  averageRating: number;
  totalReviews: number;
  lessonsGiven: number;
  skillsToTeach: { id: string; name: string; category: string }[];
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  teacherLessons: { scheduledAt: string; duration: number }[];
}

export default function TeacherDetailPage() {
  const params = useParams();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // --- Fetch Teacher ---
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`/api/teachers/${params.id}`);
        const data = await res.json();
        setTeacher(data);
        if (data.skillsToTeach?.length > 0) {
          setSelectedSkill(data.skillsToTeach[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [params.id]);

  // --- Generate Time Slots ---
  const generateSlots = () => {
    if (!teacher) return [];

    const dayOfWeek = selectedDate.getDay(); // 0 = Sun, 1 = Mon
    const dayRules = teacher.availability.filter(a => a.dayOfWeek === dayOfWeek);
    
    // Sort rules by start time
    dayRules.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const slots: string[] = [];

    dayRules.forEach(rule => {
      let current = parseInt(rule.startTime.split(':')[0]); // e.g., 9
      const end = parseInt(rule.endTime.split(':')[0]); // e.g., 17

      while (current < end) {
        // Format: "09:00"
        const timeString = `${current.toString().padStart(2, '0')}:00`;
        
        // Check if this slot is in the past (for today)
        const slotDate = new Date(selectedDate);
        slotDate.setHours(current, 0, 0, 0);
        
        if (slotDate > new Date()) {
          // Check collision with existing bookings
          const isTaken = teacher.teacherLessons.some(lesson => {
            const lessonTime = new Date(lesson.scheduledAt);
            return Math.abs(lessonTime.getTime() - slotDate.getTime()) < 60 * 60 * 1000; // Overlaps within 1 hour
          });

          if (!isTaken) {
            slots.push(timeString);
          }
        }
        current++;
      }
    });

    return slots;
  };

  const slots = generateSlots();

  // --- Handle Booking ---
  const handleBookLesson = async () => {
    if (!selectedSlot || !teacher) return;
    setIsBooking(true);

    // Combine date and time
    const [hours, minutes] = selectedSlot.split(':');
    const finalDate = new Date(selectedDate);
    finalDate.setHours(parseInt(hours), parseInt(minutes));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login'; // Simple redirect for MVP
        return;
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          teacherId: teacher.id,
          skillId: selectedSkill,
          startTime: finalDate.toISOString(),
          price: teacher.hourlyRate
        })
      });

      if (res.ok) {
        setBookingSuccess(true);
      }
    } catch (error) {
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // --- Date Scroller Helper ---
  const getNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!teacher) return <div className="p-10 text-center">Teacher not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      
      {/* Nav */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/find-tutors" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={16} /> Back to Search
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 grid lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COL: Profile Info (Span 2) --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                <img 
                  src={teacher.profileImage || `https://ui-avatars.com/api/?name=${teacher.name}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{teacher.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium mb-4">
                  <span className="flex items-center gap-1"><MapPin size={16} /> {teacher.location || 'Remote'}</span>
                  <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500 fill-yellow-500" /> {teacher.averageRating.toFixed(1)} ({teacher.totalReviews} reviews)</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-blue-500" /> Verified Tutor</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teacher.skillsToTeach.map(skill => (
                    <span key={skill.id} className="px-3 py-1 bg-black text-white text-xs font-bold rounded-lg">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">About Me</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {teacher.bio || "This teacher hasn't written a bio yet, but they are ready to help you learn!"}
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-200 text-center">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1">Lessons Taught</div>
              <div className="text-3xl font-black">{teacher.lessonsGiven}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-200 text-center">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1">Response Time</div>
              <div className="text-3xl font-black">~1 hr</div>
            </div>
          </div>

        </div>

        {/* --- RIGHT COL: Booking Widget (Span 1) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-xl sticky top-8">
            
            {bookingSuccess ? (
              <div className="text-center py-10 animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Booking Sent!</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Your request has been sent to {teacher.name}. You will be notified once they accept.
                </p>
                <Link href="/dashboard/learner">
                  <button className="w-full py-3 bg-black text-white rounded-xl font-bold">
                    Go to Dashboard
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-3xl font-black">${teacher.hourlyRate}</span>
                    <span className="text-gray-500 font-medium text-sm"> / hour</span>
                  </div>
                </div>

                {/* Skill Selector */}
                <div className="mb-6">
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Subject</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-sm outline-none focus:border-black transition-all"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                  >
                    {teacher.skillsToTeach.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date Picker (Horizontal) */}
                <div className="mb-6">
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Select Date</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {getNext7Days().map((date, i) => {
                      const isSelected = date.toDateString() === selectedDate.toDateString();
                      return (
                        <button
                          key={i}
                          onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                          className={`min-w-[4.5rem] p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                            isSelected 
                            ? 'bg-black text-white border-black shadow-md scale-105' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-black'
                          }`}
                        >
                          <span className="text-xs font-medium uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className="text-xl font-bold">{date.getDate()}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="mb-8">
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Available Slots ({slots.length})</label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {slots.length > 0 ? (
                      slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-1 text-sm rounded-lg font-bold border transition-all ${
                            selectedSlot === slot
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 hover:text-indigo-600'
                          }`}
                        >
                          {slot}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-3 py-6 text-center text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No slots available this day
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleBookLesson}
                  disabled={!selectedSlot || isBooking}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isBooking ? <Loader2 className="animate-spin" /> : <Clock size={20} />}
                  {isBooking ? 'Processing...' : 'Book Lesson'}
                </button>
                <p className="text-xs text-center text-gray-400 mt-4">Free cancellation up to 24 hours before.</p>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}