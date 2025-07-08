# Phase 2: Frontend Implementation

**Objective:** Build a modern, functional web interface for user interaction with the core RAG functionality using Next.js, Tailwind CSS, and shadcn/ui.

---

## 2.1: Initialize Next.js Project & Core Setup

**Goal:** Set up the frontend application within the monorepo and configure it with the necessary tools.

- **Task 2.1.1: Create Next.js Application**

  - **Action:** Use `create-next-app` to initialize a new Next.js project in the `apps/frontend` directory.
  - **Configuration:**
    - Use TypeScript.
    - Use ESLint.
    - Use Tailwind CSS.
    - Use the App Router.
  - **Deliverable:** A new `apps/frontend` directory containing a functional Next.js application.

- **Task 2.1.2: Initialize shadcn/ui**

  - **Action:** From within the `apps/frontend` directory, run the `npx shadcn@latest init` command to set up shadcn/ui for your Next.js project.
  - **Action:** Configure `components.json` to set up aliases for components and utils.
  - **Deliverable:** `tailwind.config.ts` and `globals.css` are updated, and a `lib/utils.ts` file is created.

- **Task 2.1.3: Configure Turborepo for Frontend**
  - **Action:** Add frontend-specific `dev`, `build`, and `lint` scripts to `apps/frontend/package.json`.
  - **Action:** Update the root `turbo.json` to include task definitions for the frontend (e.g., `frontend#dev`, `frontend#build`).
  - **Action:** Update the root `package.json` `dev` script to run both backend and frontend (`turbo run dev`).

---

## 2.2: Build Core UI Layout and Authentication Pages

**Goal:** Create the main application layout and the pages required for user registration and login.

- **Task 2.2.1: Create Root Layout & Theme**

  - **Action:** Design the main application layout in `apps/frontend/app/layout.tsx`.
  - **Action:** Set up a theme provider for light/dark mode toggling, a common feature with shadcn/ui.

- **Task 2.2.2: Install Core shadcn/ui Components**

  - **Action:** Install the necessary UI primitives using `npx shadcn@latest add ...`:
    - `button`
    - `input`
    - `label`
    - `card`
    - `toast`
    - `textarea`

- **Task 2.2.3: Implement User Registration Page**

  - **Action:** Create a new route at `apps/frontend/app/register/page.tsx`.
  - **Action:** Build the registration form using the `Card`, `Input`, `Label`, and `Button` components.
  - **Action:** Implement client-side logic to call the backend `POST /auth/register` endpoint.
  - **Action:** Handle success and error states using `sonner` for toast notifications.

- **Task 2.2.4: Implement User Login Page**

  - **Action:** Create a new route at `apps/frontend/app/login/page.tsx`.
  - **Action:** Build the login form similar to the registration page.
  - **Action:** Implement client-side logic to call `POST /auth/login`.
  - **Action:** On success, store the JWT securely and redirect the user to the main application page.

- **Task 2.2.5: Create Authentication State Management**
  - **Action:** Implement a simple client-side authentication provider (e.g., using React Context or Zustand) to manage the JWT and user state globally.
  - **Action:** Create protected route logic that redirects unauthenticated users to the login page.

---

## 2.3: Implement Journaling and Chat Interfaces

**Goal:** Build the core functional components for submitting journal entries and interacting with the chat AI.

- **Task 2.3.1: Create Main Journal Dashboard Page**

  - **Action:** Create the main authenticated route at `apps/frontend/app/journal/page.tsx`. This page will host the journaling and chat components.

- **Task 2.3.2: Implement Text Ingestion Component**

  - **Action:** Within the dashboard, create a component with a `Textarea` and a "Submit" button.
  - **Action:** This component will call the `POST /ingest/text` endpoint with the user's entry and the authentication token from the global state.

- **Task 2.3.3: Implement Chat Component**
  - **Action:** Create a chat interface component using shadcn components.
  - **Action:** It should have a scrollable area for displaying the conversation history and an input field for new messages.
  - **Action:** This component will call the `POST /query/chat` endpoint.
  - **Action:** Implement logic to handle the streaming response from the backend and display it progressively in the chat history.

---

## 2.4: Finalization & CI/CD Integration

**Goal:** Polish the UI/UX and integrate the new frontend into the CI/CD pipeline.

- **Task 2.4.1: Refine UI/UX**

  - **Action:** Add loading states (e.g., spinners, skeleton loaders) for all API calls.
  - **Action:** Ensure consistent styling and responsive design across all pages.
  - **Action:** Implement comprehensive error handling and user feedback using toasts.

- **Task 2.4.2: Update CI/CD for Frontend**
  - **Action:** Update `.github/workflows/ci.yml` to include steps for linting (`turbo run frontend#lint`) and building (`turbo run frontend#build`) the new frontend application.
