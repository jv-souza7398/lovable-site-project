import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classes from './SelectPaymentMethod.module.css';
import { FaQrcode } from 'react-icons/fa';
import { supabase } from '../integrations/supabase/client';

const SelectPaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, totalAmount } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setAuthLoading(false);
        navigate('/Login/', { state: { redirectTo: '/SelectPaymentMethod/' } });
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do perfil:', error);
      } else {
        setProfile(data);
      }

      setAuthLoading(false);
    };

    loadUser();
  }, [navigate]);

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

  if (authLoading) {
    return (
      <div className={classes.container}>
        <div className={classes.emptyState}>
          <h1>Carregando...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
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
      if (!profile) {
        throw new Error('Dados de identificação não encontrados. Atualize seu cadastro.');
      }

      navigate('/ProcessPixPayment/', {
        state: {
          cartItems,
          totalAmount,
          customerEmail: profile.email || user?.email,
          customerName: profile.nome_completo || user?.email,
          customerPhone: profile.telefone,
          customerTaxId: profile.cpf,
        },
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Erro ao processar pagamento. Tente novamente.');
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

