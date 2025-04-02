import { useState, useEffect } from 'react';
import { Bell, Pause, Play, RotateCcw, Settings } from 'lucide-react';

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [cycles, setCycles] = useState(0);

  // Efeito para gerenciar o timer
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer acabou
          playAlarm();
          handleCycleComplete();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  // Função para reproduzir som de alarme
  const playAlarm = () => {
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_246a051ed7.mp3?filename=bell-simple-41904.mp3');
    audio.play().catch(e => console.log('Erro ao reproduzir áudio:', e));
  };

  // Gerenciar a conclusão de um ciclo
  const handleCycleComplete = () => {
    setIsActive(false);
    
    if (mode === 'pomodoro') {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      
      if (newCycles % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('pomodoro');
    }
  };

  // Alternar entre os modos
  const switchMode = (newMode) => {
    setMode(newMode);
    setMinutes(settings[newMode]);
    setSeconds(0);
    setIsActive(false);
  };

  // Reiniciar o timer
  const resetTimer = () => {
    setMinutes(settings[mode]);
    setSeconds(0);
    setIsActive(false);
  };

  // Formatar tempo para exibição
  const formatTime = () => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Atualizar as configurações
  const updateSettings = (setting, value) => {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue) && parsedValue > 0 && parsedValue <= 60) {
      setSettings({
        ...settings,
        [setting]: parsedValue,
      });
      
      // Se o modo atual for alterado, atualizar o timer
      if (setting === mode) {
        setMinutes(parsedValue);
        setSeconds(0);
      }
    }
  };

  // Calcular progresso para o círculo
  const calculateProgress = () => {
    const totalSeconds = settings[mode] * 60;
    const currentSeconds = minutes * 60 + seconds;
    return ((totalSeconds - currentSeconds) / totalSeconds) * 100;
  };

  // Estilo do círculo de progresso
  const progressCircle = {
    strokeDasharray: '339.292',
    strokeDashoffset: `${(1 - calculateProgress() / 100) * 339.292}`,
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Pomodoro Timer</h1>
        
        {/* Seletor de modo */}
        <div className="flex justify-between mb-8 bg-gray-900 rounded-lg p-1">
          <button 
            className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'pomodoro' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
            onClick={() => switchMode('pomodoro')}
          >
            Pomodoro
          </button>
          <button 
            className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'shortBreak' ? 'bg-green-600' : 'hover:bg-gray-700'}`}
            onClick={() => switchMode('shortBreak')}
          >
            Pausa Curta
          </button>
          <button 
            className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'longBreak' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => switchMode('longBreak')}
          >
            Pausa Longa
          </button>
        </div>
        
        {/* Timer */}
        <div className="relative flex items-center justify-center mb-6">
          <svg className="w-64 h-64" viewBox="0 0 120 120">
            {/* Círculo de fundo */}
            <circle 
              cx="60" 
              cy="60" 
              r="54" 
              fill="none" 
              stroke="#2A2F3F" 
              strokeWidth="8"
            />
            {/* Círculo de progresso */}
            <circle 
              cx="60" 
              cy="60" 
              r="54" 
              fill="none" 
              stroke={mode === 'pomodoro' ? '#9333ea' : mode === 'shortBreak' ? '#059669' : '#2563eb'} 
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="339.292"
              strokeDashoffset={progressCircle.strokeDashoffset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute text-6xl font-bold">
            {formatTime()}
          </div>
        </div>
        
        {/* Controles do timer */}
        <div className="flex justify-center space-x-6 mb-6">
          <button 
            className="w-16 h-16 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button 
            className="w-16 h-16 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            onClick={resetTimer}
          >
            <RotateCcw size={28} />
          </button>
        </div>
        
        {/* Informações adicionais */}
        <div className="flex justify-between text-gray-400">
          <div>
            Ciclos concluídos: {cycles}
          </div>
          <button 
            className="flex items-center hover:text-white transition-colors"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={18} className="mr-1" />
            Configurações
          </button>
        </div>
        
        {/* Configurações */}
        {showSettings && (
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Configurações</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pomodoro (minutos)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={settings.pomodoro} 
                  onChange={(e) => updateSettings('pomodoro', e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pausa Curta (minutos)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={settings.shortBreak} 
                  onChange={(e) => updateSettings('shortBreak', e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pausa Longa (minutos)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={settings.longBreak} 
                  onChange={(e) => updateSettings('longBreak', e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
