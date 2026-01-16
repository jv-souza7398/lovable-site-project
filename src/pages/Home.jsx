import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import drink3 from "../assets/drink7.jpg";
import drink2 from "../assets/drink6.jpg";
import drink1 from "../assets/drink10.jpg";
import drink4 from "../assets/drink1.jpeg";
import classes from "./Home.module.css";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Plus, Check, Loader2 } from "lucide-react";
import "aos/dist/aos.css";
import AOS from "aos";
import LazyLoad from "react-lazy-load";
import { supabase } from "@/integrations/supabase/client";
import { CartContext } from "../contexts/CartContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import DrinkDetailsModal from "../components/DrinkDetailsModal";

// Array of hero slider images with fallback colors
const heroImages = [
  { src: drink1, fallbackColor: "rgb(139, 69, 46)" }, // Warm brown/orange
  { src: drink2, fallbackColor: "rgb(89, 54, 36)" }, // Dark brown
  { src: drink3, fallbackColor: "rgb(45, 35, 30)" }, // Deep brown
];

// Utility function to darken a color for better gradient blending
const darkenColor = (r, g, b, factor = 0.7) => {
  return {
    r: Math.floor(r * factor),
    g: Math.floor(g * factor),
    b: Math.floor(b * factor),
  };
};

// Utility function to desaturate a color (move towards gray)
const desaturateColor = (r, g, b, factor = 0.8) => {
  const gray = (r + g + b) / 3;
  return {
    r: Math.floor(r + (gray - r) * (1 - factor)),
    g: Math.floor(g + (gray - g) * (1 - factor)),
    b: Math.floor(b + (gray - b) * (1 - factor)),
  };
};

