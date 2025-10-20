import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useAuth } from '../components/AuthContext'; // 添加这一行
import {
  Card,
  CardBody,
  Chip,
  Button,
  Divider,
  Avatar,
  Tooltip,
  Textarea,
} from '@nextui-org/react';
import { 
  Calendar,
  Clock,
  Tag,
  Edit,
  Trash,
  ArrowLeft,
  Share,
  MessageCircle,
  Heart,
  Bookmark,
  Send,
  Trash2,
} from 'lucide-react';
import { apiService, Post } from '../services/apiService';

// 评论接口定义
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email?: string;
  };
  postId: string;
}

interface PostPageProps {
  isAuthenticated?: boolean;
  currentUserEmail?: string;
}

const PostPage: React.FC<PostPageProps> = ({ 
  isAuthenticated: propsIsAuthenticated,
  currentUserEmail: propsCurrentUserEmail
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 使用 useAuth hook 获取认证信息
  const auth = useAuth();
  
  // 优先使用 props，如果没有则使用 AuthContext
  const isAuthenticated = propsIsAuthenticated !== undefined ? propsIsAuthenticated : auth.isAuthenticated;
  const currentUserEmail = propsCurrentUserEmail || auth.user?.email;
  
  // 调试日志 - 可以在开发时查看
  useEffect(() => {
    console.log('认证状态:', {
      isAuthenticated,
      currentUserEmail,
      authUser: auth.user
    });
  }, [isAuthenticated, currentUserEmail, auth.user]);
  
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // 评论相关状态
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // 获取文章数据
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('需要提供文章ID');
        const fetchedPost = await apiService.getPost(id);
        setPost(fetchedPost);
        setError(null);
        
        // 调试日志
        console.log('文章作者:', fetchedPost.author);
        console.log('当前用户邮箱:', currentUserEmail);
      } catch (err) {
        setError('加载文章失败，请稍后重试。');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, currentUserEmail]);

  // 获取评论列表
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      
      try {
        setLoadingComments(true);
        const response = await fetch(`/wang/shine1/posts/${id}/comments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (err) {
        console.error('获取评论失败:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    if (id) {
      fetchComments();
    }
  }, [id]);

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !id) return;
    
    if (!isAuthenticated) {
      alert('请先登录后再评论');
      navigate('/login');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/wang/shine1/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content: commentContent.trim(),
          postId: id,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([newComment, ...comments]);
        setCommentContent('');
      } else {
        throw new Error('发表评论失败');
      }
    } catch (err) {
      alert('发表评论失败，请重试');
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;

    setDeletingCommentId(commentId);
    try {
      const response = await fetch(`/wang/shine1/posts/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        throw new Error('删除评论失败');
      }
    } catch (err) {
      alert('删除评论失败，请重试');
      console.error(err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  // 配置并渲染 Markdown
  const renderMarkdown = (content: string) => {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
    });

    const rawHTML = marked(content) as string;
    
    return DOMPurify.sanitize(rawHTML, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 's', 'del',
        'a', 'img',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr', 'div', 'span'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
    });
  };

  const handleDelete = async () => {
    if (!post || !window.confirm('您确定要删除这篇文章吗？')) {
      return;
    }

    try {
      setIsDeleting(true);
      await apiService.deletePost(post.id);
      navigate('/');
    } catch (err) {
      setError('删除文章失败，请稍后重试。');
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post?.title,
        text: post?.content.substring(0, 100) + '...',
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板！');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化相对时间
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  // ✅ 使用 email 判断是否是文章作者（大小写容错）
  const isPostOwner = isAuthenticated && post?.author?.email && currentUserEmail &&
    String(post.author.email).toLowerCase() === String(currentUserEmail).toLowerCase();

  // 调试日志
  useEffect(() => {
    if (post && currentUserEmail) {
      console.log('权限检查:', {
        isAuthenticated,
        postAuthorEmail: post.author?.email,
        currentUserEmail,
        isOwner: isPostOwner,
        stringMatch: post.author?.email ? (String(post.author.email).toLowerCase() === String(currentUserEmail).toLowerCase()) : false
      });
    }
  }, [post, currentUserEmail, isAuthenticated, isPostOwner]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="flex gap-4">
                <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
                <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-3 pt-8">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center space-y-4 py-12">
            <div className="text-6xl">😕</div>
            <p className="text-xl font-semibold text-gray-700">{error || '未找到该文章'}</p>
            <Button
              as={Link}
              to="/"
              color="primary"
              variant="shadow"
              startContent={<ArrowLeft size={16} />}
            >
              返回首页
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            as={Link}
            to="/"
            variant="light"
            startContent={<ArrowLeft size={18} />}
            className="hover:bg-gray-100"
          >
            返回
          </Button>
          
          <div className="flex items-center gap-2">
            {/* 只有文章作者才能看到编辑和删除按钮 */}
            {isPostOwner && (
              <>
                <Tooltip content="编辑文章">
                  <Button
                    as={Link}
                    to={`/posts/${post.id}/edit`}
                    isIconOnly
                    variant="light"
                    className="hover:bg-gray-100"
                  >
                    <Edit size={18} />
                  </Button>
                </Tooltip>
                <Tooltip content="删除文章">
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash size={18} />
                  </Button>
                </Tooltip>
              </>
            )}
            <Tooltip content="分享文章">
              <Button
                isIconOnly
                variant="light"
                onClick={handleShare}
                className="hover:bg-gray-100"
              >
                <Share size={18} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* 文章头部 */}
        <header className="mb-12 space-y-6 animate-fade-in">
          {/* 分类标签 */}
          <div className="flex flex-wrap gap-2">
            <Chip 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg"
              size="lg"
            >
              {post.category?.name}
            </Chip>
            {post.tags?.slice(0, 3).map((tag) => (
              <Chip
                key={tag.id}
                variant="flat"
                className="bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 transition-all"
                startContent={<Tag size={14} />}
              >
                {tag.name}
              </Chip>
            ))}
          </div>

          {/* 标题 */}
          <h1 className="text-5xl font-bold leading-tight text-gray-900 animate-slide-up">
            {post.title}
          </h1>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <Avatar
                name={post.author?.name}
                size="md"
                className="ring-2 ring-blue-100"
              />
              <div>
                <p className="font-semibold text-gray-900">{post.author?.name}</p>
                <p className="text-sm text-gray-500">作者</p>
              </div>
            </div>

            <Divider orientation="vertical" className="h-12" />

            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <div>
                <p className="font-medium">{formatDate(post.createdAt)}</p>
                <p className="text-sm text-gray-500">{formatTime(post.createdAt)}</p>
              </div>
            </div>

            <Divider orientation="vertical" className="h-12" />

            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              <div>
                <p className="font-medium">{post.readingTime} 分钟</p>
                <p className="text-sm text-gray-500">阅读时长</p>
              </div>
            </div>
          </div>

          {/* 互动按钮 */}
          <div className="flex gap-3 pt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button
              variant={isLiked ? "solid" : "bordered"}
              color={isLiked ? "danger" : "default"}
              startContent={<Heart size={18} fill={isLiked ? "currentColor" : "none"} />}
              onClick={() => setIsLiked(!isLiked)}
              className="hover:scale-105 transition-transform"
            >
              {isLiked ? '已喜欢' : '喜欢'}
            </Button>
            <Button
              variant={isBookmarked ? "solid" : "bordered"}
              color={isBookmarked ? "warning" : "default"}
              startContent={<Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />}
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="hover:scale-105 transition-transform"
            >
              {isBookmarked ? '已收藏' : '收藏'}
            </Button>
            <Button
              variant="bordered"
              startContent={<MessageCircle size={18} />}
              className="hover:scale-105 transition-transform"
            >
              评论 ({comments.length})
            </Button>
          </div>
        </header>

        <Divider className="my-12" />

        {/* 文章正文 */}
        <div className="relative">
          <div className="fixed top-14 left-0 right-0 h-1 bg-gray-100 z-40">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
              style={{ 
                width: `${Math.min((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%` 
              }}
            />
          </div>
          
          <div 
            className="prose prose-xl max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-20
              prose-h1:text-5xl prose-h1:mb-8 prose-h1:mt-12 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-gray-200
              prose-h2:text-4xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-200
              prose-h3:text-3xl prose-h3:mb-5 prose-h3:mt-8
              prose-h4:text-2xl prose-h4:mb-4 prose-h4:mt-6
              prose-p:text-gray-800 prose-p:leading-loose prose-p:mb-6 prose-p:text-lg
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:font-bold prose-em:italic
              prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-6 prose-blockquote:py-4
              prose-ul:list-disc prose-ul:mb-6 prose-ul:space-y-3
              prose-ol:list-decimal prose-ol:mb-6 prose-ol:space-y-3
              prose-li:text-lg prose-li:leading-relaxed
              prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-8
              animate-fade-in"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        </div>

        {/* 评论区域 */}
        <section className="mt-16" id="comments">
          <Divider className="mb-8" />
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageCircle size={28} className="text-blue-600" />
                评论 <span className="text-blue-600">({comments.length})</span>
              </h2>
            </div>

            {/* 发表评论区域 */}
            <Card className="shadow-lg border-2 border-blue-100">
              <CardBody className="p-6 space-y-4">
                <Textarea
                  placeholder={isAuthenticated ? "写下你的想法..." : "请先登录后发表评论"}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  minRows={4}
                  maxRows={8}
                  disabled={!isAuthenticated}
                  classNames={{
                    input: "text-base",
                    inputWrapper: "bg-gray-50"
                  }}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {commentContent.length} / 500 字符
                  </span>
                  <Button
                    color="primary"
                    startContent={<Send size={18} />}
                    onClick={handleSubmitComment}
                    isLoading={isSubmittingComment}
                    isDisabled={!commentContent.trim() || commentContent.length > 500 || !isAuthenticated}
                    className="hover:scale-105 transition-transform"
                  >
                    发表评论
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* 评论列表 */}
            <div className="space-y-4">
              {loadingComments ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-500">加载评论中...</p>
                </div>
              ) : comments.length === 0 ? (
                <Card className="shadow-md">
                  <CardBody className="py-16 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-xl text-gray-600">暂无评论</p>
                    <p className="text-sm text-gray-500 mt-2">成为第一个评论的人吧！</p>
                  </CardBody>
                </Card>
              ) : (
                comments.map((comment, index) => {
                  // ✅ 判断是否是评论作者（使用 email）
                  const isCommentOwner = isAuthenticated && currentUserEmail && comment.author?.email &&
                    String(comment.author.email).toLowerCase() === String(currentUserEmail).toLowerCase();
                  
                  return (
                    <Card 
                      key={comment.id} 
                      className="shadow-md hover:shadow-xl transition-all animate-slide-up border border-gray-100"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardBody className="p-6">
                        <div className="flex gap-4">
                          <Avatar
                            name={comment.author?.name}
                            size="md"
                            className="flex-shrink-0 ring-2 ring-blue-100"
                          />
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{comment.author?.name}</p>
                                <p className="text-sm text-gray-500">{formatRelativeTime(comment.createdAt)}</p>
                              </div>
                              {/* 只有评论作者才能删除评论 */}
                              {isCommentOwner && (
                                <Tooltip content="删除评论">
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    isLoading={deletingCommentId === comment.id}
                                    className="hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </Tooltip>
                              )}
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* 文章底部 */}
        <footer className="mt-16 space-y-8">
          <Divider />
          
          {/* 标签展示 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Tag size={20} className="text-blue-600" />
              文章标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <Chip
                  key={tag.id}
                  variant="flat"
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all cursor-pointer transform hover:scale-105"
                  startContent={<Tag size={14} />}
                  size="lg"
                >
                  {tag.name}
                </Chip>
              ))}
            </div>
          </div>

          <Divider />

          {/* 作者卡片 */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <Avatar
                  name={post.author?.name}
                  size="lg"
                  className="ring-4 ring-white shadow-lg"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {post.author?.name}
                  </h4>
                  <p className="text-gray-600 mb-3">
                    热爱技术，喜欢分享，持续学习中...
                  </p>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="shadow"
                    className="hover:scale-105 transition-transform"
                  >
                    关注作者
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 相关文章推荐 */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              继续阅读
            </h3>
            <p className="text-gray-600">
              更多精彩内容等你发现...
            </p>
            <Button 
              as={Link} 
              to="/" 
              color="primary" 
              variant="shadow"
              className="mt-4"
            >
              浏览更多文章
            </Button>
          </div>
        </footer>
      </article>

      {/* 自定义样式 */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        pre code {
          display: block;
          padding: 0 !important;
          background: transparent !important;
          color: inherit !important;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        article img {
          animation: fade-in 0.5s ease-out;
        }

        @media (max-width: 768px) {
          .prose table {
            display: block;
            overflow-x:auto;
          }
        }
      `}</style>
    </div>
  );
};

export default PostPage;
