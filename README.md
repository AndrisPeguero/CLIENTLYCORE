# CLIENTLYCORE 🚀

**CLIENTLYCORE** es un sistema integral de gestión de clientes, contrataciones y servicios desarrollado en **Angular**. Cuenta con una interfaz moderna en tema oscuro (Dark Theme) diseñada para centralizar el control de empresas, datos de contacto, estados de servicios y cobros recurrentes.

---

## 🟢 Estado del Proyecto: COMPLETADO

El desarrollo del proyecto está finalizado y cumple con la arquitectura modular planteada:

- [x] **Arquitectura Base & Layout:** Configuración modular con header, sidebar y main-layout.
- [x] **Modelos & Tipado en Inglés:** Definición de interfaces (`Client`, `ContractType`, etc.) siguiendo las mejores prácticas.
- [x] **Directorio de Clientes:** Tabla de visualización con estados, badges y acciones.
- [x] **Gestión de Servicios & Contrataciones:** Módulos para catálogo de servicios y tipos de contrato.
- [x] **Filtros e Interactividad:** Búsqueda activa y filtrado por estados en tiempo real.

---

## 🛠️ Tecnologías y Librerías

- **Framework:** Angular v22[cite: 4]
- **Estilos:** SCSS (Variables globales y diseño adaptativo)
- **Iconos:** `@lucide/angular`
- **Lenguaje:** TypeScript

---

## 📁 Estructura del Proyecto

El proyecto sigue una estructura limpia por funcionalidades (*feature-driven architecture*), manteniendo todas las clases e interfaces en **inglés**:

```text
clientlycore-app/
└── src/
    └── app/
        ├── layout/          # Estructura general (header, sidebar, main-layout)
        ├── features/        # Módulos principales (clientes, servicios, contratos)
        ├── core/            # Modelos, servicios compartidos y guardias
        └── styles.scss      # Estilos globales y paleta de colores
