import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Enhancing Software Testing Techniques for IoT Based Healthcare Systems
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Advanced testing solutions for IoT healthcare applications. Improve reliability, ensure safety, and validate healthcare IoT systems with comprehensive testing approaches.
          </p>
          <div className="flex gap-4 mt-4">
            <Button size="lg" asChild>
              <Link href="/auth/signUp">
                Start Testing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
