import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  VStack,
  Heading,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useDimoAuthState } from '@dimo-network/login-with-dimo';

export default function Callback() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated,getValidJWT, email, walletAddress } = useDimoAuthState();

  useEffect(() => {
    const saveUserToken = async () => {
      if (isAuthenticated) {
        try {
          const token = getValidJWT();
          
          const response = await fetch('/api/save-user-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              token, 
              email,
              walletAddress 
            }),
          });

          const result = await response.json();

          if (response.ok) {
            localStorage.setItem('profileId', result.profileId);
            router.push('/');
          } else {
            throw new Error(result.message);
          }
        } catch (error) {
          console.error('Token saving failed:', error);
          toast({
            title: 'Authentication Error',
            description: 'Failed to save authentication token',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Authentication Failed',
          description: 'Unable to complete login process',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        router.push('/login');
      }
    };

    saveUserToken();
  }, [isAuthenticated, router]);

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Heading size="md">Completing Authentication...</Heading>
        <Spinner size="xl" />
      </VStack>
    </Container>
  );
}
