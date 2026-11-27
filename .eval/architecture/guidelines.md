# Guidelines

Conventions backed by **≥2** real, verbatim code examples. Anything with fewer is omitted below.

## Mark request-dependent API route handlers as force-dynamic.

- `apps/web/app/api/[...path]/route.ts`:

  ```
  export const dynamic = "force-dynamic";
  ```

- `apps/web/app/api/auth/login/route.ts`:

  ```
  export const dynamic = "force-dynamic";
  ```

- `apps/web/app/api/auth/logout/route.ts`:

  ```
  export const dynamic = "force-dynamic";
  ```

- `apps/web/app/api/auth/me/route.ts`:

  ```
  export const dynamic = "force-dynamic";
  ```

- `apps/web/app/api/auth/register/route.ts`:

  ```
  export const dynamic = "force-dynamic";
  ```

## Represent App Router screens with default-exported page components.

- `apps/web/app/account/page.tsx`:

  ```
  export default function AccountPage() {
  ```

- `apps/web/app/cart/page.tsx`:

  ```
  export default function CartPage() {
  ```

- `apps/web/app/page.tsx`:

  ```
  export default async function HomePage() {
  ```

## Use the shared useAuth hook in UI that needs authentication state.

- `apps/web/app/cart/page.tsx`:

  ```
  const { user, loading: authLoading } = useAuth();
  ```

- `apps/web/components/site-header.tsx`:

  ```
  const { user, loading } = useAuth();
  ```
