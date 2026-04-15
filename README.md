# Hydra App Prototype

Hydra App Prototype is a React + Vite application for BOM (Bill of Materials) workflows in the ASC Connected context.  
The project uses Ant Design and Hydra theme tokens to keep implementation aligned with design-system decisions.

## Figma References

- Design System (Hydra Ant Design DS): [Hydra Ant Design - DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS?node-id=204-47936&t=V9ypdSdYk2oXONOX-1)
- BOM product/design flows: [BOM SPEC - ASC Connected v2](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=670-18849&t=1ggZcsa1oIJ6jHIA-1)

## Tech Stack

- React 19
- TypeScript
- Vite
- Ant Design
- React Router

## Run Locally

### 1) Prerequisites

- Node.js 20+ recommended
- npm

### 2) Install dependencies

```bash
npm install
```

### 3) Start development server

```bash
npm run dev
```

Open the app in your browser at:

`http://localhost:5173/`

### 4) Production build

```bash
npm run build
```

### 5) Preview production build locally

```bash
npm run preview
```

## Useful Scripts

- `npm run dev` - starts Vite dev server
- `npm run build` - runs TypeScript build and Vite production build
- `npm run preview` - serves the production build locally
- `npm run tokens:dump` - dumps primary token data via local script
