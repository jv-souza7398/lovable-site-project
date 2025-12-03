import React, { useState } from 'react';
import { FaMapMarkerAlt, FaRoad, FaCity, FaBuilding, FaCalendar, FaClock } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import classes from './EventDetailsModal.module.css';

const EventDetailsModal = ({ open, onClose, onConfirm, loading }) => {
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
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
    
    if (!cep || !rua || !uf || !bairro || !cidade || !dataEvento || !horaInicio || !horaEncerramento) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    onConfirm({
      cep,
      rua,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={classes.modalContent}>
        <DialogHeader>
          <DialogTitle className={classes.modalTitle}>Dados do Evento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={classes.form}>
          {error && <p className={classes.error}>{error}</p>}

          {/* Endereço */}
          <div className={classes.inputGroup}>
            <FaMapMarkerAlt className={classes.icon} />
            <input
              type="text"
              placeholder="CEP"
              value={formatCep(cep)}
              onChange={handleCepChange}
              maxLength={9}
              disabled={loading || loadingCep}
            />
            {loadingCep && <span className={classes.loadingText}>Buscando...</span>}
          </div>

          <div className={classes.inputGroup}>
            <FaRoad className={classes.icon} />
            <input
              type="text"
              placeholder="Rua"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={classes.row}>
            <div className={classes.inputGroup}>
              <FaBuilding className={classes.icon} />
              <input
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={classes.inputGroupSmall}>
              <input
                type="text"
                placeholder="UF"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                maxLength={2}
                disabled={loading}
              />
            </div>
          </div>

          <div className={classes.inputGroup}>
            <FaCity className={classes.icon} />
            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Divisória */}
          <div className={classes.divider}>
            <span>Detalhes do evento</span>
          </div>

          <div className={classes.inputGroup}>
            <FaCalendar className={classes.icon} />
            <input
              type="date"
              placeholder="Data do evento"
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={classes.row}>
            <div className={classes.inputGroup}>
              <FaClock className={classes.icon} />
              <input
                type="time"
                placeholder="Hora início"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={classes.inputGroup}>
              <FaClock className={classes.icon} />
              <input
                type="time"
                placeholder="Hora encerramento"
                value={horaEncerramento}
                onChange={(e) => setHoraEncerramento(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className={classes.submitButton} disabled={loading}>
            {loading ? 'Enviando...' : 'Confirmar'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;
