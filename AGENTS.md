# Task Duel - Agent Guidelines

## Build/Lint/Test Commands

- `pnpm run dev` - Start development server (Vite)
- `pnpm run build` - Build for production with type checking
- `pnpm run build-only` - Build without type checking
- `pnpm run type-check` - Run TypeScript type checking
- `pnpm run format` - Format code with Prettier
- `pnpm run preview` - Preview production build

## Code Style Guidelines

- **Formatting**: Prettier with 100 char width, no semicolons, single quotes
- **Imports**: Group imports (external first, then internal)
- **Types**: Use TypeScript strictly, prefer explicit types over `any`
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Error handling**: Use try/catch with proper error messages
- **File extensions**: `.ts` for TypeScript, `.vue` for Vue components
- **Server code**: Use `.mts` extensions for ESM modules, but note that you should use `.mjs` in import clause

## Project Structure

- Frontend: `/src` (Vue 3 + TypeScript + Pinia)
- Backend: `/server` (Express + PocketBase)
- Use `@/*` alias for frontend imports
- Database types in `/server/types/pocketbase-types.d.ts`
