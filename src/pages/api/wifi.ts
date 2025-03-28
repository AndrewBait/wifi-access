import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-jwt-key-change-in-production';
const WIFI_PASSWORD = process.env.WIFI_PASSWORD || 'SenhaSeguraDaLoja2024';

// Tipos
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

interface UserVerification {
  id: string;
  phoneNumber: string;
  verificationCode: string;
  isVerified: boolean;
  verifiedAt?: Date;
  attempts: number;
  createdAt: Date;
}

// Base de dados em memória (para ambientes de desenvolvimento)
// Em produção você usaria um banco de dados real
const verifications: Record<string, UserVerification> = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  // Extrair a ação da URL (usando o parâmetro 'action')
  const { action } = req.query;

  switch (action) {
    case 'request-verification':
      return handleRequestVerification(req, res);
    case 'verify':
      return handleVerify(req, res);
    case 'validate-token':
      return handleValidateToken(req, res);
    default:
      return res.status(400).json({ success: false, error: 'Ação inválida' });
  }
}

// Handler para solicitar verificação
async function handleRequestVerification(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const { phoneNumber } = req.body;

    // Validar número de telefone
    if (!phoneNumber || !/^\d{10,11}$/.test(phoneNumber)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Número de telefone inválido. Formate como 11987654321' 
      });
    }

    // Gerar código de verificação de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Criar/atualizar verificação
    const id = `phone_${phoneNumber}`;
    
    if (verifications[id]) {
      // Reset da verificação existente
      verifications[id].verificationCode = verificationCode;
      verifications[id].isVerified = false;
      verifications[id].attempts = 0;
    } else {
      // Criar nova verificação
      verifications[id] = {
        id,
        phoneNumber,
        verificationCode,
        isVerified: false,
        attempts: 0,
        createdAt: new Date()
      };
    }

    // Em produção, enviar SMS/WhatsApp com o código
    // Para o propósito desta demo, apenas logamos o código no console (ambiente de dev)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Código de verificação para ${phoneNumber}: ${verificationCode}`);
    }

    // Integração com WhatsApp/SMS seria aqui
    // await sendVerificationCode(phoneNumber, verificationCode);

    return res.status(200).json({ 
      success: true, 
      message: 'Código de verificação enviado com sucesso' 
    });
    
  } catch (error) {
    console.error('Erro ao solicitar verificação:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}

// Handler para verificar código
async function handleVerify(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const { phoneNumber, verificationCode } = req.body;

    // Validar dados
    if (!phoneNumber || !verificationCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Número de telefone e código de verificação são obrigatórios' 
      });
    }

    const id = `phone_${phoneNumber}`;
    const verification = verifications[id];
    
    // Verificar se existe
    if (!verification) {
      return res.status(404).json({ 
        success: false, 
        error: 'Verificação não encontrada. Solicite um novo código.' 
      });
    }

    // Verificar número de tentativas
    const MAX_ATTEMPTS = 3;
    if (verification.attempts >= MAX_ATTEMPTS) {
      return res.status(403).json({ 
        success: false, 
        error: 'Número máximo de tentativas excedido. Solicite um novo código.' 
      });
    }

    // Verificar código
    if (verification.verificationCode !== verificationCode) {
      verification.attempts += 1;
      return res.status(401).json({ 
        success: false, 
        error: `Código inválido. Restam ${MAX_ATTEMPTS - verification.attempts} tentativas.` 
      });
    }

    // Verificar se o usuário está no grupo do WhatsApp
    // Esta verificação seria feita via API do WhatsApp em produção
    // Para simplificar, assumimos que se o usuário tem o código, está no grupo
    
    // Marcar como verificado
    verification.isVerified = true;
    verification.verifiedAt = new Date();

    // Calcular data de expiração (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Gerar token JWT
    const token = jwt.sign(
      { 
        phoneNumber, 
        verified: true,
        exp: Math.floor(expiresAt.getTime() / 1000) 
      },
      JWT_SECRET
    );

    return res.status(200).json({ 
      success: true, 
      message: 'Verificação concluída com sucesso',
      data: {
        password: WIFI_PASSWORD,
        expiresAt,
        token
      }
    });
    
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}

// Handler para validar token
async function handleValidateToken(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token não fornecido' 
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Calcular data de expiração
      const expiresAt = new Date(decoded.exp * 1000);
      
      // Verificar se o token está expirado
      if (expiresAt < new Date()) {
        return res.status(401).json({ 
          success: false, 
          error: 'Token expirado' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Token válido',
        data: {
          password: WIFI_PASSWORD,
          expiresAt
        }
      });
      
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido' 
      });
    }
    
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}