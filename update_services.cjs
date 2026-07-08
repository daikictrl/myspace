const fs = require('fs');
const content = fs.readFileSync('src/data/mockData.ts', 'utf8');

const services = [
  { id: "1", name: "DJs", description: "High-energy DJs ensuring your dance floor stays packed all night.", icon: "Music", image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&q=80&w=800" },
  { id: "2", name: "Caterers", description: "Premium catering service offering bespoke menus for your guests.", icon: "Utensils", image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800" },
  { id: "3", name: "Decorators", description: "Transform your venue with breathtaking designs.", icon: "Palette", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800" },
  { id: "4", name: "Makeup Artists", description: "Flawless makeup artistry for brides and event attendees.", icon: "Sparkles", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800" },
  { id: "5", name: "Hair Stylists", description: "Elegant hair styling tailored to your event look.", icon: "Scissors", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" },
  { id: "6", name: "Photographers", description: "Capture your precious moments with professional photography.", icon: "Camera", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800" },
  { id: "7", name: "Videographers", description: "Cinematic event coverage documenting every memory.", icon: "Video", image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800" },
  { id: "8", name: "Content Creators", description: "Real-time social media coverage and short-form video creation.", icon: "Smartphone", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800" },
  { id: "9", name: "MCs / Hosts", description: "Engaging and professional hosts to guide your event seamlessly.", icon: "Mic", image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=800" },
  { id: "10", name: "Live Bands", description: "Elevate the atmosphere with incredible live bands and musicians.", icon: "Guitar", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800" },
  { id: "11", name: "Event Planners", description: "End-to-end event coordination for a stress-free experience.", icon: "Calendar", image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=800" },
  { id: "12", name: "Hall Rentals", description: "Find the perfect venue for your reception or corporate gathering.", icon: "Building", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800" },
  { id: "13", name: "Security Services", description: "Professional security personnel to ensure event safety.", icon: "Shield", image: "https://images.unsplash.com/photo-1533612869974-944a95447781?auto=format&fit=crop&q=80&w=800" },
  { id: "14", name: "Cleaning Services", description: "Post-event cleanup and janitorial services.", icon: "Broom", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800" },
  { id: "15", name: "Florists", description: "Stunning floral arrangements and centerpieces.", icon: "Flower2", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800" },
  { id: "16", name: "Cake Designers", description: "Delicious and artistic custom cakes for your celebration.", icon: "Cake", image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800" }
];

const newMockServicesStr = `export const mockServices = ${JSON.stringify(services, null, 2)};`;

const updatedContent = content.replace(/export const mockServices = \[\s*[\s\S]*?\s*\];/, newMockServicesStr);
fs.writeFileSync('src/data/mockData.ts', updatedContent);
