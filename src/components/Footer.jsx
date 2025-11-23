import classes from './Footer.module.css'

import { Link } from 'react-router-dom'
import logo from '../assets/Vincci.jpg'

function Footer() {
  return (
    <footer className={classes.footer}>
      <div className={classes.dados}> 
      <h2>SIGA NOSSAS REDES SOCIAIS</h2>
         <ul className={classes.contatos}>
            <li><a href="#"><i className="fa-brands fa-instagram"></i></a></li>   
           <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
        </ul>
         </div>
        <div className={classes.containerContatos}>
          <div className={classes.Imglogo}>
            <Link><img src={logo} /></Link>
          </div>
       <div className={classes.pagina}>
          <h4>PAGINAS</h4>
          <div className={classes.ContatosLinks}>
            <Link >Home</Link>  
            <Link to={"/sobre/"}>Sobre</Link>  
            <Link to={"/Orçamento-Eventos/"}>Orçamento</Link>  
          </div>
       </div>
       <div className={classes.LinkUtil}>
          <h4>LINKS ÚTEIS</h4>
          <div className={classes.ContatosLinks}>
            <Link to={"/Politica-Privacidade/"}>Politica e Privacidade</Link>  
            <Link to={"/fale-conosco/"}>SAC</Link>  
            <Link to={"/fale-conosco/"}>Fale conosco</Link>  
          </div>
       </div>
      </div>
        <div className={classes.direitos}>
          <ul >
            <li>© Vincci Pub 2024. Todos os direitos reservados. Desenvolvido Por <span> <Link to={"https://www.linkedin.com/in/rafael-moraes-13ba5b258/"}>Rafael Moraes</Link></span> </li>
          </ul>
          </div>
    </footer>   
  )
}

export default Footer