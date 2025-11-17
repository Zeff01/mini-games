# AWS Deployment Guide for Pacman Game

## ✅ Prerequisites

Before starting, make sure you have:
1. **AWS Account** - Sign up at https://aws.amazon.com if you don't have one
2. **AWS CLI installed** - Download from https://aws.amazon.com/cli/
3. **AWS CLI configured** - Run `aws configure` and enter your credentials

To configure AWS CLI, you'll need:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)

---

## 📦 Step 1: Prepare Your Build

Your game is already built! The production files are in the `dist` folder.

Check it by running:
```bash
ls dist
```

You should see:
- `index.html`
- `assets/` folder with CSS and JS files

**IMPORTANT:** Make sure you have your company logo images in `public/`:
- `hubspot.png`
- `webflow.png`
- `wix.png`
- `zapier.png`

If you haven't added them yet, add them to the `public` folder and rebuild:
```bash
npm run build
```

---

## 🪣 Step 2: Create an S3 Bucket

### Option A: Using AWS Console (Easy)

1. Go to https://console.aws.amazon.com/s3/
2. Click **"Create bucket"**
3. **Bucket name**: Choose a unique name (e.g., `my-pacman-game-2024`)
   - Must be globally unique across all AWS
   - Use only lowercase letters, numbers, and hyphens
4. **Region**: Choose your preferred region (e.g., `us-east-1`)
5. **Block Public Access**: **UNCHECK** "Block all public access"
   - ⚠️ Check the box that says "I acknowledge..."
6. Leave everything else as default
7. Click **"Create bucket"**

### Option B: Using AWS CLI (Fast)

```bash
# Replace 'my-pacman-game' with your desired bucket name
aws s3 mb s3://my-pacman-game --region us-east-1
```

---

## 🌐 Step 3: Enable Static Website Hosting

### Using AWS Console:

1. Go to your bucket in S3 console
2. Click **"Properties"** tab
3. Scroll to **"Static website hosting"**
4. Click **"Edit"**
5. Select **"Enable"**
6. **Index document**: `index.html`
7. **Error document**: `index.html`
8. Click **"Save changes"**
9. **Copy the website endpoint URL** (you'll need this later!)

### Using AWS CLI:

```bash
aws s3 website s3://my-pacman-game --index-document index.html --error-document index.html
```

---

## 🔓 Step 4: Set Bucket Policy (Make it Public)

### Using AWS Console:

1. Go to **"Permissions"** tab
2. Scroll to **"Bucket policy"**
3. Click **"Edit"**
4. Paste this policy (replace `YOUR-BUCKET-NAME`):

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

5. Click **"Save changes"**

### Using AWS CLI:

Create a file named `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-pacman-game/*"
    }
  ]
}
```

Then apply it:
```bash
aws s3api put-bucket-policy --bucket my-pacman-game --policy file://bucket-policy.json
```

---

## 📤 Step 5: Upload Your Files

### Using AWS Console:

1. Go to your bucket
2. Click **"Upload"**
3. Click **"Add files"** and **"Add folder"**
4. Select ALL files from the `dist` folder
5. Click **"Upload"**

### Using AWS CLI (Recommended):

```bash
cd web-version
aws s3 sync dist/ s3://my-pacman-game --delete
```

This command:
- Uploads all files from `dist/` to your bucket
- `--delete` removes old files that no longer exist
- Syncs only changed files (faster updates)

---

## 🎮 Step 6: Test Your Game!

Your game is now live! Access it at:

**S3 Website URL:**
```
http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com
```

For example:
- `http://my-pacman-game.s3-website-us-east-1.amazonaws.com`

**Share this URL with your friends!**

---

## 🚀 Step 7: Optional - Add CloudFront CDN (Faster + HTTPS)

CloudFront makes your game load faster worldwide and adds HTTPS support.

### Create CloudFront Distribution:

1. Go to https://console.aws.amazon.com/cloudfront/
2. Click **"Create Distribution"**
3. **Origin domain**: Select your S3 bucket from dropdown
4. **Origin access**: Choose "Origin access control settings"
   - Click "Create new OAC"
   - Keep defaults and click "Create"
5. **Viewer protocol policy**: Select "Redirect HTTP to HTTPS"
6. **Default root object**: `index.html`
7. Click **"Create distribution"**

### Update S3 Bucket Policy:

After creating the distribution, CloudFront will show you a policy to copy.

1. Click **"Copy policy"**
2. Go back to S3 → Your bucket → Permissions → Bucket policy
3. Replace the old policy with the CloudFront policy

### Access Your Game:

- **CloudFront URL**: `https://YOUR-DISTRIBUTION-ID.cloudfront.net`
- Find this in CloudFront console under "Domain name"
- CloudFront takes 5-15 minutes to deploy globally

---

## 🔄 Updating Your Game

When you make changes to your game:

1. **Rebuild:**
   ```bash
   cd web-version
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://my-pacman-game --delete
   ```

3. **If using CloudFront, invalidate cache:**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths "/*"
   ```

---

## 💰 Cost Estimate

**S3 Hosting:**
- Storage: ~$0.023 per GB/month (your game is probably < 1 MB)
- Requests: ~$0.0004 per 1,000 requests
- Data transfer: Free for first 1 GB/month

**CloudFront (Optional):**
- Free tier: 1 TB data transfer + 10M requests/month
- After free tier: ~$0.085 per GB

**Expected monthly cost for a small game with moderate traffic: < $1**

---

## 🎯 Quick Reference Commands

```bash
# Build your game
cd web-version
npm run build

# Upload to S3
aws s3 sync dist/ s3://my-pacman-game --delete

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"

# Check your bucket website endpoint
aws s3api get-bucket-website --bucket my-pacman-game
```

---

## 🐛 Troubleshooting

**White screen / 404 errors:**
- Verify `index.html` is at the root of your bucket
- Check bucket policy is set correctly
- Make sure static website hosting is enabled

**Images not loading:**
- Ensure logo images are in the `public` folder before building
- Check browser console for 404 errors
- Rebuild and re-upload if images were added after initial build

**CloudFront shows old version:**
- Create an invalidation for `/*`
- Wait 5-10 minutes for invalidation to complete
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## 📧 Share with Friends

Once deployed, share this message:

```
🎮 Check out my Pacman game!

Play here: http://your-bucket.s3-website-us-east-1.amazonaws.com

Controls:
- Arrow keys or WASD to move
- Eat the big dots to power up and eat the ghosts!
- Try to collect all pellets to win

The ghosts are actually HubSpot, Webflow, Wix, and Zapier logos! 😄
```

---

## ✅ Checklist

- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] Company logo images added to `public` folder
- [ ] Built the game (`npm run build`)
- [ ] Created S3 bucket
- [ ] Enabled static website hosting
- [ ] Set bucket policy to public
- [ ] Uploaded files to S3
- [ ] Tested the game at S3 URL
- [ ] (Optional) Created CloudFront distribution
- [ ] Shared URL with friends!

---

**Need help?** Check the full deployment guide in `DEPLOYMENT.md` or AWS documentation.

Good luck and have fun! 🎮
