import { Link, useLocation } from "wouter";
import { HomeIcon, UserPlusIcon, BriefcaseIcon, MessageSquareIcon, BellIcon, UserIcon, FileTextIcon, SettingsIcon } from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();

  const MenuItem = ({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
          isActive 
            ? 'bg-primary-50 text-primary-600' 
            : 'text-neutral-600 hover:bg-neutral-100'
        }`}>
          {icon}
          <span className="font-medium">{label}</span>
        </a>
      </Link>
    );
  };

  return (
    <div className="w-64 h-full bg-white border-r border-neutral-200 p-4">
      <div className="space-y-1">
        <MenuItem 
          icon={<HomeIcon className="h-5 w-5" />} 
          label="Home" 
          href="/" 
        />
        <MenuItem 
          icon={<BriefcaseIcon className="h-5 w-5" />} 
          label="Internships" 
          href="/internships" 
        />
        <MenuItem 
          icon={<UserPlusIcon className="h-5 w-5" />} 
          label="Network" 
          href="/network" 
        />
        <MenuItem 
          icon={<MessageSquareIcon className="h-5 w-5" />} 
          label="Messaging" 
          href="/messaging" 
        />
        <MenuItem 
          icon={<BellIcon className="h-5 w-5" />} 
          label="Notifications" 
          href="/notifications" 
        />
        <MenuItem 
          icon={<UserIcon className="h-5 w-5" />} 
          label="Profile" 
          href="/profile" 
        />
        <MenuItem 
          icon={<FileTextIcon className="h-5 w-5" />} 
          label="CV Builder" 
          href="/cv-builder" 
        />
        <MenuItem 
          icon={<SettingsIcon className="h-5 w-5" />} 
          label="Settings" 
          href="/settings" 
        />
      </div>
    </div>
  );
};

export default Sidebar;
