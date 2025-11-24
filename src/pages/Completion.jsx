import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import classes from './Completion.module.css';
import { FaCheckCircle, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
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
    // Redireciona para WhatsApp ou página de contato
    window.open('https://wa.me/5511999999999', '_blank');
  };

  return (
    <div className={classes.container}>
      <div className={classes.logoContainer}>
        <img src={vincci} alt="Vincci Pub" className={classes.logo} />
      </div>
      
      <div className={classes.content}>
        <div className={classes.successCard}>
          <div className={classes.successIcon}>
            <FaCheckCircle />
          </div>
          
          <h1>Pagamento Concluído!</h1>
          <p className={classes.subtitle}>
            Obrigado pela sua compra! Seu pagamento foi processado com sucesso.
          </p>

          {orderData?.pixId && (
            <div className={classes.orderInfo}>
              <div className={classes.infoItem}>
                <span className={classes.label}>Valor:</span>
                <span className={classes.value}>{orderData.amount}</span>
              </div>
              <div className={classes.infoItem}>
                <span className={classes.label}>ID do Pagamento:</span>
                <span className={classes.value}>{orderData.pixId}</span>
              </div>
            </div>
          )}

          <div className={classes.nextSteps}>
            <h3>Próximos Passos</h3>
            <ol>
              <li>
                <FaEnvelope className={classes.stepIcon} />
                <span>Você receberá um e-mail de confirmação com todos os detalhes</span>
              </li>
              <li>
                <FaWhatsapp className={classes.stepIcon} />
                <span>Nossa equipe entrará em contato para confirmar os detalhes do evento</span>
              </li>
              <li>
                <FaCheckCircle className={classes.stepIcon} />
                <span>No dia do evento, nossos bartenders chegarão no horário combinado</span>
              </li>
            </ol>
          </div>

          <div className={classes.actions}>
            <button onClick={handleBackToHome} className={classes.primaryButton}>
              Voltar para Home
            </button>
            <button onClick={handleContactSupport} className={classes.secondaryButton}>
              <FaWhatsapp />
              Falar com Suporte
            </button>
          </div>

          <div className={classes.thankYou}>
            <p>Agradecemos pela confiança! Estamos ansiosos para tornar seu evento inesquecível! 🎉</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion;
