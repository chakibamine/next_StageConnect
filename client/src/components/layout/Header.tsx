import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BriefcaseIcon, HomeIcon, UserPlusIcon, MessageSquareIcon, BellIcon, NetworkIcon, MenuIcon, ChevronDownIcon, SearchIcon, UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/ui/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  const NavItem = ({ href, icon, label, active, notifications }: { 
    href: string; 
    icon: React.ReactNode; 
    label: string; 
    active?: boolean;
    notifications?: number;
  }) => (
    <Link href={href}>
      <div className={`flex flex-col items-center p-2 rounded-lg ${active ? 'text-primary-600' : 'text-neutral-500 hover:bg-neutral-100'}`}>
        <div className="relative">
          {icon}
          {notifications && notifications > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {notifications}
            </Badge>
          )}
        </div>
        <span className="text-xs mt-1">{label}</span>
      </div>
    </Link>
  );

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="text-primary-600 text-2xl">
                <BriefcaseIcon />
              </div>
              <span className="font-bold text-xl text-primary-700">StageConnect</span>
            </div>
          </Link>
          
          {isAuthenticated && !isMobile && <SearchBar />}
        </div>
        
        {isAuthenticated && (
          <>
            {!isMobile ? (
              <nav className="flex items-center space-x-1">
                <NavItem 
                  href="/" 
                  icon={<HomeIcon className="h-5 w-5" />} 
                  label="Home" 
                  active={location === '/'} 
                />
                <NavItem 
                  href="/network" 
                  icon={<UserPlusIcon className="h-5 w-5" />} 
                  label="Network" 
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
                  label="Messages" 
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
                  href="/profile" 
                  icon={<UserIcon className="h-5 w-5" />} 
                  label="Profile" 
                  active={location === '/profile'} 
                />
              </nav>
            ) : (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-4 py-4">
                    <Link href="/">
                      <div className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-neutral-100">
                        <HomeIcon className="h-5 w-5" />
                        <span>Home</span>
                      </div>
                    </Link>
                    <Link href="/network">
                      <div className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-neutral-100">
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Network</span>
                      </div>
                    </Link>
                    <Link href="/internships">
                      <div className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-neutral-100">
                        <BriefcaseIcon className="h-5 w-5" />
                        <span>Internships</span>
                      </div>
                    </Link>
                    <Link href="/messaging">
                      <div className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-neutral-100">
                        <MessageSquareIcon className="h-5 w-5" />
                        <span>Messages</span>
                        {3 > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {3}
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <Link href="/notifications">
                      <div className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-neutral-100">
                        <BellIcon className="h-5 w-5" />
                        <span>Notifications</span>
                        {5 > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {5}
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <Link href="/profile">
                      <div className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-neutral-100">
                        <UserIcon className="h-5 w-5" />
                        <span>Profile</span>
                      </div>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </>
        )}
        
        <div className="flex items-center">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
                      alt="User profile" 
                    />
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  {!isMobile && (
                    <>
                      <span className="text-sm font-medium">Alex Johnson</span>
                      <ChevronDownIcon className="h-4 w-4 text-neutral-400" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link href="/profile">View Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/cv-builder">CV Builder</Link>
                </DropdownMenuItem>
                {user?.role === "employer" && (
                  <DropdownMenuItem>
                    <Link href="/employer-dashboard">Employer Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
