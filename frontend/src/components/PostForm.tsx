// PostForm.tsx - Markdown编辑器版本（修复 onFormChange）
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Chip,
  SelectSection,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
} from "lucide-react";
import { Post, Category, Tag, PostStatus } from "../services/apiService";
import { apiService } from "../services/apiService";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface PostFormProps {
  initialPost?: Post | null;
  onSubmit: (postData: {
    title: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    status: PostStatus;
  }) => Promise<void>;
  onCancel: () => void;
  categories: Category[];
  availableTags: Tag[];
  isSubmitting?: boolean;
  onCreateCategory?: (name: string) => Promise<Category>;
  onCreateTag?: (name: string) => Promise<Tag>;
  onAutoSaveDraft?: (postData: {
    title: string;
    content: string;
    categoryId?: string;
    tagIds?: string[];
    status: PostStatus;
  }) => Promise<void> | void;
  onFormChange?: (isDirty: boolean) => void;
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PostForm: React.FC<PostFormProps> = ({
  initialPost,
  onSubmit,
  onCancel,
  categories,
  availableTags,
  isSubmitting = false,
  onCreateCategory,
  onCreateTag,
  onAutoSaveDraft,
  onFormChange,
}) => {
  // Local state
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [localTags, setLocalTags] = useState<Tag[]>(availableTags);
  useEffect(() => setLocalCategories(categories), [categories]);
  useEffect(() => setLocalTags(availableTags), [availableTags]);

  const [title, setTitle] = useState(initialPost?.title || "");
  const [markdownContent, setMarkdownContent] = useState(initialPost?.content || "");
  const [categoryId, setCategoryId] = useState(initialPost?.category?.id || "");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialPost?.tags || []);
  const [status, setStatus] = useState<PostStatus>(initialPost?.status || PostStatus.DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  // Editor mode: 'edit' or 'preview'
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit');

  // Category and Tag creation
  const [creatingCategoryInline, setCreatingCategoryInline] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);

  // Textarea ref for inserting text
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || "");
      setMarkdownContent(initialPost.content || "");
      setCategoryId(initialPost.category?.id || "");
      setSelectedTags(initialPost.tags || []);
      setStatus(initialPost.status || PostStatus.DRAFT);
      setIsSaved(false);
    }
  }, [initialPost]);

  // Convert markdown to HTML for preview
  const getPreviewHTML = useCallback(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
    });
    
    const rawHTML = marked(markdownContent) as string;
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
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
    });
  }, [markdownContent]);

  // Markdown toolbar functions
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    const newText =
      markdownContent.substring(0, start) +
      before +
      selectedText +
      after +
      markdownContent.substring(end);

    setMarkdownContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertBold = () => insertMarkdown("**", "**");
  const insertItalic = () => insertMarkdown("*", "*");
  const insertHeading1 = () => insertMarkdown("# ", "");
  const insertHeading2 = () => insertMarkdown("## ", "");
  const insertHeading3 = () => insertMarkdown("### ", "");
  const insertUnorderedList = () => insertMarkdown("- ", "");
  const insertOrderedList = () => insertMarkdown("1. ", "");
  const insertCode = () => insertMarkdown("`", "`");
  const insertCodeBlock = () => insertMarkdown("```\n", "\n```");
  const insertLink = () => insertMarkdown("[", "](url)");
  const insertImage = () => insertMarkdown("![alt](", ")");

  // Check if form has unsaved changes
  const isDirty = useCallback(() => {
    if (!initialPost) {
      return title.trim() !== "" || markdownContent.trim() !== "" || categoryId !== "" || selectedTags.length > 0;
    }
    const contentChanged = (initialPost.content || "") !== markdownContent;
    const titleChanged = (initialPost.title || "") !== title;
    const categoryChanged = (initialPost.category?.id || "") !== categoryId;
    const tagsChanged = (initialPost.tags || []).map(t => t.id).sort().join(",") !== selectedTags.map(t => t.id).sort().join(",");
    return contentChanged || titleChanged || categoryChanged || tagsChanged;
  }, [initialPost, title, markdownContent, categoryId, selectedTags]);

  // 【关键修复】通知父组件表单是否有更改
  useEffect(() => {
    const dirty = isDirty();
    console.log('🔄 PostForm isDirty 计算结果:', dirty);
    if (onFormChange) {
      onFormChange(dirty);
    }
  }, [title, markdownContent, categoryId, selectedTags, isDirty, onFormChange]);

  // Category and Tag creation helpers
  const createCategoryOnServer = useCallback(async (name: string): Promise<Category> => {
    if (onCreateCategory) {
      return await onCreateCategory(name);
    }
    if ((apiService as any)?.createCategory) {
      return await (apiService as any).createCategory(name);
    }
    throw new Error("无法创建分类：未提供 onCreateCategory 且 apiService.createCategory 不可用");
  }, [onCreateCategory]);

  const createTagOnServer = useCallback(async (name: string): Promise<Tag> => {
    if (onCreateTag) {
      return await onCreateTag(name);
    }
    if ((apiService as any)?.createTag) {
      return await (apiService as any).createTag(name);
    }
    if ((apiService as any)?.createTags) {
      const res = await (apiService as any).createTags([name]);
      if (Array.isArray(res) && res.length > 0) return res[0];
    }
    throw new Error("无法创建标签：未提供 onCreateTag 且 apiService.createTag/createTags 不可用");
  }, [onCreateTag]);

  const resolveNewResourcesBeforeSave = useCallback(async (): Promise<{ categoryId?: string; tagIds: string[] }> => {
    let resolvedCategoryId: string | undefined = undefined;
    
    if (categoryId) {
      if (uuidRegex.test(categoryId)) {
        resolvedCategoryId = categoryId;
      } else {
        const found = localCategories.find(c => c.id === categoryId);
        const name = found?.name || newCategoryName?.trim();
        if (!name) {
          throw new Error("发现未持久化的分类，但无法确定分类名称，请先创建分类或选择已有分类。");
        }
        const created = await createCategoryOnServer(name);
        setLocalCategories(prev => [created, ...prev.filter(p => p.id !== created.id)]);
        resolvedCategoryId = created.id;
        setCategoryId(created.id);
      }
    }

    const resolvedTagIds: string[] = [];
    for (const t of selectedTags) {
      if (uuidRegex.test(t.id)) {
        resolvedTagIds.push(t.id);
        continue;
      }
      const found = localTags.find(tag => tag.id === t.id);
      const name = found?.name || t.name;
      if (!name) {
        throw new Error(`发现未持久化的标签（id=${t.id}），但无法确定名称，请先创建标签或选择已有标签。`);
      }
      const createdTag = await createTagOnServer(name);
      setLocalTags(prev => [createdTag, ...prev.filter(x => x.id !== createdTag.id)]);
      setSelectedTags(prev => prev.map(x => x.id === t.id ? createdTag : x));
      resolvedTagIds.push(createdTag.id);
    }

    return { categoryId: resolvedCategoryId, tagIds: resolvedTagIds };
  }, [categoryId, localCategories, newCategoryName, createCategoryOnServer, selectedTags, localTags, createTagOnServer]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "标题是必填项";
    if (!markdownContent.trim()) newErrors.content = "内容是必填项";
    if (!categoryId) newErrors.category = "分类是必填项";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setLocalSubmitting(true);
    try {
      const resolved = await resolveNewResourcesBeforeSave();
      const payload = {
        title: title.trim(),
        content: markdownContent,
        categoryId: resolved.categoryId || categoryId,
        tagIds: resolved.tagIds.length > 0 ? resolved.tagIds : selectedTags.map(t => t.id),
        status,
      };
      await onSubmit(payload);
      setIsSaved(true);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleCreateCategoryInline = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setIsCreatingCategory(true);
    try {
      const created = await createCategoryOnServer(name);
      setLocalCategories(prev => [created, ...prev.filter(x => x.id !== created.id)]);
      setCategoryId(created.id);
      setCreatingCategoryInline(false);
      setNewCategoryName("");
    } catch (err: any) {
      console.error(err);
      alert(`创建分类失败：${err?.message || err}`);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCreateTagQuick = async (value?: string) => {
    const name = (value ?? newTagInput).trim();
    if (!name) return;
    setIsCreatingTag(true);
    try {
      const created = await createTagOnServer(name);
      setLocalTags(prev => [created, ...prev.filter(x => x.id !== created.id)]);
      setSelectedTags(prev => prev.some(t => t.id === created.id) ? prev : [...prev, created]);
      setNewTagInput("");
    } catch (err: any) {
      console.error(err);
      alert(`创建标签失败：${err?.message || err}`);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleAddExistingTag = (tag: Tag) => {
    if (!selectedTags.some(t => t.id === tag.id) && selectedTags.length < 10) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleRemoveTag = (tag: Tag) => setSelectedTags(prev => prev.filter(t => t.id !== tag.id));

  const suggestedTags = useMemo(() => localTags.filter(tag => !selectedTags.some(t => t.id === tag.id)).slice(0, 6), [localTags, selectedTags]);

  // Auto-save on page hide
  useEffect(() => {
    const handlePageHide = () => {
      if (!isSaved && isDirty()) {
        const safeCategoryId = categoryId && uuidRegex.test(categoryId) ? categoryId : undefined;
        const safeTagIds = selectedTags.map(t => t.id).filter(id => uuidRegex.test(id));
        if (onAutoSaveDraft) {
          try {
            onAutoSaveDraft({
              title: title.trim(),
              content: markdownContent,
              categoryId: safeCategoryId,
              tagIds: safeTagIds,
              status: PostStatus.DRAFT,
            });
          } catch {
            // ignore
          }
        }
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [isSaved, isDirty, categoryId, selectedTags, onAutoSaveDraft, title, markdownContent]);

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
        <Card>
          <CardBody className="space-y-4">
            {/* 标题输入 */}
            <div className="space-y-2">
              <Input 
                label="文章标题" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                isInvalid={!!errors.title} 
                errorMessage={errors.title} 
                isRequired 
              />
            </div>

            {/* Markdown 编辑器 */}
            <div className="space-y-2">
              {/* 工具栏 */}
              <div className="bg-gradient-to-r from-default-100 to-default-50 p-3 rounded-xl shadow-sm">
                <div className="flex gap-2 flex-wrap items-center justify-between">
                  {/* 左侧编辑工具 */}
                  <div className="flex gap-2 flex-wrap items-center">
                    <div className="flex gap-1 bg-white rounded-lg p-1">
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertHeading1}
                        title="一级标题"
                        className="hover:bg-primary hover:text-white"
                      >
                        <Heading1 size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertHeading2}
                        title="二级标题"
                        className="hover:bg-primary hover:text-white"
                      >
                        <Heading2 size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertHeading3}
                        title="三级标题"
                        className="hover:bg-primary hover:text-white"
                      >
                        <Heading3 size={16} />
                      </Button>
                    </div>

                    <div className="flex gap-1 bg-white rounded-lg p-1">
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertBold}
                        title="粗体"
                        className="hover:bg-primary hover:text-white"
                      >
                        <Bold size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertItalic}
                        title="斜体"
                        className="hover:bg-primary hover:text-white"
                      >
                        <Italic size={16} />
                      </Button>
                    </div>

                    <div className="flex gap-1 bg-white rounded-lg p-1">
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertUnorderedList}
                        title="无序列表"
                        className="hover:bg-primary hover:text-white"
                      >
                        <List size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertOrderedList}
                        title="有序列表"
                        className="hover:bg-primary hover:text-white"
                      >
                        <ListOrdered size={16} />
                      </Button>
                    </div>

                    <div className="flex gap-1 bg-white rounded-lg p-1">
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertCode}
                        title="行内代码"
                        className="hover:bg-primary hover:text-white"
                      >
                        <Code size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="flat" 
                        onClick={insertCodeBlock}
                        title="代码块"
                        className="hover:bg-primary hover:text-white text-xs px-2"
                      >
                        ```
                      </Button>
                    </div>

                    <div className="flex gap-1 bg-white rounded-lg p-1">
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertLink}
                        title="插入链接"
                        className="hover:bg-primary hover:text-white"
                      >
                        <LinkIcon size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="flat" 
                        onClick={insertImage}
                        title="插入图片"
                        className="hover:bg-primary hover:text-white"
                      >
                        <ImageIcon size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* 右侧视图切换 */}
                  <Tabs 
                    selectedKey={editorMode} 
                    onSelectionChange={(key) => setEditorMode(key as 'edit' | 'preview' | 'split')}
                    size="sm"
                    variant="solid"
                  >
                    <Tab key="edit" title={<span className="flex items-center gap-1"><Edit3 size={14} />编辑</span>} />
                    <Tab key="preview" title={<span className="flex items-center gap-1"><Eye size={14} />预览</span>} />
                    <Tab key="split" title="分屏" />
                  </Tabs>
                </div>
              </div>

              {/* 编辑器内容区域 */}
              <div className={`grid ${editorMode === 'split' ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}>
                {/* 编辑模式 */}
                {(editorMode === 'edit' || editorMode === 'split') && (
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={markdownContent}
                      onChange={(e) => setMarkdownContent(e.target.value)}
                      className="w-full min-h-[400px] p-4 border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono text-sm resize-y"
                      placeholder="在这里使用 Markdown 语法编写文章..."
                    />
                    {editorMode === 'edit' && (
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                        {markdownContent.length} 字符
                      </div>
                    )}
                  </div>
                )}

                {/* 预览模式 */}
                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className="border rounded-lg p-4 min-h-[400px] bg-white overflow-auto">
                    <div 
                      className="prose max-w-none prose-headings:font-bold prose-a:text-blue-600"
                      dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
                    />
                    {!markdownContent && (
                      <div className="text-center text-gray-400 py-20">
                        预览区域 - 开始编写内容后将在此显示
                      </div>
                    )}
                  </div>
                )}
              </div>

              {errors.content && <div className="text-danger text-sm">{errors.content}</div>}

              {/* Markdown 语法提示 */}
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-primary">Markdown 语法提示</summary>
                <div className="mt-2 p-3 bg-gray-50 rounded space-y-1">
                  <p><code># 标题1</code> → 一级标题</p>
                  <p><code>## 标题2</code> → 二级标题</p>
                  <p><code>**粗体**</code> → <strong>粗体</strong></p>
                  <p><code>*斜体*</code> → <em>斜体</em></p>
                  <p><code>[链接](url)</code> → 超链接</p>
                  <p><code>![图片](url)</code> → 图片</p>
                  <p><code>`代码`</code> → 行内代码</p>
                  <p><code>- 列表项</code> → 无序列表</p>
                  <p><code>1. 列表项</code> → 有序列表</p>
                </div>
              </details>
            </div>

            {/* 分类选择 */}
            <div className="space-y-2">
              <Select
                label="分类"
                placeholder="选择一个分类"
                selectedKeys={categoryId ? new Set([categoryId]) : new Set()}
                onSelectionChange={(keys) => {
                  const arr = Array.from(keys as Set<string>); 
                  const k = arr[0] || "";
                  if (k === "__create__") {
                    setCreatingCategoryInline(true);
                    setCategoryId("");
                  } else {
                    setCategoryId(k);
                    setCreatingCategoryInline(false);
                  }
                }}
                isInvalid={!!errors.category}
                errorMessage={errors.category}
                isRequired
              >
                <SelectItem key="__create__" value="__create__">+ 新建分类</SelectItem>
                {localCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </Select>

              {creatingCategoryInline && (
                <div className="flex gap-2 items-center mt-2">
                  <Input 
                    placeholder="新分类名称" 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)} 
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCreateCategoryInline} 
                    isDisabled={!newCategoryName.trim()} 
                    isLoading={isCreatingCategory}
                  >
                    创建并选择
                  </Button>
                  <Button 
                    size="sm" 
                    variant="flat" 
                    onClick={() => { setCreatingCategoryInline(false); setNewCategoryName(""); }}
                  >
                    取消
                  </Button>
                </div>
              )}
            </div>

            {/* 标签选择 */}
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Select label="添加标签" selectedKeys={new Set()} onSelectionChange={() => { }}>
                  <SelectSection title="建议标签">
                    {suggestedTags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id} onClick={() => handleAddExistingTag(tag)}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectSection>
                </Select>

                <Input 
                  placeholder="输入新标签，回车添加" 
                  value={newTagInput} 
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" || e.key === "," || e.key === "，") {
                      e.preventDefault();
                      await handleCreateTagQuick();
                    }
                  }} 
                />
                <Button size="sm" onClick={() => handleCreateTagQuick()} isDisabled={!newTagInput.trim()}>
                  添加
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map(t => (
                  <Chip key={t.id} onClose={() => handleRemoveTag(t)} variant="flat">
                    {t.name}
                  </Chip>
                ))}
              </div>
            </div>

            {/* 状态选择 */}
            <div className="space-y-2">
              <Select 
                label="状态" 
                selectedKeys={new Set([status])} 
                onSelectionChange={(keys) => {
                  const arr = Array.from(keys as Set<string>); 
                  const v = arr[0] as PostStatus; 
                  setStatus(v);
                }}
              >
                <SelectItem key={PostStatus.DRAFT} value={PostStatus.DRAFT}>草稿</SelectItem>
                <SelectItem key={PostStatus.PUBLISHED} value={PostStatus.PUBLISHED}>发布</SelectItem>
              </Select>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                color="danger" 
                variant="flat" 
                onClick={onCancel} 
                disabled={isSubmitting || localSubmitting}
              >
                取消
              </Button>
              <Button 
                color="primary" 
                type="submit" 
                isLoading={isSubmitting || localSubmitting}
              >
                {initialPost ? "更新文章" : "创建文章"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
      
      {/* 创建标签Modal */}
      <Modal isOpen={showCreateTagModal} onClose={() => setShowCreateTagModal(false)}>
        <ModalContent>
          <ModalHeader>新建标签</ModalHeader>
          <ModalBody>
            <Input 
              value={newTagInput} 
              onChange={(e) => setNewTagInput(e.target.value)} 
              placeholder="标签名" 
              onKeyDown={async (e) => {
                if (e.key === "Enter") { 
                  e.preventDefault(); 
                  await handleCreateTagQuick(); 
                  setShowCreateTagModal(false); 
                }
              }} 
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={() => setShowCreateTagModal(false)}>取消</Button>
            <Button 
              onClick={async () => { 
                await handleCreateTagQuick(); 
                setShowCreateTagModal(false); 
              }} 
              isLoading={isCreatingTag} 
              isDisabled={!newTagInput.trim()}
            >
              创建并添加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PostForm;