import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { ArrowLeft, Save, X, AlertTriangle } from 'lucide-react';
import { apiService, Post, Category, Tag, PostStatus } from '../services/apiService';
import PostForm from '../components/PostForm';

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  // 调试：监听 isDirty 变化
  useEffect(() => {
    console.log('🔍 isDirty 状态变化:', isDirty);
  }, [isDirty]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, tagsResponse] = await Promise.all([
          apiService.getCategories(),
          apiService.getTags()
        ]);

        setCategories(categoriesResponse);
        setTags(tagsResponse);

        if (id) {
          const postResponse = await apiService.getPost(id);
          setPost(postResponse);
        }

        setError(null);
      } catch (err) {
        setError('加载必要数据失败，请稍后重试。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 拦截浏览器关闭/刷新
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('🚪 beforeunload 触发, isDirty:', isDirty);
      if (isDirty && !isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 拦截浏览器后退按钮
  useEffect(() => {
    if (!isDirty) return;

    console.log('📌 注册 popstate 监听器');

    const handlePopState = (e: PopStateEvent) => {
      console.log('⬅️ popstate 触发');
      if (!isNavigatingRef.current) {
        e.preventDefault();
        window.history.pushState(null, '', location.pathname);
        setShowLeaveModal(true);
        setNextLocation('back');
      }
    };

    window.history.pushState(null, '', location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      console.log('📌 移除 popstate 监听器');
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, location.pathname]);

  const handleSubmit = async (postData: {
    title: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    status: PostStatus;
  }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (id) {
        await apiService.updatePost(id, {
          ...postData,
          id
        });
      } else {
        await apiService.createPost(postData);
      }

      setIsDirty(false);
      isNavigatingRef.current = true;
      
      setTimeout(() => {
        navigate('/');
      }, 50);
    } catch (err) {
      setError('保存文章失败，请重试。');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ 取消按钮点击, isDirty:', isDirty);
    if (isDirty) {
      const destination = id ? `/posts/${id}` : '/';
      setNextLocation(destination);
      setShowLeaveModal(true);
      console.log('👉 显示离开弹窗');
    } else {
      navigate(id ? `/posts/${id}` : '/');
    }
  };

  const handleForceLeave = () => {
    console.log('💀 强制离开');
    setIsDirty(false);
    isNavigatingRef.current = true;
    setShowLeaveModal(false);
    
    setTimeout(() => {
      if (nextLocation === 'back') {
        window.history.back();
      } else if (nextLocation) {
        navigate(nextLocation);
      }
    }, 50);
  };

  const handleCancelLeave = () => {
    console.log('🔙 取消离开');
    setShowLeaveModal(false);
    setNextLocation(null);
  };

  const handleGoSave = () => {
    console.log('💾 去保存');
    setShowLeaveModal(false);
    setNextLocation(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.classList.add('ring-4', 'ring-primary', 'ring-opacity-50');
      setTimeout(() => {
        submitButton.classList.remove('ring-4', 'ring-primary', 'ring-opacity-50');
      }, 2000);
    }
  };

  // 接收来自 PostForm 的脏状态变化
  const handleFormChange = (dirty: boolean) => {
    console.log('📝 PostForm 报告状态变化:', dirty);
    setIsDirty(dirty);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="w-full animate-pulse shadow-lg">
          <CardBody className="p-8">
            <div className="h-8 bg-default-200 rounded-lg w-3/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-default-200 rounded w-full"></div>
              <div className="h-4 bg-default-200 rounded w-full"></div>
              <div className="h-4 bg-default-200 rounded w-2/3"></div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 调试信息 */}
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs font-mono">
          <div>isDirty: <strong className={isDirty ? 'text-red-600' : 'text-green-600'}>{String(isDirty)}</strong></div>
          <div>showLeaveModal: {String(showLeaveModal)}</div>
        </div>

        <Card className="w-full shadow-xl">
          <CardHeader className="flex justify-between items-center border-b border-divider px-6 py-4 bg-gradient-to-r from-default-50 to-default-100">
            <div className="flex items-center gap-4">
              <Button
                variant="flat"
                startContent={<ArrowLeft size={18} />}
                onClick={handleCancel}
                className="hover:bg-default-200 transition-all"
              >
                返回
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {id ? '编辑文章' : '创建新文章'}
                </h1>
                {isDirty && (
                  <p className="text-xs text-warning-600 mt-1 flex items-center gap-1.5 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-warning-500"></span>
                    </span>
                    有未保存的更改
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-6">
            {error && (
              <div className="mb-6 p-4 text-danger-600 bg-danger-50 border-l-4 border-danger-400 rounded-lg flex items-start gap-3 shadow-sm">
                <X size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">操作失败</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <PostForm
              initialPost={post}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              categories={categories}
              availableTags={tags}
              isSubmitting={isSubmitting}
              onFormChange={handleFormChange}
            />
          </CardBody>
        </Card>
      </div>

      {/* 离开确认弹窗 */}
      <Modal 
        isOpen={showLeaveModal} 
        onClose={handleCancelLeave}
        backdrop="blur"
        size="md"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          wrapper: "items-center"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-warning-100 rounded-xl">
                <AlertTriangle size={24} className="text-warning-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">确认离开？</h3>
                <p className="text-sm text-default-500 font-normal mt-0.5">您有未保存的更改</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-4">
            <p className="text-default-700 leading-relaxed">
              您的文章内容尚未保存。如果现在离开，所有更改都将<strong className="text-danger-600">永久丢失</strong>。
            </p>
            <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-700 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>
                  <strong>建议：</strong>点击"去保存"按钮保存当前内容，然后再离开页面
                </span>
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="flex gap-2 pt-2">
            <Button 
              variant="light" 
              onClick={handleCancelLeave}
              className="flex-1"
            >
              取消
            </Button>
            <Button 
              color="danger" 
              variant="flat"
              onClick={handleForceLeave}
              className="flex-1"
            >
              残忍离开
            </Button>
            <Button 
              color="primary" 
              startContent={<Save size={16} />}
              onClick={handleGoSave}
              className="flex-1 font-semibold"
            >
              去保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditPostPage;