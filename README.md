# Financial Control - React Native App

Una aplicación móvil desarrollada con React Native y Expo para el control y gestión de finanzas personales. Esta aplicación permite a los usuarios administrar ingresos, gastos, metas financieras, deudas y generar reportes detallados.

## Requisitos Previos

Antes de ejecutar este proyecto, asegúrese de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio** (para emulador Android) o **Xcode** (para simulador iOS en macOS)
- **Git**

## Backend API

Esta aplicación requiere el sistema backend de Financial Control para funcionar correctamente. El servidor API debe estar ejecutándose antes de iniciar la aplicación móvil.

**Repositorio del API**: https://github.com/LinkDevArch/Finance_Control_System

Siga las instrucciones del repositorio del backend para configurar y ejecutar el servidor API antes de continuar.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/LinkDevArch/financial-control-react-native.app.git
cd financial-control-react-native.app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configuración de variables de entorno

Copie el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env
```

Edite el archivo `.env` y configure las siguientes variables:

```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:8080/api
EXPO_PUBLIC_API_TIMEOUT=10000

# Authentication Configuration
EXPO_PUBLIC_TOKEN_BUFFER_MINUTES=5
EXPO_PUBLIC_AUTO_REFRESH_ENABLED=true

# Development Configuration
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
```

**IMPORTANTE**: Reemplace `YOUR_LOCAL_IP` con la dirección IP de su computadora en la red local. No use `localhost` ya que no funcionará en dispositivos físicos.

### 4. Obtener su IP local

#### En Linux/macOS:
```bash
hostname -I | awk '{print $1}'
```

#### En Windows:
```cmd
ipconfig
```
Busque la dirección IPv4 en la sección "Adaptador de LAN inalámbrica" o "Adaptador Ethernet".

### 5. Ejemplo de configuración

Si su IP local es `192.168.1.100`, su archivo `.env` debería verse así:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080/api
```

## Ejecución del Proyecto

### 1. Verificar que el backend esté ejecutándose

Asegúrese de que el servidor API esté corriendo en el puerto 8080. Puede verificar accediendo a:
```
http://YOUR_LOCAL_IP:8080/actuator/health
```

### 2. Iniciar el servidor de desarrollo

```bash
npm start
```

Este comando iniciará el servidor de desarrollo de Expo y mostrará un código QR.

### 3. Ejecutar en dispositivos

#### Dispositivo físico:
1. Instale **Expo Go** desde Google Play Store o App Store
2. Escanee el código QR con la aplicación Expo Go (Android) o con la cámara (iOS)

#### Emulador Android:
```bash
npm run android
```

#### Simulador iOS (solo en macOS):
```bash
npm run ios
```

#### Navegador web:
```bash
npm run web
```

## Estructura del Proyecto

```
financial-control/
├── app/                          # Rutas y navegación (Expo Router)
│   ├── (auth)/                   # Rutas de autenticación
│   │   ├── login.tsx            # Pantalla de inicio de sesión
│   │   └── register.tsx         # Pantalla de registro
│   ├── (protected)/             # Rutas protegidas (requieren autenticación)
│   │   ├── (stacks)/            # Pantallas de navegación stack
│   │   │   ├── accounts.tsx     # Gestión de cuentas
│   │   │   ├── add-expense.tsx  # Agregar gastos
│   │   │   ├── add-income.tsx   # Agregar ingresos
│   │   │   ├── categories.tsx   # Gestión de categorías
│   │   │   └── ...              # Otras pantallas
│   │   └── (tabs)/              # Pantallas de navegación por pestañas
│   │       ├── index.tsx        # Dashboard principal
│   │       ├── transactions.tsx # Historial de transacciones
│   │       ├── reports.tsx      # Reportes financieros
│   │       ├── goals.tsx        # Metas financieras
│   │       └── debts.tsx        # Gestión de deudas
│   ├── _layout.tsx              # Layout raíz de la aplicación
│   └── index.tsx                # Pantalla de entrada
├── src/
│   ├── components/              # Componentes reutilizables
│   │   ├── Header.tsx           # Componente de encabezado
│   │   ├── AppButton.tsx        # Botón personalizado
│   │   ├── Card.tsx             # Componente de tarjeta
│   │   ├── FinancialCharts.tsx  # Gráficos financieros
│   │   └── ...                  # Otros componentes
│   ├── context/                 # Contextos de React
│   │   ├── AuthContext.tsx      # Contexto de autenticación
│   │   └── AlertContext.tsx     # Contexto de alertas
│   ├── hooks/                   # Custom hooks
│   │   ├── useFinancialData.ts  # Hook para datos financieros
│   │   ├── useExpenseActions.ts # Hook para acciones de gastos
│   │   └── ...                  # Otros hooks
│   ├── interfaces/              # Definiciones de tipos TypeScript
│   │   └── types.tsx            # Interfaces y tipos
│   ├── services/                # Servicios de API
│   │   ├── ApiService.ts        # Cliente HTTP principal
│   │   └── TokenService.ts      # Gestión de tokens JWT
│   └── utils/                   # Utilidades y helpers
│       ├── formatters.tsx       # Funciones de formato
│       ├── validator.tsx        # Validaciones
│       └── index.tsx            # Utilidades generales
├── assets/                      # Recursos estáticos
│   ├── icon.png                 # Icono de la aplicación
│   ├── splash-icon.png          # Imagen de splash
│   └── ...                      # Otras imágenes
├── android/                     # Proyecto nativo Android
├── plugins/                     # Plugins de Expo
├── .env                         # Variables de entorno (no versionado)
├── .env.example                 # Ejemplo de variables de entorno
├── app.json                     # Configuración de Expo
├── package.json                 # Dependencias y scripts
└── tsconfig.json               # Configuración de TypeScript
```

