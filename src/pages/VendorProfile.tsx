import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, MessageCircle, ArrowLeft, Check, Grid, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function VendorProfile() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [clientPhone, setClientPhone] = useState("");
  const [bookingType, setBookingType] = useState("Wedding");
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);

  const [clientRating, setClientRating] = useState(5);
  const [clientComment, setClientComment] = useState("");
  const [isReviewLoading, setIsReviewLoading] = useState(false);

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
        .eq("vendor_id", id)
        .order("created_at", { ascending: false });

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

      // Fetch user session details and bookings status
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("id")
          .eq("client_id", session.user.id)
          .eq("vendor_id", id)
          .limit(1);

        setHasBooked(bookingsData && bookingsData.length > 0);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("whatsapp_number")
          .eq("id", session.user.id)
          .single();

        if (profileData?.whatsapp_number) {
          setClientPhone(profileData.whatsapp_number);
        }
      }
    } catch (err) {
      console.error("Error loading vendor profile:", err);
      setVendor(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendorData();
  }, [id]);

  const handleSendBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to send a booking request.");
      return;
    }

    if (!clientPhone.trim()) {
      toast.error("Please provide your WhatsApp number.");
      return;
    }

    setIsBookingLoading(true);
    try {
      // 1. Update the client's profile with their WhatsApp number
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ whatsapp_number: clientPhone })
        .eq("id", session.user.id);

      if (profileErr) throw profileErr;

      // 2. Insert the booking record
      const { error } = await supabase
        .from("bookings")
        .insert({
          client_id: session.user.id,
          vendor_id: id,
          type: "vendor",
          message: `Event Type: ${bookingType}\n\nClient WhatsApp: ${clientPhone}`,
          status: "pending"
        });

      if (error) throw error;
      toast.success("Booking request sent successfully!");
      setHasBooked(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send booking request.");
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to leave a review.");
      return;
    }

    if (!clientComment.trim()) {
      toast.error("Please add a comment.");
      return;
    }

    setIsReviewLoading(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          client_id: session.user.id,
          vendor_id: id,
          rating: clientRating,
          comment: clientComment
        });

      if (error) throw error;
      toast.success("Review submitted! Thank you.");
      setClientComment("");
      await loadVendorData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsReviewLoading(false);
    }
  };

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
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 space-y-8"
            >
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-600" />
                  Client Reviews
                </h3>
                <div className="space-y-6">
                  {vendor.reviews.length === 0 ? (
                    <p className="text-neutral-500 italic text-sm">No reviews yet. Be the first to leave one!</p>
                  ) : (
                    vendor.reviews.map((review: any, i: number) => (
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
                    ))
                  )}
                </div>
              </div>

              {/* Add Review Form */}
              {hasBooked ? (
                <div className="pt-8 border-t border-neutral-100">
                  <h4 className="text-lg font-bold text-neutral-900 mb-4">Write a Review</h4>
                  <form onSubmit={handleSendReview} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 block mb-2">Your Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setClientRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`w-6 h-6 ${
                                star <= clientRating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-neutral-200 hover:text-yellow-200'
                              } transition-colors`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 block mb-1.5">Your Feedback</label>
                      <textarea
                        placeholder="How was your experience working with this vendor?"
                        value={clientComment}
                        onChange={e => setClientComment(e.target.value)}
                        className="w-full p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-orange-500 h-24 resize-none"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isReviewLoading}
                      className="rounded-2xl px-6 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm h-11"
                    >
                      {isReviewLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Review
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="pt-8 border-t border-neutral-100 text-center py-6 bg-neutral-50 rounded-[2rem] border border-dashed border-neutral-200">
                  <p className="text-sm font-semibold text-neutral-500">
                    Only clients who have requested a booking with this vendor can leave a review.
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Send a booking request on the right side to unlock review access.
                  </p>
                </div>
              )}
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
                transition={{ delay: 0.05 }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100"
              >
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Book via MySpace</h3>
                <form onSubmit={handleSendBooking} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1.5">Event Type</label>
                    <select
                      value={bookingType}
                      onChange={e => setBookingType(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-neutral-50 border border-neutral-100 text-sm font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Birthday Party">Birthday Party</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Concert/Festival">Concert/Festival</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1.5">Your WhatsApp Number</label>
                    <Input
                      type="text"
                      placeholder="e.g. 237699112233"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      className="bg-neutral-50 border-neutral-100 text-neutral-800 placeholder-neutral-400 focus-visible:ring-orange-500 rounded-xl"
                      required
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">Include country code, no spaces or + sign</span>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isBookingLoading}
                    className="w-full rounded-2xl h-11 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md"
                  >
                    {isBookingLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                    Send Booking Request
                  </Button>
                </form>
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
