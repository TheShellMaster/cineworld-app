import json
import os
import sys
import time

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("Veuillez installer deep_translator: pip install deep-translator")
    sys.exit(1)

# Chemin vers messages
MESSAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "messages")
COUNTRIES_FILE = os.path.join(os.path.dirname(__file__), "..", "src", "data", "countries.json")

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def translate_dict(d, translator):
    """Traduit récursivement un dictionnaire de chaînes."""
    res = {}
    for k, v in d.items():
        if isinstance(v, dict):
            res[k] = translate_dict(v, translator)
        elif isinstance(v, str):
            try:
                # Éviter les variables type {name}
                # Pour faire simple avec Google Translate, on traduit tel quel, mais ça peut casser {var}.
                # L'application actuelle n'utilise presque pas d'interpolation complexe, ou on les fixera à la main.
                translated = translator.translate(v)
                res[k] = translated
                time.sleep(0.1) # anti-rate-limit
            except Exception as e:
                print(f"Erreur de traduction pour '{v}': {e}")
                res[k] = v
        else:
            res[k] = v
    return res

def main():
    countries = load_json(COUNTRIES_FILE)
    unique_locales = list(set(c["locale"] for c in countries))
    print(f"Locales cibles : {unique_locales}")

    source_path = os.path.join(MESSAGES_DIR, "fr.json")
    if not os.path.exists(source_path):
        print(f"Fichier source introuvable: {source_path}")
        return

    source_data = load_json(source_path)

    for loc in unique_locales:
        target_path = os.path.join(MESSAGES_DIR, f"{loc}.json")
        if os.path.exists(target_path):
            print(f"[{loc}] existe déjà, on ignore.")
            continue
        
        print(f"Traduction de fr vers {loc}...")
        # Google Translate API utilise des codes similaires, mais parfois différent.
        # deep-translator accepte la plupart des codes ISO.
        try:
            translator = GoogleTranslator(source="fr", target=loc)
            translated_data = translate_dict(source_data, translator)
            save_json(target_path, translated_data)
            print(f"✅ {loc} traduit avec succès.")
        except Exception as e:
            print(f"❌ Erreur pour {loc}: {e}")
            # Si erreur, on copie la source par défaut pour éviter un crash serveur
            save_json(target_path, source_data)

if __name__ == "__main__":
    main()
