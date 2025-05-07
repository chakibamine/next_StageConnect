import { Link } from "wouter";
import { SearchIcon, FileTextIcon, UserPlusIcon, MessageSquareIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuickActions = () => {
  const actions = [
    {
      title: "Find Internships",
      icon: <SearchIcon className="h-6 w-6" />,
      href: "/internships",
      color: "bg-primary-100 text-primary-600",
    },
    {
      title: "Update CV",
      icon: <FileTextIcon className="h-6 w-6" />,
      href: "/cv-builder",
      color: "bg-grseen-100 text-green-600",
    },
    {
      title: "Network",
      icon: <UserPlusIcon className="h-6 w-6" />,
      href: "/network",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Messages",
      icon: <MessageSquareIcon className="h-6 w-6" />,
      href: "/messaging",
      color: "bg-neutral-100 text-neutral-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-2`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-center">{action.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
