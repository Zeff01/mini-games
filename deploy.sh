#!/bin/bash

# Pacman Game - AWS S3 Deployment Script
# This script helps you deploy your Pacman game to AWS S3

set -e  # Exit on any error

echo "🎮 Pacman Game - AWS Deployment Script"
echo "======================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed!"
    echo "Please install it from: https://aws.amazon.com/cli/"
    exit 1
fi

echo "✅ AWS CLI is installed"
echo ""

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured!"
    echo "Please run: aws configure"
    exit 1
fi

echo "✅ AWS CLI is configured"
echo ""

# Prompt for bucket name
read -p "Enter your S3 bucket name (e.g., my-pacman-game): " BUCKET_NAME

if [ -z "$BUCKET_NAME" ]; then
    echo "❌ Bucket name cannot be empty!"
    exit 1
fi

echo ""
echo "📦 Building the game..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist folder not found."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Check if bucket exists
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "📦 Bucket doesn't exist. Creating bucket..."
    read -p "Enter AWS region (e.g., us-east-1): " AWS_REGION

    if [ -z "$AWS_REGION" ]; then
        AWS_REGION="us-east-1"
    fi

    aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION"
    echo "✅ Bucket created!"
    echo ""

    echo "🌐 Enabling static website hosting..."
    aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html
    echo "✅ Website hosting enabled!"
    echo ""

    echo "🔓 Setting bucket policy..."
    cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json
    echo "✅ Bucket policy set!"
    echo ""
else
    echo "✅ Bucket exists!"
    echo ""
fi

echo "📤 Uploading files to S3..."
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Your game is live at:"
echo "http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
echo ""
echo "Share this URL with your friends! 🚀"
echo ""
echo "Note: If you want HTTPS and faster global access, set up CloudFront."
echo "See AWS_DEPLOYMENT_GUIDE.md for instructions."
