export function InterpretationGrid() {
  return (
    <div className="h-full min-h-0 rounded-2xl bg-[#000000]/35 border border-[#3B4BFF]/15 p-6 flex flex-col">
      {/* Forma general */}
      <div className="mb-6 text-center">
        <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">
          Forma general de la cónica
        </div>
        <div className="text-lg md:text-xl font-mono text-[#4DFF8F] tracking-wide">
          Ax² + Bxy + Cy² + Dx + Ey + F = 0
        </div>
      </div>

      {/* Subtítulo */}
      <p className="mb-6 text-sm text-gray-400 font-mono text-center max-w-md mx-auto">
        Cada coeficiente influye directamente en la{' '}
        <span className="text-white">forma</span>,{' '}
        <span className="text-white">orientación</span> y{' '}
        <span className="text-white">posición</span> de la cónica.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-5">
        <CoeffCard title="A · x²">
          Controla la <span className="text-white">curvatura en el eje X</span>.
          Determina si la cónica se abre horizontalmente.
        </CoeffCard>

        <CoeffCard title="C · y²">
          Controla la <span className="text-white">curvatura en el eje Y</span>.
          Determina si la cónica se abre verticalmente.
        </CoeffCard>

        <CoeffCard title="B · xy">
          Introduce <span className="text-white">rotación</span> de la cónica.
          Si B = 0, los ejes están alineados con X e Y.
        </CoeffCard>

        <CoeffCard title="D · x">
          Provoca un <span className="text-white">desplazamiento horizontal</span>{" "}
          del centro.
        </CoeffCard>

        <CoeffCard title="E · y">
          Provoca un <span className="text-white">desplazamiento vertical</span>{" "}
          del centro.
        </CoeffCard>

        <CoeffCard title="F">
          Ajusta la <span className="text-white">posición global</span>{" "}
          de la cónica.
        </CoeffCard>
      </div>
    </div>
  );
}

function CoeffCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#0A0A0F]/70 border border-[#3B4BFF]/20 p-5">
      <div className="text-sm font-mono text-[#3B4BFF] mb-2">
        {title}
      </div>
      <p className="text-sm text-gray-400 font-mono leading-relaxed">
        {children}
      </p>
    </div>
  );
}
