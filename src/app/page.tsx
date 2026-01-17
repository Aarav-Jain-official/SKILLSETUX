'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Types ---
interface FeatureItem {
  id: number;
  title: string;
  subtitle: string;
  image?: string;
  video?: string;
  colSpan: string;
  theme: 'dark' | 'light';
}

// --- Data ---
const bentoGridItems: FeatureItem[] = [
  {
    id: 1,
    title: 'Live Learning',
    subtitle: 'Connect instantly via HD video with whiteboard & screen sharing.',
    video: 'https://www.pexels.com/download/video/4487961/',
    colSpan: 'md:col-span-2',
    theme: 'dark'
  },
  {
    id: 2,
    title: 'Verified Skills',
    subtitle: 'Earn digital badges and certificates.',
    // ✅ FIXED: Changed 'image' to 'video'
    video: 'https://www.pexels.com/download/video/4928371/', 
    colSpan: 'md:col-span-1',
    theme: 'light'
  },
  {
    id: 3,
    title: 'Smart Matching',
    subtitle: 'AI finds your perfect tutor in seconds.',
    // ✅ FIXED: Changed 'image' to 'video'
    video: 'https://www.pexels.com/download/video/6985491/', 
    colSpan: 'md:col-span-1',
    theme: 'light'
  },
  {
    id: 4,
    title: 'Global Payments',
    subtitle: 'Get paid in your local currency, anywhere in the world.',
    video: 'https://www.pexels.com/download/video/5981353/',
    colSpan: 'md:col-span-2',
    theme: 'dark'
  }
];

