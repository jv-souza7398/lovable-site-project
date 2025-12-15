import React, { useContext, useState, useEffect } from 'react';
import classes from './DrinksTeste.module.css';
import drink8 from '../assets/drink8.jpg';
import drink9 from '../assets/drink9.jpg';
import drink10 from '../assets/drink10.jpg';
import drink11 from '../assets/drink11.jpg';
import { CartContext } from '../contexts/CartContext';
import { Plus, Check, Loader2 } from 'lucide-react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '../components/ui/carousel';
import DrinkDetailsModal from '../components/DrinkDetailsModal';
import { supabase } from '@/integrations/supabase/client';

const drinksSemAlcool = [
  { 
    id: 'sa-1', 
    img: drink10, 
    title: "Mocktail Tropical", 
    description: "Refrescante e saboroso",
    descricao: "Um drink tropical refrescante, perfeito para dias quentes. Combina frutas exóticas com um toque cítrico especial.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    caracteristicas: [
      { nome: "Doçura", nivel: 4, max: 5 },
      { nome: "Acidez", nivel: 2, max: 5 },
      { nome: "Amargor", nivel: 0, max: 5 },
      { nome: "Teor Alcoólico", nivel: 0, max: 5 },
      { nome: "Refrescância", nivel: 5, max: 5 }
    ],
    ingredientes: ["Suco de Maracujá", "Água de Coco", "Hortelã", "Limão", "Xarope de Açúcar"]
  },
  { 
    id: 'sa-2', 
    img: drink11, 
    title: "Virgin Mojito", 
    description: "Clássico sem álcool",
    descricao: "A versão sem álcool do clássico cubano. Refrescante com notas de hortelã e lima.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    caracteristicas: [
      { nome: "Doçura", nivel: 3, max: 5 },
      { nome: "Acidez", nivel: 3, max: 5 },
      { nome: "Amargor", nivel: 0, max: 5 },
      { nome: "Teor Alcoólico", nivel: 0, max: 5 },
      { nome: "Refrescância", nivel: 5, max: 5 }
    ],
    ingredientes: ["Água com Gás", "Hortelã Fresca", "Limão", "Açúcar Demerara"]
  },
  { 
    id: 'sa-3', 
    img: drink8, 
    title: "Fruit Punch", 
    description: "Mix de frutas tropicais",
    descricao: "Um punch vibrante com mix de frutas tropicais. Perfeito para celebrações.",
    caracteristicas: [
      { nome: "Doçura", nivel: 5, max: 5 },
      { nome: "Acidez", nivel: 2, max: 5 },
      { nome: "Amargor", nivel: 0, max: 5 },
      { nome: "Teor Alcoólico", nivel: 0, max: 5 },
      { nome: "Refrescância", nivel: 4, max: 5 }
    ],
    ingredientes: ["Suco de Laranja", "Suco de Abacaxi", "Grenadine", "Ginger Ale"]
  },
  { 
    id: 'sa-4', 
    img: drink9, 
    title: "Lemonade Especial", 
    description: "Limonada premium",
    caracteristicas: [
      { nome: "Doçura", nivel: 2, max: 5 },
      { nome: "Acidez", nivel: 4, max: 5 },
      { nome: "Amargor", nivel: 0, max: 5 },
      { nome: "Teor Alcoólico", nivel: 0, max: 5 },
      { nome: "Refrescância", nivel: 5, max: 5 }
    ]
  },
  { 
    id: 'sa-5', 
    img: drink10, 
    title: "Smoothie Mix", 
    description: "Vitaminas naturais",
    caracteristicas: [
      { nome: "Doçura", nivel: 4, max: 5 },
      { nome: "Acidez", nivel: 1, max: 5 },
      { nome: "Amargor", nivel: 0, max: 5 },
      { nome: "Teor Alcoólico", nivel: 0, max: 5 },
      { nome: "Refrescância", nivel: 3, max: 5 }
    ]
  },
  { 
    id: 'sa-6', 
    img: drink11, 
    title: "Mocktail Sunset", 
    description: "Visual impressionante",
    caracteristicas: [
      { nome: "Doçura", nivel: 3, max: 5 },
      { nome: "Acidez", nivel: 2, max: 5 },
      { nome: "Amargor", nivel: 0, max: 5 },
      { nome: "Teor Alcoólico", nivel: 0, max: 5 },
      { nome: "Refrescância", nivel: 4, max: 5 }
    ]
  },
  { 
    id: 'sa-7', 
    img: drink8, 
    title: "Chá Gelado Premium", 
    description: "Infusão especial",
    caracteristicas: [
      { nome: "Doçura", nivel: 2, max: 5 },
      { nome: "Acidez", nivel: 1, max: 5 },
      { nome: "Amargor", nivel: 2, max: 5 },
      { nome: "Teor Alcoólico", nivel: 0, max: 5 },
      { nome: "Refrescância", nivel: 4, max: 5 }
    ]
  },
];

