# My Blog

一个现代化的全栈博客系统，采用 Spring Boot 后端和 React 前端构建。

## 项目简介

这是一个功能完整的博客平台，支持文章发布、分类管理、标签系统、评论功能和用户认证。

## 技术栈

### 后端
- **框架**: Spring Boot 3.3.0
- **Java 版本**: 21
- **数据库**: MySQL
- **安全**: Spring Security + JWT
- **ORM**: Spring Data JPA
- **API 文档**: SpringDoc OpenAPI
- **工具库**: Lombok, MapStruct

### 前端
- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 库**: NextUI
- **样式**: TailwindCSS
- **路由**: React Router v7
- **富文本编辑器**: Tiptap
- **Markdown 渲染**: Marked
- **HTTP 客户端**: Axios

## 主要功能

- 📝 文章发布与管理
- 🏷️ 分类和标签系统
- 💬 评论功能
- 🔐 用户认证（JWT）
- 🎨 富文本编辑器
- 📱 响应式设计
- 🔒 基于角色的访问控制

## 项目结构

my-blog/  
├── src/                         # 后端源代码  
│   ├── main/java/com/Away/blog/  
│   │   ├── config/              # 配置类  
│   │   ├── controllers/         # REST 控制器  
│   │   ├── domain/              # 领域模型和 DTOs  
│   │   ├── repositories/        # 数据访问层  
│   │   ├── services/            # 业务逻辑层  
│   │   ├── security/            # 安全配置  
│   │   └── mappers/             # 对象映射器  
│   └── test/                    # 测试代码  
├── frontend/                     # 前端源代码  
│   ├── src/                     # React 组件和逻辑  
│   └── public/                  # 静态资源  
└── pom.xml                       # Maven 配置文件  


## 快速开始

### 前置要求

- Java 21
- Maven 3.6+
- Node.js 18+
- MySQL 8.0+

### 后端启动

1. 克隆仓库
```bash
git clone <repository-url>
cd my-blog
```

2. 配置数据库
   - 创建 MySQL 数据库
   - 配置数据库连接信息（在 `application.properties` 或 `application.yml` 中）

3. 运行后端
```bash
./mvnw spring-boot:run
```

后端将在 `http://localhost:8080` 启动

### 前端启动

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

前端将在 `http://localhost:5173` 启动

## API 文档

启动后端后，访问 Swagger UI：
```
http://localhost:8080/swagger-ui.html
```

## 构建部署

### 后端打包
```bash
./mvnw clean package
```

生成的 JAR 文件位于 `target/` 目录

### 前端打包
```bash
cd frontend
npm run build
```

构建产物位于 `frontend/dist/` 目录

## 开发工具

- **Lombok**: 简化 Java 代码
- **MapStruct**: 自动对象映射
- **ESLint**: 代码规范检查
- **TypeScript**: 类型安全

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 联系方式

qq:2915461184
```


- **项目结构**: 基于实际的目录组织（config、controllers、domain、repositories、services、security、mappers） [4](#0-3) 

您可以根据实际需求调整数据库配置、端口号、许可证信息和联系方式等内容。
