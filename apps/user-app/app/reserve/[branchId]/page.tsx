'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@foodmart/shared';
import Link from 'next/link';

const TIME_SLOTS = [
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

interface DateChip {
  label: string;
  value: string;
  dayName: string;
  monthName: string;
}

export default function ReserveTablePage() {
  const { branchId } = useParams();
  const router = useRouter();

  const [branchName, setBranchName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateObj, setSelectedDateObj] = useState<DateChip | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableDates, setAvailableDates] = useState<DateChip[]>([]);

  useEffect(() => {
    if (!branchId) return;

    // Fetch branch details
    api.get<any>(`/restaurants`)
      .then((res: any) => {
        if (res.success && res.data) {
          for (const rest of res.data) {
            const branch = rest.branches.find((b: any) => b.id === branchId);
            if (branch) {
              setBranchName(branch.name);
              setRestaurantName(rest.name);
              break;
            }
          }
        }
      })
      .catch(() => {});

    // Generate dates
    const dates: DateChip[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const value = d.toISOString().split('T')[0];
      const label = d.getDate().toString();
      const dayName = i === 0 ? 'Today' : days[d.getDay()];
      const monthName = months[d.getMonth()];
      dates.push({ label, value, dayName, monthName });
    }
    setAvailableDates(dates);
    setSelectedDate(dates[0].value);
    setSelectedDateObj(dates[0]);
    setSelectedTimeSlot(TIME_SLOTS[0]); // default 18:00
  }, [branchId]);

  const handleDateChange = (dateVal: string) => {
    setSelectedDate(dateVal);
    const obj = availableDates.find(d => d.value === dateVal) || null;
    setSelectedDateObj(obj);
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res: any = await api.post('/reservations', {
        branchId,
        partySize,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes,
        email,
        fullName,
        phone
      });

      if (res.success) {
        // Redirect to success route with query inputs including phone
        const dateStr = selectedDateObj ? `${selectedDateObj.dayName}, ${selectedDateObj.monthName} ${selectedDateObj.label}` : selectedDate;
        router.push(`/reserve/success?date=${encodeURIComponent(dateStr)}&time=${encodeURIComponent(selectedTimeSlot)}&guests=${partySize}&branchName=${encodeURIComponent(branchName)}&restaurantName=${encodeURIComponent(restaurantName)}&fullName=${encodeURIComponent(fullName || 'Guest')}&phone=${encodeURIComponent(phone)}&notes=${encodeURIComponent(notes)}&ref=${encodeURIComponent(res.data?.id || 'UM-8821')}`);
      } else {
        setError(res.message || 'Failed to book reservation. Please try another slot.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book reservation. Please try again.');
      setSubmitting(false);
    }
  };

  const formattedDateString = selectedDateObj ? `${selectedDateObj.dayName}, ${selectedDateObj.monthName} ${selectedDateObj.label}` : '';

  return (
    <div className="font-hanken text-on-surface bg-background min-h-screen pb-32">
      
      {/* MOBILE VIEW */}
      <div className="block md:hidden min-h-screen bg-background flex flex-col relative">
        <header className="bg-surface sticky top-0 w-full z-50 flex justify-between items-center px-gutter h-20 shadow-sm">
          <div className="flex items-center gap-base">
            <span onClick={() => router.push(`/restaurant/${branchId}`)} className="material-symbols-outlined text-primary p-2 cursor-pointer active:scale-95">arrow_back</span>
            <h1 className="font-display-md text-headline-lg-mobile text-primary uppercase tracking-tight">foodmood</h1>
          </div>
          <div className="bg-primary text-on-primary font-headline-sm px-4 py-1.5 rounded-full text-xs shadow-sm uppercase">
            RESERVE
          </div>
        </header>

        <main className="px-gutter py-lg space-y-md">
          <div className="mb-md">
            <h2 className="font-display-md text-2xl text-primary leading-none uppercase">Reserve a Table</h2>
            <p className="text-on-surface-variant text-xs mt-1">Book your spot at {restaurantName || 'our kitchen'}</p>
          </div>

          <form onSubmit={handleConfirmReservation} className="space-y-md">
            {error && (
              <div className="bg-error/95 text-white text-xs p-4 rounded-xl font-bold text-center">
                {error}
              </div>
            )}

            {/* Party Size Stepper */}
            <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
              <label className="font-headline-sm text-xs uppercase tracking-wider text-primary">Guests count</label>
              <div className="flex items-center justify-between bg-white p-3 rounded-full border border-outline">
                <button 
                  type="button" 
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-primary border border-outline active:scale-90"
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                >
                  -
                </button>
                <div className="flex flex-col items-center">
                  <span className="font-headline-sm text-lg text-primary">{partySize}</span>
                  <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Persons</span>
                </div>
                <button 
                  type="button" 
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-primary border border-outline active:scale-90"
                  onClick={() => setPartySize(partySize + 1)}
                >
                  +
                </button>
              </div>
            </section>

            {/* Date selection Slider */}
            <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
              <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary">Select Date</h3>
              <div className="flex gap-sm overflow-x-auto no-scrollbar pb-xs">
                {availableDates.map((date) => {
                  const isSelected = selectedDate === date.value;
                  return (
                    <button
                      key={date.value}
                      type="button"
                      onClick={() => handleDateChange(date.value)}
                      className={`flex-shrink-0 w-14 h-20 rounded-full flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-primary text-on-primary font-bold' 
                          : 'bg-white text-on-surface border border-outline-variant'
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider opacity-75">{date.dayName.substring(0, 3)}</span>
                      <span className="font-headline-sm text-base mt-1">{date.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Time Slot Picker */}
            <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-md shadow-sm">
              <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary">Preferred Time</h3>
              <div className="grid grid-cols-3 gap-base">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-3 rounded-full text-center text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-primary text-on-primary border-primary shadow'
                          : 'border-outline-variant text-on-surface bg-white'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Contact details */}
            <section className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 space-y-sm shadow-sm">
              <h3 className="font-headline-sm text-xs uppercase tracking-wider text-primary">Contact Details</h3>
              <div className="space-y-base">
                <input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-outline rounded-full px-5 py-3 font-body-md text-xs outline-none focus:border-primary text-on-surface"
                  placeholder="Full Name"
                  required
                />
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-outline rounded-full px-5 py-3 font-body-md text-xs outline-none focus:border-primary text-on-surface"
                  placeholder="Email Address"
                  type="email"
                  required
                />
                <input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-outline rounded-full px-5 py-3 font-body-md text-xs outline-none focus:border-primary text-on-surface"
                  placeholder="Phone Number"
                  type="tel"
                  required
                />
              </div>
            </section>

            {/* Notes */}
            <section className="space-y-sm">
              <h4 className="font-label-lg text-label-lg uppercase tracking-wider text-primary">Notes / Occasions</h4>
              <textarea
                placeholder="Anniversary, special allergies, preferred window tables, etc."
                className="w-full bg-surface-container border border-outline-variant p-4 rounded-xl font-body-md text-xs outline-none text-on-surface focus:border-primary"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </section>
          </form>
        </main>

        {/* Sticky checkout footer */}
        <div className="fixed bottom-0 left-0 w-full z-50 px-6 py-4 bg-white border-t border-outline-variant/30 max-w-md mx-auto left-1/2 -translate-x-1/2 shadow-lg rounded-t-xl">
          <button 
            onClick={handleConfirmReservation}
            disabled={submitting}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm text-xs uppercase active:scale-95 transition-all flex items-center justify-center gap-2 hover:opacity-90 border-none"
          >
            <span className="material-symbols-outlined text-sm">restaurant_menu</span>
            <span>{submitting ? 'Sending Request...' : 'Send Booking Request'}</span>
          </button>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block min-h-screen bg-surface relative pb-20">
        <header className="bg-surface fixed top-0 w-full z-50 flex justify-between items-center px-margin h-20 shadow-sm">
          <div className="flex items-center gap-8">
            <span onClick={() => router.push('/')} className="font-display-md text-display-md text-primary cursor-pointer">foodmood OS</span>
            <nav className="hidden md:flex gap-6 items-center">
              <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg" href={`/restaurant/${branchId}`}>Restaurant</Link>
              <span className="text-primary border-b-2 border-primary font-bold py-1 font-label-lg text-label-lg">Reserve Table</span>
            </nav>
          </div>
          <div className="flex items-center gap-sm">
            <div className="bg-primary text-on-primary font-headline-sm px-6 py-2 rounded-full uppercase">
              RESERVE
            </div>
          </div>
        </header>

        <main className="max-w-screen-xl mx-auto pt-24 pb-12 px-margin grid grid-cols-12 gap-gutter">
          <div className="col-span-8 space-y-md">
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Reservation details</h3>
            
            <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant/30 space-y-md">
              <form onSubmit={handleConfirmReservation} className="space-y-md">
                
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-sm">
                    <label className="font-bold text-xs uppercase text-on-surface-variant">Guests Party Size</label>
                    <select 
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      className="w-full bg-white border border-outline rounded-full px-5 py-3 outline-none text-sm focus:border-primary"
                    >
                      <option value={1}>1 Person</option>
                      <option value={2}>2 People</option>
                      <option value={3}>3 People</option>
                      <option value={4}>4 People</option>
                      <option value={6}>5-6 People</option>
                      <option value={8}>7-8 People</option>
                    </select>
                  </div>
                  <div className="space-y-sm">
                    <label className="font-bold text-xs uppercase text-on-surface-variant">Time Slot</label>
                    <select 
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full bg-white border border-outline rounded-full px-5 py-3 outline-none text-sm focus:border-primary"
                    >
                      {TIME_SLOTS.map(t => (
                        <option key={t} value={t}>{t} (Dinner)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-md">
                  <div className="space-y-sm">
                    <label className="font-bold text-xs uppercase text-on-surface-variant">Full Name</label>
                    <input 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-outline rounded-full px-5 py-3 outline-none text-sm focus:border-primary"
                      placeholder="Name"
                      required
                    />
                  </div>
                  <div className="space-y-sm">
                    <label className="font-bold text-xs uppercase text-on-surface-variant">Email</label>
                    <input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-outline rounded-full px-5 py-3 outline-none text-sm focus:border-primary"
                      placeholder="Email Address"
                      type="email"
                      required
                    />
                  </div>
                  <div className="space-y-sm">
                    <label className="font-bold text-xs uppercase text-on-surface-variant">Phone Number</label>
                    <input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-outline rounded-full px-5 py-3 outline-none text-sm focus:border-primary"
                      placeholder="Phone"
                      type="tel"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-sm">
                  <label className="font-bold text-xs uppercase text-on-surface-variant">Notes / Requests</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-outline p-4 rounded-xl outline-none text-sm focus:border-primary"
                    placeholder="Allergies, anniversaries, special preferences..."
                    rows={4}
                  />
                </div>
              </form>
            </div>
          </div>

          <aside className="col-span-4 space-y-md h-fit sticky top-24">
            <div className="bg-surface-container-high p-lg rounded-xl border border-outline-variant/30 space-y-lg">
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Summary</h3>
              
              <div className="space-y-sm text-xs font-bold text-on-surface-variant uppercase">
                <div className="flex justify-between">
                  <span>Location</span>
                  <span>{branchName || 'foodmood'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span>{formattedDateString}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slot Time</span>
                  <span>{selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span>Party Size</span>
                  <span>{partySize} Guests</span>
                </div>
              </div>

              <button 
                onClick={handleConfirmReservation}
                disabled={submitting}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm uppercase active:scale-95 shadow-md flex justify-center items-center gap-sm border-none"
              >
                Send Request
                <span className="material-symbols-outlined">restaurant_menu</span>
              </button>
            </div>
          </aside>
        </main>
      </div>

    </div>
  );
}
