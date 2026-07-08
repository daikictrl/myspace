import React from "react";
import { MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function Contact() {
  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would open WhatsApp with a pre-filled message
    window.open("https://wa.me/1234567890?text=Hello%20MySpace%20Team,%20I%20have%20an%20inquiry.", "_blank");
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-16 pt-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-neutral-500">
            Have questions about our platform? We're here to help. Reach out to our team directly.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-neutral-900 text-white rounded-[2.5rem] p-10 h-full flex flex-col justify-between overflow-hidden relative"
            >
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-600 rounded-full blur-[80px] opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-orange-400 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Email Us</p>
                      <p className="text-neutral-300">support@myspace.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-orange-400 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Call Us</p>
                      <p className="text-neutral-300">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-orange-400 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Headquarters</p>
                      <p className="text-neutral-300 leading-relaxed">
                        123 Event Street, Suite 400<br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-neutral-200/50 border border-neutral-100"
          >
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Send us a message</h3>
            <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">First Name</label>
                  <Input placeholder="John" className="h-12 rounded-2xl bg-neutral-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Last Name</label>
                  <Input placeholder="Doe" className="h-12 rounded-2xl bg-neutral-50" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Email Address</label>
                <Input type="email" placeholder="john@example.com" className="h-12 rounded-2xl bg-neutral-50" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Message</label>
                <Textarea 
                  placeholder="How can we help you?" 
                  className="min-h-[150px] rounded-2xl bg-neutral-50 resize-none"
                />
              </div>
              
              <Button type="submit" size="lg" className="w-full h-14 rounded-2xl text-base bg-[#25D366] hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/20">
                <MessageCircle className="w-5 h-5 mr-2" />
                Send via WhatsApp
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
