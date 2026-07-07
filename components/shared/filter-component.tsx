"use client";

import Image from "next/image";
import {
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { useDebounce } from "use-debounce";

type FilterState = Readonly<{ query: string }>;

type FilterAction =
  | Readonly<{ type: "SET_QUERY"; value: string }>
  | Readonly<{ type: "RESET" }>;

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_QUERY":
      return { query: action.value };
    case "RESET":
      return { query: "" };
    default:
      return state;
  }
}

export type FilterComponentProps = Readonly<{
  placeholder?: string;
  debounceMs?: number;
  onDebouncedChange: (query: string) => void;
  children?: ReactNode;
  inputId?: string;
  className?: string;
  inputClassName?: string;
  fullWidth?: boolean;
}>;

export function FilterComponent({
  placeholder = "Cari...",
  debounceMs = 300,
  onDebouncedChange,
  children,
  inputId = "filter-query",
  className,
  inputClassName,
  fullWidth = false,
}: FilterComponentProps) {
  const [state, dispatch] = useReducer(filterReducer, { query: "" });
  const [debouncedQuery] = useDebounce(state.query, debounceMs);

  useEffect(() => {
    onDebouncedChange(debouncedQuery);
  }, [debouncedQuery, onDebouncedChange]);

  return (
    <div className={className}>
      {children}
      <label
        className={`relative block min-w-0 flex-1 ${
          fullWidth ? "w-full" : "lg:w-[319px] lg:flex-none"
        }`}
      >
        <span className="sr-only">{placeholder}</span>
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
          <Image
            src="/icons/ic-search.svg"
            alt=""
            width={18}
            height={18}
            className="text-[#565d6d]"
            aria-hidden
          />
        </span>
        <input
          id={inputId}
          type="search"
          value={state.query}
          onChange={(event) =>
            dispatch({ type: "SET_QUERY", value: event.target.value })
          }
          placeholder={placeholder}
          className={
            inputClassName ??
            "relative h-11 w-full rounded-[10px] border-0 bg-[#FAFAFB] pl-10 pr-4 text-sm text-[#171a1f] placeholder:text-[#565d6d] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#b1b1b1] lg:h-[39px] lg:rounded-md lg:border lg:border-[#dee1e6] lg:bg-white"
          }
        />
      </label>
    </div>
  );
}

export { filterReducer, type FilterAction, type FilterState };
