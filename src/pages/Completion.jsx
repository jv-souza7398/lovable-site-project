import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import classes from './Completion.module.css';
import { FaCheckCircle, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Completion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Captura os parâmetros da URL que o AbacatePay envia
    const billingId = searchParams.get('billingId');
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');
    
    if (billingId) {
      setOrderData({
        billingId,
        status: status || 'completed',
        amount: amount || null,
      });
    }
  }, [searchParams]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // Redireciona para WhatsApp ou página de contato
    window.open('https://wa.me/5511999999999', '_blank');
  };

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.successCard}>
          <div className={classes.successIcon}>
            <FaCheckCircle />
          </div>
          
          <h1>Pagamento Concluído!</h1>
          <p className={classes.subtitle}>
            Obrigado pela sua compra! Seu pagamento foi processado com sucesso.
          </p>

          {orderData?.billingId && (
            <div className={classes.orderInfo}>
              <h3>Detalhes do Pedido</h3>
              <div className={classes.infoItem}>
                <span className={classes.label}>ID do Pedido:</span>
                <span className={classes.value}>{orderData.billingId}</span>
              </div>
              {orderData.amount && (
                <div className={classes.infoItem}>
                  <span className={classes.label}>Valor Pago:</span>
                  <span className={classes.value}>
                    R$ {(parseInt(orderData.amount) / 100).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
              <div className={classes.infoItem}>
                <span className={classes.label}>Status:</span>
                <span className={classes.statusBadge}>Confirmado</span>
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
