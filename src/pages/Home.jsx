import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import drink3 from '../assets/drink7.jpg';
import drink2 from '../assets/drink6.jpg';
import drink1 from '../assets/drink10.jpg';
import drink4 from '../assets/drink1.jpeg';
import classes from './Home.module.css';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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

// Array of hero slider images
const heroImages = [drink1, drink2, drink3];

// Function to extract dominant color from bottom of image
const extractBottomColor = (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Analyze the bottom 15% of the image
      const bottomHeight = Math.floor(img.height * 0.15);
      const startY = img.height - bottomHeight;
      const imageData = ctx.getImageData(0, startY, img.width, bottomHeight);
      
      // Calculate average color
      let r = 0, g = 0, b = 0;
      const pixels = imageData.data;
      const pixelCount = pixels.length / 4;
      
      for (let i = 0; i < pixels.length; i += 4) {
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
      }
      
      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);
      
      resolve(`rgb(${r}, ${g}, ${b})`);
    };
    img.onerror = () => {
      // Fallback color if image fails to load
      resolve('#000000');
    };
    img.src = imageSrc;
  });
};

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
  const [highlightedDrinks, setHighlightedDrinks] = useState([]);
  const [loadingDrinks, setLoadingDrinks] = useState(true);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dynamic gradient state
  const [slideColors, setSlideColors] = useState([]);
  const [currentSlideColor, setCurrentSlideColor] = useState('#000000');
  const slideColorsRef = useRef([]);

  // Extract colors from hero images on mount
  useEffect(() => {
    Promise.all(heroImages.map(extractBottomColor)).then(colors => {
      console.log('Extracted colors:', colors);
      setSlideColors(colors);
      slideColorsRef.current = colors;
      if (colors.length > 0) {
        setCurrentSlideColor(colors[0]);
      }
    });
  }, []);

  const handleSlideChange = useCallback((index) => {
    console.log('Slide changed to:', index, 'Color:', slideColorsRef.current[index]);
    if (slideColorsRef.current[index]) {
      setCurrentSlideColor(slideColorsRef.current[index]);
    }
  }, []);

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
    afterChange: handleSlideChange,
  };

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

  // Dynamic gradient based on current slide color
  const dynamicGradient = `linear-gradient(180deg, ${currentSlideColor} 0%, #0A0503 10%, #150903 25%, #190A03 35%, #482D20 55%, #8B7D6F 78%, #FFF5E9 100%)`;

  return (
    <>
      {/* Slider Section */}
      <main className={classes.home} style={{ background: dynamicGradient }}>
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
            <Link to="/sobre">Saiba Mais</Link>
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
          <h1>Coquetéis <span>________</span></h1>
          <h2>[TEXTO A DEFINIR - aguardando Vini/Henrique]</h2>
        </div>
        
        {loadingDrinks ? (
          <div className={classes.loadingDrinks}>
            <Loader2 className="animate-spin" size={32} />
            <p>Carregando coquetéis...</p>
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
              <CarouselContent>
                {highlightedDrinks.map((drink) => (
                  <CarouselItem 
                    key={drink.id} 
                    className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-4"
                  >
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
            <p>Nenhum coquetel em destaque no momento.</p>
          </div>
        )}
        
        <div className={classes.maispacote}>
          <Link to="/drinks/">VEJA MAIS COQUETÉIS PARA SUA FESTA</Link>
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
