import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export type AuthMode = 'login' | 'signup';

/** Segmented control switching between Sign up / Log in. Must render inside <Tabs>. */
export function AuthTabs() {
  return (
    <TabsList className="w-full">
      <TabsTrigger value="signup" className="flex-1 hover:cursor-pointer">
        Registrarse
      </TabsTrigger>
      <TabsTrigger value="login" className="flex-1 hover:cursor-pointer">
        Iniciar sesión
      </TabsTrigger>
    </TabsList>
  );
}
