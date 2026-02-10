import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for upgrading to Premium Penguin Plan. Enjoy your exclusive features!
        </p>
        <Button
          onClick={() => setLocation("/")}
          className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
