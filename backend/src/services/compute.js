export class WebGPUCompute {
    constructor() {
        this.device = null;
        this.queue = null;
    }

    async initialize() {
        if (!navigator.gpu) {
            throw new Error('WebGPU not supported');
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('No appropriate GPUAdapter found');
        }

        this.device = await adapter.requestDevice();
        this.queue = this.device.queue;
    }

    async computeTask(task) {
        const { input, computationType } = task;

        // Create shader module based on computation type
        const shaderModule = this.device.createShaderModule({
            code: this.getShaderCode(computationType)
        });

        // Create pipeline
        const pipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'main'
            }
        });

        // Create buffers
        const inputBuffer = this.device.createBuffer({
            size: input.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const outputBuffer = this.device.createBuffer({
            size: input.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });

        // Write input data
        this.queue.writeBuffer(inputBuffer, 0, input);

        // Create bind group
        const bindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: { buffer: inputBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: outputBuffer }
                }
            ]
        });

        // Create command encoder
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(input.length / 64));
        passEncoder.end();

        // Execute commands
        this.queue.submit([commandEncoder.finish()]);

        // Read result
        const resultBuffer = this.device.createBuffer({
            size: input.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });

        commandEncoder.copyBufferToBuffer(
            outputBuffer,
            0,
            resultBuffer,
            0,
            input.byteLength
        );

        await resultBuffer.mapAsync(GPUMapMode.READ);
        const result = new Float32Array(resultBuffer.getMappedRange());

        return result;
    }

    getShaderCode(computationType) {
        // Different shader codes for different computation types
        const shaders = {
            matrixMultiplication: `
                @group(0) @binding(0) var<storage, read> input: array<f32>;
                @group(0) @binding(1) var<storage, read_write> output: array<f32>;

                @compute @workgroup_size(8, 8)
                fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                    // Matrix multiplication implementation
                    // ...
                }
            `,
            // Add more shader types as needed
        };

        return shaders[computationType];
    }
}

// Initialize and export compute service
export const computeService = new WebGPUCompute();
