import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { 
  DimoAuthProvider, 
  initializeDimoSDK 
} from "@dimo-network/login-with-dimo";

function MyApp({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      initializeDimoSDK({
        clientId: process.env.NEXT_PUBLIC_DIMO_CLIENT_ID || '',
        redirectUri: `${window.location.origin}/callback`,
        apiKey: process.env.NEXT_PUBLIC_DIMO_API_KEY || '',
      });
    }
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <ChakraProvider>
      <DimoAuthProvider>
        <Component {...pageProps} />
      </DimoAuthProvider>
    </ChakraProvider>
  );
}

export default MyApp;
