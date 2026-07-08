import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, MessageCircle, ArrowLeft, Check, Grid, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function VendorProfile() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendorData() {
      if (!id) return;
      try {
        const { data: vData, error: vError } = await supabase
          .from("vendors")
          .select(`
            *,
            profiles (
              whatsapp_number,
              full_name
            )
          `)
          .eq("id", id)
          .single();

        if (vError) throw vError;

        const { data: rData } = await supabase
          .from("reviews")
          .select(`
            id, rating, comment, created_at,
            profiles (
              full_name
            )
          `)
          .eq("vendor_id", id);

        const mappedReviews = (rData || []).map((r: any) => ({
          author: r.profiles?.full_name || "Anonymous Client",
          rating: r.rating || 5,
          text: r.comment || "",
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recently"
        }));

        const mappedVendor = {
          id: vData.id,
          name: vData.business_name || "Unknown Business",
          category: vData.service_categories?.[0] || "Uncategorized",
          description: vData.description || "",
          location: vData.service_areas?.join(", ") || "Cameroon",
          startingPrice: vData.pricing_range || "Contact",
          logo: vData.logo_url || "https://images.unsplash.com/photo-1554046920-90dcac824b20?auto=format&fit=crop&q=80&w=150",
          rating: vData.rating || 5.0,
          reviewsCount: vData.reviews_count || 0,
          portfolio: vData.portfolio && vData.portfolio.length > 0 ? vData.portfolio : [vData.cover_image_url || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800"],
          servicesOffered: vData.services_offered && vData.services_offered.length > 0 ? vData.services_offered : vData.service_categories || [],
          packages: vData.packages || [],
          reviews: mappedReviews,
          phone: vData.profiles?.whatsapp_number || ""
        };

        setVendor(mappedVendor);
      } catch (err) {
        console.error("Error loading vendor profile:", err);
        setVendor(null);
      } finally {
        setLoading(false);
      }
    }
    loadVendorData();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen flex flex-col items-center justify-center text-neutral-500 pt-24">
        <RefreshCw className="w-10 h-10 animate-spin text-orange-600 mb-4" />
        <p className="font-bold">Loading profile details...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="bg-neutral-50 min-h-screen flex flex-col items-center justify-center text-neutral-500 pt-24">
        <p className="font-bold mb-4">Vendor not found.</p>
        <Link to="/explore-vendors">
          <Button className="rounded-full">Back to Explore</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen pb-24 pt-24">
      <div className="container mx-auto px-4 py-8">
        <Link to="/explore-vendors" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vendors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-neutral-50 shrink-0 shadow-sm">
                  <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                    {vendor.category}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">{vendor.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-neutral-400" />
                      {vendor.location}
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-neutral-900 mr-1">{vendor.rating}</span>
                      ({vendor.reviewsCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-neutral-100">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">About the Business</h3>
                <p className="text-neutral-600 leading-relaxed">
                  {vendor.description}
                </p>
              </div>

              {vendor.servicesOffered && (
                <div className="mt-8 pt-8 border-t border-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">Services Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.servicesOffered.map((service, i) => (
                      <span key={i} className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Portfolio Gallery */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <Grid className="w-5 h-5 text-orange-600" />
                  Portfolio Gallery
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.portfolio.map((img, i) => (
                  <div key={i} className={`rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                    <img src={img} alt={`Portfolio item ${i + 1}`} className="w-full h-full object-cover aspect-square md:aspect-auto" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100"
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-600" />
                Client Reviews
              </h3>
              <div className="space-y-6">
                {vendor.reviews.map((review, i) => (
                  <div key={i} className="pb-6 border-b border-neutral-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-neutral-900">{review.author}</div>
                      <div className="text-sm text-neutral-500">{review.date}</div>
                    </div>
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`} />
                      ))}
                    </div>
                    <p className="text-neutral-600 italic">"{review.text}"</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar / Sticky Action Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2rem] p-6 shadow-xl shadow-neutral-200/50 border border-neutral-100"
              >
                <div className="text-center mb-6">
                  <p className="text-sm text-neutral-500 uppercase tracking-wider font-semibold mb-1">Starting Price</p>
                  <p className="text-3xl font-bold text-neutral-900">
                    {typeof vendor.startingPrice === "number" ? `$${vendor.startingPrice}` : vendor.startingPrice}
                  </p>
                </div>

                <a 
                  href={`https://wa.me/${vendor.phone}?text=Hi%20${vendor.name},%20I%20found%20you%20on%20MySpace!`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button size="lg" className="w-full rounded-2xl h-14 text-base bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20">
                    <MessageCircle className="w-5 h-5" />
                    Contact via WhatsApp
                  </Button>
                </a>
                <p className="text-xs text-center text-neutral-400 mt-4">Replies usually within an hour</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100"
              >
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Pricing Packages</h3>
                <div className="space-y-4">
                  {vendor.packages.map((pkg, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-neutral-900">{pkg.name}</h4>
                        <span className="font-bold text-orange-600">
                          {typeof pkg.price === "number" ? `$${pkg.price.toLocaleString()}` : pkg.price}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-neutral-600">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
