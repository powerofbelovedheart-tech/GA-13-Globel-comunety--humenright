# GA-13-Globel-comunety--humenright
Hva er GA-13? GA-13 er en samfunnsplattform bygget for mennesker som vil stå sterkere: i møte med systemet, i møte med seg selv, og i møte med hverandre. Vi kombinerer samarbeid, åpenhet og teknologi for å gjøre det enklere å finne rett informasjon, få støtte – og bli hørt.
# GA-13 · Global Community & Human Rights

En åpen plattform for historier, rettighetsveiledning og trygt kjøp & salg.

## Teknologi
- Node.js + Express (server)
- JWT for auth
- Multer for opplasting
- Stripe (kortbetaling, valgfritt)
- Ren HTML/CSS/JS (public/)

## Kom i gang
```bash
npm install
cp .env.example .env  # fyll inn JWT_SECRET (+ STRIPE_SECRET om ønskelig)
npm start
# åpne http://localhost:3000