## Funcionalidades Principales

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Autenticación JWT con refresh tokens automático
- Protección de rutas

### Gestión Financiera
- **Ingresos**: Registrar y categorizar ingresos
- **Gastos**: Registrar y categorizar gastos
- **Cuentas**: Gestionar múltiples cuentas bancarias
- **Categorías**: Crear y administrar categorías personalizadas
- **Metas**: Establecer y seguir metas financieras
- **Deudas**: Gestionar deudas y pagos

### Reportes y Análisis
- Dashboard con resumen financiero
- Gráficos de ingresos vs gastos
- Reportes mensuales y anuales
- Análisis de tendencias
- Distribución por categorías

## Desarrollo

### Scripts disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm run android`: Ejecuta en emulador Android
- `npm run ios`: Ejecuta en simulador iOS
- `npm run web`: Ejecuta en navegador web

### Tecnologías utilizadas

- **React Native 0.81.4**
- **Expo SDK 54**
- **TypeScript**
- **Expo Router** (navegación)
- **Axios** (cliente HTTP)
- **React Native Chart Kit** (gráficos)
- **Lucide React Native** (iconos)

## Solución de Problemas

### Error de Network
Si obtiene errores de "Network Error" al intentar hacer login:

1. Verifique que el servidor API esté ejecutándose.
2. Confirme que la IP en el archivo `.env` sea correcta.
3. Asegúrese de que su dispositivo y computadora estén en la misma red.
4. No use `localhost` - use la IP local de su computadora.
5. Confirme que la configuración del Cors sea correcta para su caso en el api.

### Problemas de conexión
- Verifique que no haya firewall bloqueando el puerto 8080
- Confirme que ambos dispositivos estén en la misma red WiFi
- Reinicie el servidor de desarrollo si es necesario

### Dependencias desactualizadas
```bash
npx expo install --fix
```

## Licencia

Este proyecto está licenciado bajo la **GNU General Public License v3.0** (GPL-3.0).

La GPL-3.0 es una licencia de software libre y copyleft que garantiza que:

- **Libertad de uso**: Puede usar el software para cualquier propósito
- **Libertad de estudio**: Puede examinar y modificar el código fuente
- **Libertad de distribución**: Puede distribuir copias del software
- **Libertad de mejora**: Puede distribuir versiones modificadas

### Términos importantes:

- **Copyleft**: Las obras derivadas deben distribuirse bajo la misma licencia GPL-3.0
- **Código fuente**: Debe proporcionar acceso al código fuente al distribuir el software
- **Sin garantía**: El software se proporciona "tal como está", sin garantías

### Texto completo de la licencia:

El texto completo de la licencia GNU GPL-3.0 se encuentra en el archivo [LICENSE.md](./LICENSE.md).

También puede consultar la licencia oficial en: https://www.gnu.org/licenses/gpl-3.0.html

## Contacto

Para reportar problemas o solicitar funcionalidades, puede mandar una issue o pull request.