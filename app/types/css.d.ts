/// <reference types="next" />

// Type declarations for CSS imports in Next.js
declare module '*.css' {
  const content: string
  export default content
}
