import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import classes from './ProcessPixPayment.module.css';
import { FaQrcode, FaCopy, FaCheckCircle } from 'react-icons/fa';

const ProcessPixPayment = () => {
  const location = useLocation();
  const { cartItems, totalAmount, customerEmail, customerName, customerPhone } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [error, setError] = useState(null);
  const [billingId, setBillingId] = useState(null);

  useEffect(() => {
    createPixPayment();
  }, []);

  const createPixPayment = async () => {
    try {
      setLoading(true);
      setError(null);

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
        customerPhone
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
              <FaQrcode className={classes.pixIcon} />
              <h2>Pagamento PIX Gerado</h2>
              <p className={classes.instructions}>
                Clique no botão abaixo para abrir a página de pagamento do AbacatePay 
                e visualizar o QR Code PIX
              </p>
              
              <a 
                href={paymentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={classes.paymentButton}
              >
                <FaQrcode />
                Abrir Página de Pagamento PIX
              </a>

              <div className={classes.paymentInfo}>
                <p><strong>ID do Pagamento:</strong> {billingId}</p>
                <p><strong>Valor:</strong> {totalAmount}</p>
              </div>

              <div className={classes.instructions}>
                <h3>Como pagar:</h3>
                <ol>
                  <li>Clique no botão acima para abrir a página de pagamento</li>
                  <li>Escaneie o QR Code com o aplicativo do seu banco</li>
                  <li>Ou copie o código PIX e cole no seu app de pagamentos</li>
                  <li>Confirme o pagamento</li>
                </ol>
              </div>
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
