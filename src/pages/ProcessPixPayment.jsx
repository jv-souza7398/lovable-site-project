import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import classes from './ProcessPixPayment.module.css';
import { FaQrcode, FaCheckCircle } from 'react-icons/fa';

const ProcessPixPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, totalAmount, customerEmail, customerName, customerPhone, customerTaxId } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [error, setError] = useState(null);
  const [billingId, setBillingId] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    createPixPayment();
  }, []);

  // Polling para verificar status do pagamento automaticamente
  useEffect(() => {
    if (!billingId) return;

    const checkInterval = setInterval(async () => {
      await checkPaymentStatus();
    }, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(checkInterval);
  }, [billingId]);

  const checkPaymentStatus = async () => {
    if (!billingId || checkingPayment) return;

    try {
      setCheckingPayment(true);
      const { data, error: functionError } = await supabase.functions.invoke(
        'check-pix-payment-status',
        {
          body: { billingId },
        }
      );

      if (functionError) {
        console.error('Error checking payment status:', functionError);
        return;
      }

      if (data.status === 'PAID') {
        setPaymentStatus('paid');
        navigate('/Completion', {
          state: {
            billingId,
            amount: totalAmount,
            status: 'paid'
          }
        });
      }
    } catch (err) {
      console.error('Error checking payment:', err);
    } finally {
      setCheckingPayment(false);
    }
  };

  const createPixPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!customerEmail || !customerName || !customerPhone || !customerTaxId) {
        console.error('Dados de identificação incompletos:', {
          customerEmail,
          customerName,
          customerPhone,
          customerTaxId,
        });
        setError('Dados de identificação incompletos. Volte e preencha CPF e telefone.');
        setLoading(false);
        return;
      }

      // Calcula o valor total em centavos
      const totalValue = cartItems.reduce((acc, item) => {
        const valorNumerico = parseFloat(
          item.valorTotalFormatado
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
        );
        return acc + valorNumerico;
      }, 0);

      // Cria descrição do pedido
      const description = cartItems.map(item => item.item.title).join(', ');

      console.log('Creating PIX payment with:', {
        amount: Math.round(totalValue * 100), // Converte para centavos
        description,
        customerEmail,
        customerName,
        customerPhone,
        customerTaxId
      });

      const { data, error: functionError } = await supabase.functions.invoke(
        'create-pix-payment',
        {
          body: {
            amount: Math.round(totalValue * 100), // AbacatePay espera valor em centavos
            description,
            customerEmail,
            customerName,
            customerPhone,
            customerTaxId,
          },
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar pagamento PIX');
      }

      console.log('Payment created:', data);
      setPaymentUrl(data.url);
      setBillingId(data.billingId);
    } catch (err) {
      console.error('Error creating PIX payment:', err);
      setError(err.message || 'Erro ao criar pagamento PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || !customerEmail) {
    return (
      <div className={classes.container}>
        <div className={classes.error}>
          <h1>Erro</h1>
          <p>Informações de pagamento incompletas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>PAGAMENTO VIA PIX</h1>
      </header>

      <div className={classes.content}>
        <div className={classes.paymentSection}>
          {loading ? (
            <div className={classes.loading}>
              <div className={classes.spinner}></div>
              <h2>Gerando pagamento PIX...</h2>
              <p>Aguarde um momento</p>
            </div>
          ) : error ? (
            <div className={classes.errorState}>
              <h2>Erro ao gerar pagamento</h2>
              <p>{error}</p>
              <button onClick={createPixPayment} className={classes.retryButton}>
                Tentar Novamente
              </button>
            </div>
          ) : paymentUrl ? (
            <div className={classes.pixContainer}>
              <h2>Escaneie o QR Code para pagar</h2>
              
              <div className={classes.qrCodeFrame}>
                <iframe 
                  src={paymentUrl} 
                  className={classes.qrCodeIframe}
                  title="QR Code PIX"
                  frameBorder="0"
                />
              </div>

              <button 
                onClick={checkPaymentStatus}
                className={classes.checkPaymentButton}
                disabled={checkingPayment}
              >
                <FaCheckCircle />
                {checkingPayment ? 'Verificando...' : 'Pagamento Realizado'}
              </button>

              <p className={classes.autoCheckInfo}>
                Verificando pagamento automaticamente...
              </p>
            </div>
          ) : null}
        </div>

        <div className={classes.summary}>
          <h3>Resumo do Pedido</h3>
          <div className={classes.summaryItems}>
            {cartItems.map((item, index) => (
              <div key={index} className={classes.summaryItem}>
                <p>{item.item.title}</p>
                <p>R$ {item.valorTotalFormatado}</p>
              </div>
            ))}
          </div>
          <div className={classes.total}>
            <h4>Total</h4>
            <h4>{totalAmount}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessPixPayment;
