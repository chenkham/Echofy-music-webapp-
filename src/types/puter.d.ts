declare module "puter" {
  interface PuterAuth {
    signIn(): Promise<any>;
    signOut(): Promise<void>;
    getUser(): Promise<any>;
  }

  interface PuterKV {
    set(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
  }

  interface Puter {
    auth: PuterAuth;
    kv: PuterKV;
  }

  const puter: Puter;
  export default puter;
}
