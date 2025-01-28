#!/bin/bash

# Deploy smart contracts
echo "Deploying smart contracts..."
cd ../contracts
anchor build
anchor deploy --provider.cluster devnet

# Build and deploy backend
echo "Building and deploying backend..."
cd ../backend
docker build -t neurolov-backend .
docker push neurolov-backend

# Build and deploy frontend
echo "Building and deploying frontend..."
cd ../frontend
npm run build
docker build -t neurolov-frontend .
docker push neurolov-frontend

# Deploy infrastructure
echo "Deploying infrastructure..."
cd ../deployment
docker-compose up -d

# Run database migrations
echo "Running database migrations..."
npm run migrate

# Verify deployment
echo "Verifying deployment..."
./verify-deployment.sh

echo "Deployment complete!"
