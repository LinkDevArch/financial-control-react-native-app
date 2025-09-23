import * as SecureStore from "expo-secure-store";

// Constantes para las keys del storage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token", 
  TOKEN_EXPIRY: "token_expiry",
  USER_DATA: "user_data"
} as const;

// Variable global para callback de limpieza
let onTokensCleared: (() => void) | null = null;

export const setTokensClearedCallback = (callback: () => void) => {
  onTokensCleared = callback;
};

export interface TokenData {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
}

export class TokenService {
  
  /**
   * Decodifica un JWT y extrae la información de expiración
   */
  static decodeJWT(token: string): { exp: number; sub: string; iat: number } | null {
    try {
      // Verificar si es un JWT válido (debe tener 3 partes separadas por puntos)
      if (!token || token.split('.').length !== 3) {
        return null;
      }
      
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      // No es un error real si no es un JWT (puede ser un UUID)
      return null;
    }
  }

  /**
   * Verifica si un token está expirado
   */
  static isTokenExpired(token: string, bufferSeconds: number = 5): boolean {
    const decoded = this.decodeJWT(token);
    if (!decoded) {
      return true;
    }
    
    const now = Date.now() / 1000; // Convertir a segundos
    const expiresAt = decoded.exp;
    const expiresWithBuffer = expiresAt - bufferSeconds; // Usar segundos, no minutos
    
    return now >= expiresWithBuffer;
  }

  /**
   * Guarda los tokens de manera segura
   */
  static async saveTokens(tokenData: TokenData): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokenData.token),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokenData.refreshToken),
        SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, tokenData.expiresAt.toString())
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Recupera los tokens del almacenamiento seguro
   */
  static async getTokens(): Promise<TokenData | null> {
    try {
      const [token, refreshToken, expiryString] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY)
      ]);

      if (!token || !refreshToken || !expiryString) {
        return null;
      }

      const tokenData = {
        token,
        refreshToken,
        expiresAt: parseInt(expiryString, 10)
      };
      
      return tokenData;
    } catch (error) {
      return null;
    }
  }

  /**
   * Guarda datos del usuario
   */
  static async saveUserData(userData: UserData): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Recupera datos del usuario
   */
  static async getUserData(): Promise<UserData | null> {
    try {
      const userDataString = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userDataString ? JSON.parse(userDataString) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Limpia todos los tokens y datos de usuario
   */
  static async clearAllTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA)
      ]);
      
      
      // Notificar al AuthContext que los tokens fueron limpiados
      if (onTokensCleared) {
        onTokensCleared();
      }
    } catch (error) {
      // No lanzar error aquí para evitar que el logout falle
    }
  }

  /**
   * Obtiene el ID del usuario desde el token
   */
  static getUserIdFromToken(token: string): string | null {
    const decoded = this.decodeJWT(token);
    return decoded?.sub || null;
  }
}
