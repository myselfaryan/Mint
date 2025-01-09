"use client";

import * as React from "react";
import { useContext, useState, useMemo, useEffect } from "react";
import {
  AudioWaveform,
  ChevronsUpDown,
  Command,
  GalleryVerticalEnd,
  LogOut,
  Plus,
  Users,
  Trophy,
  FileCode,
  FileCheck,
  Sun,
  Moon,
  Monitor,
  Contact,
} from "lucide-react";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/contexts/auth-context";
import { notFound } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Users",
      url: "users",
      icon: Users,
    },
    {
      title: "Groups",
      url: "groups",
      icon: Contact,
      items: [],
    },
    {
      title: "Contests",
      url: "contests",
      icon: Trophy,
      items: [],
    },
    {
      title: "Problems",
      url: "problems",
      icon: FileCode,
      items: [],
    },
    {
      title: "Submissions",
      url: "submissions",
      icon: FileCheck,
      items: [],
    },
  ],
};

const defaultUser = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

const defaultTeams = {
  teams: [
    {
      name: "IIIT Sri City",
      logo: GalleryVerticalEnd,
      nameId: "iiits",
      role: "owner",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      nameId: "corp",
      role: "admin",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      nameId: "corp2",
      role: "member",
    },
  ],
};

function ThemeItems() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <DropdownMenuItem
        onClick={() => setTheme("light")}
        className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
      >
        <Sun className="mr-2 h-4 w-4" />
        <span>Light</span>
        {theme === "light" && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setTheme("dark")}
        className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
      >
        <Moon className="mr-2 h-4 w-4" />
        <span>Dark</span>
        {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setTheme("system")}
        className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
      >
        <Monitor className="mr-2 h-4 w-4" />
        <span>System</span>
        {theme === "system" && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>
    </>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { logout, user, isAuthenticated } = useContext(AuthContext);
  const pathname = usePathname();
  const router = useRouter();

  // Get orgId from URL
  const orgId = pathname.split("/")[1];

  console.log("orgId", orgId);

  // Transform user orgs into teams format or use default teams
  const teams = useMemo(() => {
    if (user?.orgs && user.orgs.length > 0) {
      return user.orgs.map((org) => ({
        ...org,
        logo: GalleryVerticalEnd,
      }));
    }
    return [];
  }, [user?.orgs]);

  console.log("teams in sidebar", teams);

  // Check if the orgId exists in teams, if not return 404
  useEffect(() => {
    console.log("404 check - orgId:", orgId, "type:", typeof orgId);
    console.log("404 check - teams:", teams);
    console.log("404 check - teams.length:", teams.length);
    if (
      isAuthenticated &&
      orgId &&
      teams.length > 0 &&
      !teams.find((team) => team.nameId === orgId)
    ) {
      notFound();
    }
  }, [orgId, teams, isAuthenticated]);

  // Set active team based on URL orgId
  const [activeTeam, setActiveTeam] = useState<(typeof teams)[0] | null>(() => {
    const teamFromUrl = teams.find((team) => team.nameId === orgId);
    return teamFromUrl || null;
  });

  // Update activeTeam when URL changes or teams load
  useEffect(() => {
    const teamFromUrl = teams.find((team) => team.nameId === orgId);
    if (
      teamFromUrl &&
      (!activeTeam || activeTeam.nameId !== teamFromUrl.nameId)
    ) {
      setActiveTeam(teamFromUrl);
    }
  }, [orgId, teams, activeTeam]);

  // Handle team change with URL update
  const handleTeamChange = (team: (typeof teams)[0]) => {
    setActiveTeam(team);
    // Get the current path segments after the org ID
    const pathSegments = pathname.split("/").slice(2);
    // Construct new path with new org ID and maintain the rest of the path
    const newPath = `/${team.nameId}${pathSegments.length ? "/" + pathSegments.join("/") : ""}`;
    router.push(newPath);
  };

  const handleLogout = () => {
    logout();
  };

  console.log(process.env.NEXT_PUBLIC_DEBUG);
  console.log(user);
  if (!user && process.env.NEXT_PUBLIC_DEBUG !== "True") {
    router.push("/auth");
  }

  // Get the base path (e.g., /[orgId])
  const basePath = pathname.split("/").slice(0, 2).join("/");

  // Utility function to generate breadcrumbs from pathname
  const generateBreadcrumbs = (pathname: string) => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path) => ({
      href: "/" + paths.slice(0, paths.indexOf(path) + 1).join("/"),
      label: path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));
  };

  // If auth is still loading, show skeleton UI
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen">
        <aside className="flex flex-col w-64 px-4 py-6 border-r">
          {/* Skeleton for org switcher */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Skeleton for navigation items */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Skeleton for user account */}
          <div className="mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      {activeTeam && (
                        <>
                          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <activeTeam.logo className="size-4" />
                          </div>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                              {activeTeam.name}
                            </span>
                            <span className="truncate text-xs">
                              {activeTeam.nameId}
                            </span>
                          </div>
                        </>
                      )}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    align="start"
                    side="bottom"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Organizations
                    </DropdownMenuLabel>
                    {teams.map((team, index) => (
                      <DropdownMenuItem
                        key={team.name}
                        onClick={() => handleTeamChange(team)}
                        className="cursor-pointer gap-2 p-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <team.logo className="size-4 shrink-0" />
                        </div>
                        {team.name}
                        <DropdownMenuShortcut>{team.role}</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 p-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => router.push("/onboarding")}
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border bg-sidebar-primary text-sidebar-primary-foreground">
                        <Plus className="size-4 shrink-0" />
                      </div>
                      <span className="font-medium">Create or Join a Org</span>
                      <DropdownMenuShortcut>New</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarMenu>
                {data.navMain.map((item) => {
                  const isActive = pathname.includes(`${basePath}/${item.url}`);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={`hover:bg-accent hover:text-accent-foreground ${
                          isActive ? "bg-accent text-accent-foreground" : ""
                        }`}
                      >
                        <Link href={`${basePath}/${item.url}`}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">
                          {(user?.name || defaultUser.name)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.name || defaultUser.name}
                        </span>
                        <span className="truncate text-xs">
                          {user?.email || defaultUser.email}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg">
                            {(user?.name || defaultUser.name)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {user?.name || defaultUser.name}
                          </span>
                          <span className="truncate text-xs">
                            {user?.email || defaultUser.email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Change Theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <ThemeItems />
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {generateBreadcrumbs(usePathname()).map(
                    (crumb, index, array) => (
                      <React.Fragment key={crumb.href}>
                        <BreadcrumbItem className="hidden md:block">
                          {index === array.length - 1 ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={crumb.href}>
                              {crumb.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < array.length - 1 && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </React.Fragment>
                    ),
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {children}
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
