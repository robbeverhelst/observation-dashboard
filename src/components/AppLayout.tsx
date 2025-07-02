'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Bird,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    {
      name: 'Observations',
      href: '/observations',
      icon: MapPin,
      current: pathname.startsWith('/observations'),
    },
    {
      name: 'Species',
      href: '/species',
      icon: Bird,
      current: pathname.startsWith('/species'),
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: User,
      current: pathname.startsWith('/dashboard'),
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col border-r bg-muted/20 transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg">
                Observation Explorer
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-auto"
          >
            {isSidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  item.current
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}

          {isSidebarOpen && (
            <>
              {/* Divider */}
              <div className="border-t my-4" />

              {/* Quick Search */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Quick Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search..." className="pl-10 h-8" />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Species Groups
                </label>
                <div className="space-y-1">
                  {['Birds', 'Plants', 'Mammals', 'Insects'].map((group) => (
                    <label
                      key={group}
                      className="flex items-center gap-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-muted-foreground"
                      />
                      <span>{group}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Location
                </label>
                <Badge variant="outline" className="text-xs">
                  📍 All Areas
                </Badge>
              </div>
            </>
          )}
        </nav>

        {/* User Area */}
        <div className="border-t p-4 space-y-2">
          {isSidebarOpen ? (
            <>
              <div className="text-sm font-medium">Guest User</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
