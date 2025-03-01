import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import { promisify } from "node:util";
import readline from "node:readline";
import crypto from "node:crypto";
import path from "node:path";
import os from "node:os";

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function checkStripeCLI() {
  console.log(
    "Step 1: Checking if Stripe CLI is installed and authenticated...",
  );
  try {
    await execAsync("stripe --version");
    console.log("Stripe CLI is installed.");

    // Check if Stripe CLI is authenticated
    try {
      await execAsync("stripe config --list");
      console.log("Stripe CLI is authenticated.");
    } catch (error) {
      console.log(
        "Stripe CLI is not authenticated or the authentication has expired.",
      );
      console.log("Please run: stripe login");
      const answer = await question(
        "Have you completed the authentication? (y/n): ",
      );
      if (answer.toLowerCase() !== "y") {
        console.log(
          "Please authenticate with Stripe CLI and run this script again.",
        );
        process.exit(1);
      }

      // Verify authentication after user confirms login
      try {
        await execAsync("stripe config --list");
        console.log("Stripe CLI authentication confirmed.");
      } catch (error) {
        console.error(
          "Failed to verify Stripe CLI authentication. Please try again.",
        );
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(
      "Stripe CLI is not installed. Please install it and try again.",
    );
    console.log("To install Stripe CLI, follow these steps:");
    console.log("1. Visit: https://docs.stripe.com/stripe-cli");
    console.log(
      "2. Download and install the Stripe CLI for your operating system",
    );
    console.log("3. After installation, run: stripe login");
    console.log(
      "After installation and authentication, please run this setup script again.",
    );
    process.exit(1);
  }
}

async function getStripeSecretKey(): Promise<string> {
  console.log("Step 2: Getting Stripe Secret Key");
  console.log(
    "You can find your Stripe Secret Key at: https://dashboard.stripe.com/test/apikeys",
  );
  return await question("Enter your Stripe Secret Key: ");
}

async function createStripeWebhook(): Promise<string> {
  console.log("Step 3: Creating Stripe webhook...");
  try {
    const { stdout } = await execAsync("stripe listen --print-secret");
    const match = stdout.match(/whsec_[a-zA-Z0-9]+/);
    if (!match) {
      throw new Error("Failed to extract Stripe webhook secret");
    }
    console.log("Stripe webhook created.");
    return match[0];
  } catch (error) {
    console.error(
      "Failed to create Stripe webhook. Check your Stripe CLI installation and permissions.",
    );
    if (os.platform() === "win32") {
      console.log(
        "Note: On Windows, you may need to run this script as an administrator.",
      );
    }
    throw error;
  }
}

function generateAuthSecret(): string {
  console.log("Step 4: Generating AUTH_SECRET...");
  return crypto.randomBytes(32).toString("hex");
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log("Step 5: Writing environment variables to .env");

  // Read existing .env file if it exists
  let existingEnv = "";
  try {
    existingEnv = await fs.readFile(path.join(process.cwd(), ".env"), "utf-8");
  } catch (error) {
    // File doesn't exist, ignore
  }

  // Parse existing environment variables
  const existingVars = existingEnv
    .split("\n")
    .filter((line) => line.includes("="))
    .reduce<Record<string, string>>((acc, line) => {
      const [key, ...values] = line.split("=");
      if (key) {
        acc[key] = values.join("=");
      }
      return acc;
    }, {});

  // Merge with new variables
  const mergedVars = { ...existingVars, ...envVars };

  // Convert back to .env format
  const envContent = Object.entries(mergedVars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await fs.writeFile(path.join(process.cwd(), ".env"), envContent);
  console.log(".env file created with the necessary variables.");
}

async function getDatabaseUrl(): Promise<string> {
  console.log("Step 6: Getting Database URL");
  console.log(
    "You can find your Database URL in your Supabase project settings.",
  );
  const url = await question("Enter your Database URL: ");

  try {
    // URLをパースして検証
    const parsedUrl = new URL(url);
    // パスワードが含まれている場合、適切にエンコード
    if (parsedUrl.password) {
      parsedUrl.password = encodeURIComponent(parsedUrl.password);
    }
    return parsedUrl.toString();
  } catch (error) {
    console.error("Invalid database URL format");
    throw error;
  }
}

async function main() {
  await checkStripeCLI();

  const STRIPE_SECRET_KEY = await getStripeSecretKey();
  const STRIPE_WEBHOOK_SECRET = await createStripeWebhook();
  const BASE_URL = "http://localhost:3000";
  const AUTH_SECRET = generateAuthSecret();
  const DATABASE_URL = await getDatabaseUrl();

  await writeEnvFile({
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    BASE_URL,
    AUTH_SECRET,
    DATABASE_URL,
  });

  console.log("🎉 Setup completed successfully!");
}

main().catch(console.error);
