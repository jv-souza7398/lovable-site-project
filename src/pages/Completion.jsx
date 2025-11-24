import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import classes from './Completion.module.css';
import { FaCheckCircle, FaWhatsapp, FaEnvelope, FaCalendarCheck, FaGlassCheers } from 'react-icons/fa';
import vincci from '../assets/Vincci.jpg';

const Completion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Prioriza dados do state (navegação interna)
    if (location.state) {
      setOrderData({
        pixId: location.state.pixId,
        amount: location.state.amount,
        status: location.state.status || 'completed',
        customerName: location.state.customerName,
        customerEmail: location.state.customerEmail,
      });
    } else {
      // Fallback para parâmetros da URL (navegação externa)
      const billingId = searchParams.get('billingId');
      const status = searchParams.get('status');
      const amount = searchParams.get('amount');
      
      if (billingId) {
        setOrderData({
          pixId: billingId,
          status: status || 'completed',
          amount: amount || null,
        });
      }
    }
  }, [searchParams, location.state]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/5511999999999', '_blank');
  };

  return (
    <div className={classes.container}>
      <div className={classes.backgroundOverlay}></div>
      
      <div className={classes.logoContainer}>
        <img src={vincci} alt="Vincci Pub" className={classes.logo} />
        <div className={classes.logoText}>VINCCI PUB</div>
      </div>
      
      <div className={classes.content}>
        {/* Ícone de sucesso grande no topo */}
        <div className={classes.successIconContainer}>
          <div className={classes.successIconCircle}>
            <FaCheckCircle className={classes.successIcon} />
          </div>
        </div>

        {/* Card principal */}
        <div className={classes.mainCard}>
          <h1 className={classes.mainTitle}>Pagamento Concluído!</h1>
          <p className={classes.subtitle}>
            Seu evento está confirmado! Prepare-se para uma experiência inesquecível.
          </p>
        </div>

        {/* Card de informações do pedido */}
        {orderData?.pixId && (
          <div className={classes.orderCard}>
            <div className={classes.orderHeader}>
              <FaGlassCheers className={classes.orderIcon} />
              <h3>Detalhes do Pagamento</h3>
            </div>
            <div className={classes.orderDetails}>
              <div className={classes.detailRow}>
                <span className={classes.detailLabel}>Valor pago</span>
                <span className={classes.detailValue}>{orderData.amount}</span>
              </div>
              <div className={classes.detailRow}>
                <span className={classes.detailLabel}>ID do Pagamento</span>
                <span className={classes.detailValueCode}>{orderData.pixId}</span>
              </div>
            </div>
          </div>
        )}

        {/* Card de próximos passos */}
        <div className={classes.stepsCard}>
          <h3 className={classes.stepsTitle}>Próximos Passos</h3>
          <div className={classes.stepsList}>
            <div className={classes.stepItem}>
              <div className={classes.stepNumber}>1</div>
              <div className={classes.stepContent}>
                <FaEnvelope className={classes.stepIconMain} />
                <div className={classes.stepText}>
                  <h4>Confirmação por E-mail</h4>
                  <p>Você receberá todos os detalhes do pedido em sua caixa de entrada</p>
                </div>
              </div>
            </div>
            
            <div className={classes.stepItem}>
              <div className={classes.stepNumber}>2</div>
              <div className={classes.stepContent}>
                <FaWhatsapp className={classes.stepIconMain} />
                <div className={classes.stepText}>
                  <h4>Contato da Equipe</h4>
                  <p>Entraremos em contato para alinhar todos os detalhes do evento</p>
                </div>
              </div>
            </div>
            
            <div className={classes.stepItem}>
              <div className={classes.stepNumber}>3</div>
              <div className={classes.stepContent}>
                <FaCalendarCheck className={classes.stepIconMain} />
                <div className={classes.stepText}>
                  <h4>Dia do Evento</h4>
                  <p>Nossos bartenders estarão prontos no horário combinado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className={classes.actions}>
          <button onClick={handleBackToHome} className={classes.homeButton}>
            Voltar para Home
          </button>
          <button onClick={handleContactSupport} className={classes.supportButton}>
            <FaWhatsapp />
            Falar com Suporte
          </button>
        </div>

        {/* Mensagem final */}
        <div className={classes.finalMessage}>
          <p>
            <span className={classes.celebration}>🎉</span>
            Agradecemos pela confiança! Estamos ansiosos para tornar seu evento inesquecível!
            <span className={classes.celebration}>🍹</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Completion;
