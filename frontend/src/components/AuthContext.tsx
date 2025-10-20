import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  currentUserId: string | null;
  login: (authResponse: any) => void;
  logout: () => void;
  token: string | null;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 解码 JWT Token 获取用户信息
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 从后端获取用户信息
  const fetchUserProfile = useCallback(async (authToken: string) => {
    try {
      console.log('正在获取用户信息...');
      const response = await fetch('/wang/shine1/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('用户信息请求响应状态:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('获取到的用户数据:', userData);
        
        // 确保 ID 被正确提取
        const userId = userData.id || userData.userId;
        
        if (!userId) {
          console.error('后端返回的数据中没有用户 ID:', userData);
          throw new Error('用户数据不完整');
        }

        setUser({
          id: String(userId), // 确保转换为字符串
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
        
        console.log('用户信息设置成功:', { id: userId, name: userData.name });
      } else {
        console.error('获取用户信息失败，状态码:', response.status);
        const errorText = await response.text();
        console.error('错误详情:', errorText);
        throw new Error('获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息时出错:', error);
      // 如果获取失败，尝试从 JWT 中提取基本信息
      const decoded = decodeJWT(authToken);
      if (decoded && decoded.sub) {
        console.warn('从 JWT 中提取用户邮箱:', decoded.sub);
        // 注意：这里没有用户 ID，需要从后端获取
        setUser({
          id: '', // 暂时为空
          name: decoded.sub.split('@')[0],
          email: decoded.sub
        });
      }
    }
  }, []);

  // 从 token 中设置认证信息
  const setAuthFromToken = useCallback(async (authToken: string) => {
    try {
      setToken(authToken);
      setIsAuthenticated(true);
      localStorage.setItem('token', authToken);
      
      // 获取用户详细信息
      await fetchUserProfile(authToken);
    } catch (error) {
      console.error('设置认证信息时出错:', error);
      logout();
    }
  }, [fetchUserProfile]);

  // 初始化认证状态
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log('发现存储的 token，正在恢复认证状态...');
      setAuthFromToken(storedToken);
    }
  }, [setAuthFromToken]);

  // 登录函数
  const login = useCallback((authResponse: any) => {
    console.log('登录响应:', authResponse);
    if (authResponse && authResponse.token) {
      setAuthFromToken(authResponse.token);
    }
  }, [setAuthFromToken]);

  // 登出函数
  const logout = useCallback(() => {
    console.log('用户登出');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    currentUserId: user?.id || null,
    login,
    logout,
    token
  };

  // 调试日志
  useEffect(() => {
    console.log('AuthContext 状态更新:', {
      isAuthenticated,
      user,
      currentUserId: user?.id || null,
      hasToken: !!token
    });
  }, [isAuthenticated, user, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;