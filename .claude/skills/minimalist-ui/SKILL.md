---
name: minimalist-ui
description: Interfaces limpias con estilo editorial. Paleta monocromática cálida, contraste tipográfico, retículas tipo bento planas, pasteles tenues, sin degradados, sin sombras pesadas.
---

# Protocolo: Arquitecto de UI de Minimalismo Utilitario Premium

## 1. Descripción General del Protocolo
Nombre: Minimalismo Utilitario Premium y UI Editorial
Descripción: Una directiva avanzada de desarrollo frontend para generar interfaces web altamente refinadas, ultra-minimalistas y con "estilo de documento" parecidas a las plataformas de trabajo de primer nivel. Este protocolo impone estrictamente una paleta monocromática cálida de alto contraste, jerarquías tipográficas a medida, un macro-espacio en blanco estructural meticuloso, diseños en cuadrícula bento y una arquitectura de componentes ultra-planos con acentos pastel apagados. Rechaza activamente las tendencias genéricas de diseño SaaS.

## 2. Restricciones Negativas Absolutas (Elementos Prohibidos)
La inteligencia artificial debe evitar estrictamente las siguientes opciones por defecto genéricas del desarrollo web:
- NO usar las tipografías "Inter", "Roboto" o "Open Sans".
- NO usar bibliotecas de iconos genéricas como "Lucide", "Feather" o "Heroicons" estándar.
- NO usar las clásicas y pesadas sombras paralelas de Tailwind (ej., `shadow-md`, `shadow-lg`, `shadow-xl`). Las sombras deben ser prácticamente invisibles o muy personalizadas para ser ultra difusas y de baja opacidad (< 0.05).
- NO usar fondos con colores primarios para elementos grandes o secciones (ej., nada de secciones hero de color azul, verde o rojo brillante).
- NO usar degradados o colores neón (ningún glassmorphism más allá de blurs sutiles en la navegación).
- NO usar `rounded-full` (forma de píldora) para grandes contenedores o tarjetas.
- NO usar emojis en ninguna parte del código, ni en títulos o atributos `alt`. Reemplazar con primitivas SVG limpias.
- NO usar textos genéricos o de relleno como "John Doe", "Acme Corp" o "Lorem Ipsum". Usa contenido realista y contextual.
- NO usar clichés de redacción IA: "Eleva", "Impulsa", "Desata", "De nueva generación", "Game-changer". Escribe con un lenguaje específico y llano.

## 3. Arquitectura Tipográfica
La interfaz debe depender del contraste tipográfico extremo para establecer un ambiente editorial.
- Sans-Serif Principal (Cuerpo, UI, Botones): 'SF Pro Display', 'Geist Sans', 'Helvetica Neue', 'Switzer', sans-serif.
- Serif Editorial (Encabezados y Citas): 'Lyon Text', 'Newsreader', 'Playfair Display', serif. Interlineado y espacio entre letras muy ajustados.
- Monospace (Código, Atajos de teclado, Metadatos): 'Geist Mono', 'JetBrains Mono', monospace.
- Colores de texto: Jamás usar negro absoluto (`#000000`). Usa negro apagado (`#111111`) con un buen interlineado (`1.6`).

## 4. Paleta de Colores (Monocromático Cálido + Pasteles Locales)
- Lienzo / Fondo: Blanco puro `#FFFFFF` o Blanco cálido `#F7F6F3` / `#FBFBFA`.
- Tarjetas: `#FFFFFF` o `#F9F9F8`.
- Bordes: Gris ultra claro `#EAEAEA`.
- Acentos: Usar exclusivamente pasteles muy desaturados para etiquetas.
  - Rojo Pálido: `#FDEBEC`
  - Azul Pálido: `#E1F3FE`
  - Verde Pálido: `#EDF3EC`
  - Amarillo Pálido: `#FBF3DB`

## 5. Especificaciones de Componentes
- Cuadrículas Bento Box:
  - Usa layouts de CSS Grid asimétricos, con `border: 1px solid #EAEAEA`. Padding muy amplio (`24px` a `40px`).
- Call-To-Action Primario (Botones):
  - Fondo negro sólido `#111111`, sin sombra. Se reduce ligeramente al posar el ratón `scale(0.98)`.
- Acordeones (FAQ):
  - Solo separar con un `border-bottom: 1px solid #EAEAEA`. Usar iconos afilados de `+` y `-`.
- MacOS Falso: Para maquetas de software, envolturas con barras superiores con 3 puntos (botones mac).

## 6. Iconos e Imágenes
- Usa iconos Phosphor o Radix.
- Fotos: Altamente desaturadas con tonos cálidos y una fina capa de "ruido/grano" opcional. Usa fotos realistas. NUNCA imágenes de stock saturadas.
- Agrega profundidad en fondos mediante texturas y ruido visual (al `3%` de opacidad), no dejes grandes zonas en blanco absoluto plano.

## 7. Movimiento Sutil y Microanimaciones
Las apariciones en el scroll deben ser por `IntersectionObserver` fundiéndose gentilmente sobre `600ms`. Botones se achican sutilmente. Y revelar entradas o cuadrículas del bento progresivamente en efecto cascada. NUNCA montes todo simultáneamente.