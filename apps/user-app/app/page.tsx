'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './stores/authStore';
import { useRestaurants } from './hooks/useRestaurants';

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface Photo {
  id: string;
  url: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisineType: string;
  description: string;
  status: string;
  branches: Branch[];
  photos: Photo[];
  rating?: string;
  photoUrl?: string;
}

const MOCK_RESTAURANTS = [
  {
    id: "saffron-kitchen",
    name: "The Saffron Kitchen",
    cuisineType: "North Indian • Fine Dining",
    description: "Experience the soul of Ahmedabad through a contemporary lens.",
    status: "Open Now",
    rating: "4.8",
    branch: "SG Highway",
    photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "caffeine-co",
    name: "Caffeine & Co.",
    cuisineType: "Continental • Cafe",
    description: "Artisanal coffee and brunch in a cozy garden setting.",
    status: "Open Now",
    rating: "4.3",
    branch: "Vastrapur",
    photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600"
  },
  {
    id: "grand-gujarat",
    name: "Grand Gujarat Thali",
    cuisineType: "Authentic Gujarati • Thali",
    description: "Traditional local flavors crafted with family recipes.",
    status: "CLOSED",
    rating: "4.5",
    branch: "Ashram Road",
    photoUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop"
  }
];

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: restaurants = [], isLoading: loading } = useRestaurants();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    document.body.classList.add('auth-page-active');
    return () => {
      document.body.classList.remove('auth-page-active');
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Filter logic
  const itemsToFilter = (restaurants.length > 0 ? restaurants : MOCK_RESTAURANTS) as Restaurant[];
  
  const filteredRestaurants = itemsToFilter.filter((res) => {
    const matchesSearch = 
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.cuisineType.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'All') return matchesSearch;
    return matchesSearch && res.cuisineType.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const getCuisine = (res: any) => {
    return res.cuisineType || 'Global';
  };

  const getBranch = (res: any) => {
    if (res.branches && res.branches.length > 0) {
      return res.branches[0].name;
    }
    return res.branch || 'Ahmedabad';
  };

  const getPhotoUrl = (res: any) => {
    if (res.photos && res.photos.length > 0) {
      return res.photos[0].url;
    }
    return res.photoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop';
  };

  const getRating = (res: any) => {
    return res.rating || '4.5';
  };

  const getStatus = (res: any) => {
    return res.status || 'Open Now';
  };

  const firstRestaurantId = filteredRestaurants.length > 0 ? filteredRestaurants[0].id : '';

  return (
    <div className="auth-page w-full min-h-screen bg-background relative text-on-surface select-none pb-24 md:pb-0">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen w-full bg-background flex flex-col relative pb-12">
        {/* TopAppBar */}
        <header className="bg-surface dark:bg-surface-dim w-full sticky top-0 z-50 shadow-sm">
          <div className="flex justify-between items-center px-gutter py-base w-full">
            <Link href="/" className="flex items-center gap-base active:scale-95 transition-transform duration-150">
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed">restaurant_menu</span>
              <span className="font-display-md text-display-md text-primary dark:text-primary-fixed uppercase">foodmood</span>
            </Link>
            <div className="flex items-center gap-md">
              <Link href="/profile" className="hover:opacity-80 transition-opacity active:scale-95 duration-150 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-gutter pb-xl pt-base">
          {/* Greeting Section */}
          <section className="mb-lg">
            <div className="flex flex-col gap-xs">
              <h1 className="font-display-md text-display-md text-on-surface">Hey, {user?.name || 'Akash'} 👋</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Hungry for something special today?</p>
            </div>
          </section>

          {/* Search & Discovery */}
          <section className="mb-lg">
            <form className="relative group" onSubmit={handleSearchSubmit}>
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary">search</span>
              </div>
              <input 
                className="w-full pl-14 pr-6 py-5 bg-surface-container-low border-2 border-on-surface rounded-full font-body-lg text-body-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline" 
                placeholder="Search for 'Tandoori' or 'Cafes'..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-on-primary px-gutter py-3 rounded-full font-label-lg hover:brightness-110 active:scale-95 transition-all"
              >
                Search
              </button>
            </form>
          </section>

          {/* Categories (Horizontal Chips) */}
          <div className="flex gap-sm overflow-x-auto hide-scrollbar mb-lg pb-base">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-md py-sm rounded-full font-label-lg flex items-center gap-xs whitespace-nowrap active:scale-90 transition-all ${
                selectedCategory === 'All' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">local_fire_department</span> Trending
            </button>
            <button 
              onClick={() => setSelectedCategory('Veg')}
              className={`px-md py-sm rounded-full font-label-lg whitespace-nowrap active:scale-90 transition-all ${
                selectedCategory === 'Veg' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              Pure Veg
            </button>
            <button 
              onClick={() => setSelectedCategory('Cafe')}
              className={`px-md py-sm rounded-full font-label-lg whitespace-nowrap active:scale-90 transition-all ${
                selectedCategory === 'Cafe' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              Cafes
            </button>
            <button 
              onClick={() => setSelectedCategory('Fine')}
              className={`px-md py-sm rounded-full font-label-lg whitespace-nowrap active:scale-90 transition-all ${
                selectedCategory === 'Fine' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              Fine Dining
            </button>
          </div>

          {/* Section Title */}
          <div className="flex justify-between items-end mb-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Restaurants</h2>
            <button className="text-primary font-label-lg flex items-center gap-xs hover:underline">
              View on map <span className="material-symbols-outlined text-sm">map</span>
            </button>
          </div>

          {/* Vertical List of Cards */}
          {loading ? (
            <div className="flex flex-col gap-gutter animate-pulse">
              <div className="h-48 bg-surface-container-high rounded-xl" />
              <div className="h-48 bg-surface-container-high rounded-xl" />
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center p-8 bg-surface-container-low rounded-xl">
              <p className="font-body-lg text-on-surface-variant">No restaurants found matching your cravings.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-gutter">
              {filteredRestaurants.map((res) => {
                const isClosed = getStatus(res).toUpperCase() === 'CLOSED';
                return (
                  <Link 
                    href={`/restaurant/${res.id}`}
                    key={res.id}
                    className={`group relative bg-surface-container-low rounded-xl overflow-hidden umami-shadow transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] cursor-pointer ${
                      isClosed ? 'opacity-90 hover:opacity-100' : ''
                    }`}
                  >
                    <div className={`aspect-[16/9] w-full relative overflow-hidden ${isClosed ? 'grayscale-[0.3]' : ''}`}>
                      <img 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        alt={res.name} 
                        src={getPhotoUrl(res)}
                      />
                      {isClosed && (
                        <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center">
                          <span className="bg-surface text-on-surface px-md py-sm rounded-full font-headline-sm">CLOSED</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex gap-xs">
                        <span className="bg-on-surface text-primary px-sm py-xs rounded-full font-label-sm flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">star</span> {getRating(res)}
                        </span>
                      </div>
                      {!isClosed && (
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-primary-container text-on-primary-container px-sm py-xs rounded-full font-label-sm uppercase tracking-wider">Open Now</span>
                        </div>
                      )}
                    </div>
                    <div className="p-md flex justify-between items-start">
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{res.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-xs">
                          {getCuisine(res)} • {getBranch(res)}
                        </p>
                      </div>
                      <div className="bg-surface-container-highest p-sm rounded-full">
                        <span className="material-symbols-outlined text-primary">favorite</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>

        {/* BottomNavBar */}
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface-container dark:bg-surface-container-high shadow-[0_-4px_20px_0_rgba(62,31,26,0.08)] rounded-t-lg">
          <div className="flex justify-around items-center px-4 pb-6 pt-3">
            <Link href="/" className="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-sm py-xs active:scale-90 transition-all duration-200">
              <span className="material-symbols-outlined">explore</span>
              <span className="font-label-sm text-label-sm">Explore</span>
            </Link>
            <Link href="/scan" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary active:scale-90 transition-all duration-200">
              <span className="material-symbols-outlined">qr_code_scanner</span>
              <span className="font-label-sm text-label-sm">Scan</span>
            </Link>
            <Link href="/orders" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary active:scale-90 transition-all duration-200">
              <span className="material-symbols-outlined">receipt_long</span>
              <span className="font-label-sm text-label-sm">Orders</span>
            </Link>
            <Link href="/loyalty" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary active:scale-90 transition-all duration-200">
              <span className="material-symbols-outlined">wallet</span>
              <span className="font-label-sm text-label-sm">Rewards</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary active:scale-90 transition-all duration-200">
              <span className="material-symbols-outlined">person</span>
              <span className="font-label-sm text-label-sm">Profile</span>
            </Link>
          </div>
        </nav>

        {/* Floating Action Button (FAB) - Filter */}
        <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40">
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-background relative pb-20">
        {/* Top Navigation Bar */}
        <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_8px_30px_rgb(62,31,26,0.08)]">
          <div className="flex justify-between items-center w-full px-margin py-base max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-lg">
              <Link href="/" className="font-display-md text-display-md text-primary tracking-tighter uppercase">foodmood OS</Link>
              <nav className="hidden md:flex items-center gap-md">
                <Link className="text-primary font-bold border-b-2 border-primary pb-1 font-label-lg text-label-lg" href="/">Discover</Link>
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/orders">Orders</Link>
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/orders">Reservations</Link>
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/loyalty">Loyalty</Link>
              </nav>
            </div>
            <div className="flex items-center gap-md">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input 
                  className="pl-xl pr-md py-xs rounded-full border-2 border-primary bg-surface text-on-surface focus:ring-0 focus:outline-none w-64 font-body-md" 
                  placeholder="Search flavors..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-sm">
                <button className="p-xs rounded-full hover:bg-surface-variant/50 transition-all duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">shopping_bag</span>
                </button>
                <button className="p-xs rounded-full hover:bg-surface-variant/50 transition-all duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">notifications</span>
                </button>
                <Link href="/profile" className="h-10 w-10 rounded-full border-2 border-primary overflow-hidden ml-xs cursor-pointer active:scale-95 transition-transform duration-200 block">
                  <img className="w-full h-full object-cover" alt="Profile critic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcSPxPrTWw8ABInfk8YLdZBNc9JNG7BrztDS9y-frYI-rN1iakxHnCE8WdJKBPUhrPm5PB7zd8h8Ek2APjAQZq1ZArWMgP3luAf0riNtMhSpykreexWqXEG67JTyoXXxQ2VpQewQ3rp2gIn3gfwEMJEivFLrE9nPct7HkI-EZB2rM4wAjsa3FkHkpzzB50OFe39VWV9LA7LIRP6VUTEYsS67G-uKczJbB7w2-PaWBhTOlKKNbmCPI7c-dci_kwrPF5rPpX_w0pEh0" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-[100px] pb-xl px-margin max-w-screen-2xl mx-auto">
          {/* Hero Section */}
          <section className="relative mb-lg rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
            <div className="h-[500px] w-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNs44OuJl8r6gR_WzVJDbJxcFs2JsmBU9YfSnCjVNHK9fLBOAc08YeqUR8zgfGghHgEvd1a4zvukZW4_9CYqnKbyk-zwwq2lX_n8DNaW19eResXMuFUL2SVtsPEKLQv0Mj2dmn2m1ZRoUAW4z-jwiUhT7O5l12NQrKZFySi0EpJ_SIT6hkvfIhAVZS7uEU2g7mjehaLAieL_eueZXbjFWPqBr7yhQtIalwzW58OW_6oAEIu1fcN30NyXogFH8HdABaNrFd58x3DyI')" }}></div>
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-lg">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-xs bg-primary text-on-primary px-sm py-xs rounded-full font-label-lg text-label-lg uppercase tracking-widest mb-md">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  Featured Today
                </div>
                <h2 className="font-display-lg text-display-lg text-white mb-xs leading-none">SHAKAR <br/>REFINERY</h2>
                <p className="font-body-lg text-white/90 mb-lg max-w-lg">Experience the soul of Ahmedabad through a contemporary lens. Award-winning fusion cuisine in the heart of the city.</p>
                <div className="flex gap-md">
                  {firstRestaurantId ? (
                    <Link href={`/restaurant/${firstRestaurantId}`} className="px-lg py-sm bg-primary text-white rounded-full font-label-lg text-label-lg uppercase tracking-wider hover:bg-primary/90 transition-all active:scale-95 shadow-lg flex items-center justify-center">
                      Reserve a Table
                    </Link>
                  ) : (
                    <button className="px-lg py-sm bg-primary text-white rounded-full font-label-lg text-label-lg uppercase tracking-wider hover:bg-primary/90 transition-all active:scale-95 shadow-lg">
                      Reserve a Table
                    </button>
                  )}
                  {firstRestaurantId ? (
                    <Link href={`/restaurant/${firstRestaurantId}`} className="px-lg py-sm bg-transparent border-2 border-white text-white rounded-full font-label-lg text-label-lg uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center">
                      Explore Menu
                    </Link>
                  ) : (
                    <button className="px-lg py-sm bg-transparent border-2 border-white text-white rounded-full font-label-lg text-label-lg uppercase tracking-wider hover:bg-white/10 transition-all">
                      Explore Menu
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Discovery Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
            <div>
              <h3 className="font-display-md text-display-md text-primary leading-tight">RESTAURANTS IN AHMEDABAD</h3>
              <p className="font-body-md text-on-surface-variant">Showing {filteredRestaurants.length} curated locations around you</p>
            </div>
            <div className="flex items-center gap-sm overflow-x-auto no-scrollbar pb-xs">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`flex items-center gap-xs px-md py-sm rounded-full font-label-lg text-label-lg whitespace-nowrap transition-colors ${
                  selectedCategory === 'All' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined text-sm">tune</span> All Filters
              </button>
              <button 
                onClick={() => setSelectedCategory('Veg')}
                className={`flex items-center gap-xs px-md py-sm rounded-full font-label-lg text-label-lg whitespace-nowrap transition-colors ${
                  selectedCategory === 'Veg' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                Pure Veg
              </button>
              <button 
                onClick={() => setSelectedCategory('Fine')}
                className={`flex items-center gap-xs px-md py-sm rounded-full font-label-lg text-label-lg whitespace-nowrap transition-colors ${
                  selectedCategory === 'Fine' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                Fine Dining
              </button>
              <button 
                onClick={() => setSelectedCategory('Cafe')}
                className={`flex items-center gap-xs px-md py-sm rounded-full font-label-lg text-label-lg whitespace-nowrap transition-colors ${
                  selectedCategory === 'Cafe' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                Cafes
              </button>
            </div>
          </div>

          {/* Restaurant Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter animate-pulse">
              <div className="h-64 bg-surface-container-high rounded-xl" />
              <div className="h-64 bg-surface-container-high rounded-xl" />
              <div className="h-64 bg-surface-container-high rounded-xl" />
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center p-12 bg-surface-container-low rounded-xl">
              <p className="font-body-lg text-on-surface-variant">No restaurants found matching your cravings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {filteredRestaurants.map((res) => {
                const isClosed = getStatus(res).toUpperCase() === 'CLOSED';
                return (
                  <Link 
                    href={`/restaurant/${res.id}`}
                    key={res.id}
                    className="flex flex-col group cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-sm">
                      <img 
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                          isClosed ? 'grayscale-[0.3]' : ''
                        }`} 
                        alt={res.name} 
                        src={getPhotoUrl(res)} 
                      />
                      {isClosed && (
                        <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center">
                          <span className="bg-surface text-on-surface px-md py-sm rounded-full font-headline-sm">CLOSED</span>
                        </div>
                      )}
                      <div className="absolute top-sm right-sm bg-on-surface text-primary px-sm py-xs rounded-full font-label-sm text-label-sm uppercase flex items-center gap-xs">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {getRating(res)}
                      </div>
                      {!isClosed && (
                        <div className="absolute bottom-sm left-sm bg-primary text-on-primary px-sm py-xs rounded-full font-label-sm text-label-sm uppercase">
                          Open Now
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface uppercase group-hover:text-primary transition-colors">{res.name}</h4>
                        <p className="font-body-md text-on-surface-variant">{getCuisine(res)} • {getBranch(res)}</p>
                      </div>
                      <button className="h-10 w-10 flex items-center justify-center border-2 border-on-surface rounded-full group-hover:bg-on-surface group-hover:text-surface transition-all">
                        <span className="material-symbols-outlined">favorite</span>
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination/Load More */}
          <div className="flex justify-center mt-xl">
            <button className="group flex flex-col items-center gap-xs">
              <span className="font-label-lg text-label-lg uppercase tracking-widest text-primary group-hover:translate-y-1 transition-transform">Load More Flavors</span>
              <span className="material-symbols-outlined text-primary group-hover:translate-y-1 transition-transform">keyboard_arrow_down</span>
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full flex flex-col items-center justify-center gap-md px-margin text-center py-lg bg-surface-dim border-t border-surface-container-highest/20 mt-16">
          <h2 className="font-display-lg text-display-lg text-primary uppercase">foodmood OS</h2>
          <div className="flex flex-wrap justify-center gap-md mb-md">
            <span className="text-on-surface-variant font-label-sm">© 2026 foodmood. All rights reserved.</span>
          </div>
        </footer>
      </div>

    </div>
  );
}
