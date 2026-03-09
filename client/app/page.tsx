"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth.client"
import { useRouter } from "next/navigation"

export default function Home() {
  const { data, isPending } = authClient.useSession()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  if (!data?.session && !data?.user) {
    router.push("/sign-in")
  }

  const handleSignOut = () => {
    setIsSigningOut(true)

    authClient.signOut({
      fetchOptions: {
        onError: (ctx) => {
          console.log(ctx)
          setIsSigningOut(false)
        },
        onSuccess: () => {
          router.push("/sign-in")
        },
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <div className="w-full max-w-md px-4">
        <div className="space-y-8">

          {/* Profile Card */}
          <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <img
                src={data?.user?.image || "/vercel.svg"}
                alt={data?.user?.name || "User"}
                width={120}
                height={120}
                className="rounded-full border-2 border-dashed border-zinc-600 object-cover"
              />
            </div>

            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold text-zinc-50 truncate">
                Welcome, {data?.user?.name || "User"}
              </h1>
              <p className="text-sm text-zinc-400">Authenticated User</p>
            </div>
          </div>

          {/* Email Card */}
          <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-6 bg-zinc-900/50 backdrop-blur-sm space-y-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Email Address
            </p>
            <p className="text-lg text-zinc-100 font-medium break-all">
              {data?.user?.email}
            </p>
          </div>

          {/* Sign Out Button */}
          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full h-11 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSigningOut && <Spinner className="h-4 w-4" />}
            {isSigningOut ? "Signing Out" : "Sign Out"}
          </Button>

        </div>
      </div>
    </div>
  )
}