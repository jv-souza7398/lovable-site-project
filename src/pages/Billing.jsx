import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import classes from './Billing.module.css';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const Billing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingData, setBillingData] = useState(null);

  useEffect(() => {
    // Captura os parâmetros da URL que o AbacatePay pode enviar
    const billingId = searchParams.get('billingId');
    const status = searchParams.get('status');
    
    if (billingId) {
      setBillingData({
        billingId,
        status: status || 'pending',
      });
    }
  }, [searchParams]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const getStatusInfo = () => {
    if (!billingData) {
      return {
        icon: <FaClock />,
        color: '#f59e0b',
        title: 'Processando',
        message: 'Aguardando informações do pagamento...',
      };
    }

    switch (billingData.status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return {
          icon: <FaCheckCircle />,
          color: '#10b981',
          title: 'Pagamento Confirmado!',
          message: 'Seu pagamento foi processado com sucesso.',
        };
      case 'pending':
        return {
          icon: <FaClock />,
          color: '#f59e0b',
          title: 'Aguardando Pagamento',
          message: 'Estamos aguardando a confirmação do seu pagamento PIX.',
        };
      case 'cancelled':
      case 'expired':
        return {
          icon: <FaTimesCircle />,
          color: '#ef4444',
          title: 'Pagamento Cancelado',
          message: 'O pagamento foi cancelado ou expirou.',
        };
      default:
        return {
          icon: <FaClock />,
          color: '#f59e0b',
          title: 'Processando',
          message: 'Estamos processando seu pagamento.',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>Status do Pagamento</h1>
      </header>

      <div className={classes.content}>
        <div className={classes.statusCard} style={{ borderColor: statusInfo.color }}>
          <div className={classes.icon} style={{ color: statusInfo.color }}>
            {statusInfo.icon}
          </div>
          
          <h2 style={{ color: statusInfo.color }}>{statusInfo.title}</h2>
          <p>{statusInfo.message}</p>

          {billingData?.billingId && (
            <div className={classes.billingInfo}>
              <p className={classes.billingId}>
                <strong>ID do Pedido:</strong> {billingData.billingId}
              </p>
            </div>
          )}

          <div className={classes.actions}>
            {billingData?.status?.toLowerCase() === 'paid' || 
             billingData?.status?.toLowerCase() === 'completed' ? (
              <>
                <p className={classes.successMessage}>
                  Você receberá um e-mail com todos os detalhes do seu pedido em breve.
                </p>
                <button onClick={handleBackToHome} className={classes.primaryButton}>
                  Voltar para Home
                </button>
              </>
            ) : billingData?.status?.toLowerCase() === 'pending' ? (
              <>
                <p className={classes.warningMessage}>
                  Complete o pagamento PIX para confirmar seu pedido. 
                  A confirmação pode levar alguns minutos.
                </p>
                <button onClick={handleBackToHome} className={classes.secondaryButton}>
                  Voltar para Home
                </button>
              </>
            ) : (
              <>
                <p className={classes.errorMessage}>
                  Se você tiver alguma dúvida, entre em contato com nosso suporte.
                </p>
                <button onClick={handleBackToHome} className={classes.secondaryButton}>
                  Voltar para Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
