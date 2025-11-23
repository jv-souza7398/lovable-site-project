import React, { useState,useEffect,useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import drink8 from '../assets/drink8.jpg';
import drink9 from '../assets/drink9.jpg';
import drink10 from '../assets/drink10.jpg';
import drink11 from '../assets/drink11.jpg';
import classes from './Orçamento.module.css';
import Breadcrumbs from '../components/Breadcrumbs';
import AOS from 'aos';
import 'aos/dist/aos.css';

const menuItems = [
  { id: 1, img: drink10, title: "Drinks sem álcool", description: "Bartenders para festas, São Paulo", info: "Bartender para festa Open Bar em São Paulo com 12 opções de Drinks com e sem álcool.", price: "A partir de R$550,00" },
  { id: 2, img: drink11, title: "Barman + lista de compras", description: "Bartenders para festas, São Paulo", info: "Economize, pague apenas pela mão de obra de Barman para festa e receba uma lista sugestiva de compras.", price: "A partir de R$1.689,99" },
  { id: 3, img: drink8, title: "Drinks com e sem álcool", description: "Bartenders para festas, São Paulo", info: "6 opções de Drinks Clássicos + Festival de Caipirinhas com 3 frutas e 3 opções de destilados.", price: "A partir de R$1.889,99" },
  { id: 4, img: drink9, title: "Pacote de Drinks Clássicos", description: "Bartenders para festas, São Paulo", info: "6 opções de Drinks Clássicos + Festival de Caipirinhas com 3 frutas e 3 opções de destilados.", price: "A partir de R$550,00" },
];


const formatTitleForURL = (title) => {
  return title.toLowerCase().replace(/\s+/g, '-');
};

const Orçamento = () => {
  const [horario, setHorario] = useState('');
  const [convidados, setConvidados] = useState('');
  const [bartenders, setBartenders] = useState('');
  const [valorTotal, setValorTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mostrarValor, setMostrarValor] = useState(false); 
  const { addToCart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { title } = useParams();
  
  const formattedTitle = formatTitleForURL(title);
  const item = location.state?.item || menuItems.find(item => formatTitleForURL(item.title) === formattedTitle);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mainImage, setMainImage] = useState(item?.img || '');
  const thumbnails = [drink10, drink8, drink9, drink8, drink9, drink11];
  
  if (!item) {
    return <div>Item não encontrado</div>;
  }
  const breadcrumbs = [
    { label: 'Pacotes', url: '/Pacotes' },
    { label: item.title, url: `/Orçamento/${formatTitleForURL(item.title)}` },
    { label: 'Identificação', url: '#' }
  ];

  const handleThumbnailClick = (src) => {
    setMainImage(src);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % thumbnails.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + thumbnails.length) % thumbnails.length);
  };

  const getVisibleThumbnails = () => {
    const visibleThumbnails = [];
    for (let i = 0; i < 3; i++) {
      visibleThumbnails.push(thumbnails[(currentIndex + i) % thumbnails.length]);
    }
    return visibleThumbnails;
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  
//  CALCULAR VALOR 
const calcularValor = () => {
  let valor = 0;

  const valoresHorario = {
    '3': 200,
    '4': 300,
    '5': 400,
  };

  const valoresConvidados = {
    '50': 500,
    '100': 700,
    'Superior A 100': 1000,
  };

  const valoresBartenders = {
    '1': 150,
    '2': 250,
    'Superior A 2': 400,
  };

  valor += valoresHorario[horario] || 0;
  valor += valoresConvidados[convidados] || 0;
  valor += valoresBartenders[bartenders] || 0;

  setValorTotal(valor);
};

useEffect(() => {
  calcularValor();

  if (horario && convidados && bartenders) {
    setMostrarValor(true);
  } else {
    setMostrarValor(false);
  }
}, [horario, convidados, bartenders]);

// NAVEGAR PARA IDENTIFICACAO 
const handleContratarClick = () => {
   
  if (!horario || !convidados || !bartenders) {
    alert('Por favor, selecione todas as opções antes de continuar.');
    return;
  }
  const valorTotalFormatado = valorTotal.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Adiciona os itens ao carrinho
  const itemParaCarrinho = {
    item,
    horario,
    convidados,
    bartenders,
    valorTotalFormatado,
  };
  addToCart(itemParaCarrinho);

  // Navega para a página de Identificação
  navigate('/Identificação/', { 
    state: { 
      item,
      horario,
      convidados,
      bartenders,
      valorTotalFormatado, // Passar o valor formatado
    }  
  });
};

  // EFFEITO DE APARECER 
  useEffect(() => {
    AOS.init({
      duration: 1000, // Duração da animação em milissegundos
      easing: 'ease-in-out', // Tipo de easing
    });
  }, []);
  return (
    <>
      <section className={classes.Serviço}>
        <div className={classes.navOrcamento}>
          <h1>{item.title}</h1>
          <Breadcrumbs paths={breadcrumbs} />   
        </div>
        <div className={classes.servicos}>
          <div className={classes.carousel}>
            <div className={classes.mainImage}>
              <img src={mainImage} alt="Imagem Principal" onClick={handleOpenModal} />
              <button className={classes.enlargeButton} onClick={handleOpenModal}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(183, 143, 63)">
                  <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/>
                </svg>
              </button>
            </div>
            <div className={classes.thumbnailWrapper}>
              <button className={classes.navButton} onClick={handlePrev}>
                <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#e8eaed">
                  <path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z"/>
                </svg>
              </button>
              <div className={classes.thumbnailImages}>
                {getVisibleThumbnails().map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Miniatura ${index + 1}`}
                    className={classes.thumbnail}
                    onClick={() => handleThumbnailClick(src)}
                  />
                ))}
              </div>
              <button className={classes.navButton} onClick={handleNext}>
                <svg xmlns="http://www.w3.org/2000/svg" height="46px" viewBox="0 -960 960 960" width="46px" fill="#e8eaed">
                  <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                </svg>
              </button>
            </div>
          </div>
          {isModalOpen && (
            <div className={classes.modal} onClick={handleCloseModal}>
              <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
                <span className={classes.close} onClick={handleCloseModal}>&times;</span>
                <img src={mainImage} alt="Imagem Ampliada" className={classes.modalImage} />
              </div>
            </div>
          )}
       <section className={classes.servicoContent}>
      <h3>{item.title}</h3>
      <h2>Pacote {item.title}</h2>
      <p>{item.info}</p>
      <div className={classes.form}>
        <form action="#">
          <div className={classes.select}>
            <label htmlFor="Horario">Horário Da Festa:</label>
            <select name="Horario" id="Horario" value={horario} onChange={(e) => setHorario(e.target.value)} required>
              <option value="" disabled>Selecione o Horário</option>
              <option value="3">3 Horas</option>
              <option value="4">4 Horas</option>
              <option value="5">5 Horas</option>
            </select>
          </div>
          <div className={classes.select}>
            <label htmlFor="Convidados">Nº Convidados:</label>
            <select name="Convidados" id="Convidados" value={convidados} onChange={(e) => setConvidados(e.target.value)} required>
              <option value="" disabled>Selecione uma Opção</option>
              <option value="50">Até 50 pessoas</option>
              <option value="100">Até 100 pessoas</option>
              <option value="Superior A 100">Superior a 100 pessoas</option>
            </select>
          </div>
          <div className={classes.select}>
            <label htmlFor="Bartenders">Nº De Bartenders:</label>
            <select name="Bartenders" id="Bartenders" value={bartenders} onChange={(e) => setBartenders(e.target.value)} required>
              <option value="" disabled>Selecione uma Opção</option>
              <option value="1">Apenas 1</option>
              <option value="2">2 Bartenders</option>
              <option value="Superior A 2">Superior a 2 Bartenders</option>
            </select>
          </div>

          {/* Mostrar valor apenas se todos os selects estiverem selecionados */}
          {mostrarValor && (
            <div className={classes.valor}>
              <p>
                Valor: R${' '}
                {valorTotal
                  ? valorTotal.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '0,00'}
              </p>
            </div>
          )}
    
        </form>
        <button onClick={handleContratarClick}>CONTRATAR</button>
      </div>
    </section>
        </div>
        <section className={classes.section}>
          <div className={classes.sectionTitle} data-aos="fade-up">
            <h1>Drinks Inclusos<span>________</span></h1>
          </div>
          <article className={classes.sectionDrinks}>
            <div className={classes.drinks}>
              <span><i className="bi bi-cup-straw"></i></span>
              <h2>Nome Drink</h2>
              <p>Gin, Água Tônica e Laranja Bahia</p>
            </div>

            <div className={classes.drinks}>
              <span><i className="bi bi-cup-straw"></i></span>
              <h2>Nome Drink</h2>
              <p>Gin, Água Tônica e Laranja Bahia</p>
            </div>

            <div className={classes.drinks}>
              <span><i className="bi bi-cup-straw"></i></span>
              <h2>Nome Drink</h2>
              <p>Gin, Água Tônica e Laranja Bahia</p>
            </div>

            <div className={classes.drinks}>
              <span><i className="bi bi-cup-straw"></i></span>
              <h2>Nome Drink</h2>
              <p>Gin, Água Tônica e Laranja Bahia</p>
            </div>

            <div className={classes.drinks}>
              <span><i className="bi bi-cup-straw"></i></span>
              <h2>Nome Drink</h2>
              <p>Gin, Água Tônica e Laranja Bahia</p>
            </div>

            <div className={classes.drinks}>
              <span><i className="bi bi-cup-straw"></i></span>
              <h2>Nome Drink</h2>
              <p>Gin, Água Tônica e Laranja Bahia</p>
            </div>

            <div className={classes.drinks}>
              <span><i className="bi bi-cup-straw"></i></span>
              <h2>Nome Drink</h2>
              <p>Gin, Água Tônica e Laranja Bahia</p>
            </div>

            <div className={classes.drinks}>
              <span><i className="bi bi-cup-straw"></i></span>
              <h2>Nome Drink</h2>
              <p>Gin, Água Tônica e Laranja Bahia</p>
            </div>

            <div className={classes.drinks}>
              <span><i className="bi bi-cup-straw"></i></span>
              <h2>Nome Drink</h2>
              <p>Gin, Água Tônica e Laranja Bahia</p>
            </div>
          </article>
        </section>
      </section>
    </>
  );
};

export default Orçamento;



