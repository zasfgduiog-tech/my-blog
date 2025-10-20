import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardFooter, Chip, Avatar, Divider, CardHeader } from '@nextui-org/react';
import { Post } from '../services/apiService';
import { Calendar, Tag as TagIcon } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface PostListProps {
  posts: Post[] | null;
  loading: boolean;
  error: string | null;
  page: number;
  sortBy: string;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string) => void;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  marked.setOptions({ breaks: true });

  const createMarkdownExcerpt = (content: string, maxLength: number = 160) => {
    const rawHtml = marked.parse(content) as string;
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 's', 'br', 'code'],
      ALLOWED_ATTR: []
    });

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedHtml;
    let truncatedHtml = '';
    let currentLength = 0;

    for (const node of Array.from(tempDiv.childNodes)) {
      const nodeTextLength = node.textContent?.length || 0;
      if (currentLength + nodeTextLength > maxLength) {
        const remainingLength = maxLength - currentLength;
        const slicedText = node.textContent?.slice(0, remainingLength) || '';
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const clonedNode = element.cloneNode(false) as HTMLElement;
          clonedNode.textContent = slicedText + '...';
          truncatedHtml += clonedNode.outerHTML;
        } else {
          truncatedHtml += slicedText + '...';
        }
        break;
      } else {
        truncatedHtml += (node as HTMLElement).outerHTML || node.textContent || '';
        currentLength += nodeTextLength;
      }
    }

    return { __html: truncatedHtml || '<p>暂无摘要...</p>' };
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const navToPostPage = (id: string) => navigate(`/posts/${id}`);

  if (error) {
    return (
      <Card className="p-4 bg-red-100/80 border border-red-200 text-red-600 font-medium shadow-lg backdrop-blur-sm">
        <CardBody>{error}</CardBody>
      </Card>
    );
  }

  // skeleton loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="w-full p-6 space-y-4 animate-pulse bg-white/70 backdrop-blur-md rounded-2xl">
            <div className="h-6 w-3/4 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded-lg"></div>
            <div className="flex justify-between pt-3">
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts?.map((post, index) => (
        <Card
          key={post.id}
          isPressable
          onPress={() => navToPostPage(post.id)}
          className={`
            group w-full 
            rounded-2xl border border-transparent 
            bg-white/80 backdrop-blur-xl 
            hover:border-indigo-500/60 hover:shadow-2xl 
            hover:-translate-y-2 transition-all duration-500
            animate-fade-in
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="flex flex-col gap-3 p-6">
            <Chip
              size="sm"
              variant="flat"
              className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-semibold px-3 py-1"
            >
              {post.category?.name || '未分类'}
            </Chip>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 leading-tight">
              {post.title}
            </h2>
          </CardHeader>

          <CardBody className="px-6 pt-0 pb-4">
            <div
              className="prose prose-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={createMarkdownExcerpt(post.content)}
            />
          </CardBody>

          <CardFooter className="flex flex-col items-start gap-4 p-6 pt-0 border-t border-gray-100/70">
            <div className="flex flex-wrap gap-2">
              {post.tags?.slice(0, 3).map((tag) => (
                <Chip
                  key={tag.id}
                  size="sm"
                  variant="flat"
                  startContent={<TagIcon size={14} />}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700"
                >
                  {tag.name}
                </Chip>
              ))}
            </div>

            <div className="w-full flex justify-between items-center text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-2">
                <Avatar
                  name={post.author?.name || 'A'}
                  size="sm"
                  className="shadow-md border border-gray-200"
                />
                <span className="font-medium text-gray-700">{post.author?.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-indigo-500" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </CardFooter>

          {/* 柔光渐变边框效果 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-700"></div>
        </Card>
      ))}
    </div>
  );
};

export default PostList;
