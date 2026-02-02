import Header from "./header";
import Hero from "./hero";
import Features from "./feature";
import HowItWorks from "./howItWorks";
import Testimonials from "./testimonial";
import ContactForm from "./contactForm";
import CTA from "./cta";

const EventManagement = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <ContactForm />
        <CTA />
      </main>
    </div>
  );
};

export default EventManagement;
