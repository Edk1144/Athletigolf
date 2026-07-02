type FoodSearchSource = "all" | "open_food_facts" | "usda";

type FoodSearchResult = {
  id: string;
  source: "open_food_facts" | "usda";
  name: string;
  brand: string | null;
  barcode: string | null;
  servingLabel: string | null;
  servingGrams: number | null;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatsPer100g: number | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const query = String(body.query || "").trim();
    const source = (body.source || "all") as FoodSearchSource;

    if (!query || query.length < 2) {
      return json({ results: [], warnings: ["Search query must be at least 2 characters."] });
    }

    const searches: Promise<{ results: FoodSearchResult[]; warning?: string }>[] = [];
    if (source === "all" || source === "open_food_facts") searches.push(searchOpenFoodFacts(query));
    if (source === "all" || source === "usda") searches.push(searchUsda(query));

    const settled = await Promise.allSettled(searches);
    const results: FoodSearchResult[] = [];
    const warnings: string[] = [];

    settled.forEach((item) => {
      if (item.status === "fulfilled") {
        results.push(...item.value.results);
        if (item.value.warning) warnings.push(item.value.warning);
      } else {
        warnings.push("One food database could not be reached.");
      }
    });

    return json({ results: dedupeResults(results).slice(0, 20), warnings });
  } catch (error) {
    return json(
      {
        results: [],
        warnings: [error instanceof Error ? error.message : "Food search failed."],
      },
      500
    );
  }
});

async function searchOpenFoodFacts(query: string) {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "8");
  url.searchParams.set("fields", "code,product_name,brands,serving_size,serving_quantity,nutriments");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "AthletiGolf/1.0 nutrition-search contact:support@athletigolf.com",
    },
  });

  if (!response.ok) {
    return { results: [], warning: "Open Food Facts search failed." };
  }

  const data = await response.json();
  const products = Array.isArray(data.products) ? data.products : [];

  return {
    results: products
      .map((product: any): FoodSearchResult | null => {
        const name = clean(product.product_name);
        if (!name) return null;
        const nutriments = product.nutriments || {};
        return {
          id: `off-${product.code || name}`,
          source: "open_food_facts",
          name,
          brand: clean(product.brands),
          barcode: clean(product.code),
          servingLabel: clean(product.serving_size),
          servingGrams: toNumber(product.serving_quantity),
          caloriesPer100g: toNumber(nutriments["energy-kcal_100g"]),
          proteinPer100g: toNumber(nutriments.proteins_100g),
          carbsPer100g: toNumber(nutriments.carbohydrates_100g),
          fatsPer100g: toNumber(nutriments.fat_100g),
        };
      })
      .filter(Boolean) as FoodSearchResult[],
  };
}

async function searchUsda(query: string) {
  const apiKey = Deno.env.get("USDA_API_KEY");
  if (!apiKey) {
    return { results: [], warning: "USDA search is not configured yet." };
  }

  const response = await fetch("https://api.nal.usda.gov/fdc/v1/foods/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      query,
      pageSize: 8,
      dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"],
    }),
  });

  if (!response.ok) {
    return { results: [], warning: "USDA FoodData Central search failed." };
  }

  const data = await response.json();
  const foods = Array.isArray(data.foods) ? data.foods : [];

  return {
    results: foods.map((food: any): FoodSearchResult => {
      const nutrients = Array.isArray(food.foodNutrients) ? food.foodNutrients : [];
      return {
        id: `usda-${food.fdcId}`,
        source: "usda",
        name: clean(food.description) || "USDA food",
        brand: clean(food.brandOwner || food.brandName),
        barcode: clean(food.gtinUpc),
        servingLabel: clean(food.servingSizeUnit ? `${food.servingSize || 100}${food.servingSizeUnit}` : null),
        servingGrams: toNumber(food.servingSize) || 100,
        caloriesPer100g: findNutrient(nutrients, ["Energy"], ["kcal"]),
        proteinPer100g: findNutrient(nutrients, ["Protein"]),
        carbsPer100g: findNutrient(nutrients, ["Carbohydrate, by difference", "Carbohydrate"]),
        fatsPer100g: findNutrient(nutrients, ["Total lipid (fat)", "Total fat"]),
      };
    }),
  };
}

function findNutrient(nutrients: any[], names: string[], units?: string[]) {
  const nutrient = nutrients.find((item) => {
    const name = String(item.nutrientName || item.name || "").toLowerCase();
    const unit = String(item.unitName || "").toLowerCase();
    const nameMatches = names.some((candidate) => name === candidate.toLowerCase());
    const unitMatches = !units || units.some((candidate) => unit === candidate.toLowerCase());
    return nameMatches && unitMatches;
  });
  return toNumber(nutrient?.value);
}

function dedupeResults(results: FoodSearchResult[]) {
  const seen = new Set<string>();
  return results.filter((item) => {
    const key = `${item.source}-${item.barcode || item.id || item.name}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clean(value: unknown) {
  const text = String(value || "").trim();
  return text || null;
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
