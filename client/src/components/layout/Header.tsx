import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BriefcaseIcon, HomeIcon, UserPlusIcon, MessageSquareIcon, BellIcon, MenuIcon, ChevronDownIcon, SearchIcon, UserIcon, LogOutIcon, BookOpenIcon, SettingsIcon, HelpCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState, useEffect, ReactNode } from "react";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  notifications?: number;
  isDesktop?: boolean;
}

const Header = () => {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  console.log("user auth : ", user);
  
  // Handle scroll effect for shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "";
    return `${user.firstName} ${user.lastName}`;
  };

  // Get user role display text
  const getUserRoleDisplay = () => {
    if (!user) return "";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  // Get profile navigation items based on user role
  const getProfileNavigationItems = () => {
    if (!user) return [];
    
    const commonItems = [
      {
        icon: <SettingsIcon className="h-4 w-4 mr-2" />,
        label: "Settings & Privacy",
        href: "/settings"
      },
      {
        icon: <HelpCircleIcon className="h-4 w-4 mr-2" />,
        label: "Help Center",
        href: "/help"
      }
    ];

    if (user.role === "student") {
      return [
        {
          icon: <BookOpenIcon className="h-4 w-4 mr-2" />,
          label: "CV Builder",
          href: "/cv-builder"
        },
        ...commonItems
      ];
    } else if (user.role === "employer") {
      return [
        {
          icon: <BriefcaseIcon className="h-4 w-4 mr-2" />,
          label: "Company Profile",
          href: `/company/${user.company_id}`
        },
        {
          icon: <UserPlusIcon className="h-4 w-4 mr-2" />,
          label: "Manage Internships",
          href: "/manage-internships"
        },
        ...commonItems
      ];
    }

    return commonItems;
  };

  // Get profile link based on user role
  const getProfileLink = () => {
    if (!user) return "/profile";
    return user.role === "employer" ? `/company/${user.company_id}` : `/profile/${user.id}`;
  };

  const NavItem = ({ 
    href, 
    icon, 
    label, 
    active, 
    notifications,
    isDesktop = true
  }: NavItemProps) => (
    <Link href={href}>
      <div className={cn(
        "flex items-center transition-all duration-200",
        isDesktop ? "flex-col py-1 px-3" : "flex-row space-x-3 px-4 py-3",
        active 
          ? "text-[#0A77FF] border-b-2 border-[#0A77FF]" 
          : "text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent"
      )}>
        <div className="relative">
          {icon}
          {notifications && notifications > 0 && (
            <Badge 
              variant="destructive" 
              className={cn(
                "bg-[#0A77FF] hover:bg-[#0A77FF] text-white border-2 border-white",
                isDesktop 
                  ? "absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px]" 
                  : "ml-auto text-[10px]"
              )}
            >
              {notifications}
            </Badge>
          )}
        </div>
        <span className={cn(
          isDesktop ? "text-xs mt-1" : "text-sm font-medium"
        )}>
          {label}
        </span>
      </div>
    </Link>
  );

  return (
    <header className={cn(
      "bg-white sticky top-0 z-50 transition-all duration-300",
      scrolled ? "shadow-md" : "border-b border-neutral-200"
    )}>
      <div className="container mx-auto flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="text-[#0A77FF] text-2xl">
                <BriefcaseIcon />
              </div>
              <span className="font-bold text-xl text-[#0A77FF]">StageConnect</span>
            </div>
          </Link>
          
          {isAuthenticated && !isMobile && (
            <div className="relative max-w-md w-full ml-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A77FF] focus:border-transparent"
                placeholder="Search..."
                type="text"
              />
            </div>
          )}
        </div>
        
        {isAuthenticated && (
          <>
            {!isMobile ? (
              <nav className="flex items-center h-full">
                <NavItem 
                  href="/" 
                  icon={<HomeIcon className="h-5 w-5" />} 
                  label="Home" 
                  active={location === '/'} 
                />
                <NavItem 
                  href="/network" 
                  icon={<UserPlusIcon className="h-5 w-5" />} 
                  label="My Network" 
                  active={location === '/network'} 
                />
                <NavItem 
                  href="/internships" 
                  icon={<BriefcaseIcon className="h-5 w-5" />} 
                  label="Internships" 
                  active={location === '/internships'} 
                />
                <NavItem 
                  href="/messaging" 
                  icon={<MessageSquareIcon className="h-5 w-5" />} 
                  label="Messaging" 
                  active={location === '/messaging'} 
                  notifications={3}
                />
                <NavItem 
                  href="/notifications" 
                  icon={<BellIcon className="h-5 w-5" />} 
                  label="Notifications" 
                  active={location === '/notifications'} 
                  notifications={5}
                />
                <NavItem 
                  href={getProfileLink()} 
                  icon={<UserIcon className="h-5 w-5" />} 
                  label="Me" 
                  active={location === getProfileLink()} 
                />
              </nav>
            ) : (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-neutral-700">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage 
                          src={user?.profilePicture} 
                          alt={getUserDisplayName()} 
                        />
                        <AvatarFallback className="bg-[#0A77FF]/10 text-[#0A77FF]">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{getUserDisplayName()}</h3>
                        <p className="text-xs text-neutral-500">{getUserRoleDisplay()}</p>
                      </div>
                    </div>
                    <Link href={getProfileLink()}>
                      <Button variant="outline" size="sm" className="mt-3 w-full text-[#0A77FF] border-[#0A77FF] hover:bg-[#0A77FF]/10">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="py-2">
                    <NavItem 
                      href="/" 
                      icon={<HomeIcon className="h-5 w-5" />} 
                      label="Home" 
                      active={location === '/'} 
                      isDesktop={false}
                    />
                    <NavItem 
                      href="/network" 
                      icon={<UserPlusIcon className="h-5 w-5" />} 
                      label="My Network" 
                      active={location === '/network'} 
                      isDesktop={false}
                    />
                    <NavItem 
                      href="/internships" 
                      icon={<BriefcaseIcon className="h-5 w-5" />} 
                      label="Internships" 
                      active={location === '/internships'} 
                      isDesktop={false}
                    />
                    <NavItem 
                      href="/messaging" 
                      icon={<MessageSquareIcon className="h-5 w-5" />} 
                      label="Messaging" 
                      active={location === '/messaging'} 
                      notifications={3}
                      isDesktop={false}
                    />
                    <NavItem 
                      href="/notifications" 
                      icon={<BellIcon className="h-5 w-5" />} 
                      label="Notifications" 
                      active={location === '/notifications'} 
                      notifications={5}
                      isDesktop={false}
                    />
                    <NavItem 
                      href={getProfileLink()} 
                      icon={<UserIcon className="h-5 w-5" />} 
                      label="View Profile" 
                      active={location === getProfileLink()} 
                      isDesktop={false}
                    />
                  </div>
                  
                  <div className="mt-2 pt-2 border-t">
                    <div className="px-4 py-3 text-sm font-medium text-neutral-500">
                      Settings & Privacy
                    </div>
                    {getProfileNavigationItems().map((item, index) => (
                      <Link key={index} href={item.href}>
                        <div className="flex items-center space-x-3 px-4 py-3 text-neutral-500 hover:text-neutral-700 cursor-pointer">
                          {item.icon}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      </Link>
                    ))}
                    <div 
                      className="flex items-center space-x-3 px-4 py-3 text-neutral-500 hover:text-neutral-700 cursor-pointer"
                      onClick={logout}
                    >
                      <LogOutIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </>
        )}
        
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 focus-visible:ring-[#0A77FF]">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage 
                    src={user?.profilePicture} 
                    alt={getUserDisplayName()} 
                  />
                  <AvatarFallback className="bg-[#0A77FF]/10 text-[#0A77FF]">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-medium text-neutral-800">{getUserDisplayName()}</span>
                      <span className="text-[11px] text-neutral-500">{getUserRoleDisplay()}</span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-neutral-400" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage 
                      src={user?.profilePicture} 
                      alt={getUserDisplayName()} 
                    />
                    <AvatarFallback className="bg-[#0A77FF]/10 text-[#0A77FF]">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{getUserDisplayName()}</h3>
                    <p className="text-xs text-neutral-500">{getUserRoleDisplay()}</p>
                  </div>
                </div>
                <Link href={getProfileLink()}>
                  <Button variant="outline" size="sm" className="mt-2 w-full text-[#0A77FF] border-[#0A77FF] hover:bg-[#0A77FF]/10">
                    View Profile
                  </Button>
                </Link>
              </div>
              
              <div className="py-1">
                <DropdownMenuLabel className="text-xs text-neutral-500 font-normal">Account</DropdownMenuLabel>
                {getProfileNavigationItems().map((item, index) => (
                  <DropdownMenuItem key={index} className="focus:bg-[#0A77FF]/10 focus:text-[#0A77FF]">
                    <Link href={item.href} className="flex items-center w-full">
                      {item.icon}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <Link href="/login">
                <DropdownMenuItem 
                  onClick={logout} 
                  className="focus:bg-[#0A77FF]/10 focus:text-[#0A77FF]"
                >
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-neutral-700 hover:text-[#0A77FF] hover:bg-[#0A77FF]/5">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
