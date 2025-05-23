# pix-br-code

Biblioteca TypeScript para geração de códigos Pix (Copia e Cola) e QR Codes para o sistema de pagamentos instantâneos brasileiro.

## Instalação

```bash
npm install pix-br-code
```

ou

```bash
yarn add pix-br-code
```

## Uso

A biblioteca exporta uma função principal `Pix` que gera um código Pix (Copia e Cola) ou um QR Code em base64.

### Exemplo básico

```typescript
import { Pix } from "pix-br-code";

// Gerar código Pix (Copia e Cola)
const pixCode = await Pix(
  "123456789", // Chave Pix
  "SILVA SILVA", // Nome do recebedor
  "RIO DE JANEIRO", // Cidade do recebedor
  "0.10", // Valor
  "Pedido #123456" // Identificador
);
// Retorno: "00020126490014br.gov.bcb.pix0109123456789..."

// Gerar QR Code em base64
const qrCode = await Pix(
  "123456789", // Chave Pix
  "SILVA SILVA", // Nome do recebedor
  "RIO DE JANEIRO", // Cidade do recebedor
  "0.10", // Valor
  "Pedido #123456", // Identificador
  true // Gerar QR Code
);
// Retorno: "data:image/png;base64,..."
```

## Parâmetros

A função `Pix` aceita os seguintes parâmetros:

| Parâmetro     | Tipo      | Descrição                                                                                |
|---------------|-----------|------------------------------------------------------------------------------------------|
| chave         | string    | Chave Pix do recebedor (CPF, CNPJ, e-mail, telefone ou chave aleatória)                 |
| nome          | string    | Nome do recebedor                                                                        |
| cidade        | string    | Cidade do recebedor                                                                      |
| valor         | string    | Valor da transação (ex: "0.10", "10.00")                                                 |
| identificador | string    | Identificador da transação (txid)                                                        |
| gerarQRCode   | boolean   | Se true, retorna a imagem do QR Code em base64; se false, retorna o código Pix (padrão: false) |

## Especificações

Esta biblioteca implementa o padrão BR Code conforme especificado pelo Banco Central do Brasil no Manual de Padrões para Iniciação do Pix.

O código gerado segue o padrão EMV (Europay, Mastercard e Visa) para QR Codes, que é o padrão utilizado pelo Pix.

## Licença

MIT
