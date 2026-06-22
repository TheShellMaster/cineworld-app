import json
import os

# Liste de plus de 50 pays avec leurs langues principales
COUNTRIES_DATA = [
    {"code": "fr-FR", "flag": "🇫🇷", "name": "France", "locale": "fr", "region": "FR"},
    {"code": "fr-BE", "flag": "🇧🇪", "name": "Belgique", "locale": "fr", "region": "BE"},
    {"code": "fr-CH", "flag": "🇨🇭", "name": "Suisse", "locale": "fr", "region": "CH"},
    {"code": "fr-CA", "flag": "🇨🇦", "name": "Canada (FR)", "locale": "fr", "region": "CA"},
    
    {"code": "en-US", "flag": "🇺🇸", "name": "United States", "locale": "en", "region": "US"},
    {"code": "en-GB", "flag": "🇬🇧", "name": "United Kingdom", "locale": "en", "region": "GB"},
    {"code": "en-AU", "flag": "🇦🇺", "name": "Australia", "locale": "en", "region": "AU"},
    {"code": "en-CA", "flag": "🇨🇦", "name": "Canada (EN)", "locale": "en", "region": "CA"},
    {"code": "en-IE", "flag": "🇮🇪", "name": "Ireland", "locale": "en", "region": "IE"},
    {"code": "en-NZ", "flag": "🇳🇿", "name": "New Zealand", "locale": "en", "region": "NZ"},
    
    {"code": "es-ES", "flag": "🇪🇸", "name": "España", "locale": "es", "region": "ES"},
    {"code": "es-MX", "flag": "🇲🇽", "name": "México", "locale": "es", "region": "MX"},
    {"code": "es-AR", "flag": "🇦🇷", "name": "Argentina", "locale": "es", "region": "AR"},
    {"code": "es-CO", "flag": "🇨🇴", "name": "Colombia", "locale": "es", "region": "CO"},
    {"code": "es-CL", "flag": "🇨🇱", "name": "Chile", "locale": "es", "region": "CL"},
    {"code": "es-PE", "flag": "🇵🇪", "name": "Perú", "locale": "es", "region": "PE"},
    
    {"code": "de-DE", "flag": "🇩🇪", "name": "Deutschland", "locale": "de", "region": "DE"},
    {"code": "de-AT", "flag": "🇦🇹", "name": "Österreich", "locale": "de", "region": "AT"},
    {"code": "de-CH", "flag": "🇨🇭", "name": "Schweiz", "locale": "de", "region": "CH"},
    
    {"code": "it-IT", "flag": "🇮🇹", "name": "Italia", "locale": "it", "region": "IT"},
    
    {"code": "pt-PT", "flag": "🇵🇹", "name": "Portugal", "locale": "pt", "region": "PT"},
    {"code": "pt-BR", "flag": "🇧🇷", "name": "Brasil", "locale": "pt", "region": "BR"},
    
    {"code": "nl-NL", "flag": "🇳🇱", "name": "Nederland", "locale": "nl", "region": "NL"},
    {"code": "nl-BE", "flag": "🇧🇪", "name": "België", "locale": "nl", "region": "BE"},
    
    {"code": "ru-RU", "flag": "🇷🇺", "name": "Россия", "locale": "ru", "region": "RU"},
    
    {"code": "zh-CN", "flag": "🇨🇳", "name": "中国", "locale": "zh", "region": "CN"},
    {"code": "zh-TW", "flag": "🇹🇼", "name": "台灣", "locale": "zh", "region": "TW"},
    
    {"code": "ja-JP", "flag": "🇯🇵", "name": "日本", "locale": "ja", "region": "JP"},
    
    {"code": "ko-KR", "flag": "🇰🇷", "name": "대한민국", "locale": "ko", "region": "KR"},
    
    {"code": "ar-SA", "flag": "🇸🇦", "name": "السعودية", "locale": "ar", "region": "SA"},
    {"code": "ar-AE", "flag": "🇦🇪", "name": "الإمارات", "locale": "ar", "region": "AE"},
    {"code": "ar-EG", "flag": "🇪🇬", "name": "مصر", "locale": "ar", "region": "EG"},
    
    {"code": "hi-IN", "flag": "🇮🇳", "name": "भारत", "locale": "hi", "region": "IN"},
    
    {"code": "tr-TR", "flag": "🇹🇷", "name": "Türkiye", "locale": "tr", "region": "TR"},
    
    {"code": "pl-PL", "flag": "🇵🇱", "name": "Polska", "locale": "pl", "region": "PL"},
    
    {"code": "sv-SE", "flag": "🇸🇪", "name": "Sverige", "locale": "sv", "region": "SE"},
    
    {"code": "da-DK", "flag": "🇩🇰", "name": "Danmark", "locale": "da", "region": "DK"},
    
    {"code": "fi-FI", "flag": "🇫🇮", "name": "Suomi", "locale": "fi", "region": "FI"},
    
    {"code": "no-NO", "flag": "🇳🇴", "name": "Norge", "locale": "no", "region": "NO"},
    
    {"code": "el-GR", "flag": "🇬🇷", "name": "Ελλάδα", "locale": "el", "region": "GR"},
    
    {"code": "he-IL", "flag": "🇮🇱", "name": "ישראל", "locale": "he", "region": "IL"},
    
    {"code": "th-TH", "flag": "🇹🇭", "name": "ประเทศไทย", "locale": "th", "region": "TH"},
    
    {"code": "vi-VN", "flag": "🇻🇳", "name": "Việt Nam", "locale": "vi", "region": "VN"},
    
    {"code": "id-ID", "flag": "🇮🇩", "name": "Indonesia", "locale": "id", "region": "ID"},
    
    {"code": "cs-CZ", "flag": "🇨🇿", "name": "Česko", "locale": "cs", "region": "CZ"},
    
    {"code": "hu-HU", "flag": "🇭🇺", "name": "Magyarország", "locale": "hu", "region": "HU"},
    
    {"code": "ro-RO", "flag": "🇷🇴", "name": "România", "locale": "ro", "region": "RO"},
]

def generate():
    output_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "countries.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(COUNTRIES_DATA, f, ensure_ascii=False, indent=2)
    print(f"Généré : {output_path} avec {len(COUNTRIES_DATA)} pays.")

if __name__ == "__main__":
    generate()
