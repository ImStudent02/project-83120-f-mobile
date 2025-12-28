// Type declarations for external modules
// These will be overridden by actual types when packages are installed

declare module 'openpgp' {
  export interface PrivateKey {}
  export interface PublicKey {}
  
  export function generateKey(options: {
    type: string;
    rsaBits: number;
    userIDs: { name: string; email: string }[];
    passphrase: string;
  }): Promise<{ privateKey: string; publicKey: string }>;
  
  export function readPrivateKey(options: { armoredKey: string }): Promise<PrivateKey>;
  export function readKey(options: { armoredKey: string }): Promise<PublicKey>;
  export function decryptKey(options: { privateKey: PrivateKey; passphrase: string }): Promise<PrivateKey>;
  export function createMessage(options: { text: string }): Promise<any>;
  export function readMessage(options: { armoredMessage: string }): Promise<any>;
  export function encrypt(options: { message: any; encryptionKeys: PublicKey }): Promise<string>;
  export function decrypt(options: { message: any; decryptionKeys: PrivateKey }): Promise<{ data: string }>;
}

declare module 'react-native-keychain' {
  export function setGenericPassword(
    username: string,
    password: string,
    options?: { service?: string }
  ): Promise<boolean>;
  
  export function getGenericPassword(options?: { service?: string }): Promise<false | { password: string }>;
  
  export function resetGenericPassword(options?: { service?: string }): Promise<boolean>;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    multiSet(keyValuePairs: [string, string][]): Promise<void>;
    multiRemove(keys: string[]): Promise<void>;
  };
  export default AsyncStorage;
}

declare module 'zustand' {
  type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  type GetState<T> = () => T;
  type StoreApi<T> = { getState: GetState<T>; setState: SetState<T> };
  type StateCreator<T> = (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) => T;
  
  export function create<T>(): (initializer: StateCreator<T>) => () => T;
  export function create<T>(initializer: StateCreator<T>): () => T;
}

declare module 'axios' {
  export interface AxiosInstance {
    get<T>(url: string, config?: any): Promise<{ data: T }>;
    post<T>(url: string, data?: any, config?: any): Promise<{ data: T }>;
    put<T>(url: string, data?: any, config?: any): Promise<{ data: T }>;
    delete<T>(url: string, config?: any): Promise<{ data: T }>;
    interceptors: {
      request: { use: (fn: (config: any) => any) => void };
      response: { use: (fn: (response: any) => any) => void };
    };
  }
  
  export interface AxiosError extends Error {
    response?: { data: any; status: number };
  }
  
  const axios: {
    create(config?: any): AxiosInstance;
  };
  export default axios;
  export { AxiosInstance, AxiosError };
}

declare module 'buffer' {
  export class Buffer {
    static from(data: string | Uint8Array | ArrayBuffer | number[], encoding?: string): Buffer;
    toString(encoding?: string): string;
    length: number;
    [index: number]: number;
  }
}

declare module '@react-navigation/native' {
  export function NavigationContainer(props: { children: React.ReactNode }): JSX.Element;
}

declare module '@react-navigation/native-stack' {
  export function createNativeStackNavigator(): {
    Navigator: React.FC<any>;
    Screen: React.FC<any>;
  };
}
