import React, { useContext } from 'react';
import classes from './Account.module.css'; // Importação das classes do CSS Module
import { AccountContext } from '../contexts/AccountContext';
import { Link } from 'react-router-dom';

function Account() {
  const { AccountItems } = useContext(AccountContext);

  if (!AccountItems || AccountItems.length === 0) {
    return (

    <header className={classes.navAccount}>
     <h1>O carrinho está vazio.</h1>;
     </header>
    )
  }
  return (
    <>
  <main className={classes.mainAccount}>
  <div className={classes.navAccount}>
          <h1>MINHA CONTA</h1>      
        </div>
        <div className={classes.accountTitle} data-aos="fade-up">
       <h1>Minha Conta <span>________</span></h1>
      </div>
  {AccountItems.map((item, index) => (
    <section key={item.nomeCompleto} className={classes.accountSection}>
    
    <aside className={classes.accountAside}>     
      <figure>
        <img
          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
          alt="avatar"
         
        />
        <figcaption>
          <h1>Olá {item.nomeCompleto}</h1>
          <p>Bay Area, San Francisco, CA</p>
          {/* <Link to={"#"}>Excluir</Link>
          <Link to={"#"}>Editar</Link> */}
        </figcaption>
      </figure>
     </aside>
 
    <section  className={classes.infoSection}>
    <article className={classes.infoArticle}>
  <h2>INFORMAÇOES PESSOAIS</h2>
  <dl>
    <div className={classes.flexRow}>
      <dt>Nome Completo</dt>
      <dd>{item.nomeCompleto}</dd>
    </div>
    
    <div className={classes.flexRow}>
      <dt>Sexo</dt>
      <dd>{item.sexo}</dd>
    </div>
    
    <div className={classes.flexRow}>
      <dt>Email</dt>
      <dd>{item.email}</dd>
    </div>
    
    <div className={classes.flexRow}>
      <dt>Telefone</dt>
      <dd>{item.telefone}</dd>
    </div>
    
    <div className={classes.flexRow}>
      <dt>Data De Nascimento</dt>
      <dd>{item.dataNascimento}</dd>
    </div>
    
    <div className={classes.flexRow}>
      <dt>Endereço</dt>
      <dd>Bay Area, San Francisco, CA</dd>
    </div>
  </dl>
</article>

    </section>
 </section>
))}
 </main>
    </>
  )
}

export default Account