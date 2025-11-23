
import React, { createContext, useState } from 'react';

export const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [AccountItems, setAccountItems] = useState([]);


const addToAccount = (newItem) => {
  setAccountItems((prevItems) => {
    const exists = prevItems.some(item => item.email === newItem.email);
    if (!exists) {
      return [...prevItems, newItem]; // Adiciona novo item se ele não existir
    }
    return prevItems; // Se o item já existe, retorna os itens antigos sem mudar nada
  });
};


  return (
    <AccountContext.Provider value={{ AccountItems, addToAccount }}>
      {children}
    </AccountContext.Provider>
  );
};
