'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuth } from '../../context/AuthContext';

export default function BusinessSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Tax Config
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxName, setTaxName] = useState('GST (Goods & Services Tax)');
  const [taxPercentage, setTaxPercentage] = useState('18');
  const [serviceCharge, setServiceCharge] = useState('10');
  const [taxMode, setTaxMode] = useState('Inclusive Pricing');

  // Loyalty
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [pointRate, setPointRate] = useState(10);

  // Upsell
  const [upsellEnabled, setUpsellEnabled] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!user?.restaurantId) return;
        const res: any = await api.get(`/api/v1/restaurants/${user.restaurantId}/settings`);
        if (res.success && res.data) {
          if (res.data.taxPercentage) setTaxPercentage(String(res.data.taxPercentage));
          if (res.data.loyaltyPointsPerRupee) setPointRate(res.data.loyaltyPointsPerRupee);
        }
      } catch (e) {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/v1/restaurants/${user?.restaurantId}/settings`, {
        taxPercentage: Number(taxPercentage),
        loyaltyPointsPerRupee: pointRate,
      });
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setSaving(false);
    }
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
        <div>
          <p className="font-label-lg text-label-lg text-primary uppercase tracking-widest mb-xs">System Configuration</p>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Business Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Fine-tune your restaurant&apos;s engine. Manage fiscal requirements, loyalty programs, and automated upselling logic.
          </p>
        </div>

        {/* Tax Configuration */}
        <div className="bg-surface-container-low rounded-xl p-md umami-shadow">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-headline-sm text-headline-sm uppercase">Tax Configuration</h3>
            <div className="flex items-center gap-xs">
              <div
                onClick={() => setTaxEnabled(!taxEnabled)}
                className={`w-12 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${taxEnabled ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'}`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mb-md">Manage VAT, GST, and local hospitality surcharges.</p>

          <div className="space-y-md">
            <div>
              <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Standard Rate (%)</label>
              <div className="flex items-center gap-xs">
                <input
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                  type="number"
                />
                <span className="font-label-lg text-on-surface-variant">%</span>
              </div>
            </div>
            <div>
              <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Service Charge (%)</label>
              <div className="flex items-center gap-xs">
                <input
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                  type="number"
                />
                <span className="font-label-lg text-on-surface-variant">%</span>
              </div>
            </div>
            <div className="flex gap-sm">
              {['Inclusive Pricing', 'Tax on Service'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTaxMode(mode)}
                  className={`flex-1 py-sm rounded-full font-label-lg text-label-lg transition-all ${
                    taxMode === mode ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loyalty & Rewards */}
        <div className="bg-surface-container-low rounded-xl p-md umami-shadow">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-headline-sm text-headline-sm uppercase">Loyalty & Rewards</h3>
            <div
              onClick={() => setLoyaltyEnabled(!loyaltyEnabled)}
              className={`w-12 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${loyaltyEnabled ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'}`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </div>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mb-md">Retention logic and point multiplication service.</p>

          <div className="bg-surface-container rounded-xl p-md flex items-center gap-md">
            <span className="material-symbols-outlined text-primary fill-icon">star</span>
            <div>
              <p className="font-headline-sm text-body-lg">Umami Tier Points</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">2x multiplier on weekend dinner service</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant ml-auto">chevron_right</span>
          </div>

          <div className="flex gap-sm mt-md">
            <button className="flex-1 py-sm rounded-full border border-outline-variant font-label-lg text-on-surface-variant">Edit Tiers</button>
            <button className="flex-1 py-sm rounded-full bg-primary text-on-primary font-label-lg">Live Analytics</button>
          </div>
        </div>

        {/* Upsell Engine */}
        <div className="bg-surface-container-low rounded-xl p-md umami-shadow">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-headline-sm text-headline-sm uppercase">Upsell Engine</h3>
            <div
              onClick={() => setUpsellEnabled(!upsellEnabled)}
              className={`w-12 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${upsellEnabled ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'}`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </div>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mb-md">AI-driven cross-selling for high-margin items.</p>

          <div className="bg-surface-container-high rounded-xl overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-primary text-5xl">auto_awesome</span>
              <p className="font-label-lg text-label-lg text-on-surface-variant mt-sm">Currently promoting: Signature Yuzu Cheesecake</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-sm mt-md">
            <div className="bg-secondary-container rounded-xl p-md text-center">
              <p className="font-headline-sm text-primary">+24%</p>
              <p className="font-label-sm text-label-sm text-on-secondary-container uppercase">Avg. Order Value</p>
            </div>
            <div className="bg-secondary-container rounded-xl p-md text-center">
              <p className="font-headline-sm text-primary">8.2k</p>
              <p className="font-label-sm text-label-sm text-on-secondary-container uppercase">Monthly Upsells</p>
            </div>
          </div>
        </div>

        {/* Data & Security */}
        <div className="pt-md border-t border-outline-variant space-y-md">
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Data Integrity & Security</p>
          <button className="w-full py-sm rounded-full border-2 border-error text-error font-label-lg uppercase">Reset Business Profile</button>
          <p className="font-label-sm text-label-sm text-on-surface-variant text-center">Last modified by Chef Adrian on Oct 24, 2023</p>
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
        {/* Title */}
        <div>
          <p className="font-label-lg text-label-lg text-primary uppercase tracking-widest mb-xs">Administrative</p>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight">Business Settings</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
            Configure your restaurant&apos;s financial rules, loyalty mechanics, and intelligent upselling logic to maximize per-table revenue.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Tax Configuration */}
          <div className="col-span-7">
            <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm">Tax Configuration</h3>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="font-label-lg text-label-lg text-on-surface-variant">Enable Taxes</span>
                  <div
                    onClick={() => setTaxEnabled(!taxEnabled)}
                    className={`w-12 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${taxEnabled ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md mb-md">
                <div>
                  <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Tax Registration Name</label>
                  <input
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Tax Percentage (%)</label>
                  <div className="flex items-center gap-xs">
                    <input
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(e.target.value)}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                      type="number"
                    />
                    <span className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-label-lg text-on-surface-variant">%</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container rounded-xl p-md flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">info</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Standard GST rates apply to all beverage and food categories by default unless specified in individual menu items.
                </p>
              </div>
            </div>
          </div>

          {/* Loyalty Program */}
          <div className="col-span-5">
            <div className="bg-inverse-surface text-inverse-on-surface p-lg rounded-xl umami-shadow h-full">
              <div className="flex items-center gap-sm mb-lg">
                <span className="material-symbols-outlined text-inverse-primary fill-icon">star</span>
                <h3 className="font-headline-sm text-headline-sm">Loyalty Program</h3>
              </div>

              <p className="font-label-lg text-label-lg text-inverse-on-surface/60 uppercase tracking-widest mb-base">Point Earn Rate</p>
              <div className="flex items-baseline gap-sm mb-md">
                <span className="font-display-md text-display-md text-inverse-primary">{pointRate}</span>
                <span className="font-body-md text-inverse-on-surface/60">pts / ₹1 spent</span>
              </div>

              {/* Slider */}
              <div className="mb-md">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={pointRate}
                  onChange={(e) => setPointRate(Number(e.target.value))}
                  className="w-full appearance-none h-2 rounded-full bg-inverse-on-surface/20 outline-none accent-primary"
                />
                <div className="flex justify-between mt-xs">
                  <span className="font-label-sm text-label-sm text-inverse-on-surface/40">Standard</span>
                  <span className="font-label-sm text-label-sm text-inverse-on-surface/40">VIP Elite</span>
                </div>
              </div>

              <button className="w-full mt-md py-md rounded-full border border-inverse-on-surface/30 text-inverse-on-surface font-label-lg hover:bg-inverse-on-surface/10 transition-all">
                Customize Tier Rewards
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards Row */}
        <div className="grid grid-cols-3 gap-gutter">
          <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
            <span className="material-symbols-outlined text-primary text-3xl mb-md">auto_awesome</span>
            <h4 className="font-headline-sm text-headline-sm mb-xs">Smart Upsell</h4>
            <p className="font-body-md text-on-surface-variant">AI-driven side recommendations based on order history.</p>
          </div>
          <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
            <span className="material-symbols-outlined text-primary text-3xl mb-md">wine_bar</span>
            <h4 className="font-headline-sm text-headline-sm mb-xs">Pairing Engine</h4>
            <p className="font-body-md text-on-surface-variant">Suggested wine & beverage pairings for main courses.</p>
          </div>
          <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
            <span className="material-symbols-outlined text-primary text-3xl mb-md">timer</span>
            <h4 className="font-headline-sm text-headline-sm mb-xs">Happy Hour Rules</h4>
            <p className="font-body-md text-on-surface-variant">Dynamic pricing prompts during low-traffic hours.</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-on-primary px-lg py-md rounded-full font-label-lg flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined">save</span>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </>
  );
}
