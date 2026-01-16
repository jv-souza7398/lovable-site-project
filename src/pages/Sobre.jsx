import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import classes from './Sobre.module.css';
import drink1 from '../assets/drink11.jpg';
import drink2 from '../assets/drink10.jpg';
import drink3 from '../assets/drink3.jpeg';
import drink4 from '../assets/drink8.jpg';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { 
  FaGlassMartiniAlt, 
  FaBuilding, 
  FaHeart, 
  FaBirthdayCake,
  FaStar,
  FaUserTie,
  FaLightbulb,
  FaSmile,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';

function Sobre() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });

    // Verificar se há hash na URL e fazer scroll para a seção
    const hash = window.location.hash;
    if (hash === '#servicos') {
      setTimeout(() => {
        const element = document.getElementById('servicos');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, []);

  const services = [
    {
      icon: FaGlassMartiniAlt,
      title: 'Coquetéis Exclusivos',
      description: 'Drinks personalizados e clássicos preparados com ingredientes premium e técnicas refinadas.'
    },
    {
      icon: FaBuilding,
      title: 'Eventos Corporativos',
      description: 'Confraternizações, lançamentos e eventos empresariais com serviço impecável.'
    },
    {
      icon: FaHeart,
      title: 'Casamentos',
      description: 'Bartending elegante para tornar sua cerimônia ainda mais especial e memorável.'
    },
    {
      icon: FaBirthdayCake,
      title: 'Festas Privadas',
      description: 'Aniversários, formaturas e celebrações íntimas com atendimento personalizado.'
    }
  ];

  const values = [
    {
      number: '01',
      icon: FaStar,
      title: 'Qualidade',
      description: 'Utilizamos apenas ingredientes premium e técnicas refinadas em cada drink.'
    },
    {
      number: '02',
      icon: FaUserTie,
      title: 'Profissionalismo',
      description: 'Equipe altamente treinada, pontualidade e apresentação impecável.'
    },
    {
      number: '03',
      icon: FaLightbulb,
      title: 'Inovação',
      description: 'Sempre atentos às tendências, criamos drinks autorais e experiências únicas.'
    },
    {
      number: '04',
      icon: FaSmile,
      title: 'Satisfação',
      description: 'Nosso foco está na experiência completa do cliente, do primeiro contato ao brinde final.'
    }
  ];

  return (
    <div className={classes.sobrePage}>
      {/* Hero Section */}
      <section className={classes.heroSection}>
        <div className={classes.heroContent}>
          <h1 data-aos="fade-up">Sobre a <span>Vincci Bar</span></h1>
          <p data-aos="fade-up" data-aos-delay="100">
            Excelência em serviços de bartending para eventos memoráveis
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className={classes.historySection}>
        <div className={classes.historyContainer}>
          <div className={classes.historyImage} data-aos="fade-right">
            <img src={drink1} alt="Bartender preparando drink exclusivo" />
            <span className={classes.badge}>Desde 2015</span>
          </div>
          <div className={classes.historyContent} data-aos="fade-left">
            <h2>Uma Tradição de <span>Excelência</span></h2>
            <p>
              A Vincci Bar nasceu da paixão por criar experiências únicas através da 
              arte da coquetelaria. Fundada em 2015, nossa missão sempre foi elevar 
              o padrão dos serviços de bartending para eventos no Brasil.
            </p>
            <p>
              Ao longo dos anos, construímos uma reputação sólida baseada na qualidade 
              dos nossos drinks, na elegância do nosso atendimento e no comprometimento 
              com cada detalhe. Já participamos de mais de 500 eventos, sempre deixando 
              nossa marca de excelência.
            </p>
            <p>
              Nossa equipe é formada por bartenders certificados, com vasta experiência 
              em eventos de alto padrão. Cada membro do time compartilha a mesma paixão 
              por criar momentos memoráveis através de drinks excepcionais.
            </p>
          </div>
        </div>
      </section>

      {/* O Que Fazemos */}
      <section id="servicos" className={classes.servicesSection}>
        <div className={classes.servicesContainer}>
          <div className={classes.servicesHeader} data-aos="fade-up">
            <h2>Serviços <span>Premium</span></h2>
            <p>
              Oferecemos uma experiência completa de bartending, desde a consultoria 
              inicial até a execução impecável do seu evento. Conheça nossos serviços:
            </p>
          </div>
          
          <div className={classes.servicesGrid}>
            {services.map((service, index) => (
              <div 
                key={index} 
                className={classes.serviceCard}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className={classes.serviceIcon}>
                  <service.icon />
                </div>
                <h4>{service.title}</h4>
                <p>{service.description}</p>
              </div>
            ))}
          </div>

          <div className={classes.servicesImage} data-aos="zoom-in">
            <img src={drink2} alt="Equipe Vincci Bar em evento elegante" />
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className={classes.valuesSection}>
        <div className={classes.valuesContainer}>
          <div className={classes.valuesContent}>
            <h2 data-aos="fade-up">O Que Nos <span>Define</span></h2>
            <div className={classes.valuesGrid}>
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className={classes.valueCard}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <span className={classes.valueNumber}>{value.number}</span>
                  <div className={classes.valueIcon}>
                    <value.icon />
                  </div>
                  <h4>{value.title}</h4>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={classes.valuesImage} data-aos="fade-left">
            <img src={drink3} alt="Coquetéis artesanais da Vincci Bar" />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={classes.ctaSection}>
        <div className={classes.ctaOverlay}></div>
        <div className={classes.ctaContent} data-aos="zoom-in">
          <h2>Pronto para <span>Elevar</span> seu Evento?</h2>
          <p>
            Entre em contato conosco e descubra como podemos transformar 
            sua próxima celebração em uma experiência inesquecível.
          </p>
          <Link to="/fale-conosco" className={classes.ctaButton}>
            Solicitar Orçamento
          </Link>
          <div className={classes.ctaContact}>
            <a href="tel:+5511999999999" className={classes.contactItem}>
              <FaPhone />
              <span>(11) 99999-9999</span>
            </a>
            <a href="mailto:contato@vinccibar.com.br" className={classes.contactItem}>
              <FaEnvelope />
              <span>contato@vinccibar.com.br</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Sobre;
