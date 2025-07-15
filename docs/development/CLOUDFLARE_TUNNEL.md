# Cloudflare Tunnel for Local Development

This document outlines how to use Cloudflare Tunnel to expose your local development server to the internet for testing on external devices like a mobile phone.

The public URL for this tunnel is: **https://midjournal.open-apis.org**

---

## One-Time Setup

These steps only need to be performed once. If you have already completed this setup, you can skip to the [Usage](#usage) section.

### 1. Install `cloudflared`

We use Homebrew to install the Cloudflare Tunnel daemon.

```bash
brew install cloudflared
```

### 2. Log in to Cloudflare

This command will open a browser window and ask you to log in to your Cloudflare account to authorize the tunnel.

```bash
cloudflared tunnel login
```

### 3. Create the Tunnel

Next, create a tunnel and give it a name. We use `midjournal-dev` for this project.

```bash
cloudflared tunnel create midjournal-dev
```

This will create the tunnel and generate a credentials file, which is stored in `~/.cloudflared/`.

### 4. Create a DNS Route

To make the tunnel accessible from a user-friendly URL, create a DNS CNAME record that points your desired hostname to the tunnel.

```bash
cloudflared tunnel route dns midjournal-dev midjournal.open-apis.org
```

---

## Usage

Follow these steps every time you want to start or stop the tunnel.

### Starting the Tunnel

To start the tunnel and connect it to your local server running on port 3000, run the following command:

```bash
cloudflared tunnel run --url localhost:3000 midjournal-dev
```

Your local server will now be available at `https://midjournal.open-apis.org`.

### Stopping the Tunnel

To stop the tunnel, simply press `Ctrl + C` in the terminal where the `cloudflared` command is running.
