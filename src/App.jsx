import React, { useState } from 'react';
import { Calculator, Users, DollarSign, Clock, Plus, Trash2, TrendingUp, Building, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CalculoHorasApp() {
  // 🔍 VERIFICAÇÃO DE VERSÃO
  console.log('📊 VERSÃO: v2.0-GRAFITE-NEUTRO');
  console.log('✅ Visual Neutro (Cinza Chumbo)');
  console.log('✅ Texto do Minuto Técnico Atualizado');
  
  const [activeTab, setActiveTab] = useState('custos');
  
  // Categorias customizáveis
  const [categorias, setCategorias] = useState([
    { id: 'socio', nome: 'Sócio/Proprietário', cor: 'stone', rateado: false },
    { id: 'administrativo', nome: 'Administrativo', cor: 'slate', rateado: false },
    { id: 'comercial', nome: 'Comercial', cor: 'zinc', rateado: false },
    { id: 'pcp', nome: 'PCP', cor: 'neutral', rateado: false },
    { id: 'marceneiro', nome: 'Marceneiro', cor: 'orange', rateado: true },
    { id: 'auxiliar', nome: 'Auxiliar Marceneiro', cor: 'yellow', rateado: true }
  ]);

  const [novaCategoria, setNovaCategoria] = useState({ nome: '', cor: 'stone', rateado: false });
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);

  // Estados para armazenar valores temporários durante a edição
  const [valoresTemp, setValoresTemp] = useState({});

  // Configurações de horas (agora personalizáveis)
  const [horasContratadas, setHorasContratadas] = useState(180);
  const [horasOciosas, setHorasOciosas] = useState(0.5);
  const [diasMedio, setDiasMedio] = useState(21);
  
  // Custos Fixos Mensais
  const [custosFixos, setCustosFixos] = useState([
    { id: 1, nome: 'CONTABILIDADE', valor: 0, admin: 0 },
    { id: 2, nome: 'MANUTENÇÃO EQUIPAMENTOS/PREDIAL', valor: 0, admin: 0 },
    { id: 3, nome: 'DEPRECIAÇÃO/AQUISIÇÃO MAQUINÁRIO', valor: 0, admin: 0 },
    { id: 4, nome: 'VEÍCULOS - MANUTENÇÃO/DEPRECIAÇÃO', valor: 0, admin: 0 },
    { id: 5, nome: 'MARKETING', valor: 0, admin: 0 },
    { id: 6, nome: 'ENERGIA', valor: 0, admin: 0 },
    { id: 7, nome: 'ÁGUA', valor: 0, admin: 0 },
    { id: 8, nome: 'TELEFONE', valor: 0, admin: 0 },
    { id: 9, nome: 'ALUGUEL', valor: 0, admin: 0 },
    { id: 10, nome: 'SEGURO DE VIDA - FUNCIONÁRIOS', valor: 0, admin: 0 },
    { id: 11, nome: 'SEGURO PREDIAL E VEÍCULOS', valor: 0, admin: 0 },
    { id: 12, nome: 'IMPOSTOS (IPTU/CONDOMÍNIO)', valor: 0, admin: 0 },
    { id: 13, nome: 'IMPOSTO VEÍCULOS', valor: 0, admin: 0 },
    { id: 14, nome: 'DIVERSOS / ESQUECIDOS', valor: 0, admin: 0 },
    { id: 15, nome: 'LIMPEZA E MANUTENÇÃO', valor: 0, admin: 0 },
    { id: 16, nome: 'SISTEMAS', valor: 0, admin: 0 },
    { id: 17, nome: 'COLETA DE LIXO + ENTULHOS', valor: 0, admin: 0 },
    { id: 18, nome: 'COMBUSTÍVEL', valor: 0, admin: 0 },
    { id: 19, nome: 'MATERIAL EXPEDIENTE E EPI', valor: 0, admin: 0 },
    { id: 20, nome: 'MATERIAL LIMPEZA', valor: 0, admin: 0 }
  ]);

  // Funcionários por setor
  const [funcionarios, setFuncionarios] = useState({
    socio: [
      { id: 1, nome: 'Sócio Proprietário 1', salarioBase: 0, extras: 0, auxilio: 0 }
    ],
    administrativo: [
      { id: 1, nome: 'Recursos Humanos 1', salarioBase: 0, extras: 0, auxilio: 0 }
    ],
    comercial: [
      { id: 1, nome: 'Vendedor 1', salarioBase: 0, extras: 0, auxilio: 0 }
    ],
    pcp: [
      { id: 1, nome: 'Projetista 1', salarioBase: 0, extras: 0, auxilio: 0 }
    ],
    marceneiro: [
      { id: 1, nome: 'Marceneiro 1', salarioBase: 0, extras: 0, auxilio: 0 }
    ],
    auxiliar: [
      { id: 1, nome: 'Auxiliar Marceneiro 1', salarioBase: 0, extras: 0, auxilio: 0 }
    ]
  });

  // Cálculos de INSS (atualizado 2024/2025)
  const calcularINSS = (salario) => {
    if (salario <= 1621.00) {
      return salario * 0.075;
    }
    if (salario <= 2902.84) {
      return (1621.00 * 0.075) + ((salario - 1621.00) * 0.09);
    }
    if (salario <= 4354.27) {
      return (1621.00 * 0.075) + (1281.84 * 0.09) + ((salario - 2902.84) * 0.12);
    }
    if (salario <= 8475.55) {
      return (1621.00 * 0.075) + (1281.84 * 0.09) + (1451.43 * 0.12) + ((salario - 4354.27) * 0.14);
    }
    // Teto do INSS
    return (1621.00 * 0.075) + (1281.84 * 0.09) + (1451.43 * 0.12) + (4121.28 * 0.14);
  };

  // Calcular custo total de um funcionário
  const calcularCustoFuncionario = (func) => {
    const salarioBase = func.salarioBase;
    
    // Encargos calculados APENAS sobre o salário base
    const decimoTerceiro = salarioBase / 12;
    const ferias = (salarioBase / 3) / 12;
    const inss = calcularINSS(salarioBase);
    const inssEncargos = calcularINSS(decimoTerceiro + ferias); // INSS sobre 13º e férias
    const fgts = salarioBase * 0.08;
    
    // Custo total = salário base + encargos + extras e auxílios (SEM encargos)
    const custoComEncargos = salarioBase + decimoTerceiro + ferias + inss + inssEncargos + fgts;
    const custoTotal = custoComEncargos + func.extras + func.auxilio;
    
    return custoTotal;
  };

  // Calcular custos por setor
  const calcularCustosSetor = (setor) => {
    if (!funcionarios[setor]) return 0;
    return funcionarios[setor].reduce((total, func) => {
      return total + calcularCustoFuncionario(func);
    }, 0);
  };

  // Calcular salário base total por setor (para rateio)
  const calcularSalarioBaseTotal = (setor) => {
    if (!funcionarios[setor]) return 0;
    return funcionarios[setor].reduce((total, func) => total + func.salarioBase, 0);
  };

  // Totais por categoria
  const totalCustosFixos = custosFixos.reduce((sum, c) => sum + c.valor, 0);
  const custoSocio = calcularCustosSetor('socio');
  const custoAdmin = calcularCustosSetor('administrativo');
  const custoPCP = calcularCustosSetor('pcp');
  const custoComercial = calcularCustosSetor('comercial');
  const custoMarceneiro = calcularCustosSetor('marceneiro');
  const custoAuxiliar = calcularCustosSetor('auxiliar');

  // Custos de categorias customizadas (excluindo as padrão)
  const custosCategoriasCustom = categorias
    .filter(cat => !['socio', 'administrativo', 'pcp', 'comercial', 'marceneiro', 'auxiliar'].includes(cat.id))
    .reduce((total, cat) => total + calcularCustosSetor(cat.id), 0);

  // Custos indiretos que serão rateados (inclui custos fixos + categorias não rateadas)
  const custosNaoRateados = totalCustosFixos + custoSocio + custoAdmin + custoComercial + custoPCP +
    categorias
      .filter(cat => !cat.rateado && !['socio', 'administrativo', 'comercial', 'pcp'].includes(cat.id))
      .reduce((total, cat) => total + calcularCustosSetor(cat.id), 0);

  // Categorias que receberão o rateio (PCP, marceneiro, auxiliar e outras marcadas como rateado)
  const categoriasRateadas = categorias.filter(cat => cat.rateado);
  
  // Calcular salários base para definir peso do rateio
  const salarioBasePorCategoria = {};
  let salarioBaseTotalRateado = 0;
  
  categoriasRateadas.forEach(cat => {
    const salario = calcularSalarioBaseTotal(cat.id);
    salarioBasePorCategoria[cat.id] = salario;
    salarioBaseTotalRateado += salario;
  });

  // Peso proporcional baseado no salário para cada categoria rateada
  const pesoRateio = {};
  const custosRateadosPorCategoria = {};
  
  categoriasRateadas.forEach(cat => {
    pesoRateio[cat.id] = salarioBaseTotalRateado > 0 
      ? salarioBasePorCategoria[cat.id] / salarioBaseTotalRateado 
      : 1 / categoriasRateadas.length;
    custosRateadosPorCategoria[cat.id] = custosNaoRateados * pesoRateio[cat.id];
  });

  const totalCustosProducao = custoMarceneiro + custoAuxiliar;
  const totalGeralCustos = totalCustosFixos + custoSocio + custoAdmin + custoPCP + custoComercial + totalCustosProducao + custosCategoriasCustom;

  // Cálculo de horas e custo/hora com rateio
  const calcularCustoHoraComRateio = (categoriaId) => {
    const qtdFuncionarios = funcionarios[categoriaId] ? funcionarios[categoriaId].length : 0;
    const horasDisponiveis = qtdFuncionarios * horasContratadas;
    const totalHorasOciosas = horasOciosas * diasMedio * qtdFuncionarios;
    const horasUteis = horasDisponiveis - totalHorasOciosas;
    
    const custoDiretoSetor = calcularCustosSetor(categoriaId);
    const custoRateado = custosRateadosPorCategoria[categoriaId] || 0;
    const custoTotalSetor = custoDiretoSetor + custoRateado;
    const custoHora = horasUteis > 0 ? custoTotalSetor / horasUteis : 0;
    
    return { 
      custoHora, 
      horasDisponiveis, 
      horasUteis, 
      qtdFuncionarios,
      custoDireto: custoDiretoSetor,
      custoRateado: custoRateado,
      custoTotal: custoTotalSetor
    };
  };

  // Calcular resultados para todas as categorias rateadas
  const resultadosPorCategoria = {};
  categoriasRateadas.forEach(cat => {
    resultadosPorCategoria[cat.id] = calcularCustoHoraComRateio(cat.id);
  });

  // Handlers
  const adicionarCusto = () => {
    const novoId = Math.max(...custosFixos.map(c => c.id), 0) + 1;
    setCustosFixos([...custosFixos, { id: novoId, nome: 'Novo Custo', valor: 0, admin: 0 }]);
  };

  const removerCusto = (id) => {
    setCustosFixos(custosFixos.filter(c => c.id !== id));
  };

  const atualizarCusto = (id, campo, valorDigitado) => {
    if (campo === 'nome') {
      setCustosFixos(custosFixos.map(c => 
        c.id === id ? { ...c, nome: valorDigitado } : c
      ));
    } else {
      const chave = `custo-${id}`;
      const valorFormatado = formatarInputEmTempoReal(valorDigitado);
      
      setValoresTemp(prev => ({ ...prev, [chave]: valorFormatado }));
      
      setCustosFixos(custosFixos.map(c => 
        c.id === id ? { ...c, valor: parseNumero(valorFormatado) } : c
      ));
    }
  };

  const adicionarCategoria = () => {
    if (!novaCategoria.nome.trim()) return;
    
    const id = novaCategoria.nome.toLowerCase().replace(/\s+/g, '_');
    
    // Verificar se já existe
    if (categorias.find(c => c.id === id)) {
      alert('Já existe uma categoria com este nome!');
      return;
    }
    
    setCategorias([...categorias, { 
      id, 
      nome: novaCategoria.nome,
      cor: novaCategoria.cor,
      rateado: novaCategoria.rateado
    }]);
    
    // Inicializar array vazio para funcionários desta categoria
    setFuncionarios({
      ...funcionarios,
      [id]: []
    });
    
    setNovaCategoria({ nome: '', cor: 'stone', rateado: false });
    setMostrarFormCategoria(false);
  };

  const removerCategoria = (categoriaId) => {
    // Não permitir remover categorias principais
    if (['socio', 'administrativo', 'pcp', 'comercial', 'marceneiro', 'auxiliar'].includes(categoriaId)) {
      alert('Não é possível remover categorias padrão!');
      return;
    }
    
    if (funcionarios[categoriaId] && funcionarios[categoriaId].length > 0) {
      if (!confirm('Esta categoria possui funcionários. Deseja realmente removê-la?')) {
        return;
      }
    }
    
    setCategorias(categorias.filter(c => c.id !== categoriaId));
    
    const novosFuncionarios = { ...funcionarios };
    delete novosFuncionarios[categoriaId];
    setFuncionarios(novosFuncionarios);
  };

  // Funções para atualizar horas com formatação em tempo real
  const atualizarHorasContratadas = (valorDigitado) => {
    const chave = 'hora-contratadas';
    const valorFormatado = formatarInputEmTempoReal(valorDigitado);
    setValoresTemp(prev => ({ ...prev, [chave]: valorFormatado }));
    setHorasContratadas(parseNumero(valorFormatado));
  };

  const atualizarHorasOciosas = (valorDigitado) => {
    const chave = 'hora-ociosas';
    const valorFormatado = formatarInputEmTempoReal(valorDigitado);
    setValoresTemp(prev => ({ ...prev, [chave]: valorFormatado }));
    setHorasOciosas(parseNumero(valorFormatado));
  };

  const atualizarDiasMedio = (valorDigitado) => {
    const chave = 'hora-dias';
    const valorFormatado = formatarInputEmTempoReal(valorDigitado);
    setValoresTemp(prev => ({ ...prev, [chave]: valorFormatado }));
    setDiasMedio(parseNumero(valorFormatado));
  };

  // Limpar valor temporário quando sair do campo
  const limparValorTemp = (chave) => {
    setValoresTemp(prev => {
      const novo = { ...prev };
      delete novo[chave];
      return novo;
    });
  };

  const adicionarFuncionario = (setor) => {
    const novoId = Math.max(...(funcionarios[setor] || []).map(f => f.id), 0) + 1;
    setFuncionarios({
      ...funcionarios,
      [setor]: [...(funcionarios[setor] || []), { 
        id: novoId, 
        nome: 'Novo Funcionário', 
        salarioBase: 0, 
        extras: 0, 
        auxilio: 0 
      }]
    });
  };

  const removerFuncionario = (setor, id) => {
    setFuncionarios({
      ...funcionarios,
      [setor]: funcionarios[setor].filter(f => f.id !== id)
    });
  };

  const atualizarFuncionario = (setor, id, campo, valorDigitado) => {
    const chave = `${setor}-${id}-${campo}`;
    
    // Formata o valor em tempo real
    const valorFormatado = formatarInputEmTempoReal(valorDigitado);
    
    // Armazena o valor formatado temporariamente
    setValoresTemp(prev => ({ ...prev, [chave]: valorFormatado }));
    
    // Atualiza o valor real parseado
    setFuncionarios({
      ...funcionarios,
      [setor]: funcionarios[setor].map(f =>
        f.id === id ? { 
          ...f, 
          [campo]: campo === 'nome' ? valorDigitado : parseNumero(valorFormatado)
        } : f
      )
    });
  };

  const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };

  // Formatar número para padrão brasileiro (1.234,56)
  const formatarNumero = (valor) => {
    if (!valor && valor !== 0) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Converter string brasileira para número (1.234,56 -> 1234.56)
  const parseNumero = (valor) => {
    if (!valor) return 0;
    // Remove pontos (separador de milhares) e substitui vírgula por ponto
    const numero = valor.toString().replace(/\./g, '').replace(',', '.');
    return parseFloat(numero) || 0;
  };

  // Formatar input em tempo real enquanto usuário digita
  const formatarInputEmTempoReal = (valor) => {
    if (!valor) return '';
    
    // Remove tudo exceto números e vírgula
    let limpo = valor.replace(/[^\d,]/g, '');
    
    // Garante apenas uma vírgula
    const partes = limpo.split(',');
    if (partes.length > 2) {
      limpo = partes[0] + ',' + partes.slice(1).join('');
    }
    
    // Separa parte inteira e decimal
    let resultado = '';
    if (limpo.includes(',')) {
      const [inteiro, decimal] = limpo.split(',');
      // Adiciona separadores de milhares na parte inteira
      const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      resultado = inteiroFormatado + ',' + decimal.substring(0, 2);
    } else {
      // Adiciona separadores de milhares
      resultado = limpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    return resultado;
  };

  // Obter valor formatado para exibir no input
  const obterValorInput = (categoria, funcId, campo) => {
    const chave = `${categoria}-${funcId}-${campo}`;
    
    // Se tem valor temporário (está digitando), retorna ele
    if (valoresTemp[chave] !== undefined) {
      return valoresTemp[chave];
    }
    
    // Senão, retorna o valor real formatado
    const func = funcionarios[categoria]?.find(f => f.id === funcId);
    return func ? formatarNumero(func[campo]) : '';
  };

  // Obter valor para custos fixos
  const obterValorCusto = (custoId) => {
    const chave = `custo-${custoId}`;
    
    if (valoresTemp[chave] !== undefined) {
      return valoresTemp[chave];
    }
    
    const custo = custosFixos.find(c => c.id === custoId);
    return custo ? formatarNumero(custo.valor) : '';
  };

  // Obter valor para configuração de horas
  const obterValorHora = (campo, valor) => {
    const chave = `hora-${campo}`;
    
    if (valoresTemp[chave] !== undefined) {
      return valoresTemp[chave];
    }
    
    return formatarNumero(valor);
  };

  // Função para gerar PDF (VERSÃO NEUTRA/GRAFITE)
  const gerarPDF = () => {
    const totalFolhaPagamento = categorias.reduce((acc, cat) => {
      return acc + calcularCustosSetor(cat.id);
    }, 0);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 0;

    // ============================================================================
    // CABEÇALHO PROFISSIONAL COM BARRA NEUTRA (GRAFITE)
    // ============================================================================
    
    // Barra Cinza Chumbo no topo (altura 25mm)
    doc.setFillColor(38, 38, 38); // #262626 (Neutral-800/900)
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Título em branco sobre a barra
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE CUSTOS E VIABILIDADE', pageWidth / 2, 12, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Análise Gerencial de Inteligência - Marcenaria', pageWidth / 2, 19, { align: 'center' });
    
    // Data e hora à direita
    const agora = new Date();
    const dataHora = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    doc.setFontSize(8);
    doc.text(`Emitido em: ${dataHora}`, pageWidth - 14, 8, { align: 'right' });
    
    currentY = 35;

    // ============================================================================
    // BIG NUMBERS - RESUMO EXECUTIVO (3 CARDS)
    // ============================================================================
    
    doc.setTextColor(0, 0, 0); // Voltar para preto
    
    // Calcular KPIs
    const custoOperacionalTotal = totalCustosFixos + totalFolhaPagamento;
    
    // Custo Minuto Técnico
    const resultadoMarceneiro = resultadosPorCategoria['marceneiro'];
    const custoMinutoTecnico = resultadoMarceneiro && resultadoMarceneiro.custoHora > 0 
      ? resultadoMarceneiro.custoHora / 60 
      : 0;
    
    // Taxa de Eficiência
    let totalHorasContratadas = 0;
    let totalHorasUteis = 0;
    
    categorias.forEach(cat => {
      const qtdFunc = funcionarios[cat.id] ? funcionarios[cat.id].length : 0;
      const horasContratadasCat = qtdFunc * horasContratadas;
      const horasOciosasTotal = horasOciosas * diasMedio * qtdFunc;
      const horasUteisCat = horasContratadasCat - horasOciosasTotal;
      
      totalHorasContratadas += horasContratadasCat;
      totalHorasUteis += horasUteisCat;
    });
    
    const taxaEficiencia = totalHorasContratadas > 0 
      ? (totalHorasUteis / totalHorasContratadas) * 100 
      : 0;
    
    // Desenhar 3 cards lado a lado
    const cardWidth = 58;
    const cardHeight = 20;
    const cardSpacing = 5;
    const cardStartX = (pageWidth - (cardWidth * 3 + cardSpacing * 2)) / 2;
    
    // Card 1: Custo Operacional Total
    doc.setFillColor(245, 245, 245); // Cinza muito claro
    doc.roundedRect(cardStartX, currentY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(38, 38, 38); // Borda Grafite
    doc.setLineWidth(0.5);
    doc.roundedRect(cardStartX, currentY, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('CUSTO OPERACIONAL TOTAL', cardStartX + cardWidth / 2, currentY + 6, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(38, 38, 38);
    doc.text(formatMoeda(custoOperacionalTotal), cardStartX + cardWidth / 2, currentY + 14, { align: 'center' });
    
    // Card 2: Custo Minuto Técnico
    const card2X = cardStartX + cardWidth + cardSpacing;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, 'F');
    doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('CUSTO DO MINUTO TÉCNICO', card2X + cardWidth / 2, currentY + 6, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(38, 38, 38);
    doc.text(formatMoeda(custoMinutoTecnico), card2X + cardWidth / 2, currentY + 14, { align: 'center' });
    
    // Card 3: Taxa de Eficiência
    const card3X = card2X + cardWidth + cardSpacing;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, 'F');
    doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('TAXA DE EFICIÊNCIA', card3X + cardWidth / 2, currentY + 6, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(38, 38, 38);
    doc.text(`${taxaEficiencia.toFixed(1)}%`, card3X + cardWidth / 2, currentY + 14, { align: 'center' });
    
    currentY += cardHeight + 15;

    // ============================================================================
    // RANKING DE CUSTOS FIXOS (TOP 5)
    // ============================================================================
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RANKING DE CUSTOS FIXOS - TOP 5 VILÕES DO ORÇAMENTO', 14, currentY);
    currentY += 2;
    
    const custosOrdenados = [...custosFixos]
      .filter(c => c.valor > 0)
      .sort((a, b) => b.valor - a.valor);
    
    const top5 = custosOrdenados.slice(0, 5);
    const outros = custosOrdenados.slice(5);
    const valorOutros = outros.reduce((sum, c) => sum + c.valor, 0);
    
    const tabelaCustosFixos = top5.map(custo => {
      const percentual = totalCustosFixos > 0 ? (custo.valor / totalCustosFixos) * 100 : 0;
      return [
        custo.nome,
        formatMoeda(custo.valor),
        `${percentual.toFixed(1)}%`
      ];
    });
    
    if (valorOutros > 0) {
      const percentualOutros = totalCustosFixos > 0 ? (valorOutros / totalCustosFixos) * 100 : 0;
      tabelaCustosFixos.push([
        `Outros (${outros.length} itens)`,
        formatMoeda(valorOutros),
        `${percentualOutros.toFixed(1)}%`
      ]);
    }
    
    tabelaCustosFixos.push([
      'TOTAL',
      formatMoeda(totalCustosFixos),
      '100.0%'
    ]);
    
    doc.autoTable({
      startY: currentY,
      head: [['Item', 'Valor (R$)', '% do Total']],
      body: tabelaCustosFixos,
      theme: 'striped',
      headStyles: { 
        fillColor: [38, 38, 38], // Grafite
        textColor: 255, 
        fontStyle: 'bold',
        fontSize
