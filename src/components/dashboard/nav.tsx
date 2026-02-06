"use client";

import { APP_NAME } from "@/lib/app-name";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Settings, LogOut, Target } from "lucide-react";
import { CreateBoardDialog } from "@/components/dashboard/create-board-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { Id } from "convex/_generated/dataModel";

export type DashboardProfile = {
  _id: Id<"profiles">;
  _creationTime: number;
  userId: Id<"users">;
  name?: string;
  avatarUrl?: string;
  paymentProvider?: string;
  paymentCustomerId?: string;
  hasPaid: boolean;
  timezone: string;
};

interface DashboardNavProps {
  user: { id: Id<"users">; email?: string };
  profile: DashboardProfile | null;
}

export function DashboardNav({ user, profile }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() ?? "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/boards" className="flex items-center gap-2 font-bold">
            <Target className="h-5 w-5 text-primary" />
            <span>{APP_NAME}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/boards"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/boards" || pathname.startsWith("/boards/")
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                Boards
              </span>
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(pathname === "/boards" || pathname.startsWith("/boards/")) && (
            <CreateBoardDialog />
          )}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={profile?.avatarUrl ?? undefined}
                    alt={profile?.name ?? "User"}
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.name ?? "User"}
                  </p>
                  {user.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
