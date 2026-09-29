import React, { useState } from 'react';
import { useGymLabs } from '../../../context/GymLabsContext';
import { TrainerFinanceTransaction } from '../../../types/trainer';
import {
  DollarSign,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle,
  X
} from 'lucide-react';

export const TrainerFinancesTab: React.FC = () => {
  const { trainerFinances, addTrainerFinanceTransaction } = useGymLabs();

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Transaction Form
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [category, setCategory] = useState<TrainerFinanceTransaction['category']>('MENSALIDADE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(1200);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'PAID' | 'PENDING' | 'OVERDUE'>('PAID');
  const [studentName, setStudentName] = useState('Alex Vance');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'TRANSFER'>('PIX');

  const filteredTransactions = trainerFinances.filter((f) => {
    const matchesType = typeFilter === 'ALL' || f.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const totalIncomes = trainerFinances
    .filter((f) => f.type === 'INCOME' && f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingReceivables = trainerFinances
    .filter((f) => f.type === 'INCOME' && f.status === 'PENDING')
    .reduce((sum, f) => sum + f.amount, 0);

  const overdueIncomes = trainerFinances
    .filter((f) => f.type === 'INCOME' && f.status === 'OVERDUE')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpenses = trainerFinances
    .filter((f) => f.type === 'EXPENSE' && f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const netProfit = totalIncomes - totalExpenses;

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTx: TrainerFinanceTransaction = {
      id: `t_fin_${Date.now()}`,
      type,
      category,
      description,
      amount,
      dueDate,
      paymentDate: status === 'PAID' ? new Date().toISOString().split('T')[0] : undefined,
      status,
      studentName: type === 'INCOME' ? studentName : undefined,
      paymentMethod,
    };

    addTrainerFinanceTransaction(newTx);
    setShowNewModal(false);
    setDescription('');
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              FINANCEIRO PROFISSIONAL DO PERSONAL TRAINER
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Gestão financeira autônoma de mensalidades, consultorias esportivas, pacotes de aulas e repasses de academia.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>NOVO LANÇAMENTO</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Faturamento Bruto</span>
          <div className="text-2xl font-black text-emerald-400">
            R$ {totalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" /> Mensalidades & Aulas
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Despesas Profissionais</span>
          <div className="text-2xl font-black text-rose-400">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-rose-400" /> Repasse academia, transporte
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Lucro Líquido Real</span>
          <div className="text-2xl font-black text-white">
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">
            Margem Líquida: {((netProfit / (totalIncomes || 1)) * 100).toFixed(0)}%
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block font-bold">Valores a Receber</span>
          <div className="text-2xl font-black text-amber-400">
            R$ {pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-red-400">
            Atrasados: R$ {overdueIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Extrato de Recebimentos & Despesas ({filteredTransactions.length})
          </h3>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-black border border-zinc-800 px-2.5 py-1 text-zinc-300 outline-none"
            >
              <option value="ALL">TODAS OPERAÇÕES</option>
              <option value="INCOME">RECEITAS</option>
              <option value="EXPENSE">DESPESAS</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-black border border-zinc-800 px-2.5 py-1 text-zinc-300 outline-none"
            >
              <option value="ALL">TODOS STATUS</option>
              <option value="PAID">PAGO / LIQUIDADO</option>
              <option value="PENDING">PENDENTE</option>
              <option value="OVERDUE">ATRASADO</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black text-zinc-500 border-b border-zinc-900 text-[10px] uppercase">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Descrição & Categoria</th>
                <th className="p-3">Aluno / Credor</th>
                <th className="p-3">Método</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-900/40">
                  <td className="p-3 text-zinc-400">{tx.dueDate}</td>
                  <td className="p-3">
                    <div className="text-white font-bold">{tx.description}</div>
                    <span className="text-[9px] text-zinc-500 uppercase">{tx.category}</span>
                  </td>
                  <td className="p-3 text-zinc-300 uppercase">{tx.studentName || 'Custos Gerais'}</td>
                  <td className="p-3 text-zinc-400 font-bold">{tx.paymentMethod || 'PIX'}</td>
                  <td className="p-3">
                    <span
                      className={`text-[8px] px-2 py-0.5 font-bold uppercase border ${
                        tx.status === 'PAID'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : tx.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-red-950 text-red-400 border-red-800'
                      }`}
                    >
                      {tx.status === 'PAID' ? 'PAGO' : tx.status === 'PENDING' ? 'PENDENTE' : 'ATRASADO'}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-black ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase">Novo Lançamento Financeiro</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Tipo de Operação</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  >
                    <option value="INCOME">RECEITA (+)</option>
                    <option value="EXPENSE">DESPESA (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  >
                    <option value="MENSALIDADE">MENSALIDADE DE PERSONAL</option>
                    <option value="AULA_AVULSA">AULA AVULSA / DIÁRIA</option>
                    <option value="PACOTE_AULAS">PACOTE DE SESSÕES</option>
                    <option value="CONSULTORIA_ONLINE">CONSULTORIA ONLINE</option>
                    <option value="AVALIACAO">AVALIAÇÃO FÍSICA</option>
                    <option value="ACADEMIA">REPASSE / TAXA ACADEMIA</option>
                    <option value="EQUIPAMENTOS">EQUIPAMENTOS DE TREINO</option>
                    <option value="TRANSPORTE">TRANSPORTE / COMBUSTÍVEL</option>
                    <option value="SISTEMAS">SISTEMAS & SOFTWARES</option>
                    <option value="MARKETING">MARKETING</option>
                    <option value="IMPOSTOS">IMPOSTOS & CONTABILIDADE</option>
                    <option value="OUTROS">OUTROS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mensalidade Personal 3x/sem Alex Vance"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  >
                    <option value="PAID">RECEBIDO / PAGO</option>
                    <option value="PENDING">PENDENTE</option>
                    <option value="OVERDUE">ATRASADO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase text-[10px] mb-1 font-bold">Método</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-black border border-zinc-700 text-white outline-none"
                  >
                    <option value="PIX">PIX</option>
                    <option value="CREDIT_CARD">CARTÃO DE CRÉDITO</option>
                    <option value="DEBIT_CARD">CARTÃO DE DÉBITO</option>
                    <option value="TRANSFER">TRANSFERÊNCIA BANCÁRIA</option>
                    <option value="CASH">DINHEIRO</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white uppercase font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-black uppercase hover:bg-zinc-200"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
