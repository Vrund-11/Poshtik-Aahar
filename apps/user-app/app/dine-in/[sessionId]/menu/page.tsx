'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSessionStore } from '../../../stores/sessionStore';
import { useCartStore, selectCartTotal } from '../../../stores/cartStore';
import { useMenu } from '../../../hooks/useMenu';
import Link from 'next/link';

interface ModifierOption {
  name: string;
  price: number;
}

interface ModifierGroup {
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  description: string;
  imageUrl?: string;
  modifiers?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

export default function DineInMenuPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { activeSession, refreshSession } = useSessionStore();
  
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const cartTotal = useCartStore(selectCartTotal);

  const { data: menuData, isLoading: loading, error: queryError } = useMenu(activeSession?.restaurantId || null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Customization Item Details Modal State
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [itemNotes, setItemNotes] = useState('');

  const categories = useMemo<MenuCategory[]>(() => {
    if (!menuData) return [];
    return (menuData.categories || menuData || []) as MenuCategory[];
  }, [menuData]);

  useEffect(() => {
    if (!activeSession) {
      refreshSession().then(() => {
        const fresh = useSessionStore.getState().activeSession;
        if (!fresh) {
          router.push('/scan');
        }
      });
    }
  }, [activeSession]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  const error = queryError ? 'Could not load menu. Please try again.' : '';

  const handleOpenItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setItemNotes('');
    
    const initialMods: Record<string, string[]> = {};
    if (item.modifiers) {
      try {
        const groups: ModifierGroup[] = JSON.parse(item.modifiers);
        groups.forEach(g => {
          if (g.required && g.maxSelections === 1 && g.options.length > 0) {
            initialMods[g.name] = [g.options[0].name];
          } else {
            initialMods[g.name] = [];
          }
        });
      } catch (e) {}
    }
    setSelectedModifiers(initialMods);
  };

  const handleModifierToggle = (groupName: string, optionName: string, maxSelections: number) => {
    const current = [...(selectedModifiers[groupName] || [])];
    const idx = current.indexOf(optionName);

    if (maxSelections === 1) {
      if (idx > -1) {
        setSelectedModifiers({ ...selectedModifiers, [groupName]: [] });
      } else {
        setSelectedModifiers({ ...selectedModifiers, [groupName]: [optionName] });
      }
    } else {
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        if (current.length < maxSelections) {
          current.push(optionName);
        }
      }
      setSelectedModifiers({ ...selectedModifiers, [groupName]: current });
    }
  };

