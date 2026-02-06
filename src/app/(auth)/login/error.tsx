"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/app-name";
import Link from "next/link";
import { useEffect } from "react";

const VERIFY_ERROR_MESSAGE = "Could not verify code";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isVerifyError = error.message?.includes(VERIFY_ERROR_MESSAGE) ?? false;

  useEffect(() => {
    if (isVerifyError) {
      console.error(error.message);
    }
  }, [error.message, isVerifyError]);

  if (isVerifyError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
            <CardDescription>Invalid token.</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              Try again
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  throw error;
}
