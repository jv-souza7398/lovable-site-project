import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.jsx'
import FaleConosco from './pages/faleConosco.jsx'
import Sobre from './pages/Sobre.jsx'
import PoliticaPrivacidade from './pages/PoliticaPrivacidade.jsx'
import Pacotes from './pages/Pacotes.jsx'
import Drinks from './pages/Drinks.jsx'
import Images from './pages/images.jsx'
import Account from './pages/Account.jsx'
import Identificacao from './pages/Identificacao.jsx'
import Login from './pages/Login.jsx'
import Orçamento from './pages/Orçamento.jsx'
import Checkout from './pages/Checkout.jsx'
import Carrinho from './pages/Carrinho.jsx'
import SelectPaymentMethod from './pages/SelectPaymentMethod.jsx'
import ProcessPayment from './pages/ProcessPayment.jsx'
import ProcessPixPayment from './pages/ProcessPixPayment.jsx'
import Billing from './pages/Billing.jsx'
import Completion from './pages/Completion.jsx'

// Admin imports
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminDrinksPage from './pages/admin/AdminDrinksPage.jsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx'
import AdminDashsPage from './pages/admin/AdminDashsPage.jsx'

import { register } from 'swiper/element/bundle'
register()

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import { CartProvider } from './contexts/CartContext.jsx';
import { AccountProvider } from './contexts/AccountContext.jsx';
import { AdminAuthProvider } from './contexts/AdminAuthContext.jsx';
import LayoutZap from './components/LayoutZap.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/fale-conosco/",
        element: <FaleConosco />
      },
      {
        path: "/sobre/",
        element: <Sobre />
      },
      {
        path: "/Politica-Privacidade/",
        element: <PoliticaPrivacidade />
      },
      {
        path: "/Pacotes/",
        element: <Pacotes />
      },
      {
        path: "/drinks/",
        element: <Drinks />
      },
      {
        path: "/images/",
        element: <Images />
      },
      {
        path: "Orçamento/:title",
        element: <Orçamento />
      },
      {
        path: "/Identificação/",
        element: <Identificacao />
      },
      {
        path: "/Login/",
        element: <Login />
      },
      {
        path: "/Checkout/",
        element: <Checkout />
      },
      {
        path: "/Carrinho/",
        element: <Carrinho />
      },
      {
        path: "/SelectPaymentMethod/",
        element: <SelectPaymentMethod />
      },
      {
        path: "/ProcessPayment/",
        element: <ProcessPayment />
      },
      {
        path: "/ProcessPixPayment/",
        element: <ProcessPixPayment />
      },
      {
        path: "/billing/",
        element: <Billing />
      },
      {
        path: "/completion/",
        element: <Completion />
      },
      {
        path: "/Minha-Conta/",
        element: <Account />
      }
    ]
  },
  // Admin routes
  {
    path: "/admin/login",
    element: <AdminLogin />
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "drinks",
        element: <AdminDrinksPage />
      },
      {
        path: "users",
        element: <AdminUsersPage />
      },
      {
        path: "dashs",
        element: <AdminDashsPage />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LayoutZap>
      <AdminAuthProvider>
        <AccountProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AccountProvider>
      </AdminAuthProvider>
    </LayoutZap>
  </React.StrictMode>,
)
