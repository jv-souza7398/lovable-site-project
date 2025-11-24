import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AccountContext } from '../contexts/AccountContext';
import classes from './SelectPaymentMethod.module.css';
import { FaQrcode } from 'react-icons/fa';

const SelectPaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { AccountItems } = useContext(AccountContext);
  const { cartItems, totalAmount } = location.state || {};
  const [loading, setLoading] = useState(false);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={classes.container}>
        <div className={classes.emptyState}>
          <h1>Carrinho vazio</h1>
          <p>Adicione itens ao carrinho para continuar</p>
        </div>
      </div>
    );
  }

  if (!AccountItems || AccountItems.length === 0) {
    return (
      <div className={classes.container}>
        <div className={classes.emptyState}>
          <h1>Login necessário</h1>
          <p>Você precisa estar logado para continuar</p>
        </div>
      </div>
    );
  }

  const handlePixPayment = async () => {
    setLoading(true);
    
    try {
      // Navega para a página de processamento PIX
      navigate('/ProcessPixPayment/', {
        state: {
          cartItems,
          totalAmount,
          customerEmail: AccountItems[0].email,
          customerName: AccountItems[0].nomeCompleto,
          customerPhone: AccountItems[0].telefone,
        }
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>SELECIONE O MÉTODO DE PAGAMENTO</h1>
      </header>

      <div className={classes.content}>
        <div className={classes.paymentMethods}>
          <h2>Como deseja pagar?</h2>
          
          <div 
            className={classes.methodCard}
            onClick={handlePixPayment}
          >
            <FaQrcode className={classes.icon} />
            <div className={classes.methodInfo}>
              <h3>PIX</h3>
              <p>Pagamento instantâneo e seguro</p>
              <p className={classes.highlight}>Aprovação imediata</p>
            </div>
          </div>

          <div className={classes.comingSoon}>
            <p>🔒 Cartão de crédito e débito em breve</p>
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
        </div>
      </div>
    </div>
  );
};

export default SelectPaymentMethod;

