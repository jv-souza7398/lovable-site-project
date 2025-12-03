import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaRoad,
  FaCity,
  FaBuilding,
  FaCalendar,
  FaClock,
  FaHashtag,
  FaHome,
  FaTimes,
  FaWhatsapp,
  FaTruck,
} from "react-icons/fa";

const EventDetailsModal = ({ open, onClose, onConfirm, loading }) => {
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [uf, setUf] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaEncerramento, setHoraEncerramento] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [error, setError] = useState("");
  const [showFreightPopup, setShowFreightPopup] = useState(false);
  const [eventData, setEventData] = useState(null);

  console.log("EventDetailsModal render, open:", open);

  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCep(value);

    if (value.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();

        if (data.erro) {
          setError("CEP não encontrado");
          return;
        }

        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setUf(data.uf || "");
        setError("");
      } catch (err) {
        setError("Erro ao buscar CEP");
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cep || !rua || !numero || !uf || !bairro || !cidade || !dataEvento || !horaInicio || !horaEncerramento) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Store the event data and show freight popup
    setEventData({
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
    setShowFreightPopup(true);
  };

  const handleFreightConfirm = () => {
    if (eventData) {
      onConfirm(eventData);
    }
    setShowFreightPopup(false);
  };

  const handleFreightCancel = () => {
    setShowFreightPopup(false);
  };

  const formatCep = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  if (!open) {
    console.log("Modal não está aberto, retornando null");
    return null;
  }

  console.log("Modal está aberto, renderizando...");

  const inputStyles = {
    width: "100%",
    padding: "12px 12px 12px 44px",
    backgroundColor: "rgba(35, 34, 34, 0.95)",
    border: "2px solid rgba(146, 117, 60, 0.5)",
    borderRadius: "8px",
    color: "rgb(220, 220, 220)",
    fontSize: "16px",
    outline: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
  };

  const inputSmallStyles = {
    ...inputStyles,
    paddingLeft: "12px",
    textAlign: "center",
    textTransform: "uppercase",
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "rgba(30, 29, 29, 0.98)",
          border: "1px solid rgba(146, 117, 60, 0.3)",
          borderRadius: "16px",
          maxWidth: "500px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "rgb(177, 169, 169)",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          <FaTimes />
        </button>

        {/* Header */}
        <h2
          style={{
            color: "rgb(146, 117, 60)",
            fontSize: "24px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Dados do Evento
        </h2>
        <p
          style={{
            color: "rgb(177, 169, 169)",
            textAlign: "center",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          Preencha os dados do local e data do evento
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <p
              style={{
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {/* CEP */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <FaMapMarkerAlt
              style={{ position: "absolute", left: "12px", color: "rgb(146, 117, 60)", fontSize: "16px" }}
            />
            <input
              type="text"
              placeholder="CEP"
              value={formatCep(cep)}
              onChange={handleCepChange}
              maxLength={9}
              disabled={loading || loadingCep}
              style={inputStyles}
            />
            {loadingCep && (
              <span style={{ position: "absolute", right: "12px", color: "rgb(146, 117, 60)", fontSize: "12px" }}>
                Buscando...
              </span>
            )}
          </div>

          {/* Rua */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <FaRoad style={{ position: "absolute", left: "12px", color: "rgb(146, 117, 60)", fontSize: "16px" }} />
            <input
              type="text"
              placeholder="Rua"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              disabled={loading}
              style={inputStyles}
            />
          </div>

          {/* Número e Complemento */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", width: isMobile ? "45%" : "100px", minWidth: "80px" }}>
              <FaHashtag style={{ position: "absolute", left: "12px", color: "rgb(146, 117, 60)", fontSize: "14px" }} />
              <input
                type="text"
                placeholder="Nº"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                disabled={loading}
                style={{ ...inputStyles, paddingLeft: "36px", textAlign: "center" }}
              />
            </div>

            <div style={{ position: "relative", display: "flex", alignItems: "center", flex: 1, minWidth: isMobile ? "100%" : "auto" }}>
              <FaHome style={{ position: "absolute", left: "12px", color: "rgb(146, 117, 60)", fontSize: "16px" }} />
              <input
                type="text"
                placeholder="Complemento (opcional)"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                disabled={loading}
                style={inputStyles}
              />
            </div>
          </div>

          {/* Bairro e UF */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", flex: 1, minWidth: isMobile ? "100%" : "auto" }}>
              <FaBuilding
                style={{ position: "absolute", left: "12px", color: "rgb(146, 117, 60)", fontSize: "16px" }}
              />
              <input
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                disabled={loading}
                style={inputStyles}
              />
            </div>

            <div style={{ width: isMobile ? "100%" : "80px" }}>
              <input
                type="text"
                placeholder="UF"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                maxLength={2}
                disabled={loading}
                style={inputSmallStyles}
              />
            </div>
          </div>

          {/* Cidade */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <FaCity style={{ position: "absolute", left: "12px", color: "rgb(146, 117, 60)", fontSize: "16px" }} />
            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              disabled={loading}
              style={inputStyles}
            />
          </div>

          {/* Divisória */}
          <div style={{ display: "flex", alignItems: "center", margin: "16px 0", gap: "16px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(146, 117, 60, 0.4)" }} />
            <span style={{ color: "rgb(146, 117, 60)", fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap" }}>
              Detalhes do evento
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(146, 117, 60, 0.4)" }} />
          </div>

          {/* Data do evento */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ color: "rgb(146, 117, 60)", fontSize: "12px", marginBottom: "4px" }}>Data do evento</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <FaCalendar style={{ position: "absolute", left: "12px", color: "rgb(146, 117, 60)", fontSize: "16px", zIndex: 1 }} />
              <input
                type="date"
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                disabled={loading}
                style={{ ...inputStyles, colorScheme: "dark" }}
              />
            </div>
          </div>

          {/* Horários */}
          <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", flex: 1, flexDirection: "column" }}>
              <label style={{ color: "rgb(146, 117, 60)", fontSize: "12px", marginBottom: "4px", alignSelf: "flex-start" }}>Hora início</label>
              <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                <FaClock style={{ position: "absolute", left: "12px", color: "rgb(146, 117, 60)", fontSize: "16px", zIndex: 1 }} />
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  disabled={loading}
                  style={{ ...inputStyles, colorScheme: "dark" }}
                />
              </div>
            </div>

            <div style={{ position: "relative", display: "flex", alignItems: "center", flex: 1, flexDirection: "column" }}>
              <label style={{ color: "rgb(146, 117, 60)", fontSize: "12px", marginBottom: "4px", alignSelf: "flex-start" }}>Hora encerramento</label>
              <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                <FaClock style={{ position: "absolute", left: "12px", color: "rgb(146, 117, 60)", fontSize: "16px", zIndex: 1 }} />
                <input
                  type="time"
                  value={horaEncerramento}
                  onChange={(e) => setHoraEncerramento(e.target.value)}
                  disabled={loading}
                  style={{ ...inputStyles, colorScheme: "dark" }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "8px",
              backgroundColor: "rgb(146, 117, 60)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Enviando..." : "Confirmar"}
          </button>
        </form>
      </div>

      {/* Freight Confirmation Popup */}
      {showFreightPopup && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              backgroundColor: "rgba(30, 29, 29, 0.98)",
              border: "2px solid rgba(146, 117, 60, 0.5)",
              borderRadius: "16px",
              maxWidth: "400px",
              width: "90%",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 16px",
                backgroundColor: "rgba(146, 117, 60, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaTruck style={{ fontSize: "28px", color: "rgb(146, 117, 60)" }} />
            </div>

            <h3
              style={{
                color: "rgb(146, 117, 60)",
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Informação sobre Frete
            </h3>

            <p
              style={{
                color: "rgb(177, 169, 169)",
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "8px",
              }}
            >
              O valor do frete será acordado via WhatsApp com nosso time de atendimento.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "#25D366",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              <FaWhatsapp style={{ fontSize: "18px" }} />
              <span>Seguiremos com seu atendimento via WhatsApp!</span>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleFreightCancel}
                style={{
                  flex: 1,
                  padding: "14px",
                  backgroundColor: "transparent",
                  border: "2px solid rgba(146, 117, 60, 0.5)",
                  borderRadius: "8px",
                  color: "rgb(177, 169, 169)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Voltar
              </button>
              <button
                onClick={handleFreightConfirm}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px",
                  backgroundColor: "rgb(146, 117, 60)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsModal;
