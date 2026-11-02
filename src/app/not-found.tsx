import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-[#F2F6FC]">
      <h2 className="text-xl font-bold text-[#1E3A8A] mb-2">Página no encontrada</h2>
      <p className="text-xs text-slate-500 mb-4">La ruta solicitada no existe en el sistema.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
      >
        Volver a Inicio
      </Link>
    </div>
  );
}

