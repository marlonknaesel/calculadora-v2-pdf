import React, { useState } from 'react';
import { Calculator, Users, DollarSign, Clock, Plus, Trash2, TrendingUp, Building, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CalculoHorasApp() {
  // 🔍 VERIFICAÇÃO DE VERSÃO
  console.log('📊 VERSÃO: v2.0-FINAL-FULL');
  
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
  const [valoresTemp, setValoresTemp] = useState({});

  const [horasContratadas, setHorasContratadas] = useState(180);
  const [horasOciosas, setHorasOciosas] = useState(0.5);
  const [diasMedio, setDiasMedio] = useState(21);
  
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

  const [funcionarios, setFuncionarios] = useState({
    socio: [{ id: 1, nome: 'Sócio Proprietário 1', salarioBase: 0, extras: 0, auxilio: 0 }],
    administrativo: [{ id: 1, nome: 'Recursos Humanos 1', salarioBase: 0, extras: 0, auxilio: 0 }],
    comercial: [{ id: 1, nome: 'Vendedor 1', salarioBase: 0, extras: 0, auxilio: 0 }],
    pcp: [{ id: 1, nome: 'Projetista 1', salarioBase: 0, extras: 0, auxilio: 0 }],
    marceneiro: [{ id: 1, nome: 'Marceneiro 1', salarioBase: 0, extras: 0, auxilio: 0 }],
    auxiliar: [{ id: 1, nome: 'Auxiliar Marceneiro 1', salarioBase: 0, extras: 0, auxilio: 0 }]
  });

  const calcularINSS = (salario) => {
    if (salario <= 1621.00) return salario * 0.075;
    if (salario <= 2902.84) return (1621.00 * 0.075) + ((salario - 1621.00) * 0.09);
    if (salario <= 4354.27) return (1621.00 * 0.075) + (1281.84 * 0.09) + ((salario - 2902.84) * 0.12);
    if (salario <= 8475.55) return (1621.00 * 0.075) + (1281.84 * 0.09) + (1451.43 * 0.12) + ((salario - 4354.27) * 0.14);
    return (1621.00 * 0.075) + (1281.84 * 0.09) + (1451.43 * 0.12) + (4121.28 * 0.14);
  };

  const calcularCustoFuncionario = (func) => {
    const salarioBase = func.salarioBase;
    const decimoTerceiro = salarioBase / 12;
    const ferias = (salarioBase / 3) / 12;
    const inss = calcularINSS(salarioBase);
    const inssEncargos = calcularINSS(decimoTerceiro + ferias);
    const fgts = salarioBase * 0.08;
    return salarioBase + decimoTerceiro + ferias + inss + inssEncargos + fgts + func.extras + func.auxilio;
  };

  const calcularCustosSetor = (setor) => {
    if (!funcionarios[setor]) return 0;
    return funcionarios[setor].reduce((total, func) => total + calcularCustoFuncionario(func), 0);
  };

  const calcularSalarioBaseTotal = (setor) => {
    if (!funcionarios[setor]) return 0;
    return funcionarios[setor].reduce((total, func) => total + func.salarioBase, 0);
  };

  const totalCustosFixos = custosFixos.reduce((sum, c) => sum + c.valor, 0);
  const custoSocio = calcularCustosSetor('socio');
  const custoAdmin = calcularCustosSetor('administrativo');
  const custoPCP = calcularCustosSetor('pcp');
  const custoComercial = calcularCustosSetor('comercial');
  const custoMarceneiro = calcularCustosSetor('marceneiro');
  const custoAuxiliar = calcularCustosSetor('auxiliar');

  const custosCategoriasCustom = categorias
    .filter(cat => !['socio', 'administrativo', 'pcp', 'comercial', 'marceneiro', 'auxiliar'].includes(cat.id))
    .reduce((total, cat) => total + calcularCustosSetor(cat.id), 0);

  const custosNaoRateados = totalCustosFixos + custoSocio + custoAdmin + custoComercial + custoPCP +
    categorias
      .filter(cat => !cat.rateado && !['socio', 'administrativo', 'comercial', 'pcp'].includes(cat.id))
      .reduce((total, cat) => total + calcularCustosSetor(cat.id), 0);

  const categoriasRateadas = categorias.filter(cat => cat.rateado);
  const salarioBasePorCategoria = {};
  let salarioBaseTotalRateado = 0;
  
  categoriasRateadas.forEach(cat => {
    const salario = calcularSalarioBaseTotal(cat.id);
    salarioBasePorCategoria[cat.id] = salario;
    salarioBaseTotalRateado += salario;
  });

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

  const calcularCustoHoraComRateio = (categoriaId) => {
    const qtdFuncionarios = funcionarios[categoriaId] ? funcionarios[categoriaId].length : 0;
    const horasDisponiveis = qtdFuncionarios * horasContratadas;
    const totalHorasOciosas = horasOciosas * diasMedio * qtdFuncionarios;
    const horasUteis = horasDisponiveis - totalHorasOciosas;
    const custoDiretoSetor = calcularCustosSetor(categoriaId);
    const custoRateado = custosRateadosPorCategoria[categoriaId] || 0;
    const custoTotalSetor = custoDiretoSetor + custoRateado;
    const custoHora = horasUteis > 0 ? custoTotalSetor / horasUteis : 0;
    return { custoHora, horasDisponiveis, horasUteis, qtdFuncionarios, custoDireto: custoDiretoSetor, custoRateado, custoTotal: custoTotalSetor };
  };

  const resultadosPorCategoria = {};
  categoriasRateadas.forEach(cat => {
    resultadosPorCategoria[cat.id] = calcularCustoHoraComRateio(cat.id);
  });

  const adicionarCusto = () => {
    const novoId = Math.max(...custosFixos.map(c => c.id), 0) + 1;
    setCustosFixos([...custosFixos, { id: novoId, nome: 'Novo Custo', valor: 0, admin: 0 }]);
  };

  const removerCusto = (id) => setCustosFixos(custosFixos.filter(c => c.id !== id));

  const atualizarCusto = (id, campo, valorDigitado) => {
    if (campo === 'nome') {
      setCustosFixos(custosFixos.map(c => c.id === id ? { ...c, nome: valorDigitado } : c));
    } else {
      const chave = `custo-${id}`;
      const valorFormatado = formatarInputEmTempoReal(valorDigitado);
      setValoresTemp(prev => ({ ...prev, [chave]: valorFormatado }));
      setCustosFixos(custosFixos.map(c => c.id === id ? { ...c, valor: parseNumero(valorFormatado) } : c));
    }
  };

  const adicionarCategoria = () => {
    if (!novaCategoria.nome.trim()) return;
    const id = novaCategoria.nome.toLowerCase().replace(/\s+/g, '_');
    if (categorias.find(c => c.id === id)) { alert('Já existe uma categoria com este nome!'); return; }
    setCategorias([...categorias, { id, nome: novaCategoria.nome, cor: novaCategoria.cor, rateado: novaCategoria.rateado }]);
    setFuncionarios({ ...funcionarios, [id]: [] });
    setNovaCategoria({ nome: '', cor: 'indigo', rateado: false });
    setMostrarFormCategoria(false);
  };

  const removerCategoria = (categoriaId) => {
    if (['socio', 'administrativo', 'pcp', 'comercial', 'marceneiro', 'auxiliar'].includes(categoriaId)) { alert('Não é possível remover categorias padrão!'); return; }
    if (funcionarios[categoriaId] && funcionarios[categoriaId].length > 0 && !confirm('Esta categoria possui funcionários. Deseja realmente removê-la?')) return;
    setCategorias(categorias.filter(c => c.id !== categoriaId));
    const novosFuncionarios = { ...funcionarios };
    delete novosFuncionarios[categoriaId];
    setFuncionarios(novosFuncionarios);
  };

  const atualizarHorasContratadas = (v) => { const f = formatarInputEmTempoReal(v); setValoresTemp(p => ({...p, 'hora-contratadas': f})); setHorasContratadas(parseNumero(f)); };
  const atualizarHorasOciosas = (v) => { const f = formatarInputEmTempoReal(v); setValoresTemp(p => ({...p, 'hora-ociosas': f})); setHorasOciosas(parseNumero(f)); };
  const atualizarDiasMedio = (v) => { const f = formatarInputEmTempoReal(v); setValoresTemp(p => ({...p, 'hora-dias': f})); setDiasMedio(parseNumero(f)); };
  
  const limparValorTemp = (chave) => {
    setValoresTemp(prev => { const novo = { ...prev }; delete novo[chave]; return novo; });
  };

  const adicionarFuncionario = (setor) => {
    const novoId = Math.max(...(funcionarios[setor] || []).map(f => f.id), 0) + 1;
    setFuncionarios({ ...funcionarios, [setor]: [...(funcionarios[setor] || []), { id: novoId, nome: 'Novo Funcionário', salarioBase: 0, extras: 0, auxilio: 0 }] });
  };

  const removerFuncionario = (setor, id) => {
    setFuncionarios({ ...funcionarios, [setor]: funcionarios[setor].filter(f => f.id !== id) });
  };

  const atualizarFuncionario = (setor, id, campo, valorDigitado) => {
    const chave = `${setor}-${id}-${campo}`;
    const valorFormatado = formatarInputEmTempoReal(valorDigitado);
    setValoresTemp(prev => ({ ...prev, [chave]: valorFormatado }));
    setFuncionarios({
      ...funcionarios,
      [setor]: funcionarios[setor].map(f => f.id === id ? { ...f, [campo]: campo === 'nome' ? valorDigitado : parseNumero(valorFormatado) } : f)
    });
  };

  const formatMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  const formatarNumero = (valor) => (!valor && valor !== 0) ? '' : valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const parseNumero = (valor) => { if (!valor) return 0; const numero = valor.toString().replace(/\./g, '').replace(',', '.'); return parseFloat(numero) || 0; };
  
  const formatarInputEmTempoReal = (valor) => {
    if (!valor) return '';
    let limpo = valor.replace(/[^\d,]/g, '');
    const partes = limpo.split(',');
    if (partes.length > 2) limpo = partes[0] + ',' + partes.slice(1).join('');
    let resultado = '';
    if (limpo.includes(',')) {
      const [inteiro, decimal] = limpo.split(',');
      const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      resultado = inteiroFormatado + ',' + decimal.substring(0, 2);
    } else {
      resultado = limpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return resultado;
  };

  const obterValorInput = (cat, id, campo) => valoresTemp[`${cat}-${id}-${campo}`] !== undefined ? valoresTemp[`${cat}-${id}-${campo}`] : (funcionarios[cat]?.find(f => f.id === id) ? formatarNumero(funcionarios[cat].find(f => f.id === id)[campo]) : '');
  const obterValorCusto = (id) => valoresTemp[`custo-${id}`] !== undefined ? valoresTemp[`custo-${id}`] : (custosFixos.find(c => c.id === id) ? formatarNumero(custosFixos.find(c => c.id === id).valor) : '');
  const obterValorHora = (campo, valor) => valoresTemp[`hora-${campo}`] !== undefined ? valoresTemp[`hora-${campo}`] : formatarNumero(valor);

  // GERAÇÃO DE PDF
  const gerarPDF = () => {
    const totalFolhaPagamento = categorias.reduce((acc, cat) => acc + calcularCustosSetor(cat.id), 0);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 0;

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE CUSTOS E VIABILIDADE', pageWidth / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Análise Gerencial de Inteligência - Marcenaria', pageWidth / 2, 19, { align: 'center' });
    
    const agora = new Date();
    doc.setFontSize(8);
    doc.text(`Emitido em: ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - 14, 8, { align: 'right' });
    currentY = 35;

    doc.setTextColor(0, 0, 0);
    const custoOperacionalTotal = totalCustosFixos + totalFolhaPagamento;
    const resultadoMarceneiro = resultadosPorCategoria['marceneiro'];
    const custoMinutoTecnico = resultadoMarceneiro && resultadoMarceneiro.custoHora > 0 ? resultadoMarceneiro.custoHora / 60 : 0;
    
    let totalHorasContratadas = 0;
    let totalHorasUteis = 0;
    categorias.forEach(cat => {
      const qtdFunc = funcionarios[cat.id] ? funcionarios[cat.id].length : 0;
      totalHorasContratadas += qtdFunc * horasContratadas;
      totalHorasUteis += (qtdFunc * horasContratadas) - (horasOciosas * diasMedio * qtdFunc);
    });
    const taxaEficiencia = totalHorasContratadas > 0 ? (totalHorasUteis / totalHorasContratadas) * 100 : 0;

    const cardWidth = 58;
    const cardHeight = 20;
    const cardSpacing = 5;
    const cardStartX = (pageWidth - (cardWidth * 3 + cardSpacing * 2)) / 2;
    
    const drawCard = (x, label, value) => {
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'S');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(label, x + cardWidth / 2, currentY + 6, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text(value, x + cardWidth / 2, currentY + 14, { align: 'center' });
    };

    drawCard(cardStartX, 'CUSTO OPERACIONAL TOTAL', formatMoeda(custoOperacionalTotal));
    drawCard(cardStartX + cardWidth + cardSpacing, 'CUSTO DO MINUTO TÉCNICO', formatMoeda(custoMinutoTecnico));
    drawCard(cardStartX + cardWidth * 2 + cardSpacing * 2, 'TAXA DE EFICIÊNCIA', `${taxaEficiencia.toFixed(1)}%`);
    currentY += cardHeight + 15;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RANKING DE CUSTOS FIXOS - TOP 5 VILÕES DO ORÇAMENTO', 14, currentY);
    currentY += 2;
    
    const custosOrdenados = [...custosFixos].filter(c => c.valor > 0).sort((a, b) => b.valor - a.valor);
    const top5 = custosOrdenados.slice(0, 5);
    const outros = custosOrdenados.slice(5);
    const valorOutros = outros.reduce((sum, c) => sum + c.valor, 0);
    
    const tabelaCustosFixos = top5.map(c => [c.nome, formatMoeda(c.valor), `${(totalCustosFixos > 0 ? (c.valor / totalCustosFixos) * 100 : 0).toFixed(1)}%`]);
    if (valorOutros > 0) tabelaCustosFixos.push([`Outros (${outros.length} itens)`, formatMoeda(valorOutros), `${(totalCustosFixos > 0 ? (valorOutros / totalCustosFixos) * 100 : 0).toFixed(1)}%`]);
    tabelaCustosFixos.push(['TOTAL', formatMoeda(totalCustosFixos), '100.0%']);
    
    doc.autoTable({
      startY: currentY,
      head: [['Item', 'Valor (R$)', '% do Total']],
      body: tabelaCustosFixos,
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 45, halign: 'right' }, 2: { cellWidth: 35, halign: 'center' } },
      didParseCell: (data) => { if (data.row.index === tabelaCustosFixos.length - 1) { data.cell.styles.fillColor = [220, 230, 245]; data.cell.styles.fontStyle = 'bold'; } }
    });
    currentY = doc.lastAutoTable.finalY + 12;

    doc.text('DETALHAMENTO DE MÃO DE OBRA POR CATEGORIA', 14, currentY);
    currentY += 2;
    
    const tabelaMaoObra = [];
    categorias.forEach(cat => {
      const custoTotal = calcularCustosSetor(cat.id);
      const qtd = funcionarios[cat.id] ? funcionarios[cat.id].length : 0;
      if (qtd > 0 || custoTotal > 0) {
        const res = resultadosPorCategoria[cat.id];
        const hContratadas = qtd * horasContratadas;
        const hUteis = hContratadas - (horasOciosas * diasMedio * qtd);
        tabelaMaoObra.push([cat.nome, qtd.toString(), formatMoeda(custoTotal), `${hContratadas.toFixed(0)}h`, `${hUteis.toFixed(0)}h`, formatMoeda(res ? res.custoHora : 0)]);
      }
    });
    tabelaMaoObra.push(['TOTAL FOLHA', categorias.reduce((s, c) => s + (funcionarios[c.id]?.length || 0), 0).toString(), formatMoeda(totalFolhaPagamento), `${totalHorasContratadas.toFixed(0)}h`, `${totalHorasUteis.toFixed(0)}h`, '-']);

    doc.autoTable({
      startY: currentY,
      head: [['Categoria', 'Qtd', 'Custo Total', 'H. Contratadas', 'H. Úteis', 'Custo/Hora']],
      body: tabelaMaoObra,
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 5: { halign: 'right', fontStyle: 'bold', textColor: [30, 64, 175] } },
      didParseCell: (data) => { if (data.row.index === tabelaMaoObra.length - 1) { data.cell.styles.fillColor = [220, 230, 245]; data.cell.styles.fontStyle = 'bold'; } }
    });
    currentY = doc.lastAutoTable.finalY + 12;

    if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }
    doc.text('CUSTO/HORA POR CATEGORIA (COM RATEIO)', 14, currentY);
    currentY += 2;
    
    const tabelaCustoHora = [];
    categoriasRateadas.forEach(cat => {
      const res = resultadosPorCategoria[cat.id];
      if (res) tabelaCustoHora.push([cat.nome, formatMoeda(res.custoHora), formatMoeda(res.custoDireto), formatMoeda(res.custoRateado), formatMoeda(res.custoTotal)]);
    });

    doc.autoTable({
      startY: currentY,
      head: [['Categoria', 'Custo/Hora', 'Custo Direto', 'Custo Rateado', 'Custo Total']],
      body: tabelaCustoHora,
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold', textColor: [30, 64, 175] }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
    });
    currentY = doc.lastAutoTable.finalY + 12;

    if (currentY > pageHeight - 40) { doc.addPage(); currentY = 20; }
    doc.setFontSize(10);
    doc.text('NOTAS TÉCNICAS:', 14, currentY);
    currentY += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    [`• Taxa de Eficiência: Considera ${(horasOciosas * diasMedio).toFixed(1)}h de ociosidade por funcionário/mês`,
     '• Custo Minuto Técnico: Ideal para orçamentos de CNC e operações precisas',
     '• Ranking de Custos: Ordenado por impacto financeiro decrescente',
     '• Rateio: Custos indiretos distribuídos proporcionalmente ao peso salarial'].forEach((nota, i) => doc.text(nota, 14, currentY + (i * 4)));

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(200);
      doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
      doc.setFontSize(9);
      doc.text('Marcenaria.ai - Sistema de Gestão de Custos e Produtividade', pageWidth / 2, pageHeight - 13, { align: 'center' });
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }
    doc.save(`relatorio-gerencial-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ... CONTINUA NA PARTE 2 ABAIXO (NÃO ESQUEÇA DE COPIAR A PARTE 2) ...
// ... CONTINUAÇÃO DA PARTE 1 ...

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { background: #f9fafb !important; width: 100% !important; min-height: 100vh !important; }
        body { font-family: 'Work Sans', sans-serif; color: #111827 !important; }
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Work+Sans:wght@300;400;600;800&display=swap');
        .font-mono { font-family: 'Space Mono', monospace; }
        .font-display { font-family: 'Work Sans', sans-serif; font-weight: 800; }
        .card-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); }
        input:focus { outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
        .stat-card { background: linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(37, 99, 235, 0.02) 100%); border: 1px solid rgba(59, 130, 246, 0.15); }
        .animate-fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 768px) {
          input, select, textarea, button { min-height: 48px !important; font-size: 16px !important; }
          .grid { grid-template-columns: 1fr !important; }
          .max-w-7xl { padding-left: 12px !important; padding-right: 12px !important; }
          .py-6, .py-8 { padding-top: 16px !important; padding-bottom: 16px !important; }
          .p-6, .p-5 { padding: 12px !important; }
          .text-3xl { font-size: 1.5rem !important; } .text-2xl { font-size: 1.25rem !important; }
          .gap-6 { gap: 12px !important; } .gap-4 { gap: 8px !important; }
          .flex.gap-1 { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .flex.gap-1::-webkit-scrollbar { display: none; }
        }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div className="border-b border-gray-200 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display text-3xl tracking-tight">CÁLCULO DE HORAS</h1>
                <p className="text-gray-600 text-sm mt-1 font-light">Sistema de Gestão de Custos</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="px-4 py-2 bg-white rounded-lg border border-gray-300">
                <span className="text-gray-600">Total Geral:</span>
                <span className="ml-2 font-mono font-bold text-blue-800">{formatMoeda(totalGeralCustos)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white/30">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="flex gap-1 flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-hide">
            {[
              { id: 'custos', label: 'Custos Fixos', icon: DollarSign },
              { id: 'funcionarios', label: 'Funcionários', icon: Users },
              { id: 'calculo', label: 'Cálculo de Horas', icon: Clock },
              { id: 'resumo', label: 'Resumo Geral', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 flex-shrink-0 font-semibold transition-all relative ${
                  activeTab === tab.id ? 'text-blue-800 bg-white' : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm md:text-base whitespace-nowrap">{tab.label}</span>
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Tab: Custos Fixos */}
        {activeTab === 'custos' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display">Custos Fixos Mensais</h2>
                <p className="text-gray-600 mt-1">Gerencie todos os custos operacionais fixos</p>
              </div>
              <button onClick={adicionarCusto} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">
                <Plus className="w-5 h-5" /> Adicionar
              </button>
            </div>
            <div className="grid gap-3">
              {custosFixos.map((custo) => (
                <div key={custo.id} className="bg-white border border-gray-200 rounded-lg p-5 card-hover">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <input type="text" value={custo.nome} onChange={(e) => atualizarCusto(custo.id, 'nome', e.target.value)} className="bg-white border border-gray-300 rounded-lg px-4 py-2.5" />
                      <input type="text" value={obterValorCusto(custo.id)} onChange={(e) => atualizarCusto(custo.id, 'valor', e.target.value)} onBlur={() => limparValorTemp(`custo-${custo.id}`)} className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 font-mono" placeholder="0,00" />
                    </div>
                    <button onClick={() => removerCusto(custo.id)} className="p-2.5 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="stat-card rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-gray-600 text-sm font-semibold uppercase">Total Custos Fixos</p><p className="text-4xl font-display mt-2">{formatMoeda(totalCustosFixos)}</p></div>
                <DollarSign className="w-12 h-12 text-blue-800 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Funcionários */}
        {activeTab === 'funcionarios' && (
          <div className="animate-fade-in space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-5">
              <h4 className="font-semibold text-blue-800 mb-2">Faixas de INSS 2024/2025</h4>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                {[
                  { l: 'Até R$ 1.621,00', v: '7,5%' }, { l: 'R$ 1.621 - 2.902', v: '9%' },
                  { l: 'R$ 2.902 - 4.354', v: '12%' }, { l: 'R$ 4.354 - 8.475', v: '14%' }
                ].map((i, k) => <div key={k}><span className="text-gray-600">{i.l}</span><p className="text-blue-800 font-semibold">{i.v}</p></div>)}
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold"><Plus className="w-4 h-4" /> Nova Categoria</button>
            </div>
            {mostrarFormCategoria && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-2"><label className="block text-sm text-gray-600 mb-1">Nome</label><input type="text" value={novaCategoria.nome} onChange={e => setNovaCategoria({...novaCategoria, nome: e.target.value})} className="w-full border rounded-lg px-4 py-2" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Cor</label><select value={novaCategoria.cor} onChange={e => setNovaCategoria({...novaCategoria, cor: e.target.value})} className="w-full border rounded-lg px-4 py-2"><option value="blue">Azul</option><option value="orange">Laranja</option><option value="green">Verde</option><option value="purple">Roxo</option></select></div>
                  <div className="flex items-center pt-6"><label className="flex items-center gap-2"><input type="checkbox" checked={novaCategoria.rateado} onChange={e => setNovaCategoria({...novaCategoria, rateado: e.target.checked})} /> Rateado</label></div>
                </div>
                <div className="flex gap-3 mt-4"><button onClick={adicionarCategoria} className="px-5 py-2 bg-blue-600 text-white rounded-lg">Salvar</button><button onClick={() => setMostrarFormCategoria(false)} className="px-5 py-2 border rounded-lg">Cancelar</button></div>
              </div>
            )}
            {categorias.map(cat => (
              <div key={cat.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building className={`w-6 h-6 text-${cat.cor}-500`} />
                    <div><h3 className="text-xl font-display">{cat.nome} {cat.rateado && <span className="text-xs bg-blue-100 px-2 py-1 rounded-full">Rateado</span>}</h3>
                    <p className="text-sm text-gray-600">{funcionarios[cat.id]?.length || 0} func • {formatMoeda(calcularCustosSetor(cat.id))}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => adicionarFuncionario(cat.id)} className={`flex items-center gap-2 px-4 py-2 bg-${cat.cor}-600 hover:bg-${cat.cor}-500 rounded-lg text-sm font-semibold`}><Plus className="w-4 h-4" /> Add</button>
                    {!['socio', 'administrativo', 'pcp', 'comercial', 'marceneiro', 'auxiliar'].includes(cat.id) && <button onClick={() => removerCategoria(cat.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                </div>
                <div className="grid gap-3">
                  {funcionarios[cat.id]?.map(func => (
                    <div key={func.id} className="bg-white border rounded-lg p-5 card-hover">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                          <input type="text" value={func.nome} onChange={e => atualizarFuncionario(cat.id, func.id, 'nome', e.target.value)} className="border rounded-lg px-3 py-2" placeholder="Nome" />
                          <input type="text" value={obterValorInput(cat.id, func.id, 'salarioBase')} onChange={e => atualizarFuncionario(cat.id, func.id, 'salarioBase', e.target.value)} onBlur={() => limparValorTemp(`${cat.id}-${func.id}-salarioBase`)} className="border rounded-lg px-3 py-2 font-mono" placeholder="Salário Base" />
                          <input type="text" value={obterValorInput(cat.id, func.id, 'extras')} onChange={e => atualizarFuncionario(cat.id, func.id, 'extras', e.target.value)} onBlur={() => limparValorTemp(`${cat.id}-${func.id}-extras`)} className="border rounded-lg px-3 py-2 font-mono" placeholder="Extras" />
                          <input type="text" value={obterValorInput(cat.id, func.id, 'auxilio')} onChange={e => atualizarFuncionario(cat.id, func.id, 'auxilio', e.target.value)} onBlur={() => limparValorTemp(`${cat.id}-${func.id}-auxilio`)} className="border rounded-lg px-3 py-2 font-mono" placeholder="Auxílio" />
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                           <div className="text-right"><span className="text-xs text-gray-500 block">Custo Total</span><span className="font-bold font-mono text-blue-800">{formatMoeda(calcularCustoFuncionario(func))}</span></div>
                           <button onClick={() => removerFuncionario(cat.id, func.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Cálculo de Horas */}
        {activeTab === 'calculo' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-display">Cálculo de Custo por Hora</h2>
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="grid md:grid-cols-3 gap-4">
                <div><label className="block text-sm text-gray-600 mb-1">Horas Contratadas</label><input type="text" value={obterValorHora('contratadas', horasContratadas)} onChange={e => atualizarHorasContratadas(e.target.value)} onBlur={() => limparValorTemp('hora-contratadas')} className="w-full border rounded-lg px-4 py-2 font-mono font-bold" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">Horas Ociosas/Dia</label><input type="text" value={obterValorHora('ociosas', horasOciosas)} onChange={e => atualizarHorasOciosas(e.target.value)} onBlur={() => limparValorTemp('hora-ociosas')} className="w-full border rounded-lg px-4 py-2 font-mono font-bold" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">Dias Úteis</label><input type="text" value={obterValorHora('dias', diasMedio)} onChange={e => atualizarDiasMedio(e.target.value)} onBlur={() => limparValorTemp('hora-dias')} className="w-full border rounded-lg px-4 py-2 font-mono font-bold" /></div>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              {categoriasRateadas.map(cat => {
                const res = resultadosPorCategoria[cat.id];
                if (!res) return null;
                return (
                  <div key={cat.id} className="bg-white border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4"><div className={`w-3 h-3 rounded-full bg-${cat.cor}-500`}></div><h3 className="text-xl font-display">{cat.nome}</h3></div>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Funcionários</span><span className="font-mono font-bold">{res.qtdFuncionarios}</span></div>
                      <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Horas Úteis</span><span className="font-mono font-bold">{res.horasUteis.toFixed(1)}h</span></div>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm"><div className="flex justify-between"><span>Custo Direto</span><span className="font-mono">{formatMoeda(res.custoDireto)}</span></div><div className="flex justify-between"><span>Rateio</span><span className="font-mono">{formatMoeda(res.custoRateado)}</span></div></div>
                      <div className="flex justify-between items-center pt-2"><span className="font-bold text-gray-900">CUSTO/HORA</span><span className={`text-2xl font-mono font-bold text-${cat.cor}-500`}>{formatMoeda(res.custoHora)}</span></div>
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
            <h2 className="text-2xl font-display">Resumo Geral</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card p-4 rounded-xl"><p className="text-sm font-semibold text-gray-600">Custos Fixos</p><p className="text-2xl font-display">{formatMoeda(totalCustosFixos)}</p></div>
              <div className="stat-card p-4 rounded-xl"><p className="text-sm font-semibold text-gray-600">Pessoal (Folha)</p><p className="text-2xl font-display">{formatMoeda(categorias.reduce((acc, cat) => acc + calcularCustosSetor(cat.id), 0))}</p></div>
              <div className="stat-card p-4 rounded-xl"><p className="text-sm font-semibold text-gray-600">Custos Produção</p><p className="text-2xl font-display">{formatMoeda(totalCustosProducao)}</p></div>
              <div className="bg-blue-600 text-white p-4 rounded-xl"><p className="text-sm font-semibold text-blue-100">TOTAL GERAL</p><p className="text-3xl font-display">{formatMoeda(totalGeralCustos)}</p></div>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div><h3 className="text-lg font-bold flex items-center gap-2"><Download className="w-5 h-5 text-blue-600"/> Exportar Relatório</h3><p className="text-sm text-gray-600">Baixe o PDF completo com detalhamento técnico.</p></div>
                <button onClick={gerarPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"><Download className="w-5 h-5" /> Baixar PDF</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
