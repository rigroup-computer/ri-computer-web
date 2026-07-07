import { create } from "zustand";

/**
 * Marketplace filter store — will adopt {@link FilterComponent} when /marketplace is re-enabled.
 */
type MarketplaceFilterStore = {
  query: string;
  setQuery: (value: string) => void;
};

export const useMarketplaceFilter = create<MarketplaceFilterStore>((set) => ({
  query: "",
  setQuery: (value) => set({ query: value }),
}));
