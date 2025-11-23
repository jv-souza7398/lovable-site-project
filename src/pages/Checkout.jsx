
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs'; // Importe o componente Breadcrumbs
import classes from './Checkout.module.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm'; // Componente do formulário de checkout

const stripePromise = loadStripe('sua_chave_publica_stripe'); // Substitua pela sua chave pública

// Defina ou importe a lista de itens (menuItems)
const menuItems = [
  { id: 1, title: "Drinks sem álcool", description: "Bartenders para festas em São Paulo", info: "Bartender para festa Open Bar em São Paulo com 12 opções de Drinks com e sem álcool. Opção ideal para servir crianças e adultos.", price: "A partir de R$550,00" },
  { id: 2, title: "Barman + lista de compras", description: "Mão de obra de Barman para festa", info: "Economize, pague apenas pela mão de obra de Barman para festa e receba uma lista sugestiva de compras de acordo com seu cardápio!", price: "A partir de R$1.689,99" },
  { id: 3, title: "Drinks com e sem álcool", description: "Bartenders para festas em São Paulo", info: "6 opções de Drinks Clássicos + Festival de Caipirinhas com 3 frutas (Limão, Maracujá e Morango) e 3 opções de destilados (Vodka, Saquê e Cachaça).", price: "A partir de R$1.889,99" },
  { id: 4, title: "Pacote de Drinks Clássicos", description: "Bartenders para festas em São Paulo", info: "6 opções de Drinks Clássicos + Festival de Caipirinhas com 3 frutas (Limão, Maracujá e Morango) e 3 opções de destilados (Vodka, Saquê e Cachaça).", price: "A partir de R$550,00" },
];

const formatTitleForURL = (title) => {
  return title.toLowerCase().replace(/\s+/g, '-');
};

const Checkout = () => {
  const [estados, setEstados] = useState('');
  const [banco, setBanco] = useState('');
  const location = useLocation();
  const formattedTitle = formatTitleForURL(location.state?.item?.title || '');
  const { item, horario, convidados, bartenders } = location.state || {};

  if (!item) {
    return <div>Nenhum item foi selecionado.</div>;
  }
  console.log(horario);
  

  return (
    <>
      <div className={classes.Pagamento}>
        <div className={classes.navPagamento}>
          <h1>PAGAMENTO</h1>
        </div>
        <div className={classes.pagamentoContent}>
        <Elements stripe={stripePromise}>
        <CheckoutForm />
        </Elements>
         
      <section className={classes.InfoPacote}>
          <div className={classes.imgPacote}>
            <img src={item.img} alt="img" />
          </div> 
            <h4>{item.title}</h4> 
            <p>{item.description}</p>
            <div className={classes.itemPrice}>
              <p>{item.price}</p>
            </div>
            <div className={classes.infoAdicionais}>
            <h2>Informações adicionais:</h2>
            <div className={classes.info}>
            <p>Horario Da Festa:</p>
            <p>{horario} Horas</p>
            </div>
            <div className={classes.info}>
              <p>Nº  Bartenders:</p>
            <p>{bartenders} Bartenders</p>
            </div>
            <div className={classes.info}>
            <p>Nº Convidados:</p>
            <p>{convidados} Convidados</p>
            </div>
          </div>
       </section> 
        </div>
         </div>
    </>
  );
};

export default Checkout;


