'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  isVeg?: boolean;
  spiceLevel?: string;
  imageUrl?: string;
  tags?: string[];
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  items: MenuItem[];
}

export default function MenuManagementPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [mobileTab, setMobileTab] = useState('');
  
  // Item configuration form
  const [configDietary, setConfigDietary] = useState('Non-Veg');
  const [configSpice, setConfigSpice] = useState('Medium');
  const [configSmallPrice, setConfigSmallPrice] = useState('');
  const [configMediumPrice, setConfigMediumPrice] = useState('');
  const [configLargePrice, setConfigLargePrice] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        if (!user?.restaurantId) return;
        const res: any = await api.get(`/api/v1/menu/${user.restaurantId}`);
        if (res.success && res.data) {
          const cats = res.data.categories || res.data;
          setCategories(Array.isArray(cats) ? cats : []);
          if (Array.isArray(cats) && cats.length > 0) {
            setSelectedCategory(cats[0]);
            setMobileTab(cats[0].name);
          }
        }
      } catch (e) {
        console.error('Failed to load menu:', e);
        // Fallback demo data
        const demo: Category[] = [
          { id: '1', name: 'Signature Steaks', isActive: true, items: [
            { id: 'i1', name: 'Dry-Aged Ribeye (16oz)', description: '28-day aged, bone-in, finished with...', price: 4800, isAvailable: true, tags: ['High Prep', 'Low Stock Alert'] },
            { id: 'i2', name: 'Prime Filet Mignon', description: '8oz center cut, incredibly tender,...', price: 5400, isAvailable: true, tags: ['Limited Supply'] },
            { id: 'i3', name: 'NY Strip Au Poivre', description: 'Cracked peppercorn crust, cognac...', price: 4200, isAvailable: false, tags: ['Locally Sourced'] },
          ]},
          { id: '2', name: 'Artisanal Pizzas', isActive: true, items: [
            { id: 'i4', name: 'Truffle Margherita', price: 2400, isAvailable: true, items: [] } as any,
          ]},
          { id: '3', name: 'Seafood Entrees', isActive: true, items: [] },
          { id: '4', name: 'Craft Cocktails', isActive: true, items: [] },
          { id: '5', name: 'Desserts', isActive: false, items: [] },
        ];
        setCategories(demo);
        setSelectedCategory(demo[0]);
        setMobileTab(demo[0].name);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [user]);

  const toggleItemAvailability = (itemId: string) => {
    if (!selectedCategory) return;
    const updated = { ...selectedCategory, items: selectedCategory.items.map(i => i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i) };
    setSelectedCategory(updated);
    setCategories(categories.map(c => c.id === updated.id ? updated : c));
  };

  const openItemConfig = (item: MenuItem) => {
    setEditingItem(item);
    setConfigDietary(item.isVeg ? 'Veg' : 'Non-Veg');
    setConfigSpice(item.spiceLevel || 'Medium');
    setConfigSmallPrice(String(Math.round(item.price * 0.67)));
    setConfigMediumPrice(String(item.price));
    setConfigLargePrice(String(Math.round(item.price * 1.33)));
  };

  if (loading) {
    return <div className="space-y-md animate-pulse"><div className="h-8 bg-surface-container rounded-lg w-48" /><div className="h-64 bg-surface-container rounded-xl" /></div>;
  }

  return (
    <>
      {/* ═══════════════════════════════ */}
      {/* MOBILE VIEW                     */}
      {/* ═══════════════════════════════ */}
      <div className="md:hidden space-y-md">
        <p className="font-label-lg text-label-lg text-primary uppercase tracking-widest">Menu</p>
        
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-full py-sm pl-12 pr-4 font-label-lg text-on-surface outline-none focus:border-primary" placeholder="Search menu items..." />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-base overflow-x-auto pb-xs hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat); setMobileTab(cat.name); }}
              className={`flex-shrink-0 px-md py-xs rounded-full font-label-lg text-label-lg uppercase transition-all whitespace-nowrap ${
                mobileTab === cat.name ? 'bg-primary text-on-primary border-b-2 border-primary' : 'text-on-surface-variant'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Mobile Menu Items */}
        <div className="space-y-md">
          {(selectedCategory?.items || []).map((item) => (
            <div key={item.id} className="bg-surface-container-low rounded-xl p-md umami-shadow">
              <div className="flex items-start gap-md">
                <div className="w-20 h-20 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-3xl">lunch_dining</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-headline-sm text-body-lg uppercase">{item.name}</h4>
                    <div className="flex items-center gap-xs">
                      <div
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`w-12 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${item.isAvailable ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'}`}
                      >
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <span className={`font-label-sm text-label-sm ${item.isAvailable ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {item.isAvailable ? 'AVAILABLE' : 'SOLD OUT'}
                  </span>
                  <p className="font-headline-sm text-primary mt-xs">₹{item.price}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-sm pt-sm border-t border-outline-variant/30">
                <div className="flex gap-sm">
                  <button onClick={() => openItemConfig(item)} className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-xl">edit</span>
                  </button>
                  <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-xl">content_copy</span>
                  </button>
                </div>
                <button className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-xl">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Add Button */}
        <Link href="/owner/menu/add" className="fixed bottom-24 right-margin w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 z-40">
          <span className="material-symbols-outlined text-3xl">add</span>
        </Link>
      </div>

      {/* ═══════════════════════════════ */}
      {/* DESKTOP VIEW                    */}
      {/* ═══════════════════════════════ */}
      <div className="hidden md:block">
        <div className="grid grid-cols-12 gap-gutter">
          {/* Categories Left Panel */}
          <div className="col-span-4 space-y-md">
            <div className="flex items-center gap-sm mb-md">
              <h2 className="font-display-md text-headline-lg text-on-surface uppercase">Categories</h2>
              <button className="text-primary font-label-lg flex items-center gap-xs hover:underline">
                <span className="material-symbols-outlined text-xl">add_circle</span>
                New Category
              </button>
            </div>
            
            <div className="space-y-sm">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left p-md rounded-xl flex items-center justify-between transition-all group ${
                    selectedCategory?.id === cat.id ? 'bg-primary text-on-primary' : 'bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-sm">
                    <span className={`material-symbols-outlined text-xl ${selectedCategory?.id === cat.id ? 'text-on-primary' : 'text-on-surface-variant'}`}>drag_indicator</span>
                    <div>
                      <p className="font-headline-sm text-body-lg">{cat.name}</p>
                      <p className={`font-label-sm text-label-sm ${selectedCategory?.id === cat.id ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                        {cat.items.length} items{!cat.isActive ? ' • Inactive' : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined ${selectedCategory?.id === cat.id ? 'text-on-primary' : 'text-on-surface-variant'}`}>chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="col-span-8 space-y-md">
            {selectedCategory && (
              <>
                {/* Category Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="bg-primary text-on-primary px-sm py-xs rounded-lg font-label-sm text-label-sm uppercase mb-sm inline-block">Active Collection</span>
                    <h2 className="font-display-md text-display-md text-on-surface uppercase leading-tight">{selectedCategory.name}</h2>
                    <p className="font-body-md text-on-surface-variant mt-xs">
                      {selectedCategory.items.length > 0 ? `Premium cuts of aged beef, char-grilled to perfection with our house-blend rub.` : 'No items in this category yet.'}
                    </p>
                  </div>
                  <div className="flex gap-sm">
                    <button className="w-12 h-12 rounded-xl border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-all">
                      <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
                    </button>
                    <Link href="/owner/menu/add" className="bg-primary text-on-primary px-md py-sm rounded-full font-label-lg flex items-center gap-xs hover:brightness-110 active:scale-95 transition-all shadow-md">
                      <span className="material-symbols-outlined">add</span>
                      New Item
                    </Link>
                  </div>
                </div>

                {/* Menu Items List */}
                <div className="space-y-md">
                  {(selectedCategory.items || []).map((item) => (
                    <div key={item.id} className="bg-surface-container-low p-md rounded-xl umami-shadow flex items-center gap-md hover:bg-surface-container transition-colors">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">lunch_dining</span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-headline-sm text-body-lg">{item.name}</h4>
                        <p className="font-body-md text-on-surface-variant text-sm truncate">{item.description || 'No description'}</p>
                        <div className="flex gap-sm mt-xs">
                          {(item.tags || []).map((tag) => (
                            <span key={tag} className="flex items-center gap-xs text-label-sm font-label-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-xs">{tag.includes('Prep') ? 'local_fire_department' : tag.includes('Stock') ? 'inventory_2' : tag.includes('Limited') ? 'warning' : 'eco'}</span>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <p className="font-headline-sm text-primary">₹{item.price}</p>

                      {/* Toggle */}
                      <div className="flex flex-col items-center gap-xs">
                        <div
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`w-12 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${item.isAvailable ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'}`}
                        >
                          <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                        </div>
                        <span className={`font-label-sm text-label-sm ${item.isAvailable ? 'text-primary' : 'text-error'}`}>
                          {item.isAvailable ? 'IN STOCK' : 'SOLD OUT'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Item Configuration Drawer */}
                {editingItem && (
                  <div className="bg-surface-container p-lg rounded-xl umami-shadow border-t-4 border-primary mt-lg">
                    <div className="flex justify-between items-center mb-md">
                      <h3 className="font-headline-sm text-headline-sm uppercase">Item Configuration</h3>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">TXID: #{editingItem.id.slice(0, 8)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-lg">
                      {/* Dietary */}
                      <div>
                        <p className="font-label-lg text-label-lg text-on-surface-variant mb-sm">Dietary Preference</p>
                        <div className="flex rounded-full overflow-hidden border border-outline-variant">
                          {['Non-Veg', 'Veg'].map((d) => (
                            <button
                              key={d}
                              onClick={() => setConfigDietary(d)}
                              className={`flex-1 py-sm font-label-lg text-label-lg transition-all ${configDietary === d ? (d === 'Non-Veg' ? 'bg-error text-on-error' : 'bg-accent-green text-white') : 'bg-transparent text-on-surface-variant'}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Spice Level */}
                      <div>
                        <p className="font-label-lg text-label-lg text-on-surface-variant mb-sm">Spice Level</p>
                        <div className="flex rounded-full overflow-hidden border border-outline-variant">
                          {['Mild', 'Medium', 'Spicy'].map((s) => (
                            <button
                              key={s}
                              onClick={() => setConfigSpice(s)}
                              className={`flex-1 py-sm font-label-lg text-label-lg transition-all ${configSpice === s ? 'bg-primary text-on-primary' : 'bg-transparent text-on-surface-variant'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Portion Sizes */}
                    <div className="mt-lg">
                      <p className="font-label-lg text-label-lg text-on-surface-variant mb-sm">Portion Sizes & Pricing</p>
                      <div className="grid grid-cols-3 gap-md">
                        {[
                          { label: 'Small', val: configSmallPrice, set: setConfigSmallPrice },
                          { label: 'Medium', val: configMediumPrice, set: setConfigMediumPrice },
                          { label: 'Large', val: configLargePrice, set: setConfigLargePrice },
                        ].map((p) => (
                          <div key={p.label}>
                            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">{p.label}</label>
                            <input
                              value={p.val}
                              onChange={(e) => p.set(e.target.value)}
                              className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                              placeholder="₹0.00"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-md mt-lg">
                      <button onClick={() => setEditingItem(null)} className="px-lg py-sm rounded-full font-label-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all">
                        Cancel
                      </button>
                      <button onClick={() => setEditingItem(null)} className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-lg hover:brightness-110 active:scale-95 transition-all shadow-md">
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
