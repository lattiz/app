import {
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type DeviceId = 'desktop' | 'tablet' | 'mobile';

interface DeviceConfig {
  id: DeviceId;
  name: string;
  width: string;
  widthMedia?: string;
}

/** Devices for `options.devices.default`; `name` is also the label of the SDK dropdown on small screens. */
export const editorDevices: DeviceConfig[] = [
  { id: 'desktop', name: 'Escritorio', width: '' },
  { id: 'tablet', name: 'Tablet', width: '770px', widthMedia: '992px' },
  { id: 'mobile', name: 'Celular', width: '375px', widthMedia: '768px' },
];

const deviceMeta: Record<DeviceId, { icon: LucideIcon; hint: string }> = {
  desktop: { icon: MonitorIcon, hint: 'Así se ve en una computadora' },
  tablet: { icon: TabletIcon, hint: 'Así se ve en una tablet' },
  mobile: { icon: SmartphoneIcon, hint: 'Así se ve en un celular' },
};

interface DevicesEditor {
  // Undefined until the editor modules finish loading (the SDK mounts the top bar earlier).
  Devices?: {
    select: (id: string) => unknown;
    getSelected: () => { id: string } | undefined;
  };
  on: (event: string, cb: () => void) => void;
  off: (event: string, cb: () => void) => void;
}

const selectedDevice = (studio?: DevicesEditor) =>
  studio?.Devices?.getSelected()?.id ?? 'desktop';

/** Segmented device control rendered inside the SDK top bar as a `custom` layout component. */
export function DeviceSwitcher({ editor }: { editor?: unknown }) {
  const studio = editor as DevicesEditor | undefined;
  const [current, setCurrent] = useState(() => selectedDevice(studio));

  useEffect(() => {
    if (!studio) return;
    const sync = () => setCurrent(selectedDevice(studio));
    sync();
    studio.on('load', sync);
    studio.on('device:select', sync);
    return () => {
      studio.off('load', sync);
      studio.off('device:select', sync);
    };
  }, [studio]);

  return (
    <TooltipProvider>
      <div
        role="radiogroup"
        aria-label="Vista del sitio"
        className="flex items-center gap-0.5 rounded-lg border border-(--gs-theme-cl-glb-br) bg-(--gs-theme-cl-glb-bg1) p-0.5"
      >
        {editorDevices.map(({ id, name }) => {
          const { icon: Icon, hint } = deviceMeta[id];
          const active = current === id;
          return (
            <Tooltip key={id}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={name}
                    onClick={() => studio?.Devices?.select(id)}
                    className={cn(
                      'flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-(--gs-theme-cl-glb-fcs)',
                      active
                        ? 'bg-(--gs-theme-cl-glb-bg3) text-(--gs-theme-cl-prm-bg1) shadow-sm'
                        : 'text-(--gs-theme-cl-glb-plh) hover:bg-(--gs-theme-cl-glb-bg3)/60 hover:text-(--gs-theme-cl-glb-txt)',
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{name}</span>
                  </button>
                }
              />
              <TooltipContent side="bottom">{hint}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
