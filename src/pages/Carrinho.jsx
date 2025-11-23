import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import classes from './Carrinho.module.css'
import { Link } from 'react-router-dom';
function Carrinho() {
  const { cartItems } = useContext(CartContext);

  if (!cartItems || cartItems.length === 0) {
    return(
      <header className={classes.navCarrinho}>
       <h1>O carrinho está vazio.</h1>;
       </header>
    )
  }


  return (
    <>
      <main>
  <section className={classes.carrinho}>
    <header className={classes.navCarrinho}>
      <h1>CARRINHO</h1>
    </header>
      <section className={classes.itemSection}>
          <div className={classes.carrinhoTitle} data-aos="fade-up">
          <h1>Meu Carrinho <span>________</span></h1>
        </div>
       
        <section className={classes.produtos} data-aos="fade-up">
            <div className={classes.itens}>
             {cartItems.map((item, index) => (
              <article key={index} className={classes.articleProdutos} >
                <p className={classes.quantidadeItens}>ITEM {index + 1} </p>
            <div className={classes.itemContent}>
              <figure className={classes.imgItem}>
                <img src={item.item.img} alt={`Imagem do item ${item.item.title}`} />
              </figure>

              <section className={classes.infoSection}>
                <div className={classes.infoPacote}>
                  <div className={classes.info}>
                    <h3><strong>{item.item.title}</strong></h3>
                    <p>Horário: <span>{item.horario} Horas</span></p>
                    <p>Nº Bartenders: <span>{item.bartenders} Bartenders</span></p>
                    <p>Nº Convidados: <span>{item.convidados} Convidados</span></p>
                  </div>
                  <div className={classes.buttons}>
                  <button type="button" className={`${classes.btn} ${classes.btnPrimary}`} title="Remover item">
                    <i className="fas fa-trash"></i>
                  </button>
                  </div>
                </div>

                <div className={classes.preco}>
                <p><strong>R${item.valorTotalFormatado}</strong></p>
                </div>
              </section>
            </div>
          </article>
         ))}
         </div>
         <article className={classes.articleSumario}>
    <section className={classes.card}>
      <header className={classes.cardHeader}>
        <h5>Resumo</h5>
      </header>
      <div className={classes.cardBody}>
        <ul className={classes.listGroup}>
          <li className={classes.listGroupItem}>
            <p>Produtos</p>
            {/* Somar o total dos pacotes */}
            <span>
              
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL', 
                minimumFractionDigits: 2 
              }).format(
                cartItems.reduce((acc, item) => {
                  // Remove o "R$", pontos e vírgulas, e converte para número
                  const valorNumerico = parseFloat(
                    item.valorTotalFormatado
                      .replace('R$', '')
                      .replace(/\./g, '') // Remove pontos de milhar
                      .replace(',', '.') // Substitui vírgula por ponto para decimais
                  );
                  return acc + valorNumerico;
                }, 0)
              )}
            </span>
          </li>
          <li className={classes.listGroupItem}>
            <p>Frete</p><span>Grátis</span>
          </li>
          <li className={classes.listGroupItem}>
            <div>
              <h4>Total</h4>
            </div>
            <span>
              <strong>
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL', 
                  minimumFractionDigits: 2 
                }).format(
                  cartItems.reduce((acc, item) => {
                    const valorNumerico = parseFloat(
                      item.valorTotalFormatado
                        .replace('R$', '')
                        .replace(/\./g, '') // Remove pontos de milhar
                        .replace(',', '.') // Substitui vírgula por ponto para decimais
                    );
                    return acc + valorNumerico;
                  }, 0)
                )}
              </strong>
            </span>
          </li>
        </ul>


                <nav className={classes.navLinks}>
                  <Link to={"/Checkout/"} className={classes.pagamento}>Ir para pagamento</Link>
                  <Link to={"/continuar-comprando"} className={classes.continuar}>Continuar comprando</Link>
                </nav>
              </div>
            </section>
          </article>
        </section>

      </section>
  </section>
</main>

    </>
  );
}

export default Carrinho;
