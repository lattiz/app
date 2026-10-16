const PATCHED = '__lattizLicenseBannerPatched';

// El banner de licencia vive en un shadow root cerrado: ni CSS ni `host.shadowRoot` llegan a él,
// así que se engancha `attachShadow` para observar cada root y ocultar el host que contenga `.gs-banner`.
export function hideGrapesJsLicenseBanner(): void {
  const proto = Element.prototype as unknown as Record<string, unknown>;
  if (proto[PATCHED]) return;
  proto[PATCHED] = true;

  const attachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (this: Element, init: ShadowRootInit) {
    const root = attachShadow.call(this, init);
    const hideIfBanner = () => {
      if (root.querySelector('.gs-banner') && this instanceof HTMLElement) {
        this.style.setProperty('display', 'none', 'important');
      }
    };
    new MutationObserver(hideIfBanner).observe(root, {
      childList: true,
      subtree: true,
    });
    hideIfBanner();
    return root;
  };
}