const drinksPadroes = [
  { 
    id: 'dp-1', 
    img: drink8, 
    title: "Caipirinha Clássica", 
    description: "Tradição brasileira",
    descricao: "O drink mais famoso do Brasil. Cachaça, limão e açúcar em perfeita harmonia.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    caracteristicas: [
      { nome: "Doçura", nivel: 2, max: 5 },
      { nome: "Acidez", nivel: 4, max: 5 },
      { nome: "Amargor", nivel: 1, max: 5 },
      { nome: "Teor Alcoólico", nivel: 4, max: 5 },
      { nome: "Refrescância", nivel: 4, max: 5 }
    ],
    ingredientes: ["Cachaça", "Limão", "Açúcar", "Gelo"]
  },
  { 
    id: 'dp-2', 
    img: drink9, 
    title: "Mojito", 
    description: "Refrescante cubano",
    descricao: "Clássico cubano com rum, hortelã fresca e um toque de limão.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    caracteristicas: [
      { nome: "Doçura", nivel: 3, max: 5 },
      { nome: "Acidez", nivel: 3, max: 5 },
      { nome: "Amargor", nivel: 1, max: 5 },
      { nome: "Teor Alcoólico", nivel: 3, max: 5 },
      { nome: "Refrescância", nivel: 5, max: 5 }
    ],
    ingredientes: ["Rum Branco", "Hortelã", "Limão", "Açúcar", "Água com Gás"]
  },
  { 
    id: 'dp-3', 
    img: drink10, 
    title: "Margarita", 
    description: "Clássico mexicano",
    descricao: "O icônico coquetel mexicano com tequila, triple sec e limão.",
    caracteristicas: [
      { nome: "Doçura", nivel: 2, max: 5 },
      { nome: "Acidez", nivel: 4, max: 5 },
      { nome: "Amargor", nivel: 1, max: 5 },
      { nome: "Teor Alcoólico", nivel: 4, max: 5 },
      { nome: "Refrescância", nivel: 4, max: 5 }
    ],
    ingredientes: ["Tequila", "Triple Sec", "Suco de Limão", "Sal"]
  },
  { 
    id: 'dp-4', 
    img: drink11, 
    title: "Moscow Mule", 
    description: "Vodka e gengibre",
    caracteristicas: [
      { nome: "Doçura", nivel: 2, max: 5 },
      { nome: "Acidez", nivel: 2, max: 5 },
      { nome: "Amargor", nivel: 1, max: 5 },
      { nome: "Teor Alcoólico", nivel: 3, max: 5 },
      { nome: "Refrescância", nivel: 5, max: 5 }
    ],
    ingredientes: ["Vodka", "Cerveja de Gengibre", "Limão", "Gelo"]
  },
  { 
    id: 'dp-5', 
    img: drink8, 
    title: "Gin Tônica", 
    description: "Elegância britânica",
    caracteristicas: [
      { nome: "Doçura", nivel: 1, max: 5 },
      { nome: "Acidez", nivel: 2, max: 5 },
      { nome: "Amargor", nivel: 3, max: 5 },
      { nome: "Teor Alcoólico", nivel: 3, max: 5 },
      { nome: "Refrescância", nivel: 4, max: 5 }
    ],
    ingredientes: ["Gin", "Água Tônica", "Limão", "Especiarias"]
  },
  { 
    id: 'dp-6', 
    img: drink9, 
    title: "Whisky Sour", 
    description: "Sofisticado",
    caracteristicas: [
      { nome: "Doçura", nivel: 2, max: 5 },
      { nome: "Acidez", nivel: 4, max: 5 },
      { nome: "Amargor", nivel: 2, max: 5 },
      { nome: "Teor Alcoólico", nivel: 4, max: 5 },
      { nome: "Refrescância", nivel: 2, max: 5 }
    ],
    ingredientes: ["Whisky", "Suco de Limão", "Xarope Simples", "Clara de Ovo"]
  },
  { 
    id: 'dp-7', 
    img: drink10, 
    title: "Negroni", 
    description: "Italiano autêntico",
    caracteristicas: [
      { nome: "Doçura", nivel: 1, max: 5 },
      { nome: "Acidez", nivel: 1, max: 5 },
      { nome: "Amargor", nivel: 5, max: 5 },
      { nome: "Teor Alcoólico", nivel: 5, max: 5 },
      { nome: "Refrescância", nivel: 2, max: 5 }
    ],
    ingredientes: ["Gin", "Campari", "Vermute Rosso", "Casca de Laranja"]
  },
];

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

