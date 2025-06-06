/**
 * Type declarations for Radix UI libraries that don't have their own TypeScript definitions
 */

declare module '@radix-ui/react-separator' {
  import * as React from 'react';

  export interface SeparatorProps extends React.ComponentPropsWithoutRef<'div'> {
    /**
     * The orientation of the separator.
     * @default "horizontal"
     */
    orientation?: 'horizontal' | 'vertical';
    /**
     * When true, signifies that the separator is purely visual and does not semantically separate content.
     * @default true
     */
    decorative?: boolean;
  }

  export const Root: React.ForwardRefExoticComponent<
    SeparatorProps & React.RefAttributes<HTMLDivElement>
  >;
}
