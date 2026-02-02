import { Calendar, Users, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Calendar,
      title: "Create Your Event",
      description:
        "Build beautiful event pages with ticketing, schedules, and custom branding in minutes.",
      features: ["Drag & drop builder", "Custom templates", "Instant setup"],
      color: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/50",
      bgGradient: "from-blue-50 to-blue-100",
    },
    {
      number: "02",
      icon: Users,
      title: "Manage Attendees",
      description:
        "Handle registrations, send communications, and track RSVPs from one dashboard.",
      features: ["Auto reminders", "Bulk messaging", "RSVP tracking"],
      color: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-500/50",
      bgGradient: "from-purple-50 to-purple-100",
    },
    {
      number: "03",
      icon: Zap,
      title: "Execute Flawlessly",
      description:
        "QR check-ins, real-time analytics, and on-site tools ensure smooth event delivery.",
      features: ["QR check-in", "Live analytics", "Mobile app"],
      color: "from-pink-500 to-pink-600",
      shadowColor: "shadow-pink-500/50",
      bgGradient: "from-pink-50 to-pink-100",
    },
  ];

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />

        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-600 text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" />
            <span>Simple & Powerful</span>
          </div>

          <h2 className="font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Get Started in{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            From creation to execution — launch successful events in minutes,
            not days.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-16 left-[calc(50%+3rem)] right-[-3rem] items-center justify-center z-0">
                  <div className="w-full h-0.5 bg-gradient-to-r from-slate-300 via-slate-200 to-transparent" />
                  <ArrowRight className="absolute right-0 w-5 h-5 text-slate-400" />
                </div>
              )}

              {/* Step card */}
              <div className="relative group">
                <div className="relative bg-white rounded-3xl border-2 border-slate-200 p-8 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    {/* Icon container */}
                    <div className="relative inline-block mb-6">
                      <div
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl ${step.shadowColor} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                      >
                        <step.icon className="w-10 h-10 text-white" />
                      </div>

                      {/* Step number badge */}
                      <div
                        className={`absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white border-2 border-current flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br ${step.color} text-white`}
                      >
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 text-slate-800 group-hover:text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-2">
                      {step.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 flex-shrink-0 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}
                            style={{ WebkitTextFillColor: "transparent" }}
                          />
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Decorative corner element */}
                  <div
                    className={`absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br ${step.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500`}
                  />
                </div>
              </div>

              {/* Mobile connector arrow */}
              {index < steps.length - 1 && (
                <div className="flex md:hidden justify-center my-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-0.5 h-12 bg-gradient-to-b from-slate-300 to-transparent" />
                    <ArrowRight className="w-5 h-5 text-slate-400 rotate-90" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA section */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl border-2 border-slate-200 shadow-xl">
            <div className="flex-1 text-left">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Ready to get started?
              </h3>
              <p className="text-slate-600">
                Join thousands of event organizers who trust our platform
              </p>
            </div>
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
