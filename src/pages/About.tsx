import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function About() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-neutral-950">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=2000" 
            alt="About Hero" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Our Story
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-300 max-w-2xl mx-auto"
          >
            Redefining how memorable events are planned, connected, and celebrated.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">The Platform for Exceptional Events</h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Founded with a simple vision: to make event planning a joyous experience rather than a stressful chore. We noticed that finding reliable, high-quality event professionals was often the hardest part of hosting a successful gathering.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                MySpace bridges the gap between talented vendors and clients looking to create unforgettable moments. We've built a marketplace that emphasizes transparency, quality, and direct communication.
              </p>

              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Our Mission</h3>
              <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                To empower event professionals to grow their businesses while providing clients with a seamless, inspiring way to discover and book the talent they need.
              </p>

              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Our Vision</h3>
              <p className="text-lg text-neutral-600 leading-relaxed">
                A world where every celebration, gathering, and corporate event is executed flawlessly, bringing people together without the friction of complex planning.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-4 pt-12">
                <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600" alt="Wedding" className="rounded-[2rem] w-full h-64 object-cover shadow-lg" />
                <img src="https://images.unsplash.com/photo-1530103862676-de88bdf40809?auto=format&fit=crop&q=80&w=600" alt="Party" className="rounded-[2rem] w-full h-80 object-cover shadow-lg" />
              </div>
              <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600" alt="Corporate Event" className="rounded-[2rem] w-full h-80 object-cover shadow-lg" />
                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600" alt="Reception" className="rounded-[2rem] w-full h-64 object-cover shadow-lg" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-orange-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">Why Choose MySpace</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Curated Excellence",
                desc: "Every vendor on our platform passes a strict quality check. We only feature professionals with proven track records."
              },
              {
                title: "Direct Connection",
                desc: "No middlemen. Chat directly with vendors via WhatsApp to get quotes, discuss ideas, and finalize details."
              },
              {
                title: "Transparent Pricing",
                desc: "See starting prices and package details upfront. No hidden fees, just honest professional services."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-orange-600 mb-6" />
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
