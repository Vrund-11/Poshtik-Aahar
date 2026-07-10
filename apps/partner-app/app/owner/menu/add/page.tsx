'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@foodmart/shared';
import { useAuth } from '../../../context/AuthContext';

export default function AddMenuItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dietary, setDietary] = useState('Non-Veg');
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [smallPrice, setSmallPrice] = useState('');
  const [mediumPrice, setMediumPrice] = useState('');
  const [largePrice, setLargePrice] = useState('');
  const [saving, setSaving] = useState(false);

  const categoryOptions = ['Starters', 'Main Course', 'Beverages', 'Desserts', 'Chef Specials'];

  const handleSave = async () => {
    if (!itemName.trim()) return;
    setSaving(true);
    try {
      await api.post('/api/v1/menu/items', {
        name: itemName,
        description,
        category,
        isVeg: dietary === 'Veg',
        spiceLevel,
        price: Number(mediumPrice) || 0,
        restaurantId: user?.restaurantId,
      });
      router.push('/owner/menu');
    } catch (e) {
      console.error('Failed to add item:', e);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = itemName.trim() || description.trim() || category;

  return (
    <>
      {/* ═══════════════════════════════ */}
      {/* MOBILE VIEW                     */}
      {/* ═══════════════════════════════ */}
      <div className="md:hidden space-y-md">
        {/* Back Header */}
        <div className="flex items-center gap-sm">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <h2 className="font-headline-lg text-headline-lg uppercase">Add Item</h2>
        </div>

        {/* Image Upload */}
        <div className="w-full aspect-square max-w-xs mx-auto rounded-full border-2 border-dashed border-outline-variant flex flex-col items-center justify-center bg-surface-container-high relative">
          <span className="material-symbols-outlined text-primary text-5xl">add_a_photo</span>
          <p className="font-label-lg text-label-lg text-primary uppercase mt-sm">Upload Profile Picture</p>
          <div className="absolute bottom-4 right-4 w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-on-primary-container">edit</span>
          </div>
        </div>

        {/* Item Name */}
        <div>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-xs">Item Name</p>
          <input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
            placeholder="e.g. Truffle Risotto"
          />
        </div>

        {/* Description */}
        <div>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-xs">Description</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-md text-on-surface outline-none focus:border-primary resize-none"
            placeholder="A brief description of the dish..."
          />
        </div>

        {/* Category Chips */}
        <div>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-sm">Category</p>
          <div className="flex flex-wrap gap-base">
            {categoryOptions.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-md py-xs rounded-full font-label-lg text-label-lg transition-all ${
                  category === c ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary */}
        <div>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-sm">Dietary</p>
          <div className="flex gap-sm">
            {['Veg', 'Non-Veg'].map((d) => (
              <button
                key={d}
                onClick={() => setDietary(d)}
                className={`flex-1 py-sm rounded-full font-label-lg text-label-lg transition-all ${
                  dietary === d
                    ? (d === 'Veg' ? 'bg-[#16A34A] text-white' : 'bg-error text-on-error')
                    : 'border border-outline-variant text-on-surface-variant'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Spice Level */}
        <div>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-sm">Spice Level</p>
          <div className="flex gap-sm">
            {['Mild', 'Medium', 'Spicy'].map((s) => (
              <button
                key={s}
                onClick={() => setSpiceLevel(s)}
                className={`flex-1 py-sm rounded-full font-label-lg text-label-lg transition-all ${
                  spiceLevel === s ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-sm">Pricing & Sizes</p>
          <div className="space-y-sm">
            {[
              { label: 'Small', val: smallPrice, set: setSmallPrice },
              { label: 'Medium', val: mediumPrice, set: setMediumPrice },
              { label: 'Large', val: largePrice, set: setLargePrice },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-md">
                <span className="font-label-lg text-label-lg text-on-surface-variant w-16">{p.label}</span>
                <input
                  value={p.val}
                  onChange={(e) => p.set(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                  placeholder="₹0.00"
                  type="number"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleSave}
          disabled={saving || !itemName.trim()}
          className="w-full bg-primary text-on-primary py-md rounded-full font-label-lg uppercase flex items-center justify-center gap-sm shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'ADD ITEM'}
          {!saving && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
      </div>

      {/* ═══════════════════════════════ */}
      {/* DESKTOP VIEW                    */}
      {/* ═══════════════════════════════ */}
      <div className="hidden md:block space-y-lg">
        {/* Breadcrumb */}
        <div className="flex items-center gap-sm">
          <button onClick={() => router.back()} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">arrow_back</button>
          <span className="font-label-lg text-label-lg text-on-surface-variant">Menu</span>
          <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
          <span className="font-label-lg text-label-lg text-primary">Add New Item</span>
        </div>

        <h2 className="font-display-md text-display-md text-on-surface uppercase leading-tight">Add New Item</h2>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Left Form */}
          <div className="col-span-8 space-y-lg">
            <div className="bg-surface-container-low p-lg rounded-xl umami-shadow space-y-md">
              {/* Item Name */}
              <div>
                <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Item Name</label>
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-md font-headline-sm text-on-surface outline-none focus:border-primary"
                  placeholder="e.g. Dry-Aged Ribeye (16oz)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-md font-body-md text-on-surface outline-none focus:border-primary resize-none"
                  placeholder="28-day aged, bone-in, finished with house-infused herb butter..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-md font-body-lg text-on-surface outline-none focus:border-primary appearance-none"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Dietary Toggle */}
              <div>
                <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-sm">Dietary Preference</label>
                <div className="flex rounded-full overflow-hidden border border-outline-variant w-64">
                  {['Veg', 'Non-Veg'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDietary(d)}
                      className={`flex-1 py-sm font-label-lg text-label-lg transition-all ${
                        dietary === d ? (d === 'Veg' ? 'bg-[#16A34A] text-white' : 'bg-error text-on-error') : 'bg-transparent text-on-surface-variant'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Portions & Pricing */}
            <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
              <h3 className="font-headline-sm text-headline-sm mb-md uppercase">Portions & Pricing</h3>
              <div className="grid grid-cols-3 gap-md">
                {[
                  { label: 'Small', val: smallPrice, set: setSmallPrice },
                  { label: 'Medium', val: mediumPrice, set: setMediumPrice },
                  { label: 'Large', val: largePrice, set: setLargePrice },
                ].map((p) => (
                  <div key={p.label}>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">{p.label}</label>
                    <input
                      value={p.val}
                      onChange={(e) => p.set(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-md font-headline-sm text-on-surface outline-none focus:border-primary"
                      placeholder="₹0.00"
                      type="number"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-lg">
            {/* Image Upload */}
            <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
              <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-md">Item Image</h3>
              <div className="w-full aspect-square rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-primary text-5xl">add_photo_alternate</span>
                <p className="font-label-sm text-on-surface-variant mt-sm">Drop image or click to upload</p>
                <p className="font-label-sm text-on-surface-variant opacity-50 mt-xs">JPG, PNG up to 5MB</p>
              </div>
            </div>

            {/* Spice Level */}
            <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
              <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-md">Spice Level</h3>
              <div className="space-y-sm">
                {['Mild', 'Medium', 'Spicy'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpiceLevel(s)}
                    className={`w-full p-sm rounded-xl font-label-lg text-label-lg text-left flex items-center gap-sm transition-all ${
                      spiceLevel === s ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{s === 'Mild' ? 'local_florist' : s === 'Medium' ? 'local_fire_department' : 'whatshot'}</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-surface-container p-md rounded-xl flex justify-between items-center umami-shadow mt-lg sticky bottom-8">
          <div className="flex items-center gap-sm">
            {hasChanges && (
              <span className="w-3 h-3 bg-primary-container rounded-full"></span>
            )}
            <span className="font-label-lg text-label-lg text-on-surface-variant">{hasChanges ? 'Unsaved changes' : 'No changes'}</span>
          </div>
          <div className="flex gap-md">
            <button onClick={() => router.back()} className="px-lg py-sm rounded-full font-label-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !itemName.trim()}
              className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-lg flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-40"
            >
              <span className="material-symbols-outlined">save</span>
              {saving ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
