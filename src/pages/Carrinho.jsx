import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import { supabase } from "../integrations/supabase/client";
import classes from "./Carrinho.module.css";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import EventDetailsModal from "../components/EventDetailsModal";
import CartStepsFrame from "../components/CartStepsFrame";

function Carrinho() {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const navigate = useNavigate();

  const packageItems = cartItems.filter((item) => item && item.item);
  const drinkItems = cartItems.filter((item) => item && !item.item && item.img);
  const totalItems = cartItems.reduce((sum, item) => sum + (item?.quantity || 1), 0);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <header className={classes.navCarrinho}>
        <h1>Carregando...</h1>
      </header>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <header className={classes.navCarrinho}>
        <h1>O carrinho está vazio.</h1>
      </header>
    );
  }


  const openWhatsApp = (eventDetails, totalAmount, userName) => {
    const phoneNumber = "5511910465650";
    const dataEventoFormatada = new Date(eventDetails.dataEvento + "T00:00:00").toLocaleDateString("pt-BR");
    
    let message = `Olá! Gostaria de finalizar meu orçamento.\n\n`;
    message += `*Nome:* ${userName}\n`;
    message += `*Total:* ${totalAmount}\n\n`;
    message += `*Dados do Evento:*\n`;
    message += `📍 ${eventDetails.rua}, ${eventDetails.numero}${eventDetails.complemento ? ` - ${eventDetails.complemento}` : ""}\n`;
    message += `📍 ${eventDetails.bairro}, ${eventDetails.cidade} - ${eventDetails.uf}\n`;
    message += `📍 CEP: ${eventDetails.cep}\n`;
    message += `📅 Data: ${dataEventoFormatada}\n`;
    message += `🕐 Horário: ${eventDetails.horaInicio} às ${eventDetails.horaEncerramento}\n\n`;
    message += `*Pacotes selecionados:*\n`;
    
    cartItems.forEach((item, index) => {
      message += `\n${index + 1}. ${item.item.title}\n`;
      message += `   • Horário: ${item.horario}h\n`;
      message += `   • Bartenders: ${item.bartenders}\n`;
      message += `   • Convidados: ${item.convidados}\n`;
      message += `   • Valor: R$ ${item.valorTotalFormatado}\n`;
    });
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
  };

  const handleOpenEventModal = async () => {
    console.log("handleOpenEventModal chamado");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Session:", session);

    if (!session) {
      alert("Você precisa fazer login para enviar o orçamento.");
      navigate("/Login/", { state: { redirectTo: "/Carrinho/" } });
      return;
    }

    console.log("Abrindo modal...");
    setShowEventModal(true);
  };

  const handleConfirmEvent = async (eventDetails) => {
    setSendingQuote(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const totalAmount = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(
      cartItems.reduce((acc, item) => {
        const valorNumerico = parseFloat(
          item.valorTotalFormatado.replace("R$", "").replace(/\./g, "").replace(",", "."),
        );
        return acc + valorNumerico;
      }, 0),
    );

    // Gerar PDF em base64 e enviar email
    try {
      let pdfBase64 = null;
      try {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("ORÇAMENTO", 105, 20, { align: "center" });

        doc.setFontSize(10);
        const dataAtual = new Date().toLocaleDateString("pt-BR");
        doc.text(`Data: ${dataAtual}`, 20, 35);

        doc.line(20, 40, 190, 40);

        let yPosition = 50;
        doc.setFontSize(12);

        cartItems.forEach((item, index) => {
          doc.setFont(undefined, "bold");
          doc.text(`ITEM ${index + 1}: ${item.item.title}`, 20, yPosition);

          doc.setFont(undefined, "normal");
          doc.setFontSize(10);
          yPosition += 7;
          doc.text(`Horário: ${item.horario} Horas`, 25, yPosition);
          yPosition += 5;
          doc.text(`Nº Bartenders: ${item.bartenders}`, 25, yPosition);
          yPosition += 5;
          doc.text(`Nº Convidados: ${item.convidados}`, 25, yPosition);
          yPosition += 5;
          doc.text(`Valor: R$ ${item.valorTotalFormatado}`, 25, yPosition);

          yPosition += 10;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 10;
        });

        // Dados do evento
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text("DADOS DO EVENTO", 20, yPosition);
        yPosition += 8;

        doc.setFont(undefined, "normal");
        doc.setFontSize(10);
        const enderecoCompleto = eventDetails.complemento
          ? `${eventDetails.rua}, ${eventDetails.numero} - ${eventDetails.complemento}`
          : `${eventDetails.rua}, ${eventDetails.numero}`;
        doc.text(`Endereço: ${enderecoCompleto}`, 25, yPosition);
        yPosition += 5;
        doc.text(`${eventDetails.bairro}, ${eventDetails.cidade} - ${eventDetails.uf}`, 25, yPosition);
        yPosition += 5;
        doc.text(`CEP: ${eventDetails.cep}`, 25, yPosition);
        yPosition += 5;
        const dataEventoFormatada = new Date(eventDetails.dataEvento + "T00:00:00").toLocaleDateString("pt-BR");
        doc.text(`Data do evento: ${dataEventoFormatada}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Horário: ${eventDetails.horaInicio} às ${eventDetails.horaEncerramento}`, 25, yPosition);

        yPosition += 10;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;

        const totalValue = cartItems.reduce((acc, item) => {
          const valorNumerico = parseFloat(
            item.valorTotalFormatado.replace("R$", "").replace(/\./g, "").replace(",", "."),
          );
          return acc + valorNumerico;
        }, 0);

        const totalFormatado = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
        }).format(totalValue);

        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(`TOTAL: ${totalFormatado}`, 105, yPosition, { align: "center" });

        pdfBase64 = doc.output("base64");
        console.log("PDF gerado com sucesso, tamanho:", pdfBase64?.length);
      } catch (pdfError) {
        console.error("Erro ao gerar PDF:", pdfError);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("nome_completo")
        .eq("id", session.user.id)
        .single();

      const userName = profile?.nome_completo || session.user.email?.split("@")[0] || "Cliente";

      const response = await supabase.functions.invoke("send-quote-email", {
        body: {
          userEmail: session.user.email,
          userName,
          cartItems,
          totalAmount,
          pdfBase64,
          eventDetails,
        },
      });

      if (response.error) {
        console.error("Erro ao enviar email:", response.error);
        alert("Erro ao enviar orçamento. Tente novamente.");
      } else {
        console.log("Email enviado com sucesso!");
        
        // Open WhatsApp after successful email
        openWhatsApp(eventDetails, totalAmount, userName);
        
        setShowEventModal(false);
        clearCart();
      }
    } catch (error) {
      console.error("Erro ao processar envio de email:", error);
      alert("Erro ao enviar orçamento. Tente novamente.");
    } finally {
      setSendingQuote(false);
    }
  };

  return (
    <>
      <CartStepsFrame />
      <EventDetailsModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        onConfirm={handleConfirmEvent}
        loading={sendingQuote}
      />
      <main>
        <section className={classes.carrinho}>
          <header className={classes.navCarrinho}>
            <h1>CARRINHO</h1>
          </header>
          <section className={classes.itemSection}>
            <div className={classes.carrinhoTitle} data-aos="fade-up">
              <h1>
                Meu Carrinho <span>________</span>
              </h1>
            </div>

            <section className={classes.produtos} data-aos="fade-up">
              <div className={classes.itens}>
                {packageItems
                  .filter((item) => item && item.item && item.item.img)
                  .map((item, index) => (
                    <article key={`pkg-${index}`} className={classes.articleProdutos}>
                      <p className={classes.quantidadeItens}>PACOTE {index + 1} </p>
                      <div className={classes.itemContent}>
                        <figure className={classes.imgItem}>
                          <img src={item.item.img} alt={`Imagem do item ${item.item.title}`} />
                        </figure>

                        <section className={classes.infoSection}>
                          <div className={classes.infoPacote}>
                            <div className={classes.info}>
                              <h3>
                                <strong>{item.item.title}</strong>
                              </h3>
                              <p>
                                Horário: <span>{item.horario} Horas</span>
                              </p>
                              <p>
                                Nº Bartenders: <span>{item.bartenders} Bartenders</span>
                              </p>
                              <p>
                                Nº Convidados: <span>{item.convidados} Convidados</span>
                              </p>
                            </div>
                            <div className={classes.buttons}>
                              <button
                                type="button"
                                className={`${classes.btn} ${classes.btnPrimary}`}
                                title="Remover item"
                                onClick={() => removeFromCart(cartItems.indexOf(item))}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>

                          <div className={classes.preco}>
                            <p>
                              <strong>R${item.valorTotalFormatado}</strong>
                            </p>
                          </div>
                        </section>
                      </div>
                    </article>
                  ))}

                {drinkItems.length > 0 && (
                  <div className={classes.drinksSection}>
                    <p className={classes.quantidadeItens}>DRINKS SELECIONADOS</p>
                    {drinkItems
                      .filter((drink) => drink && drink.img)
                      .map((drink) => (
                        <article key={`drink-${drink.id}`} className={classes.articleDrink}>
                          <div className={classes.drinkContent}>
                            <figure className={classes.imgDrink}>
                              <img src={drink.img} alt={drink.title} />
                            </figure>
                            <div className={classes.drinkInfo}>
                              <h4>{drink.title}</h4>
                              <p>{drink.description}</p>
                              <div className={classes.quantityControls}>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      cartItems.indexOf(drink),
                                      (drink.quantity || 1) - 1,
                                    )
                                  }
                                  aria-label="Diminuir quantidade"
                                >
                                  -
                                </button>
                                <span>{drink.quantity || 1}</span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      cartItems.indexOf(drink),
                                      (drink.quantity || 1) + 1,
                                    )
                                  }
                                  aria-label="Aumentar quantidade"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={classes.removeDrink}
                              title="Remover drink"
                              onClick={() => removeFromCart(cartItems.indexOf(drink))}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                )}
              </div>
              <article className={classes.articleSumario}>
                <section className={classes.card}>
                  <header className={classes.cardHeader}>
                    <h5>Resumo</h5>
                  </header>
                  <div className={classes.cardBody}>
                    <ul className={classes.listGroup}>
                      <li className={classes.listGroupItem}>
                        <p>Itens no carrinho</p>
                        <span>{totalItems}</span>
                      </li>
                      <li className={classes.listGroupItem}>
                        <p>Frete</p>
                        <span>A ser negociado</span>
                      </li>
                      <li className={classes.listGroupItemTotal}>
                        <h4>Total de itens</h4>
                        <span>{totalItems}</span>
                      </li>
                    </ul>

                    <nav className={classes.navLinks}>
                      <button onClick={handleOpenEventModal} className={classes.pagamento}>
                        Enviar orçamento
                      </button>
                      <Link to={"/Pacotes/"} className={classes.continuar}>
                        Continuar comprando
                      </Link>
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
