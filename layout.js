import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Brain, BarChart3, Trophy, Settings, Home, PlayCircle, User as UserIcon, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Generate Quiz",
    url: createPageUrl("QuizSetup"),
    icon: PlayCircle,
  },
  {
    title: "My Quizzes",
    url: createPageUrl("Progress"),
    icon: BarChart3,
  },
  {
    title: "Achievements",
    url: createPageUrl("Achievements"),
    icon: Trophy,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-black">
      <SidebarProvider>
        <div className="flex w-full">
          <Sidebar className="border-r border-slate-700/50 backdrop-blur-sm bg-slate-900/95">
            <SidebarHeader className="border-b border-slate-700/50 p-6 bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Qurio AI
                  </h2>
                  <p className="text-xs text-slate-400">Smart Learning Platform</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-4 bg-slate-900/95">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Learning Hub
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`rounded-xl transition-all duration-200 ${
                            location.pathname === item.url 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/70 hover:shadow-md'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-700/50 p-4 bg-slate-800/80">
              <div className="flex items-center gap-2">
                <Link 
                  to={createPageUrl("QuizSetup")} 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </Link>
                <Link 
                  to={createPageUrl("Profile")} 
                  className="bg-slate-700/70 hover:bg-slate-600/70 text-slate-300 hover:text-white rounded-lg p-1 transition-all duration-200 flex items-center justify-center border border-slate-600/50"
                  title="Profile"
                >
                  <Avatar className="w-8 h-8 border-2 border-slate-600/50">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                          {user?.full_name?.charAt(0) || <UserIcon className="w-4 h-4" />}
                      </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1">
            <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-700 p-2 rounded-lg transition-colors duration-200 text-slate-300" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Qurio AI
                </h1>
              </div>
            </header>
            <div className="p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}