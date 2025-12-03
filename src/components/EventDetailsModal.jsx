import React, { useState } from 'react';
import { FaMapMarkerAlt, FaRoad, FaCity, FaBuilding, FaCalendar, FaClock, FaHashtag, FaHome } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const EventDetailsModal = ({ open, onClose, onConfirm, loading }) => {
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [uf, setUf] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaEncerramento, setHoraEncerramento] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [error, setError] = useState('');

  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCep(value);

    if (value.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setError('CEP não encontrado');
          return;
        }

        setRua(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setUf(data.uf || '');
        setError('');
      } catch (err) {
        setError('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!cep || !rua || !numero || !uf || !bairro || !cidade || !dataEvento || !horaInicio || !horaEncerramento) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onConfirm({
      cep,
      rua,
      numero,
      complemento,
      uf,
      bairro,
      cidade,
      dataEvento,
      horaInicio,
      horaEncerramento,
    });
  };

  const formatCep = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  const inputStyles = "w-full py-3 px-3 pl-11 bg-[rgba(35,34,34,0.8)] border-2 border-[rgba(146,117,60,0.3)] rounded-lg text-[rgb(177,169,169)] text-sm transition-all focus:outline-none focus:border-[rgb(146,117,60)] focus:bg-[rgba(35,34,34,1)] placeholder:text-[rgba(177,169,169,0.6)] disabled:opacity-70 disabled:cursor-not-allowed";
  
  const inputSmallStyles = "w-full py-3 px-3 bg-[rgba(35,34,34,0.8)] border-2 border-[rgba(146,117,60,0.3)] rounded-lg text-[rgb(177,169,169)] text-sm text-center uppercase transition-all focus:outline-none focus:border-[rgb(146,117,60)] focus:bg-[rgba(35,34,34,1)] disabled:opacity-70 disabled:cursor-not-allowed";

  const iconStyles = "absolute left-3 text-[rgb(146,117,60)] text-base z-10";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-[rgba(30,29,29,0.98)] border border-[rgba(146,117,60,0.3)] rounded-2xl max-w-[500px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[rgb(146,117,60)] text-2xl font-bold text-center mb-2">
            Dados do Evento
          </DialogTitle>
          <DialogDescription className="text-center text-[rgb(177,169,169)] text-sm">
            Preencha os dados do local e data do evento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {error && (
            <p className="text-red-500 bg-red-500/10 p-3 rounded-lg text-sm text-center">
              {error}
            </p>
          )}

          {/* CEP */}
          <div className="relative flex items-center">
            <FaMapMarkerAlt className={iconStyles} />
            <input
              type="text"
              placeholder="CEP"
              value={formatCep(cep)}
              onChange={handleCepChange}
              maxLength={9}
              disabled={loading || loadingCep}
              className={inputStyles}
            />
            {loadingCep && (
              <span className="absolute right-3 text-[rgb(146,117,60)] text-xs">
                Buscando...
              </span>
            )}
          </div>

          {/* Rua */}
          <div className="relative flex items-center">
            <FaRoad className={iconStyles} />
            <input
              type="text"
              placeholder="Rua"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              disabled={loading}
              className={inputStyles}
            />
          </div>

          {/* Número e Complemento */}
          <div className="flex gap-4">
            <div className="relative flex items-center w-24 min-w-[80px]">
              <FaHashtag className="absolute left-3 text-[rgb(146,117,60)] text-sm z-10" />
              <input
                type="text"
                placeholder="Nº"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                disabled={loading}
                className="w-full py-3 px-3 pl-9 bg-[rgba(35,34,34,0.8)] border-2 border-[rgba(146,117,60,0.3)] rounded-lg text-[rgb(177,169,169)] text-sm text-center transition-all focus:outline-none focus:border-[rgb(146,117,60)] focus:bg-[rgba(35,34,34,1)] disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            <div className="relative flex items-center flex-1">
              <FaHome className={iconStyles} />
              <input
                type="text"
                placeholder="Complemento (opcional)"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                disabled={loading}
                className={inputStyles}
              />
            </div>
          </div>

          {/* Bairro e UF */}
          <div className="flex gap-4">
            <div className="relative flex items-center flex-1">
              <FaBuilding className={iconStyles} />
              <input
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                disabled={loading}
                className={inputStyles}
              />
            </div>

            <div className="w-20 min-w-[70px]">
              <input
                type="text"
                placeholder="UF"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                maxLength={2}
                disabled={loading}
                className={inputSmallStyles}
              />
            </div>
          </div>

          {/* Cidade */}
          <div className="relative flex items-center">
            <FaCity className={iconStyles} />
            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              disabled={loading}
              className={inputStyles}
            />
          </div>

          {/* Divisória */}
          <div className="flex items-center my-4 gap-4">
            <div className="flex-1 h-px bg-[rgba(146,117,60,0.4)]" />
            <span className="text-[rgb(146,117,60)] text-sm font-semibold whitespace-nowrap">
              Detalhes do evento
            </span>
            <div className="flex-1 h-px bg-[rgba(146,117,60,0.4)]" />
          </div>

          {/* Data do evento */}
          <div className="relative flex items-center">
            <FaCalendar className={iconStyles} />
            <input
              type="date"
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
              disabled={loading}
              className={inputStyles}
            />
          </div>

          {/* Horários */}
          <div className="flex gap-4">
            <div className="relative flex items-center flex-1">
              <FaClock className={iconStyles} />
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                disabled={loading}
                className={inputStyles}
              />
            </div>

            <div className="relative flex items-center flex-1">
              <FaClock className={iconStyles} />
              <input
                type="time"
                value={horaEncerramento}
                onChange={(e) => setHoraEncerramento(e.target.value)}
                disabled={loading}
                className={inputStyles}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-[rgb(146,117,60)] text-white border-none rounded-lg text-base font-bold cursor-pointer transition-all hover:bg-[rgb(166,137,80)] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Enviando...' : 'Confirmar'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;