const DrinkCarousel = ({ title, items, onDrinkClick }) => (
  <div className={classes.carouselSection}>
    <h2 className={classes.categoryTitle}>{title}</h2>
    <div className={classes.carouselWrapper}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className={classes.carousel}
      >
        <CarouselContent className={classes.carouselContent}>
          {items.map((item) => (
            <CarouselItem key={item.id} className={classes.carouselItem}>
              <DrinkCard item={item} onImageClick={onDrinkClick} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={classes.carouselButton} />
        <CarouselNext className={classes.carouselButton} />
      </Carousel>
    </div>
  </div>
);

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

function DrinksTeste() {
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbDrinksSemAlcool, setDbDrinksSemAlcool] = useState([]);
  const [dbDrinksPadrao, setDbDrinksPadrao] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrinks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('drinks')
        .select('*')
        .order('nome');

      if (!error && data && data.length > 0) {
        const semAlcool = data
          .filter(d => d.categoria === 'drinks-sem-alcool')
          .map(mapDrinkFromDB);
        const padrao = data
          .filter(d => d.categoria === 'drinks-padrao')
          .map(mapDrinkFromDB);
        
        setDbDrinksSemAlcool(semAlcool);
        setDbDrinksPadrao(padrao);
      }
      setLoading(false);
    };

    fetchDrinks();
  }, []);

  const handleDrinkClick = (drink) => {
    setSelectedDrink(drink);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDrink(null);
  };

  // Use database drinks if available, otherwise fallback to hardcoded
  const displaySemAlcool = dbDrinksSemAlcool.length > 0 ? dbDrinksSemAlcool : drinksSemAlcool;
  const displayPadrao = dbDrinksPadrao.length > 0 ? dbDrinksPadrao : drinksPadroes;

  return (
    <>
      <div className={classes.navDrinks}>
        <h1>DRINKS - TESTE</h1>
      </div>
      {loading ? (
        <div className={classes.loadingState}>
          <Loader2 className="animate-spin" size={32} />
          <p>Carregando drinks...</p>
        </div>
      ) : (
        <section className={classes.section}>
          <DrinkCarousel title="DRINKS SEM ÁLCOOL" items={displaySemAlcool} onDrinkClick={handleDrinkClick} />
          <DrinkCarousel title="DRINKS PADRÕES" items={displayPadrao} onDrinkClick={handleDrinkClick} />
        </section>
      )}

      <DrinkDetailsModal
        drink={selectedDrink}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default DrinksTeste;
