import { Whop } from "@whop/api";

export const whopApi = new Whop({
  apiKey: process.env.WHOP_API_KEY!,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
  agentUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID!,
});

export interface WhopUserVerification {
  userId: string;
  hasAccess: boolean;
  accessLevel: 'admin' | 'customer' | 'no_access';
  user?: any;
  membership?: any;
}

export async function verifyWhopUser(headers: any, experienceId?: string): Promise<WhopUserVerification> {
  try {
    // Extract user ID from Whop headers
    const userId = headers['x-whop-user-id'] || headers['whop-user-id'];
    
    if (!userId) {
      return {
        userId: '',
        hasAccess: false,
        accessLevel: 'no_access'
      };
    }

    // Get user from Whop API
    const user = await whopApi.users.retrieve(userId);
    
    // Check if user has access to the company/product
    const membership = await whopApi.memberships.list({
      user_id: userId,
      company_id: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
    });

    const activeMembership = membership.data.find(m => m.status === 'active');
    
    if (!activeMembership) {
      return {
        userId,
        hasAccess: false,
        accessLevel: 'no_access',
        user
      };
    }

    // Check if user is admin (owner/moderator)
    const isAdmin = activeMembership.role === 'owner' || activeMembership.role === 'admin';
    
    return {
      userId,
      hasAccess: true,
      accessLevel: isAdmin ? 'admin' : 'customer',
      user,
      membership: activeMembership
    };
    
  } catch (error) {
    console.error('Whop verification error:', error);
    return {
      userId: '',
      hasAccess: false,
      accessLevel: 'no_access'
    };
  }
}