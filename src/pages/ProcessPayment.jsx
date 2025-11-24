import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './ProcessPayment.module.css';
import { FaQrcode, FaCreditCard, FaCheckCircle } from 'react-icons/fa';

const ProcessPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, totalAmount, paymentMethod } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [pixQRCode, setPixQRCode] = useState(null);
  const [pixCode, setPixCode] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  if (!cartItems || !paymentMethod) {
    return (
      <div className={classes.container}>
        <h1>Erro: Informações de pagamento não encontradas.</h1>
      </div>
    );
  }

  const handleCopyPixCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      alert('Código PIX copiado para a área de transferência!');
    }
  };

  const handleProcessPayment = async () => {
    setLoading(true);

    // Aqui você implementará a integração com AbacatePay
    // Por enquanto, vamos simular o processo
    
    if (paymentMethod === 'pix') {
      // Simula chamada para API do AbacatePay para gerar QR Code PIX
      setTimeout(() => {
        setPixQRCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        setPixCode('00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540510.005802BR5925Nome do Beneficiario6014CIDADE7071234567890123456789012345678901234567890123456789012345678901234');
        setLoading(false);
      }, 2000);
    } else {
      // Para cartão de crédito/débito
      setTimeout(() => {
        setPaymentStatus('success');
        setLoading(false);
        setTimeout(() => {
          navigate('/Confirmacao/', {
            state: {
              cartItems,
              totalAmount,
              paymentMethod
            }
          });
        }, 2000);
      }, 3000);
    }
  };

  useEffect(() => {
    handleProcessPayment();
  }, []);

  const renderPaymentInterface = () => {
    if (paymentMethod === 'pix') {
      return (
        <div className={classes.pixContainer}>
          <FaQrcode className={classes.pixIcon} />
          <h2>Pagamento via PIX</h2>
          
          {loading ? (
            <div className={classes.loading}>
              <div className={classes.spinner}></div>
              <p>Gerando código PIX...</p>
            </div>
          ) : (
            <>
              {pixQRCode && (
                <div className={classes.qrCodeSection}>
                  <div className={classes.qrCodePlaceholder}>
                    <FaQrcode size={200} />
                    <p>QR Code PIX</p>
                  </div>
                  <p className={classes.instructions}>
                    Escaneie o QR Code com o aplicativo do seu banco
                  </p>
                  
                  <div className={classes.pixCodeSection}>
                    <p>Ou copie o código PIX:</p>
                    <div className={classes.pixCodeBox}>
                      <code>{pixCode}</code>
                      <button onClick={handleCopyPixCode} className={classes.copyButton}>
                        Copiar Código
                      </button>
                    </div>
                  </div>

                  <div className={classes.waitingPayment}>
                    <div className={classes.spinner}></div>
                    <p>Aguardando pagamento...</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (paymentMethod === 'credit' || paymentMethod === 'debit') {
      return (
        <div className={classes.cardContainer}>
          <FaCreditCard className={classes.cardIcon} />
          <h2>Pagamento com {paymentMethod === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}</h2>
          
          {loading ? (
            <div className={classes.loading}>
              <div className={classes.spinner}></div>
              <p>Processando pagamento...</p>
            </div>
          ) : paymentStatus === 'success' ? (
            <div className={classes.success}>
              <FaCheckCircle className={classes.successIcon} />
              <h3>Pagamento aprovado!</h3>
              <p>Redirecionando...</p>
            </div>
          ) : null}
        </div>
      );
    }
  };

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>PROCESSANDO PAGAMENTO</h1>
      </header>

      <div className={classes.content}>
        <div className={classes.paymentSection}>
          {renderPaymentInterface()}
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

export default ProcessPayment;
