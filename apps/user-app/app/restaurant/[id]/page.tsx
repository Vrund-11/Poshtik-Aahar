'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRestaurant } from '../../hooks/useRestaurants';
import { useMenu } from '../../hooks/useMenu';
import Link from 'next/link';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface Photo {
  id: string;
  url: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  description: string;
  imageUrl?: string;
  tag?: string;
}

interface RestaurantDetail {
  id: string;
  name: string;
  cuisineType: string;
  description: string;
  status: string;
  branches: Branch[];
  photos: Photo[];
}

const MOCK_RESTAURANT = {
  id: "umami-kitchen",
  name: "foodmood Kitchen",
  cuisineType: "Modern Asian Fusion",
  description: "Experience the pinnacle of modern Asian fusion. Our kitchen blends traditional techniques with bold, unexpected flavors to create a sensory journey that defines the true essence of foodmood.",
  status: "Open Now",
  rating: "4.9",
  branches: [
    { id: "branch-soho", name: "SoHo Branch", address: "124 Mercer St, New York, NY 10012", phone: "+1 (555) 000-0000" }
  ],
  photos: [
    { id: "photo-1", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop" },
    { id: "photo-2", url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600" }
  ]
};

const MOCK_MENU_ITEMS = [
  {
    id: "wagyu-sliders",
    name: "foodmood Wagyu Sliders",
    price: 28.00,
    description: "Aged wagyu beef, caramelized onions, truffle aioli on brioche.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCph7mMwFs3F_nJmckzEyZCqQiOog5hdG5hlHqQKO3y7T3ewioM1CVAWL_QR49qVmSpnQELrQsS_MU8haXCpaKoaudvEMUUEwGPoEmwedeJ07NC9oxpp2tNgjCSfX_as-ltYIStmfByDSLfTbe5Ot8vqN3rLTvDzcaIOWf0JgY6tnrFjgnXRWfkSQfhbfpxVYCvvnGjIzY9tUqxVA6a3MCVweZpJBatuTTsj74ZkM2oNNM-qFbTMi4SR4fA2cVkYp9DyHXSdm_2TU",
    tag: "Most Popular"
  },
  {
    id: "miso-cod",
    name: "Miso Glazed Cod",
    price: 32.00,
    description: "24-hour marinated cod served with wilted bok choy and dashi.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJqYQQKFL2b_NITyfnSj5YrDqrurMynzcskPDy50hGkWtpXucZUcDKubZdSfP_IkuXs-426REzckKIDw3gyjzd9feNdveX71NmgeeKF0emZuPApZes7Z8hrL0BEN5YzH3XaKJSeT3zTMH09kzCSQ6bWlwsI7PaSzwa6RYBV5QQeTyhfj_LmgUjJaQhXaV4tNIOlK9z8Zy0bIRvNhSWK5V__bLpyGPRgLcBxU8IRZBfYA5rSK-fvciT9qvMtUrk8LFiSnXns7KbCvk",
    tag: "Chef's Choice"
  },
  {
    id: "hibiscus-yuzu",
    name: "Hibiscus Yuzu",
    price: 14.00,
    description: "Signature Mocktail with yuzu and mint.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoRLxVKlb767PJJGg2kNPkIEUBnk7MME5ISaVQASdrEF_G09FahbvwgDUaJEcOj9dxn4NJftq4DrFa01ux5e8dIo777znJV7bVjc-m54njK73G2zXGSJRlmPjIhvPQ1aaDfXYAo0Zne1j2adi5O11imq-ptiEIN2nP_SjErCjEwtmzFq5AHJQehjXHQWLVYcIf_Im-dII6-Rz5ph3hmmconJCZKBCC9UEQCro9NYrWRRBw9wDbQ5j4lis9oHpXBxnNWC1sC9SqLe8",
    tag: "Signature Mocktail"
  },
  {
    id: "truffle-ramen",
    name: "Truffle Shio Ramen",
    price: 24.00,
    description: "Creamy poultry broth, black truffle paste, and artisanal noodles.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSGWDio3wgPVm70cEqcKj5oE-gbJAl9gj6JI6ck61lgj_GkVsIUxI8HK7XspctytkwXwaRsPvnM7gSUXGSSz30tevyEyRm-Kv4EMCwoZJl2QZF6XOAKMZmNObArUOl18wVnytTB54aKStgesglc6XATmHdYMWzw3l12RXMljKrfNgb4sqeOT5gLoPubKFEBybXO1-W4QPQk7OZcDbiW0K2Wd701vma9Qi7LJpyFrUyB7p7QBWQG4xoro5NTk9AeO_mVAu2pm2A4jQ",
    tag: "Chef's Special"
  }
];

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const restaurantIdStr = typeof id === 'string' ? id : '';
  const { data: restaurant, isLoading: detailsLoading } = useRestaurant(restaurantIdStr);
  const { data: menuData, isLoading: menuLoading } = useMenu(restaurantIdStr);

  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const menuItems = useMemo(() => {
    if (!menuData) return [];
    const categories = menuData.categories || menuData || [];
    const items: MenuItem[] = [];
    categories.forEach((cat: any) => {
      if (cat.items) {
        items.push(...cat.items);
      }
    });
    return items.slice(0, 4);
  }, [menuData]);

  useEffect(() => {
    if (restaurant?.branches && restaurant.branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(restaurant.branches[0].id);
    }
  }, [restaurant, selectedBranchId]);

  const loading = detailsLoading || menuLoading;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse text-center pt-24 bg-background min-h-screen">
        <div className="h-10 w-1/3 bg-surface-container-high rounded-full mx-auto" />
        <div className="h-64 bg-surface-container-low rounded-3xl" />
        <div className="h-20 bg-surface-container-high rounded-3xl" />
      </div>
    );
  }

  const activeRestaurant = restaurant || (MOCK_RESTAURANT as any);
  const activeMenuItems = menuItems.length > 0 ? menuItems : (MOCK_MENU_ITEMS as any[]);
  const photos = activeRestaurant.photos && activeRestaurant.photos.length > 0 ? activeRestaurant.photos : MOCK_RESTAURANT.photos;
  
  if (!selectedBranchId && activeRestaurant.branches && activeRestaurant.branches.length > 0) {
    setSelectedBranchId(activeRestaurant.branches[0].id);
  }
  const currentBranch = activeRestaurant.branches.find((b: any) => b.id === selectedBranchId) || activeRestaurant.branches[0];

  const handleReserve = () => {
    if (!selectedBranchId) {
      alert('Please select a branch first!');
      return;
    }
    router.push(`/reserve/${selectedBranchId}`);
  };

  return (
    <div className="w-full min-h-screen bg-background relative text-on-surface select-none pb-24 md:pb-0">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative pb-12">
        {/* TopAppBar */}
        <header className="bg-surface sticky top-0 z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:opacity-85 active:scale-95 transition-all border-none"
            onClick={() => router.push('/')}
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <div className="font-display-md text-display-md text-primary uppercase">foodmood</div>
          <div className="flex items-center gap-sm">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:opacity-85 active:scale-95 transition-all border-none">
              <span className="material-symbols-outlined text-primary">favorite</span>
            </button>
          </div>
        </header>

        <main className="px-gutter pb-xl pt-base">
          {/* Hero Carousel Section */}
          <section className="relative w-full h-[240px] overflow-hidden rounded-xl mb-md">
            <div className="w-full h-full relative">
              <img 
                className="w-full h-full object-cover" 
                alt={activeRestaurant.name}
                src={photos[activePhotoIndex]?.url || photos[0]?.url}
              />
            </div>
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-xs">
                {photos.map((_: any, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all border border-white ${
                      idx === activePhotoIndex ? 'bg-white scale-110' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
          </section>

          {/* Restaurant Header */}
          <section className="bg-surface p-md rounded-xl shadow-sm border border-surface-variant/20 mb-lg">
            <div className="flex items-center gap-xs text-primary mb-xs">
              <span className="material-symbols-outlined text-[18px]">star</span>
              <span className="font-label-lg text-label-lg">4.9 • Curated Selection</span>
            </div>
            <h1 className="font-display-md text-display-md leading-none mb-sm">{activeRestaurant.name}</h1>
            <p className="text-on-surface-variant font-body-md mb-md">{activeRestaurant.description}</p>
            <div className="flex flex-wrap gap-sm">
              <span className="px-md py-xs bg-surface-container-high rounded-full font-label-sm text-label-sm uppercase">{activeRestaurant.cuisineType}</span>
              <span className="px-md py-xs bg-surface-container-high rounded-full font-label-sm text-label-sm uppercase">Open</span>
            </div>

            {/* Branch Selector */}
            {activeRestaurant.branches && activeRestaurant.branches.length > 1 && (
              <div className="mt-md pt-md border-t border-outline-variant/30">
                <h3 className="font-label-lg text-label-lg text-primary uppercase mb-sm">Select Branch</h3>
                <div className="flex gap-sm overflow-x-auto hide-scrollbar pb-xs">
                  {activeRestaurant.branches.map((b: any) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBranchId(b.id)}
                      className={`px-md py-sm rounded-full font-label-sm whitespace-nowrap active:scale-95 transition-all ${
                        selectedBranchId === b.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Grid */}
            <div className="grid grid-cols-1 gap-sm mt-lg">
              <button 
                onClick={handleReserve}
                className="bg-primary-container text-on-primary-container h-14 rounded-full font-label-lg text-label-lg flex items-center justify-center gap-sm active:scale-95 transition-all shadow-md"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                RESERVE A TABLE
              </button>
              <Link 
                href={`/takeaway/${activeRestaurant.id}/menu`}
                className="bg-primary-container text-on-primary-container h-14 rounded-full font-label-lg text-label-lg flex items-center justify-center gap-sm active:scale-95 transition-all shadow-md"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                ORDER TAKEAWAY
              </Link>
              <Link 
                href="/scan"
                className="bg-primary-container text-on-primary-container h-14 rounded-full font-label-lg text-label-lg flex items-center justify-center gap-sm active:scale-95 transition-all shadow-md animate-pulse"
              >
                <span className="material-symbols-outlined">qr_code_scanner</span>
                DINE-IN (SCAN QR)
              </Link>
            </div>
          </section>

          {/* Menu Preview Section */}
          <section className="mb-lg">
            <div className="flex items-center justify-between mb-md">
              <h2 className="font-headline-lg text-headline-lg">Signature Menu</h2>
              <Link href={`/takeaway/${activeRestaurant.id}/menu`} className="text-primary font-label-lg text-label-lg flex items-center gap-xs hover:underline">
                VIEW FULL MENU
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            <div className="flex flex-col gap-sm">
              {activeMenuItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => router.push(`/takeaway/${activeRestaurant.id}/menu`)}
                  className="flex items-center gap-4 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/30 cursor-pointer"
                >
                  <div className="relative flex-shrink-0 w-20 h-20 rounded-full overflow-hidden bg-white border border-outline-variant/30">
                    <img className="w-full h-full object-cover" src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'} alt={item.name} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-headline-sm text-headline-sm text-sm truncate">{item.name}</h3>
                    <p className="text-on-surface-variant text-xs line-clamp-1">{item.description}</p>
                    <div className="font-bold mt-1 text-primary">₹{Number(item.price)}</div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center active:scale-90 transition-transform">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* BottomNavBar */}
        <nav className="fixed bottom-0 left-0 w-full bg-surface shadow-[0_-4px_12px_rgba(62,31,26,0.08)] py-2 px-gutter pb-safe z-50 flex justify-around items-center rounded-t-lg">
          <Link className="flex flex-col items-center justify-center text-on-surface-variant" href="/">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-sm text-label-sm">Home</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant" href="/">
            <span className="material-symbols-outlined">explore</span>
            <span className="font-label-sm text-label-sm">Explore</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant" href="/orders">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-label-sm text-label-sm">Orders</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant" href="/profile">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-sm text-label-sm">Profile</span>
          </Link>
        </nav>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative">
        <header className="bg-surface fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20 shadow-sm">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-display-md text-display-md text-primary">foodmood</Link>
            <nav className="hidden md:flex gap-6 items-center">
              <Link className="text-primary border-b-2 border-primary font-bold transition-colors duration-200 py-1 font-label-lg text-label-lg" href="/">Details</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-lg text-label-lg" href="/orders">Orders</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-lg text-label-lg" href="/profile">Profile</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-md w-48 outline-none font-body-md" placeholder="Search menu..." type="text" />
            </div>
            <button className="active:scale-95 transition-transform p-2 text-primary">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden bg-surface-container block border-2 border-primary">
              <img className="w-full h-full object-cover" alt="Profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLBQOKPkaKn4Sm3KxpZyGnZfEp97zSgBFTaLWUhdHS6ByTaXT-16kvBOfElDdqZHXXugzlnQhWM3KUQcc9Nk9GLNpuFLm3PhVru5vuL3y6qYbyYprbjYGPBkZPYoosZz89yiQp3aVx7vvFxZTLHejwQobW_ETqvk-H762lghiptLN7f7o2o7brRLtm4tfeAu8k32XYw3C_wlvzbSKxuMZta8mp8YEoems9IJaC6AnmROMtf18_D1UJfYD4BngjkPy-skdOpK0dIOY" />
            </Link>
          </div>
        </header>

        <main className="pt-20 pb-32 max-w-[1440px] mx-auto px-margin">
          {/* Hero Section */}
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-gutter relative">
            <div className="lg:col-span-8 group relative overflow-hidden rounded-xl h-[480px]">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                alt={activeRestaurant.name} 
                src={photos[activePhotoIndex]?.url || photos[0]?.url}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <span className="bg-primary px-4 py-1 rounded-full font-label-sm text-label-sm uppercase mb-3 inline-block">Top Rated 2026</span>
                <h2 className="font-display-md text-display-md leading-none mb-2">{activeRestaurant.name}</h2>
                <p className="font-body-lg text-white/90">{activeRestaurant.cuisineType} • {currentBranch?.name || 'Main branch'}</p>
              </div>
            </div>

            {/* Restaurant Info Ticket */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-container-high p-8 rounded-xl ticket-edge umami-shadow flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="font-label-sm text-primary uppercase tracking-widest mb-1">Status</p>
                    <span className="bg-on-primary-fixed-variant text-white px-3 py-1 rounded-full text-label-sm">Open Now</span>
                  </div>
                  <div className="text-right">
                    <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center text-primary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-headline-sm ml-1">4.9</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined">location_on</span>
                    <p className="font-body-md">{currentBranch?.address || 'Branch Address'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined">schedule</span>
                    <p className="font-body-md">11:00 AM - 11:30 PM</p>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined">payments</span>
                    <p className="font-body-md">$$$ • Fine Dining</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleReserve}
                    className="bg-primary text-white font-headline-sm py-4 rounded-full active:scale-95 transition-all w-full flex items-center justify-center gap-2"
                  >
                    Reserve Table
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/takeaway/${activeRestaurant.id}/menu`} className="border-2 border-secondary text-secondary font-label-lg py-3 rounded-full active:scale-95 transition-all flex items-center justify-center text-center">Order Takeaway</Link>
                    <Link href="/scan" className="bg-secondary-container text-on-secondary-container font-label-lg py-3 rounded-full active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse">
                      <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                      Scan QR
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Menu Highlights (Bento Grid) */}
          <section className="mt-xl">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="font-display-md text-display-md text-on-surface lowercase">chef's selection</h3>
                <p className="text-on-surface-variant font-body-lg">Curated highlights from our menu.</p>
              </div>
              <Link href={`/takeaway/${activeRestaurant.id}/menu`} className="text-primary font-label-lg flex items-center gap-2 hover:underline">
                View Full Menu <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {activeMenuItems.map((item) => (
                <div key={item.id} className="bg-surface-container rounded-xl overflow-hidden group flex flex-col hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden relative">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'} alt={item.name} />
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-headline-sm text-on-surface truncate pr-2">{item.name}</h4>
                        <span className="font-headline-sm text-primary">₹{Number(item.price)}</span>
                      </div>
                      <p className="text-on-surface-variant text-body-md line-clamp-2">{item.description}</p>
                    </div>
                    <button 
                      onClick={() => router.push(`/takeaway/${activeRestaurant.id}/menu`)}
                      className="mt-4 flex items-center gap-2 text-primary font-label-lg group-hover:translate-x-1 transition-transform"
                    >
                      Add to order <span className="material-symbols-outlined">add_circle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

    </div>
  );
}
