import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { checkWebGPUSupport, calculateDeviceScore } from '../../utils/webgpu';
import {
  OnboardingContainer,
  StepContainer,
  ProgressBar,
  StepContent,
  NextButton
} from './styles';

const OnboardingSteps = {
  BROWSER_CHECK: 0,
  DEVICE_SCAN: 1,
  WALLET_CONNECT: 2
};

const Onboarding = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const [currentStep, setCurrentStep] = useState(OnboardingSteps.BROWSER_CHECK);
  const [deviceSupport, setDeviceSupport] = useState(null);
  const [deviceScore, setDeviceScore] = useState(null);

  useEffect(() => {
    checkBrowserSupport();
  }, []);

  const checkBrowserSupport = async () => {
    try {
      await checkWebGPUSupport();
      setDeviceSupport(true);
    } catch (error) {
      setDeviceSupport(false);
    }
  };

  const scanDevice = async () => {
    try {
      const score = await calculateDeviceScore();
      setDeviceScore(score);
      setCurrentStep(OnboardingSteps.WALLET_CONNECT);
    } catch (error) {
      console.error('Failed to scan device:', error);
    }
  };

  const handleNext = async () => {
    switch (currentStep) {
      case OnboardingSteps.BROWSER_CHECK:
        if (deviceSupport) {
          setCurrentStep(OnboardingSteps.DEVICE_SCAN);
          await scanDevice();
        }
        break;
      case OnboardingSteps.DEVICE_SCAN:
        setCurrentStep(OnboardingSteps.WALLET_CONNECT);
        break;
      case OnboardingSteps.WALLET_CONNECT:
        if (wallet.connected) {
          navigate('/dashboard');
        }
        break;
    }
  };

  return (
    <OnboardingContainer>
      <ProgressBar progress={(currentStep / 2) * 100} />
      <StepContainer>
        {currentStep === OnboardingSteps.BROWSER_CHECK && (
          <StepContent>
            <h2>Checking Browser Compatibility</h2>
            {deviceSupport === null && <p>Checking WebGPU support...</p>}
            {deviceSupport === true && <p>✅ Your browser supports WebGPU!</p>}
            {deviceSupport === false && (
              <p>❌ Please enable WebGPU in chrome://flags</p>
            )}
          </StepContent>
        )}

        {currentStep === OnboardingSteps.DEVICE_SCAN && (
          <StepContent>
            <h2>Scanning Your Device</h2>
            {deviceScore && (
              <div>
                <p>GPU Power: {deviceScore.tflops} TFLOPS</p>
                <p>VRAM: {deviceScore.vram / 1024 / 1024 / 1024}GB</p>
              </div>
            )}
          </StepContent>
        )}

        {currentStep === OnboardingSteps.WALLET_CONNECT && (
          <StepContent>
            <h2>Connect Your Wallet</h2>
            {!wallet.connected && <p>Please connect your Solana wallet</p>}
            {wallet.connected && <p>✅ Wallet connected!</p>}
          </StepContent>
        )}

        <NextButton
          disabled={
            (currentStep === OnboardingSteps.BROWSER_CHECK && !deviceSupport) ||
            (currentStep === OnboardingSteps.WALLET_CONNECT && !wallet.connected)
          }
          onClick={handleNext}
        >
          {currentStep === OnboardingSteps.WALLET_CONNECT ? 'Start Mining' : 'Next'}
        </NextButton>
      </StepContainer>
    </OnboardingContainer>
  );
};

export default Onboarding;
