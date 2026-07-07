import type { AuthMode } from './auth-tabs';
import { Button } from '@/components/ui/button';

interface FooterSwitcherProps {
  mode: AuthMode;
  onSwitch: (mode: AuthMode) => void;
}

/** Bottom line that flips between Login and Signup via internal state (no route change). */
export function FooterSwitcher({ mode, onSwitch }: FooterSwitcherProps) {
  const isLogin = mode === 'login';
  return (
    <p className="text-muted-foreground text-center text-xs">
      {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
      <Button
        type="button"
        variant="link"
        onClick={() => onSwitch(isLogin ? 'signup' : 'login')}
      >
        {isLogin ? 'Regístrate' : 'Inicia sesión'}
      </Button>
    </p>
  );
}
