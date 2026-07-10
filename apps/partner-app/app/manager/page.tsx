'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@foodmart/shared';
import { useAuthStore } from '../stores/authStore';
import { useTables } from '../hooks/useTables';

interface Table {
  id: string;
  floorId: string;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'SEATED' | 'ORDER_PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'BILL_REQUESTED' | 'PAYMENT_PENDING' | 'COMPLETED';
  qrCode: string;
}

interface Floor {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: OrderItem[];
}

interface SessionDetails {
  id: string;
  verifyCode: string;
  status: string;
  customer?: {
    name: string;
    phone: string;
  };
  orders: Order[];
}

interface VerificationRequest {
  id: string;
  tableNumber: number;
  verifyCode: string;
  timeAgo: string;
  sessionId: string;
}

export default function ManagerFloorPlan() {
  const user = useAuthStore((s) => s.user);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [loading, setLoading] = useState(true);

  // Query tables layout
  const { data: rawTables = [], refetch: fetchTablesLayout } = useTables(selectedFloor?.id || null);
  const tables = rawTables as Table[];

  // Table Drawer state
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // QR Verification Requests state (saves for 15 mins)
  const [verifications, setVerifications] = useState<VerificationRequest[]>([
    { id: 'v1', tableNumber: 2, verifyCode: '78', timeAgo: '2m ago', sessionId: 'mock-s1' },
    { id: 'v2', tableNumber: 6, verifyCode: '33', timeAgo: '5m ago', sessionId: 'mock-s2' },
  ]);

  const fetchBranches = async () => {
    try {
      const res: any = await api.get('/owner/branches');
      if (res.success && res.data) {
        setBranches(res.data);
        if (res.data.length > 0) {
          setSelectedBranch(res.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFloorsAndTables = async () => {
    if (!selectedBranch) return;
    try {
      const res: any = await api.get(`/owner/branches/${selectedBranch.id}/floors`);
      if (res.success && res.data) {
        setFloors(res.data);
        if (res.data.length > 0) {
          setSelectedFloor(res.data[0]);
        } else {
          setSelectedFloor(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBranches().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFloorsAndTables();
  }, [selectedBranch]);

  // Fetch session details when active table changes
  useEffect(() => {
    if (!activeTable) {
      setSessionDetails(null);
      return;
    }

    const fetchSession = async () => {
      setLoadingSession(true);
      try {
        const sessRes: any = await api.get(`/api/v1/sessions/initiate?tableId=${activeTable.id}`);
        if (sessRes.success && sessRes.data) {
          const detailsRes: any = await api.get(`/api/v1/sessions/${sessRes.data.id}`);
          if (detailsRes.success && detailsRes.data) {
            setSessionDetails(detailsRes.data);
          }
        }
      } catch (e) {
        console.error('No active session for table:', e);
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSession();
  }, [activeTable]);

  const handleTableClick = (table: Table) => {
    setActiveTable(table);
  };

  const handleConfirmPayment = async (tableId: string) => {
    setSubmitting(true);
    try {
      const sessRes: any = await api.get(`/api/v1/sessions/initiate?tableId=${tableId}`);
      if (sessRes.success && sessRes.data && sessRes.data.id) {
        const res: any = await api.post(`/api/v1/sessions/${sessRes.data.id}/confirm-payment`);
        if (res.success) {
          setActiveTable(null);
          fetchTablesLayout();
        }
      } else {
        await handleResetTable(tableId);
      }
    } catch (e) {
      console.error(e);
      await handleResetTable(tableId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetTable = async (tableId: string) => {
    setSubmitting(true);
    try {
      const res: any = await api.patch(`/api/v1/owner/tables/${tableId}`, {
        status: 'AVAILABLE',
      });
      if (res.success) {
        setActiveTable(null);
        fetchTablesLayout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyQR = async (req: VerificationRequest) => {
    setSubmitting(true);
    try {
      if (req.sessionId.startsWith('mock')) {
        // Mock verify behavior
        setVerifications(verifications.filter((v) => v.id !== req.id));
        // Find if we have table matching in layout and update status
        const tbl = tables.find((t) => t.number === req.tableNumber);
        if (tbl) {
          await api.patch(`/api/v1/owner/tables/${tbl.id}`, { status: 'SEATED' });
          fetchTablesLayout();
        }
      } else {
        const res: any = await api.post('/api/v1/sessions/verify', {
          sessionId: req.sessionId,
          verifyCode: req.verifyCode,
        });
        if (res.success) {
          setVerifications(verifications.filter((v) => v.id !== req.id));
          fetchTablesLayout();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBorder = (status: Table['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'border-[#4CAF50]';
      case 'SEATED': return 'border-[#2196F3]';
      case 'BILL_REQUESTED': return 'border-[#F44336] animate-pulse';
      case 'PREPARING': return 'border-[#FF9800]';
      default: return 'border-outline-variant';
    }
  };

  const getStatusBadge = (status: Table['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-[#4CAF50]/10 text-[#4CAF50]';
      case 'SEATED': return 'bg-[#2196F3]/10 text-[#2196F3]';
      case 'BILL_REQUESTED': return 'bg-[#F44336]/10 text-[#F44336]';
      case 'PREPARING': return 'bg-[#FF9800]/10 text-[#FF9800]';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  if (loading) {
    return <div className="space-y-md animate-pulse"><div className="h-8 bg-surface-container rounded-lg w-48" /><div className="h-64 bg-surface-container rounded-xl" /></div>;
  }

  // Calculate stats
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;
  const seatedCount = tables.filter((t) => t.status === 'SEATED').length;
  const billCount = tables.filter((t) => t.status === 'BILL_REQUESTED').length;
  const otherCount = tables.length - availableCount - seatedCount - billCount;

  return (
    <div className="space-y-lg">
      {/* Header operations */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h2 className="font-display-md text-display-md text-on-surface leading-tight uppercase">Floor Management</h2>
          <p className="font-body-md text-on-surface-variant">Real-time floor map occupancy tracking and QR code dispatch.</p>
        </div>

        <div className="flex items-center gap-md flex-wrap">
          {/* Branch Select */}
          {branches.length > 0 && (
            <select
              value={selectedBranch?.id || ''}
              onChange={(e) => {
                const b = branches.find((x) => x.id === e.target.value);
                if (b) setSelectedBranch(b);
              }}
              className="bg-surface-container-low border border-outline-variant rounded-full px-md py-sm font-label-lg text-on-surface outline-none focus:border-primary cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}

          {/* Floor Switcher */}
          {floors.length > 0 && (
            <div className="flex bg-surface-container p-xs rounded-full gap-xs">
              {floors.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFloor(f)}
                  className={`px-md py-sm rounded-full font-label-lg text-label-lg transition-all ${
                    selectedFloor?.id === f.id
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid View and QR sidebar split */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Floor Map (Left Col) */}
        <div className="col-span-12 lg:col-span-9 space-y-md">
          {/* Legend row */}
          <div className="flex flex-wrap gap-sm items-center">
            <span className="flex items-center gap-xs bg-surface-container px-md py-xs rounded-full font-label-sm text-label-sm text-on-surface-variant">
              <span className="w-3.5 h-3.5 rounded-full bg-[#4CAF50]" /> AVAILABLE ({availableCount})
            </span>
            <span className="flex items-center gap-xs bg-surface-container px-md py-xs rounded-full font-label-sm text-label-sm text-on-surface-variant">
              <span className="w-3.5 h-3.5 rounded-full bg-[#2196F3]" /> SEATED ({seatedCount})
            </span>
            <span className="flex items-center gap-xs bg-surface-container px-md py-xs rounded-full font-label-sm text-label-sm text-on-surface-variant">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F44336]" /> BILL REQUESTED ({billCount})
            </span>
            <span className="flex items-center gap-xs bg-surface-container px-md py-xs rounded-full font-label-sm text-label-sm text-on-surface-variant">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF9800]" /> ACTIVE RUNNING ({otherCount})
            </span>
          </div>

          {selectedFloor ? (
            <div className="bg-surface-container-low p-lg rounded-xl min-h-[450px] border border-outline-variant/30 umami-shadow">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-md">
                {tables.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleTableClick(t)}
                    className={`bg-surface p-md rounded-xl border-l-[6px] ${getStatusBorder(t.status)} flex flex-col justify-between h-40 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-98 transition-all relative overflow-hidden`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-display-md text-headline-sm text-secondary">T-{t.number.toString().padStart(2, '0')}</h3>
                      <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm uppercase ${getStatusBadge(t.status)}`}>
                        {t.status === 'AVAILABLE' ? 'Ready' : t.status === 'BILL_REQUESTED' ? 'Bill' : t.status.toLowerCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-body-md text-label-sm text-on-surface-variant">{t.capacity} Guests Max</p>
                    </div>
                    {t.status === 'BILL_REQUESTED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmPayment(t.id);
                        }}
                        className="w-full bg-[#F44336] text-white py-1.5 rounded-lg font-label-sm text-label-sm uppercase shadow-sm hover:brightness-110 active:scale-95 mt-sm"
                      >
                        Close Table
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-surface-container p-xl rounded-xl text-center text-on-surface-variant">
              No floors/tables configured for this branch.
            </div>
          )}
        </div>

        {/* QR Verification & Alerts sidebar (Right Col) */}
        <div className="col-span-12 lg:col-span-3 space-y-md">
          <div className="bg-surface-container p-md rounded-xl border border-outline-variant/30 umami-shadow">
            <h3 className="font-headline-sm text-headline-sm flex items-center gap-xs text-primary mb-sm uppercase">
              <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
              QR Verification
            </h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-md">
              Awaiting manager passcode confirmation. Requests automatically clean up after 15 mins.
            </p>

            <div className="space-y-md">
              {verifications.length === 0 ? (
                <div className="text-center py-md font-label-lg text-on-surface-variant/40">
                  No pending QR verification codes
                </div>
              ) : (
                verifications.map((req) => (
                  <div key={req.id} className="bg-surface p-md rounded-xl border border-outline-variant shadow-sm space-y-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-headline-sm text-body-lg text-secondary">Table T-{req.tableNumber.toString().padStart(2, '0')}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{req.timeAgo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-label-sm text-on-surface-variant block uppercase tracking-wider">VERIFY CODE</span>
                        <span className="font-display-md text-headline-lg text-primary tracking-widest">{req.verifyCode}</span>
                      </div>
                      <button
                        onClick={() => handleVerifyQR(req)}
                        disabled={submitting}
                        className="bg-primary text-on-primary px-md py-sm rounded-full font-label-lg uppercase hover:brightness-110 active:scale-95 transition-all"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-[#5C3D2E] text-white p-md rounded-xl border border-outline-variant/10 shadow-sm space-y-sm">
            <h4 className="font-headline-sm text-body-lg uppercase tracking-wider">Live Occupancy</h4>
            <div className="grid grid-cols-2 gap-sm">
              <div>
                <p className="font-label-sm text-white/60">ACTIVE TABLES</p>
                <p className="font-display-md text-headline-lg text-[#FFDBCB]">
                  {tables.filter((t) => t.status !== 'AVAILABLE').length}/{tables.length}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-white/60">UTILIZATION</p>
                <p className="font-display-md text-headline-lg text-[#FFDBCB]">
                  {tables.length ? Math.round((tables.filter((t) => t.status !== 'AVAILABLE').length / tables.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Side Detail Drawer */}
      {activeTable && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md border-l border-outline-variant p-lg space-y-lg h-full flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="space-y-lg">
              <div className="flex justify-between items-center border-b border-outline-variant pb-md">
                <div>
                  <h4 className="font-display-md text-headline-lg text-secondary">Table T-{activeTable.number.toString().padStart(2, '0')}</h4>
                  <span className={`px-sm py-xs rounded font-label-sm text-label-sm uppercase mt-sm inline-block ${getStatusBadge(activeTable.status)}`}>
                    Status: {activeTable.status.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTable(null)}
                  className="p-sm bg-surface-container hover:bg-surface-container-high rounded-full transition-all"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {loadingSession ? (
                <div className="py-xl text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : sessionDetails ? (
                <div className="space-y-lg font-hanken text-sm">
                  {/* Guest Profile */}
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-2xl">person</span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-body-lg text-secondary">{sessionDetails.customer?.name || 'Walk-in Guest'}</p>
                      <p className="font-label-sm text-on-surface-variant">Verify Code: {sessionDetails.verifyCode}</p>
                    </div>
                  </div>

                  {/* Active Orders List */}
                  {sessionDetails.orders && sessionDetails.orders.length > 0 ? (
                    <div className="space-y-sm">
                      <h4 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest">Current Order</h4>
                      <div className="bg-surface-container rounded-xl p-md space-y-md divide-y divide-outline-variant/30">
                        {sessionDetails.orders.map((o) => (
                          <div key={o.id} className="pt-sm first:pt-0 space-y-xs">
                            <p className="font-label-sm text-on-surface-variant">Order ID: #{o.id.slice(-6).toUpperCase()}</p>
                            {o.items.map((item) => (
                              <div key={item.id} className="flex justify-between font-body-md text-sm text-on-surface">
                                <span>{item.quantity}x {item.name}</span>
                                <span>₹{Number(item.totalPrice)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center font-headline-sm text-body-lg pt-xs text-secondary">
                              <span>Subtotal</span>
                              <span>₹{Number(o.totalAmount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-container rounded-xl p-md text-center text-on-surface-variant">
                      No active orders placed yet.
                    </div>
                  )}

                  {/* General Configs info */}
                  <div className="bg-surface-container p-md rounded-xl space-y-sm">
                    <div className="flex justify-between text-label-sm">
                      <span className="text-on-surface-variant">Capacity</span>
                      <span className="font-bold text-on-surface">{activeTable.capacity} Seats</span>
                    </div>
                    <div className="flex justify-between text-label-sm">
                      <span className="text-on-surface-variant">QR Endpoint</span>
                      <span className="font-mono text-on-surface">{activeTable.qrCode.slice(0, 12)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-lg text-center text-on-surface-variant">
                  No active session linked to this table.
                </div>
              )}
            </div>

            <div className="pt-md border-t border-outline-variant flex flex-col gap-sm">
              {activeTable.status === 'BILL_REQUESTED' && (
                <button
                  onClick={() => handleConfirmPayment(activeTable.id)}
                  disabled={submitting}
                  className="w-full py-md bg-primary text-on-primary rounded-full font-label-lg uppercase hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  Confirm Payment & Open Table
                </button>
              )}

              {activeTable.status !== 'AVAILABLE' && (
                <button
                  onClick={() => handleResetTable(activeTable.id)}
                  disabled={submitting}
                  className="w-full py-md border border-outline-variant text-on-surface-variant rounded-full font-label-lg uppercase hover:bg-surface-container-high transition-all"
                >
                  Reset Table to Available
                </button>
              )}

              <button
                onClick={() => setActiveTable(null)}
                className="w-full py-md text-on-surface-variant font-label-lg uppercase text-center"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
