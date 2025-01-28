import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor';
import { IDL } from '../target/types/neurolov';

const PROGRAM_ID = new PublicKey('Neu1o1ovProgramIdXXXXXXXXXXXXXXXXXXXXXXX');

async function deploy() {
  // Load deployment keypair
  const deployerKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(process.env.DEPLOYER_PRIVATE_KEY))
  );

  // Connect to cluster
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );

  // Create provider
  const provider = new AnchorProvider(
    connection,
    new Wallet(deployerKeypair),
    { commitment: 'confirmed' }
  );

  // Create program
  const program = new Program(IDL, PROGRAM_ID, provider);

  try {
    // Deploy program
    console.log('Deploying Neurolov program...');
    
    // Initialize pool
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool')],
      program.programId
    );

    await program.methods
      .initializePool()
      .accounts({
        authority: deployerKeypair.publicKey,
        pool: poolPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Program deployed successfully!');
    console.log('Program ID:', program.programId.toString());
    console.log('Pool PDA:', poolPda.toString());

  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();
