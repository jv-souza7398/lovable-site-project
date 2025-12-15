import { Link, useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import classes from './NavBar.module.css'
import { AccountContext } from '../contexts/AccountContext'
import { CartContext } from '../contexts/CartContext'

import logo from '../assets/Vincci.jpg'

function Navbar() {
  const navigate = useNavigate();
  const { AccountItems } = useContext(AccountContext);
  const { getTotalDrinkCount } = useContext(CartContext);
  const totalDrinks = getTotalDrinkCount ? getTotalDrinkCount() : 0;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAccountClick = (e) => {
    e.preventDefault();
    
    // Verifica se o usuário está logado
    if (AccountItems && AccountItems.length > 0) {
      navigate('/Minha-Conta/');
    } else {
      navigate('/Login/');
    }
  };

  return (
    <div className={classes.content}>   
      <nav className={classes.navbarContent}>
        <div className={classes.logo}>
          <span><img  src={logo} /></span>
          <h1> VINCCI PUB</h1>
        </div>

        {/* Botão Hambúrguer */}
        <button 
          className={classes.hamburger} 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={menuOpen ? classes.open : ''}></span>
          <span className={menuOpen ? classes.open : ''}></span>
          <span className={menuOpen ? classes.open : ''}></span>
        </button>

        {/* Menu Desktop */}
        <div className={classes.navItens}>
          <ul>
            <Link to={"#"}><i className="bi bi-search"></i></Link>
            <li><Link to={"/"}>HOME</Link></li>
            <li><Link to={"/drinks-teste/"}>DRINKS</Link></li>
            <li><Link to={"/Pacotes/"}>PACOTES</Link></li>
            <Link to={"#"}><img src={logo} className={classes.logoImg}/></Link>
            <li><Link to={"/sobre/"}>SOBRE NÓS</Link></li>   
            <li><Link to={"/fale-conosco/"}>FALE CONOSCO</Link></li>
          </ul>
        </div> 

        {/* Ícones Desktop */}
        <div className={classes.servicos}>
          <a href="#" onClick={handleAccountClick}><i className="bi bi-person"></i></a>
          <Link to={"/Carrinho/"} className={classes.cartWrapper}>
            <i className="bi bi-cart"></i>
            {totalDrinks > 0 && <span className={classes.cartBadge}>{totalDrinks}</span>}
          </Link>
        </div>


        {/* Overlay Mobile */}
        {menuOpen && (
          <div 
            className={classes.overlay} 
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Menu Mobile */}
        <div className={`${classes.mobileMenu} ${menuOpen ? classes.mobileMenuOpen : ''}`}>
          <ul>
            <li><Link to={"/"} onClick={() => setMenuOpen(false)}>HOME</Link></li>
            <li><Link to={"/drinks-teste/"} onClick={() => setMenuOpen(false)}>DRINKS</Link></li>
            <li><Link to={"/Pacotes/"} onClick={() => setMenuOpen(false)}>PACOTES</Link></li>
            <li><Link to={"/sobre/"} onClick={() => setMenuOpen(false)}>SOBRE NÓS</Link></li>
            <li><Link to={"/fale-conosco/"} onClick={() => setMenuOpen(false)}>FALE CONOSCO</Link></li>
            <li>
              <a href="#" onClick={(e) => { handleAccountClick(e); setMenuOpen(false); }}>
                <i className="bi bi-person"></i> MINHA CONTA
              </a>
            </li>
            <li>
              <Link to={"/Carrinho/"} onClick={() => setMenuOpen(false)} className={classes.cartWrapper}>
                <i className="bi bi-cart"></i> CARRINHO
                {totalDrinks > 0 && <span className={classes.cartBadge}>{totalDrinks}</span>}
              </Link>
            </li>

          </ul>
        </div>
      </nav>
    </div>
  )
}

export default Navbar