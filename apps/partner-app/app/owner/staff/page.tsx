'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

interface StaffMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  joinedAt?: string;
  department?: string;
  shiftTime?: string;
}

export default function StaffManagementPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilter, setMobileFilter] = useState('All Staff');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 4;

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        if (!user?.restaurantId) return;
        const res: any = await api.get(`/api/v1/staff?restaurantId=${user.restaurantId}`);
        if (res.success && res.data) setStaff(res.data);
      } catch (e) {
        console.error('Failed to load staff:', e);
        // Demo data
        setStaff([
          { id: '1', name: 'Marco Rossi', email: 'm.rossi@bistro.os', phone: '+39 345 678 9012', role: 'Chef de Cuisine', isActive: true, joinedAt: '2023-02-01', department: 'KITCHEN', shiftTime: '10:00 – 22:00' },
          { id: '2', name: 'Elena Vance', email: 'elena.v@bistro.os', phone: '+44 7700 900077', role: 'Manager', isActive: true, joinedAt: '2022-01-15', department: 'FOH', shiftTime: '16:00 – Close' },
          { id: '3', name: 'Julian Chen', email: 'j.chen@bistro.os', phone: '+1 (555) 010-9988', role: 'Sous Chef', isActive: false, joinedAt: '2023-08-01', department: 'KITCHEN' },
          { id: '4', name: 'Maya Thompson', email: 'm.thompson@bistro.os', phone: '+1 (555) 234-5678', role: 'Lead Server', isActive: true, joinedAt: '2024-03-01', department: 'FOH', shiftTime: '18:00 – Close' },
          { id: '5', name: 'James Thorne', email: 'j.thorne@bistro.os', phone: '+1 (555) 876-5432', role: 'Server', isActive: true, department: 'FOH', shiftTime: 'On Break' },
          { id: '6', name: 'Sofia Chen', email: 's.chen@bistro.os', phone: '+1 (555) 111-2222', role: 'Sous Chef', isActive: true, department: 'KITCHEN', shiftTime: '12:00 – 22:00' },
          { id: '7', name: 'Liam Neeson', email: 'l.neeson@bistro.os', phone: '+1 (555) 333-4444', role: 'Lead Bartender', isActive: true, department: 'FOH', shiftTime: '18:00 – Close' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [user]);

  const totalStaff = staff.length;
  const onShift = staff.filter(s => s.isActive && s.shiftTime && !s.shiftTime.includes('Break')).length;
  const avgRating = 4.9;
  const openPositions = 2;

  const filteredMobile = mobileFilter === 'All Staff'
    ? staff
    : mobileFilter === 'Front of House'
      ? staff.filter(s => s.department === 'FOH')
      : staff.filter(s => s.department === 'KITCHEN');

  const paginatedStaff = staff.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(staff.length / perPage);

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
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Staff Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Active Team ({filteredMobile.length} Members)</p>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-sm overflow-x-auto hide-scrollbar">
          {['All Staff', 'Front of House', 'Kitchen'].map((f) => (
            <button
              key={f}
              onClick={() => setMobileFilter(f)}
              className={`flex-shrink-0 px-md py-sm rounded-full font-label-lg text-label-lg transition-all whitespace-nowrap ${
                mobileFilter === f ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Staff Cards */}
        <div className="space-y-md">
          {filteredMobile.map((member) => (
            <div key={member.id} className="bg-surface-container-low rounded-xl p-md umami-shadow flex items-center gap-md border-l-4 border-primary/30">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 relative">
                <span className="material-symbols-outlined text-primary text-2xl">person</span>
                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-surface-container-low ${member.isActive ? 'bg-[#16A34A]' : 'bg-outline-variant'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-sm">
                  <h4 className="font-headline-sm text-body-lg truncate">{member.name}</h4>
                  <span className={`px-sm py-xs rounded-lg font-label-sm text-label-sm uppercase ${
                    member.department === 'KITCHEN' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {member.department}
                  </span>
                </div>
                <p className="font-label-lg text-label-lg text-on-surface-variant">{member.role}</p>
                {member.shiftTime && (
                  <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs mt-xs">
                    <span className="material-symbols-outlined text-xs">{member.shiftTime.includes('Break') ? 'coffee' : 'schedule'}</span>
                    {member.shiftTime.includes('Break') ? <em>{member.shiftTime}</em> : `Shift: ${member.shiftTime}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Staff FAB */}
        <Link href="/owner/staff/add" className="fixed bottom-24 right-margin w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 z-40">
          <span className="material-symbols-outlined text-3xl">add</span>
        </Link>
      </div>

      {/* ═══════════════════════════════ */}
      {/* DESKTOP VIEW                    */}
      {/* ═══════════════════════════════ */}
      <div className="hidden md:block space-y-lg">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display-md text-display-md text-on-surface leading-tight">Staff Management</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Manage your kitchen brigade and front-of-house superstars.</p>
          </div>
          <Link href="/owner/staff/add" className="bg-primary text-on-primary px-lg py-md rounded-full font-label-lg flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined">person_add</span>
            Add Staff Member
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-gutter">
          <div className="bg-surface-container p-md rounded-xl umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Total Staff</p>
            <div className="flex items-end gap-sm mt-sm">
              <span className="font-display-md text-display-md leading-none">{totalStaff.toString().padStart(2, '0')}</span>
              <span className="text-primary font-label-lg flex items-center gap-xs mb-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                12%
              </span>
            </div>
          </div>
          <div className="bg-surface-container p-md rounded-xl umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">On Shift Now</p>
            <div className="flex items-end gap-sm mt-sm">
              <span className="font-display-md text-display-md leading-none">{onShift.toString().padStart(2, '0')}</span>
              <span className="text-primary font-label-sm mb-1">Busy Night</span>
            </div>
          </div>
          <div className="bg-surface-container p-md rounded-xl umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Average Rating</p>
            <div className="flex items-end gap-sm mt-sm">
              <span className="font-display-md text-display-md leading-none">{avgRating}</span>
              <div className="flex mb-1">
                <span className="material-symbols-outlined text-primary text-lg fill-icon">star</span>
                <span className="material-symbols-outlined text-outline-variant text-lg">star</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container p-md rounded-xl umami-shadow">
            <p className="font-label-lg text-label-lg text-on-surface-variant uppercase">Open Positions</p>
            <div className="flex items-end gap-sm mt-sm">
              <span className="font-display-md text-display-md leading-none text-primary">{openPositions.toString().padStart(2, '0')}</span>
              <span className="text-primary font-label-sm mb-1 underline cursor-pointer">Post Job</span>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-surface-container-high rounded-xl overflow-hidden umami-shadow">
          {/* Table Header */}
          <div className="grid grid-cols-4 px-lg py-md bg-surface-container-highest">
            <span className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Name</span>
            <span className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Contact Info</span>
            <span className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Role</span>
            <span className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Status</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-outline-variant/30">
            {paginatedStaff.map((member) => (
              <div key={member.id} className="grid grid-cols-4 px-lg py-md items-center hover:bg-surface-container-low transition-colors">
                {/* Name */}
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                  <div>
                    <p className="font-headline-sm text-body-lg">{member.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {member.joinedAt ? `Joined ${new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <p className="font-body-md text-body-md text-on-surface">{member.email || '-'}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{member.phone || '-'}</p>
                </div>

                {/* Role */}
                <div>
                  <span className="px-md py-xs rounded-full border border-outline-variant font-label-lg text-label-lg text-on-surface-variant whitespace-nowrap">
                    {member.role}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-xs">
                  <span className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-[#16A34A]' : 'bg-outline-variant'}`} />
                  <span className={`font-label-lg text-label-lg uppercase ${member.isActive ? 'text-[#16A34A]' : 'text-on-surface-variant'}`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="px-lg py-md border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-highest">
            <p className="font-label-lg text-label-lg text-on-surface-variant">
              Showing {paginatedStaff.length} of {totalStaff} staff members
            </p>
            <div className="flex gap-sm">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-md py-xs rounded-full border border-outline-variant font-label-lg text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-md py-xs rounded-full border border-primary text-primary font-label-lg hover:bg-primary/10 transition-all disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
