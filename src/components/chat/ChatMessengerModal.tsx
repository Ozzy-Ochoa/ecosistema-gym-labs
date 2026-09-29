import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { ChatMessage } from '../../types/ecosystem';
import {
  MessageSquare,
  Send,
  X,
  User,
  CheckCheck,
  Paperclip,
  Sparkles,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface ChatMessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultContactId?: string;
  defaultContactName?: string;
  defaultContactRole?: 'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM';
}

export const ChatMessengerModal: React.FC<ChatMessengerModalProps> = ({
  isOpen,
  onClose,
  defaultContactId,
  defaultContactName,
  defaultContactRole = 'COACH',
}) => {
  const {
    identity,
    chatMessages,
    sendChatMessage,
    nutriPatients,
    trainerStudents,
  } = useGymLabs();

  const [activeContactId, setActiveContactId] = useState<string>(
    defaultContactId || (identity.role === 'NUTRITIONIST' ? 'pat_alex_vance' : identity.role === 'COACH' ? 'std_alex_vance' : 'pro_coach_marcus')
  );
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  // Contacts list depending on current user role
  const contacts = (() => {
    if (identity.role === 'NUTRITIONIST') {
      return [
        { id: 'pat_alex_vance', name: 'Alex Vance', role: 'PACIENTE', detail: 'Hipertrofia // 82.5 kg' },
        { id: 'pro_coach_marcus', name: 'Marcus Steel (Personal)', role: 'COACH PARCEIRO', detail: 'Interprofissional // CREF 091823-G/SP' },
        { id: 'pat_beatriz_lima', name: 'Beatriz Lima', role: 'PACIENTE', detail: 'Emagrecimento // 64 kg' },
        { id: 'pat_carlos_mendes', name: 'Carlos Mendes', role: 'PACIENTE', detail: 'Performance // 88 kg' },
      ];
    } else if (identity.role === 'COACH') {
      return [
        { id: 'std_alex_vance', name: 'Alex Vance', role: 'ALUNO', detail: 'Treino A/B/C // Força & Hipertrofia' },
        { id: 'pro_nutri_elena', name: 'Dra. Elena Vance (Nutri)', role: 'NUTRI PARCEIRA', detail: 'Interprofissional // CRN-3 48192' },
        { id: 'std_beatriz_lima', name: 'Beatriz Lima', role: 'ALUNA', detail: 'Condicionamento Geral' },
        { id: 'std_carlos_mendes', name: 'Carlos Mendes', role: 'ALUNO', detail: 'Powerlifting // Cargas Pesadas' },
      ];
    } else {
      // Athlete (Convencional)
      return [
        { id: 'pro_coach_marcus', name: 'Marcus Steel', role: 'PERSONAL TRAINER', detail: 'CREF 091823-G/SP // Treinador Oficial' },
        { id: 'pro_nutri_elena', name: 'Dra. Elena Vance', role: 'NUTRICIONISTA ESPORTIVA', detail: 'CRN-3 48192 // Nutricionista Clínica' },
      ];
    }
  })();

  const currentContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  // Filter messages between active user and current contact
  const conversationMessages = chatMessages.filter(
    (m) =>
      (m.senderId === identity.id && (m.receiverId === activeContactId || m.receiverId.includes(activeContactId) || activeContactId.includes(m.receiverId))) ||
      (m.receiverId === identity.id && (m.senderId === activeContactId || m.senderId.includes(activeContactId) || activeContactId.includes(m.senderId))) ||
      m.conversationId === `conv_${activeContactId}` ||
      m.conversationId === `conv_inter_${activeContactId}`
  );

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage({
      conversationId: `conv_${activeContactId}`,
      senderId: identity.id,
      senderName: identity.name || 'Usuário Gym Labs',
      senderRole: identity.role as any,
      receiverId: activeContactId,
      receiverName: currentContact?.name || 'Contato',
      text: inputText.trim(),
      read: true,
    });

    setInputText('');
  };

  const quickTemplates = identity.role === 'NUTRITIONIST'
    ? [
        'Olá! Como está a adesão às porções do plano alimentar desta semana?',
        'Ajustei o carboidrato pós-treino para acompanhar a progressão de cargas.',
        'Lembre-se de manter a hidratação calculada de 3.500 ml ao dia!',
      ]
    : identity.role === 'COACH'
    ? [
        'Excelente execução hoje! Vamos progredir 2kg no supino na próxima semana.',
        'Como sentiu a recuperação da lombar pós agachamento?',
        'Enviei seu treino atualizado na aba Treino do aplicativo Gym Labs.',
      ]
    : [
        'Olá, terminei meu treino de hoje! Segui as cargas sugeridas.',
        'Doutora, posso fazer uma substituição no pré-treino hoje?',
        'Enviei meus exames mais recentes para visualização no prontuário.',
      ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-mono">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl h-[90vh] max-h-[750px] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
              <MessageSquare className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  CANAL SEGURO GYM LABS // CHAT NATIVO
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> CRIPTOGRAFIA E2E
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">
                COMUNICAÇÃO NATIVA ATLETA ↔ PROFISSIONAL & INTERPROFISSIONAL
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Contacts Sidebar */}
          <div className="w-64 sm:w-72 border-r border-zinc-800 bg-zinc-950/50 flex flex-col">
            <div className="p-3 border-b border-zinc-800/80 text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              Canais & Conversas
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
              {contacts.map((contact) => {
                const isActive = contact.id === activeContactId;
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setActiveContactId(contact.id)}
                    className={`w-full text-left p-3 transition-colors cursor-pointer ${
                      isActive ? 'bg-zinc-900 border-l-2 border-white' : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white uppercase truncate">
                        {contact.name}
                      </span>
                      <span className="text-[8px] px-1 bg-zinc-800 text-zinc-300 font-mono">
                        {contact.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">{contact.detail}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-black">
            {/* Contact Active Bar */}
            <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold">
                  {currentContact?.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase">{currentContact?.name}</div>
                  <div className="text-[9px] text-zinc-400 font-mono">
                    {currentContact?.role} • {currentContact?.detail}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                CONECTADO
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {conversationMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                  <MessageSquare className="w-8 h-8 mb-2 text-zinc-600" />
                  <p className="text-xs uppercase font-bold text-zinc-400">Canal de Conversa Iniciado</p>
                  <p className="text-[10px] text-zinc-500 max-w-xs mt-1">
                    Envie dúvidas sobre o plano alimentar, execução de treinos ou alinhamento interprofissional.
                  </p>
                </div>
              ) : (
                conversationMessages.map((msg) => {
                  const isMine = msg.senderId === identity.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[9px] text-zinc-500">
                        <span className="font-bold uppercase text-zinc-400">{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] p-3 text-xs leading-relaxed ${
                          isMine
                            ? 'bg-zinc-900 border border-zinc-700 text-white'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-200'
                        }`}
                      >
                        {msg.text}
                        {msg.attachmentName && (
                          <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-2 text-[10px] text-zinc-400 font-bold">
                            <Paperclip className="w-3 h-3" />
                            <span>{msg.attachmentName}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[8px] text-zinc-600">
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                        <span>ENTREGUE VIA GYM LABS CLOUD</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Templates */}
            <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 flex gap-2 overflow-x-auto text-[10px]">
              <span className="text-zinc-500 font-bold uppercase shrink-0 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> RESPOSTAS RÁPIDAS:
              </span>
              {quickTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(tmpl)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white shrink-0 text-left transition-colors cursor-pointer"
                >
                  {tmpl.length > 40 ? tmpl.substring(0, 40) + '...' : tmpl}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-black border-t border-zinc-800 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Mensagem para ${currentContact?.name}...`}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 px-3 py-2 text-xs font-mono outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-white text-black font-black text-xs uppercase hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ENVIAR</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
