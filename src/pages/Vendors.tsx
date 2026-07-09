import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@/data/servicesData";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function Vendors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const queryParam = searchParams.get("query");
  const locationParam = searchParams.get("location");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync url params with page states
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("All");
    }
    if (queryParam) {
      setSearchTerm(queryParam);
    }
    if (locationParam) {
      setSearchLocation(locationParam);
    }
  }, [categoryParam, queryParam, locationParam]);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const { data, error } = await supabase
          .from("vendors")
          .select(`
            *,
            profiles (
              whatsapp_number,
              full_name
            )
          `);
        
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
          setVendorsList(mapped);
        } else {
          setVendorsList([]);
        }
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setVendorsList([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const filteredVendors = vendorsList.filter(vendor => {
    const matchesSearch = !searchTerm || 
                          vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vendor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.serviceCategories?.some((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = !searchLocation || 
                            vendor.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesCategory = selectedCategory === "All" || (vendor.serviceCategories && vendor.serviceCategories.includes(selectedCategory));
    return matchesSearch && matchesLocation && matchesCategory;
  });

  return (
    <div className="bg-neutral-50 pb-24 pt-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-neutral-100 py-4 sticky top-20 z-40 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 shrink-0">
            Discover Vendors
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1 lg:max-w-2xl justify-end">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input 
                type="text" 
                placeholder="Search by name or category..." 
                className="pl-10 h-10 text-sm rounded-full bg-neutral-100/80 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-48 relative shrink-0">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input 
                type="text" 
                placeholder="Location..." 
                className="pl-10 h-10 text-sm rounded-full bg-neutral-100/80 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-orange-500"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-48 relative shrink-0">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select 
                className="w-full h-10 pl-10 pr-8 rounded-full bg-neutral-100/80 border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none text-sm font-medium text-neutral-700 transition-colors"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Grid */}
      <div className="container mx-auto px-4 pt-12">
        <div className="mb-6 text-neutral-500 font-medium">
          Showing {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-400">
            <RefreshCw className="w-10 h-10 animate-spin text-orange-500 mb-4" />
            <p className="font-bold text-neutral-600">Discovering event professionals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVendors.map((vendor, i) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-md">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={vendor.portfolio[0]} 
                      alt={vendor.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {vendor.rating}
                    </div>
                    <div className="absolute -bottom-5 left-5">
                      <div className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden bg-white shadow-sm">
                        <img src={vendor.logo} alt={`${vendor.name} logo`} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-8 pb-5 px-5 flex flex-col flex-1">
                    <div className="text-xs font-semibold text-orange-600 mb-1 tracking-wide uppercase">{vendor.category}</div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-1 line-clamp-1">{vendor.name}</h3>
                    <div className="flex items-center text-neutral-500 text-xs mb-3">
                      <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {vendor.location}
                    </div>
                    <p className="text-neutral-600 text-sm line-clamp-2 mb-4 flex-1">
                      {vendor.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-auto">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase tracking-wider font-semibold">Starting at</span>
                        <span className="text-lg font-bold text-neutral-900">
                          {typeof vendor.startingPrice === "number" ? `$${vendor.startingPrice}` : vendor.startingPrice}
                        </span>
                      </div>
                      <Link to={`/vendor/${vendor.id}`}>
                        <Button variant="secondary" size="sm" className="rounded-full font-semibold px-4">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredVendors.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No vendors found</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              We couldn't find any vendors matching your current search and filter criteria. Try adjusting your filters.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-full"
              onClick={() => {
                setSearchTerm("");
                handleCategoryChange("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
