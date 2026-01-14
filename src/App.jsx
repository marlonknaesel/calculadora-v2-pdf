import React, { useState, useMemo } from 'react';
import { Calculator, Users, DollarSign, Clock, Plus, Trash2, TrendingUp, Building, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CalculoHorasApp() {
  const [activeTab, setActiveTab] = useState('custos');
  
  // Categorias customizáveis
  const [categorias, setCategorias] = useState([
    { id: 'socio', nome: 'Sócio/Proprietário', cor: 'violet', rateado: false },
    { id: 'administrativo', nome: 'Administrativo', cor: 'blue', rateado: false },
    { id: 'comercial', nome: 'Comercial', cor: 'green', rateado: false },
    { id: 'pcp', nome: 'PCP', cor: 'cyan', rateado: false },
    { id: 'marceneiro', nome: 'Marceneiro', cor: 'orange', rateado: true },
    { id: 'auxiliar', nome: 'Auxiliar Marceneiro', cor: 'purple', rateado: true }
  ]);

  const [novaCategoria, setNovaCategoria] = useState({ nome: '', cor: 'indigo', rateado: false });
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
    
    setNovaCategoria({ nome: '', cor: 'indigo', rateado: false });
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

  // Função para gerar PDF
  const gerarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE CUSTOS E PRODUTIVIDADE', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;

    // 1. RESUMO DE CUSTOS FIXOS
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. RESUMO DE CUSTOS FIXOS', 14, currentY);
    currentY += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Valor Total dos Custos Fixos: ${formatMoeda(totalCustosFixos)}`, 20, currentY);
    currentY += 10;

    // 2. DETALHAMENTO POR CATEGORIA
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. DETALHAMENTO POR CATEGORIA', 14, currentY);
    currentY += 7;

    // Preparar dados da tabela
    const tabelaCategorias = [];
    categorias.forEach(cat => {
      const custoTotal = calcularCustosSetor(cat.id);
      const qtdFunc = funcionarios[cat.id] ? funcionarios[cat.id].length : 0;
      const totalHorasContratadas = qtdFunc * horasContratadas;
      const horasOciosasTotal = horasOciosas * diasMedio * qtdFunc;
      const horasUteis = totalHorasContratadas - horasOciosasTotal;

      tabelaCategorias.push([
        cat.nome,
        formatMoeda(custoTotal),
        qtdFunc.toString(),
        `${totalHorasContratadas.toFixed(0)}h`,
        `${horasUteis.toFixed(0)}h`
      ]);
    });

    doc.autoTable({
      startY: currentY,
      head: [['Categoria', 'Custo Total', 'Funcionários', 'Horas Contratadas', 'Horas Úteis']],
      body: tabelaCategorias,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
        4: { cellWidth: 30, halign: 'center' }
      }
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // 3. CUSTOS DE PRODUÇÃO (DESTAQUE)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. CUSTOS DE PRODUÇÃO (CHÃO DE FÁBRICA)', 14, currentY);
    currentY += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Marceneiros: ${formatMoeda(custoMarceneiro)}`, 20, currentY);
    currentY += 5;
    doc.text(`Total Auxiliares: ${formatMoeda(custoAuxiliar)}`, 20, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL MÃO DE OBRA PRODUTIVA: ${formatMoeda(totalCustosProducao)}`, 20, currentY);
    currentY += 10;

    // 4. INDICADORES DE CUSTO/HORA
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. INDICADORES DE CUSTO/HORA', 14, currentY);
    currentY += 7;

    const tabelaCustoHora = [];
    categoriasRateadas.forEach(cat => {
      const resultado = resultadosPorCategoria[cat.id];
      if (resultado) {
        tabelaCustoHora.push([
          cat.nome,
          formatMoeda(resultado.custoHora),
          formatMoeda(resultado.custoDireto),
          formatMoeda(resultado.custoRateado),
          formatMoeda(resultado.custoTotal)
        ]);
      }
    });

    doc.autoTable({
      startY: currentY,
      head: [['Categoria', 'Custo/Hora', 'Custo Direto', 'Custo Rateado', 'Custo Total']],
      body: tabelaCustoHora,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 40, halign: 'right' }
      }
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // 5. METODOLOGIA
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5. METODOLOGIA', 14, currentY);
    currentY += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const textoMetodologia = 
      'Cálculo baseado em rateio por absorção de custos fixos mais custos variáveis de mão de obra ' +
      'direta sobre horas úteis. Os custos indiretos (fixos, societário, administrativo, PCP e comercial) ' +
      'são distribuídos proporcionalmente entre as categorias produtivas com base no peso salarial de cada ' +
      'categoria. O custo/hora final considera: (Custo Direto da Categoria + Custo Rateado) / Horas Úteis.';
    
    const linhasMetodologia = doc.splitTextToSize(textoMetodologia, pageWidth - 28);
    doc.text(linhasMetodologia, 14, currentY);

    // Rodapé
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Página ${i} de ${totalPages} - Marcenaria.ai - Calculadora de Custos`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Salvar PDF
    const nomeArquivo = `relatorio-custos-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Work+Sans:wght@300;400;600;800&display=swap');
        
        body { 
          font-family: 'Work Sans', sans-serif;
          background: #f9fafb;
        }
        
        .font-mono { font-family: 'Space Mono', monospace; }
        .font-display { font-family: 'Work Sans', sans-serif; font-weight: 800; }
        
        .card-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%);
          border: 1px solid rgba(59, 130, 246, 0.15);
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* 📱 MOBILE OPTIMIZATIONS */
        @media (max-width: 768px) {
          /* Inputs e Buttons maiores para mobile */
          input, select, textarea {
            min-height: 48px !important;
            font-size: 16px !important;
            padding: 12px 16px !important;
          }
          
          button {
            min-height: 48px !important;
            font-size: 14px !important;
            padding: 12px 16px !important;
          }
          
          /* Grid sempre 1 coluna no mobile */
          .grid {
            grid-template-columns: 1fr !important;
          }
          
          /* Reduzir padding geral */
          .max-w-7xl {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          
          .py-6, .py-8 {
            padding-top: 16px !important;
            padding-bottom: 16px !important;
          }
          
          .p-6, .p-5 {
            padding: 12px !important;
          }
          
          /* Textos menores */
          .text-3xl { font-size: 1.5rem !important; }
          .text-2xl { font-size: 1.25rem !important; }
          .text-xl { font-size: 1.125rem !important; }
          .text-lg { font-size: 1rem !important; }
          
          /* Gaps reduzidos */
          .gap-6 { gap: 12px !important; }
          .gap-4 { gap: 8px !important; }
          
          /* Touch feedback */
          button:active {
            transform: scale(0.97);
            opacity: 0.8;
          }
          
          input:focus, select:focus, textarea:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }
          
          /* Header compacto */
          .py-6 { padding-top: 12px !important; padding-bottom: 12px !important; }
          
          /* Tabs scrolláveis */
          .flex.gap-1 {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          
          .flex.gap-1::-webkit-scrollbar {
            display: none;
          }
        }
        
        /* Melhorias gerais de toque */
        * {
          -webkit-tap-highlight-color: rgba(59, 130, 246, 0.2);
        }
        
        body {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display text-3xl tracking-tight">CÁLCULO DE HORAS</h1>
                <p className="text-gray-600 text-sm mt-1 font-light">Sistema de Gestão de Custos e Produtividade</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-300">
                <span className="text-gray-600">Total Geral:</span>
                <span className="ml-2 font-mono font-bold text-blue-600">{formatMoeda(totalGeralCustos)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-xl sticky top-[97px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'custos', label: 'Custos Fixos', icon: DollarSign },
              { id: 'funcionarios', label: 'Funcionários', icon: Users },
              { id: 'calculo', label: 'Cálculo de Horas', icon: Clock },
              { id: 'resumo', label: 'Resumo Geral', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                  activeTab === tab.id 
                    ? 'text-blue-600 bg-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab: Custos Fixos */}
        {activeTab === 'custos' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display">Custos Fixos Mensais</h2>
                <p className="text-gray-600 mt-1">Gerencie todos os custos operacionais fixos</p>
              </div>
              <button
                onClick={adicionarCusto}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Adicionar Custo
              </button>
            </div>

            <div className="grid gap-3">
              {custosFixos.map((custo, idx) => (
                <div
                  key={custo.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 card-hover"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={custo.nome}
                        onChange={(e) => atualizarCusto(custo.id, 'nome', e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 transition-all"
                        placeholder="Nome do custo"
                      />
                      <input
                        type="text"
                        value={obterValorCusto(custo.id)}
                        onChange={(e) => atualizarCusto(custo.id, 'valor', e.target.value)}
                        onBlur={() => limparValorTemp(`custo-${custo.id}`)}
                        className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-mono focus:border-blue-500 transition-all"
                        placeholder="0,00"
                      />
                    </div>
                    <button
                      onClick={() => removerCusto(custo.id)}
                      className="p-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="stat-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Custos Fixos</p>
                  <p className="text-4xl font-display mt-2">{formatMoeda(totalCustosFixos)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Funcionários */}
        {activeTab === 'funcionarios' && (
          <div className="animate-fade-in space-y-8">
            {/* Info sobre INSS */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">Faixas de INSS 2024/2025</h4>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Até R$ 1.621,00</span>
                      <p className="text-blue-600 font-semibold">7,5%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">R$ 1.621,01 - R$ 2.902,84</span>
                      <p className="text-blue-600 font-semibold">9%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">R$ 2.902,85 - R$ 4.354,27</span>
                      <p className="text-blue-600 font-semibold">12%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">R$ 4.354,28 - R$ 8.475,55</span>
                      <p className="text-blue-600 font-semibold">14%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Cálculo progressivo (similar ao IR)</p>
                </div>
              </div>
            </div>

            {/* Info sobre Encargos */}
            <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">Cálculo de Encargos Trabalhistas</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="text-yellow-400 font-semibold">Encargos aplicados sobre Salário Base:</span> 13º salário, Férias (1/3), INSS e FGTS (8%)
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1">
                    <span className="text-green-400 font-semibold">Extras e Auxílios:</span> Somados ao custo total SEM incidência de encargos
                  </p>
                </div>
              </div>
            </div>

            {/* Botão para adicionar categoria */}
            <div className="flex justify-end">
              <button
                onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Categoria
              </button>
            </div>

            {/* Formulário de nova categoria */}
            {mostrarFormCategoria && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-display mb-4">Adicionar Nova Categoria</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 block mb-2">Nome da Categoria</label>
                    <input
                      type="text"
                      value={novaCategoria.nome}
                      onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 transition-all"
                      placeholder="Ex: Instalação, Manutenção..."
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Cor</label>
                    <select
                      value={novaCategoria.cor}
                      onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 transition-all"
                    >
                      <option value="red">Vermelho</option>
                      <option value="orange">Laranja</option>
                      <option value="yellow">Amarelo</option>
                      <option value="green">Verde</option>
                      <option value="blue">Azul</option>
                      <option value="indigo">Índigo</option>
                      <option value="violet">Violeta</option>
                      <option value="purple">Roxo</option>
                      <option value="pink">Rosa</option>
                      <option value="cyan">Ciano</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={novaCategoria.rateado}
                        onChange={(e) => setNovaCategoria({ ...novaCategoria, rateado: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 bg-gray-100"
                      />
                      <span className="text-sm text-gray-600">Rateado</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={adicionarCategoria}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => {
                      setMostrarFormCategoria(false);
                      setNovaCategoria({ nome: '', cor: 'indigo', rateado: false });
                    }}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {categorias.map(categoria => (
              <div key={categoria.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building className={`w-6 h-6 text-${categoria.cor}-500`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-display">{categoria.nome}</h3>
                        {categoria.rateado && (
                          <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-600 rounded-full border border-blue-800/30">
                            Rateado
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {funcionarios[categoria.id] ? funcionarios[categoria.id].length : 0} funcionário(s) • 
                        {formatMoeda(calcularCustosSetor(categoria.id))}
                        {categoria.rateado && pesoRateio[categoria.id] && 
                          ` (Peso: ${(pesoRateio[categoria.id] * 100).toFixed(1)}%)`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adicionarFuncionario(categoria.id)}
                      className={`flex items-center gap-2 px-4 py-2 bg-${categoria.cor}-600 hover:bg-${categoria.cor}-500 rounded-lg font-semibold transition-colors text-sm`}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                    {!['socio', 'administrativo', 'pcp', 'comercial', 'marceneiro', 'auxiliar'].includes(categoria.id) && (
                      <button
                        onClick={() => removerCategoria(categoria.id)}
                        className="p-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3">
                  {funcionarios[categoria.id] && funcionarios[categoria.id].map((func, idx) => (
                    <div
                      key={func.id}
                      className="bg-white border border-gray-200 rounded-lg p-5 card-hover"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          <input
                            type="text"
                            value={func.nome}
                            onChange={(e) => atualizarFuncionario(categoria.id, func.id, 'nome', e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 transition-all"
                            placeholder="Nome"
                          />
                          <div>
                            <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1">
                              Salário Base
                              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-900/30 text-yellow-400 rounded">com encargos</span>
                            </label>
                            <input
                              type="text"
                              value={obterValorInput(categoria.id, func.id, 'salarioBase')}
                              onChange={(e) => atualizarFuncionario(categoria.id, func.id, 'salarioBase', e.target.value)}
                              onBlur={() => limparValorTemp(`${categoria.id}-${func.id}-salarioBase`)}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-mono focus:border-blue-500 transition-all"
                              placeholder="0,00"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1">
                              Extras 
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded">sem encargos</span>
                            </label>
                            <input
                              type="text"
                              value={obterValorInput(categoria.id, func.id, 'extras')}
                              onChange={(e) => atualizarFuncionario(categoria.id, func.id, 'extras', e.target.value)}
                              onBlur={() => limparValorTemp(`${categoria.id}-${func.id}-extras`)}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-mono focus:border-blue-500 transition-all"
                              placeholder="0,00"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1.5 flex items-center gap-1">
                              Auxílio
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded">sem encargos</span>
                            </label>
                            <input
                              type="text"
                              value={obterValorInput(categoria.id, func.id, 'auxilio')}
                              onChange={(e) => atualizarFuncionario(categoria.id, func.id, 'auxilio', e.target.value)}
                              onBlur={() => limparValorTemp(`${categoria.id}-${func.id}-auxilio`)}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-mono focus:border-blue-500 transition-all"
                              placeholder="0,00"
                            />
                          </div>
                        </div>
                        <div className="text-right min-w-[180px]">
                          <div className="bg-gray-100/50 rounded-lg p-3 space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Salário Base:</span>
                              <span className="font-mono">{formatMoeda(func.salarioBase)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Encargos:</span>
                              <span className="font-mono text-yellow-400">
                                {formatMoeda(
                                  (func.salarioBase / 12) + // 13º
                                  ((func.salarioBase / 3) / 12) + // férias
                                  calcularINSS(func.salarioBase) + // INSS
                                  calcularINSS((func.salarioBase / 12) + ((func.salarioBase / 3) / 12)) + // INSS 13º/férias
                                  (func.salarioBase * 0.08) // FGTS
                                )}
                              </span>
                            </div>
                            {func.extras > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Extras (sem enc.):</span>
                                <span className="font-mono text-green-400">+{formatMoeda(func.extras)}</span>
                              </div>
                            )}
                            {func.auxilio > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Auxílio (sem enc.):</span>
                                <span className="font-mono text-green-400">+{formatMoeda(func.auxilio)}</span>
                              </div>
                            )}
                            <div className="flex justify-between pt-1.5 border-t border-gray-300">
                              <span className="text-gray-600 font-semibold text-xs">TOTAL:</span>
                              <span className="font-mono text-base font-bold text-blue-600">{formatMoeda(calcularCustoFuncionario(func))}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removerFuncionario(categoria.id, func.id)}
                          className="p-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!funcionarios[categoria.id] || funcionarios[categoria.id].length === 0) && (
                    <div className="bg-white/50 border border-gray-200 border-dashed rounded-lg p-8 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum funcionário cadastrado nesta categoria</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Cálculo de Horas */}
        {activeTab === 'calculo' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl font-display">Cálculo de Custo por Hora</h2>
              <p className="text-gray-600 mt-1">Custos diretos + rateio proporcional de custos indiretos</p>
            </div>

            {/* Configurações de Horas */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-display mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Configurações de Horas
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Horas Contratadas/Mês</label>
                  <input
                    type="text"
                    value={obterValorHora('contratadas', horasContratadas)}
                    onChange={(e) => atualizarHorasContratadas(e.target.value)}
                    onBlur={() => limparValorTemp('hora-contratadas')}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-xl font-bold focus:border-blue-500 transition-all"
                    placeholder="180,00"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-2 flex items-center gap-2">
                    Horas Ociosas/Dia
                    <span className="group relative">
                      <svg className="w-4 h-4 text-gray-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <path d="M12 16v-4" strokeWidth="2"/>
                        <circle cx="12" cy="8" r="0.5" fill="currentColor"/>
                      </svg>
                      <span className="invisible group-hover:visible absolute left-0 top-6 w-64 bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs text-gray-700 shadow-xl z-10">
                        Desconta tempo improdutivo apenas dos setores que geram receita
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={obterValorHora('ociosas', horasOciosas)}
                    onChange={(e) => atualizarHorasOciosas(e.target.value)}
                    onBlur={() => limparValorTemp('hora-ociosas')}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-xl font-bold focus:border-blue-500 transition-all"
                    placeholder="0,50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Dias Úteis/Mês</label>
                  <input
                    type="text"
                    value={obterValorHora('dias', diasMedio)}
                    onChange={(e) => atualizarDiasMedio(e.target.value)}
                    onBlur={() => limparValorTemp('hora-dias')}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-xl font-bold focus:border-blue-500 transition-all"
                    placeholder="21,00"
                  />
                </div>
              </div>
            </div>

            {/* Info sobre Rateio */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
                <div className="w-full">
                  <h4 className="font-semibold text-blue-300 mb-2">Rateio Proporcional de Custos</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    Os custos fixos e das categorias não-rateadas ({formatMoeda(custosNaoRateados)}) - incluindo Societário, Administrativo, PCP e Comercial - são distribuídos 
                    proporcionalmente entre as categorias rateadas com base no peso salarial:
                  </p>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categoriasRateadas.map(cat => (
                      <div key={cat.id}>
                        <span className={`text-${cat.cor}-400 font-semibold`}>{cat.nome}:</span> {(pesoRateio[cat.id] * 100).toFixed(1)}%
                        <span className="text-gray-500 text-sm ml-2">({formatMoeda(custosRateadosPorCategoria[cat.id])})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {categoriasRateadas.map(categoria => {
                const resultado = resultadosPorCategoria[categoria.id];
                if (!resultado) return null;
                
                return (
                  <div key={categoria.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-3 h-3 rounded-full bg-${categoria.cor}-500`}></div>
                      <h3 className="text-xl font-display">{categoria.nome}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Funcionários</span>
                        <span className="font-mono font-bold">{resultado.qtdFuncionarios}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Horas Disponíveis</span>
                        <span className="font-mono font-bold">{resultado.horasDisponiveis}h</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Horas Úteis</span>
                        <span className="font-mono font-bold">{resultado.horasUteis.toFixed(1)}h</span>
                      </div>
                      
                      {/* Breakdown de Custos */}
                      <div className="bg-gray-100/50 rounded-lg p-4 space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Custo Direto (Folha)</span>
                          <span className="font-mono">{formatMoeda(resultado.custoDireto)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Custo Rateado</span>
                          <span className="font-mono">{formatMoeda(resultado.custoRateado)}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t border-gray-300">
                          <span className="text-gray-700">Custo Total</span>
                          <span className="font-mono">{formatMoeda(resultado.custoTotal)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-4 bg-gray-100/50 rounded-lg px-4 mt-4">
                        <span className="text-gray-700 font-semibold">CUSTO/HORA</span>
                        <span className={`font-mono text-2xl font-bold text-${categoria.cor}-400`}>
                          {formatMoeda(resultado.custoHora)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Resumo Geral */}
        {activeTab === 'resumo' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl font-display">Resumo Geral</h2>
              <p className="text-gray-600 mt-1">Visão consolidada de todos os custos e indicadores</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stat-card rounded-xl p-5">
                <p className="text-gray-600 text-sm font-semibold mb-2">Custos Fixos</p>
                <p className="text-2xl font-display">{formatMoeda(totalCustosFixos)}</p>
              </div>
              <div className="stat-card rounded-xl p-5">
                <p className="text-gray-600 text-sm font-semibold mb-2">Societário</p>
                <p className="text-2xl font-display">{formatMoeda(calcularCustosSetor('socio'))}</p>
              </div>
              <div className="stat-card rounded-xl p-5">
                <p className="text-gray-600 text-sm font-semibold mb-2">Admin + PCP + Comercial</p>
                <p className="text-2xl font-display">{formatMoeda(custoAdmin + custoPCP + custoComercial)}</p>
              </div>
              <div className="stat-card rounded-xl p-5">
                <p className="text-gray-600 text-sm font-semibold mb-2">Custos Produção</p>
                <p className="text-gray-500 text-xs mb-1">Marceneiro e Auxiliares</p>
                <p className="text-2xl font-display">{formatMoeda(totalCustosProducao)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5">
                <p className="text-blue-100 text-sm font-semibold mb-2">TOTAL GERAL</p>
                <p className="text-3xl font-display text-white">{formatMoeda(totalGeralCustos)}</p>
              </div>
            </div>

            {/* Categorias Customizadas */}
            {custosCategoriasCustom > 0 && (
              <div>
                <h3 className="text-lg font-display mb-3 text-gray-700">Outras Categorias</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categorias
                    .filter(cat => !['socio', 'administrativo', 'pcp', 'comercial', 'marceneiro', 'auxiliar'].includes(cat.id))
                    .map(cat => {
                      const custo = calcularCustosSetor(cat.id);
                      if (custo === 0) return null;
                      return (
                        <div key={cat.id} className="stat-card rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full bg-${cat.cor}-500`}></div>
                            <p className="text-gray-600 text-sm font-semibold">{cat.nome}</p>
                          </div>
                          <p className="text-xl font-display">{formatMoeda(custo)}</p>
                          {cat.rateado && (
                            <p className="text-xs text-gray-500 mt-1">Categoria rateada</p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-display mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Custos por Categoria
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {categorias.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${cat.cor}-500`}></div>
                        <span className="text-gray-700">{cat.nome}</span>
                        {cat.rateado && pesoRateio[cat.id] !== undefined && (
                          <span className="text-xs text-gray-500">({(pesoRateio[cat.id] * 100).toFixed(0)}%)</span>
                        )}
                      </div>
                      <span className="font-mono font-bold">{formatMoeda(calcularCustosSetor(cat.id))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-display mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Custo/Hora com Rateio
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {categoriasRateadas.map(cat => {
                    const resultado = resultadosPorCategoria[cat.id];
                    if (!resultado) return null;
                    
                    return (
                      <div key={cat.id} className="bg-gray-100/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${cat.cor}-500`}></div>
                            <span className="text-gray-700 font-semibold">{cat.nome}</span>
                          </div>
                          <span className={`font-mono text-xl font-bold text-${cat.cor}-400`}>
                            {formatMoeda(resultado.custoHora)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Funcionários:</span>
                            <span className="ml-2 font-mono">{resultado.qtdFuncionarios}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Horas úteis:</span>
                            <span className="ml-2 font-mono">{resultado.horasUteis.toFixed(0)}h</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Custo direto:</span>
                            <span className="ml-2 font-mono text-xs">{formatMoeda(resultado.custoDireto)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Rateado:</span>
                            <span className="ml-2 font-mono text-xs">{formatMoeda(resultado.custoRateado)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detalhamento do Rateio */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-display mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Metodologia de Rateio
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Custos Não-Rateados Total</p>
                  <p className="text-2xl font-mono font-bold text-blue-600">{formatMoeda(custosNaoRateados)}</p>
                  <p className="text-xs text-gray-500 mt-1">Fixos + Societário + Admin + PCP + Comercial + Outras</p>
                </div>
                {categoriasRateadas.map(cat => (
                  <div key={cat.id}>
                    <p className="text-sm text-gray-600 mb-2">Salário Base {cat.nome}</p>
                    <p className={`text-2xl font-mono font-bold text-${cat.cor}-400`}>
                      {formatMoeda(salarioBasePorCategoria[cat.id] || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Peso: {((pesoRateio[cat.id] || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão Exportar PDF */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-display mb-2 flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-500" />
                    Exportar Relatório
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gere um PDF completo com todos os dados calculados, incluindo detalhamento por categoria,
                    custos de produção e metodologia de rateio.
                  </p>
                </div>
                <button
                  onClick={gerarPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  Baixar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
