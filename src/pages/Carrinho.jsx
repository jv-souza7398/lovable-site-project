import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import { supabase } from "../integrations/supabase/client";
import classes from "./Carrinho.module.css";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import EventDetailsModal from "../components/EventDetailsModal";
import CartStepsFrame from "../components/CartStepsFrame";

function Carrinho() {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  console.log("[Carrinho] cartItems at render:", cartItems);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const navigate = useNavigate();

  const drinkItems = Array.isArray(cartItems) ? cartItems : [];
  const totalItems = drinkItems.length;

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
      <main className={classes.carrinho}>
        <header className={classes.navCarrinho}>
          <h1>Carregando...</h1>
        </header>
      </main>
    );
  }

  if (!drinkItems || drinkItems.length === 0) {
    return (
      <main className={classes.carrinho}>
        <header className={classes.navCarrinhoEmpty}>
          <h1>
            O carrinho está <span>vazio</span>.
          </h1>
          <p className={classes.emptySubtitle}>Adicione drinks incríveis ao seu evento!</p>
          <Link to="/drinks/" className={classes.continuarComprando}>
            Ver drinks disponíveis
          </Link>
        </header>
      </main>
    );
  }

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

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
    message += `🕐 Horário: ${eventDetails.horaInicio} às ${eventDetails.horaEncerramento}\n`;
    message += `👥 Convidados: ${eventDetails.estimativaConvidados}\n\n`;
    message += `🍹 *Drinks Selecionados:*\n`;

    drinkItems.forEach((item, index) => {
      message += `• ${item.title}\n`;
    });

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    console.log("Abrindo WhatsApp, isMobile:", isMobile());

    // On mobile, use location.href for better compatibility
    // On desktop, use window.open
    if (isMobile()) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank");
    }
  };

  const handleOpenEventModal = () => {
    console.log("handleOpenEventModal chamado");
    console.log("Abrindo modal...");
    setShowEventModal(true);
  };

  const handleConfirmEvent = async (eventDetails) => {
    setSendingQuote(true);

    const totalAmount = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(0);

    // Usar dados do formulário (eventDetails agora inclui nome, email, telefone)
    const userName = eventDetails.nomeCompleto || "Cliente";
    const userEmail = eventDetails.email;

    // Criar página no Notion (não bloqueia o fluxo)
    const criarPaginaNotion = async () => {
      try {
        const notionResponse = await supabase.functions.invoke("create-notion-event", {
          body: {
            nomeCliente: userName,
            telefone: eventDetails.telefone,
            tipoEvento: eventDetails.tipoEvento || "Não informado",
            estimativaConvidados: parseInt(eventDetails.estimativaConvidados) || 0,
            dataEvento: eventDetails.dataEvento,
            horaInicio: eventDetails.horaInicio,
            cep: eventDetails.cep,
            rua: eventDetails.rua,
            numero: eventDetails.numero,
            complemento: eventDetails.complemento,
            bairro: eventDetails.bairro,
            cidade: eventDetails.cidade,
            uf: eventDetails.uf,
          },
        });

        if (notionResponse.error) {
          console.error("Erro ao criar página no Notion:", notionResponse.error);
        } else {
          console.log("Página criada no Notion com sucesso:", notionResponse.data);
        }
      } catch (notionError) {
        console.error("Erro ao conectar com Notion:", notionError);
      }
    };

    // Iniciar criação no Notion em paralelo (não bloqueia)
    criarPaginaNotion();

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

        drinkItems.forEach((item, index) => {
          doc.setFont(undefined, "bold");
          doc.text(`• ${item.title}`, 20, yPosition);

          yPosition += 8;
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
        yPosition += 5;
        doc.text(`Estimativa de convidados: ${eventDetails.estimativaConvidados}`, 25, yPosition);

        yPosition += 10;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;

        // Dados do cliente
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text("DADOS DO CLIENTE", 20, yPosition);
        yPosition += 8;

        doc.setFont(undefined, "normal");
        doc.setFontSize(10);
        doc.text(`Nome: ${userName}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Email: ${userEmail}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Telefone: ${eventDetails.telefone}`, 25, yPosition);

        yPosition += 10;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;

        const totalValue = 0;

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

      const response = await supabase.functions.invoke("send-quote-email", {
        body: {
          userEmail,
          userName,
          cartItems: drinkItems,
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

        // Close modal first
        setShowEventModal(false);

        // Open WhatsApp - using setTimeout to ensure the modal is closed first
        // This helps avoid popup blockers
        setTimeout(() => {
          console.log("Abrindo WhatsApp...");
          openWhatsApp(eventDetails, totalAmount, userName);
          clearCart();
        }, 300);
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
      <main className={classes.carrinho}>
        <section>
          <header className={classes.navCarrinho}>
            <h1>
              Seu <span>Carrinho</span>
            </h1>
          </header>
          <section className={classes.itemSection}>
            <div className={classes.carrinhoTitle} data-aos="fade-up">
              <h1>
                Meu Carrinho <span>________</span>
              </h1>
            </div>

            <section className={classes.produtos} data-aos="fade-up">
              <div className={classes.itens}>
                <div className={classes.drinksSection}>
                  <p className={classes.quantidadeItens}>DRINKS SELECIONADOS</p>
                  {drinkItems.map((drink, index) => (
                    <article key={`drink-${drink.id}-${index}`} className={classes.articleDrink}>
                      <div className={classes.drinkContent}>
                        <figure className={classes.imgDrink}>
                          <img src={drink.img} alt={drink.title} />
                        </figure>
                        <div className={classes.drinkInfo}>
                          <h4>{drink.title}</h4>
                          <p>{drink.description}</p>
                        </div>
                        <button
                          type="button"
                          className={classes.removeDrink}
                          title="Remover drink"
                          onClick={() => removeFromCart(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <article className={classes.articleSumario}>
                <section className={classes.card}>
                  <header className={classes.cardHeader}>
                    <h5>Resumo</h5>
                  </header>
                  <div className={classes.cardBody}>
                    <ul className={classes.listGroup}>
                      <li className={classes.listGroupItem}>
                        <p>Drinks no carrinho</p>
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
                      <Link to={"/drinks/"} className={classes.continuar}>
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
