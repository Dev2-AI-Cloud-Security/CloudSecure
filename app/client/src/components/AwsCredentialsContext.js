import { createContext, useContext, useState } from 'react';

// Create the context
const AwsCredentialsContext = createContext();

// Create a provider component
export const AwsCredentialsProvider = ({ children }) => {
  const [awsCredentials, setAwsCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
  });

  return (
    <AwsCredentialsContext.Provider value={{ awsCredentials, setAwsCredentials }}>
      {children}
    </AwsCredentialsContext.Provider>
  );
};

// Hook to use the context
export const useAwsCredentials = () => useContext(AwsCredentialsContext);