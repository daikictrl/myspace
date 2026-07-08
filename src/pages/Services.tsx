import { Link } from "react-router-dom";
import { servicesData } from "@/data/servicesData";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

export default function Services() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-neutral-950">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=2000" 
            alt="Event Services" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/50 to-neutral-950/80" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
          >
            Our <span className="text-orange-500">Services</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-neutral-300 leading-relaxed"
          >
            Browse through our comprehensive range of event services and find the perfect professionals for your needs.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-24">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, i) => {
            // @ts-ignore
            const Icon = Icons[service.icon] || Icons.Star;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/explore-vendors?category=${service.name}`} className="block h-full">
                  <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-neutral-100 h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={service.image} 
                        alt={service.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-neutral-500 line-clamp-2 flex-1">
                        {service.description}
                      </p>
                      <div className="mt-6 flex items-center text-sm font-medium text-orange-600">
                        Find Providers &rarr;
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
