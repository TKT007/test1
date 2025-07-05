import crypto from 'crypto';

export default function handler(req, res) {
  // Configurações (igual ao PHP original)
  const secret = "q0hdscntgukvdzjjjb9tbug75cdkijxz";
  const expires = 2;
  
  // Pega o parâmetro lp_key
  const lpKey = req.query.lp_key;
  
  let validationResult = null;
  
  // Se tem lp_key, valida (mesma lógica do PHP)
  if (lpKey) {
    try {
      const hashFromKey = lpKey.substring(0, 5) + lpKey.substring(10, 15) + lpKey.substring(20);
      const timeFromKey = parseInt(lpKey.substring(5, 10) + lpKey.substring(15, 20));
      const userAgent = req.headers['user-agent'] || '';
      const calc = crypto.createHash('md5').update(secret + timeFromKey + userAgent).digest('hex');
      
      if (calc !== hashFromKey || Math.floor(Date.now() / 1000) - timeFromKey > expires) {
        validationResult = { valid: false, error: 'Chave inválida ou expirada' };
      } else {
        validationResult = { valid: true, message: 'Acesso autorizado' };
      }
    } catch (error) {
      validationResult = { valid: false, error: 'Erro na validação da chave' };
    }
  }
  
  // Se a validação falhou, replica o comportamento PHP original (exit(0))
  if (validationResult && !validationResult.valid) {
    return res.status(401).end(); // Equivalente ao exit(0) do PHP
  }
  
  // HTML da página principal
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
            max-width: 600px;
            width: 90%;
        }
        
        h1 {
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        
        .status {
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .info {
            background: #f0f8ff;
            color: #0066cc;
            border: 1px solid #b3d9ff;
        }
        
        .content {
            margin-top: 30px;
            text-align: left;
            line-height: 1.6;
        }
        
        .key-info {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
            font-size: 0.9em;
        }
        
        .btn {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 25px;
            font-size: 1.1em;
            cursor: pointer;
            margin: 20px 10px;
            transition: all 0.3s;
        }
        
        .btn:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Sua Landing Page</h1>
        
        ${validationResult ? `
            <div class="status success">
                ✅ ${validationResult.message}
            </div>
            <div class="key-info">
                <strong>Chave validada:</strong><br>
                ${lpKey}
            </div>
        ` : `
            <div class="status info">
                📋 Bem-vindo!
            </div>
        `}
        
        <div class="content">
            <h2>Seu Conteúdo Aqui</h2>
            <p>Esta é sua página principal hospedada na Vercel. O sistema de validação está funcionando perfeitamente!</p>
            
            <p><strong>Como funciona:</strong></p>
            <ul>
                <li>✅ Acesso normal: <code>https://seu-site.vercel.app/</code></li>
                <li>🔐 Acesso com validação: <code>https://seu-site.vercel.app/?lp_key=SUA_CHAVE</code></li>
                <li>❌ Chave inválida: página não carrega (erro 401)</li>
            </ul>
            
            <button class="btn" onclick="window.location.reload()">🔄 Recarregar</button>
            <button class="btn" onclick="alert('Funcionalidade personalizada aqui!')">🎯 Ação</button>
        </div>
    </div>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
