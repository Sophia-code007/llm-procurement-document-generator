import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { avatarImages } from '@lark-apaas/client-toolkit-lite';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold text-foreground">
            采购文件智能生成系统
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索文件..."
              className="bg-muted/50 pl-9 h-9"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <Avatar className="size-8">
              <AvatarImage src={avatarImages.avatarImg1} alt="用户头像" />
              <AvatarFallback>
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-foreground">张采购</div>
              <div className="text-xs text-muted-foreground">采购专员</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
