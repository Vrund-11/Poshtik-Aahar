'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import { useRestaurants } from '../hooks/useRestaurants';
import { useLoyalty } from '../hooks/useLoyalty';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { api } from '@foodmart/shared';
import Link from 'next/link';

function ProfileContent() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const authLoading = useAuthStore((s) => s.loading);
  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const [rating, setRating] = useState<number>(5);
  const [complaintText, setComplaintText] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Edit profile state
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data: restaurants = [] } = useRestaurants();
  const { data: loyaltyData, isLoading: loyaltyLoading } = useLoyalty(user?.userId || null);
  const { data: orderHistory = [], isLoading: ordersLoading } = useOrderHistory(user?.userId || null);

  const loyaltyPoints = loyaltyData?.balance || 0;
  const totalOrders = orderHistory.length;
  const loading = authLoading || loyaltyLoading || ordersLoading;

  useEffect(() => {
    const fromComplaint = searchParams.get('complaint') === 'true';
    const qOrderId = searchParams.get('orderId');
    const qRestaurantId = searchParams.get('restaurantId');

    if (fromComplaint) {
      setShowFeedbackForm(true);
      if (qOrderId) setOrderId(qOrderId);
      if (qRestaurantId) setRestaurantId(qRestaurantId);
      setTimeout(() => {
        document.getElementById('feedback-form-card')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }

    if (user?.name) {
      setEditName(user.name);
    }

    if (restaurants.length > 0 && !restaurantId && !qRestaurantId) {
      setRestaurantId(restaurants[0].id);
    }
  }, [searchParams, user, restaurants, restaurantId]);

  const handleUpdateName = async () => {
    if (!editName) return;
    try {
      if (user) {
        user.name = editName;
      }
      setIsEditing(false);
      alert('Profile name updated successfully!');
    } catch (e) {}
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (!restaurantId) {
      setErrorMsg('Please select a restaurant');
      setSubmitting(false);
      return;
    }

    try {
      const res: any = await api.post('/complaints', {
        restaurantId,
        orderId: orderId || undefined,
        rawText: complaintText,
        rating,
      });

      if (res.success) {
        setSuccessMsg('Feedback submitted successfully! Our AI is analyzing it.');
        setComplaintText('');
        setRating(5);
        setTimeout(() => {
          setShowFeedbackForm(false);
        }, 2000);
      } else {
        setErrorMsg(res.message || 'Failed to submit feedback.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 animate-pulse text-center pt-24 bg-background min-h-screen">
        <div className="h-12 w-1/3 bg-surface-container mx-auto rounded-full" />
        <div className="h-48 bg-surface-container rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen relative w-full select-none pb-24 md:pb-0">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative pb-12">
        <header className="bg-surface dark:bg-surface-dim text-primary dark:text-primary-fixed w-full sticky top-0 z-50 shadow-sm">
          <div className="flex justify-between items-center px-gutter py-base max-w-md mx-auto w-full">
            <button onClick={() => router.push('/')} className="active:scale-95 transition-transform bg-transparent border-none text-primary flex items-center">
              <span className="material-symbols-outlined text-[32px]">arrow_back</span>
            </button>
            <h1 className="font-display-md text-display-md text-primary dark:text-primary-fixed uppercase tracking-tighter">foodmood</h1>
            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent border-none text-primary active:scale-95 transition-transform">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-gutter py-lg pb-32 space-y-md">
          {/* Profile Hero card */}
          <section className="flex flex-col items-center text-center py-4 bg-surface-container-low rounded-xl p-md shadow-sm relative">
            <div className="relative mb-sm">
              <div className="w-24 h-24 rounded-full border-4 border-primary-container shadow-md overflow-hidden bg-primary">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Profile" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLBQOKPkaKn4Sm3KxpZyGnZfEp97zSgBFTaLWUhdHS6ByTaXT-16kvBOfElDdqZHXXugzlnQhWM3KUQcc9Nk9GLNpuFLm3PhVru5vuL3y6qYbyYprbjYGPBkZPYoosZz89yiQp3aVx7vvFxZTLHejwQobW_ETqvk-H762lghiptLN7f7o2o7brRLtm4tfeAu8k32XYw3C_wlvzbSKxuMZta8mp8YEoems9IJaC6AnmROMtf18_D1UJfYD4BngjkPy-skdOpK0dIOY"
                />
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="absolute bottom-0 right-0 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-surface active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>

            {isEditing ? (
              <div className="flex gap-2 items-center mb-1">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border-2 border-outline bg-white text-on-surface px-4 py-1.5 rounded-full text-xs outline-none font-bold"
                />
                <button onClick={handleUpdateName} className="bg-primary text-on-primary text-[10px] uppercase font-bold px-3 py-2 rounded-full active:scale-95 transition-transform">Save</button>
              </div>
            ) : (
              <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">{user.name}</h2>
            )}
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">Food Enthusiast & Critic</p>
          </section>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container p-md rounded-xl flex flex-col justify-between min-h-[120px] shadow-sm">
              <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
              <div>
                <p className="font-headline-sm text-headline-sm text-primary leading-tight">{totalOrders}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Orders</p>
              </div>
            </div>
            <div className="bg-surface-container p-md rounded-xl flex flex-col justify-between min-h-[120px] shadow-sm">
              <span className="material-symbols-outlined text-primary text-3xl">stars</span>
              <div>
                <p className="font-headline-sm text-headline-sm text-primary leading-tight">{loyaltyPoints}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Foodie Points</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-sm">
            <button 
              onClick={() => router.push('/orders')}
              className="flex items-center justify-between p-md bg-surface-container-low rounded-xl active:scale-[0.98] transition-all shadow-sm text-left w-full"
            >
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                <span className="font-label-lg text-label-lg uppercase">My Orders</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </button>

            <button 
              onClick={() => router.push('/loyalty')}
              className="flex items-center justify-between p-md bg-surface-container-low rounded-xl active:scale-[0.98] transition-all shadow-sm text-left w-full"
            >
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary">wallet</span>
                <span className="font-label-lg text-label-lg uppercase">Loyalty Wallet</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </button>

            <button 
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="flex items-center justify-between p-md bg-surface-container-low rounded-xl active:scale-[0.98] transition-all shadow-sm text-left w-full"
            >
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary">contact_support</span>
                <span className="font-label-lg text-label-lg uppercase">Support & Feedback</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </button>
          </nav>

          {/* Support Ticket Section */}
          {showFeedbackForm && (
            <div id="feedback-form-card" className="bg-surface-container-high p-md rounded-xl space-y-md shadow-md">
              <div>
                <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface mb-xs">Submit Feedback / Complaint</h3>
                <p className="text-on-surface-variant text-xs font-bold leading-normal">
                  Feedback is analyzed in real-time. Please provide complete details.
                </p>
              </div>

              {successMsg && (
                <div className="bg-accent-green/10 border-2 border-accent-green text-accent-green font-bold text-xs p-4 rounded-xl">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold text-xs p-4 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleComplaintSubmit} className="space-y-md font-hanken">
                <div className="space-y-base">
                  <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">Select Restaurant</label>
                  <select
                    className="w-full bg-surface-bright border-2 border-outline px-md py-base rounded-full font-body-md text-on-surface outline-none"
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                    required
                  >
                    <option value="">Choose Restaurant</option>
                    {restaurants.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-base">
                  <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">Order ID (Optional)</label>
                  <input
                    className="w-full bg-surface-bright border-2 border-outline px-md py-base rounded-full font-body-md text-on-surface outline-none"
                    placeholder="e.g. 12345"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  />
                </div>

                <div className="space-y-base">
                  <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">Service Rating (1 to 5)</label>
                  <div className="flex gap-sm">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setRating(stars)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-colors ${
                          rating >= stars ? 'bg-primary text-on-primary border-primary' : 'bg-white border-outline text-on-surface-variant'
                        }`}
                      >
                        {stars}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-base">
                  <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">Describe your experience</label>
                  <textarea
                    className="w-full bg-surface-bright border-2 border-outline px-md py-4 rounded-xl font-body-md text-on-surface outline-none min-h-[100px]"
                    placeholder="Provide details..."
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-label-lg text-label-lg uppercase active:scale-95 transition-all shadow-md flex justify-center items-center gap-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          )}
        </main>

        {/* BottomNavBar */}
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container dark:bg-surface-container-high z-50 rounded-t-lg shadow-[0_-4px_20px_0_rgba(62,31,26,0.08)]">
          <Link href="/" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined">explore</span>
            <span className="font-label-sm text-label-sm mt-xs">Explore</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span className="font-label-sm text-label-sm mt-xs">Scan</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-label-sm text-label-sm mt-xs">Orders</span>
          </Link>
          <Link href="/loyalty" className="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim px-sm py-xs hover:text-primary transition-all duration-200">
            <span className="material-symbols-outlined">wallet</span>
            <span className="font-label-sm text-label-sm mt-xs">Rewards</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-sm py-xs active:scale-90 transition-all duration-200">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="font-label-sm text-label-sm mt-xs">Profile</span>
          </Link>
        </nav>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative pb-20">
        <header className="fixed top-0 w-full z-50 bg-surface-container-low shadow-[0_8px_30px_rgb(62,31,26,0.08)]">
          <div className="flex justify-between items-center w-full px-margin py-base max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-md">
              <Link href="/" className="font-display-md text-display-md text-primary tracking-tighter uppercase">foodmood OS</Link>
              <nav className="hidden md:flex items-center gap-md ml-lg">
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/">Discover</Link>
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/orders">Orders</Link>
                <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-lg text-label-lg" href="/orders">Reservations</Link>
                <Link className="text-primary font-bold border-b-2 border-primary pb-1 font-label-lg text-label-lg" href="/profile">Profile</Link>
              </nav>
            </div>
            <div className="flex items-center gap-sm">
              <button className="p-base hover:bg-surface-variant/50 transition-all duration-300 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
              </button>
              <button className="p-base hover:bg-surface-variant/50 transition-all duration-300 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              </button>
              <div onClick={handleLogout} className="flex items-center gap-xs ml-sm group cursor-pointer" title="Logout">
                <img className="w-10 h-10 rounded-full object-cover border-2 border-primary" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLBQOKPkaKn4Sm3KxpZyGnZfEp97zSgBFTaLWUhdHS6ByTaXT-16kvBOfElDdqZHXXugzlnQhWM3KUQcc9Nk9GLNpuFLm3PhVru5vuL3y6qYbyYprbjYGPBkZPYoosZz89yiQp3aVx7vvFxZTLHejwQobW_ETqvk-H762lghiptLN7f7o2o7brRLtm4tfeAu8k32XYw3C_wlvzbSKxuMZta8mp8YEoems9IJaC6AnmROMtf18_D1UJfYD4BngjkPy-skdOpK0dIOY" />
                <span className="font-label-lg text-label-lg text-on-surface ml-xs font-bold hover:text-primary transition-colors">Logout</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-screen-2xl mx-auto pt-28 pb-12 px-margin grid grid-cols-12 gap-gutter">
          {/* Sidebar Profile Info */}
          <aside className="col-span-4 space-y-gutter h-fit sticky top-28">
            <div className="bg-surface-container rounded-xl p-md flex flex-col items-center text-center">
              <div className="relative mb-sm">
                <div className="w-24 h-24 rounded-full border-4 border-primary-container shadow-lg overflow-hidden bg-primary">
                  <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLBQOKPkaKn4Sm3KxpZyGnZfEp97zSgBFTaLWUhdHS6ByTaXT-16kvBOfElDdqZHXXugzlnQhWM3KUQcc9Nk9GLNpuFLm3PhVru5vuL3y6qYbyYprbjYGPBkZPYoosZz89yiQp3aVx7vvFxZTLHejwQobW_ETqvk-H762lghiptLN7f7o2o7brRLtm4tfeAu8k32XYw3C_wlvzbSKxuMZta8mp8YEoems9IJaC6AnmROMtf18_D1UJfYD4BngjkPy-skdOpK0dIOY" />
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute bottom-0 right-0 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-surface active:scale-90 transition-transform animate-bounce"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>

              {isEditing ? (
                <div className="flex gap-2 items-center mb-1">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border-2 border-outline bg-white text-on-surface px-4 py-1.5 rounded-full text-xs outline-none font-bold"
                  />
                  <button onClick={handleUpdateName} className="bg-primary text-on-primary text-[10px] uppercase font-bold px-3 py-2 rounded-full active:scale-95 transition-transform">Save</button>
                </div>
              ) : (
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">{user.name}</h2>
              )}
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">Food Enthusiast & Critic</p>

              <div className="flex gap-sm w-full mt-lg border-t border-dashed border-outline-variant/30 pt-md">
                <div className="flex-1 bg-surface-container-lowest p-sm rounded-lg shadow-inner">
                  <span className="block font-display-md text-[24px] text-primary">{totalOrders}</span>
                  <span className="block font-label-sm text-label-sm uppercase text-on-surface-variant">Orders</span>
                </div>
                <div className="flex-1 bg-surface-container-lowest p-sm rounded-lg shadow-inner">
                  <span className="block font-display-md text-[24px] text-primary">{loyaltyPoints}</span>
                  <span className="block font-label-sm text-label-sm uppercase text-on-surface-variant">Points</span>
                </div>
              </div>
            </div>

            <nav className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => router.push('/orders')} className="flex items-center gap-md p-md hover:bg-surface-variant/40 transition-colors group text-left w-full">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                <span className="font-label-lg uppercase group-hover:translate-x-1 transition-transform">My Orders</span>
              </button>
              <button onClick={() => router.push('/loyalty')} className="flex items-center gap-md p-md hover:bg-surface-variant/40 transition-colors group text-left w-full">
                <span className="material-symbols-outlined text-primary">wallet</span>
                <span className="font-label-lg uppercase group-hover:translate-x-1 transition-transform">Loyalty Wallet</span>
              </button>
              <button onClick={() => setShowFeedbackForm(!showFeedbackForm)} className="flex items-center gap-md p-md hover:bg-surface-variant/40 transition-colors group text-left w-full">
                <span className="material-symbols-outlined text-primary">contact_support</span>
                <span className="font-label-lg uppercase group-hover:translate-x-1 transition-transform">Support & Feedback</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="col-span-8 space-y-gutter">
            {/* Feedback / Complaint Bento Section */}
            {showFeedbackForm ? (
              <div id="feedback-form-card" className="bg-surface-container-high p-lg rounded-xl space-y-md shadow-md border border-outline-variant/10">
                <div>
                  <h3 className="font-headline-lg text-headline-sm uppercase text-on-surface mb-xs">Submit Feedback / Complaint</h3>
                  <p className="text-on-surface-variant text-sm font-bold leading-normal">
                    Help us serve you better. Compliant and feedback is processed with real-time AI analytics.
                  </p>
                </div>

                {successMsg && (
                  <div className="bg-accent-green/10 border-2 border-accent-green text-accent-green font-bold text-sm p-4 rounded-xl">
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold text-sm p-4 rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleComplaintSubmit} className="space-y-md font-hanken">
                  <div className="space-y-base">
                    <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">Select Restaurant</label>
                    <select
                      className="w-full bg-surface-bright border-2 border-outline px-md py-base rounded-full font-body-md text-on-surface outline-none"
                      value={restaurantId}
                      onChange={(e) => setRestaurantId(e.target.value)}
                      required
                    >
                      <option value="">Choose Restaurant</option>
                      {restaurants.map((r: any) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-base">
                    <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">Order ID (Optional)</label>
                    <input
                      className="w-full bg-surface-bright border-2 border-outline px-md py-base rounded-full font-body-md text-on-surface outline-none"
                      placeholder="e.g. 12345"
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-base">
                    <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">Service Rating (1 to 5)</label>
                    <div className="flex gap-sm">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setRating(stars)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-colors ${
                            rating >= stars ? 'bg-primary text-on-primary border-primary' : 'bg-white border-outline text-on-surface-variant'
                          }`}
                        >
                          {stars}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-base">
                    <label className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider">Describe your experience</label>
                    <textarea
                      className="w-full bg-surface-bright border-2 border-outline px-md py-4 rounded-xl font-body-md text-on-surface outline-none min-h-[120px]"
                      placeholder="Provide details..."
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-on-primary py-4 rounded-full font-label-lg text-label-lg uppercase active:scale-95 transition-all shadow-md flex justify-center items-center gap-sm"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-surface-container-high rounded-xl p-lg flex flex-col justify-center items-center text-center min-h-[300px] border border-outline-variant/10 shadow-sm">
                <span className="material-symbols-outlined text-primary text-6xl mb-md">account_box</span>
                <h3 className="font-headline-lg text-headline-sm uppercase text-on-surface mb-xs">Profile Dashboard</h3>
                <p className="text-on-surface-variant text-sm font-bold leading-normal max-w-md">
                  Choose a menu item from the sidebar to manage your reservations, billing history, or view loyalty details.
                </p>
              </div>
            )}
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

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
