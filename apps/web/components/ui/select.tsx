'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Radix disallows an empty-string item value, but several forms use
// <option value=""> as a real "None"/placeholder choice. Map "" to a sentinel
// internally and convert back at the boundary.
const EMPTY = '__empty__';
const toRadix = (v: string) => (v === '' ? EMPTY : v);
const fromRadix = (v: string) => (v === EMPTY ? '' : v);

interface Opt {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

function extractOptions(children: React.ReactNode): Opt[] {
  const opts: Opt[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      const props = child.props as {
        value?: string | number;
        children?: React.ReactNode;
        disabled?: boolean;
      };
      opts.push({
        value: String(props.value ?? ''),
        label: props.children,
        disabled: props.disabled,
      });
    }
  });
  return opts;
}

interface SelectProps {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Drop-in replacement for a native <select> that keeps the same call-site API
 * (`value`, `onChange` with `e.target.value`, and `<option>` children) but
 * renders a fully theme-controlled Radix popup so options stay readable in
 * both light and dark mode.
 */
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ value, onChange, children, className, disabled, required }, ref) => {
    const options = extractOptions(children);

    return (
      <SelectPrimitive.Root
        value={toRadix(value ?? '')}
        onValueChange={(v) => onChange?.({ target: { value: fromRadix(v) } })}
        disabled={disabled}
        required={required}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon>
            <ChevronDown className="size-4 opacity-60" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="relative z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border bg-[var(--color-popover)] text-[var(--color-popover-foreground)] shadow-md"
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((o) => (
                <SelectPrimitive.Item
                  key={o.value}
                  value={toRadix(o.value)}
                  disabled={o.disabled}
                  className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-3 pr-8 text-sm outline-none data-[highlighted]:bg-[var(--color-accent)] data-[highlighted]:text-[var(--color-accent-foreground)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                  <span className="absolute right-2 flex items-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="size-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  },
);
Select.displayName = 'Select';

export { Select };
