import fs from "fs";
import "dotenv/config";
import { Ollama } from "ollama";
import { z } from "zod";
import { faker } from "@faker-js/faker";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_CX!;

const ollama = new Ollama({ host: process.env.OLLAMA_HOST! });
const storesToGenerate = 15;
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
    content: `Generate one that sells ${faker.food.dish()}}`,
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
    SYSTEM "You are a model that generates a JSON containing information about restaurants and their dishes. The JSON must include the fields: "cityName", "storeName", "category", and "products". Each product in "products" must include "dishName" and "price". The number of dishes in "products" should be random, but always at least 3. Generate realistic and varied data. Respond with the requested JSON only, without any additional explanations or text."
    `;

  await ollama.create({ model: "gen-stores", modelfile: model });
};

const addImageToStore = async (store: typeof ModelStoreResponse._type) => {
  const storeWithImage = { ...store };

  storeWithImage.image = await findImage("logo " + store.storeName);

  storeWithImage.products = await Promise.all(
    store.products.map(async (product) => {
      if (!product.image) {
        product.image = await findImage(product.dishName + " dish");
      }

      return product;
    })
  );

  return storeWithImage;
};

const findImage = async (query: string): Promise<string> => {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.append("key", GOOGLE_API_KEY);
  url.searchParams.append("cx", GOOGLE_CX);
  url.searchParams.append(
    "rights",
    "cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived"
  );
  url.searchParams.append("searchType", "image");
  url.searchParams.append("q", query);

  const response = await fetch(url.toString());

  if (response.status === 429) {
    console.error("Google API rate limit exceeded");
    return dishPlaceholder;
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    console.warn(`No image found for query: ${query}`);
    console.warn(response);
    return dishPlaceholder;
  }

  return data.items[0].link;
};

let currentStoreId = 1;

const addStoreId = (store: any) => {
  store.storeId = currentStoreId++;
  return store;
};

async function main() {
  await createModel();

  const stores = await Promise.all(
    Array.from({ length: storesToGenerate }).map(() =>
      generateStore().then(addImageToStore).then(addStoreId)
    )
  );

  fs.writeFileSync("data/stores.json", JSON.stringify(stores, null, 2));
}

main();
