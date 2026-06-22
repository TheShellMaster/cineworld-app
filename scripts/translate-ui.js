import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { translate } from "@vitalets/google-translate-api";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Langues cibles principales (format ISO-639-1)
// Exclut "fr" car c'est la source
const TARGET_LOCALES = [
  "en", "es", "de", "it", "pt", "nl", "ru", "zh-CN", "ja", "ko",
  "ar", "hi", "tr", "pl", "sv", "da", "fi", "no", "el", "he",
  "th", "vi", "id", "cs", "hu", "ro"
];

const MESSAGES_DIR = path.join(__dirname, "..", "messages");

async function translateObject(obj, targetLang) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null) {
      result[key] = await translateObject(value, targetLang);
    } else if (typeof value === "string") {
      try {
        const { text } = await translate(value, { from: "fr", to: targetLang });
        result[key] = text;
        // Petit délai pour éviter le rate-limiting
        await new Promise((r) => setTimeout(r, 100));
      } catch (e) {
        console.error(`Erreur traduction "${value}" vers ${targetLang}:`, e.message);
        result[key] = value; // Fallback
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function main() {
  const sourcePath = path.join(MESSAGES_DIR, "fr.json");
  const sourceRaw = await fs.readFile(sourcePath, "utf-8");
  const sourceData = JSON.parse(sourceRaw);

  for (const locale of TARGET_LOCALES) {
    const targetPath = path.join(MESSAGES_DIR, `${locale}.json`);
    
    // Si le fichier existe déjà, on le zappe pour gagner du temps
    try {
      await fs.access(targetPath);
      console.log(`[${locale}] existe déjà.`);
      continue;
    } catch {}

    console.log(`Traduction de fr vers ${locale}...`);
    try {
      const translatedData = await translateObject(sourceData, locale);
      await fs.writeFile(targetPath, JSON.stringify(translatedData, null, 2));
      console.log(`✅ ${locale} terminé.`);
    } catch (e) {
      console.error(`❌ Échec pour ${locale} :`, e);
    }
  }
}

main();
