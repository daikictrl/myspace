import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, CheckCircle2, MessageCircle, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { servicesData } from "@/data/servicesData";
import { Card, CardContent } from "@/components/ui/card";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [featuredVendors, setFeaturedVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const popularServices = servicesData.slice(0, 4);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const { data, error } = await supabase
          .from("vendors")
          .select(`
            *,
            profiles (
              whatsapp_number,
              full_name
            )
          `)
          .order("rating", { ascending: false })
          .limit(3);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map((v: any) => ({
            id: v.id,
            name: v.business_name || "Unknown Business",
            category: v.service_categories?.[0] || "Uncategorized",
            serviceCategories: v.service_categories || [],
            description: v.description || "",
            location: v.service_areas?.join(", ") || "Cameroon",
            startingPrice: v.pricing_range || "Contact",
            logo: v.logo_url || "https://images.unsplash.com/photo-1554046920-90dcac824b20?auto=format&fit=crop&q=80&w=150",
            rating: v.rating || 5.0,
            reviewsCount: v.reviews_count || 0,
            portfolio: v.portfolio && v.portfolio.length > 0 ? v.portfolio : [v.cover_image_url || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800"],
            phone: v.profiles?.whatsapp_number || ""
          }));
          setFeaturedVendors(mapped);
        } else {
          setFeaturedVendors([]);
        }
      } catch (err) {
        console.error("Error loading featured vendors:", err);
        setFeaturedVendors([]);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative pt-48 pb-40 flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000" 
            alt="Event Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-neutral-900/60 mix-blend-multiply" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl mx-auto tracking-tight"
          >
            Craft Your Perfect Event with Top Professionals
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto"
          >
            Discover, compare, and connect directly with the best vendors for weddings, parties, and corporate events.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 max-w-3xl mx-auto bg-white p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center px-4 w-full md:w-auto">
              <Search className="w-5 h-5 text-neutral-400 shrink-0" />
              <Input 
                type="text" 
                placeholder="What service are you looking for?" 
                className="border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base px-3"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-neutral-200" />
            <div className="flex-1 flex items-center px-4 w-full md:w-auto border-t md:border-t-0 border-neutral-100 pt-2 md:pt-0">
              <MapPin className="w-5 h-5 text-neutral-400 shrink-0" />
              <Input 
                type="text" 
                placeholder="Where?" 
                className="border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base px-3"
              />
            </div>
            <Button size="lg" className="w-full md:w-auto rounded-full px-8 text-base h-12">
              Search
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/20 pt-10">
            {[
              { label: "Verified Vendors", value: 500, suffix: "+" },
              { label: "Events Planned", value: 1200, suffix: "+" },
              { label: "Happy Clients", value: 50, suffix: "k" },
              { label: "Cities", value: 25, suffix: "" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-white flex items-center">
                  <CountUp end={stat.value} duration={2.5} />
                  {stat.suffix}
                </div>
                <div className="text-sm text-neutral-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">Popular Services</h2>
            <p className="text-neutral-500 mt-2">Find exactly what you need for your next event.</p>
          </div>
          <Link to="/services" className="hidden md:block text-orange-600 font-medium hover:underline">
            View all services &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularServices.map((service, i) => (
            <Link key={service.id} to={`/explore-vendors?category=${service.name}`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-xl font-bold text-white">{service.name}</h3>
                  <p className="text-neutral-200 text-sm mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-orange-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">How It Works</h2>
            <p className="text-neutral-500 mt-4 text-lg">Your perfect event is just three steps away.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-orange-200 -z-10" />
            
            {[
              {
                icon: Search,
                title: "1. Browse Vendors",
                desc: "Search our curated list of professional event vendors by category and location."
              },
              {
                icon: CheckCircle2,
                title: "2. View Profiles",
                desc: "Check out portfolios, read reviews, and compare pricing packages."
              },
              {
                icon: MessageCircle,
                title: "3. Connect Directly",
                desc: "Reach out via WhatsApp instantly to discuss your needs and book."
              }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mb-6 text-orange-600">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{step.title}</h3>
                <p className="text-neutral-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">Featured Professionals</h2>
            <p className="text-neutral-500 mt-2">Highly rated vendors trusted by our community.</p>
          </div>
          <Link to="/explore-vendors" className="hidden md:block text-orange-600 font-medium hover:underline">
            View all vendors &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-4" />
            <p className="text-sm font-semibold text-neutral-600">Loading professionals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVendors.map((vendor, i) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-md">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={vendor.portfolio[0]} 
                      alt={vendor.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {vendor.rating}
                    </div>
                    <div className="absolute -bottom-6 left-6">
                      <div className="w-16 h-16 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-sm">
                        <img src={vendor.logo} alt={`${vendor.name} logo`} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-10 pb-6 px-6">
                    <div className="text-sm font-medium text-orange-600 mb-1">{vendor.category}</div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-1">{vendor.name}</h3>
                    <div className="flex items-center text-neutral-500 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1 shrink-0" />
                      {vendor.location}
                    </div>
                    <p className="text-neutral-600 text-sm line-clamp-2 mb-6">
                      {vendor.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-auto">
                      <div>
                        <span className="text-xs text-neutral-500 block">Starting from</span>
                        <span className="text-lg font-bold text-neutral-900">
                          {typeof vendor.startingPrice === "number" ? `$${vendor.startingPrice}` : vendor.startingPrice}
                        </span>
                      </div>
                      <Link to={`/vendor/${vendor.id}`}>
                        <Button variant="outline" className="rounded-full font-semibold">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-neutral-950 rounded-[3rem] overflow-hidden relative">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000" 
              alt="CTA Background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 px-6 py-24 md:py-32 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white max-w-2xl mb-6">
              Ready to create something unforgettable?
            </h2>
            <p className="text-lg text-neutral-300 max-w-xl mb-10">
              Browse our marketplace of curated professionals and start planning your perfect event today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/explore-vendors">
                <Button size="lg" className="rounded-full h-14 px-8 text-base w-full sm:w-auto">
                  Browse Vendors
                </Button>
              </Link>
              <Link to="/vendors">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto">
                  Join as Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
