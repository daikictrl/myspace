import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { CalendarHeart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Vendors", path: "/explore-vendors" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isHeroPage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/services';

  return (
    <div className="min-h-screen flex flex-col font-sans text-neutral-900 bg-neutral-50 selection:bg-orange-200">
      <header 
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? "border-b border-neutral-100 bg-white/90 backdrop-blur-md shadow-sm" 
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-200/50 group-hover:scale-105 transition-transform flex items-center justify-center bg-white shadow-sm">
              <img src="/logo.jpeg" alt="MySpace Logo" className="w-full h-full object-cover" />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${!isScrolled && isHeroPage ? 'text-white' : 'text-neutral-900'}`}>
              MySpace
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              
              let textColor = "text-neutral-600 hover:text-orange-600";
              if (isActive) textColor = "text-orange-600";
              else if (!isScrolled && isHeroPage) textColor = "text-neutral-200 hover:text-white";

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${textColor}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden p-2 transition-colors ${!isScrolled && isHeroPage ? 'text-white' : 'text-neutral-600'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-white border-b border-neutral-100"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-base font-medium py-2 ${
                      location.pathname === link.path ? "text-orange-600" : "text-neutral-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-neutral-100">
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-neutral-950 text-neutral-300 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center bg-white/5">
                  <img src="/logo.jpeg" alt="MySpace Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  MySpace
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-neutral-400 max-w-xs">
                Your premier marketplace for discovering and booking the best event professionals for your special day.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Discover</h4>
              <ul className="flex flex-col gap-4 text-sm">
                <li><Link to="/explore-vendors" className="hover:text-white transition-colors">Browse Vendors</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="flex flex-col gap-4 text-sm">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <p>&copy; {new Date().getFullYear()} MySpace. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-white transition-colors">Terms</Link>
              <Link to="#" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
