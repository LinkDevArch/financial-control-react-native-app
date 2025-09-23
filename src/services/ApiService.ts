import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenService, TokenData } from './TokenService';

// Definir la URL base de la API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export class ApiService {
  private static instance: AxiosInstance;
  private static isRefreshing = false;

  /**
   * Inicializa la instancia de Axios con configuración base
   */
  static initialize(): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.setupInterceptors();
    }

    return this.instance;
  }

  /**
   * Configura los interceptores de request y response
   */
  private static setupInterceptors(): void {
    // Request interceptor - verificar y refrescar token automáticamente
    this.instance.interceptors.request.use(
      async (config) => {
        // Evitar verificar tokens en el endpoint de refresh, login, register y logout para evitar loops infinitos
        if (config.url?.includes('/auth/users/refresh') || 
            config.url?.includes('/auth/users/login') || 
            config.url?.includes('/auth/users/register') ||
            config.url?.includes('/auth/users/logout')) {
          return config;
        }

        // Obtener tokens del almacén seguro
        const tokenData = await TokenService.getTokens();
        if (!tokenData?.token) {
          return config;
        }

        const isExpired = TokenService.isTokenExpired(tokenData.token, 5); // 5 segundos de buffer
        
        // Si el token está expirado, refrescarlo antes de continuar
        if (isExpired) {
          // Si ya estamos refrescando, esperar a que termine (sin log adicional)
          if (this.isRefreshing) {
            
            // Esperar hasta que termine el refresh o máximo 5 segundos
            let attempts = 0;
            while (this.isRefreshing && attempts < 50) {
              await new Promise(resolve => setTimeout(resolve, 100));
              attempts++;
            }
            
            if (this.isRefreshing) {
            } else {
              // Usar el token cacheado si está disponible, sino obtener del storage
              const newTokenData = await TokenService.getTokens();
              if (newTokenData?.token) {
                config.headers.Authorization = `Bearer ${newTokenData.token}`;
                return config;
              }
            }
          } else {
            // Iniciar refresh proactivo
            this.isRefreshing = true;
            
            try {
              if (tokenData.refreshToken) {
                const newTokenData = await this.refreshToken(tokenData.refreshToken);
                if (newTokenData) {
                  config.headers.Authorization = `Bearer ${newTokenData.token}`;
                  return config;
                } else {
                  await TokenService.clearAllTokens();
                  return Promise.reject(new Error('Token refresh failed'));
                }
              } else {
                await TokenService.clearAllTokens();
                return Promise.reject(new Error('No refresh token available'));
              }
            } catch (error: any) {
              await TokenService.clearAllTokens();
              return Promise.reject(error);
            } finally {
              this.isRefreshing = false;
            }
          }
        }
        
        // Token válido, agregar al header
        config.headers.Authorization = `Bearer ${tokenData.token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - manejar errores de autenticación restantes
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;


        // Si es un 401 en el endpoint de refresh, limpiar tokens
        if (error.response?.status === 401 && originalRequest.url?.includes('/auth/users/refresh')) {
          await TokenService.clearAllTokens();
          return Promise.reject(error);
        }

        // COMENTADO: Emergency refresh logic removido - el proactive refresh en request interceptor lo maneja

        return Promise.reject(error);
      }
    );
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.instance.post<AuthResponse>('/auth/users/login', credentials);
      
      // Guardar tokens automáticamente después del login
      if (response.data.token && response.data.refreshToken) {
        const decoded = TokenService.decodeJWT(response.data.token);
        const expiresAt = decoded ? decoded.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000); // 24h por defecto
        
        await TokenService.saveTokens({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresAt
        });
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Realiza registro
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.instance.post<AuthResponse>('/auth/users/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresca el token de acceso
   */
  static async refreshToken(refreshToken: string): Promise<TokenData | null> {
    try {
      // Decodificar el refresh token para ver su información (solo si es JWT)
      const decoded = TokenService.decodeJWT(refreshToken);
      const requestPayload = { refreshToken };
      
      const response = await this.instance.post<AuthResponse>('/auth/users/refresh', requestPayload);

      if (response.data.token && response.data.refreshToken) {
        const decoded = TokenService.decodeJWT(response.data.token);
        const expiresAt = decoded ? decoded.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000);
        
        const newTokenData: TokenData = {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresAt
        };

        await TokenService.saveTokens(newTokenData);
        return newTokenData;
      }

      return null;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Realiza logout
   */
  static async logout(): Promise<LogoutResponse> {
    try {
      
      // Obtener tokens frescos justo antes del logout
      const tokenData = await TokenService.getTokens();
      
      if (tokenData?.refreshToken) {
        const response = await this.instance.post<LogoutResponse>('/auth/users/logout', {
          refreshToken: tokenData.refreshToken
        });
        
        // Limpiar tokens locales después del logout exitoso
        await TokenService.clearAllTokens();
        
        return response.data;
      }
      
      // Si no hay refresh token, solo limpiar tokens locales
      await TokenService.clearAllTokens();
      return { message: 'Logout exitoso' };
      
    } catch (error: any) {
      if (error.response) {
      }
      // Limpiar tokens locales aunque falle el logout en el servidor
      await TokenService.clearAllTokens();
      throw error;
    }
  }

  /**
   * Obtiene la instancia configurada de Axios
   */
  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const tokenData = await TokenService.getTokens();
      
      if (!tokenData || !tokenData.token) {
        return false;
      }
      const isExpired = TokenService.isTokenExpired(tokenData.token, 5); // 5 segundos de buffer
      // Si el access token no está expirado, está autenticado
      if (!isExpired) {
        return true;
      }
      
      // Si el access token está expirado, hay refresh token disponible, 
      // y el request interceptor se encargará del refresh automáticamente
      if (tokenData.refreshToken) {
        return true; // El interceptor manejará el refresh cuando sea necesario
      }
      
      await TokenService.clearAllTokens();
      return false;
    } catch (error) {
      return false;
    }
  }
}

// Inicializar la instancia al importar el módulo
ApiService.initialize();
