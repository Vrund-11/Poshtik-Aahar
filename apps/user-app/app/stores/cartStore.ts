import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────
export interface CartItem {
  id: string;           // menuItemId + serialized modifiers
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedModifiers: any[];
  notes?: string;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  gstPercent: number;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'id'>, restaurantId: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setGstPercent: (percent: number) => void;
}

// ─── Store ────────────────────────────────────
export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      gstPercent: 5.0,

      addItem: (newItem, targetRestaurantId) => {
        const { items, restaurantId } = get();
        let currentItems = [...items];

        // Cross-restaurant guard
        if (restaurantId && restaurantId !== targetRestaurantId) {
          if (typeof window !== 'undefined' && !window.confirm(
            'You have items from another restaurant in your cart. Clear cart and add this item?'
          )) {
            return;
          }
          currentItems = [];
        }

        // Generate unique ID from menuItemId + modifiers
        const modifiersStr = JSON.stringify(newItem.selectedModifiers || []);
        const uniqueId = `${newItem.menuItemId}-${modifiersStr}`;

        const existingIndex = currentItems.findIndex((item) => item.id === uniqueId);
        if (existingIndex > -1) {
          currentItems[existingIndex] = {
            ...currentItems[existingIndex],
            quantity: currentItems[existingIndex].quantity + newItem.quantity,
          };
        } else {
          currentItems.push({ ...newItem, id: uniqueId });
        }

        set({ items: currentItems, restaurantId: targetRestaurantId });
      },

      removeItem: (id) => {
        const updated = get().items.filter((item) => item.id !== id);
        set({
          items: updated,
          restaurantId: updated.length === 0 ? null : get().restaurantId,
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [], restaurantId: null }),

      setGstPercent: (percent) => set({ gstPercent: percent }),
    }),
    {
      name: 'foodmood_cart',       // localStorage key
      partialize: (state) => ({    // only persist data, not actions
        items: state.items,
        restaurantId: state.restaurantId,
        gstPercent: state.gstPercent,
      }),
    }
  )
);

// ─── Derived Selectors (use in components with useMemo) ───
export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartTax = (state: CartState) =>
  Math.round((selectCartSubtotal(state) * state.gstPercent) / 100 * 100) / 100;

export const selectCartTotal = (state: CartState) =>
  Math.round((selectCartSubtotal(state) + selectCartTax(state)) * 100) / 100;
