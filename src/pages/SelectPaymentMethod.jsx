import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classes from './SelectPaymentMethod.module.css';
import { FaCreditCard, FaQrcode } from 'react-icons/fa';

const SelectPaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, totalAmount } = location.state || {};
  const [selectedMethod, setSelectedMethod] = useState('');

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={classes.container}>
        <h1>Nenhum item no carrinho.</h1>
      </div>
    );
  }

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (!selectedMethod) {
      alert('Por favor, selecione um método de pagamento.');
      return;
    }

    navigate('/ProcessPayment/', {
      state: {
        cartItems,
        totalAmount,
        paymentMethod: selectedMethod
      }
    });
  };

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>SELECIONE O MÉTODO DE PAGAMENTO</h1>
      </header>

      <div className={classes.content}>
        <div className={classes.paymentMethods}>
          <h2>Escolha como deseja pagar</h2>
          
          <div 
            className={`${classes.methodCard} ${selectedMethod === 'credit' ? classes.selected : ''}`}
            onClick={() => handleMethodSelect('credit')}
          >
            <FaCreditCard className={classes.icon} />
            <div className={classes.methodInfo}>
              <h3>Cartão de Crédito</h3>
              <p>Pagamento parcelado disponível</p>
            </div>
          </div>

          <div 
            className={`${classes.methodCard} ${selectedMethod === 'debit' ? classes.selected : ''}`}
            onClick={() => handleMethodSelect('debit')}
          >
            <FaCreditCard className={classes.icon} />
            <div className={classes.methodInfo}>
              <h3>Cartão de Débito</h3>
              <p>Pagamento à vista</p>
            </div>
          </div>

          <div 
            className={`${classes.methodCard} ${selectedMethod === 'pix' ? classes.selected : ''}`}
            onClick={() => handleMethodSelect('pix')}
          >
            <FaQrcode className={classes.icon} />
            <div className={classes.methodInfo}>
              <h3>PIX</h3>
              <p>Pagamento instantâneo</p>
            </div>
          </div>
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
          <button 
            className={classes.continueButton}
            onClick={handleContinue}
            disabled={!selectedMethod}
          >
            Continuar para Pagamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectPaymentMethod;
