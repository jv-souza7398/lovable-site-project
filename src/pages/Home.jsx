import React, { useState, useEffect, useContext } from 'react';
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
import { FaPlay } from 'react-icons/fa';
import { Plus, Check, Loader2 } from 'lucide-react';
import 'aos/dist/aos.css';
import AOS from 'aos';
import LazyLoad from 'react-lazy-load';
import { supabase } from '@/integrations/supabase/client';
import { CartContext } from '../contexts/CartContext';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '../components/ui/carousel';
import DrinkDetailsModal from '../components/DrinkDetailsModal';

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

// Helper function to map database drinks to component format
const mapDrinkFromDB = (dbDrink) => ({
  id: dbDrink.id,
  img: dbDrink.imagem_url,
  title: dbDrink.nome,
  description: dbDrink.descricao?.substring(0, 50) + (dbDrink.descricao?.length > 50 ? '...' : ''),
  descricao: dbDrink.descricao,
  videoUrl: dbDrink.video_url,
  caracteristicas: (dbDrink.caracteristicas || []).map(c => ({
    nome: c.nome,
    nivel: c.nivel,
    max: 5
  })),
  ingredientes: dbDrink.ingredientes || []
});

// DrinkCard component for carousel
const DrinkCard = ({ item, onImageClick }) => {
  const { addDrinkToCart } = useContext(CartContext);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addDrinkToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 500);
  };

  return (
    <div className={classes.drinkCard}>
      <img 
        src={item.img} 
        alt={item.title} 
        onClick={() => onImageClick(item)}
        style={{ cursor: 'pointer' }}
      />
      <h2>{item.title}</h2>
      <p>{item.description}</p>
      <button 
        type="button"
        className={`${classes.addButton} ${added ? classes.added : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAdd();
        }}
        aria-label={`Adicionar ${item.title} ao carrinho`}
      >
        {added ? <Check size={16} /> : <Plus size={16} />}
        <span>{added ? 'Adicionado' : 'Adicionar'}</span>
      </button>
    </div>
  );
};

function Home() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [highlightedDrinks, setHighlightedDrinks] = useState([]);
  const [loadingDrinks, setLoadingDrinks] = useState(true);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDrinkClick = (drink) => {
    setSelectedDrink(drink);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDrink(null);
  };

  // Fetch highlighted drinks
  useEffect(() => {
    const fetchHighlightedDrinks = async () => {
      setLoadingDrinks(true);
      const { data, error } = await supabase
        .from('drinks')
        .select('*')
        .eq('destacar_home', true)
        .order('nome');

       if (!error && data) {
         setHighlightedDrinks(data.map(mapDrinkFromDB));

         // Os elementos do carrossel são renderizados APÓS o fetch.
         // Sem refresh, o AOS pode manter o bloco com opacity: 0.
         requestAnimationFrame(() => {
           try {
             AOS.refresh();
           } catch {
             // ignore
           }
         });
       }
       setLoadingDrinks(false);
    };

    fetchHighlightedDrinks();
  }, []);

  // EFFEITO DE APARECER 
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
    });
  }, []);

  // Quando os drinks chegam (renderizam depois do fetch), o AOS precisa re-varrer
  // os elementos com data-aos; senão eles podem ficar invisíveis (opacity: 0).
  useEffect(() => {
    if (loadingDrinks) return;

    requestAnimationFrame(() => {
      try {
        AOS.refreshHard();
      } catch {
        // ignore
      }
    });
  }, [loadingDrinks, highlightedDrinks.length]);
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
    <h1>Drinks <span>________</span></h1>
    <h2>Encontre o drink ideal para a sua festa</h2>
  </div>
  
  {loadingDrinks ? (
    <div className={classes.loadingDrinks}>
      <Loader2 className="animate-spin" size={32} />
      <p>Carregando drinks...</p>
    </div>
  ) : highlightedDrinks.length > 0 ? (
    <div className={classes.drinksCarouselWrapper} data-aos="fade-left" data-aos-delay="200">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className={classes.drinksCarousel}
      >
        <CarouselContent className={classes.carouselContent}>
          {highlightedDrinks.map((drink) => (
            <CarouselItem key={drink.id} className={classes.carouselItem}>
              <DrinkCard item={drink} onImageClick={handleDrinkClick} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={classes.carouselButton} />
        <CarouselNext className={classes.carouselButton} />
      </Carousel>
    </div>
  ) : (
    <div className={classes.emptyDrinks}>
      <p>Nenhum drink em destaque no momento.</p>
    </div>
  )}
  
  <div className={classes.maispacote}>
    <Link to="/drinks/">VEJA MAIS DRINKS PARA SUA FESTA</Link>
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

      <DrinkDetailsModal
        drink={selectedDrink}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default Home;
