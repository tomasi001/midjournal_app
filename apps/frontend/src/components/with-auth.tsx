"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { token, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Don't redirect until loading is complete
      if (isLoading) {
        return;
      }
      if (!token) {
        router.replace("/login");
      }
    }, [token, router, isLoading]);

    // While loading, or if there's no token (and we're about to redirect),
    // render nothing to avoid a flash of the protected content.
    if (isLoading || !token) {
      // You can return a loader here while redirecting
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // Set a display name for easier debugging
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  WithAuthComponent.displayName = `withAuth(${displayName})`;

  return WithAuthComponent;
}