export default function SkillSetuLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [visibleElements, setVisibleElements] = useState<Set<number>>(new Set());
  const elementRefs = useRef<Map<number, HTMLElement | null>>(new Map());

  // Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      elementRefs.current.forEach((element, id) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          setVisibleElements((prev) => new Set(prev).add(id));
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* --- Navbar --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${scrollY > 50 ? 'bg-black' : 'bg-white'} rounded-lg flex items-center justify-center`}>
              <div className={`w-4 h-4 ${scrollY > 50 ? 'bg-white' : 'bg-black'} rounded-sm`}></div>
            </div>
            <span className={`font-bold text-xl tracking-tight ${scrollY > 50 ? 'text-black' : 'text-white'}`}>SkillSetu</span>
          </div>
          
          <div className={`hidden md:flex gap-8 items-center font-medium ${scrollY > 50 ? 'text-gray-900' : 'text-white'}`}>
            <Link href="/auth/login" className="hover:opacity-60 transition-opacity text-sm font-semibold">Log In</Link>
            <Link href="/auth/register">
              <button className={`px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 ${scrollY > 50 ? 'bg-black text-white' : 'bg-white text-black'}`}>
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Section 1: Hero --- */}
      <section className="relative h-[90vh] w-full overflow-hidden bg-black flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="https://pw-assets-production-c.squarecdn.com/video/5mObdhW0r5D0lyp3iVJFA6/b4d81931-7cfa-4402-bb41-efc4126e3f95-en-ee526a6b-3ca3-4ae5-9bc2-be60cb21229f-en-Homepage_Edit-updated.webm" type="video/webm" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 w-full pt-20">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-[0.95] tracking-tight">
              Unlock your <br />
              <span className="text-gray-400">true potential.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-xl leading-relaxed">
              The world's largest marketplace for 1-on-1 live learning. Connect with experts, master new skills, and grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <button className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-colors">
                  Find a Mentor
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="px-10 py-5 bg-transparent border border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                  Teach & Earn
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Value Prop --- */}
      <section className="py-32 bg-white px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Knowledge has no borders.
          </h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            From coding in Python to playing the guitar, find the perfect teacher for your unique learning style and schedule.
          </p>
        </div>
      </section>

      {/* --- Section 3: Mobile App Feature --- */}
      <section className="py-12 bg-gray-50 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="bg-black rounded-[3rem] overflow-hidden text-white relative min-h-[800px] flex flex-col md:flex-row items-center">
            
            {/* Content Side */}
            <div className="flex-1 p-12 md:p-24 z-10">
              <div className="uppercase tracking-widest text-sm font-bold text-gray-400 mb-6">For Mentors</div>
              <h3 className="text-5xl md:text-7xl font-bold mb-8 leading-none">
                Teach from anywhere, <br />earn anytime.
              </h3>
              <p className="text-xl text-gray-400 mb-10 max-w-md">
                Manage your classes, track earnings, and chat with students directly from our powerful mobile dashboard.
              </p>
              <Link href="/auth/register">
                <button className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
                  Start Teaching Today
                </button>
              </Link>
            </div>

            {/* Video Side */}
            <div className="flex-1 h-full w-full relative min-h-[500px] md:min-h-full flex items-center justify-center">
              <div className="relative w-[300px] md:w-[400px] aspect-[9/16] rounded-3xl overflow-hidden border-8 border-gray-800 shadow-2xl rotate-3 md:absolute md:right-24 md:top-1/2 md:-translate-y-1/2">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                   <source src="https://www.pexels.com/download/video/8519528/" type="video/webm" />
                </video>
              </div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

          </div>
        </div>
      </section>

      {/* --- Section 4: Features Grid --- */}
      <section className="py-24 bg-white px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bentoGridItems.map((item, idx) => (
               <div 
                 key={item.id}
                 ref={(el) => { if(el) elementRefs.current.set(idx, el) }}
                 className={`${item.colSpan} relative rounded-[2.5rem] overflow-hidden min-h-[400px] group transition-all duration-700
                   ${visibleElements.has(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                 `}
                 style={{ transitionDelay: `${idx * 100}ms` }}
               >
                 <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                   {item.video ? (
                     <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
                       <source src={item.video} type="video/webm" />
                     </video>
                   ) : (
                     <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                   )}
                   <div className={`absolute inset-0 ${item.theme === 'dark' ? 'bg-black/40' : 'bg-black/10'}`}></div>
                 </div>

                 <div className={`relative h-full flex flex-col justify-end p-10 ${item.theme === 'dark' ? 'text-white' : 'text-white'}`}>
                   <h3 className="text-3xl md:text-4xl font-bold mb-2">{item.title}</h3>
                   <p className="text-lg opacity-90 font-medium">{item.subtitle}</p>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 5: Trust --- */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0">
           <video
              className="w-full h-full object-cover blur-sm brightness-50 grayscale"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="https://pw-assets-production-c.squarecdn.com/video/5mObdhW0r5D0lyp3iVJFA6/b4d81931-7cfa-4402-bb41-efc4126e3f95-en-ee526a6b-3ca3-4ae5-9bc2-be60cb21229f-en-Homepage_Edit-updated.webm" type="video/webm" />
            </video>
        </div>
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-white max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-bold mb-6">Learning for Teams.</h2>
            <p className="text-xl text-gray-300 mb-8">
              Upskill your entire workforce with enterprise-grade learning paths and mentorship.
            </p>
            <Link href="/auth/register" className="inline-flex items-center text-white font-bold text-lg hover:underline decoration-2 underline-offset-4">
              Explore Enterprise Plans &rarr;
            </Link>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl max-w-sm">
             <div className="text-4xl font-bold text-white mb-2">10k+</div>
             <div className="text-gray-300 text-sm mb-6">Active students learning daily.</div>
             <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
             <div className="text-gray-300 text-sm">Average lesson rating across the platform.</div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white text-black py-20 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
           <div className="col-span-2 lg:col-span-2">
             <h4 className="font-bold text-2xl mb-6">SkillSetu</h4>
             <select className="bg-gray-100 border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-200">
               <option>🇺🇸 English (US)</option>
               <option>🇮🇳 English (IN)</option>
               <option>🇪🇸 Español</option>
             </select>
           </div>
           
           {[
             { title: 'Learn', links: ['Find Tutors', 'By Category', 'Online Courses', 'Learning Paths'] },
             { title: 'Teach', links: ['Become a Mentor', 'Teacher Rules', 'Success Stories', 'Teacher Dashboard'] },
             { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
             { title: 'Support', links: ['Help Center', 'Safety', 'Community Guidelines', 'Contact Us'] },
           ].map((col) => (
             <div key={col.title}>
               <h5 className="font-bold mb-4">{col.title}</h5>
               <ul className="space-y-3">
                 {col.links.map(link => (
                   <li key={link}>
                     <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">{link}</a>
                   </li>
                 ))}
               </ul>
             </div>
           ))}
        </div>
        <div className="max-w-[1600px] mx-auto mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between text-gray-500 text-sm">
          <p>© 2026 SkillSetu Inc. Empowering global learning.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
            <a href="#" className="hover:text-black">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
}