# AWS Deployment Guide

This guide will help you deploy the Pacman game to AWS S3 with CloudFront for global distribution.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Node.js and npm installed

## Step 1: Build the Application

```bash
cd web-version
npm install
npm run build
```

This creates a `dist` folder with all production files.

## Step 2: Create an S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `my-pacman-game-2024`)
4. Select your preferred region
5. **Uncheck** "Block all public access" (we need public access for website hosting)
6. Click "Create bucket"

## Step 3: Configure Bucket for Static Website Hosting

1. Go to your bucket
2. Click "Properties" tab
3. Scroll to "Static website hosting"
4. Click "Edit"
5. Enable static website hosting
6. Set index document: `index.html`
7. Set error document: `index.html`
8. Click "Save changes"

## Step 4: Set Bucket Policy

1. Go to "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

5. Click "Save changes"

## Step 5: Upload Files to S3

### Using AWS CLI:

```bash
cd web-version
aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
```

### Using AWS Console:

1. Go to your bucket
2. Click "Upload"
3. Drag and drop all files from the `dist` folder
4. Click "Upload"

## Step 6: Set up CloudFront (Optional but Recommended)

CloudFront provides faster global delivery and HTTPS support.

1. Go to CloudFront Console
2. Click "Create Distribution"
3. For "Origin domain", select your S3 bucket
4. For "Origin access", select "Origin access control settings (recommended)"
5. Create a new OAC if needed
6. For "Viewer protocol policy", select "Redirect HTTP to HTTPS"
7. Leave other settings as default
8. Click "Create distribution"

### Update S3 Bucket Policy for CloudFront:

After creating the distribution, CloudFront will suggest a bucket policy update. Copy and apply it to your S3 bucket.

## Step 7: Access Your Game

### S3 Website URL:
```
http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com
```

### CloudFront URL (if configured):
```
https://YOUR-DISTRIBUTION-ID.cloudfront.net
```

You can find your CloudFront distribution domain in the CloudFront console.

## Custom Domain (Optional)

To use a custom domain like `pacman.yourdomain.com`:

1. Register a domain in Route 53 or your DNS provider
2. Create an SSL certificate in AWS Certificate Manager (ACM) in us-east-1 region
3. In CloudFront distribution settings:
   - Add your custom domain to "Alternate domain names (CNAMEs)"
   - Select your SSL certificate
4. In Route 53 (or your DNS provider):
   - Create a CNAME or A record (Alias) pointing to your CloudFront distribution

## Updating Your Game

When you make changes:

```bash
npm run build
aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
```

If using CloudFront, invalidate the cache:

```bash
aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths "/*"
```

## Cost Estimate

- **S3**: ~$0.023 per GB/month storage + minimal request costs
- **CloudFront**: Free tier includes 1TB data transfer/month and 10M requests/month
- For a small game like this, costs should be minimal (< $1/month)

## Share with Friends

Once deployed, share the CloudFront URL (or S3 URL) with your friends! They can play directly in their browsers without installing anything.

Example sharing message:
```
Check out my Pacman game! Play it here:
https://YOUR-DISTRIBUTION-ID.cloudfront.net

Use arrow keys or WASD to move, avoid the ghosts, and collect all the pellets!
```

## Troubleshooting

**White screen / 404 errors:**
- Make sure `index.html` is at the root of your S3 bucket
- Check browser console for errors
- Verify bucket policy is correctly set

**Slow loading:**
- Use CloudFront for better performance
- Enable gzip compression in CloudFront settings

**Changes not showing:**
- Clear CloudFront cache with invalidation
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
