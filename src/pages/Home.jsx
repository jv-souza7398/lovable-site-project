import React, { useState,useEffect } from 'react';
import drink3 from '../assets/drink7.jpg';
import drink2 from '../assets/drink6.jpg';
import drink1 from '../assets/drink10.jpg';
import drink4 from '../assets/drink1.jpeg';
import classes from './Home.module.css';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Modal from 'react-modal';
import { FaPlay } from 'react-icons/fa'; // Ícone de play
import 'aos/dist/aos.css';
import AOS from 'aos';
import LazyLoad from 'react-lazy-load';

// Custom Arrows for Slider
const CustomPrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${classes.customArrow}`}
      style={{ ...style, display: "block", left: "10px" }}
      onClick={onClick}
    />
  );
};

const CustomNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${classes.customArrow}`}
      style={{ ...style, display: "block", right: "10px" }}
      onClick={onClick}
    />
  );
};

function Home() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    draggable: true,
  };

  const openModal = () => {
    console.log("Modal aberto");
    setModalIsOpen(true);
  };
  
  const closeModal = () => setModalIsOpen(false);

  // EFFEITO DE APARECER 
  useEffect(() => {
    AOS.init({
      duration: 1000, // Duração da animação em milissegundos
      easing: 'ease-in-out', // Tipo de easing
    });
  }, []);
  return (
    <>
      {/* Slider Section */}
      <main className={classes.home}>
      <div className={classes.homeContent}>
        <Slider {...settings} className={classes.imgHome}>
          <div className={classes.slide}>
            <div className={classes.imgContainer}>
            <LazyLoad>
                  <img src={drink1} alt="Drink 1" className={classes.img} />
                </LazyLoad>
            </div>
          </div>
          <div className={classes.slide}>
            <div className={classes.imgContainer}>
            <LazyLoad>
                  <img src={drink2} alt="Drink 2" className={classes.img} />
                </LazyLoad>
            </div>
          </div>
          <div className={classes.slide}>
            <div className={classes.imgContainer}>
            <LazyLoad>
                  <img src={drink3} alt="Drink 3" className={classes.img} />
                </LazyLoad>
              </div>
          </div>
        </Slider>

        {/* Content Section */}
        <div className={classes.contentHome}>
          <h1>Bem Vindo Ao <span>Vincci PUB</span></h1>
          <h3>Deliciosos Drinks</h3>
          <div className={classes.btn}>
            <Link to="#">Nossos Serviços</Link>
            <Link to="/Pacotes/">Faça Seu Pedido</Link>
          </div>
        </div>

        {/* Video Section */}
        <div className={classes.video}>
          <div className={classes.videoContainer}>
          <div className={classes.iconContainer}>
            <div className={classes.bola}></div>
            <FaPlay className={classes.playIcon} onClick={openModal} />
          </div>
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              shouldCloseOnOverlayClick={true}
              className={classes.videoModal}
              overlayClassName={classes.videoModalOverlay}
              contentLabel="Video Modal"
            >
              <button onClick={closeModal} className={classes.closeButton}>X</button>
              <iframe
                src="https://www.youtube.com/embed/LXb3EKWsInQ"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </Modal>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className={classes.section}>
  <div className={classes.sectionTitle} data-aos="fade-up">
    <h1>Serviços <span>________</span></h1>
    <h2>Drinks com e sem álcool</h2>
  </div>
  <div className={classes.container}>
    <div className={classes.cardItem} data-aos="fade-up" data-aos-delay="100">
      <span><i className="bi bi-cup-straw"></i></span>
      <h4>Bar de caipirinhas</h4>
      <p>Diversas outras combinações de Frutas e Especiarias para Caipirinhas que agradarão todos os seus convidados!</p>
      <Link to="/Pacotes/">Ver Preços</Link>
    </div>
    <div className={classes.cardItem} data-aos="fade-up" data-aos-delay="100">
      <span><i className="bi bi-cup-straw"></i></span>
      <h4>Coquetéis Clássicos</h4>
      <p>Gin Tônica, Aperol Spritz e diversos outros drinks perfeitos para festas que demandam Elegância e Sofisticação.</p>
      <Link to="/Pacotes/">Ver Preços</Link>
    </div>
    <div className={classes.cardItem} data-aos="fade-up" data-aos-delay="100">
      <span><i className="bi bi-cup-straw"></i></span>
      <h4>Drinks Sem Álcool</h4>
      <p>Grande variedade de Drinks e sabores não alcoólicos para agradar à todos os paladares e conquistar todos os seus convidados. Sem exceções.</p>
      <Link to="/Pacotes/">Ver Preços</Link>
    </div>
  </div>
</section>


      {/* Main Section */}
     <section className={classes.contrateSection}>
        <div className={classes.content}>
          <p className={classes.contrateNos}></p>
          <h3>Sua festa tratada com</h3>
          <h4>Profissionalismo e Respeito</h4>
          <p>Bartenders para aniversários, casamentos, ou qualquer outra comemoração importante para você.
            Estamos prontos para servir todos os seus convidados
            com deliciosos drinks com e sem álcool. Conte com os melhores bartenders para o 
            melhor dia da sua vida!</p>
          <div className={classes.contentBtn}>
            <Link to="/Pacotes/">CONTRATE A VINCCI PUB</Link>
          </div>
        </div>
        <div className={classes.contentvideo}>
          <iframe
            src="https://www.youtube.com/embed/GwS5ASoSQos"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
</section>
      {/* Packages Section */}
      <section className={classes.sectionPacotes}>
  <div className={classes.pacoteTitle} data-aos="fade-up" data-aos-delay="200">
    <h1>Pacotes <span>________</span></h1>
    <h2>Encontre o pacote de drinks ideal para a sua festa</h2>
  </div>
  <div className={classes.sectionContainer} data-aos="fade-left" data-aos-delay="200">
    <div className={classes.pacotes}>
          <LazyLoad>
              <img src={drink1} alt="Pacote 1" />
         </LazyLoad>
      <h2>Drinks sem álcool</h2>
      <p>Bartenders para festas, São Paulo</p>
      <div className={classes.pacotePreco}>
        <p>A partir de R$550,00</p>
      </div>
      <Link to="/Pacotes/">SAIBA MAIS</Link>
    </div>
    <div className={classes.pacotes}>
        <LazyLoad>
              <img src={drink2} alt="Pacote 2" />
          </LazyLoad>
      <h2>Barman + lista de compras</h2>
      <p>Bartenders para festas, São Paulo</p>
      <div className={classes.pacotePreco}>
        <p>A partir de R$1.689,99</p>
      </div>
      <Link to="/Pacotes/">SAIBA MAIS</Link>
    </div>
    <div className={classes.pacotes}>
    <LazyLoad>
                <img src={drink3} alt="Pacote 3" />
              </LazyLoad>
      <h2>Drinks com e sem álcool</h2>
      <p>Bartenders para festas, São Paulo</p>
      <div className={classes.pacotePreco}>
        <p>A partir de R$550,00</p>
      </div>
      <Link to="/Pacotes/">SAIBA MAIS</Link>
    </div>
  </div>
  <div className={classes.maispacote}>
    <Link to="/Pacotes/">VEJA MAIS PACOTES PARA FESTAS</Link>
  </div>
</section>

      {/* About Section */}
      <section className={classes.sobreSection}>
        <div className={classes.sobre}>
          <p className={classes.sobreNos}>Buscando eventos de qualidade?</p>
          <h3>MUITO PRAZER, SOMOS A <span>VINCCI PUB</span></h3>
          <h5>Fundada em 2003, a <span>vincci</span> tem como missão oferecer o melhor ambiente e 
            estrutura para que você possa se divertir. Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, molestias esse! Accusamus quibusdam quam suscipit reprehenderit consequuntur? Commodi id hic ipsam ducimus neque quasi</h5>
          <div className={classes.sobreBtn}>
            <Link to="/sobre/">SAIBA MAIS</Link>
          </div>
        </div>
        <div className={classes.sobrefotos}>
        <LazyLoad>
              <img src={drink4} alt="Sobre" />
            </LazyLoad>
        </div>
        </section>

        <section className={classes.sectionBartenders}>
  <div className={classes.conhecerAmbiente} data-aos="fade-up">
    <figure>
    <LazyLoad>
      <iframe
        src="https://www.youtube.com/embed/qH4Cge_ED-4?autoplay=1"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
        </LazyLoad>
    </figure>
    <figcaption className={classes.frase} data-aos="fade-up" data-aos-delay="100">
      Conheça os Nossos Bartenders
    </figcaption>
  </div>

  <div className={classes.detalhes} data-aos="fade-up" data-aos-delay="200">
    <figcaption className={classes.contentDetalhes}>
      <h1>Vinicius Lima</h1>
      <ul className={classes.listaDetalhes}>
        <li className={classes.list}>Bartender</li>
        <li className={classes.list}>Especialista em Caipirinhas</li>
        <li className={classes.list}>Gosta De Surpreender</li>
        <li className={classes.list}>Organizado</li>
        <li className={classes.listEspecial}>E muito mais...</li>
      </ul>
    </figcaption>
    <figure data-aos="fade-left" data-aos-delay="200">
    <LazyLoad>
                <img src={drink2} alt="foto" />
              </LazyLoad>
    </figure>
  </div>

  <div className={classes.objetos} data-aos="fade-up" data-aos-delay="200">
    <figure data-aos="fade-right" data-aos-delay="500">
    <LazyLoad>
                <img src={drink4} alt="foto" />
              </LazyLoad>
    </figure>
    <figcaption className={classes.objetosItens} data-aos="fade-left" data-aos-delay="600">
      <h1>Henrique Lima</h1>
      <ul className={classes.listaObjetos}>
        <li>Bartender</li>
        <li>Especialista Em Chupeta</li>
        <li>Gosta De Viciar</li>
        <li>Comunicativo</li>
        <li className={classes.liBold}>E muito mais....</li>
      </ul>
    </figcaption>
  </div>
</section>


      </main>
    </>
  );
}

export default Home;
