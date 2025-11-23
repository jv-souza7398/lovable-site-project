// src/CheckoutForm.js
import React, { useState } from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import classes from './CheckoutForm.module.css'; // Importando o CSS Module

// Sua chave pública do Stripe
const stripePromise = loadStripe('sua-chave-publica-do-stripe');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { token, error } = await stripe.createToken(cardElement);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      await axios.post('/api/charge', { token: token.id });

      alert('Pagamento realizado com sucesso!');
    } catch (error) {
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={classes.formContainer}>
      <h1 className={classes.heading}>Finalizar Compra</h1>
      <div>
        <label htmlFor="card-element" className={classes.label}>Informações de Cartão</label>
        <CardElement
          id="card-element"
          className={classes.cardElement}
          options={{
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                fontSize: '16px',
                '::placeholder': {
                  color: '#CFD7E0',
                },
              },
              invalid: {
                iconColor: '#FFC7EE',
                color: '#FFC7EE',
              },
            },
          }}
        />
      </div>
      {error && <div className={classes.error}>{error}</div>}
      <button type="submit" className={classes.submitButton} disabled={!stripe || loading}>
        {loading ? 'Processando...' : 'Pagar'}
      </button>
    </form>
  );
};

// Componente Wrapper para adicionar o Stripe Provider


export default CheckoutForm;

