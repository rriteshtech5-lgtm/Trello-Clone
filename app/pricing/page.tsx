import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Billing is disabled in Clerk development mode.
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>- Boards, lists, and cards</p>
              <p>- Drag and drop workflow</p>
              <p>- Labels, members, checklist</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro (Demo Placeholder)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>
                Enable billing in Clerk dashboard to render live pricing tables.
              </p>
              <p>
                Until then, board creation is enabled from dashboard for local testing.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
