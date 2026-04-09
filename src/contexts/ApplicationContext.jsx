import { createContext, useContext, useState } from "react";

const ApplicationContext = createContext();

export const useApplications = () => useContext(ApplicationContext);

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);

  // Submit a new application
  const submitApplication = (appData) => {
    setApplications(prev => [...prev, appData]);
  };

  // Approve or reject application (role flow removed)
  const updateApplicationStatus = (id, action) => {
    setApplications(prev => 
      prev.map(app => app.id === id 
        ? {
            ...app,
            status: action === "approve" ? "pending" : "rejected",
            logs: [...(app.logs || []), { action, date: new Date().toISOString() }]
          }
        : app
      )
    );
  };

  return (
    <ApplicationContext.Provider value={{ applications, submitApplication, updateApplicationStatus }}>
      {children}
    </ApplicationContext.Provider>
  );
};
