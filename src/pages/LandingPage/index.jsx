import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero, Stats, Features } from './components';
import { Container, CTAButton } from './styles';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  return (
    <Container>
      <Hero>
        <h1>Turn your browser into an AI supercomputer. Earn crypto.</h1>
        <p>Join 50,000+ GPUs powering the future of AI</p>
        <CTAButton onClick={handleGetStarted}>
          Start Earning in 30 Seconds
        </CTAButton>
      </Hero>
      <Stats />
      <Features />
    </Container>
  );
};

export default LandingPage;
