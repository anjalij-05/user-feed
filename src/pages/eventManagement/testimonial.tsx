import { Star, Quote, TrendingUp, Users, Award } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "We managed our 5,000+ attendee conference entirely through this platform. Registration, check-in, and analytics were flawless!",
      author: "Sarah Chen",
      role: "Event Director, TechSummit",
      rating: 5,
      avatar: "SC",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      company: "TechSummit",
    },
    {
      quote:
        "The ticketing and attendee management features saved us countless hours. Our events have never run smoother.",
      author: "Marcus Johnson",
      role: "CEO, EventPro Agency",
      rating: 5,
      avatar: "MJ",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      company: "EventPro",
    },
    {
      quote:
        "Finally, a platform that doesn't require a tech team. We went from idea to selling tickets in under an hour.",
      author: "Emily Rodriguez",
      role: "Marketing Lead, StartupWeek",
      rating: 5,
      avatar: "ER",
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-50 to-pink-100",
      company: "StartupWeek",
    },
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Happy Customers" },
    { icon: Award, value: "4.9/5", label: "Average Rating" },
    { icon: TrendingUp, value: "98%", label: "Would Recommend" },
  ];

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        {/* Decorative quotes */}
        <Quote className="absolute top-20 left-10 w-32 h-32 text-slate-200 opacity-30" />
        <Quote className="absolute bottom-20 right-10 w-32 h-32 text-slate-200 opacity-30 rotate-180" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 text-sm font-semibold mb-6">
            <Star className="w-4 h-4 fill-amber-600" />
            <span>Rated 4.9/5 by 10,000+ users</span>
          </div>

          <h2 className="font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Event Pros
            </span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            See why thousands of organizers choose us for their events.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group relative">
              {/* Card */}
              <div className="relative bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 h-full flex flex-col overflow-hidden">
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${testimonial.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Quote icon */}
                  <div className="mb-4">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${testimonial.color} shadow-lg`}
                    >
                      <Quote className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-slate-700 mb-6 leading-relaxed text-lg flex-grow">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t-2 border-slate-100 group-hover:border-slate-200 transition-colors">
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-lg">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-slate-600 font-medium">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative corner element */}
                <div
                  className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${testimonial.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500`}
                />
              </div>

              {/* Floating badge */}
              <div
                className={`absolute -top-3 -right-3 px-3 py-1.5 bg-gradient-to-r ${testimonial.color} text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              >
                Verified
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl border-2 border-slate-200 shadow-xl max-w-2xl">
            <div className="flex -space-x-4 mb-2">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm border-4 border-white shadow-lg`}
                >
                  {t.avatar}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Join 50,000+ happy event organizers
              </h3>
              <p className="text-slate-600 mb-4">
                Start creating amazing events today — no credit card required
              </p>
            </div>
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
