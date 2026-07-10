'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@foodmart/shared';
import { useAuth } from '../../../context/AuthContext';

export default function AddStaffPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [branch, setBranch] = useState('Downtown Flagship');
  const [tempPassword, setTempPassword] = useState('UMAMI_X92K');
  const [staffStatus, setStaffStatus] = useState(true);
  const [saving, setSaving] = useState(false);

  const roleOptions = ['Admin', 'Manager', 'Chef', 'Server'];
  const branchOptions = ['Downtown Flagship', 'Manhattan Central', 'Brooklyn Heights'];

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = 'UMAMI_';
    let suffix = '';
    for (let i = 0; i < 4; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    setTempPassword(prefix + suffix);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
  };

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      await api.post('/api/v1/staff', {
        name: fullName,
        email,
        phone,
        role: role.toUpperCase(),
        restaurantId: user?.restaurantId,
        password: tempPassword,
      });
      router.push('/owner/staff');
    } catch (e) {
      console.error('Failed to add staff:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ═══════════════════════════════ */}
      {/* MOBILE VIEW                     */}
      {/* ═══════════════════════════════ */}
      <div className="md:hidden space-y-md">
        {/* Header */}
        <div className="flex items-center gap-sm">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
        </div>

        <div>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Add Staff</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Onboard a new team member to your kitchen or front-of-house operations.</p>
        </div>

        {/* Photo Upload */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-high">
              <span className="material-symbols-outlined text-primary text-4xl">add_a_photo</span>
            </div>
            <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-on-primary-container">edit</span>
            </div>
          </div>
        </div>
        <p className="font-label-lg text-label-lg text-primary text-center uppercase">Upload Profile Picture</p>

        {/* Full Name */}
        <div>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-xs">Full Name</p>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
            placeholder="e.g. Marco Pierre"
          />
        </div>

        {/* Email */}
        <div>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-xs">Email Address</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
            placeholder="marco@littlebite.com"
            type="email"
          />
        </div>

        {/* Role Chips */}
        <div>
          <p className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-sm">Role</p>
          <div className="flex flex-wrap gap-base">
            {roleOptions.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-md py-xs rounded-full font-label-lg text-label-lg transition-all ${
                  role === r ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !fullName.trim()}
          className="w-full bg-primary text-on-primary py-md rounded-full font-label-lg uppercase flex items-center justify-center gap-sm shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save Staff Record'}
          {!saving && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
      </div>

      {/* ═══════════════════════════════ */}
      {/* DESKTOP VIEW                    */}
      {/* ═══════════════════════════════ */}
      <div className="hidden md:block space-y-lg">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-md">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <div>
              <h2 className="font-display-md text-display-md text-on-surface leading-tight">Add Staff Member</h2>
              <p className="font-body-md text-on-surface-variant">Onboard a new culinary professional to your team.</p>
            </div>
          </div>
          <div className="flex gap-md">
            <button onClick={() => router.back()} className="px-lg py-md rounded-full border border-outline-variant text-on-surface-variant font-label-lg hover:bg-surface-container-high transition-all">
              Discard Draft
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !fullName.trim()}
              className="bg-primary text-on-primary px-lg py-md rounded-full font-label-lg flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-40"
            >
              <span className="material-symbols-outlined">person_add</span>
              {saving ? 'Saving...' : 'Add Staff Member'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Left Form */}
          <div className="col-span-7 space-y-lg">
            {/* Personal Info Card */}
            <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
              <div className="flex gap-lg">
                {/* Photo Upload */}
                <div className="flex-shrink-0">
                  <div className="w-40 h-40 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center bg-surface-container-high">
                    <span className="material-symbols-outlined text-primary text-4xl">add_a_photo</span>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">Upload Photo</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant opacity-50">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-md">
                  <div>
                    <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Full Name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                      placeholder="e.g. Julian Rossi"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Email Address</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                        placeholder="julian@um..."
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Phone Number</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary"
                        placeholder="+1 (555) 0..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Branch */}
            <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
              <div className="grid grid-cols-2 gap-lg">
                <div>
                  <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Role Selection</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary appearance-none"
                  >
                    <option value="">Select Role</option>
                    {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Branch Assignment</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-body-lg text-on-surface outline-none focus:border-primary appearance-none"
                  >
                    {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Access & Security */}
            <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-primary">shield</span>
                Access & Security
              </h3>
              <div>
                <label className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest block mb-xs">Temporary Password</label>
                <div className="flex gap-md">
                  <input
                    value={tempPassword}
                    readOnly
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm font-headline-sm text-on-surface outline-none tracking-widest"
                  />
                  <button onClick={copyPassword} className="bg-inverse-surface text-inverse-on-surface px-md py-sm rounded-xl font-label-lg hover:brightness-110 active:scale-95 transition-all">
                    Copy
                  </button>
                  <button onClick={generatePassword} className="border border-outline-variant text-on-surface-variant px-md py-sm rounded-xl font-label-lg flex items-center gap-xs hover:bg-surface-container-high transition-all">
                    <span className="material-symbols-outlined text-xl">sync</span>
                    Generate
                  </button>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">Staff will be prompted to change this password upon their first login.</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-5 space-y-lg">
            {/* Staff Status */}
            <div className="bg-surface-container-low p-lg rounded-xl umami-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm">Staff Status</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Toggle account availability</p>
                </div>
                <div
                  onClick={() => setStaffStatus(!staffStatus)}
                  className={`w-14 h-7 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${staffStatus ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>

            {/* Draft Card Preview */}
            <div className="bg-secondary-container p-lg rounded-xl umami-shadow relative overflow-hidden">
              <span className="absolute top-4 right-4 bg-primary text-on-primary px-sm py-xs rounded-lg font-label-sm text-label-sm uppercase">Draft Card</span>
              <div className="flex items-center justify-center mb-md">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-3xl">person</span>
                </div>
              </div>
              <h4 className="font-display-md text-headline-lg text-on-secondary-container text-center uppercase">{fullName || 'New Member'}</h4>
              <p className="font-body-md text-center text-on-secondary-container/60 mt-xs">Awaiting onboarding...</p>
              <div className="mt-md pt-md border-t border-on-secondary-container/20 space-y-sm">
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-on-secondary-container/60 uppercase">ID Number</span>
                  <span className="font-label-lg text-label-lg text-on-secondary-container">U-000000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-on-secondary-container/60 uppercase">Dept</span>
                  <span className="font-label-lg text-label-lg text-on-secondary-container">FOH / Culinary</span>
                </div>
              </div>
            </div>

            {/* Permissions Tip */}
            <div className="bg-surface-container p-md rounded-xl flex items-start gap-sm">
              <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">info</span>
              <div>
                <p className="font-label-lg text-label-lg text-on-surface">Permissions Tip</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Managers can view payroll; Chefs can only edit menus.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
