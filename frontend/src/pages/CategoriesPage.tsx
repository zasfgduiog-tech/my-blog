import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Chip,
} from "@nextui-org/react";
import { Plus, Edit2, Trash2, FolderOpen, AlertCircle, Shield } from "lucide-react";
import { apiService, Category } from "../services/apiService";
import { useAuth } from "../components/AuthContext";

interface CategoriesPageProps {
  isAuthenticated?: boolean;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ 
  isAuthenticated: propsIsAuthenticated 
}) => {
  const auth = useAuth();
  const isAuthenticated = propsIsAuthenticated !== undefined ? propsIsAuthenticated : auth.isAuthenticated;
  
  // 检查是否是管理员（这里需要根据你的实际实现来判断）
  // 可以从 auth.user 中获取角色信息
  const isAdmin = auth.user?.role === 'ADMIN' || auth.user?.roles?.includes('ADMIN');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      setCategories(response);
      setError(null);
    } catch (err: any) {
      setError("加载分类失败，请稍后重试。");
      console.error('获取分类失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = async () => {
    if (!newCategoryName.trim()) {
      return;
    }

    if (!isAdmin) {
      setPermissionError("您没有权限执行此操作，需要管理员权限");
      return;
    }

    try {
      setIsSubmitting(true);
      setPermissionError(null);
      
      if (editingCategory) {
        await apiService.updateCategory(
          editingCategory.id,
          newCategoryName.trim()
        );
      } else {
        await apiService.createCategory(newCategoryName.trim());
      }
      await fetchCategories();
      handleModalClose();
    } catch (err: any) {
      // 检查是否是权限错误
      if (err.response?.status === 403 || err.response?.status === 401) {
        setPermissionError("您没有权限执行此操作，需要管理员权限");
      } else {
        setError(
          `未能${editingCategory ? "更新" : "创建"}分类，请重试。`
        );
      }
      console.error('操作分类失败:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!isAdmin) {
      alert("您没有权限执行此操作，需要管理员权限");
      return;
    }

    if (
      !window.confirm(
        `您确定要删除分类 "${category.name}" 吗？`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setPermissionError(null);
      await apiService.deleteCategory(category.id);
      await fetchCategories();
    } catch (err: any) {
      // 检查是否是权限错误
      if (err.response?.status === 403 || err.response?.status === 401) {
        setPermissionError("您没有权限执行此操作，需要管理员权限");
      } else {
        setError("删除分类失败，请重试。");
      }
      console.error('删除分类失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setEditingCategory(null);
    setNewCategoryName("");
    setPermissionError(null);
    onClose();
  };

  const openEditModal = (category: Category) => {
    if (!isAdmin) {
      alert("您没有权限编辑分类，需要管理员权限");
      return;
    }
    setEditingCategory(category);
    setNewCategoryName(category.name);
    onOpen();
  };

  const openAddModal = () => {
    if (!isAdmin) {
      alert("您没有权限添加分类，需要管理员权限");
      return;
    }
    setEditingCategory(null);
    setNewCategoryName("");
    onOpen();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            分类管理
          </h1>
          <p className="text-gray-600 mt-2">管理您的博客文章分类</p>
        </div>

        {/* 权限提示 */}
        {isAuthenticated && !isAdmin && (
          <Card className="mb-6 bg-yellow-50 border border-yellow-200 shadow-md animate-slide-down">
            <CardBody className="flex flex-row items-center gap-3 p-4">
              <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">
                  您当前以普通用户身份查看此页面，仅管理员可以管理分类。
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* 主卡片 */}
        <Card className="shadow-2xl border-none bg-white/80 backdrop-blur-lg animate-slide-up">
          <CardHeader className="flex justify-between items-center p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">分类列表</h2>
              <Chip color="primary" variant="flat" size="sm">
                {categories.length} 个分类
              </Chip>
            </div>
            {isAuthenticated && isAdmin && (
              <Button
                color="primary"
                startContent={<Plus size={18} />}
                onClick={openAddModal}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                添加分类
              </Button>
            )}
          </CardHeader>

          <CardBody className="p-6">
            {/* 全局错误提示 */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            )}

            {/* 权限错误提示 */}
            {permissionError && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3 animate-shake">
                <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 font-medium">{permissionError}</p>
                </div>
                <button 
                  onClick={() => setPermissionError(null)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </div>
            )}

            {/* 分类表格 */}
            <Table
              aria-label="分类表格"
              isHeaderSticky
              classNames={{
                wrapper: "max-h-[600px] rounded-xl shadow-sm",
                th: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 font-semibold",
                td: "py-4",
              }}
            >
              <TableHeader>
                <TableColumn>分类名称</TableColumn>
                <TableColumn>文章数量</TableColumn>
                <TableColumn>操作</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={loading}
                loadingContent={
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">正在加载分类...</p>
                  </div>
                }
                emptyContent={
                  <div className="flex flex-col items-center justify-center py-12">
                    <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-600 text-lg font-medium">暂无分类</p>
                    <p className="text-gray-400 text-sm mt-2">创建第一个分类来组织您的文章</p>
                  </div>
                }
              >
                {categories.map((category) => (
                  <TableRow 
                    key={category.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        variant="flat"
                        className={
                          category.postCount && category.postCount > 0
                            ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {category.postCount || 0} 篇文章
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {isAuthenticated && isAdmin ? (
                        <div className="flex gap-2">
                          <Tooltip content="编辑分类">
                            <Button
                              isIconOnly
                              variant="flat"
                              size="sm"
                              onClick={() => openEditModal(category)}
                              className="hover:bg-blue-100 hover:text-blue-600 transition-all"
                            >
                              <Edit2 size={16} />
                            </Button>
                          </Tooltip>
                          <Tooltip
                            content={
                              category.postCount && category.postCount > 0
                                ? "无法删除已有文章的分类"
                                : "删除分类"
                            }
                          >
                            <Button
                              isIconOnly
                              variant="flat"
                              color="danger"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              isDisabled={
                                category?.postCount
                                  ? category.postCount > 0
                                  : false
                              }
                              className="hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </Tooltip>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* 底部提示 */}
        {isAuthenticated && isAdmin && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>提示：删除分类前，请确保该分类下没有文章</p>
          </div>
        )}
      </div>

      {/* 添加/编辑分类模态框 */}
      <Modal 
        isOpen={isOpen} 
        onClose={handleModalClose}
        classNames={{
          base: "bg-white",
          header: "border-b border-gray-200",
          body: "py-6",
          footer: "border-t border-gray-200",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <span>{editingCategory ? "编辑分类" : "添加新分类"}</span>
          </ModalHeader>
          <ModalBody>
            {permissionError && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <Shield className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">{permissionError}</p>
              </div>
            )}
            <Input
              label="分类名称"
              placeholder="请输入分类名称（例如：技术、生活、随笔）"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              isRequired
              classNames={{
                input: "text-base",
                inputWrapper: "border-2 border-gray-200 hover:border-blue-500 focus-within:border-blue-500",
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCategoryName.trim()) {
                  handleAddEdit();
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              分类名称长度应在 2-50 个字符之间
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="flat" 
              onClick={handleModalClose}
              className="hover:bg-gray-100"
            >
              取消
            </Button>
            <Button
              color="primary"
              onClick={handleAddEdit}
              isLoading={isSubmitting}
              isDisabled={!newCategoryName.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {editingCategory ? "更新" : "添加"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CategoriesPage;