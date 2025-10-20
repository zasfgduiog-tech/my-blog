import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
} from '@nextui-org/react';
import { Plus, BookOpen, Edit3, LogOut, User, BookDashed, Sparkles, Home, FolderOpen, Tag } from 'lucide-react';

interface NavBarProps {
  isAuthenticated: boolean;
  userProfile?: {
    name: string;
    avatar?: string;
  };
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
  isAuthenticated,
  userProfile,
  onLogout,
}) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // 默认头像 URL - 可以替换为你自己的图片链接
  const defaultAvatar = "./src/assets/vite.svg";

  // 汉化菜单项，添加图标
  const menuItems = [
    { name: '首页', path: '/', icon: Home },
    { name: '分类', path: '/categories', icon: FolderOpen },
    { name: '标签', path: '/tags', icon: Tag },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Navbar
      isBordered={false}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
      classNames={{
        base: "bg-white/40 backdrop-blur-xl border-b border-white/30 shadow-sm mb-6",
        wrapper: "px-4 sm:px-6",
        item: "data-[active=true]:font-semibold"
      }}
    >
      {/* 移动端菜单切换 */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle 
          className="text-blue-600 hover:text-blue-700 transition-colors"
        />
      </NavbarContent>

      {/* 移动端品牌 Logo */}
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link 
            to="/" 
            className="group flex items-center gap-2 font-bold text-xl"
          >
            <div className="relative">
              <Sparkles 
                size={24} 
                className="text-blue-500 group-hover:text-blue-600 transition-colors drop-shadow-md"
              />
              <div className="absolute inset-0 bg-blue-400 blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-indigo-700 group-hover:to-blue-800 transition-all drop-shadow-sm">
              Away博客
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* 桌面端左侧内容 */}
      <NavbarContent className="hidden sm:flex gap-6" justify="start">
        <NavbarBrand>
          <Link 
            to="/" 
            className="group flex items-center gap-3 font-bold text-2xl"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <Sparkles 
                size={28} 
                className="relative text-blue-500 group-hover:text-blue-600 transition-colors drop-shadow-md"
              />
            </div>
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-indigo-700 group-hover:to-blue-800 transition-all drop-shadow-sm">
              Away博客
            </span>
          </Link>
        </NavbarBrand>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <NavbarItem
              key={item.path}
              isActive={active}
            >
              <Link
                to={item.path}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  active
                    ? 'bg-blue-500/90 text-white shadow-lg shadow-blue-500/30 backdrop-blur-sm'
                    : 'text-blue-700 hover:text-blue-800 hover:bg-white/50 hover:backdrop-blur-sm hover:shadow-md'
                }`}
              >
                <Icon 
                  size={18} 
                  className={active ? '' : 'group-hover:scale-110 transition-transform'}
                />
                <span>{item.name}</span>
                {active && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white/80 rounded-full shadow-sm"></div>
                )}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      {/* 右侧内容 */}
      <NavbarContent justify="end" className="gap-3">
        {isAuthenticated ? (
          <>
            {/* 草稿箱按钮 */}
            <NavbarItem className="hidden md:flex">
              <Button
                as={Link}
                to="/posts/drafts"
                variant="flat"
                startContent={<BookDashed size={18} />}
                className="bg-indigo-500/80 text-white hover:bg-indigo-600/90 hover:scale-105 transition-all duration-300 font-medium shadow-md shadow-indigo-500/30 backdrop-blur-sm"
              >
                草稿箱
              </Button>
            </NavbarItem>
            
            {/* 新建文章按钮 */}
            <NavbarItem>
              <Button
                as={Link}
                to="/posts/new"
                variant="shadow"
                startContent={<Plus size={18} />}
                className="bg-blue-500/90 text-white hover:bg-blue-600/95 hover:scale-105 transition-all duration-300 font-medium shadow-lg shadow-blue-500/40 backdrop-blur-sm"
              >
                <span className="hidden sm:inline">新建文章</span>
                <span className="sm:hidden">新建</span>
              </Button>
            </NavbarItem>
            
            {/* 用户头像下拉菜单 */}
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Badge
                    content=""
                    color="success"
                    shape="circle"
                    placement="bottom-right"
                  >
                    <Avatar
                      isBordered
                      as="button"
                      className="transition-all hover:scale-110 ring-2 ring-white/50 hover:ring-blue-400/70 cursor-pointer shadow-md"
                      src={userProfile?.avatar || defaultAvatar}
                      showFallback
                      fallback={<User size={20} className="text-blue-500" />}
                      imgProps={{
                        referrerPolicy: "no-referrer"
                      }}
                    />
                  </Badge>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="用户菜单"
                  className="w-60"
                  classNames={{
                    base: "bg-white/95 backdrop-blur-xl shadow-xl border border-white/30"
                  }}
                  itemClasses={{
                    base: [
                      "rounded-lg",
                      "transition-all",
                      "data-[hover=true]:bg-blue-50/70",
                    ],
                  }}
                >
                  <DropdownItem
                    key="profile"
                    className="h-14 gap-2"
                    textValue="用户信息"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        src={userProfile?.avatar || defaultAvatar}
                        showFallback
                        fallback={<User size={16} className="text-blue-500" />}
                        className="ring-2 ring-blue-400"
                        imgProps={{
                          referrerPolicy: "no-referrer"
                        }}
                      />
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-900">{userProfile?.name || '用户'}</p>
                        <p className="text-xs text-gray-500">个人主页</p>
                      </div>
                    </div>
                  </DropdownItem>
                  
                  <DropdownItem
                    key="drafts"
                    startContent={
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100">
                        <Edit3 size={16} className="text-indigo-600" />
                      </div>
                    }
                    className="py-3"
                  >
                    <Link to="/posts/drafts" className="w-full block font-medium">
                      我的草稿
                    </Link>
                  </DropdownItem>
                  
                  <DropdownItem
                    key="logout"
                    startContent={
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-100 to-pink-100">
                        <LogOut size={16} className="text-red-600" />
                      </div>
                    }
                    className="text-danger py-3"
                    color="danger"
                    onPress={onLogout}
                  >
                    <span className="font-medium">退出登录</span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <Button 
                as={Link} 
                to="/login" 
                variant="flat"
                className="bg-white/60 hover:bg-white/80 hover:scale-105 transition-all duration-300 font-medium backdrop-blur-sm shadow-sm text-blue-700"
              >
                登录
              </Button>
            </NavbarItem>
            <NavbarItem className="hidden sm:flex">
              <Button 
                as={Link} 
                to="/register" 
                variant="shadow"
                className="bg-blue-500/90 text-white hover:bg-blue-600/95 hover:scale-105 transition-all duration-300 font-medium shadow-lg shadow-blue-500/40 backdrop-blur-sm"
              >
                注册
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      {/* 移动端菜单 */}
      <NavbarMenu className="bg-white/90 backdrop-blur-xl pt-6 border-t border-white/30">
        <div className="flex flex-col gap-3 px-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <NavbarMenuItem key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-medium transition-all duration-300 animate-slide-down ${
                    active
                      ? 'bg-blue-500/90 text-white shadow-lg shadow-blue-500/30'
                      : 'text-blue-700 hover:bg-white/60 hover:text-blue-800 hover:shadow-md'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span className="text-lg">{item.name}</span>
                  {active && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-sm"></div>
                    </div>
                  )}
                </Link>
              </NavbarMenuItem>
            );
          })}
          
          {isAuthenticated && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent my-2"></div>
              <NavbarMenuItem>
                <Link
                  to="/posts/drafts"
                  className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-medium text-blue-700 hover:bg-white/60 hover:text-blue-800 hover:shadow-md transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookDashed size={20} />
                  <span className="text-lg">我的草稿</span>
                </Link>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </Navbar>
  );
};

export default NavBar;