"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { authClient } from "@/lib/auth.client";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGithubLogin = async () => {
    setIsLoading(true);

    await authClient.signIn.social({
      provider: "github",
      callbackURL: "http://localhost:3000",
      fetchOptions: {
        onError: () => setIsLoading(false),
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 justify-center items-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Image src={"/globe.svg"} alt="logo" height={500} width={500} />
        <h1 className="text-6xl font-extrabold text-indigo-400">
          Welcome Back! to Orbital Cli
        </h1>
        <p className="text-base font-medium text-zinc-400">
          Login to your account for allowing device flow
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full cursor-pointer h-12 flex items-center justify-center gap-2"
                type="button"
                disabled={isLoading}
                onClick={handleGithubLogin}
              >
                {isLoading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Signing in
                  </>
                ) : (
                  <>
                    <Image
                      src={"/globe.svg"}
                      alt="githubimage"
                      height={20}
                      width={20}
                    />
                    Continue with GitHub
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;