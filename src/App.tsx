import React, { useState, useRef, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  ChevronLeft,
  ChevronRight, 
  Package, 
  Calendar, 
  MapPin, 
  User, 
  UserCheck, 
  History, 
  Calculator, 
  Minus, 
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  Search,
  AlertCircle,
  CheckCircle2,
  X,
  Signature,
  Camera,
  Image as ImageIcon,
  Maximize2,
  Trash2,
  Wifi,
  WifiOff,
  Home,
  Sun,
  Tractor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Transbordo {
  id: string;
  chofer_anterior: string;
  chofer_nuevo: string;
  timestamp: string;
  firma: string;
}

interface Observation {
  id: string;
  text: string;
  timestamp: string;
}

interface VehicleImage {
  id: string;
  url: string;
  nota: string;
  timestamp: string;
}

interface Vehicle {
  id: string;
  chofer: string;
  proveedor: string;
  compra: string;
  picking: string;
  finca?: string;
  semillero?: string;
  despachador?: string;
  estado: 'borrador' | 'espera' | 'completado';
  costales: number;
  semillas_x_costal: number;
  costales_esperados: number;
  observaciones: string;
  historial_observaciones: Observation[];
  transbordos: Transbordo[];
  imagenes: VehicleImage[];
  fecha_creacion: string;
  fecha_finalizacion?: string;
}

// --- Mock Data ---

const MOCK_CHOFERES = [
  'Juan Pérez', 
  'Carlos Rodríguez', 
  'Mario Castañeda', 
  'Roberto Gómez', 
  'Luis Martínez',
  'Andrés Herrera'
];
const MOCK_PROVEEDORES = ['AgroPiña S.A.', 'Frutas del Valle', 'Semillas del Norte', 'BioPlantas'];
const MOCK_COMPRAS: Record<string, string[]> = {
  'AgroPiña S.A.': ['PO-2024-001', 'PO-2024-005', 'PO-2024-012'],
  'Frutas del Valle': ['PO-2024-002', 'PO-2024-008'],
  'Semillas del Norte': ['PO-2024-003', 'PO-2024-009', 'PO-2024-015'],
  'BioPlantas': ['PO-2024-004', 'PO-2024-010']
};
const MOCK_FINCAS = ['Hacienda Puricaure', 'Hacienda El Paraíso', 'Finca La Esperanza', 'Finca San José'];
const MOCK_SEMILLEROS = ['1', '2', '3', '4', '5', '6'];
const MOCK_DESPACHADORES = ['Miguel Ángel', 'Roberto Carlos', 'Ana María', 'Luis Fernando'];

// --- Components ---

const TransbordoWizard = ({ 
  onSave, 
  onCancel, 
  currentDriver 
}: { 
  onSave: (data: { oldDriver: string, newDriver: string, firma: string }) => void; 
  onCancel: () => void;
  currentDriver: string;
}) => {
  const [step, setStep] = useState(1);
  const [oldDriver, setOldDriver] = useState(currentDriver);
  const [newDriver, setNewDriver] = useState('');

  return (
    <AnimatePresence mode="wait">
      {step === 1 ? (
        <motion.div 
          key="step1"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10"
        >
          <div className="w-full max-w-xl bg-[#0D0D0D] rounded-[40px] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-[#FF8C00] uppercase tracking-[0.4em] opacity-70">Paso 1 de 2</span>
              <h2 className="text-2xl font-black text-white tracking-tighter">Selección de Choferes</h2>
            </div>

            <div className="space-y-6">
              <ElevatedSelect 
                label="Chofer Actual" 
                icon={User} 
                options={MOCK_CHOFERES}
                value={oldDriver}
                onChange={(e: any) => setOldDriver(e.target.value)}
                disabled={true}
              />
              <ElevatedSelect 
                label="Nuevo Chofer" 
                icon={UserCheck} 
                options={MOCK_CHOFERES}
                value={newDriver}
                onChange={(e: any) => setNewDriver(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onCancel}
                className="py-6 bg-white/5 text-white/40 rounded-2xl font-black text-xs md:text-sm hover:bg-white/10 transition-all uppercase tracking-[0.3em]"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setStep(2)}
                disabled={!oldDriver || !newDriver}
                className="py-6 bg-[#FF8C00] text-black rounded-2xl font-black text-xs md:text-sm hover:bg-[#FF8C00]/90 transition-all uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(255,140,0,0.3)] disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="step2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[100]"
        >
          <SignaturePad 
            onSave={(firma) => onSave({ oldDriver, newDriver, firma })}
            onCancel={() => setStep(1)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SignaturePad = ({ onSave, onCancel }: { onSave: (data: string) => void; onCancel: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configuración inicial del canvas
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fondo negro
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if ('touches' in e) e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-[#0D0D0D] rounded-[40px] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col gap-10"
      >
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-[#FF8C00] uppercase tracking-[0.4em] opacity-70">Validación Final</span>
            <h2 className="text-2xl font-black text-white tracking-tighter">Firma de Conformidad</h2>
          </div>
          <button 
            onClick={clear}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            Limpiar Lienzo
          </button>
        </div>

        <div className="relative aspect-[2/1] w-full bg-black rounded-[32px] overflow-hidden border border-white/5 shadow-inner">
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair touch-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCancel}
            className="py-6 bg-white/5 text-white/60 rounded-2xl font-black text-xs md:text-sm hover:bg-white/10 transition-all uppercase tracking-[0.3em]"
          >
            Cancelar
          </button>
          <button 
            onClick={save}
            className="py-6 bg-[#FF8C00] text-black rounded-2xl font-black text-xs md:text-sm hover:bg-[#FF8C00]/90 transition-all uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(255,140,0,0.3)]"
          >
            Confirmar Firma
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ElevatedInput = ({ label, icon: Icon, value, onChange, disabled, type = "text", placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF8C00]/60 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Icon className="w-4 h-4 text-[#FF8C00]/30 group-focus-within:text-[#FF8C00] transition-colors" />
      </div>
      <input 
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "w-full bg-[#0D0D0D] border border-white/5 rounded-lg py-3 pl-11 pr-4 text-sm font-medium text-[#FF8C00] placeholder:text-white/40 outline-none transition-all",
          !disabled && "focus:border-[#FF8C00]/30 focus:bg-[#121212]",
          disabled && "opacity-60 cursor-default"
        )}
      />
    </div>
  </div>
);

const ElevatedSelect = ({ label, icon: Icon, value, onChange, options, disabled }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF8C00]/60 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Icon className="w-4 h-4 text-[#FF8C00]/30 group-focus-within:text-[#FF8C00] transition-colors" />
      </div>
      <select 
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full bg-[#0D0D0D] border border-white/5 rounded-lg py-3 pl-11 pr-10 text-sm font-medium text-[#FF8C00] appearance-none outline-none transition-all",
          !disabled && "focus:border-[#FF8C00]/30 focus:bg-[#121212]",
          disabled && "opacity-60 cursor-default"
        )}
      >
        <option value="">Seleccionar...</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronRight className="w-4 h-4 text-[#FF8C00]/50 rotate-90" />
      </div>
    </div>
  </div>
);

// --- Main App ---

// --- Views ---

const DashboardView = ({ onNavigate }: { onNavigate: (view: 'list' | 'prep') => void }) => {
  const [showFincaModal, setShowFincaModal] = useState(false);
  const [activeFinca, setActiveFinca] = useState('Hacienda Puricaure');
  const fincas = ['Hacienda Puricaure', 'Finca El Paraíso', 'Hacienda La Esperanza'];

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24 px-4 pt-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-[#FF8C00]">Hola, Roberto!</h1>
          
          {/* Farm Selector */}
          <div 
            onClick={() => setShowFincaModal(true)}
            className="inline-flex items-center gap-3 bg-[#0D0D0D] px-6 py-4 rounded-2xl shadow-lg cursor-pointer hover:bg-[#1A1A1A] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#FF8C00]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#FF8C00]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Finca Activa</p>
              <p className="text-lg font-medium text-white">{activeFinca}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30 ml-2" />
          </div>
        </div>

        {/* Weather Widget */}
        <div className="flex items-center gap-4 bg-[#0D0D0D] px-6 py-4 rounded-2xl shadow-lg">
          <Sun className="w-8 h-8 text-[#FF8C00]" />
          <div>
            <p className="text-2xl font-light text-white">28°C</p>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Soleado</p>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-white/50 uppercase tracking-[0.2em] px-2">Módulos Disponibles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recepción de Semillas Card */}
          <div 
            onClick={() => onNavigate('list')}
            className="group relative bg-[#0D0D0D] p-8 rounded-3xl shadow-xl cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#FF8C00]/5"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF8C00] to-transparent opacity-50" />
            
            <div className="flex flex-col h-full justify-between gap-12">
              <div className="w-16 h-16 rounded-2xl bg-[#FF8C00]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Truck className="w-8 h-8 text-[#FF8C00]" />
              </div>
              
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-medium text-white group-hover:text-[#FF8C00] transition-colors">Recepción de Semillas</h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Gestiona el ingreso de camiones, registro de pesos y control de calidad.
                  </p>
                </div>
                <div className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FF8C00] transition-colors">
                  <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-black transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Preparación de Tierra Card */}
          <div 
            onClick={() => onNavigate('prep')}
            className="group relative bg-[#0D0D0D] p-8 rounded-3xl shadow-xl cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#FF8C00]/5 border border-white/5 hover:border-[#FF8C00]/30"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF8C00] to-transparent opacity-30 group-hover:opacity-50 transition-opacity" />
            
            <div className="flex flex-col h-full justify-between gap-12">
              <div className="w-16 h-16 rounded-2xl bg-[#FF8C00]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Tractor className="w-8 h-8 text-[#FF8C00]" />
              </div>
              
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-medium text-white group-hover:text-[#FF8C00] transition-colors">Preparación de Tierra</h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Planifica y registra labores de arado, rastreo y nivelación.
                  </p>
                </div>
                <div className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FF8C00] transition-colors">
                  <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-black transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finca Modal */}
      <AnimatePresence>
        {showFincaModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowFincaModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0D0D0D] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Seleccionar Finca</h3>
                <button onClick={() => setShowFincaModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
              <div className="p-2">
                {fincas.map(finca => (
                  <button
                    key={finca}
                    onClick={() => {
                      setActiveFinca(finca);
                      setShowFincaModal(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-colors",
                      activeFinca === finca ? "bg-[#FF8C00]/10 text-[#FF8C00]" : "text-white hover:bg-white/5"
                    )}
                  >
                    <span className="font-medium">{finca}</span>
                    {activeFinca === finca && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface PrepTask {
  id: string;
  lote: string;
  actividad: string;
  operador: string;
  estado: 'En Proceso' | 'Finalizado' | 'Borrador';
}

const PrepView = ({ onGoHome }: { onGoHome: () => void }) => {
  const [tasks] = useState<PrepTask[]>([
    { id: 'HPR-PT-001', lote: 'Lote A-12', actividad: 'Arado Profundo', operador: 'Carlos Mendoza', estado: 'En Proceso' },
    { id: 'HPR-PT-002', lote: 'Lote B-05', actividad: 'Rastreo', operador: 'Luis Fernando', estado: 'Finalizado' },
    { id: 'HPR-PT-003', lote: 'Lote C-08', actividad: 'Nivelación', operador: 'José Ramírez', estado: 'Borrador' },
    { id: 'HPR-PT-004', lote: 'Lote A-15', actividad: 'Subsolado', operador: 'Miguel Ángel', estado: 'En Proceso' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('Todos');
  const [filterActividad, setFilterActividad] = useState<string>('Todas');
  const [filterLote, setFilterLote] = useState<string>('Todos');

  const uniqueActividades = Array.from(new Set(tasks.map(t => t.actividad)));
  const uniqueLotes = Array.from(new Set(tasks.map(t => t.lote)));

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.operador.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesEstado = filterEstado === 'Todos' || task.estado === filterEstado;
    const matchesActividad = filterActividad === 'Todas' || task.actividad === filterActividad;
    const matchesLote = filterLote === 'Todos' || task.lote === filterLote;

    return matchesSearch && matchesEstado && matchesActividad && matchesLote;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-4 pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onGoHome}
            className="p-3 bg-[#0D0D0D] text-[#FF8C00] rounded-2xl hover:bg-[#FF8C00]/10 transition-colors shadow-lg"
            title="Volver al Inicio"
          >
            <Home className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Preparación de Tierra</h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-[#FF8C00]" />
              <span className="text-sm font-medium text-white/50 uppercase tracking-wider">Hacienda Puricaure</span>
            </div>
          </div>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-[#FF8C00] text-black px-6 py-4 rounded-2xl font-bold hover:bg-[#FF8C00]/90 transition-colors shadow-lg shadow-[#FF8C00]/20">
          <Plus className="w-5 h-5" />
          Iniciar Nueva Labor
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#111111] p-6 rounded-3xl shadow-xl border border-white/5 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#FF8C00]" />
          </div>
          <input
            type="text"
            placeholder="Buscar por ID, Lote u Operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-black border border-[#FF8C00]/50 rounded-2xl text-[#FF8C00] placeholder-white/20 focus:outline-none focus:border-[#FF8C00] focus:ring-1 focus:ring-[#FF8C00] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className={clsx(
              "bg-black border rounded-xl px-5 py-3 text-sm focus:outline-none transition-all appearance-none pr-12 relative",
              filterEstado !== 'Todos' 
                ? "border-[#FF8C00]/50 text-[#FF8C00]" 
                : "border-white/5 text-white/70 hover:border-white/10"
            )}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FF8C00'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
          >
            <option value="Todos">Todos los Estados</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Borrador">Borrador</option>
          </select>

          <select
            value={filterActividad}
            onChange={(e) => setFilterActividad(e.target.value)}
            className={clsx(
              "bg-black border rounded-xl px-5 py-3 text-sm focus:outline-none transition-all appearance-none pr-12",
              filterActividad !== 'Todas' 
                ? "border-[#FF8C00]/50 text-[#FF8C00]" 
                : "border-white/5 text-white/70 hover:border-white/10"
            )}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FF8C00'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
          >
            <option value="Todas">Todas las Actividades</option>
            {uniqueActividades.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>

          <select
            value={filterLote}
            onChange={(e) => setFilterLote(e.target.value)}
            className={clsx(
              "bg-black border rounded-xl px-5 py-3 text-sm focus:outline-none transition-all appearance-none pr-12",
              filterLote !== 'Todos' 
                ? "border-[#FF8C00]/50 text-[#FF8C00]" 
                : "border-white/5 text-white/70 hover:border-white/10"
            )}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FF8C00'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
          >
            <option value="Todos">Todos los Lotes</option>
            {uniqueLotes.map(lote => (
              <option key={lote} value={lote}>{lote}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table/List */}
      <div className="bg-[#0D0D0D] rounded-3xl shadow-xl overflow-hidden">
        {/* Table Header (Hidden on small screens, visible on md+) */}
        <div className="hidden md:grid grid-cols-5 gap-4 p-6 border-b border-white/5 text-xs font-bold text-white/40 uppercase tracking-widest">
          <div>ID Labor</div>
          <div>Lote</div>
          <div>Actividad</div>
          <div>Operador</div>
          <div>Estado</div>
        </div>

        {/* List Items */}
        <div className="flex flex-col">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/60 text-lg">No se encontraron labores de preparación</p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div 
                key={task.id}
                onClick={() => console.log(`Entrando al detalle de ${task.id}`)}
                className={clsx(
                  "grid grid-cols-1 md:grid-cols-5 gap-4 p-6 cursor-pointer transition-colors duration-200 hover:bg-[#161616] active:bg-[#161616]",
                  index !== filteredTasks.length - 1 && "border-b border-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.02)]"
                )}
              >
                {/* ID */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Tractor className="w-5 h-5 text-white/50" />
                  </div>
                  <div>
                    <span className="md:hidden text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">ID Labor</span>
                    <span className="font-mono text-white font-medium">{task.id}</span>
                  </div>
                </div>

                {/* Lote */}
                <div className="flex items-center">
                  <div>
                    <span className="md:hidden text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Lote</span>
                    <span className="text-white/80">{task.lote}</span>
                  </div>
                </div>

                {/* Actividad */}
                <div className="flex items-center">
                  <div>
                    <span className="md:hidden text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Actividad</span>
                    <span className="text-white/80">{task.actividad}</span>
                  </div>
                </div>

                {/* Operador */}
                <div className="flex items-center">
                  <div>
                    <span className="md:hidden text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Operador</span>
                    <span className="text-white/80">{task.operador}</span>
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center justify-between md:justify-start">
                  <div>
                    <span className="md:hidden text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">Estado</span>
                    <div className="flex items-center gap-2">
                      {task.estado === 'En Proceso' && (
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8C00] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF8C00] shadow-[0_0_8px_#FF8C00]"></span>
                        </div>
                      )}
                      <span className={clsx(
                        "font-medium",
                        task.estado === 'En Proceso' ? "text-[#FF8C00]" : 
                        task.estado === 'Finalizado' ? "text-emerald-500" : "text-white/50"
                      )}>
                        {task.estado}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mobile chevron */}
                  <ChevronRight className="w-5 h-5 text-white/20 md:hidden" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ListView = ({ vehicles, onNewVehicle, onSelectVehicle, isOnline, onGoHome }: { 
  vehicles: Vehicle[], 
  onNewVehicle: () => void, 
  onSelectVehicle: (v: Vehicle) => void,
  isOnline: boolean,
  onGoHome: () => void
}) => {
  const [filterStage, setFilterStage] = useState<string>('todos');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filteredVehicles = vehicles.filter(v => {
    const matchesStage = filterStage === 'todos' || v.estado === filterStage;
    const matchesDate = !filterDate || v.fecha_creacion === filterDate || (v.fecha_finalizacion && v.fecha_finalizacion === filterDate);
    const matchesSearch = !searchTerm || 
      v.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.compra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.chofer?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesDate && matchesSearch;
  });

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;
  const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStage, filterDate, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="flex items-end justify-between px-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={onGoHome}
            className="p-3 bg-[#0D0D0D] text-[#FF8C00] rounded-xl hover:bg-[#FF8C00]/10 transition-colors"
            title="Volver al Inicio"
          >
            <Home className="w-6 h-6" />
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-light tracking-tight text-[#FF8C00]">Registro de Semilla</h1>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.4em]">Panel de Control · High-End Edition</p>
          </div>
        </div>
        <button 
          onClick={onNewVehicle}
          disabled={!isOnline}
          title={!isOnline ? "No se pueden registrar nuevas recepciones sin conexión" : ""}
          className={cn(
            "px-8 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all uppercase tracking-widest",
            isOnline 
              ? "bg-[#FF8C00] text-black hover:bg-[#FF8C00]/90" 
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          <Plus className="w-4 h-4" />
          Registrar
        </button>
      </div>

      <div className="flex items-center gap-2 px-2 overflow-x-auto no-scrollbar pb-1">
        <div 
          className="relative flex items-center gap-2 bg-[#0D0D0D] border border-white/5 rounded-lg px-3 py-1.5 hover:border-[#FF8C00]/30 transition-all cursor-pointer group shrink-0 min-w-[140px]"
          onClick={(e) => {
            const input = e.currentTarget.querySelector('input');
            if (input) input.showPicker?.() || input.focus();
          }}
        >
          <Calendar className="w-3.5 h-3.5 text-[#FF8C00]/60 group-hover:text-[#FF8C00] transition-colors" />
          <div className="flex flex-col">
            <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/50">Filtrar Fecha</span>
            <input 
              type="date" 
              value={filterDate}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-[#FF8C00] outline-none cursor-pointer [color-scheme:dark] w-full"
            />
          </div>
        </div>
        
        <div className="relative flex items-center gap-2 bg-[#0D0D0D] border border-white/5 rounded-lg px-3 py-1.5 hover:border-[#FF8C00]/30 transition-all cursor-pointer group shrink-0 min-w-[140px]">
          <ClipboardList className="w-3.5 h-3.5 text-[#FF8C00]/60 group-hover:text-[#FF8C00] transition-colors" />
          <div className="flex flex-col flex-1">
            <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/50">Filtrar Etapa</span>
            <select 
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-[#FF8C00] outline-none appearance-none cursor-pointer w-full [color-scheme:dark]"
            >
              <option value="todos" className="bg-[#0D0D0D] text-white">Todas las Etapas</option>
              <option value="borrador" className="bg-[#0D0D0D] text-white">Borrador</option>
              <option value="espera" className="bg-[#0D0D0D] text-white">En Espera</option>
              <option value="completado" className="bg-[#0D0D0D] text-white">Completado</option>
            </select>
          </div>
          <ChevronRight className="w-2.5 h-2.5 text-[#FF8C00]/40 rotate-90 pointer-events-none" />
        </div>

        <div className="relative flex items-center gap-2 bg-[#0D0D0D] border border-white/5 rounded-lg px-3 py-1.5 hover:border-[#FF8C00]/30 transition-all group flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 text-[#FF8C00]/60 group-hover:text-[#FF8C00] transition-colors" />
          <div className="flex flex-col flex-1">
            <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/50">Buscar</span>
            <input 
              type="text" 
              placeholder="Proveedor o Compra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-[#FF8C00] outline-none placeholder:text-[#FF8C00]/20 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#0D0D0D] border border-white/5 rounded-lg px-3 py-1.5 flex items-center justify-center min-w-[70px]">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#FF8C00]">
              {currentPage} <span className="text-white/40 mx-0.5">/</span> {totalPages}
            </span>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-[#0D0D0D] border border-white/5 text-[#FF8C00] hover:bg-[#FF8C00]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[#0D0D0D] border border-white/5 text-[#FF8C00] hover:bg-[#FF8C00]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {(filterDate || filterStage !== 'todos' || searchTerm) && (
          <button 
            onClick={() => { setFilterDate(''); setFilterStage('todos'); setSearchTerm(''); }}
            className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white/50 hover:text-[#FF8C00] transition-colors flex items-center gap-1 shrink-0"
          >
            <X className="w-2.5 h-2.5" />
            Limpiar
          </button>
        )}
      </div>

      <div className="bg-[#0D0D0D] rounded-lg overflow-hidden shadow-2xl border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/60">Chofer</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/60">Proveedor</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/60">Compra</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/60">Estado</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white/60 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedVehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-white/50 italic">No se encontraron registros</td>
              </tr>
            ) : (
              paginatedVehicles.map((v) => (
                <tr 
                  key={v.id} 
                  onClick={() => onSelectVehicle(v)}
                  className="group hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{v.id}</span>
                      <span className="text-lg font-medium text-[#FF8C00] block truncate max-w-[200px]">
                        {v.transbordos && v.transbordos.length > 0 
                          ? v.transbordos[v.transbordos.length - 1].chofer_nuevo 
                          : v.chofer || '---'}
                      </span>
                      <span className="text-[10px] text-white/50 uppercase tracking-widest">
                        {v.estado === 'completado' ? `Finalizado: ${v.fecha_finalizacion}` : `Creado: ${v.fecha_creacion}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-normal text-white/60">{v.proveedor || '---'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono text-white/40">{v.compra || '---'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      v.estado === 'borrador' ? "bg-white/5 text-white/40" :
                      v.estado === 'espera' ? "bg-[#FF8C00]/10 text-[#FF8C00]" :
                      "bg-[#FF8C00] text-black"
                    )}>
                      {v.estado}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#FF8C00] transition-all group-hover:translate-x-1 inline-block" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FormView = ({ 
  selectedVehicle, 
  setView, 
  setSelectedVehicle, 
  onConfirmRegistration,
  computedPicking,
  setIsSigning
}: { 
  selectedVehicle: Vehicle | null, 
  setView: (v: any) => void, 
  setSelectedVehicle: (v: any) => void,
  onConfirmRegistration: () => void,
  computedPicking: string,
  setIsSigning: (v: boolean) => void
}) => {
  if (!selectedVehicle) return null;
  const isLocked = selectedVehicle.estado !== 'borrador';
  const isPickingOccupied = selectedVehicle.proveedor === 'Semillas del Norte';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setView('dashboard')}
            className="p-2 bg-[#0D0D0D] text-[#FF8C00] rounded-xl hover:bg-[#FF8C00]/10 transition-colors"
            title="Volver al Inicio"
          >
            <Home className="w-5 h-5" />
          </button>
          <button onClick={() => setView('list')} className="flex items-center gap-4 text-white/40 hover:text-[#FF8C00] transition-colors group">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase">Volver</span>
          </button>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">ID Registro</p>
          <p className="text-xl font-medium text-[#FF8C00]">{selectedVehicle.id}</p>
        </div>
      </div>

      <div className="bg-[#0D0D0D] rounded-3xl p-8 md:p-10 shadow-2xl border border-white/5 space-y-8">
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <UserCheck className="w-6 h-6 text-[#FF8C00]/60" />
          <h2 className="text-xl font-medium uppercase tracking-widest">Identificación</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ElevatedSelect 
            label="Chofer (Odoo Master)" 
            icon={User} 
            options={MOCK_CHOFERES}
            value={selectedVehicle.chofer}
            onChange={(e: any) => setSelectedVehicle({...selectedVehicle, chofer: e.target.value})}
            disabled={isLocked}
          />
          <ElevatedSelect 
            label="Proveedor" 
            icon={MapPin}
            options={MOCK_PROVEEDORES}
            value={selectedVehicle.proveedor}
            onChange={(e: any) => setSelectedVehicle({...selectedVehicle, proveedor: e.target.value, compra: ''})}
            disabled={isLocked}
          />
          <ElevatedSelect 
            label="Orden de Compra" 
            icon={ClipboardList}
            options={selectedVehicle.proveedor ? MOCK_COMPRAS[selectedVehicle.proveedor] : []}
            value={selectedVehicle.compra}
            onChange={(e: any) => setSelectedVehicle({...selectedVehicle, compra: e.target.value})}
            disabled={isLocked || !selectedVehicle.proveedor}
          />
          <ElevatedSelect 
            label="Finca" 
            icon={MapPin}
            options={MOCK_FINCAS}
            value={selectedVehicle.finca || ''}
            onChange={(e: any) => setSelectedVehicle({...selectedVehicle, finca: e.target.value})}
            disabled={isLocked}
          />
          <ElevatedSelect 
            label="Semillero" 
            icon={Package}
            options={MOCK_SEMILLEROS}
            value={selectedVehicle.semillero || ''}
            onChange={(e: any) => setSelectedVehicle({...selectedVehicle, semillero: e.target.value})}
            disabled={isLocked}
          />
          <ElevatedSelect 
            label="Despachador" 
            icon={UserCheck}
            options={MOCK_DESPACHADORES}
            value={selectedVehicle.despachador || ''}
            onChange={(e: any) => setSelectedVehicle({...selectedVehicle, despachador: e.target.value})}
            disabled={isLocked}
          />
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1">Fecha de Registro</label>
            <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-lg py-3 px-4 hover:border-[#FF8C00]/30 transition-all group">
              <Calendar className="w-4 h-4 text-[#FF8C00]/60 group-hover:text-[#FF8C00] transition-colors" />
              <input 
                type="date" 
                value={selectedVehicle.fecha_creacion}
                onChange={(e) => setSelectedVehicle({...selectedVehicle, fecha_creacion: e.target.value})}
                disabled={isLocked}
                className="bg-transparent text-sm font-medium text-[#FF8C00] outline-none w-full [color-scheme:dark] disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1">Picking Odoo</label>
            <div className="flex gap-4">
              <div className={cn(
                "flex-1 bg-black/40 border border-white/5 rounded-lg py-3 px-4 flex items-center justify-between transition-all",
                isPickingOccupied && "border-red-500/20 bg-red-500/[0.02]"
              )}>
                <span className={cn(
                  "text-sm font-medium",
                  isPickingOccupied ? "text-red-400" : "text-[#FF8C00]/80"
                )}>
                  {isPickingOccupied ? 'No disponible' : (computedPicking || '---')}
                </span>
                {isPickingOccupied && <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />}
              </div>
              {isPickingOccupied && !isLocked && (
                <button className="bg-[#FF8C00]/10 text-[#FF8C00] px-4 rounded-lg flex items-center justify-center hover:bg-[#FF8C00]/20 transition-all border border-[#FF8C00]/20">
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {selectedVehicle.compra && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/5">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-[#FF8C00]/20 transition-all">
              <div className="space-y-1">
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/50">Pendientes por Recibir</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light text-[#FF8C00] tracking-tighter">
                    {selectedVehicle.compra === 'PO-2024-001' ? '1,250' : 
                     selectedVehicle.compra === 'PO-2024-002' ? '800' : 
                     selectedVehicle.compra === 'PO-2024-003' ? '2,100' : '0'}
                  </span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Costales</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] text-white/40 group-hover:text-[#FF8C00]/40 transition-colors">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-[#FF8C00]/20 transition-all">
              <div className="space-y-1">
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/50">Producto a Recibir</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-light text-[#FF8C00] tracking-tighter">Semilla de Piña</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] text-white/40 group-hover:text-[#FF8C00]/40 transition-colors">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-white/5">
          {!isLocked ? (
            <button 
              onClick={onConfirmRegistration}
              className="w-full bg-[#FF8C00] text-black py-4 rounded-lg font-bold text-sm shadow-lg hover:bg-[#FF8C00]/90 transition-all uppercase tracking-widest"
            >
              Confirmar Registro
            </button>
          ) : (
            <div className="flex flex-col gap-6">
              {selectedVehicle.estado === 'completado' && (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-inner">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <Calculator className="w-5 h-5 text-[#FF8C00]/60" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#FF8C00]">Resumen de Operación</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">Costales Recibidos</p>
                      <p className="text-3xl font-light text-white/90">{selectedVehicle.costales}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">Semillas x Costal</p>
                      <p className="text-3xl font-light text-white/90">{selectedVehicle.semillas_x_costal}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 bg-[#FF8C00]/5 border border-[#FF8C00]/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FF8C00]/60 mb-1">Total Semillas</p>
                      <p className="text-3xl font-medium text-[#FF8C00]">{(selectedVehicle.costales * selectedVehicle.semillas_x_costal).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedVehicle.transbordos && selectedVehicle.transbordos.length > 0 && (
                    <div className="pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 mb-4">
                        <Truck className="w-4 h-4 text-[#FF8C00]/60" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/70">Historial de Transbordos</h4>
                      </div>
                      <div className="space-y-3">
                        {selectedVehicle.transbordos.map((t, i) => (
                          <div key={t.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-white/5 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 font-bold text-xs">
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white/80 flex items-center gap-2 flex-wrap">
                                  {t.chofer_anterior} 
                                  <ChevronRight className="w-3 h-3 text-[#FF8C00]" /> 
                                  <span className="text-[#FF8C00]">{t.chofer_nuevo}</span>
                                </p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{new Date(t.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                            {t.firma && (
                              <div className="shrink-0 bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                <img src={t.firma} alt="Firma" className="h-8 object-contain opacity-80" style={{ filter: 'hue-rotate(15deg) saturate(200%) brightness(150%)' }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="w-full bg-white/[0.02] border border-white/5 rounded-lg py-4 px-6 flex items-center gap-4">
                <CheckCircle2 className={cn(
                  "w-5 h-5",
                  selectedVehicle.estado === 'completado' ? "text-emerald-500" : "text-[#FF8C00]/70"
                )} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Estado</p>
                  <p className={cn(
                    "text-sm font-bold uppercase tracking-widest",
                    selectedVehicle.estado === 'completado' ? "text-emerald-500" : "text-[#FF8C00]/80"
                  )}>
                    {selectedVehicle.estado === 'completado' ? 'Registro Completado' : 'En Espera de Operación'}
                  </p>
                </div>
              </div>
              {selectedVehicle.estado !== 'completado' && (
                <button 
                  onClick={() => setView('operation')}
                  className="w-full bg-[#FF8C00] text-black py-5 rounded-lg font-bold text-lg shadow-xl hover:bg-[#FF8C00]/90 transition-all flex items-center justify-center gap-4 uppercase tracking-widest"
                >
                  <Calculator className="w-6 h-6" />
                  Registrar Valores
                </button>
              )}
              {selectedVehicle.estado === 'completado' && (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setView('operation')}
                    className="w-full bg-white/5 text-white/60 py-4 rounded-lg font-bold text-sm shadow-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest border border-white/5"
                  >
                    <History className="w-5 h-5" />
                    Ver Resumen
                  </button>
                  <button 
                    onClick={() => setIsSigning(true)}
                    className="w-full bg-[#FF8C00]/10 text-[#FF8C00] py-4 rounded-lg font-bold text-sm shadow-xl hover:bg-[#FF8C00]/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest border border-[#FF8C00]/20"
                  >
                    <Truck className="w-5 h-5" />
                    Transbordo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PhotoGallery = ({ 
  images, 
  onAdd, 
  onViewAll, 
  onZoom, 
  isCompleted 
}: { 
  images: VehicleImage[], 
  onAdd: () => void, 
  onViewAll: () => void, 
  onZoom: (img: VehicleImage) => void,
  isCompleted: boolean
}) => {
  const maxVisible = 3;
  const visibleImages = images.slice(0, maxVisible);
  const hasMore = images.length > maxVisible;

  return (
    <div className="w-full mt-4 bg-black/20 rounded-2xl p-3 border border-white/5">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Evidencia Fotográfica</span>
        {!isCompleted && (
          <button 
            onClick={onAdd}
            className="p-1.5 rounded-lg bg-[#FF8C00]/10 text-[#FF8C00] hover:bg-[#FF8C00]/20 transition-all"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="flex gap-2 h-20">
        {images.length > 0 ? (
          visibleImages.map((img, idx) => (
            <div 
              key={img.id}
              onClick={() => (idx === maxVisible - 1 && hasMore) ? onViewAll() : onZoom(img)}
              className="relative flex-1 rounded-xl overflow-hidden cursor-pointer group border border-white/5"
            >
              <img 
                src={img.url} 
                alt={`Evidencia ${idx}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {idx === maxVisible - 1 && hasMore && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-sm font-black text-white">+{images.length - maxVisible + 1}</span>
                </div>
              )}
              {img.nota && (
                <div className="absolute bottom-1 right-1 p-0.5 rounded-md bg-black/60">
                  <ClipboardList className="w-2 h-2 text-[#FF8C00]" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div 
            onClick={!isCompleted ? onAdd : undefined}
            className={cn(
              "flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.02] text-white/20 transition-all",
              !isCompleted && "hover:border-[#FF8C00]/20 hover:bg-[#FF8C00]/[0.02] cursor-pointer"
            )}
          >
            <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Sin fotos</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ImageGalleryWizard = ({ 
  images, 
  onClose, 
  onZoom, 
  onAdd, 
  onDelete, 
  onUpdateNote,
  isCompleted 
}: { 
  images: VehicleImage[], 
  onClose: () => void, 
  onZoom: (img: VehicleImage) => void,
  onAdd: () => void,
  onDelete: (id: string) => void,
  onUpdateNote: (id: string, note: string) => void,
  isCompleted: boolean
}) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl bg-[#0D0D0D] rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-[#FF8C00]">Galería de Evidencia</h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">{images.length} fotos capturadas</p>
          </div>
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button 
                onClick={onAdd}
                className="p-3 bg-[#FF8C00]/10 text-[#FF8C00] rounded-full hover:bg-[#FF8C00]/20 transition-all"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <div key={img.id} className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col group">
                <div 
                  className="aspect-square relative overflow-hidden cursor-zoom-in"
                  onClick={() => onZoom(img)}
                >
                  <img 
                    src={img.url} 
                    alt="Evidencia" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isCompleted && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg backdrop-blur-md hover:bg-red-500 transition-all hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 bg-black/40 text-white rounded-lg backdrop-blur-md">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">{img.timestamp}</span>
                  </div>
                  <textarea 
                    value={img.nota}
                    onChange={(e) => onUpdateNote(img.id, e.target.value)}
                    readOnly={isCompleted}
                    placeholder="Agregar nota..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[11px] font-medium text-white/70 placeholder:text-white/10 outline-none focus:border-[#FF8C00]/20 transition-all resize-none h-20 custom-scrollbar"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ImageZoomModal = ({ 
  image, 
  onClose 
}: { 
  image: VehicleImage, 
  onClose: () => void 
}) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/98 p-4 md:p-10" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 p-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        
        <div className="w-full flex-1 flex items-center justify-center overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
          <img 
            src={image.url} 
            alt="Zoom" 
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {image.nota && (
          <div className="w-full max-w-2xl bg-[#0D0D0D] p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-[#FF8C00]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF8C00]">Nota de Imagen</span>
            </div>
            <p className="text-sm text-white/80 font-medium leading-relaxed">{image.nota}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const OperationView = ({ 
  selectedVehicle, 
  setView, 
  setSelectedVehicle, 
  setVehicles, 
  updateValue, 
  setIsSigning,
  setDirectValue,
  onFinalize
}: { 
  selectedVehicle: Vehicle | null, 
  setView: (v: any) => void, 
  setSelectedVehicle: (v: any) => void,
  setVehicles: (v: any) => void,
  updateValue: (field: any, delta: number) => void,
  setDirectValue: (field: any, value: number) => void,
  setIsSigning: (v: boolean) => void,
  onFinalize: () => void
}) => {
  if (!selectedVehicle) return null;
  const [showObservations, setShowObservations] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showImageSourceSelector, setShowImageSourceSelector] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingImageNote, setPendingImageNote] = useState('');
  const [zoomedImage, setZoomedImage] = useState<VehicleImage | null>(null);
  const [tempNote, setTempNote] = useState(selectedVehicle.observaciones);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const isCompleted = selectedVehicle.estado === 'completado';

  useEffect(() => {
    if (showObservations) {
      setTempNote(selectedVehicle.observaciones);
    }
  }, [showObservations, selectedVehicle.observaciones]);

  const costalesRestantes = Math.max(0, selectedVehicle.costales_esperados - selectedVehicle.costales);

  const saveObservation = () => {
    if (!tempNote.trim() || isCompleted) {
      setShowObservations(false);
      return;
    }
    
    const newObs: Observation = {
      id: Math.random().toString(36).substr(2, 9),
      text: tempNote,
      timestamp: new Date().toLocaleString()
    };

    const updated = {
      ...selectedVehicle,
      observaciones: '', // Clear current note after saving to history
      historial_observaciones: [newObs, ...selectedVehicle.historial_observaciones]
    };

    setSelectedVehicle(updated);
    setVehicles((prev: any) => prev.map((v: any) => v.id === selectedVehicle.id ? updated : v));
    setTempNote('');
    setShowObservations(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingImage(reader.result as string);
      setPendingImageNote('');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const savePendingImage = () => {
    if (!pendingImage) return;
    const newImg: VehicleImage = {
      id: Math.random().toString(36).substr(2, 9),
      url: pendingImage,
      nota: pendingImageNote,
      timestamp: new Date().toLocaleString()
    };
    
    const updated = {
      ...selectedVehicle,
      imagenes: [...selectedVehicle.imagenes, newImg]
    };
    
    setSelectedVehicle(updated);
    setVehicles((prev: any) => prev.map((v: any) => v.id === selectedVehicle.id ? updated : v));
    setPendingImage(null);
    setPendingImageNote('');
  };

  const deleteImage = (id: string) => {
    const updated = {
      ...selectedVehicle,
      imagenes: selectedVehicle.imagenes.filter(img => img.id !== id)
    };
    setSelectedVehicle(updated);
    setVehicles((prev: any) => prev.map((v: any) => v.id === selectedVehicle.id ? updated : v));
  };

  const updateImageNote = (id: string, note: string) => {
    const updated = {
      ...selectedVehicle,
      imagenes: selectedVehicle.imagenes.map(img => img.id === id ? { ...img, nota: note } : img)
    };
    setSelectedVehicle(updated);
    setVehicles((prev: any) => prev.map((v: any) => v.id === selectedVehicle.id ? updated : v));
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden z-40">
      {/* 2. Cabecera (Mini-Header) */}
      <header className="w-full px-6 md:px-12 py-3 md:py-4 flex justify-between items-center bg-[#0D0D0D] border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative z-50">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('dashboard')}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#FF8C00] hover:text-[#FF8C00]/80"
              title="Volver al Inicio"
            >
              <Home className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('form')}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
              title="Volver al Formulario"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <div className="flex gap-6 md:gap-10">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-0.5">Proveedor</span>
              <span className="text-[10px] md:text-sm font-medium text-white/70 truncate max-w-[120px] md:max-w-none">{selectedVehicle.proveedor}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-0.5">Chofer</span>
              <span className="text-[10px] md:text-sm font-medium text-white/70 truncate max-w-[120px] md:max-w-none">{selectedVehicle.chofer}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-0.5">ID Registro</span>
          <span className="text-[10px] md:text-sm font-mono text-[#FF8C00]/80">#{selectedVehicle.id.split('-')[0]}</span>
        </div>
      </header>

      {/* 1. Contenedor Maestro & 3. Tarjeta Central */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden bg-[#000000]">
        <div className="w-[95%] max-w-[420px] mx-auto bg-[#0D0D0D] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.95)] relative flex flex-col items-center gap-4 md:gap-6">
          
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-[15rem] h-[15rem] bg-[#FF8C00]/5 rounded-full blur-[80px] pointer-events-none" />

          {/* 4. Distribución del Conteo: Indicador 'Restantes' */}
          <div className="px-3 py-1 rounded-full bg-[#FF8C00]/5 border border-[#FF8C00]/10">
            <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-[0.4em] text-[#FF8C00]/80">
              {isCompleted ? 'Resumen de Registro' : `Costales Restantes: ${costalesRestantes}`}
            </span>
          </div>

          {/* 4. El Contador Gigante */}
          <div className="w-full flex items-center justify-center gap-3 md:gap-6">
            <button 
              onClick={() => updateValue('costales', -1)}
              disabled={isCompleted}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/5 flex items-center justify-center text-white/50 hover:border-[#FF8C00]/40 hover:text-[#FF8C00] hover:bg-[#FF8C00]/5 transition-all active:scale-90 shadow-lg disabled:opacity-0 disabled:pointer-events-none"
            >
              <Minus className="w-4 h-4 md:w-6 md:h-6" />
            </button>

            <div className="flex flex-col items-center">
              <p className="text-[7px] md:text-[9px] font-bold uppercase tracking-[0.6em] text-white/40 mb-1 md:mb-2">Recibidos</p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={selectedVehicle.costales === 0 ? '' : selectedVehicle.costales}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setDirectValue('costales', parseInt(val) || 0);
                }}
                placeholder="0"
                disabled={isCompleted}
                className="w-40 md:w-64 bg-transparent text-center text-[3.5rem] md:text-[5.5rem] font-medium text-[#FF8C00] tracking-tighter leading-none tabular-nums drop-shadow-[0_0_30px_rgba(255,140,0,0.15)] outline-none focus:text-white transition-colors placeholder:text-white/5"
              />
            </div>

            <button 
              onClick={() => updateValue('costales', 1)}
              disabled={isCompleted}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/5 flex items-center justify-center text-white/50 hover:border-[#FF8C00]/40 hover:text-[#FF8C00] hover:bg-[#FF8C00]/5 transition-all active:scale-90 shadow-lg disabled:opacity-0 disabled:pointer-events-none"
            >
              <Plus className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Secondary Metric: Semillas x Costal */}
          <div className="w-full max-w-[200px] p-3 md:p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center gap-2 shadow-inner">
            <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.3em] text-white/50">Semillas por Costal</span>
            <div className="flex items-center justify-between w-full px-1">
              <button 
                onClick={() => updateValue('semillas_x_costal', -1)} 
                disabled={isCompleted}
                className="p-1 text-white/60 hover:text-[#FF8C00] transition-colors disabled:opacity-0 disabled:pointer-events-none"
              >
                <Minus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={selectedVehicle.semillas_x_costal === 0 ? '' : selectedVehicle.semillas_x_costal}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setDirectValue('semillas_x_costal', parseInt(val) || 0);
                }}
                placeholder="0"
                disabled={isCompleted}
                className="w-20 bg-transparent text-center text-xl md:text-2xl font-bold text-white/90 tabular-nums outline-none focus:text-[#FF8C00] transition-colors placeholder:text-white/5"
              />
              <button 
                onClick={() => updateValue('semillas_x_costal', 1)} 
                disabled={isCompleted}
                className="p-1 text-white/60 hover:text-[#FF8C00] transition-colors disabled:opacity-0 disabled:pointer-events-none"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

          {/* 4. Botones de Acción: Fila inferior equilibrada */}
          <div className={cn(
            "w-full grid gap-2",
            isCompleted ? "grid-cols-3" : "grid-cols-2"
          )}>
            <button 
              onClick={() => setShowObservations(true)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/[0.01] border border-white/5 text-white/60 hover:text-[#FF8C00] hover:border-[#FF8C00]/20 hover:bg-[#FF8C00]/[0.02] transition-all group"
            >
              <ClipboardList className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[7px] font-bold uppercase tracking-[0.1em]">Nota</span>
            </button>
            {isCompleted && (
              <button 
                onClick={() => setIsSigning(true)}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/[0.01] border border-white/5 text-white/60 hover:text-[#FF8C00] hover:border-[#FF8C00]/20 hover:bg-[#FF8C00]/[0.02] transition-all group"
              >
                <Truck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-[7px] font-bold uppercase tracking-[0.1em]">Transbordo</span>
              </button>
            )}
            <button 
              onClick={() => setShowHistory(true)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/[0.01] border border-white/5 text-white/60 hover:text-[#FF8C00] hover:border-[#FF8C00]/20 hover:bg-[#FF8C00]/[0.02] transition-all group"
            >
              <History className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[7px] font-bold uppercase tracking-[0.1em]">Historial</span>
            </button>
          </div>
        </div>

        {/* Finalize Action */}
        <div className="mt-4 md:mt-6 flex flex-col items-center gap-4 pb-24">
          <div className="flex flex-col items-center">
            <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-[0.4em] text-white/40 mb-1">Total Computado</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-5xl font-bold text-white/95 tracking-tighter">{(selectedVehicle.costales * selectedVehicle.semillas_x_costal).toLocaleString()}</span>
              <span className="text-[8px] md:text-[10px] font-bold text-[#FF8C00]/60 uppercase tracking-[0.3em]">Semillas</span>
            </div>
          </div>
          {!isCompleted ? (
            <button 
              onClick={onFinalize}
              className="px-8 md:px-12 py-3 md:py-4 rounded-lg md:rounded-xl bg-[#FF8C00] text-black font-black text-[9px] md:text-xs uppercase tracking-[0.3em] hover:bg-[#FF8C00]/90 transition-all shadow-[0_15px_40px_rgba(255,140,0,0.2)] active:scale-95"
            >
              Finalizar Registro
            </button>
          ) : (
            <div className="px-8 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
              Registro Finalizado
            </div>
          )}

          {/* Photo Gallery Section */}
          <div className="w-full max-w-[320px] mt-2">
            <PhotoGallery 
              images={selectedVehicle.imagenes}
              onAdd={() => setShowImageSourceSelector(true)}
              onViewAll={() => setShowGallery(true)}
              onZoom={(img) => setZoomedImage(img)}
              isCompleted={isCompleted}
            />
          </div>
          
          <input 
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <input 
            type="file"
            ref={galleryInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </main>

      {/* Observations Modal */}
      <AnimatePresence>
        {showObservations && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-[#0D0D0D] rounded-[2.5rem] p-10 md:p-14 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF8C00]">Observaciones</h3>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">Anotaciones del registro</p>
                </div>
                <button onClick={() => setShowObservations(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <textarea 
                autoFocus
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                readOnly={isCompleted}
                placeholder={isCompleted ? "Sin novedades registradas" : "Novedades del conteo..."}
                className="w-full h-64 bg-black/40 border border-white/5 rounded-3xl p-8 text-base font-medium text-white/80 placeholder:text-white/5 outline-none focus:border-[#FF8C00]/20 transition-all resize-none custom-scrollbar"
              />
              {!isCompleted && (
                <button 
                  onClick={saveObservation}
                  className="w-full mt-10 bg-[#FF8C00] text-black py-6 rounded-2xl font-black text-xs md:text-sm hover:bg-[#FF8C00]/90 transition-all uppercase tracking-[0.3em] shadow-xl"
                >
                  Guardar Nota
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-[#0D0D0D] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF8C00]">Historial Completo</h3>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">Eventos y transbordos</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                {/* Transbordos Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] border-b border-white/5 pb-2">Transbordos</h4>
                  {selectedVehicle.transbordos.length === 0 ? (
                    <p className="text-xs text-white/40 italic py-4">Sin registros de transbordo</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedVehicle.transbordos.map((t) => (
                        <div key={t.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FF8C00]/10 flex items-center justify-center">
                                <Truck className="w-4 h-4 text-[#FF8C00]" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-white/80">{t.chofer_anterior} → {t.chofer_nuevo}</p>
                                <p className="text-[8px] text-white/50 uppercase tracking-wider">{t.timestamp}</p>
                              </div>
                            </div>
                            {t.firma && (
                              <img src={t.firma} alt="Firma" className="h-8 w-16 object-contain opacity-50 grayscale invert" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Observations Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] border-b border-white/5 pb-2">Notas y Observaciones</h4>
                  {selectedVehicle.historial_observaciones.length === 0 ? (
                    <p className="text-xs text-white/40 italic py-4">Sin notas registradas</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedVehicle.historial_observaciones.map((o) => (
                        <div key={o.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <p className="text-xs text-white/70 leading-relaxed mb-2">{o.text}</p>
                          <p className="text-[8px] text-white/50 uppercase tracking-wider">{o.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setShowHistory(false)}
                className="w-full mt-8 bg-white/5 text-white/40 py-5 rounded-2xl font-black text-[10px] hover:bg-white/10 transition-all uppercase tracking-[0.3em]"
              >
                Cerrar Historial
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Image Gallery Wizard */}
      <AnimatePresence>
        {showGallery && (
          <ImageGalleryWizard 
            images={selectedVehicle.imagenes}
            onClose={() => setShowGallery(false)}
            onAdd={() => setShowImageSourceSelector(true)}
            onDelete={deleteImage}
            onUpdateNote={updateImageNote}
            onZoom={(img) => setZoomedImage(img)}
            isCompleted={isCompleted}
          />
        )}
      </AnimatePresence>

      {/* Image Source Selector Modal */}
      <AnimatePresence>
        {showImageSourceSelector && (
          <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 pb-8" onClick={() => setShowImageSourceSelector(false)}>
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-[#1A1A1A] rounded-3xl p-6 flex flex-col gap-4 border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 text-center mb-2">Agregar Imagen</h3>
              
              <button 
                onClick={() => { setShowImageSourceSelector(false); cameraInputRef.current?.click(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="w-12 h-12 rounded-full bg-[#FF8C00]/20 flex items-center justify-center text-[#FF8C00]">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-white">Tomar Foto</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">Usar la cámara del dispositivo</span>
                </div>
              </button>

              <button 
                onClick={() => { setShowImageSourceSelector(false); galleryInputRef.current?.click(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-white">Subir Archivo</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">Elegir de la galería</span>
                </div>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Capture Modal (Note Prompt) */}
      <AnimatePresence>
        {pendingImage && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#0D0D0D] rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF8C00]">Confirmar Imagen</h3>
                <button onClick={() => setPendingImage(null)} className="p-2 text-white/50 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-6">
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
                  <img src={pendingImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-2">Nota de la imagen (Opcional)</label>
                  <textarea 
                    value={pendingImageNote}
                    onChange={(e) => setPendingImageNote(e.target.value)}
                    placeholder="Ej. Sello de seguridad roto..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF8C00]/50 transition-colors resize-none"
                  />
                </div>
                
                <button 
                  onClick={savePendingImage}
                  className="w-full py-4 rounded-xl bg-[#FF8C00] text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-[#FF8C00]/90 transition-all shadow-[0_10px_30px_rgba(255,140,0,0.2)]"
                >
                  Guardar Imagen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <ImageZoomModal 
            image={zoomedImage}
            onClose={() => setZoomedImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'list' | 'form' | 'operation' | 'prep'>('dashboard');
  const [isOnline, setIsOnline] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'HPR-FO-PRO-001',
      chofer: 'Juan Pérez',
      proveedor: 'AgroPiña S.A.',
      compra: 'PO-2024-001',
      picking: 'WH/IN/00123',
      finca: 'Hacienda Puricaure',
      semillero: '1',
      despachador: 'Miguel Ángel',
      estado: 'espera',
      costales: 120,
      semillas_x_costal: 45,
      costales_esperados: 200,
      observaciones: '',
      historial_observaciones: [],
      transbordos: [],
      imagenes: [],
      fecha_creacion: '2024-03-15'
    },
    {
      id: 'HPR-FO-PRO-002',
      chofer: 'Carlos Rodríguez',
      proveedor: 'Frutas del Valle',
      compra: 'PO-2024-002',
      picking: 'WH/IN/00124',
      finca: 'Hacienda El Paraíso',
      semillero: '3',
      despachador: 'Roberto Carlos',
      estado: 'borrador',
      costales: 0,
      semillas_x_costal: 0,
      costales_esperados: 150,
      observaciones: '',
      historial_observaciones: [],
      transbordos: [],
      imagenes: [],
      fecha_creacion: '2024-03-16'
    },
    {
      id: 'HPR-FO-PRO-003',
      chofer: 'Mario Castañeda',
      proveedor: 'Semillas del Norte',
      compra: 'PO-2024-003',
      picking: 'WH/IN/00125',
      finca: 'Finca La Esperanza',
      semillero: '5',
      despachador: 'Ana María',
      estado: 'completado',
      costales: 100,
      semillas_x_costal: 50,
      costales_esperados: 100,
      observaciones: 'Todo en orden',
      historial_observaciones: [],
      transbordos: [],
      imagenes: [],
      fecha_creacion: '2024-03-17',
      fecha_finalizacion: '2024-03-18'
    }
  ]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // --- Handlers ---

  const handleNewVehicle = () => {
    if (!isOnline) {
      return;
    }
    const newId = `HPR-FO-PRO-${(vehicles.length + 1).toString().padStart(3, '0')}`;
    const newVehicle: Vehicle = {
      id: newId,
      chofer: '',
      proveedor: '',
      compra: '',
      picking: '',
      finca: '',
      semillero: '',
      despachador: '',
      estado: 'borrador',
      costales: 0,
      semillas_x_costal: 0,
      costales_esperados: 100,
      observaciones: '',
      historial_observaciones: [],
      transbordos: [],
      imagenes: [],
      fecha_creacion: new Date().toISOString().split('T')[0]
    };
    setSelectedVehicle(newVehicle);
    setView('form');
  };

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setView('form');
  };

  const handleConfirmRegistration = () => {
    if (!selectedVehicle) return;
    const updated = { ...selectedVehicle, estado: 'espera' as const };
    setVehicles(prev => {
      const exists = prev.find(v => v.id === updated.id);
      if (exists) return prev.map(v => v.id === updated.id ? updated : v);
      return [...prev, updated];
    });
    setSelectedVehicle(updated);
  };

  const handleAddTransbordo = (data: { oldDriver: string, newDriver: string, firma: string }) => {
    if (!selectedVehicle) return;
    const newLog: Transbordo = {
      id: Math.random().toString(36).substr(2, 9),
      chofer_anterior: data.oldDriver,
      chofer_nuevo: data.newDriver,
      timestamp: new Date().toLocaleString(),
      firma: data.firma
    };
    const updated = {
      ...selectedVehicle,
      chofer: data.newDriver, // Update current driver of the vehicle
      transbordos: [newLog, ...selectedVehicle.transbordos]
    };
    setSelectedVehicle(updated);
    setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
    setIsSigning(false);
  };

  const updateValue = (field: 'costales' | 'semillas_x_costal', delta: number) => {
    if (!selectedVehicle || selectedVehicle.estado === 'completado') return;
    const updated = {
      ...selectedVehicle,
      [field]: Math.max(0, selectedVehicle[field] + delta)
    };
    setSelectedVehicle(updated);
    setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  const setDirectValue = (field: 'costales' | 'semillas_x_costal', value: number) => {
    if (!selectedVehicle || selectedVehicle.estado === 'completado') return;
    const updated = {
      ...selectedVehicle,
      [field]: Math.max(0, value)
    };
    setSelectedVehicle(updated);
    setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  const computedPicking = selectedVehicle?.compra ? `WH/IN/${selectedVehicle.compra.split('-')[2]}` : '';

  const handleFinalize = () => {
    if (!selectedVehicle) return;
    const updated = { 
      ...selectedVehicle, 
      estado: 'completado' as const,
      fecha_finalizacion: new Date().toISOString().split('T')[0]
    };
    setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
    setView('list');
  };

  return (
    <div className="h-screen bg-black text-[#FF8C00] font-sans selection:bg-[#FF8C00] selection:text-black overflow-hidden flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#FF8C0010,transparent_50%)] pointer-events-none" />
      
      <button
        onClick={() => setIsOnline(!isOnline)}
        className={cn(
          "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-2xl border backdrop-blur-md",
          isOnline 
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 shadow-emerald-500/5" 
            : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 shadow-red-500/5"
        )}
      >
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </button>

      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4 md:p-8 lg:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full"
          >
            {view === 'dashboard' && (
              <DashboardView onNavigate={setView} />
            )}
            {view === 'list' && (
              <ListView 
                vehicles={vehicles} 
                onNewVehicle={handleNewVehicle} 
                onSelectVehicle={handleSelectVehicle} 
                isOnline={isOnline}
                onGoHome={() => setView('dashboard')}
              />
            )}
            {view === 'form' && (
              <FormView 
                selectedVehicle={selectedVehicle} 
                setView={setView} 
                setSelectedVehicle={setSelectedVehicle} 
                onConfirmRegistration={handleConfirmRegistration}
                computedPicking={computedPicking}
                setIsSigning={setIsSigning}
              />
            )}
            {view === 'operation' && (
              <OperationView 
                selectedVehicle={selectedVehicle} 
                setView={setView} 
                setSelectedVehicle={setSelectedVehicle} 
                setVehicles={setVehicles} 
                updateValue={updateValue} 
                setDirectValue={setDirectValue}
                setIsSigning={setIsSigning} 
                onFinalize={handleFinalize}
              />
            )}
            {view === 'prep' && (
              <PrepView onGoHome={() => setView('dashboard')} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {isSigning && (
        <TransbordoWizard 
          onSave={handleAddTransbordo}
          onCancel={() => setIsSigning(false)}
          currentDriver={
            selectedVehicle?.transbordos && selectedVehicle.transbordos.length > 0 
              ? selectedVehicle.transbordos[selectedVehicle.transbordos.length - 1].chofer_nuevo 
              : selectedVehicle?.chofer || ''
          }
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 140, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 140, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
