# 3D Modeliai — Instrukcija (Luxurio Home)

## Kas tai ir kaip veikia?

Kiekvienam produktui galima priskirti 3D modelio failą (`.glb` formatas). Kai failas priskirtas, produkto puslapyje virš nuotraukų atsiranda du mygtukai: **Photos** ir **3D View**. Paspaudus **3D View**, vartotojas gali:

- Sukti modelį bet kokiu kampu (laikydamas pelę / pirštu)
- Priartinti ir tolinti
- Mobiliuose įrenginiuose — peržiūrėti baldą tikroje aplinkoje naudojant **AR (papildytą realybę)** — tiesiog paspaudžia „View in your space" mygtuką

Technologija: [Google `<model-viewer>`](https://modelviewer.dev/) — nemokamas, veikia visose naršyklėse, AR veikia „Android" (ARCore) ir „iPhone" (ARKit / QuickLook).

---

## Kaip sukurti `.glb` failą?

`.glb` yra standartinis 3D formato failas (glTF Binary). Jį galima gauti keliais būdais:

### Variantas A — Užsakyti pas 3D dizainerį (rekomenduojama)
1. Raskite freelancerį platformose: [Upwork](https://upwork.com), [Fiverr](https://fiverr.com), arba [Sketchfab Store](https://sketchfab.com/store)
2. Atsiųskite jiems produkto nuotraukas iš visų pusių + matmenis
3. Paprašykite `.glb` failo, optimizuoto žiniatinkliui (iki ~10 MB)
4. Kaina: apie 50–200 € už vienetą, priklausomai nuo sudėtingumo

### Variantas B — Nuskaityti su telefonu (nemokama)
- **iPhone 12 Pro ar naujesnis** (su LiDAR): naudokite programėlę **Polycam** arba **Scaniverse**
- **Android**: naudokite **Polycam** arba **KIRI Engine**
- Eksportuokite nuskenuotą objektą kaip `.glb` failą

### Variantas C — Patiems susikurti (Blender — nemokama)
1. Atsisiųskite [Blender](https://blender.org) (nemokama)
2. Susukurkite ar importuokite 3D modelį
3. Eksportuokite: `File → Export → glTF 2.0 (.glb/.gltf)` → pasirinkite **GLB**

---

## Kaip įkelti failą į sistemą?

`.glb` failas turi būti pasiekiamas per URL (nuorodą). Kelios galimybės:

### Rekomenduojama — Cloudflare R2 arba AWS S3 (nemokama iki tam tikros ribos)
1. Sukurkite paskyrą [Cloudflare](https://cloudflare.com) → R2 saugykla
2. Įkelkite `.glb` failą
3. Sukonfigūruokite viešą prieigą prie failo
4. Gausite nuorodą panašią į: `https://pub-xxxxx.r2.dev/produktas.glb`

### Paprasčiau — bet kuri failų talpinimo paslauga
- [Google Drive](https://drive.google.com) → įkelkite failą → dešinysis pelės mygtukas → „Gauti nuorodą" → pakeiskite į tiesioginę atsisiuntimo nuorodą
- [Dropbox](https://dropbox.com) → nuorodoje pakeiskite `?dl=0` į `?dl=1` (arba `raw=1`)

> **Svarbu:** Nuoroda turi būti tiesioginė į failą (pvz., baigtis `.glb`), ne failų saugyklos puslapio nuoroda.

---

## Kaip priskirti 3D modelį produktui?

1. Prisijunkite prie administravimo skydelio: `http://localhost:5173/admin`
2. Eikite į **Products**
3. Pasirinkite produktą kuriam norite pridėti 3D modelį arba sukurkite naują
4. Lauke **„3D Model URL (.glb file — optional)"** įklijuokite failo URL
5. Paspauskite **Update** (arba **Create**)

Viskas! Produkto puslapyje iškarto atsiras **3D View** mygtukas.

---

## Kaip tai atrodo vartotojui?

```
[ Photos ]  [ 3D View ]   ← du mygtukai virš produkto nuotrauko

Paspaudus "3D View":
┌─────────────────────────────┐
│                             │
│    🔄  Interaktyvus 3D      │
│    modelis — sukamas        │
│    pelės / piršto           │
│                             │
│         [AR] Peržiūrėti     │
│         tikroje aplinkoje   │
└─────────────────────────────┘
```

Mobiliame įrenginyje rodomas papildomas mygtukas leidžiantis patalpinti baldą į kambario nuotrauką realiuoju laiku.

---

## Dažni klausimai

**Koks maksimalus failo dydis?**
Rekomenduojama iki 10 MB. Didesni failai ilgai krauna. Blender ar [gltf.report](https://gltf.report/) leidžia optimizuoti ir suspausti modelį.

**Ar veikia visuose telefonuose?**
3D peržiūra veikia visur (Chrome, Safari, Firefox). AR funkcija veikia:
- Android su ARCore palaikymu (dauguma 2019+ telefonų)
- iPhone su iOS 12+ (ARKit / QuickLook)

**Produktas neturi `.glb` failo — ar vis tiek rodomas?**
Taip — jei `modelUrl` laukas tuščias, jokių papildomų mygtukų nerodoma. Viskas atrodo kaip įprastai.

**Ar galima turėti ir nuotraukas, ir 3D modelį vienu metu?**
Taip. Nuotraukos ir 3D modelis papildo vienas kitą. Vartotojas pasirenka kurį vaizdą žiūrėti.

---

## Techninis santrauka

| Elementas | Detalė |
|---|---|
| Web komponentas | `@google/model-viewer` v3.5 |
| Palaikomi formatai | `.glb`, `.gltf` |
| Įkėlimo vieta | `index.html` `<script type="module">` |
| Produkto laukas (DB) | `Product.modelUrl String?` |
| Admin forma | „3D Model URL" laukas |
| Produkto puslapis | Photos / 3D View mygtukai, `<model-viewer>` komponentas |
