import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Calendar, Settings, User, Plus, Trash, Check, X, 
  MessageCircle, Star, MapPin, Sparkles, LogOut, 
  Lock, AlertCircle, Eye, EyeOff, RefreshCw, Mail, Phone,
  FileText, CheckCircle2, ChevronRight, Menu, HelpCircle, Clock, Image, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { categories as defaultCategories } from "@/data/servicesData";

// Type definitions
interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  whatsapp_number: string;
  avatar_url: string;
}

interface Vendor {
  id: string;
  business_name: string;
  logo_url: string;
  cover_image_url: string;
  description: string;
  service_categories: string[];
  pricing_range: string;
  service_areas: string[];
  availability_status: string;
  rating: number;
  reviews_count: number;
  packages?: any[];
  services_offered?: string[];
  portfolio?: string[];
}

interface Booking {
  id: string;
  status: string;
  message: string;
  created_at: string;
  type: string;
  client_name: string;
  client_phone: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_type: string;
}

export default function VendorsDashboard() {
  const navigate = useNavigate();

  // Authentication State
  const [session, setSession] = useState<any>(null);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Auth Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState("DJs");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Dashboard Data State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "portfolio" | "services" | "bookings">("overview");

  // Edit State
  const [editingProfile, setEditingProfile] = useState<Partial<Vendor>>({});
  const [editingWhatsApp, setEditingWhatsApp] = useState("");
  const [editingFullName, setEditingFullName] = useState("");
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Upload States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  // Package Form State
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState("");
  const [newPkgFeature, setNewPkgFeature] = useState("");
  const [newPkgFeaturesList, setNewPkgFeaturesList] = useState<string[]>([]);

  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Monitor Auth State Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        loadDashboardData(session.user.id);
      } else {
        setDashboardLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        loadDashboardData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch profile, vendor record, and bookings
  const loadDashboardData = async (userId: string) => {
    setDashboardLoading(true);
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setEditingFullName(profileData.full_name || "");
      setEditingWhatsApp(profileData.whatsapp_number || "");

      // Get vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", userId)
        .single();

      if (vendorError) {
        // If profile exists but vendor record doesn't, we will initialize a blank one
        if (vendorError.code === "PGRST116") {
          const newVendorObj: Vendor = {
            id: userId,
            business_name: profileData.full_name || "My Business",
            logo_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileData.full_name || "Business")}`,
            cover_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
            description: "Edit your profile to add a business description.",
            service_categories: [],
            pricing_range: "From 50,000 CFA",
            service_areas: ["Douala", "Yaoundé"],
            availability_status: "available",
            rating: 5.0,
            reviews_count: 0,
            packages: [],
            services_offered: [],
            portfolio: []
          };
          await supabase.from("vendors").insert(newVendorObj);
          setVendor(newVendorObj);
          setEditingProfile(newVendorObj);
          setServiceCategories([]);
          setPackages([]);
        } else {
          throw vendorError;
        }
      } else {
        setVendor(vendorData);
        setEditingProfile({ ...vendorData, portfolio: vendorData.portfolio || [] });
        setServiceCategories(vendorData.service_categories || []);
        setPackages(vendorData.packages || []);
      }

      // Fetch bookings (safe fallback mapping join)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("vendor_id", userId);

      if (bookingsError) throw bookingsError;

      if (bookingsData && bookingsData.length > 0) {
        const clientIds = bookingsData.map(b => b.client_id).filter(Boolean);
        const eventIds = bookingsData.map(b => b.event_id).filter(Boolean);

        let clientsMap: Record<string, any> = {};
        let eventsMap: Record<string, any> = {};

        if (clientIds.length > 0) {
          const { data: pData } = await supabase.from("profiles").select("*").in("id", clientIds);
          pData?.forEach(p => { clientsMap[p.id] = p; });
        }

        if (eventIds.length > 0) {
          const { data: eData } = await supabase.from("events").select("*").in("id", eventIds);
          eData?.forEach(e => { eventsMap[e.id] = e; });
        }

        const mapped: Booking[] = bookingsData.map(b => ({
          id: b.id,
          status: b.status,
          message: b.message || "",
          created_at: b.created_at,
          type: b.type,
          client_name: clientsMap[b.client_id]?.full_name || "Unknown Client",
          client_phone: clientsMap[b.client_id]?.whatsapp_number || "",
          event_title: eventsMap[b.event_id]?.title || "Private Event",
          event_date: eventsMap[b.event_id]?.date || "",
          event_location: eventsMap[b.event_id]?.location || "",
          event_type: eventsMap[b.event_id]?.event_type || ""
        }));

        // Sort by date created desc
        mapped.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setBookings(mapped);
      } else {
        setBookings([]);
      }

    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      toast.error("Failed to load details: " + err.message);
    } finally {
      setDashboardLoading(false);
    }
  };

  // 3. Regular Email Login Flow
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all credentials.");
      return;
    }
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      toast.success("Successfully logged in!");
    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. Regular Email Sign Up Flow
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !businessName || !whatsappNumber) {
      toast.error("Please fill in all fields.");
      return;
    }
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("No user returned from signup.");

      // Insert profile row
      const { error: profileErr } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: "vendor",
        whatsapp_number: whatsappNumber,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
      });

      if (profileErr) throw profileErr;

      // Insert vendor row
      const { error: vendorErr } = await supabase.from("vendors").insert({
        id: data.user.id,
        business_name: businessName,
        logo_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(businessName)}`,
        cover_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
        description: "Welcome to our profile. We provide premium services.",
        service_categories: [primaryCategory],
        pricing_range: "From 100,000 CFA",
        service_areas: ["Douala", "Yaoundé"],
        availability_status: "available",
        rating: 5.0,
        reviews_count: 0,
        packages: [],
        services_offered: []
      });

      if (vendorErr) throw vendorErr;

      setSession(data.session);
      toast.success("Account created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign up.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 5. Logout Flow
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setVendor(null);
    setBookings([]);
    toast.success("Successfully logged out.");
  };

  // Image Upload Helpers
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${path}_${Date.now()}.${ext}`;
    
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(fileName);
      
    return publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendor) return;
    setUploadingLogo(true);
    try {
      const publicUrl = await uploadFile(file, `vendors/${vendor.id}/logo`);
      setEditingProfile(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success("Logo uploaded! Save profile to persist changes.");
    } catch (err: any) {
      toast.error("Logo upload failed: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendor) return;
    setUploadingCover(true);
    try {
      const publicUrl = await uploadFile(file, `vendors/${vendor.id}/cover`);
      setEditingProfile(prev => ({ ...prev, cover_image_url: publicUrl }));
      toast.success("Cover image uploaded! Save profile to persist changes.");
    } catch (err: any) {
      toast.error("Cover image upload failed: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !vendor) return;
    setUploadingPortfolio(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const publicUrl = await uploadFile(file, `vendors/${vendor.id}/portfolio/img`);
        newUrls.push(publicUrl);
      }
      
      const currentPortfolio = editingProfile.portfolio || [];
      const updatedPortfolio = [...currentPortfolio, ...newUrls];
      
      setEditingProfile(prev => ({ ...prev, portfolio: updatedPortfolio }));
      
      // Auto-save portfolio immediately to database
      const { error } = await supabase
        .from("vendors")
        .update({ portfolio: updatedPortfolio })
        .eq("id", vendor.id);
        
      if (error) throw error;
      
      await loadDashboardData(vendor.id);
      toast.success(`${newUrls.length} portfolio image(s) uploaded and saved!`);
    } catch (err: any) {
      toast.error("Portfolio upload failed: " + err.message);
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const deletePortfolioImage = async (imgUrlToDelete: string) => {
    if (!vendor) return;
    try {
      const currentPortfolio = editingProfile.portfolio || [];
      const updatedPortfolio = currentPortfolio.filter(url => url !== imgUrlToDelete);
      
      setEditingProfile(prev => ({ ...prev, portfolio: updatedPortfolio }));
      
      // Update in database
      const { error } = await supabase
        .from("vendors")
        .update({ portfolio: updatedPortfolio })
        .eq("id", vendor.id);
        
      if (error) throw error;
      
      // Remove from Supabase storage if it was uploaded there
      if (imgUrlToDelete.includes("supabase.co/storage/v1/object/public/assets/")) {
        const filePath = imgUrlToDelete.split("/public/assets/").pop();
        if (filePath) {
          await supabase.storage.from("assets").remove([filePath]);
        }
      }
      
      await loadDashboardData(vendor.id);
      toast.success("Portfolio image deleted!");
    } catch (err: any) {
      toast.error("Failed to delete image: " + err.message);
    }
  };

  // 7. Save Profile Updates
  const saveProfileUpdates = async () => {
    if (!vendor || !profile) return;
    setIsSaving(true);
    try {
      // 1. Update Profile (Name & WhatsApp)
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: editingFullName,
          whatsapp_number: editingWhatsApp
        })
        .eq("id", profile.id);

      if (profileErr) throw profileErr;

      // 2. Update Vendor (Business details, status, URLs)
      const { error: vendorErr } = await supabase
        .from("vendors")
        .update({
          business_name: editingProfile.business_name,
          description: editingProfile.description,
          logo_url: editingProfile.logo_url,
          cover_image_url: editingProfile.cover_image_url,
          pricing_range: editingProfile.pricing_range,
          service_areas: editingProfile.service_areas,
          availability_status: editingProfile.availability_status
        })
        .eq("id", vendor.id);

      if (vendorErr) throw vendorErr;

      // Refresh loaded data
      await loadDashboardData(vendor.id);
      toast.success("Profile saved successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 8. Save Services & Packages
  const saveServicesAndPackages = async () => {
    if (!vendor) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("vendors")
        .update({
          service_categories: serviceCategories,
          packages: packages
        })
        .eq("id", vendor.id);

      if (error) throw error;
      
      await loadDashboardData(vendor.id);
      toast.success("Services & packages updated!");
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 9. Manage Booking Status (Accept/Reject)
  const updateBookingStatus = async (bookingId: string, newStatus: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      // Update in local state
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      toast.success(`Booking request marked as ${newStatus}`);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  // Package Helper functions
  const addPackage = () => {
    if (!newPkgName || !newPkgPrice) {
      toast.error("Package name and price are required.");
      return;
    }
    const newPkg = {
      name: newPkgName,
      price: isNaN(Number(newPkgPrice)) ? newPkgPrice : Number(newPkgPrice),
      features: newPkgFeaturesList
    };
    setPackages(prev => [...prev, newPkg]);
    setNewPkgName("");
    setNewPkgPrice("");
    setNewPkgFeaturesList([]);
    toast.success("Package added! Remember to save changes.");
  };

  const removePackage = (index: number) => {
    setPackages(prev => prev.filter((_, i) => i !== index));
    toast.success("Package removed! Remember to save changes.");
  };

  const addFeatureToPackageList = () => {
    if (!newPkgFeature.trim()) return;
    setNewPkgFeaturesList(prev => [...prev, newPkgFeature.trim()]);
    setNewPkgFeature("");
  };

  const removeFeatureFromPackageList = (idx: number) => {
    setNewPkgFeaturesList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCategoryToggle = (category: string) => {
    setServiceCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Helper for status classes
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 py-1 px-3 rounded-full text-xs font-semibold">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 py-1 px-3 rounded-full text-xs font-semibold">Declined</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 py-1 px-3 rounded-full text-xs font-semibold">Pending</Badge>;
    }
  };

  // RENDER: Loading State
  if (dashboardLoading && session) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-neutral-300">
        <RefreshCw className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Syncing with Workspace...</h2>
        <p className="text-sm text-neutral-500 mt-2">Connecting to Supabase Database</p>
      </div>
    );
  }

  // RENDER: Auth Gate (If not logged in)
  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
          
          {/* Brand Info Left Section */}
          <div className="lg:col-span-5 flex flex-col justify-center text-white py-6">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center bg-white shadow-sm">
                  <img src="/logo.jpeg" alt="MySpace Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                  MySpace <span className="text-xs text-orange-500 ml-1 uppercase font-extrabold tracking-widest bg-orange-500/10 px-2 py-0.5 rounded">Vendor Portal</span>
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Manage your services, <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">grow your business.</span>
              </h1>
              <p className="mt-4 text-neutral-400 text-sm leading-relaxed max-w-sm">
                Join our premium directory of event professionals. Build your portfolio, manage packages, and receive direct inquiries from clients via WhatsApp.
              </p>
            </div>
          </div>

          {/* Form Card Right Section */}
          <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800/80 rounded-[2.5rem] shadow-2xl p-6 sm:p-10 flex flex-col justify-center">
            
            {/* Tab selection */}
            <div className="flex p-1 bg-neutral-950 rounded-2xl mb-8">
              <button
                onClick={() => setAuthTab("login")}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  authTab === "login" 
                    ? "bg-neutral-800 text-white shadow-sm" 
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthTab("signup")}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  authTab === "signup" 
                    ? "bg-neutral-800 text-white shadow-sm" 
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Register
              </button>
            </div>

            {/* AUTH FORM */}
            <AnimatePresence mode="wait">
              {authTab === "login" ? (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleEmailLogin} 
                  className="space-y-5"
                >
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="bg-neutral-950 border-neutral-800 pl-11 text-white focus-visible:ring-orange-500 h-12"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-neutral-400 block">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="bg-neutral-950 border-neutral-800 pl-11 pr-10 text-white focus-visible:ring-orange-500 h-12"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={authLoading} 
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white h-12 rounded-2xl font-bold mt-6 shadow-lg shadow-orange-600/10"
                  >
                    {authLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                    Access Dashboard
                  </Button>
                </motion.form>
              ) : (
                <motion.form 
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleEmailSignUp} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Your Full Name</label>
                      <Input
                        type="text"
                        placeholder="e.g. Jean Dupont"
                        className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-orange-500"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Business Name</label>
                      <Input
                        type="text"
                        placeholder="e.g. Lumina Pro"
                        className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-orange-500"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1.5">WhatsApp Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="text"
                          placeholder="e.g. 237699112233"
                          className="bg-neutral-950 border-neutral-800 pl-10 text-white focus-visible:ring-orange-500"
                          value={whatsappNumber}
                          onChange={e => setWhatsappNumber(e.target.value)}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 mt-1 block">Include country code, no spaces or + sign</span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Primary Category</label>
                      <select
                        className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                        value={primaryCategory}
                        onChange={e => setPrimaryCategory(e.target.value)}
                      >
                        {defaultCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="bg-neutral-950 border-neutral-800 pl-11 text-white focus-visible:ring-orange-500"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        className="bg-neutral-950 border-neutral-800 pl-11 pr-10 text-white focus-visible:ring-orange-500"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={authLoading} 
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white h-11 rounded-xl font-bold mt-4 shadow-lg"
                  >
                    {authLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Vendor Account
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Active Dashboard (If logged in)
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar - Desktop Layout */}
      <aside className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between py-6 px-6 z-20">
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral-800 flex items-center justify-center bg-white shadow-sm">
                <img src="/logo.jpeg" alt="MySpace Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                MySpace <span className="text-xs text-orange-500 font-medium">Vendor</span>
              </span>
            </Link>

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-800"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Logged in business card */}
          {vendor && (
            <div className="mb-8 p-4 bg-neutral-950/80 border border-neutral-800/80 rounded-2xl flex items-center gap-3.5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/5 rounded-full blur-xl" />
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-800 shrink-0 bg-neutral-900">
                <img src={vendor.logo_url} alt={vendor.business_name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{vendor.business_name}</h3>
                <p className="text-[10px] text-neutral-500 font-semibold truncate mb-1">
                  {profile?.email}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    vendor.availability_status === "available" ? "bg-emerald-500" : "bg-rose-500"
                  }`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {vendor.availability_status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs - Desktop (hidden on mobile menu when closed) */}
          <nav className={`space-y-1.5 ${isMobileMenuOpen ? "block" : "hidden md:block"}`}>
            <button
              onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === "overview" 
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/10" 
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Overview
            </button>

            <button
              onClick={() => { setActiveTab("profile"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === "profile" 
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/10" 
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              <User className="w-4 h-4" />
              Business Profile
            </button>

            <button
              onClick={() => { setActiveTab("portfolio"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === "portfolio" 
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/10" 
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              <Image className="w-4 h-4" />
              Portfolio Gallery
            </button>

            <button
              onClick={() => { setActiveTab("services"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === "services" 
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/10" 
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              <Settings className="w-4 h-4" />
              Services & Packages
            </button>

            <button
              onClick={() => { setActiveTab("bookings"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === "bookings" 
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/10" 
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4" />
                Bookings & Chat
              </div>
              {bookings.filter(b => b.status === "pending").length > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {bookings.filter(b => b.status === "pending").length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className={`mt-8 ${isMobileMenuOpen ? "block" : "hidden md:block"}`}>
          <div className="border-t border-neutral-800 pt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl text-sm font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 py-10 px-4 sm:px-10 overflow-y-auto max-h-screen">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && vendor && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
                <p className="text-neutral-400 text-sm mt-1">Hello, {profile?.full_name}! Here is what is happening with your services.</p>
              </div>

              {/* Quick toggle availability status */}
              <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800/80 p-3 rounded-2xl shrink-0">
                <span className="text-xs font-semibold text-neutral-400 pl-1">Availability Status:</span>
                <select
                  value={editingProfile.availability_status}
                  onChange={(e) => {
                    const status = e.target.value;
                    setEditingProfile(prev => ({ ...prev, availability_status: status }));
                    // Directly save this setting
                    supabase.from("vendors").update({ availability_status: status }).eq("id", vendor.id).then(() => {
                      toast.success(`Marked as ${status}`);
                      loadDashboardData(vendor.id);
                    });
                  }}
                  className="bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-lg text-xs font-bold py-1 px-3 focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="fully_booked">Fully Booked</option>
                </select>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-neutral-900 border-neutral-800/80 text-white rounded-3xl overflow-hidden shadow-sm relative group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-xl" />
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-orange-950 text-orange-400 rounded-2xl flex items-center justify-center mb-4">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold text-neutral-400">Total Bookings</div>
                  <div className="text-3xl font-black text-white mt-1.5">{bookings.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800/80 text-white rounded-3xl overflow-hidden shadow-sm relative group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-xl" />
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold text-neutral-400">Pending Inquiries</div>
                  <div className="text-3xl font-black text-white mt-1.5">
                    {bookings.filter(b => b.status === "pending").length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800/80 text-white rounded-3xl overflow-hidden shadow-sm relative group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-600/5 rounded-full blur-xl" />
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-yellow-950 text-yellow-400 rounded-2xl flex items-center justify-center mb-4">
                    <Star className="w-5 h-5 fill-yellow-400/20" />
                  </div>
                  <div className="text-sm font-semibold text-neutral-400">Rating</div>
                  <div className="text-3xl font-black text-white mt-1.5 flex items-baseline gap-1.5">
                    {vendor.rating || 5.0} <span className="text-xs text-neutral-500 font-bold">/ 5.0</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800/80 text-white rounded-3xl overflow-hidden shadow-sm relative group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-xl" />
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-indigo-950 text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold text-neutral-400">Services Offered</div>
                  <div className="text-3xl font-black text-white mt-1.5">
                    {vendor.service_categories.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main dashboard content - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Recent Bookings list */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Recent Inquiries
                  </h3>
                  <button onClick={() => setActiveTab("bookings")} className="text-xs font-bold text-orange-500 hover:underline">
                    View all &rarr;
                  </button>
                </div>

                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-900/40 border border-neutral-800 border-dashed rounded-[2rem] text-neutral-500">
                      <HelpCircle className="w-10 h-10 mx-auto mb-3 text-neutral-600" />
                      <p className="font-bold text-neutral-400">No booking requests found.</p>
                      <p className="text-xs mt-1">Inquiries made by clients will appear here.</p>
                    </div>
                  ) : (
                    bookings.slice(0, 3).map((b) => (
                      <div key={b.id} className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl hover:border-neutral-700 transition-all duration-300 relative group overflow-hidden">
                        {/* Corner active badge */}
                        <div className="absolute top-6 right-6">
                          {getStatusBadge(b.status)}
                        </div>

                        <div className="text-xs font-bold text-orange-500 mb-1">{b.event_type || "Booking Inquiry"}</div>
                        <h4 className="text-base font-bold text-white mb-1">{b.event_title}</h4>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 mb-4 font-medium">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {b.client_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {b.event_date ? new Date(b.event_date).toLocaleDateString() : "TBD"}
                          </span>
                          {b.event_location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {b.event_location}
                            </span>
                          )}
                        </div>

                        <p className="text-neutral-300 text-xs italic bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/40 mb-4 line-clamp-2">
                          "{b.message}"
                        </p>

                        {b.status === "pending" && (
                          <div className="flex gap-2.5">
                            <Button 
                              onClick={() => updateBookingStatus(b.id, "accepted")} 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold px-4 gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept
                            </Button>
                            <Button 
                              onClick={() => updateBookingStatus(b.id, "rejected")} 
                              size="sm" 
                              variant="destructive" 
                              className="bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold px-4 gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Profile strength & Quick links */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  Quick Actions
                </h3>

                <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-neutral-300 p-2.5 hover:bg-neutral-800/50 rounded-2xl cursor-pointer transition-colors" onClick={() => setActiveTab("profile")}>
                    <div className="w-10 h-10 bg-orange-950 text-orange-400 rounded-xl flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Update Bio & Logo</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Let clients know about you</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-300 p-2.5 hover:bg-neutral-800/50 rounded-2xl cursor-pointer transition-colors" onClick={() => setActiveTab("services")}>
                    <div className="w-10 h-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Manage Packages</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Add prices and package structures</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-300 p-2.5 hover:bg-neutral-800/50 rounded-2xl cursor-pointer transition-colors">
                    <a 
                      href={`/vendor/${vendor.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 w-full"
                    >
                      <div className="w-10 h-10 bg-emerald-950 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                        <Eye className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Preview Public Profile</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">See how clients view your page</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: BUSINESS PROFILE */}
        {activeTab === "profile" && vendor && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Business Profile</h1>
              <p className="text-neutral-400 text-sm mt-1">Manage your public information, logo, cover image, and contact details.</p>
            </div>

            <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-[2rem] space-y-6">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-neutral-400 block mb-2">Business Name</label>
                  <Input
                    className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-orange-500"
                    value={editingProfile.business_name || ""}
                    onChange={(e) => setEditingProfile(prev => ({ ...prev, business_name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-400 block mb-2">Your Full Name (Owner)</label>
                  <Input
                    className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-orange-500"
                    value={editingFullName}
                    onChange={(e) => setEditingFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-neutral-400 block mb-2">WhatsApp Contact Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      className="bg-neutral-950 border-neutral-800 pl-10 text-white focus-visible:ring-orange-500"
                      value={editingWhatsApp}
                      onChange={(e) => setEditingWhatsApp(e.target.value)}
                      placeholder="e.g. 237699112233"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">Clients will use this to message you on WhatsApp.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-400 block mb-2">Starting Price / Range Description</label>
                  <Input
                    className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-orange-500"
                    value={editingProfile.pricing_range || ""}
                    onChange={(e) => setEditingProfile(prev => ({ ...prev, pricing_range: e.target.value }))}
                    placeholder="e.g. From 150,000 CFA"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-2">Business Description</label>
                <Textarea
                  className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-orange-500 min-h-32"
                  value={editingProfile.description || ""}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell clients about your background, tools, unique traits..."
                />
              </div>

              {/* Image Previews & Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
                {/* Business Logo */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-400 block">Business Logo</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shrink-0 flex items-center justify-center">
                      {editingProfile.logo_url ? (
                        <img src={editingProfile.logo_url} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">No logo</div>
                      )}
                    </div>
                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex gap-2">
                        <Input
                          className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-orange-500 text-xs h-10 flex-1"
                          value={editingProfile.logo_url || ""}
                          onChange={(e) => setEditingProfile(prev => ({ ...prev, logo_url: e.target.value }))}
                          placeholder="Image URL (https://...)"
                        />
                        <div className="relative shrink-0">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          />
                          <Button 
                            type="button" 
                            disabled={uploadingLogo}
                            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold h-10 text-xs px-3 rounded-xl"
                          >
                            {uploadingLogo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Upload"}
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-500">Provide an online image link or upload a file directly.</p>
                    </div>
                  </div>
                </div>

                {/* Cover Image URL */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-400 block">Cover Banner Image</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-20 h-12 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shrink-0 flex items-center justify-center">
                      {editingProfile.cover_image_url ? (
                        <img src={editingProfile.cover_image_url} alt="Cover preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">No cover</div>
                      )}
                    </div>
                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex gap-2">
                        <Input
                          className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-orange-500 text-xs h-10 flex-1"
                          value={editingProfile.cover_image_url || ""}
                          onChange={(e) => setEditingProfile(prev => ({ ...prev, cover_image_url: e.target.value }))}
                          placeholder="Image URL (https://...)"
                        />
                        <div className="relative shrink-0">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            disabled={uploadingCover}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          />
                          <Button 
                            type="button" 
                            disabled={uploadingCover}
                            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold h-10 text-xs px-3 rounded-xl"
                          >
                            {uploadingCover ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Upload"}
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-500">Provide an online image link or upload a file directly.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Areas Tags */}
              <div className="pt-4 border-t border-neutral-800">
                <label className="text-xs font-bold text-neutral-400 block mb-2">Service Areas (Locations)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(editingProfile.service_areas || []).map((area, i) => (
                    <Badge key={i} className="bg-neutral-800 text-neutral-300 hover:bg-neutral-800 py-1.5 px-3 rounded-full flex items-center gap-1.5 border border-neutral-700">
                      {area}
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = (editingProfile.service_areas || []).filter((_, idx) => idx !== i);
                          setEditingProfile(prev => ({ ...prev, service_areas: updated }));
                        }}
                        className="text-neutral-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <Input 
                    id="new-area-input" 
                    placeholder="Add location (e.g. Kribi)" 
                    className="bg-neutral-950 border-neutral-800 text-white h-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !(editingProfile.service_areas || []).includes(val)) {
                          const updated = [...(editingProfile.service_areas || []), val];
                          setEditingProfile(prev => ({ ...prev, service_areas: updated }));
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("new-area-input") as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val && !(editingProfile.service_areas || []).includes(val)) {
                        const updated = [...(editingProfile.service_areas || []), val];
                        setEditingProfile(prev => ({ ...prev, service_areas: updated }));
                        input.value = "";
                      }
                    }}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white h-9 font-bold px-4 rounded-xl"
                  >
                    Add
                  </Button>
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 block">Type and press Enter or click Add to add locations.</span>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-neutral-800 flex justify-end">
                <Button
                  onClick={saveProfileUpdates}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold px-6 h-12 shadow-lg"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB: PORTFOLIO GALLERY */}
        {activeTab === "portfolio" && vendor && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Portfolio Gallery</h1>
              <p className="text-neutral-400 text-sm mt-1">Upload and manage images showcasing your work. High-quality images attract more clients.</p>
            </div>

            <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-[2rem] space-y-6">
              
              {/* Image upload card */}
              <div className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 transition-all rounded-[2rem] p-10 text-center relative group bg-neutral-950/20">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePortfolioUpload}
                  disabled={uploadingPortfolio}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                
                {uploadingPortfolio ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-10 h-10 animate-spin text-orange-500" />
                    <p className="text-sm font-bold text-neutral-300">Uploading images to Supabase Storage...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 bg-orange-950 text-orange-400 rounded-2xl flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-neutral-200">Drag & drop or click to upload portfolio images</p>
                    <p className="text-xs text-neutral-500">Supports PNG, JPG, JPEG, WEBP (Max 5MB per file)</p>
                  </div>
                )}
              </div>

              {/* Portfolio Grid */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Uploaded Work ({(editingProfile.portfolio || []).length} images)</h3>
                
                {(editingProfile.portfolio || []).length === 0 ? (
                  <div className="text-center py-12 bg-neutral-950/40 border border-neutral-800 border-dashed rounded-2xl text-neutral-500 text-xs">
                    Your portfolio is currently empty. Upload photos from your device to display here.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {(editingProfile.portfolio || []).map((imgUrl, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden aspect-square group border border-neutral-800 bg-neutral-950">
                        <img src={imgUrl} alt={`Portfolio ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        
                        {/* Overlay with Delete action */}
                        <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                          <button
                            type="button"
                            onClick={() => deletePortfolioImage(imgUrl)}
                            className="w-10 h-10 bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                            title="Delete image"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 3: SERVICES & PACKAGES */}
        {activeTab === "services" && vendor && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Services & Pricing Packages</h1>
              <p className="text-neutral-400 text-sm mt-1">Configure categories you operate in, and structure the pricing packages clients can see.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Categories selector left column */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl">
                  <h3 className="text-base font-bold text-white mb-4">Service Categories</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {defaultCategories.map((cat) => {
                      const isSelected = serviceCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => handleCategoryToggle(cat)}
                          className={`w-full text-left p-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between ${
                            isSelected 
                              ? "bg-orange-950/40 border-orange-500/50 text-orange-400" 
                              : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          {cat}
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6">
                    <Button 
                      onClick={saveServicesAndPackages} 
                      disabled={isSaving}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold h-10"
                    >
                      {isSaving ? <RefreshCw className="w-3 h-3 animate-spin mr-1.5" /> : null}
                      Save Categories
                    </Button>
                  </div>
                </div>
              </div>

              {/* Packages Manager right column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Packages List */}
                <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4">
                  <h3 className="text-base font-bold text-white">Active Packages</h3>
                  
                  {packages.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-950/40 border border-neutral-800 border-dashed rounded-2xl text-neutral-500 text-xs">
                      No pricing packages configured. Create one below!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {packages.map((pkg, idx) => (
                        <div key={idx} className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl relative group">
                          <button
                            onClick={() => removePackage(idx)}
                            className="absolute top-4 right-4 p-1 text-neutral-500 hover:text-rose-500 hover:bg-rose-950/20 rounded-md transition-colors"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                          
                          <h4 className="font-bold text-white text-sm pr-6">{pkg.name}</h4>
                          <div className="text-base font-black text-orange-500 mt-1">
                            {typeof pkg.price === 'number' ? `${pkg.price.toLocaleString()} CFA` : pkg.price}
                          </div>

                          {pkg.features && pkg.features.length > 0 && (
                            <ul className="mt-3 space-y-1.5">
                              {pkg.features.map((feat: string, fidx: number) => (
                                <li key={fidx} className="flex items-start gap-1.5 text-[11px] text-neutral-400">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {packages.length > 0 && (
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={saveServicesAndPackages} 
                        disabled={isSaving}
                        className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold h-10 px-6"
                      >
                        {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                        Save Packages List
                      </Button>
                    </div>
                  )}
                </div>

                {/* Add New Package Form */}
                <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-orange-500" /> Add New Package
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">Package Name</label>
                      <Input
                        className="bg-neutral-950 border-neutral-800 text-white h-9"
                        placeholder="e.g. Standard DJ Set"
                        value={newPkgName}
                        onChange={e => setNewPkgName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">Pricing (e.g. 150000 or "Quote")</label>
                      <Input
                        className="bg-neutral-950 border-neutral-800 text-white h-9"
                        placeholder="e.g. 150000"
                        value={newPkgPrice}
                        onChange={e => setNewPkgPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Add features list for the package */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-400 block">Package Features / Perks</label>
                    <div className="flex gap-2">
                      <Input
                        className="bg-neutral-950 border-neutral-800 text-white h-9 flex-1"
                        placeholder="e.g. 4 Hours Playtime"
                        value={newPkgFeature}
                        onChange={e => setNewPkgFeature(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeatureToPackageList(); } }}
                      />
                      <Button
                        type="button"
                        onClick={addFeatureToPackageList}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white h-9 font-bold px-4 text-xs rounded-xl"
                      >
                        Add Feature
                      </Button>
                    </div>

                    {/* Render features being added */}
                    {newPkgFeaturesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {newPkgFeaturesList.map((feat, idx) => (
                          <Badge key={idx} className="bg-neutral-950 border border-neutral-800 text-neutral-400 py-1 px-2.5 rounded-lg flex items-center gap-1.5">
                            {feat}
                            <button type="button" onClick={() => removeFeatureFromPackageList(idx)} className="text-neutral-600 hover:text-white">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      onClick={addPackage}
                      className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold h-10 px-5 rounded-xl"
                    >
                      Add Package To List
                    </Button>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 4: BOOKINGS & CHAT */}
        {activeTab === "bookings" && vendor && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Booking Inquiries</h1>
              <p className="text-neutral-400 text-sm mt-1">Review wedding & event booking inquiries, manage booking statuses, and chat with clients directly.</p>
            </div>

            <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-[2rem] space-y-6">
              {bookings.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
                  <h3 className="text-lg font-bold text-neutral-400 mb-1">No booking inquiries</h3>
                  <p className="text-xs">Clients searching the platform will book services here.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-800">
                  {bookings.map((b) => {
                    const messageString = `Hi ${b.client_name}, this is ${vendor.business_name} responding to your request for ${b.event_title}!`;
                    const encodedMessage = encodeURIComponent(messageString);
                    const whatsappUrl = `https://wa.me/${b.client_phone}?text=${encodedMessage}`;

                    return (
                      <div key={b.id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-6 group">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">
                              {b.event_type || "Event"}
                            </span>
                            {getStatusBadge(b.status)}
                          </div>
                          
                          <h3 className="text-lg font-bold text-white">{b.event_title}</h3>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-xs text-neutral-400 font-medium">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-neutral-500" />
                              <span className="text-neutral-200">{b.client_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-neutral-500" />
                              <span>{b.event_date ? new Date(b.event_date).toLocaleDateString() : "TBD"}</span>
                            </div>
                            {b.event_location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                                <span>{b.event_location}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-neutral-300 italic bg-neutral-950/40 p-4 border border-neutral-800/40 rounded-2xl max-w-2xl mt-3">
                            "{b.message}"
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0 self-start md:self-center">
                          {b.status === "pending" && (
                            <>
                              <Button
                                onClick={() => updateBookingStatus(b.id, "accepted")}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs h-10 px-4 gap-1.5"
                              >
                                <Check className="w-4 h-4" /> Accept Request
                              </Button>
                              <Button
                                onClick={() => updateBookingStatus(b.id, "rejected")}
                                variant="destructive"
                                className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs h-10 px-4 gap-1.5"
                              >
                                <X className="w-4 h-4" /> Decline
                              </Button>
                            </>
                          )}
                          {b.client_phone && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto"
                            >
                              <Button
                                className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs h-10 px-4 gap-1.5 w-full shadow-lg shadow-[#25D366]/10"
                              >
                                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
