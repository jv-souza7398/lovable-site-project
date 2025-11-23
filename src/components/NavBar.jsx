import { Link } from 'react-router-dom'
import classes from './NavBar.module.css'

import logo from '../assets/Vincci.jpg'

function Navbar() {
  return (
    <div className={classes.content}>   
      <nav className={classes.navbarContent}>
        <div className={classes.logo}>
       <span><img  src={logo} /></span>
    <h1> VINCCI PUB</h1>
    </div>
        <div className={classes.navItens} >
        <ul>
          <Link to={"#"}><i class="bi bi-search"></i></Link>
          <li><Link>HOME</Link></li>
          <li><Link to={"/Pacotes/"}>PACOTES</Link></li>
             <Link to={"#"}><img src={logo} className={classes.logoImg}/></Link>
              <li><Link to={"/sobre/"}>SOBRE NÓS</Link></li>   
      
          <li><Link to={"/fale-conosco/"}>FALE CONOSCO</Link></li>
         </ul>
         </div> 
          <div className={classes.servicos}>
          <Link to={"/Minha Conta/"}><i class="bi bi-person"></i></Link>
          <Link to={"/Carrinho/"}><i class="bi bi-cart"></i></Link>    
          </div>
      </nav>
  </div>
  )
}

export default Navbar