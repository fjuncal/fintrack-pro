import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getFinancialAdvice = async (transactions: any[], budgets: any[], categories: any[], monthName: string) => {
  try {
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      Você é um assistente financeiro pessoal inteligente chamado FinAI.
      Analise os seguintes dados financeiros do usuário referente ao mês de **${monthName}** e forneça um relatório executivo conciso.
      
      Dados de ${monthName}:
      - Transações: ${JSON.stringify(transactions)}
      - Orçamentos: ${JSON.stringify(budgets)}
      - Categorias: ${JSON.stringify(categories)}
      
      Por favor, responda em Português Brasileiro usando Markdown.
      Use títulos (###), listas com marcadores e negrito para destacar pontos importantes.
      
      Estrutura da resposta:
      ### 📊 Resumo de ${monthName}
      (Análise do saldo e fluxo deste mês específico)
      
      ### 💡 Insights de Gastos
      (Onde o dinheiro está indo neste mês e se está dentro do orçamento)
      
      ### 🎯 Dica de Ouro
      (Uma dica prática e acionável para economizar)
      
      ### 🏷️ Sugestões de Organização
      (Sugestão de novas categorias se notar padrões)
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao obter conselhos da IA:", error);
    return "Desculpe, não consegui analisar seus dados no momento. Tente novamente mais tarde.";
  }
};

export const suggestCategories = async (description: string) => {
  try {
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      Com base na descrição da transação: "${description}", sugira a melhor categoria financeira (ex: Alimentação, Transporte, Lazer, Saúde, Educação, Moradia, etc).
      Responda apenas com o nome da categoria em uma única palavra.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text?.trim();
  } catch (error) {
    return null;
  }
};
