import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService, LoginRequest, RegisterRequest } from '../services/ApiService';
import { TokenService, UserData, setTokensClearedCallback } from '../services/TokenService';

// Interface para el resultado de autenticación (compatible con la versión anterior)
interface AuthResult {
  error?: boolean;
  message?: string;
  token?: string;
}

// Interface para el estado de autenticación (compatible con la versión anterior)
interface AuthState {
  token: string | null;
  authenticated: boolean;
}

// Interface para el contexto (compatible con la versión anterior pero extendida)
interface AuthContextProps {
  authState: AuthState;
  loading: boolean;
  user: UserData | null;
  onRegister: (name: string, email: string, pass: string) => Promise<AuthResult>;
  onLogin: (email: string, pass: string) => Promise<AuthResult>;
  onLogout: () => Promise<void>;
  // Nuevas funciones
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>; // Agregar método público
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    authenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuthStatus();
    
    // Configurar callback para cuando se limpien los tokens
    setTokensClearedCallback(() => {
      console.log('🔄 Tokens cleared, updating auth state...');
      setAuthState({
        token: null,
        authenticated: false
      });
      setUser(null);
      setLoading(false);
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Verificar si hay tokens válidos y si el usuario está autenticado
      const isAuth = await ApiService.isAuthenticated();
      
      if (isAuth) {
        // Cargar datos del usuario si está autenticado
        const userData = await TokenService.getUserData();
        const tokenData = await TokenService.getTokens();
        
        // Si no hay datos de usuario pero hay token, extraer del token
        if (!userData && tokenData?.token) {
          const userId = TokenService.getUserIdFromToken(tokenData.token);
          if (userId) {
            // Crear datos básicos del usuario
            const basicUserData: UserData = {
              id: userId,
              email: '', 
              name: '' 
            };
            await TokenService.saveUserData(basicUserData);
            setUser(basicUserData);
          }
        } else {
          setUser(userData);
        }
        
        setAuthState({
          token: tokenData?.token || null,
          authenticated: true
        });
      } else {
        setAuthState({
          token: null,
          authenticated: false
        });
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        token: null,
        authenticated: false
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const tokenData = await TokenService.getTokens();
      
      if (!tokenData?.refreshToken) {
        return false;
      }

      const newTokenData = await ApiService.refreshToken(tokenData.refreshToken);
      
      if (newTokenData) {
        setAuthState({
          token: newTokenData.token,
          authenticated: true
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };

  // Nueva función de login (API moderna)
  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      
      // Asegurar que ApiService esté inicializado
      ApiService.initialize();
      
      const response = await ApiService.login(credentials);
      
      if (response.token && response.refreshToken) {
        // Extraer y guardar datos del usuario
        const userId = TokenService.getUserIdFromToken(response.token);
        if (userId) {
          const userData: UserData = {
            id: userId,
            email: credentials.email,
            name: '' 
          };
          
          await TokenService.saveUserData(userData);
          setUser(userData);
        }
        
        setAuthState({
          token: response.token,
          authenticated: true
        });
      } else {
        throw new Error('No se recibieron tokens válidos');
      }
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw new Error(error.response?.data?.message || error.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  // Nueva función de registro (API moderna)
  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      
      const response = await ApiService.register(data);
      
      // El registro solo confirma que el usuario se creó exitosamente
      // No devuelve tokens, eso se hace en el login
      console.log('✅ User registered successfully');
      
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  // Nueva función de logout (API moderna)
  const logout = async () => {
    try {
      setLoading(true);
      
      // Llamar al endpoint de logout que limpia los tokens automáticamente
      await ApiService.logout();
      
      setAuthState({
        token: null,
        authenticated: false
      });
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Aunque falle el logout en el servidor, limpiar estado local
      setAuthState({
        token: null,
        authenticated: false
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de compatibilidad con la API anterior
  const onRegister = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      await register({ name, email, password });
      return { message: "Usuario registrado exitosamente" };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || "Error en el registro",
      };
    }
  };

  const onLogin = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      await login({ email, password });
      const tokenData = await TokenService.getTokens();
      return { 
        message: "Login exitoso", 
        token: tokenData?.token 
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || "Error en el login",
      };
    }
  };

  const onLogout = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        // Estados
        authState,
        loading,
        user,
        isAuthenticated: authState.authenticated,
        
        // Funciones de compatibilidad (API anterior)
        onRegister,
        onLogin,
        onLogout,
        
        // Nuevas funciones (API moderna)
        login,
        register,
        logout,
        refreshSession,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
