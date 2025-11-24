
import React, { createContext, useState } from 'react';

export const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [AccountItems, setAccountItems] = useState([]);
  const addToAccount = (newItem) => {
    setAccountItems((prevItems) => {
      const existingIndex = prevItems.findIndex(item => item.email === newItem.email);

      // Se não existir, adiciona novo cadastro
      if (existingIndex === -1) {
        return [...prevItems, newItem];
      }

      // Se já existir, atualiza os dados (incluindo CPF, telefone, etc.)
      const updatedItems = [...prevItems];
      updatedItems[existingIndex] = { ...prevItems[existingIndex], ...newItem };
      return updatedItems;
    });
  };


  return (
    <AccountContext.Provider value={{ AccountItems, addToAccount }}>
      {children}
    </AccountContext.Provider>
  );
};
