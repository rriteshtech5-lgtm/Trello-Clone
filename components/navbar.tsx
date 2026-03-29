"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CircleHelp,
  Filter,
  Search,
  Share2,
  Star,
  Zap,
  MoreHorizontal,
  Trello,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";

interface Props {
  boardTitle?: string;
  onEditBoard?: () => void;

  onFilterClick?: () => void;
  filterCount?: number;
}
export default function Navbar({
  boardTitle,
  onEditBoard,
  onFilterClick,
  filterCount = 0,
}: Props) {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();

  const isDashboardPage = pathname === "/dashboard";
  const isBoardPage = pathname.startsWith("/boards/");

  if (isDashboardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              Trello Clone
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <UserButton />
          </div>
        </div>
      </header>
    );
  }

  if (isBoardPage) {
    return (
      <header className="sticky top-0 z-50">
        <div className="border-b border-white/10 bg-[#1d2125]">
          <div className="mx-auto flex h-12 w-full items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-2 text-white/90">
                <Trello className="h-5 w-5" />
                <span className="text-sm font-medium">Trello</span>
              </div>
              <div className="hidden md:flex flex-1 max-w-[560px] items-center gap-2 rounded-md border border-white/20 bg-black/20 px-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  aria-label="Search"
                  placeholder="Search"
                  className="h-8 w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                />
              </div>
              <Button
                size="sm"
                className="h-8 bg-[#579dff] px-3 text-xs font-semibold text-[#172b4d] hover:bg-[#85b8ff]"
              >
                Create
              </Button>
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <Bell className="h-4 w-4" />
              <CircleHelp className="h-4 w-4" />
              <UserButton />
            </div>
          </div>
        </div>

        <div className="border-b border-white/15 bg-[#51397a]/90 backdrop-blur-sm">
          <div className="mx-auto w-full px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 sm:space-x-2 text-white/85 hover:text-white flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back to dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-4 sm:h-6 w-px bg-white/40 hidden sm:block" />
              <div className="flex items-center space-x-2 min-w-0 rounded-md bg-white/20 px-2 py-1">
                <Trello className="text-white h-4 w-4" />
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  <span className="text-lg font-semibold text-white truncate">
                    {boardTitle}
                  </span>
                  {onEditBoard && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 flex-shrink-0 p-0 text-white hover:bg-white/25"
                      onClick={onEditBoard}
                    >
                      <MoreHorizontal />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-white/90">
              {onFilterClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs sm:text-sm text-white hover:bg-white/25 ${
                    filterCount > 0 ? "bg-white/20" : ""
                  }`}
                  onClick={onFilterClick}
                >
                  <Filter className="h-3 w-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                  {filterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-xs ml-1 sm:ml-2 bg-white/85 text-blue-700"
                    >
                      {filterCount}
                    </Badge>
                  )}
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                <Zap className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                <Star className="h-4 w-4" />
              </Button>
              <Button className="h-8 bg-white/90 px-3 text-xs text-[#172b4d] hover:bg-white">
                <Share2 className="mr-1 h-3.5 w-3.5" /> Share
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            Trello Clone
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {isSignedIn ? (
            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Welcome, {user.firstName ?? user.emailAddresses[0].emailAddress}
              </span>
              <Link href="/dashboard">
                <Button size="sm" className="text-xs sm:text-sm">
                  Go to Dashboard <ArrowRight />
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <SignInButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="text-xs sm:text-sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
