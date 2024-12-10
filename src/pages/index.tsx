import { useEffect } from 'react';
import {
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useDimoAuthState } from '@dimo-network/login-with-dimo';

export default function Home() {
  const router = useRouter();
  const {   
    isAuthenticated, 
    getValidJWT, 
    email, 
    walletAddress, 
    getEmail  } = useDimoAuthState();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    // TODO: what to display if not authenticated
    return null;
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="center">
        <Heading size="xl">Welcome to Vehicle DLP</Heading>
        <Text>You are successfully logged in!</Text>
        <Text>Email: {email}</Text>
        <Text>Wallet Address: {walletAddress}</Text>
        <Text>Valid JWT: {getValidJWT()}</Text> 
      </VStack>
    </Container>
  );
}
