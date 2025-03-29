import React, { useState, useEffect, FormEvent, useRef } from 'react';
import Head from 'next/head';
import { Check, Lock, Phone } from 'lucide-react';
import { setCookie, getCookie } from 'cookies-next';

// Funções utilitárias
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remover caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return cleaned;
}

function formatDate(date?: Date): string {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Componentes
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="w-full flex justify-center mb-6">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          <Phone size={16} />
        </div>
        <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          <Lock size={16} />
        </div>
        <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          <Check size={16} />
        </div>
      </div>
    </div>
  );
};

const PhoneStep = ({ 
  onPhoneChange,
  onRequestVerification,
  onWhatsAppJoin 
}: { 
  onPhoneChange: (phoneNumber: string) => void;
  onRequestVerification: (e: FormEvent) => void;
  onWhatsAppJoin: () => void; 
}) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-center text-blue-600">Conecte-se ao WiFi da Loja</h1>
    <p className="text-gray-600 text-center">
      Entre no nosso grupo do WhatsApp para ver o código de verificação fixado no topo do grupo.
    </p>
    
    <div className="mt-8">
      <button
        onClick={onWhatsAppJoin}
        className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-md font-medium transition duration-150"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Entrar no Grupo do WhatsApp
      </button>
    </div>
    
    <div className="text-sm text-gray-500 text-center">
      Este acesso é exclusivo para clientes da loja.
      Ao entrar no grupo, você receberá promoções exclusivas.
    </div>
  </div>
);

const VerificationStep = ({ 
  verificationCode, 
  setVerificationCode, 
  isLoading, 
  onSubmit, 
  onBack,
  error
}: { 
  verificationCode: string; 
  setVerificationCode: (value: string) => void; 
  isLoading: boolean; 
  onSubmit: (e: FormEvent) => void; 
  onBack: () => void;
  error?: string;
}) => {
  // Referências para os inputs do código
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  
  // Função para lidar com a entrada de caracteres no código
  const handleCodeChange = (index: number, value: string) => {
    // Atualizar o valor do código
    const newCode = verificationCode.split('');
    newCode[index] = value;
    const newVerificationCode = newCode.join('');
    setVerificationCode(newVerificationCode);
    
    // Mover para o próximo input se houver um valor
    if (value && index < 5 && inputRefs[index + 1]?.current) {
      inputRefs[index + 1].current?.focus();
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center text-blue-600">Verificação</h1>
      <p className="text-gray-600 text-center">
        Digite o código de 6 dígitos que está fixado no grupo do WhatsApp
      </p>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex justify-center space-x-2 my-6">
          {Array(6).fill(0).map((_, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={verificationCode[index] || ''}
              onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
              className="w-10 h-12 text-center border border-gray-300 rounded-md font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>
        
        {error && (
          <div className="text-red-500 text-sm text-center mt-2">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || verificationCode.length !== 6}
          className={`w-full px-4 py-2 text-white font-medium rounded-md ${
            isLoading || verificationCode.length !== 6
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition duration-150 flex items-center justify-center`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
          ) : null}
          {isLoading ? 'Verificando...' : 'Verificar código'}
        </button>
        
        <div className="flex items-center justify-center mt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
};

const SuccessStep = ({ 
  wifiPassword,
  expiresAt
}: { 
  wifiPassword: string;
  expiresAt?: Date;
}) => (
  <div className="space-y-6">
    <div className="flex justify-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
        <Check size={32} color="white" />
      </div>
    </div>
    
    <h1 className="text-2xl font-bold text-center text-blue-600">Acesso Liberado!</h1>
    
    <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
      <p className="text-gray-600 mb-2">A senha do WiFi é:</p>
      <div className="flex items-center justify-center space-x-2">
        <p className="text-2xl font-bold text-green-700">{wifiPassword}</p>
        <button 
          onClick={() => navigator.clipboard.writeText(wifiPassword)}
          className="text-blue-600 hover:text-blue-800"
          aria-label="Copiar senha"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
      {expiresAt && (
        <p className="text-sm text-gray-500 mt-4">
          Senha válida até: {formatDate(expiresAt)}
        </p>
      )}
    </div>
    
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
      <p className="text-sm text-gray-600">
        <span className="font-bold">Como usar:</span> Conecte-se à rede &ldquo;WIFI_LOJA&rdquo; 
        e insira a senha acima quando solicitado.
      </p>
    </div>
    
    <div className="pt-4 mt-2 border-t border-gray-200">
      <p className="text-sm text-gray-500 text-center">
        Obrigado por visitar nossa loja! Aproveite a navegação.
      </p>
    </div>
  </div>
);

const WifiAccessPage = () => {
  // Estados
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  // Verificar se já tem um token válido ao carregar a página
  useEffect(() => {
    const checkExistingSession = async () => {
      const token = getCookie('wifi_access_token');
      
      if (token) {
        try {
          setLoading(true);
          const response = await fetch('/api/wifi?action=validate-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });
          
          const data = await response.json();
          
          if (data.success && data.data) {
            setWifiPassword(data.data.password);
            if (data.data.expiresAt) {
              setExpiresAt(new Date(data.data.expiresAt));
            }
            setStep(3);
          }
        } catch (err) {
          console.error('Erro ao validar token:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkExistingSession();
  }, []);

  // Handlers
  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/wifi?action=request-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || 'Ocorreu um erro ao enviar o código. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao solicitar verificação:', err);
      setError('Ocorreu um erro ao enviar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/wifi?action=verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          verificationCode 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWifiPassword(data.data.password);
        if (data.data.expiresAt) {
          setExpiresAt(new Date(data.data.expiresAt));
        }
        
        // Guardar o token se existir
        if (data.data.token) {
          setCookie('wifi_access_token', data.data.token, {
            maxAge: 24 * 60 * 60, // 24 horas
            path: '/',
          });
        }
        
        setStep(3);
      } else {
        setError(data.error || 'Código inválido. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao verificar código:', err);
      setError('Ocorreu um erro ao verificar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppJoin = () => {
    // Abrir o link do grupo do WhatsApp em uma nova aba
    window.open('https://chat.whatsapp.com/KXUa6uQuSVf2oYF3Em6Uuv', '_blank');
    // Avançar para o próximo passo após abrir o grupo
    setStep(2);
  };

  return (
    <>
      <Head>
        <title>Acesso WiFi da Loja</title>
        <meta name="description" content="Acesse nossa rede WiFi exclusiva para clientes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-md">
          {/* Logo da loja */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Lock size={28} color="white" />
            </div>
          </div>
          
          <StepIndicator currentStep={step} />
          
          {step === 1 && (
            <PhoneStep 
              onPhoneChange={setPhoneNumber}
              onRequestVerification={handlePhoneSubmit}
              onWhatsAppJoin={handleWhatsAppJoin}
            />
          )}
          
          {step === 2 && (
            <VerificationStep 
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              isLoading={loading}
              onSubmit={handleVerificationSubmit}
              onBack={() => setStep(1)}
              error={error}
            />
          )}
          
          {step === 3 && (
            <SuccessStep 
              wifiPassword={wifiPassword}
              expiresAt={expiresAt}
            />
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Sua Loja | Todos os direitos reservados
        </div>
      </div>
    </>
  );
};

export default WifiAccessPage;