import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

export const Hero = styled.section`
  text-align: center;
  padding: 4rem 0;

  h1 {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, var(--accent-green), var(--solana-purple));
    -webkit-background-clip: text;
    color: transparent;
  }

  p {
    font-size: 1.5rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
`;

export const CTAButton = styled.button`
  background: var(--accent-green);
  color: var(--primary-bg);
  font-size: 1.2rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  }
`;
