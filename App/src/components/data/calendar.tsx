//===========================================================================//
//                                  CALENDAR                                  //
//===========================================================================//
//  Componente calendario basado en react-day-picker.
//  - Usa classNames para mapear estilos por parte del calendario.
//  - Integra buttonVariants para los días (como botones fantasma).
//  - CSS aislado via calendar.module.css para orden y mantenibilidad.
//  Accesibilidad:
//  - focus-within para resaltar la celda activa.
//  - Estados aria-* (selected/disabled/outside) reflejados en estilos.
//===========================================================================//

"use client";

//---------------------------------------------------------------------------//
//                                IMPORTS                                   //
//---------------------------------------------------------------------------//

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "../../lib/utils";
import { buttonVariants } from "../buttons/button";
import styles from "./calendar.module.css";

//---------------------------------------------------------------------------//

//---------------------------------------------------------------------------//
// Componente <Calendar />
// - Props:
//   - className: clase adicional para el contenedor raíz.
//   - classNames: mapeo de clases para partes del calendario (months, day, etc).
//   - showOutsideDays: muestra/oculta días fuera del mes actual (default: true).
// - Usa DayPicker de react-day-picker con estilos personalizados.
// - Integra buttonVariants para los días como botones fantasma.
//---------------------------------------------------------------------------// 

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // Contenedor raíz del calendario
      className={cn(styles.root, className)}
      //---------------------------------------------------------------------------//
      // Mapeo de clases por parte del calendario (react-day-picker)
      // - months, month, caption, nav, table, row, cell, day, etc.
      // - Se combinan con buttonVariants para conservar semántica de botón en días.
      //---------------------------------------------------------------------------//
      classNames={{
        months: styles.months,
        month: styles.month,
        caption: styles.caption,
        caption_label: styles.captionLabel,
        nav: styles.nav,
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          styles.navButton,
        ),
        nav_button_previous: styles.navButtonPrevious,
        nav_button_next: styles.navButtonNext,
        table: styles.table,
        head_row: styles.headRow,
        head_cell: styles.headCell,
        row: styles.row,
        cell: cn(
          styles.cell,
          props.mode === "range" ? styles.cellRange : styles.cellSingle,
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          styles.day,
        ),
        day_range_start: styles.dayRangeStart,
        day_range_end: styles.dayRangeEnd,
        day_selected: styles.daySelected,
        day_today: styles.dayToday,
        day_outside: styles.dayOutside,
        day_disabled: styles.dayDisabled,
        day_range_middle: styles.dayRangeMiddle,
        day_hidden: styles.dayHidden,
        // Permite sobrescribir desde fuera sin perder los estilos base.
        ...classNames,
      }}
      //---------------------------------------------------------------------------//
      // Caption personalizado: mes visible + iconos
      // - Mantiene layout accesible y semántico.
      //---------------------------------------------------------------------------//
      components={{
        Caption: ({ displayMonth }: { displayMonth: Date }) => (
          <div className={styles.caption}>
            <ChevronLeft className={styles.captionIcon} />
            <span className={styles.captionLabel}>
              {displayMonth.toLocaleDateString()}
            </span>
            <ChevronRight className={styles.captionIcon} />
          </div>
        ),
      } as any}
      {...props}
    />
  );
}

export { Calendar };
