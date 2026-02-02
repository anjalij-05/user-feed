import {
  Calendar,
  Users,
  Ticket,
  BarChart3,
  Mail,
  QrCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Event Creation & Scheduling",
      description:
        "Build beautiful event pages in minutes. Set schedules, sessions, and manage multiple tracks effortlessly.",
      gradient: "from-blue-500 to-cyan-400",
      bgGradient: "from-blue-50 to-cyan-50",
      shadowColor: "shadow-blue-500/20",
      highlights: [
        "Drag & drop builder",
        "Multi-track support",
        "Custom branding",
      ],
    },
    {
      icon: Users,
      title: "Attendee Management",
      description:
        "Track registrations, manage guest lists, and segment attendees. Full CRM integration included.",
      gradient: "from-violet-500 to-purple-400",
      bgGradient: "from-violet-50 to-purple-50",
      shadowColor: "shadow-violet-500/20",
      highlights: ["Guest list management", "CRM integration", "Custom fields"],
    },
    {
      icon: Ticket,
      title: "Ticketing & Registration",
      description:
        "Sell tickets, offer early-bird pricing, and manage promo codes. Secure payments with instant confirmation.",
      gradient: "from-orange-500 to-amber-400",
      bgGradient: "from-orange-50 to-amber-50",
      shadowColor: "shadow-orange-500/20",
      highlights: ["Early-bird pricing", "Promo codes", "Instant confirmation"],
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description:
        "Real-time dashboards show attendance, revenue, and engagement. Export detailed reports instantly.",
      gradient: "from-emerald-500 to-green-400",
      bgGradient: "from-emerald-50 to-green-50",
      shadowColor: "shadow-emerald-500/20",
      highlights: ["Real-time data", "Revenue tracking", "Export reports"],
    },
    {
      icon: QrCode,
      title: "Fast Check-In System",
      description:
        "Contactless QR code check-in for quick entry. Track arrivals in real-time with live attendance updates.",
      gradient: "from-pink-500 to-rose-400",
      bgGradient: "from-pink-50 to-rose-50",
      shadowColor: "shadow-pink-500/20",
      highlights: ["QR code scanning", "Live tracking", "Mobile app"],
    },
    {
      icon: Mail,
      title: "Communication Hub",
      description:
        "Send branded emails, SMS reminders, and push notifications. Keep attendees informed automatically.",
      gradient: "from-indigo-500 to-blue-400",
      bgGradient: "from-indigo-50 to-blue-50",
      shadowColor: "shadow-indigo-500/20",
      highlights: ["Email campaigns", "SMS reminders", "Auto notifications"],
    },
  ];

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-linear-to-b from-white via-slate-50 to-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <div className=" relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-600 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>All-in-One Event Platform</span>
          </div>

          <h2 className="font-bold text-3xl sm:text-2xl lg:text-3xl mb-6 leading-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Run Amazing Events
            </span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            A complete platform to plan, promote, and execute events of any
            size. From workshops to conferences.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              {/* Card */}
              <div className="relative bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col overflow-hidden">
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon container */}
                  <div className="mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg ${feature.shadowColor} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed flex-grow">
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2 mb-4">
                    {feature.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Learn more link */}
                  <div className="pt-4 border-t-2 border-slate-100 group-hover:border-slate-200 transition-colors">
                    <button className="flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Decorative corner element */}
                <div
                  className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500`}
                />
              </div>

              {/* Floating badge */}
              <div
                className={`absolute -top-3 -right-3 px-3 py-1.5 bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              >
                Popular
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl border-2 border-slate-200 shadow-xl max-w-4xl">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Want to see all features in action?
              </h3>
              <p className="text-slate-600">
                Book a free demo and discover how we can transform your events
              </p>
            </div>
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap">
              Book a Demo
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
