// For now, we'll implement a mock Whop SDK until dependencies are resolved
// import { WhopServerSdk } from "@whop/api";

interface WhopUserAccess {
  hasAccess: boolean;
  accessLevel: 'admin' | 'customer' | 'no_access';
}

interface WhopUser {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface WhopExperience {
  id: string;
  name: string;
  description?: string;
}

class MockWhopSDK {
  constructor(private config: any) {}

  async verifyUserToken(headers: any): Promise<{ userId: string }> {
    // Extract user ID from headers or use default for development
    const userId = headers.get?.('x-whop-user-id') || 
                   process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID || 
                   'user_FUnyssmDiTWHb';
    return { userId };
  }

  access = {
    async checkIfUserHasAccessToExperience({ userId, experienceId }: { userId: string; experienceId: string }): Promise<WhopUserAccess> {
      // Mock access check - in real implementation this would call Whop API
      const isAdmin = userId === process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID;
      return {
        hasAccess: true,
        accessLevel: isAdmin ? 'admin' : 'customer'
      };
    }
  };

  users = {
    async getUser({ userId }: { userId: string }): Promise<WhopUser> {
      // Mock user data - in real implementation this would call Whop API
      return {
        id: userId,
        name: 'Demo User',
        username: 'demo_user',
        email: 'demo@example.com'
      };
    }
  };

  experiences = {
    async getExperience({ experienceId }: { experienceId: string }): Promise<WhopExperience> {
      // Mock experience data - in real implementation this would call Whop API
      return {
        id: experienceId,
        name: 'Trading Signals',
        description: 'Professional trading signals platform'
      };
    }
  };
}

export const whopSdk = new MockWhopSDK({
  // Add your app id here - this is required.
  // You can get this from the Whop dashboard after creating an app section.
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID ?? "fallback",

  // Add your app api key here - this is required.
  // You can get this from the Whop dashboard after creating an app section.
  appApiKey: process.env.WHOP_API_KEY ?? "fallback",

  // This will make api requests on behalf of this user.
  // This is optional, however most api requests need to be made on behalf of a user.
  // You can create an agent user for your app, and use their userId here.
  // You can also apply a different userId later with the `withUser` function.
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,

  // This is the companyId that will be used for the api requests.
  // When making api requests that query or mutate data about a company, you need to specify the companyId.
  // This is optional, however if not specified certain requests will fail.
  // This can also be applied later with the `withCompany` function.
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});