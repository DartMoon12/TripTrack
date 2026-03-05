# 1. Vezmeme základní prostředí s Node.js (Alpine je odlehčená rychlá verze)
FROM node:18-alpine

# 2. Vytvoříme si uvnitř kontejneru složku /app a skočíme do ní
WORKDIR /app

# 3. Zkopírujeme soubory s informacemi o knihovnách
COPY package*.json ./

# 4. Nainstalujeme všechny závislosti (jako když píšeš npm install)
RUN npm install

# 5. Zkopírujeme celý náš projekt (zdrojové kódy, CSS, JSX...) dovnitř
COPY . .

# 6. Spustíme build (Vite to zabalí do malé, rychlé produkční složky "dist")
RUN npm run build

# 7. Nainstalujeme jednoduchý statický server pro React
RUN npm install -g serve

# 8. Otevřeme port 3000, aby aplikace mohla komunikovat se světem
EXPOSE 3000

# 9. Co se má stát, když se kontejner zapne? Spustí se server.
CMD ["serve", "-s", "dist", "-l", "3000", "-a", "0.0.0.0"]