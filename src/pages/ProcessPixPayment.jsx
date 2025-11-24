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
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState(null);
  const [pixCopyPaste, setPixCopyPaste] = useState(null);
  const [error, setError] = useState(null);
  const [pixId, setPixId] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    createPixPayment();
  }, []);

  // Não faz polling automático, apenas quando o usuário clicar

  const checkPaymentStatus = async () => {
    if (!pixId || checkingPayment) return;

    try {
      setCheckingPayment(true);
      const { data, error: functionError } = await supabase.functions.invoke(
        'check-pix-payment-status',
        {
          body: { pixId },
        }
      );

      if (functionError) {
        console.error('Error checking payment status:', functionError);
        setError('Erro ao verificar pagamento. Tente novamente.');
        return;
      }

      console.log('Payment check response:', data);

      if (data.status === 'PAID') {
        setPaymentStatus('paid');
        navigate('/Completion', {
          state: {
            pixId,
            amount: totalAmount,
            status: 'paid'
          }
        });
      } else if (data.status === 'EXPIRED') {
        setError('Pagamento expirado. Por favor, gere um novo QR Code.');
      } else {
        setError('Pagamento ainda não foi confirmado. Aguarde alguns instantes.');
      }
    } catch (err) {
      console.error('Error checking payment:', err);
      setError('Erro ao verificar pagamento. Tente novamente.');
    } finally {
      setCheckingPayment(false);
    }
  };

  const copyPixCode = async () => {
    if (!pixCopyPaste) return;

    try {
      await navigator.clipboard.writeText(pixCopyPaste);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError('Erro ao copiar código PIX');
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

      console.log('Creating PIX QR Code with:', {
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
            expiresIn: 3600, // 1 hora
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

      console.log('PIX QR Code created:', data);
      setQrCodeImageUrl(data.qrCodeImageUrl);
      setPixCopyPaste(data.pixCopyPaste);
      setPixId(data.pixId);
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
          ) : qrCodeImageUrl ? (
            <div className={classes.pixContainer}>
              <h2>Pagamento PIX Pronto!</h2>
              
              <div className={classes.qrCodeArea}>
                <img 
                  src={qrCodeImageUrl} 
                  alt="QR Code PIX" 
                  className={classes.qrCodeImage}
                />
              </div>

              <div className={classes.paymentDetails}>
                <p className={classes.detailItem}>
                  <strong>Valor:</strong> {totalAmount}
                </p>
                <p className={classes.detailItem}>
                  <strong>ID do Pagamento:</strong> {pixId}
                </p>
              </div>

              <div className={classes.pixCodeSection}>
                <label className={classes.pixCodeLabel}>Código PIX (Copia e Cola):</label>
                <div className={classes.pixCodeBox}>
                  <code className={classes.pixCode}>{pixCopyPaste}</code>
                </div>
                <button 
                  onClick={copyPixCode}
                  className={classes.copyButton}
                >
                  {copySuccess ? '✓ Copiado!' : 'Copiar código PIX'}
                </button>
              </div>

              <button 
                onClick={checkPaymentStatus}
                className={classes.checkPaymentButton}
                disabled={checkingPayment}
              >
                <FaCheckCircle />
                {checkingPayment ? 'Verificando...' : 'Pagamento Realizado'}
              </button>
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
