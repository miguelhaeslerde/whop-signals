import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-testid="analytics-page">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Performance metrics and insights</p>
        </div>
      </div>

      {/* Coming Soon Placeholder */}
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2" data-testid="coming-soon-title">
            Analytics Coming Soon
          </h3>
          <p className="text-muted-foreground" data-testid="coming-soon-description">
            Detailed performance metrics and signal analytics will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
