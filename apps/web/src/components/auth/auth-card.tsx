import { useState, type ReactNode } from 'react';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthTabs, type AuthMode } from '@/components/auth/auth-tabs';
import { FooterSwitcher } from '@/components/auth/footer-switcher';
import { LoginForm } from '@/components/auth/login-form';
import { SignupEmailForm } from '@/components/auth/signup-email-form';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: 'Inicia sesión en tu cuenta',
    subtitle: '¡Bienvenido de nuevo!',
  },
  signup: {
    title: 'Crea tu cuenta',
    subtitle: 'Ingresa tu correo para empezar.',
  },
};

interface AuthCardProps {
  initialMode: AuthMode;
  /** Route-specific notice rendered above the tabs (e.g. the account-deleted banner). */
  banner?: ReactNode;
}

/** Unified Login/Signup card. Mode is internal state — switching tabs never changes route. */
export function AuthCard({ initialMode, banner }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <Card className='h-[600px]'>
      <CardHeader>
        <AuthHeader title={COPY[mode].title} subtitle={COPY[mode].subtitle} />
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)}>
          <AuthTabs />
          {banner && <div className="mt-6">{banner}</div>}
          <TabsContent value="login" className="mt-6">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <SignupEmailForm />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-center flex items-center justify-center">
        <FooterSwitcher mode={mode} onSwitch={setMode} />
      </CardFooter>
    </Card>
  );
}
