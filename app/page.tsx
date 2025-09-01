export default function Page() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Trading Signals
          </h1>
          <p className="text-lg text-muted-foreground">
            Professional trading signals platform for Whop
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-card p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground mr-3">
                1
              </span>
              Environment Setup Complete
            </h2>
            <p className="text-muted-foreground ml-11">
              Your Whop environment variables are configured:
            </p>
            {process.env.NODE_ENV === "development" && (
              <div className="text-muted-foreground ml-11 mt-2">
                <pre className="text-sm">
                  <code>
                    WHOP_API_KEY={process.env.WHOP_API_KEY?.slice(0, 5)}...
                    <br />
                    NEXT_PUBLIC_WHOP_AGENT_USER_ID=
                    {process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID}
                    <br />
                    NEXT_PUBLIC_WHOP_APP_ID=
                    {process.env.NEXT_PUBLIC_WHOP_APP_ID}
                    <br />
                    NEXT_PUBLIC_WHOP_COMPANY_ID=
                    {process.env.NEXT_PUBLIC_WHOP_COMPANY_ID}
                  </code>
                </pre>
              </div>
            )}
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground mr-3">
                2
              </span>
              Install your app into your Whop
            </h2>
            <p className="text-muted-foreground ml-11">
              {process.env.NEXT_PUBLIC_WHOP_APP_ID ? (
                <a
                  href={`https://whop.com/apps/${process.env.NEXT_PUBLIC_WHOP_APP_ID}/install`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline"
                >
                  Click here to install your app
                </a>
              ) : (
                <span className="text-yellow-600">
                  Please set your environment variables to see the installation link
                </span>
              )}
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground mr-3">
                3
              </span>
              Access Trading Signals
            </h2>
            <p className="text-muted-foreground ml-11">
              Once installed, access your trading signals at: 
              <code className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                /experiences/[experienceId]
              </code>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Need help? Visit the{" "}
            <a
              href="https://docs.whop.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline"
            >
              Whop Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}