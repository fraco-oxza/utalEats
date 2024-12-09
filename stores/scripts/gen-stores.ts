import fs from "fs";
import "dotenv/config";
import { Ollama } from "ollama";
import { z } from "zod";
import { faker } from "@faker-js/faker";

const BING_API_KEY = process.env.BING_API_KEY!;
const ollama = new Ollama({ host: process.env.OLLAMA_HOST! });

const storesToGenerate = 100;
const datastorePath = "data/stores.json";
const dishPlaceholder =
  "https://cdn-icons-png.flaticon.com/512/4901/4901689.png";

const ModelStoreResponse = z.object({
  cityName: z.string(),
  storeName: z.string(),
  category: z.string(),
  image: z.string().optional(),
  products: z.array(
    z.object({
      dishName: z.string(),
      price: z.number(),
      image: z.string().optional(),
    })
  ),
});

const generateStore = async (): Promise<typeof ModelStoreResponse._type> => {
  const message = {
    role: "user",
    content: `Generate one that sells ${faker.food.dish()}`,
  };
  const response = await ollama.chat({
    model: "gen-stores",
    messages: [message],
  });
  try {
    const possibleStore = JSON.parse(response.message.content);
    return ModelStoreResponse.parse(possibleStore);
  } catch (error) {
    console.error("Error parsing response:");
    console.error(response.message.content);
    console.error(error);
    return generateStore();
  }
};

const createModel = async () => {
  const model = `
    FROM llama3.1
    SYSTEM "You are a model that generates a JSON containing information about restaurants and their dishes. The JSON must include the fields: "cityName", "storeName", "category", and "products". Each product in "products" must include "dishName" and "price". The number of dishes in "products" should be random, but always at least 5. Generate realistic and varied data. Respond with the requested JSON only, without any additional explanations or text."
    `;
  await ollama.create({ model: "gen-stores", modelfile: model });
};

const findImage = async (query: string): Promise<string> => {
  const url = new URL("https://api.bing.microsoft.com/v7.0/images/search");
  url.searchParams.append("q", query);
  url.searchParams.append("count", "1");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": BING_API_KEY,
      Accept: "application/json",
    },
  });

  if (response.status === 429) {
    console.error("Bing API rate limit exceeded, waiting...");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
    return findImage(query); // Retry
  }

  const data = await response.json();

  if (!data.value || data.value.length === 0) {
    console.warn(`No image found for query: ${query}`);
    return dishPlaceholder;
  }

  return data.value[0].contentUrl;
};

const addImageToStore = async (store: typeof ModelStoreResponse._type) => {
  const storeWithImage = { ...store };
  const imagePromises = [findImage("logo " + store.storeName)];

  storeWithImage.products.forEach((product) => {
    imagePromises.push(findImage(product.dishName + " dish"));
  });

  // Rate limiting - process 3 images at a time at most.
  const results = [] as string[];
  for (let i = 0; i < imagePromises.length; i += 3) {
    const chunk = imagePromises.slice(i, i + 3);
    const chunkResults = await Promise.all(chunk);
    results.push(...chunkResults);
    if (i + 3 < imagePromises.length) {
      await new Promise((resolve) => setTimeout(resolve, 334)); // Wait for the next second (with a bit of buffer).
    }
  }

  storeWithImage.image = results.shift()!;
  storeWithImage.products = storeWithImage.products.map((product, index) => ({
    ...product,
    image: (results as string[])[index],
  }));

  return storeWithImage;
};

const readExistingStores = (): any[] => {
  try {
    if (fs.existsSync(datastorePath)) {
      const existingData = fs.readFileSync(datastorePath, "utf8");
      return existingData ? JSON.parse(existingData) : [];
    }
    return [];
  } catch (error) {
    console.error("Error reading existing stores:", error);
    return [];
  }
};

const appendStore = (store: any) => {
  const existingStores = readExistingStores();
  store.storeId =
    existingStores.length > 0
      ? Math.max(...existingStores.map((s) => s.storeId)) + 1
      : 1;
  existingStores.push(store);
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync(datastorePath, JSON.stringify(existingStores, null, 2));
  console.log(`Store ${store.storeName} added (ID: ${store.storeId})`);
  return store;
};

async function main() {
  await createModel();

  for (let i = 0; i < storesToGenerate; i++) {
    try {
      const store = await generateStore();
      const storeWithImage = await addImageToStore(store);
      appendStore(storeWithImage);
    } catch (error) {
      console.error(`Error generating store #${i + 1}:`, error);
    }
  }
}

main().catch(console.error);
