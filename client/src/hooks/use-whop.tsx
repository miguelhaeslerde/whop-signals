import { useState, useEffect, createContext, useContext } from "react";
import { whopSDK, mockWhopSDK, type WhopContext } from "@/lib/whop";

interface WhopContextType {
  context: WhopContext | null;
  isLoading: boolean;
  error: string | null;
  user: any;
  userRole: "ADMIN" | "SUBSCRIBER";
  isAdmin: boolean;
}

const WhopReactContext = createContext<WhopContextType | null>(null);

export function WhopProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<WhopContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeWhop() {
      try {
        setIsLoading(true);
        setError(null);

        // In development, use mock data
        if (import.meta.env.DEV) {
          const mockContext = mockWhopSDK();
          setContext(mockContext);
        } else {
          const whopContext = await whopSDK.initialize();
          setContext(whopContext);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Whop initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeWhop();
  }, []);

  const userRole = context?.product?.role === "admin" ? "ADMIN" : "SUBSCRIBER";
  const isAdmin = userRole === "ADMIN";

  const value: WhopContextType = {
    context,
    isLoading,
    error,
    user: context?.user || null,
    userRole,
    isAdmin,
  };

  return (
    <WhopReactContext.Provider value={value}>
      {children}
    </WhopReactContext.Provider>
  );
}

export function useWhop() {
  const context = useContext(WhopReactContext);
  if (!context) {
    throw new Error("useWhop must be used within WhopProvider");
  }
  return context;
}
