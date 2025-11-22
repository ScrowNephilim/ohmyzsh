// Quick local shims to silence missing type declarations in the editor
declare module 'react';
declare module 'react/jsx-runtime';
declare module 'react-router-dom';
declare module 'lucide-react';
declare module '@devvai/devv-code-backend';

declare namespace NodeJS {
  // Minimal Timeout definition for environments missing @types/node
  interface Timeout {}
}

// Minimal React namespace pieces to avoid 'Cannot find namespace React' errors
declare namespace React {
  type CSSProperties = { [key: string]: any };
  type ReactNode = any;
  interface Attributes { }
}

declare namespace JSX {
  interface IntrinsicAttributes { [name: string]: any }
  interface IntrinsicElements { [elemName: string]: any }
}

// Allow importing JSON or unknown assets without types
declare module '*.json';
