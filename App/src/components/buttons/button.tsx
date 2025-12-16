//===========================================================================//
//                                   BUTTON                                   //
//===========================================================================//
//  Componente de botón con variantes y tamaños configurables (CVA).
//  - Variants: default, destructive, outline, secondary, ghost, link
//  - Sizes:    default, sm, lg, icon
//  Soporta asChild para renderizar Slot (Radix) y propaga clases combinadas.
//  Incluye estilos de accesibilidad (focus-visible) y estados disabled.
//===========================================================================//

//---------------------------------------------------------------------------//
//                                IMPORTS                                   //
//---------------------------------------------------------------------------//

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import styles from "./button.module.css";

//---------------------------------------------------------------------------//

//---------------------------------------------------------------------------//
// Variantes de estilo y tamaños (class-variance-authority)
// - variant: controla color/fondo/bordes según semántica.
// - size: controla altura/padding y casos con icono.
// Notas:
// - [&_svg] asegura que hijos SVG no intercepten eventos.
// - focus-visible aplica ring accesible en teclado.
//---------------------------------------------------------------------------//
const buttonVariants = cva(
  styles.base,
  {
    variants: {
      variant: {
        // Acciones primarias. Contraste alto texto/fondo.
        default: styles.variantDefault,
        // Acciones destructivas/alerta. Ring y fondo ajustado para dark mode.
        destructive: styles.variantDestructive,
        // Botón con borde. Útil en superficies neutrales; mejora contraste en dark.
        outline: styles.variantOutline,
        // Alternativa menos prominente que default.
        secondary: styles.variantSecondary,
        // Estilo mínimo; resalta solo en hover.
        ghost: styles.variantGhost,
        // Apariencia de enlace. No tiene fondo ni borde.
        link: styles.variantLink,
      },
      size: {
        // Tamaño estándar; ajusta padding si contiene un icono directo (>svg).
        default: styles.sizeDefault,
        // Compacto para densidad alta.
        sm: styles.sizeSm,
        // Más alto y ancho para énfasis o textos largos.
        lg: styles.sizeLg,
        // Forma cuadrada para icon-only buttons.
        icon: styles.sizeIcon,
      },
    },
    // Valores por defecto: primario y tamaño estándar.
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

//---------------------------------------------------------------------------//
// Componente Button
// - asChild: renderiza Slot para usar otro contenedor (ej. <a> o <Link>).
// - cn: combina clases dinámicas de variantes con className externo.
// - data-slot="button": útil para depuración/selección en tests.
// Nota: si se requiere ref, convertir a forwardRef sin cambiar API pública.
//---------------------------------------------------------------------------//
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
