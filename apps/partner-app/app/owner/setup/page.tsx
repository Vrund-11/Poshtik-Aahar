'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

interface Branch {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  tables?: any[];
}

interface RestaurantData {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  cuisineTypes?: string[];
  branches: Branch[];
}

export default function RestaurantSetupPage() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [mainAddress, setMainAddress] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [newCuisine, setNewCuisine] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Accordion state for mobile
  const [profileOpen, setProfileOpen] = useState(true);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [branchesOpen, setBranchesOpen] = useState(false);
  const [tablesOpen, setTablesOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res: any = await api.get('/api/v1/restaurants');
        if (res.success && res.data && res.data.length > 0) {
          const r = res.data[0];
          setRestaurant(r);
          setRestaurantName(r.name || '');
          setContactPhone(r.phone || '');
          setMainAddress(r.address || '');
          setCuisineTypes(r.cuisineTypes || ['Mediterranean', 'Bistro']);
          if (r.branches && r.branches.length > 0) {
            setSelectedBranch(r.branches[0]);
          }
        }
      } catch (e) {
        console.error('Failed to load restaurant:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save restaurant profile
      await api.patch(`/api/v1/restaurants/${restaurant?.id}`, {
        name: restaurantName,
        phone: contactPhone,
        address: mainAddress,
      });
    } catch (e) {
      console.error('Failed to save:', e);
    } finally {
      setSaving(false);
    }
  };

  const addCuisine = () => {
    if (newCuisine.trim() && !cuisineTypes.includes(newCuisine.trim())) {
      setCuisineTypes([...cuisineTypes, newCuisine.trim()]);
      setNewCuisine('');
    }
  };

  if (loading) {
    return (
      <div className="space-y-md animate-pulse">
        <div className="h-8 bg-surface-container rounded-lg w-48" />
        <div className="h-64 bg-surface-container rounded-xl" />
      </div>
    );
  }

  const branches = restaurant?.branches || [];
  const mockTables = [
    { id: '01', capacity: 4, tags: ['WINDOW', 'BOOTH'] },
    { id: '02', capacity: 2, tags: ['AISLE'] },
    { id: '03', capacity: 6, tags: ['PRIVATE'] },
  ];

  return (
    <>
      {/* ═══════════════════════════════ */}
      {/* MOBILE VIEW                     */}
      {/* ═══════════════════════════════ */}
      <div className="md:hidden space-y-md">
        <div>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight">Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Configure your restaurant identity and operational layout.</p>
        </div>

        {/* Profile Accordion */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden umami-shadow">
          <button onClick={() => setProfileOpen(!profileOpen)} className="w-full flex items-center justify-between p-md border-none bg-transparent">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">storefront</span>
              </div>
              <span className="font-label-lg text-label-lg uppercase">Profile</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">{profileOpen ? 'expand_less' : 'expand_more'}</span>
          </button>

          {profileOpen && (
            <div className="px-md pb-md space-y-md">
              {/* Restaurant Image */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface-container-high flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-primary text-5xl">add_a_photo</span>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Upload Cover Photo</p>
                </div>
              </div>

              {/* Restaurant Name */}
              <div>
                <p className="font-label-lg text-label-lg text-primary uppercase tracking-widest mb-xs">Restaurant Name</p>
                <input
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-xl px-md py-sm font-headline-sm text-headline-sm text-on-surface outline-none focus:border-primary uppercase"
                  placeholder="THE GILDED FIG"
                />
              </div>

              {/* Cuisine Type Chips */}
              <div>
                <p className="font-label-lg text-label-lg text-primary uppercase tracking-widest mb-sm">Cuisine Type</p>
                <div className="flex flex-wrap gap-base">
                  {cuisineTypes.map((c) => (
                    <span key={c} className="bg-primary text-on-primary px-md py-xs rounded-full font-label-lg text-label-lg">{c}</span>
                  ))}
                  <button
                    onClick={addCuisine}
                    className="border-2 border-outline-variant text-on-surface-variant px-md py-xs rounded-full font-label-lg text-label-lg"
                  >
                    + Add Category
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Photos Accordion */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden umami-shadow">
          <button onClick={() => setPhotosOpen(!photosOpen)} className="w-full flex items-center justify-between p-md border-none bg-transparent">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">photo_library</span>
              </div>
              <span className="font-label-lg text-label-lg uppercase">Photos</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">{photosOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
          {photosOpen && (
            <div className="px-md pb-md">
              <div className="grid grid-cols-3 gap-base">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-high">
                    <span className="material-symbols-outlined text-on-surface-variant">add_photo_alternate</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Branches Accordion */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden umami-shadow">
          <button onClick={() => setBranchesOpen(!branchesOpen)} className="w-full flex items-center justify-between p-md border-none bg-transparent">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
              </div>
              <span className="font-label-lg text-label-lg uppercase">Branches</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">{branchesOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
          {branchesOpen && (
            <div className="px-md pb-md space-y-sm">
              {branches.map((b) => (
                <div key={b.id} className="p-sm bg-surface-container rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-label-lg text-label-lg">{b.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{b.isActive ? 'ACTIVE' : 'INACTIVE'} • {b.tables?.length || 0} TABLES</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tables & Layout Accordion */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden umami-shadow">
          <button onClick={() => setTablesOpen(!tablesOpen)} className="w-full flex items-center justify-between p-md border-none bg-transparent">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 bg-tertiary-fixed rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
              </div>
              <span className="font-label-lg text-label-lg uppercase">Tables & Layout</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">{tablesOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
        </div>

        {/* Save FAB */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="fixed bottom-24 right-margin w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 z-40"
        >
          <span className="material-symbols-outlined text-3xl">save</span>
        </button>
      </div>

      {/* ═══════════════════════════════ */}
      {/* DESKTOP VIEW                    */}
      {/* ═══════════════════════════════ */}
      <div className="hidden md:block space-y-lg">
        {/* Restaurant Profile Section */}
        <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
          <div className="flex justify-between items-start mb-lg">
            <div>
              <h2 className="font-display-md text-display-md text-on-surface leading-tight">Restaurant Profile</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Define your brand identity and primary contact details.</p>
            </div>
            <span className="material-symbols-outlined text-primary text-4xl fill-icon">restaurant</span>
          </div>

          <div className="flex gap-lg items-start">
            {/* Logo */}
            <div className="flex-shrink-0 text-center">
              <div className="w-32 h-32 rounded-full bg-surface-container-high border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl">add_a_photo</span>
              </div>
              <p className="font-label-sm text-label-sm text-primary mt-sm uppercase">Change Logo</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Restaurant Name</label>
                  <input
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                    placeholder="The Umami Kitchen"
                  />
                </div>
                <div>
                  <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Contact Phone</label>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                    placeholder="+1 (555) 012-3456"
                  />
                </div>
              </div>
              <div>
                <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Main Address</label>
                <input
                  value={mainAddress}
                  onChange={(e) => setMainAddress(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                  placeholder="742 Evergreen Terrace, Gastronomy District, NY 10001"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
          <div className="flex justify-between items-start mb-md">
            <div>
              <h3 className="font-display-md text-headline-lg text-on-surface">Gallery</h3>
              <p className="font-body-md text-on-surface-variant">Showcase your ambiance and signature dishes (Max 5 slots).</p>
            </div>
          </div>
          <div className="flex gap-md mb-md">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`w-36 h-28 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${i <= 2 ? 'bg-surface-container-high' : 'border-2 border-dashed border-outline-variant bg-surface-container-highest'}`}>
                {i <= 2 ? (
                  <span className="material-symbols-outlined text-primary text-3xl">image</span>
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant">add_photo_alternate</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-on-primary px-lg py-md rounded-full font-label-lg flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <span className="material-symbols-outlined">save</span>
              {saving ? 'SAVING...' : 'SAVE ALL CHANGES'}
            </button>
          </div>
        </div>

        {/* Branches + Floor Plan */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Branches List */}
          <div className="col-span-4">
            <div className="flex items-center gap-sm mb-md">
              <h3 className="font-display-md text-headline-lg text-on-surface">Branches</h3>
              <button className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all">
                <span className="material-symbols-outlined text-xl">add_circle</span>
              </button>
            </div>
            <div className="space-y-sm">
              {(branches.length > 0 ? branches : [
                { id: '1', name: 'Manhattan Central', isActive: true, tables: Array(12).fill(null) },
                { id: '2', name: 'Brooklyn Heights', isActive: true, tables: Array(8).fill(null) },
                { id: '3', name: 'Queens Plaza', isActive: false, tables: [] },
              ]).map((b: any) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b)}
                  className={`w-full text-left p-md rounded-xl border-l-4 transition-all ${
                    selectedBranch?.id === b.id ? 'bg-surface-container border-primary' : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <p className="font-headline-sm text-body-lg">{b.name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {b.isActive ? 'ACTIVE' : 'ONBOARDING'} • {b.tables?.length || 0} TABLES
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Floor Plan */}
          <div className="col-span-8">
            <div className="flex justify-between items-start mb-md">
              <div>
                <h3 className="font-display-md text-headline-lg text-on-surface">Floor Plan: {selectedBranch?.name || 'Manhattan'}</h3>
                <p className="font-body-md text-on-surface-variant">Configure table capacity and digital access points.</p>
              </div>
              <button className="border-2 border-outline text-on-surface px-md py-sm rounded-full font-label-lg hover:bg-surface-container-high transition-all">
                EDIT MAP
              </button>
            </div>
            <div className="grid grid-cols-3 gap-md">
              {mockTables.map((table) => (
                <div key={table.id} className="bg-inverse-surface text-inverse-on-surface p-md rounded-xl umami-shadow">
                  <div className="flex justify-between items-center mb-md">
                    <span className="font-headline-lg text-headline-lg">{table.id}</span>
                    <span className="material-symbols-outlined">qr_code_2</span>
                  </div>
                  <p className="font-label-lg text-label-lg uppercase opacity-70">Capacity</p>
                  <div className="flex items-center gap-xs mt-xs">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span className="font-headline-sm text-headline-sm">{table.capacity} PPL</span>
                  </div>
                  <div className="flex flex-wrap gap-xs mt-sm">
                    {table.tags.map((tag) => (
                      <span key={tag} className="bg-surface-container-lowest/20 text-inverse-on-surface px-sm py-xs rounded-full font-label-sm text-label-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add Table */}
              <button className="border-2 border-dashed border-outline-variant rounded-xl p-md flex flex-col items-center justify-center gap-sm text-on-surface-variant hover:border-primary hover:text-primary transition-all min-h-[160px]">
                <span className="material-symbols-outlined text-3xl">add</span>
                <span className="font-label-lg text-label-lg uppercase">Add Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
