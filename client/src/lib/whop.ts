declare global {
  interface Window {
    Whop?: {
      authorize: (config: { scopes: string[] }) => Promise<{ token: string; user: any }>;
      isFrame: () => boolean;
      getContext: () => Promise<{ user: any; membership: any; product: any }>;
      notification: {
        send: (payload: { title: string; body: string; userIds: string[] }) => Promise<void>;
      };
    };
  }
}

export interface WhopUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface WhopMembership {
  id: string;
  status: string;
  plan_id: string;
}

export interface WhopProduct {
  id: string;
  name: string;
  role: "admin" | "member";
  logo?: string;
  image?: string;
  icon?: string;
}

export interface WhopContext {
  user: WhopUser;
  membership: WhopMembership;
  product: WhopProduct;
}

class WhopSDK {
  private context: WhopContext | null = null;
  private initialized = false;

  async initialize(): Promise<WhopContext> {
    if (this.initialized && this.context) {
      return this.context;
    }

    if (!window.Whop) {
      throw new Error("Whop SDK not loaded");
    }

    if (!window.Whop.isFrame()) {
      throw new Error("App must run inside Whop iframe");
    }

    try {
      this.context = await window.Whop.getContext();
      this.initialized = true;
      return this.context;
    } catch (error) {
      throw new Error("Failed to get Whop context");
    }
  }

  getContext(): WhopContext | null {
    return this.context;
  }

  getUser(): WhopUser | null {
    return this.context?.user || null;
  }

  getUserRole(): "ADMIN" | "SUBSCRIBER" {
    const role = this.context?.product?.role;
    return role === "admin" ? "ADMIN" : "SUBSCRIBER";
  }

  async sendNotification(userIds: string[], title: string, body: string): Promise<void> {
    if (!window.Whop?.notification) {
      throw new Error("Whop notifications not available");
    }

    await window.Whop.notification.send({
      title,
      body,
      userIds,
    });
  }

  // Helper to create headers for API requests
  createAuthHeaders(): Record<string, string> {
    if (!this.context?.user?.id) {
      throw new Error("No authenticated user");
    }

    return {
      "X-Whop-User-ID": this.context.user.id,
      "Content-Type": "application/json",
    };
  }
}

export const whopSDK = new WhopSDK();

// For development/testing when Whop SDK is not available
export function mockWhopSDK(): WhopContext {
  const mockContext: WhopContext = {
    user: {
      id: "mock-user-123",
      username: "johndoe",
      name: "John Doe",
      email: "john@example.com",
    },
    membership: {
      id: "mock-membership-456",
      status: "active",
      plan_id: "pro-plan",
    },
    product: {
      id: "signal-pro",
      name: "Signal Pro",
      role: "admin", // Change to "member" for subscriber testing
      logo: null,
    },
  };

  // Override the SDK for development
  if (!window.Whop) {
    window.Whop = {
      isFrame: () => true,
      getContext: async () => mockContext,
      authorize: async () => ({ token: "mock-token", user: mockContext.user }),
      notification: {
        send: async (payload) => {
          console.log("Mock notification:", payload);
        },
      },
    };
  }

  return mockContext;
}
