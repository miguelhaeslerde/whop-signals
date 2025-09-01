import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TradingSignalsApp from "./trading-signals-app";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  try {
    // The headers contains the user token
    const headersList = await headers();

    // The experienceId is a path param
    const { experienceId } = await params;

    // The user token is in the headers
    const { userId } = await whopSdk.verifyUserToken(headersList);

    const result = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    const user = await whopSdk.users.getUser({ userId });
    const experience = await whopSdk.experiences.getExperience({ experienceId });

    // Either: 'admin' | 'customer' | 'no_access';
    // 'admin' means the user is an admin of the whop, such as an owner or moderator
    // 'customer' means the user is a common member in this whop
    // 'no_access' means the user does not have access to the whop
    const { accessLevel, hasAccess } = result;

    if (!hasAccess) {
      return (
        <div className="flex justify-center items-center h-screen px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Access Denied
            </h1>
            <p className="text-muted-foreground">
              You do not have access to this trading signals experience.
            </p>
          </div>
        </div>
      );
    }

    // Pass user data and role to the client component
    return (
      <TradingSignalsApp 
        user={user}
        experience={experience}
        userRole={accessLevel}
        hasAccess={hasAccess}
      />
    );
  } catch (error) {
    console.error("Error in ExperiencePage:", error);
    
    return (
      <div className="flex justify-center items-center h-screen px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">
            Unable to verify your access. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}