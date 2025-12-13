import React, { useState } from "react";
import { FaTimes, FaShoppingCart, FaClipboardList, FaWhatsapp } from "react-icons/fa";

const CartStepsFrame = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(30, 29, 29, 0.98)",
          border: "2px solid rgba(146, 117, 60, 0.5)",
          borderRadius: "16px",
          maxWidth: "700px",
          width: "100%",
          padding: "32px 24px",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "rgb(177, 169, 169)",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          <FaTimes />
        </button>

        {/* Header */}
        <h2
          style={{
            color: "rgb(146, 117, 60)",
            fontSize: "24px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Como funciona?
        </h2>
        <p
          style={{
            color: "rgb(177, 169, 169)",
            textAlign: "center",
            fontSize: "14px",
            marginBottom: "32px",
          }}
        >
          Veja os passos para finalizar seu orçamento
        </p>

        {/* Steps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                minWidth: "50px",
                backgroundColor: "rgba(146, 117, 60, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgb(146, 117, 60)",
              }}
            >
              <FaShoppingCart style={{ fontSize: "20px", color: "rgb(146, 117, 60)" }} />
            </div>
            <div>
              <h3
                style={{
                  color: "rgb(146, 117, 60)",
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                1. Inclua seus pacotes desejados
              </h3>
              <p
                style={{
                  color: "rgb(177, 169, 169)",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                Adicione os pacotes que deseja para o seu evento no carrinho.
              </p>
            </div>
          </div>

          {/* Connector line */}
          <div
            style={{
              width: "2px",
              height: "20px",
              backgroundColor: "rgba(146, 117, 60, 0.4)",
              marginLeft: "24px",
              marginTop: "-16px",
              marginBottom: "-16px",
            }}
          />

          {/* Step 2 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                minWidth: "50px",
                backgroundColor: "rgba(146, 117, 60, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgb(146, 117, 60)",
              }}
            >
              <FaClipboardList style={{ fontSize: "20px", color: "rgb(146, 117, 60)" }} />
            </div>
            <div>
              <h3
                style={{
                  color: "rgb(146, 117, 60)",
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                2. Preencha as informações do evento
              </h3>
              <p
                style={{
                  color: "rgb(177, 169, 169)",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                Entendemos que este processo é moroso, mas facilita muito para coletarmos todos os dados necessários 😊
              </p>
            </div>
          </div>

          {/* Connector line */}
          <div
            style={{
              width: "2px",
              height: "20px",
              backgroundColor: "rgba(146, 117, 60, 0.4)",
              marginLeft: "24px",
              marginTop: "-16px",
              marginBottom: "-16px",
            }}
          />

          {/* Step 3 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                minWidth: "50px",
                backgroundColor: "rgba(37, 211, 102, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #25D366",
              }}
            >
              <FaWhatsapp style={{ fontSize: "20px", color: "#25D366" }} />
            </div>
            <div>
              <h3
                style={{
                  color: "#25D366",
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                3. Atendimento via WhatsApp
              </h3>
              <p
                style={{
                  color: "rgb(177, 169, 169)",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                Você será redirecionado para nosso time de atendimento com o orçamento, e daremos sequência ao seu atendimento.
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleClose}
          style={{
            width: "100%",
            padding: "16px",
            marginTop: "32px",
            backgroundColor: "rgb(146, 117, 60)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Entendi!
        </button>
      </div>
    </div>
  );
};

export default CartStepsFrame;