// Function to extract dominant color from bottom of image using weighted sampling
const extractBottomColor = (imageData) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Use smaller canvas for performance
        const scale = Math.min(1, 200 / img.width);
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Analyze the bottom 20% of the image
        const bottomHeight = Math.floor(canvas.height * 0.2);
        const startY = canvas.height - bottomHeight;
        const pixelData = ctx.getImageData(0, startY, canvas.width, bottomHeight);

        // Use color bucketing for more accurate dominant color
        const colorBuckets = {};
        const pixels = pixelData.data;

        for (let i = 0; i < pixels.length; i += 4) {
          // Round colors to reduce noise (bucket size of 16)
          const r = Math.floor(pixels[i] / 16) * 16;
          const g = Math.floor(pixels[i + 1] / 16) * 16;
          const b = Math.floor(pixels[i + 2] / 16) * 16;

          // Skip very dark or very bright pixels
          const brightness = (r + g + b) / 3;
          if (brightness < 20 || brightness > 240) continue;

          const key = `${r},${g},${b}`;
          colorBuckets[key] = (colorBuckets[key] || 0) + 1;
        }

        // Find the most frequent color
        let dominantColor = { r: 0, g: 0, b: 0 };
        let maxCount = 0;

        for (const [key, count] of Object.entries(colorBuckets)) {
          if (count > maxCount) {
            maxCount = count;
            const [r, g, b] = key.split(",").map(Number);
            dominantColor = { r, g, b };
          }
        }

        // If no valid color found, calculate average
        if (maxCount === 0) {
          let rSum = 0,
            gSum = 0,
            bSum = 0;
          const pixelCount = pixels.length / 4;

          for (let i = 0; i < pixels.length; i += 4) {
            rSum += pixels[i];
            gSum += pixels[i + 1];
            bSum += pixels[i + 2];
          }

          dominantColor = {
            r: Math.floor(rSum / pixelCount),
            g: Math.floor(gSum / pixelCount),
            b: Math.floor(bSum / pixelCount),
          };
        }

        // Desaturate slightly and darken for better gradient blending
        const desaturated = desaturateColor(dominantColor.r, dominantColor.g, dominantColor.b, 0.85);
        const darkened = darkenColor(desaturated.r, desaturated.g, desaturated.b, 0.6);

        const finalColor = `rgb(${darkened.r}, ${darkened.g}, ${darkened.b})`;
        console.log(`Extracted color for image: ${finalColor}`);
        resolve(finalColor);
      } catch (error) {
        console.warn("Error extracting color:", error);
        resolve(imageData.fallbackColor || "#000000");
      }
    };

    img.onerror = () => {
      console.warn("Failed to load image for color extraction");
      resolve(imageData.fallbackColor || "#000000");
    };

    img.src = imageData.src;
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
  description: dbDrink.descricao?.substring(0, 50) + (dbDrink.descricao?.length > 50 ? "..." : ""),
  descricao: dbDrink.descricao,
  videoUrl: dbDrink.video_url,
  caracteristicas: (dbDrink.caracteristicas || []).map((c) => ({
    nome: c.nome,
    nivel: c.nivel,
    max: 5,
  })),
  ingredientes: dbDrink.ingredientes || [],
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
      <img src={item.img} alt={item.title} onClick={() => onImageClick(item)} style={{ cursor: "pointer" }} />
      <h2>{item.title}</h2>
      <p>{item.description}</p>
      <button
        type="button"
        className={`${classes.addButton} ${added ? classes.added : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAdd();
        }}
        aria-label={`Adicionar ${item.title} ao carrinho`}
      >
        {added ? <Check size={16} /> : <Plus size={16} />}
        <span>{added ? "Adicionado" : "Adicionar"}</span>
      </button>
    </div>
  );
};

function Home() {
  const navigate = useNavigate();
  const [highlightedDrinks, setHighlightedDrinks] = useState([]);
  const [loadingDrinks, setLoadingDrinks] = useState(true);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic gradient state
  const [slideColors, setSlideColors] = useState([]);
  const [currentSlideColor, setCurrentSlideColor] = useState("#000000");
  const slideColorsRef = useRef([]);

  // Extract colors from hero images on mount
  useEffect(() => {
    Promise.all(heroImages.map(extractBottomColor)).then((colors) => {
      console.log("Extracted colors:", colors);
      setSlideColors(colors);
      slideColorsRef.current = colors;
      if (colors.length > 0) {
        setCurrentSlideColor(colors[0]);
      }
    });
  }, []);

  const handleSlideChange = useCallback((index) => {
    console.log("Slide changed to:", index, "Color:", slideColorsRef.current[index]);
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
      const { data, error } = await supabase.from("drinks").select("*").eq("destacar_home", true).order("nome");

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
      easing: "ease-in-out",
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
  // Creates a smooth transition from the image's dominant color to the site's original colors
  const dynamicGradient = `linear-gradient(180deg, 
    ${currentSlideColor} 0%, 
    ${currentSlideColor}99 5%,
    #0A0503 15%, 
    #150903 30%, 
    #190A03 40%, 
    #482D20 55%, 
    #8B7D6F 78%, 
    #FFF5E9 100%)`;

  return (
    <>
      {/* Slider Section */}
      <main className={classes.home} style={{ background: dynamicGradient }}>
        <div className={classes.homeContent}>
          <Slider {...settings} className={classes.imgHome}>
            {heroImages.map((imageData, index) => (
              <div className={classes.slide} key={index}>
                <div className={classes.imgContainer}>
                  <LazyLoad>
                    <img src={imageData.src} alt={`Drink ${index + 1}`} className={classes.img} />
                  </LazyLoad>
                </div>
              </div>
            ))}
          </Slider>

          {/* Content Section */}
          <div className={classes.contentHome}>
            <h1>Coquetelaria autoral</h1>
            <h3>para eventos exclusivos</h3>
            <div className={classes.btn}>
              <Link to="/sobre">Conheça a Vincci</Link>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <section className={classes.section}>
          <div className={classes.sectionTitle} data-aos="fade-up">
            <h1>
              Serviços <span>________</span>
            </h1>
          </div>
          <div className={classes.container}>
            <div
              className={classes.cardItem}
              data-aos="fade-up"
              data-aos-delay="100"
              onClick={() => navigate("/sobre#servicos")}
              style={{ cursor: "pointer" }}
            >
              <span>
                <i className="bi bi-cup-straw"></i>
              </span>
              <h4>Bar de caipirinhas</h4>
              <p>
                Diversas outras combinações de Frutas e Especiarias para Caipirinhas que agradarão todos os seus
                convidados!
              </p>
            </div>
            <div className={classes.serviceDescription} data-aos="fade-up" data-aos-delay="200">
              <p>
                Na Vincci, oferecemos uma experiência completa de bar para o seu evento. Desde coquetéis clássicos até
                drinks personalizados, nossa equipe de bartenders profissionais está pronta para surpreender seus
                convidados com sabores únicos e atendimento de excelência.
              </p>
              <p>
                Trabalhamos com drinks alcoólicos e não alcoólicos, garantindo que todos os seus convidados sejam bem
                atendidos. Cada evento é único, e nosso compromisso é oferecer qualidade e sofisticação em cada taça
                servida.
              </p>
            </div>
          </div>
        </section>

        {/* Main Section */}
        <section className={classes.contrateSection}>
          <div className={classes.content}>
            <p className={classes.contrateNos}></p>
            <h3>Sua festa tratada com</h3>
            <h4>Profissionalismo e Respeito</h4>
            <p>
              Bartenders para aniversários, casamentos, ou qualquer outra comemoração importante para você. Estamos
              prontos para servir todos os seus convidados com deliciosos drinks com e sem álcool. Conte com os melhores
              bartenders para o melhor dia da sua vida!
            </p>
            <div className={classes.contentBtn}>
              <Link to="/Pacotes/">CONTRATE A VINCCI BAR</Link>
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
            <h1>
              Coquetéis <span>________</span>
            </h1>
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
                    <CarouselItem key={drink.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-4">
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

      <DrinkDetailsModal drink={selectedDrink} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}

export default Home;
