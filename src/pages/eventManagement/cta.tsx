import { Button } from "@/components/ui/button";
import {Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl gradient-cta p-8 sm:p-12 lg:p-16">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Limited Time Offer</span>
            </div>

            {/* Heading */}
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Events?
            </h2>

            {/* Description */}
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of event organizers who plan, manage, and execute
              successful events with our all-in-one platform.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* <Button
                size="xl"
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button> */}
              <Button
                // size="xl"
                variant="ghost"
                className="text-white border-2 border-white/30 hover:bg-white/10"
              >
                Schedule a Demo
              </Button>
            </div>

            {/* Trust text */}
            <p className="mt-6 text-sm text-white/60">
              ✓ 14-day free trial · ✓ No credit card required · ✓ Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
