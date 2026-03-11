import React, { createContext, useContext, useState } from 'react';

const PageTitleContext = createContext();

export const usePageTitle = () => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
};

export const PageTitleProvider = ({ children }) => {
  const [customTitle, setCustomTitle] = useState(null);
  const [customBreadcrumb, setCustomBreadcrumb] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'saved', 'error'

  return (
    <PageTitleContext.Provider value={{
      customTitle, setCustomTitle,
      customBreadcrumb, setCustomBreadcrumb,
      saveStatus, setSaveStatus
    }}>
      {children}
    </PageTitleContext.Provider>
  );
};