  const handleAddToCartClick = () => {
    if (!selectedItem || !activeSession) return;

    let extraCost = 0;
    if (selectedItem.modifiers) {
      try {
        const groups: ModifierGroup[] = JSON.parse(selectedItem.modifiers);
        for (const g of groups) {
          const selected = selectedModifiers[g.name] || [];
          if (g.required && selected.length < g.minSelections) {
            alert(`Please select at least ${g.minSelections} option(s) for ${g.name}`);
            return;
          }
          // Calculate modifier pricing additions
          selected.forEach(optName => {
            const optObj = g.options.find(o => o.name === optName);
            if (optObj) {
              extraCost += Number(optObj.price);
            }
          });
        }
      } catch (e) {}
    }

    addItem({
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price: Number(selectedItem.price) + extraCost,
      quantity: itemQuantity,
      imageUrl: selectedItem.imageUrl,
      notes: itemNotes,
      selectedModifiers: Object.entries(selectedModifiers).map(([groupName, names]) => ({
        groupName,
        name: names.join(', '),
        price: 0 // pre-added to item price above
      })).filter(m => m.name !== '')
    }, activeSession.restaurantId);

    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 animate-pulse text-center pt-24 bg-background min-h-screen">
        <div className="h-12 w-1/3 bg-surface-container mx-auto rounded-full" />
        <div className="h-64 bg-surface-container rounded-3xl" />
        <div className="h-20 bg-surface-container rounded-3xl" />
      </div>
    );
  }

  const activeCategoryData = categories.find(c => c.name === selectedCategory) || categories[0];
  const itemsToDisplay = activeCategoryData 
    ? activeCategoryData.items.filter(item => !vegOnly || item.isVeg)
    : [];

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen relative w-full select-none pb-32">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative">
        <header className="bg-surface sticky top-0 w-full z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <div className="flex items-center gap-base">
            <span onClick={() => router.push('/')} className="material-symbols-outlined text-primary p-2 active:scale-95 cursor-pointer">arrow_back</span>
            <h1 className="font-display-md text-headline-lg-mobile text-primary uppercase tracking-tight">
              {activeSession?.restaurantName || 'foodmood'}
            </h1>
          </div>
          <div className="flex items-center gap-sm">
            <div className="bg-primary text-on-primary font-headline-sm px-4 py-1.5 rounded-full text-xs shadow-sm uppercase">
              TABLE {activeSession?.tableNumber}
            </div>
          </div>
        </header>

        {/* Categories Bar */}
        <nav className="sticky top-20 z-40 bg-surface py-base border-b border-outline-variant/30 overflow-x-auto no-scrollbar">
          <div className="flex gap-base px-gutter">
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-4 py-2 rounded-full font-label-lg whitespace-nowrap active:scale-95 transition-all ${
                  selectedCategory === c.name ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Veg Toggle */}
        <section className="px-gutter pt-md pb-base flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-lg text-on-background uppercase tracking-tight">{selectedCategory || 'Menu'}</h2>
            <p className="text-on-surface-variant text-xs">Chef's specialties freshly prepared</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-on-surface-variant uppercase">VEG ONLY</span>
            <input 
              type="checkbox" 
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="w-8 h-5 bg-surface-container-highest checked:bg-primary border-none rounded-full appearance-none relative transition-all duration-300 cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-3 before:transition-all"
            />
          </label>
        </section>

        {/* Menu Items List */}
        <main className="px-gutter flex flex-col gap-md pb-24">
          {itemsToDisplay.length === 0 ? (
            <div className="text-center py-10 font-bold text-on-surface-variant">No items match filters</div>
          ) : (
            itemsToDisplay.map((item) => (
              <article 
                key={item.id} 
                onClick={() => handleOpenItem(item)}
                className="flex gap-md bg-surface-container-low p-base rounded-xl border border-outline-variant/35 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-outline-variant/30 bg-white">
                  <img 
                    className="w-full h-full object-cover" 
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'} 
                    alt={item.name} 
                  />
                  <div className="absolute top-1 left-1 bg-white p-0.5 rounded-sm shadow-sm flex items-center justify-center">
                    <div className={`w-3 h-3 border-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'} rounded-sm flex items-center justify-center`}>
                      <div className={`w-1.5 h-1.5 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-background uppercase">{item.name}</h3>
                    <p className="text-on-surface-variant text-xs line-clamp-2 mt-xs">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-sm">
                    <span className="text-primary font-headline-sm text-headline-sm">₹{Number(item.price)}</span>
                    <button className="w-9 h-9 bg-primary text-on-primary rounded-full flex items-center justify-center active:scale-95">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </main>

        {/* Floating Cart Panel */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-50 bg-primary text-on-primary p-md rounded-full shadow-lg border border-outline-variant/30 flex justify-between items-center px-6">
            <div>
              <p className="text-xs uppercase font-bold text-on-primary/75">{cartItems.length} items selected</p>
              <p className="font-headline-sm text-lg">Total: ₹{cartTotal}</p>
            </div>
            <Link 
              href={`/dine-in/${sessionId}/cart`}
              className="bg-white text-primary px-5 py-2.5 rounded-full font-headline-sm text-xs uppercase flex items-center gap-xs active:scale-95"
            >
              Go to Cart
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative">
        <header className="bg-surface fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20 shadow-sm">
          <div className="flex items-center gap-8">
            <span onClick={() => router.push('/')} className="font-display-md text-display-md text-primary cursor-pointer">foodmood OS</span>
            <nav className="hidden md:flex gap-6 items-center">
              <span className="text-primary border-b-2 border-primary font-bold py-1 font-label-lg text-label-lg">Dine-in Menu</span>
              <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg" href={`/dine-in/${sessionId}/tracking`}>Track Active Orders</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg" href={`/dine-in/${sessionId}/bill`}>Pay Bill</Link>
            </nav>
          </div>
          <div className="flex items-center gap-sm">
            <div className="bg-primary text-on-primary font-headline-sm px-6 py-2 rounded-full uppercase">
              TABLE {activeSession?.tableNumber}
            </div>
          </div>
        </header>

        <main className="max-w-screen-2xl mx-auto pt-24 pb-12 px-margin grid grid-cols-12 gap-gutter">
          {/* Categories Sidebar */}
          <aside className="col-span-3 h-fit sticky top-24 space-y-sm">
            <h3 className="font-label-lg uppercase tracking-widest text-primary mb-md">Categories</h3>
            <div className="flex flex-col gap-xs">
              {categories.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`w-full text-left p-md rounded-xl font-label-lg uppercase transition-all ${
                    selectedCategory === c.name ? 'bg-primary-container text-on-primary-container font-bold' : 'hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="pt-md border-t border-outline-variant/30 flex items-center justify-between">
              <span className="font-bold text-xs uppercase text-on-surface-variant">Vegetarian only</span>
              <input 
                type="checkbox" 
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="w-10 h-6 bg-surface-container checked:bg-primary border-none rounded-full appearance-none relative transition-all duration-300 cursor-pointer before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all"
              />
            </div>
          </aside>

          {/* Items Grid */}
          <section className="col-span-9 space-y-lg">
            <div className="flex justify-between items-end border-b border-outline-variant/30 pb-sm">
              <h2 className="font-display-md text-display-md text-on-surface uppercase tracking-tight">{selectedCategory}</h2>
            </div>

            <div className="grid grid-cols-3 gap-md">
              {itemsToDisplay.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleOpenItem(item)}
                  className="bg-surface-container-low rounded-xl overflow-hidden group flex flex-col hover:shadow-md transition-shadow border border-outline-variant/35 cursor-pointer"
                >
                  <div className="h-44 overflow-hidden relative bg-white border-b border-outline-variant/30">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'} alt={item.name} />
                    <div className="absolute top-3 left-3 bg-white p-1 rounded shadow-sm">
                      <div className={`w-3.5 h-3.5 border-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'} rounded-sm flex items-center justify-center`}>
                        <div className={`w-1.5 h-1.5 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-headline-sm text-on-surface truncate pr-2">{item.name}</h4>
                        <span className="font-headline-sm text-primary">₹{Number(item.price)}</span>
                      </div>
                      <p className="text-on-surface-variant text-body-md line-clamp-2">{item.description}</p>
                    </div>
                    <button className="mt-4 w-full bg-primary text-on-primary py-2.5 rounded-full font-label-lg uppercase active:scale-95 transition-all">
                      Customize & Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Floating Cart Indicator */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-margin right-margin z-50 bg-primary text-on-primary p-lg rounded-xl shadow-xl flex items-center gap-md max-w-sm border border-outline-variant/30 animate-sheet">
            <span className="material-symbols-outlined text-4xl bg-white/10 p-2 rounded-full">shopping_basket</span>
            <div>
              <p className="font-headline-sm text-headline-sm">₹{cartTotal}</p>
              <p className="text-xs text-on-primary/85">{cartItems.length} items in cart</p>
            </div>
            <Link href={`/dine-in/${sessionId}/cart`} className="bg-white text-primary font-label-lg uppercase px-md py-2 rounded-full active:scale-95 transition-all">
              Checkout
            </Link>
          </div>
        )}
      </div>

      {/* ITEM DETAILS CUSTOMIZATION MODAL SHEET */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-t-xl shadow-[0_-4px_32px_rgba(62,31,26,0.15)] flex flex-col z-10 max-h-[90vh] overflow-y-auto animate-sheet pb-safe">
            <div className="flex justify-center py-4">
              <div className="w-12 h-1.5 bg-outline-variant rounded-full cursor-pointer" onClick={() => setSelectedItem(null)}></div>
            </div>

            <div className="px-gutter mb-md">
              <div className="relative h-56 w-full rounded-lg overflow-hidden border border-outline-variant/30 bg-white">
                <img 
                  className="w-full h-full object-cover" 
                  src={selectedItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'} 
                  alt={selectedItem.name} 
                />
              </div>
            </div>

            <div className="px-gutter mb-lg">
              <div className="flex justify-between items-start mb-xs">
                <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{selectedItem.name}</h1>
                <span className="font-headline-sm text-headline-sm text-primary">₹{Number(selectedItem.price)}</span>
              </div>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                {selectedItem.description}
              </p>
            </div>

            <div className="px-gutter space-y-lg pb-10">
              {/* Dynamic Modifiers */}
              {selectedItem.modifiers && (() => {
                try {
                  const groups: ModifierGroup[] = JSON.parse(selectedItem.modifiers);
                  return groups.map((g) => (
                    <section key={g.name} className="space-y-sm">
                      <div className="flex items-center justify-between">
                        <h2 className="font-label-lg text-label-lg uppercase tracking-widest text-on-surface">{g.name}</h2>
                        {g.required && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase">Required</span>
                        )}
                      </div>
                      <div className="space-y-base">
                        {g.options.map((opt) => {
                          const isSelected = (selectedModifiers[g.name] || []).includes(opt.name);
                          return (
                            <label 
                              key={opt.name}
                              className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer border ${
                                isSelected ? 'bg-primary/5 border-primary' : 'bg-surface-container border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-sm">
                                <input
                                  type={g.maxSelections === 1 ? 'radio' : 'checkbox'}
                                  name={g.name}
                                  checked={isSelected}
                                  onChange={() => handleModifierToggle(g.name, opt.name, g.maxSelections)}
                                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                                />
                                <span className="font-body-md font-bold text-on-surface">{opt.name}</span>
                              </div>
                              {Number(opt.price) > 0 && (
                                <span className="font-label-lg text-primary">+₹{Number(opt.price)}</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  ));
                } catch (e) {
                  return null;
                }
              })()}

              {/* Special instructions */}
              <section className="space-y-sm">
                <h2 className="font-label-lg text-label-lg uppercase tracking-widest text-on-surface">Special Cooking Instructions</h2>
                <textarea
                  className="w-full bg-surface-container border border-outline-variant p-4 rounded-xl font-body-md outline-none text-on-surface focus:border-primary"
                  placeholder="e.g. Make it extra spicy, no onions, etc."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                />
              </section>

              {/* Adjuster and Add Button */}
              <div className="pt-md border-t border-outline-variant/35 flex flex-col gap-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm uppercase text-on-surface-variant">Quantity</span>
                  <div className="flex items-center gap-md bg-surface-container-high px-4 py-2 rounded-full">
                    <button 
                      onClick={() => setItemQuantity(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary active:scale-95 border-none"
                    >
                      -
                    </button>
                    <span className="font-headline-sm text-lg w-4 text-center">{itemQuantity}</span>
                    <button 
                      onClick={() => setItemQuantity(prev => prev + 1)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary active:scale-95 border-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCartClick}
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm uppercase active:scale-95 shadow-md flex justify-center items-center gap-sm border-none"
                >
                  Add to basket
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
