import { Button } from "@/components/ui/button";
import {
  Play,
  Sparkles,
  CheckCircle2,
  Calendar,
  Users,
  BarChart3,
  Zap,
  TrendingUp,
} from "lucide-react";

const Hero = () => {
  const benefits = [
    "Create events in minutes",
    "No technical skills needed",
    "All-in-one platform",
  ];

  const stats = [
    { value: "50K+", label: "Events Created" },
    { value: "2M+", label: "Attendees" },
    { value: "98%", label: "Satisfaction" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-32 lg:pt-10 lg:pb-40">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-blue-500/20 text-blue-600 text-sm font-semibold mb-8 hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/10">
              <Sparkles className="w-4 h-4" />
              <span>The #1 Event Management Platform</span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>

            {/* Enhanced Heading with gradient text */}
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight mb-6 tracking-tight">
              Plan & Manage Events{" "}
              <span className="relative inline-block">
                <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Effortlessly
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 5 100 2 150 3C200 4 250 7 298 10"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#9333EA" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Enhanced Subheading */}
            <p className="text-sm sm:text-xl lg:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              From registration to check-in — create stunning events, manage
              attendees, sell tickets & track everything in one powerful
              platform.
            </p>

            {/* Enhanced Benefits with icons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mb-10">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Enhanced CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button className="group bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-sm rounded-xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border-0">
                Start Free Trial
                <Zap className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Button>
              <Button className="group px-8 py-6 text-sm rounded-xl bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Trust badge */}
            <p className="text-sm text-slate-600 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                No credit card required
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                14-day free trial
              </span>
            </p>
          </div>

          {/* Right visual - Enhanced */}
          <div className="flex-1 w-full max-w-xl lg:max-w-xl">
            <div className="relative">
              {/* Main card with enhanced styling */}
              <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group">
                <div className="aspect-video bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-8 relative overflow-hidden">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:2rem_2rem]" />

                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50 group-hover:rotate-6 transition-transform duration-500">
                      <Calendar className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-slate-600 font-semibold text-lg">
                      Event Dashboard Preview
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Manage everything in one place
                    </p>
                  </div>
                </div>

                {/* Enhanced bottom bar */}
                <div className="p-6 bg-white border-t border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-base font-semibold text-slate-700">
                        3 Active Events
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-slate-700">
                        2,847 registered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced floating cards */}
              <div className="absolute -left-6 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      Total
                    </div>
                    <div className="text-sm font-bold text-slate-700">
                      Attendees
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 bottom-1/3 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      Live
                    </div>
                    <div className="text-sm font-bold text-slate-700">
                      Analytics
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 top-1/4 bg-white p-3 rounded-xl shadow-lg border border-slate-200 hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-xs font-bold text-slate-700">+24%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
