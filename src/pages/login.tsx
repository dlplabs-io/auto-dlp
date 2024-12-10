import { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LoginWithDimo, useDimoAuthState } from '@dimo-network/login-with-dimo';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const {   
    isAuthenticated, 
    getValidJWT, 
    email, 
    walletAddress, 
    getEmail  } = useDimoAuthState();


  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="center">
        <Heading size="xl">Welcome to Auto DLP</Heading>
        <Text>Sign in with your DIMO account to continue</Text>
        <Box w="full" maxW="md" p={8} borderWidth={1} borderRadius="lg">
          <LoginWithDimo
            mode="popup"
            onSuccess={(authData) => {
              // TODO: do something with authData
              // See redirect for `/callback`
              router.push('/');
            }}
            onError={(error) => {
              console.error("Login Error:", error);
            }}
            permissionTemplateId="1" // This gives people the option to share _everything_
          />
        </Box>
      </VStack>
    </Container>
  );
}
