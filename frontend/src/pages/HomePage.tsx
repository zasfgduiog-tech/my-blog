import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody,
  Tabs, 
  Tab,
  Button,
  Input,
  Chip,
} from '@nextui-org/react';
import { 
  Search, 
  TrendingUp, 
  Sparkles,
  Tag as TagIcon,
  BookOpen,
  Filter,
} from 'lucide-react';
import { apiService, Post, Category, Tag } from '../services/apiService';
import PostList from '../components/PostList';
// HomePage.tsx
import  MyLogo from '../assets/vite.svg'; // 路径请根据您的实际情况修改
// 如果上面的导入方式报错，可以尝试: import MyLogo from '../assets/logo.svg';

// 导入新的CSS文件
import './HomePage.css';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt,desc");
  const [selectedCategory, setSelectedCategory] = useState<string|undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // --- 性能优化：此 Effect 只在首次加载时获取一次分类和标签 ---
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          apiService.getCategories(),
          apiService.getTags()
        ]);
        setCategories(categoriesResponse);
        setTags(tagsResponse);
      } catch (err) {
        setError('加载分类和标签失败，请稍后重试。');
      }
    };
    fetchStaticData();
  }, []); // 空依赖数组确保只运行一次

  // --- 功能修正：此 Effect 在筛选条件变化时获取文章 ---
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // 注意：searchQuery 暂不传递，仅作UI展示
        const postsResponse = await apiService.getPosts({ 
          categoryId: selectedCategory,
          tagId: selectedTag,
          page: page,
          sort: sortBy,
        });
        setPosts(postsResponse);
        setError(null);
      } catch (err) {
        setError('加载文章内容失败，请稍后重试。');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, sortBy, selectedCategory, selectedTag]); // 移除了 searchQuery

  const handleCategoryChange = (categoryId: string|undefined) => {
    if("all" === categoryId){
      setSelectedCategory(undefined)
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const getTotalPosts = () => {
    // 这里的统计应基于分类，但为简化，暂用当前文章列表长度
    return posts?.length || 0;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedTag) count++;
    if (searchQuery) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* 英雄横幅区域 */}
      <section className="relative overflow-hidden text-white py-20 mb-8 hero-gradient-bg">
        {/* ... (此部分 JSX 保持不变) ... */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          {/* 推荐提供多种格式以增强兼容性 */}
          <source src="/videos/bg.mp4" type="video/mp4" />
          <source src="/videos/bg.webm" type="video/webm" />
        </video>

        <div className="hero-gradient-animated"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float-slow"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center animate-slide-up">
              <div className="relative">
                <img 
                  src={MyLogo} // 如果您是以上面这种方式导入的
                  alt="我的Logo"
                  width="120" 
                  height="120" 
                  className="drop-shadow-2xl animate-logo-glow" 
                />
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-semibold leading-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Away
            </h2>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Sparkles size={16} />
              <span>发现优质内容</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
              欢迎来到我的博客
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
              分享技术见解，记录成长轨迹，探索知识海洋
            </p>
            <div className="flex justify-center gap-4 pt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-black/10 backdrop-blur-md rounded-2xl px-8 py-4 hover:bg-white/20 transition-all transform hover:scale-105">
                <div className="text-3xl font-bold">{getTotalPosts()}</div>
                <div className="text-sm text-blue-200">篇文章</div>
              </div>
              <div className="bg-black/10 backdrop-blur-md rounded-2xl px-8 py-4 hover:bg-white/20 transition-all transform hover:scale-105">
                <div className="text-3xl font-bold">{categories.length}</div>
                <div className="text-sm text-blue-200">个分类</div>
              </div>
              <div className="bg-black/10 backdrop-blur-md rounded-2xl px-8 py-4 hover:bg-white/20 transition-all transform hover:scale-105">
                <div className="text-3xl font-bold">{tags.length}</div>
                <div className="text-sm text-blue-200">个标签</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="wave-animation">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="url(#paint0_linear)" fillOpacity="0.2"/>
            <path d="M0 40L60 46.7C120 53 240 67 360 70C480 73 600 67 720 63.3C840 60 960 60 1080 63.3C1200 67 1320 73 1380 76.7L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V40Z" fill="url(#paint1_linear)" fillOpacity="0.3"/>
            <path d="M0 80L60 76.7C120 73 240 67 360 66.7C480 67 600 73 720 76.7C840 80 960 80 1080 76.7C1200 73 1320 67 1380 63.3L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V80Z" fill="rgb(249, 250, 251)"/>
            <defs><linearGradient id="paint0_linear" x1="720" y1="0" x2="720" y2="120" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient><linearGradient id="paint1_linear" x1="720" y1="40" x2="720" y2="120" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient></defs>
          </svg>
        </div>
      </section>

      {/* 主内容区域 */}
      <div className="max-w-6xl mx-auto px-4 pb-12 space-y-6">
        {/* 搜索和筛选栏 */}
        <Card className="shadow-xl border-none bg-white/90 backdrop-blur-md hover:shadow-2xl transition-all duration-300">
          <CardBody className="gap-4 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Input
                placeholder="搜索文章标题、内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search size={20} className="text-blue-500" />}
                classNames={{
                  input: "text-base",
                  inputWrapper: "h-12 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 border-2 border-transparent focus-within:border-blue-500 transition-all"
                }}
                className="flex-1"
              />
              <Button
                variant={showFilters ? "solid" : "bordered"}
                color={showFilters ? "primary" : "default"}
                startContent={<Filter size={18} />}
                onClick={() => setShowFilters(!showFilters)}
                className="min-w-[120px] hover:scale-105 transition-transform"
              >
                筛选 {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Button>
            </div>
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2 items-center pt-2 animate-slide-down">
                <span className="text-sm text-gray-600 font-medium">已选择:</span>
                {selectedCategory && (
                  <Chip
                    onClose={() => setSelectedCategory(undefined)}
                    variant="flat"
                    color="primary"
                    className="animate-scale-in"
                  >
                    分类: {categories.find(c => c.id === selectedCategory)?.name}
                  </Chip>
                )}
                {selectedTag && (
                  <Chip
                    onClose={() => setSelectedTag(undefined)}
                    variant="flat"
                    color="secondary"
                    className="animate-scale-in"
                  >
                    标签: {tags.find(t => t.id === selectedTag)?.name}
                  </Chip>
                )}
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onClick={() => {
                    setSelectedCategory(undefined);
                    setSelectedTag(undefined);
                    setSearchQuery("");
                  }}
                  className="hover:scale-105 transition-transform"
                >
                  清除全部
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* 分类和标签筛选区域 */}
        {showFilters && (
          <Card className="shadow-xl border-none bg-gradient-to-br from-white to-blue-50 animate-slide-down">
            <CardBody className="gap-6 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  <BookOpen size={20} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">文章分类</h3>
                </div>
                <Tabs 
                  selectedKey={selectedCategory || "all"}
                  onSelectionChange={(key) => handleCategoryChange(key as string)}
                  variant="bordered"
                  color="primary"
                  classNames={{
                    tabList: "gap-3 flex-wrap bg-white/50 p-2 rounded-xl",
                    cursor: "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg",
                    tab: "h-11 px-6 data-[selected=true]:shadow-lg",
                    tabContent: "group-data-[selected=true]:text-white font-medium"
                  }}
                >
                  <Tab 
                    key="all" 
                    title={
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        <span>全部文章</span>
                        <Chip size="sm" variant="flat" className="bg-blue-100 text-blue-700">{getTotalPosts()}</Chip>
                      </div>
                    }
                  />
                  {categories.map((category) => (
                    <Tab 
                      key={category.id} 
                      title={
                        <div className="flex items-center gap-2">
                          <span>{category.name}</span>
                          <Chip size="sm" variant="flat" className="bg-indigo-100 text-indigo-700">{category.postCount}</Chip>
                        </div>
                      }
                    />
                  ))}
                </Tabs>
              </div>
              {tags.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                    <TagIcon size={20} className="text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">热门标签</h3>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {tags.map((tag, index) => (
                      <button
                        key={tag.id}
                        onClick={() => setSelectedTag(selectedTag === tag.id ? undefined : tag.id)}
                        className={`group relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 animate-scale-in ${
                          selectedTag === tag.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                            : 'bg-white text-gray-700 hover:shadow-lg border-2 border-gray-200 hover:border-purple-300'
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center gap-2">
                          <TagIcon size={14} />
                          <span>{tag.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            selectedTag === tag.id 
                              ? 'bg-white/20' 
                              : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                          }`}>
                            {tag.postCount}
                          </span>
                        </div>
                        {selectedTag !== tag.id && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* 文章列表 */}
        <div className="animate-fade-in">
          <PostList
            posts={posts}
            loading={loading}
            error={error}
            page={page}
            sortBy={sortBy}
            onPageChange={setPage}
            onSortChange={setSortBy}
          />
        </div>

        {/* 无内容提示 */}
        {!loading && posts?.length === 0 && (
          <Card className="shadow-lg border-none">
            <CardBody className="py-20 text-center space-y-4">
              <div className="text-6xl">📭</div>
              <h3 className="text-2xl font-bold text-gray-700">暂无文章</h3>
              <p className="text-gray-500">
                {getActiveFiltersCount() > 0 
                  ? '没有找到符合条件的文章，请尝试调整筛选条件'
                  : '还没有发布任何文章，敬请期待...'}
              </p>
              {getActiveFiltersCount() > 0 && (
                <Button
                  color="primary"
                  variant="shadow"
                  onClick={() => {
                    setSelectedCategory(undefined);
                    setSelectedTag(undefined);
                    setSearchQuery("");
                  }}
                >
                  清除筛选条件
                </Button>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {/* 之前在这里的 <style> 标签已被移除。
        所有样式都已移至 HomePage.css 文件。
      */}
    </div>
  );
};

export default HomePage;