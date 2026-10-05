// Registrado bajo locale `en` porque el SDK fuerza ese locale internamente.
import type lang from '@grapesjs/studio-sdk/dist/locale/en/index.d.ts';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => R
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export const studioSdkLocaleEs: DeepPartial<typeof lang> = {
  add: 'Agregar',
  delete: 'Eliminar',
  duplicate: 'Duplicar',
  rename: 'Renombrar',
  remove: 'Quitar',
  clear: 'Limpiar',
  select: 'Seleccionar',
  selectList: 'Elegir de la lista',
  search: 'Buscar',
  update: 'Actualizar',
  updated: '¡Actualizado!',
  confirm: 'Confirmar',
  cancel: 'Cancelar',
  enable: 'Activar',
  disable: 'Desactivar',
  upload: 'Subir',
  close: 'Cerrar',
  load: 'Cargar',
  copy: 'Copiar',
  save: 'Guardar',
  error: 'Error',
  current: 'Actual',
  toggleCss: 'Mostrar u ocultar CSS',
  selectTarget: 'Elemento objetivo',
  noCode: 'No hay código disponible',
  noItems: 'No se encontraron elementos',
  confirmAction: '¿Confirmas esta acción?',
  eyeDropper: 'Cuentagotas',
  noEyeDropper: 'El cuentagotas no está disponible',
  unauthorized: 'Proyecto no autorizado',
  notItemsFound: 'No se encontraron elementos',
  actions: {
    preview: {
      title: 'Vista previa',
    },
    fullscreen: {
      title: 'Pantalla completa',
    },
    undo: {
      title: 'Deshacer',
    },
    redo: {
      title: 'Rehacer',
    },
    save: {
      title: 'Guardar proyecto',
    },
    store: {
      title: 'Guardar contenido',
    },
    open: {
      title: 'Abrir proyecto',
    },
    editCode: {
      title: 'Editar código',
      noChanges: 'No hay cambios por actualizar',
      button: 'Actualizar',
    },
    about: {
      title: 'Acerca de',
    },
    embed: {
      title: 'Insertar Studio',
    },
    newProject: {
      title: 'Cargar proyecto',
    },
    installApp: {
      title: 'Instalar app',
      installed: 'App instalada',
    },
  },
  modals: {
    styleCatalog: {
      title: 'Catálogo de estilos',
      noStyles: 'No se encontraron estilos',
    },
    openProject: {
      title: 'Abrir proyecto',
    },
  },
  globalStyleManager: {
    notFound: 'No hay estilos globales',
    globalStyles: 'Estilos globales',
  },
  assetManager: {
    addUrl: 'Agregar URL',
    projectAssets: 'Archivos de este proyecto',
    userAssets: 'Archivos de todos los proyectos',
    errorLoad: 'No se pudieron cargar los archivos',
    errorUpload: 'No se pudo subir el archivo',
    errorDelete: 'No se pudo eliminar el archivo',
    deleteConfirmQuestion: '¿Eliminar este archivo?',
    deleteConfirmExplanation:
      'Esto puede afectar proyectos ya publicados que usen este archivo.',
    assetTypes: {
      all: 'Todos',
      image: 'Imágenes',
    },
    noProvider: 'Archivos del proyecto',
  },
  fontManager: {
    addFontToProject: 'Agregar fuente al proyecto',
    projectFonts: 'Fuentes del proyecto',
    emptyProjectFonts: 'Este proyecto aún no tiene fuentes.',
    selectFont: 'Elige una fuente',
  },
  blockManager: {
    notFound: 'No se encontraron bloques',
    blocks: 'Bloques',
    add: 'Agregar más bloques',
    search: 'Buscar...',
    labels: {
      section: 'Sección',
      column1: '1 columna',
      column2: '2 columnas',
      column3: '3 columnas',
      'column3-7': '2 columnas 3/7',
      gridRow: 'Cuadrícula',
      heading: 'Título',
      divider: 'Separador',
      imageBox: 'Caja de imagen',
      linkBox: 'Caja de enlace',
    },
    types: {
      regular: 'Normales',
      symbols: 'Símbolos',
    },
    symbols: {
      notFound: 'No se encontraron símbolos',
      instancesProject: 'Instancia(s) en el proyecto',
      delete: 'Eliminar símbolo',
      deleteConfirm:
        '¿Seguro que quieres eliminar el símbolo? Todas las instancias del proyecto se desvincularán.',
    },
  },
  domComponents: {
    names: {
      section: 'Sección',
      gridRow: 'Fila',
      gridColumn: 'Columna',
      heading: 'Título',
      divider: 'Separador',
      imageBox: 'Caja de imagen',
      linkBox: 'Caja de enlace',
    },
    dropTargets: {
      notFound: {
        'mj-wrapper':
          'Este bloque solo se puede soltar en el cuerpo del correo, y no se encontró ninguno.',
        'mj-section':
          'Este bloque solo se puede soltar en el cuerpo del correo o en un Wrapper, y no se encontró ninguno.',
        'mj-group':
          'Este bloque solo se puede soltar dentro de una Sección, y no se encontró ninguna.',
        'mj-column':
          'Este bloque solo se puede soltar dentro de una Sección o Grupo, y no se encontró ninguno.',
        'mj-text':
          'Este bloque solo se puede soltar dentro de una Columna, y no se encontró ninguna.',
        'mj-button':
          'Este bloque solo se puede soltar dentro de una Columna, y no se encontró ninguna.',
        'mj-image':
          'Este bloque solo se puede soltar dentro de una Columna, y no se encontró ninguna.',
        'mj-divider':
          'Este bloque solo se puede soltar dentro de una Columna, y no se encontró ninguna.',
        'mj-social':
          'Este bloque solo se puede soltar dentro de una Columna, y no se encontró ninguna.',
        'mj-social-element':
          'Este bloque solo se puede soltar dentro de un bloque Social, y no se encontró ninguno.',
        'mj-spacer':
          'Este bloque solo se puede soltar dentro de una Columna, y no se encontró ninguna.',
        'mj-navbar':
          'Este bloque solo se puede soltar dentro de una Columna, y no se encontró ninguna.',
        'mj-navbar-link':
          'Este bloque solo se puede soltar dentro de una barra de navegación, y no se encontró ninguna.',
        'mj-table':
          'Este bloque solo se puede soltar dentro de una Columna, y no se encontró ninguna.',
        'mj-raw':
          'Este bloque solo se puede soltar en un contenedor compatible del correo, y no se encontró ninguno.',
      },
    },
  },
  traitManager: {
    empty: 'Selecciona un elemento para ver la configuración',
    notFound: 'No hay configuración disponible',
    panelLabel: 'Configuración',
    traits: {
      labels: {
        loading: 'Carga diferida',
        target: 'Abrir en pestaña nueva',
        showList: 'Mostrar lista de elementos',
        customAttributes: 'Atributos personalizados',
      },
    },
  },
  deviceManager: {
    allDevices: 'Todos los dispositivos',
  },
  selectorManager: {
    noSelecton: 'No tienes ningún elemento seleccionado.',
    selectFromCanvas: 'Selecciona un elemento en el lienzo.',
    selectFromList: 'Elige un estilo del catálogo.',
    selectCustom: 'Agrega tu propia clase de estilo.',
    selection: 'Selección',
    selector: 'Clase',
    addNewSelector: 'Agregar clase',
    removeSelector: 'Quitar clase',
    target: 'Objetivo',
    device: 'Dispositivo',
    state: 'Estado',
    deleteStyle: 'Eliminar estilo',
    showCSS: 'Mostrar código CSS',
    searchStyle: 'Buscar estilo',
    applyOnSelector: 'Aplicar cambios a las clases',
    noSelectors: 'Sin clases aplicadas',
    applyOnComponents: 'Aplicar cambios a los elementos',
    noComponents: 'Ningún elemento seleccionado',
    currentSelection: 'Selección actual de la que se muestran los estilos',
  },
  layerManager: {
    layers: 'Capas',
  },
  styleManager: {
    empty: 'Selecciona un elemento para editar sus estilos',
    notFound: 'No hay estilos disponibles',
    panelLabel: 'Estilos',
    layout: {
      flexChild: 'Hijo flex',
      display: {
        tips: {
          block: 'Ocupa todo el ancho y deja espacio arriba y abajo',
          inline: 'Se coloca en la misma línea que el texto, sin saltos',
          'inline-block': 'Como en línea, pero puedes definir ancho y alto',
          flex: 'Ordena los elementos hijos en fila o columna',
          none: 'El elemento queda oculto',
        },
      },
      direction: {
        title: {
          row: 'Horizontal',
          'row-reverse': 'Horizontal invertido',
          column: 'Vertical',
          'column-reverse': 'Vertical invertido',
        },
      },
      justify: {
        title: {
          start: 'Inicio',
          center: 'Centro',
          end: 'Final',
          spaceBetween: 'Espacio entre',
          spaceAround: 'Espacio alrededor',
          spaceEvenly: 'Espacio uniforme',
        },
      },
      align: {
        title: {
          stretch: 'Estirar',
          start: 'Inicio',
          center: 'Centro',
          end: 'Final',
        },
      },
      alignContent: {
        title: {
          start: 'Inicio',
          center: 'Centro',
          end: 'Final',
          spaceBetween: 'Espacio entre',
          spaceAround: 'Espacio alrededor',
          stretch: 'Estirar',
        },
      },
      alignSelf: {
        title: {
          auto: 'Automático',
          start: 'Inicio',
          center: 'Centro',
          end: 'Final',
          stretch: 'Estirar',
        },
      },
      flex: {
        title: {
          auto: 'Automático',
          fillContainer: 'Llenar contenedor',
          hugContents: 'Ajustar al contenido',
        },
      },
    },
    effects: {
      boxShadow: {
        xOffset: 'Desplazamiento X',
        yOffset: 'Desplazamiento Y',
        blur: 'Desenfoque',
        spread: 'Extensión',
        color: 'Color',
      },
      textShadow: {
        xOffset: 'Desplazamiento X',
        yOffset: 'Desplazamiento Y',
        blur: 'Desenfoque',
        color: 'Color',
      },
      filter: {
        type: 'Tipo',
        value: 'Valor',
      },
      backdropFilter: {
        type: 'Tipo',
        value: 'Valor',
      },
      transition: {
        type: 'Tipo',
        easing: 'Suavizado',
        duration: 'Duración',
        delay: 'Retraso',
      },
      transform: {
        type: 'Tipo',
        value: 'Valor',
      },
      childrenTransform: 'Transformación de hijos',
    },
    background: {
      sizeMode: {
        custom: 'Personalizado',
        preset: 'Predeterminado',
      },
    },
    position: {
      tips: {
        static: 'Posición normal',
        relative: 'Como la normal, pero puedes moverlo respecto a sí mismo',
        absolute: 'Posición libre respecto al contenedor más cercano',
        fixed: 'Fijo en la pantalla, incluso al desplazarte',
        sticky: 'Se queda fijo al llegar a cierta distancia al desplazarte',
      },
      presets: {
        title: 'Preajustes',
        options: {
          topLeft: 'Arriba izquierda',
          topRight: 'Arriba derecha',
          bottomLeft: 'Abajo izquierda',
          bottomRight: 'Abajo derecha',
          left: 'Izquierda',
          right: 'Derecha',
          bottom: 'Abajo',
          top: 'Arriba',
          full: 'Completo',
        },
      },
    },
    properties: {
      'margin-top': 'Superior',
      'margin-right': 'Derecho',
      'margin-bottom': 'Inferior',
      'margin-left': 'Izquierdo',
      'padding-top': 'Superior',
      'padding-right': 'Derecho',
      'padding-bottom': 'Inferior',
      'padding-left': 'Izquierdo',
      'border-top-left-radius': 'Arriba izquierda',
      'border-top-right-radius': 'Arriba derecha',
      'border-bottom-right-radius': 'Abajo derecha',
      'border-bottom-left-radius': 'Abajo izquierda',
      'mix-blend-mode': 'Modo de mezcla',
      'transform-style': 'Tipo',
      'backface-visibility': 'Cara trasera',
      'perspective-origin': 'Origen de perspectiva',
      'perspective-origin-x': 'Izquierda',
      'perspective-origin-y': 'Arriba',
      'transform-origin-x': 'Izquierda',
      'transform-origin-y': 'Arriba',
      'align-items': 'Alineación vertical',
      'align-self': 'Alineación propia',
      'justify-content': 'Distribución horizontal',
      'row-gap': 'Fila',
      'column-gap': 'Columna',
      'font-family': 'Fuente',
      'font-size': 'Tamaño de letra',
      'font-weight': 'Grosor',
      'letter-spacing': 'Espaciado entre letras',
      'text-align': 'Alineación',
      'text-decoration': 'Decoración',
      'text-transform': 'Transformación',
      'white-space': 'Saltos de línea',
      'border-top-width': 'Superior',
      'border-right-width': 'Derecho',
      'border-bottom-width': 'Inferior',
      'border-left-width': 'Izquierdo',
      'border-top-style': 'Superior',
      'border-right-style': 'Derecho',
      'border-bottom-style': 'Inferior',
      'border-left-style': 'Izquierdo',
      'border-top-color': 'Superior',
      'border-right-color': 'Derecho',
      'border-bottom-color': 'Inferior',
      'border-left-color': 'Izquierdo',
      'background-position': 'Posición',
      'background-position-x': 'Izquierda',
      'background-position-y': 'Arriba',
      'background-size': 'Tamaño',
      'background-size-options': 'Tamaño',
      'background-size-x': 'Izquierda',
      'background-size-y': 'Arriba',
      'background-repeat': 'Repetición',
      'background-attachment': 'Fijación',
      'background-origin': 'Origen',
      'background-clip': 'Recorte',
      'overflow-x': 'X',
      'overflow-y': 'Y',
    },
    options: {
      '__background-type': {
        image: 'Imagen',
        gradient: 'Degradado',
        color: 'Color',
      },
      display: {
        block: 'Bloque',
        inline: 'En línea',
        'inline-block': 'Bloque en línea',
        flex: 'Flexible',
        none: 'Oculto',
      },
      overflow: {
        visible: 'Visible',
        hidden: 'Recortar',
        scroll: 'Con barra de desplazamiento',
        auto: 'Automático',
      },
      'flex-wrap': {
        nowrap: 'En una sola línea',
        wrap: 'Pasar a la siguiente línea',
        'wrap-reverse': 'Pasar a la línea anterior',
      },
    },
  },
};
