# Project Dependencies

## Core Dependencies
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "sql.js": "^1.10.0",
    "@codemirror/lang-sql": "^6.6.0",
    "@codemirror/view": "^6.26.0",
    "@codemirror/state": "^6.4.0",
    "@codemirror/theme-one-dark": "^6.1.0",
    "codemirror": "^6.0.0",
    "@uiw/react-codemirror": "^4.21.0",
    "framer-motion": "^11.0.0",
    "@supabase/supabase-js": "^2.42.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "zustand": "^4.5.0",
    "react-hot-toast": "^2.4.0",
    "canvas-confetti": "^1.9.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/sql.js": "^1.4.0",
    "@types/canvas-confetti": "^1.6.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "better-sqlite3": "^11.0.0"
  }
}
```

## Key Package Notes

### sql.js
- SQLite compiled to WebAssembly
- Must copy the WASM file to `/public/` during build
- Initialize with: `initSqlJs({ locateFile: file => `/sql-wasm.wasm` })`

### CodeMirror 6
- Using `@uiw/react-codemirror` as the React wrapper
- SQL language support via `@codemirror/lang-sql`
- Custom theme needed to match medieval aesthetic

### Supabase
- Free tier: 500MB database, 50K monthly active users, 1GB file storage
- Row Level Security (RLS) policies needed for multi-tenant teacher/student data

### better-sqlite3
- Used ONLY in the build script (`scripts/build-databases.ts`) to generate `.sqlite` files
- NOT shipped to the browser

### next.config.js Notes
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required for sql.js WASM support
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};
```