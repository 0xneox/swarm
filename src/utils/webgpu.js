// WebGPU Detection and Computation Utilities
export const checkWebGPUSupport = async () => {
  if (!navigator.gpu) {
    throw new Error('WebGPU not supported');
  }
  
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No appropriate GPUAdapter found');
  }
  
  const device = await adapter.requestDevice();
  return { adapter, device };
};

export const calculateDeviceScore = async () => {
  const { adapter } = await checkWebGPUSupport();
  const features = await adapter.features;
  
  const computeScore = {
    tflops: 0,
    vram: 0,
    features: []
  };

  const info = await adapter.requestAdapterInfo();
  computeScore.features = Array.from(features);
  computeScore.vram = info.maxMemorySize || 0;
  
  if (info.description.includes('RTX')) {
    computeScore.tflops = 30;
  } else if (info.description.includes('GTX')) {
    computeScore.tflops = 15;
  } else {
    computeScore.tflops = 8;
  }

  return computeScore;
};

export const initializeComputeEnvironment = async () => {
  const { device } = await checkWebGPUSupport();
  
  const shaderModule = device.createShaderModule({
    code: `
      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        // Basic compute shader for testing
      }
    `
  });

  return { device, shaderModule };
};
