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
  LucideIcon,
  SignpostBig,
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

const defaultUser = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
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

function SidebarSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="flex flex-col w-64 px-4 py-6 border-r">
        {/* Skeleton for org switcher */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Skeleton for navigation items */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Skeleton for user account */}
        <div className="mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}

// Add this new component near the RoleBadge component
function ComingSoonBadge() {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground dark:bg-muted/50">
      coming soon
    </span>
  );
}

interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  allowedRoles: string[];
  disabled?: boolean;
  comingSoon?: boolean;
  hidden?: boolean;
}

// First, let's remove the static data object and make it a function
// that returns filtered items based on role
const getNavItems = (role?: string): SidebarItem[] => {
  const allItems: SidebarItem[] = [
    {
      title: "Users",
      url: "users",
      icon: Users,
      allowedRoles: ["owner", "organizer"],
    },
    {
      title: "Groups",
      url: "groups",
      icon: Contact,
      allowedRoles: ["owner"],
      disabled: true,
      comingSoon: true,
      hidden: true,
    },
    {
      title: "Posts",
      url: "posts",
      icon: SignpostBig,
      allowedRoles: ["owner"],
      disabled: false,
      comingSoon: false,
      hidden: false,
    },
    {
      title: "Contests",
      url: "contests",
      icon: Trophy,
      allowedRoles: ["owner", "organizer", "member"],
    },
    {
      title: "Problems",
      url: "problems",
      icon: FileCode,
      allowedRoles: ["owner", "organizer"],
    },
    {
      title: "Submissions",
      url: "submissions",
      icon: FileCheck,
      allowedRoles: ["owner", "organizer"],
    },
  ];

  if (!role) return [];
  return allItems.filter((item) => item.allowedRoles.includes(role));
};

// Add this new component near the top of the file
function RoleBadge({ role }: { role: string }) {
  const colors = {
    owner: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    organizer:
      "bg-secondary/20 text-secondary-foreground dark:bg-secondary/30 dark:text-secondary-foreground",
    member:
      "bg-muted text-muted-foreground dark:bg-muted/50 dark:text-muted-foreground",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${colors[role as keyof typeof colors]}`}
    >
      {role}
    </span>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { logout, user, isAuthenticated, isLoading } = useContext(AuthContext);
  const pathname = usePathname();
  const router = useRouter();
  const pathName = usePathname();
  const orgId = pathname.split("/")[1];

  const teams = useMemo(() => {
    if (user?.orgs && user.orgs.length > 0) {
      return user.orgs.map((org) => ({
        ...org,
        logo: GalleryVerticalEnd,
      }));
    }
    return [];
  }, [user?.orgs]);

  const [activeTeam, setActiveTeam] = useState<(typeof teams)[0] | null>(() => {
    const teamFromUrl = teams.find((team) => team.nameId === orgId);
    return teamFromUrl || null;
  });

  // Move this useEffect up here with other hooks
  useEffect(() => {
    if (
      isAuthenticated &&
      orgId &&
      teams.length >= 0 &&
      !teams.find((team) => team.nameId === orgId)
    ) {
      notFound();
    }
    const teamFromUrl = teams.find((team) => team.nameId === orgId);
    if (
      teamFromUrl &&
      (!activeTeam || activeTeam.nameId !== teamFromUrl.nameId)
    ) {
      setActiveTeam(teamFromUrl);
    }
  }, [orgId, teams, activeTeam, isAuthenticated]);

  const currentOrgRole = useMemo(() => {
    if (!activeTeam) return undefined;
    return activeTeam.role;
  }, [activeTeam]);

  const navItems = useMemo(() => {
    return getNavItems(currentOrgRole);
  }, [currentOrgRole]);

  // Conditional returns can now come after all hooks
  if (isLoading) {
    return <SidebarSkeleton>{children}</SidebarSkeleton>;
  }

  if (!isAuthenticated) {
    router.push("/auth/login");
  }

  if (!user && process.env.NEXT_PUBLIC_DEBUG !== "True") {
    router.push("/auth/login");
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

  console.log("NEXT_PUBLIC_DEBUG", process.env.NEXT_PUBLIC_DEBUG);
  console.log("user", user);
  console.log("isLoading", isLoading);

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
                          <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-semibold">
                                {activeTeam.name}
                              </span>
                              <RoleBadge role={activeTeam.role} />
                            </div>
                            <span className="truncate text-xs text-muted-foreground">
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
                    {teams.map((team) => (
                      <DropdownMenuItem
                        key={team.name}
                        onClick={() => handleTeamChange(team)}
                        className="cursor-pointer gap-2 p-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <team.logo className="size-4 shrink-0" />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <span>{team.name}</span>
                          <RoleBadge role={team.role} />
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 p-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => router.push("/new-org")}
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
                {navItems
                  .filter((item) => !item.hidden)
                  .map((item) => {
                    const isActive = pathname.includes(
                      `${basePath}/${item.url}`,
                    );
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild={!item.disabled}
                          tooltip={item.title}
                          className={`
                            ${item.disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"}
                            ${isActive ? "bg-accent text-accent-foreground" : ""}
                          `}
                        >
                          {item.disabled ? (
                            <div className="flex items-center w-full">
                              {item.icon && (
                                <item.icon className="size-4 mr-2" />
                              )}
                              <div className="flex items-center justify-between w-full">
                                <span>{item.title}</span>
                                {item.comingSoon && <ComingSoonBadge />}
                              </div>
                            </div>
                          ) : (
                            <Link
                              href={`${basePath}/${item.url}`}
                              className="flex items-center w-full"
                            >
                              {item.icon && (
                                <item.icon className="size-4 mr-2" />
                              )}
                              <span>{item.title}</span>
                            </Link>
                          )}
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
                  {generateBreadcrumbs(pathName).map((crumb, index, array) => (
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
                  ))}
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
