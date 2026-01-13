import {
  Download,
  Award,
  BadgeCheck,
  Clock,
  Flame,
  Trophy,
  Star,
} from "lucide-react";

/* =======================
   Certificates Data
======================= */
const certificates = [
  {
    id: 1,
    title: "Full Stack Web Development",
    issuedBy: "Acme Learning",
    date: "Aug 2025",
    status: "Verified",
    badges: ["Full Stack", "React", "Node.js"],
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    issuedBy: "Acme Learning",
    date: "Jun 2025",
    status: "Verified",
    badges: ["UI Design", "UX Research", "Figma"],
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    issuedBy: "Acme Learning",
    date: "Mar 2025",
    status: "In Progress",
    badges: ["DSA", "Problem Solving"],
  },
];

/* =======================
   Achievement Badges
======================= */
const achievementBadges = [
  {
    id: 1,
    title: "100 Days of Code",
    description: "Completed a 100-day coding streak",
    icon: Flame,
    color: "rose",
  },
  {
    id: 2,
    title: "Completed 10 Trainings",
    description: "Completed 10 trainings this year!",
    icon: Trophy,
    color: "amber",
  },
  {
    id: 3,
    title: "Frontend Mastery",
    description: "Completed all frontend tracks",
    icon: Star,
    color: "indigo",
  },
];

export default function CertificatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* =======================
            Header
        ======================= */}
        <div className="flex items-center gap-3">
          <Award className="h-9 w-9 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900">
            My Certificates & Achievements
          </h1>
        </div>

        {/* =======================
            Certificates Grid
        ======================= */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">
            Certificates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="p-6 flex flex-col gap-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {cert.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Issued by {cert.issuedBy}
                    </p>
                  </div>

                  {/* Date & Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Issued: {cert.date}
                    </span>

                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                        cert.status === "Verified"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {cert.status === "Verified" ? (
                        <BadgeCheck className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {cert.status}
                    </span>
                  </div>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-2">
                    {cert.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600 font-medium"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Download Button */}
                  <button
                    disabled={cert.status !== "Verified"}
                    className={`mt-2 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      cert.status === "Verified"
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    Download Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =======================
            Achievement Badges
        ======================= */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">
            Achievement Badges
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievementBadges.map((badge) => {
              const Icon = badge.icon;

              return (
                <div
                  key={badge.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center bg-${badge.color}-100 text-${badge.color}-600`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {badge.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
