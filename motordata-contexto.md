# Motordata — Resumen completo de contexto

## Proyecto

Estás trabajando en el proyecto:

```txt
motordata-web
```

Stack confirmado:

```txt
Next.js
TypeScript
Tailwind CSS
PowerShell en Windows
```

Objetivo actual del proyecto:

```txt
Motordata: web/buscador de vehículos con estética tipo mobile.de, administración de autos, importación CSV y soporte para múltiples imágenes por vehículo.
```

---

## Regla de trabajo acordada

Trabajar **siempre de a 1 paso por vez**.

No avanzar con varios cambios juntos. Cada paso debe ser aplicado, probado y confirmado antes de seguir.

---

# Estado técnico confirmado

## 1. Modelo de datos de vehículos

Archivo:

```txt
types/vehicle.ts
```

Ya fue migrado correctamente de:

```ts
image: string;
```

a:

```ts
images: string[];
```

Estado confirmado:

```txt
images: string[] ya existe en types/vehicle.ts
no quedan usos válidos de image singular en el código revisado
```

---

## 2. Búsqueda de usos viejos de `image`

Se corrieron estas búsquedas en PowerShell:

```powershell
Get-ChildItem -Path app,components,data,scripts,types -Recurse -File | Select-String -Pattern "image:"
```

Resultado:

```txt
sin resultados relevantes
```

También se buscó:

```powershell
Get-ChildItem -Path app,components,data,scripts,types -Recurse -File | Select-String -Pattern "\.image"
```

Resultado:

```txt
los usos encontrados ya eran car.images o vehicle.images
```

Conclusión:

```txt
la migración a images[] ya está aplicada
```

---

## 3. Build

Se corrió:

```powershell
npm run build
```

Resultado confirmado:

```txt
build OK
```

---

# Administración de vehículos

## Archivo trabajado

```txt
app/admin/autos/page.tsx
```

Al principio estaba hardcodeado con:

```tsx
Todavía no hay vehículos cargados.
```

Y no leía:

```txt
data/vehicles.ts
```

Se corrigió agregando:

```tsx
import { vehicles } from "@/data/vehicles";
```

---

## Estado de `data/vehicles.ts`

Se verificó que existe:

```txt
data/vehicles.ts
```

Y que contiene vehículos.

La página `/admin/autos` ahora lee correctamente:

```tsx
vehicles
```

Cantidad confirmada:

```txt
10 vehículos
```

---

## Funcionalidad actual de `/admin/autos`

La administración ya muestra:

```txt
10 vehículos listados
imagen principal desde car.images[0]
fallback /placeholder-car.png
contador de imágenes
miniaturas de imágenes
máximo 4 miniaturas visibles
indicador +N si hay más de 4 imágenes
diseño funcionando
build OK
```

---

## Estética de administración

Se rehízo `app/admin/autos/page.tsx` con estética inspirada en mobile.de:

```txt
fondo gris claro
cards blancas
bordes suaves
sombras suaves
azul institucional
amarillo de acento
botón Ver detalle en azul
contador de vehículos
buscador visual superior
```

Colores usados:

```txt
Fondo: #f4f6f8
Texto principal: #0b1f33
Azul: #063b75
Azul hover: #052f5f
Amarillo: #f5c400
Amarillo hover: #e5b800
```

El archivo completo fue reemplazado por una versión nueva y quedó:

```txt
sin errores
```

---

# Home / Buscador público

## Archivo trabajado

```txt
app/page.tsx
```

Este archivo fue identificado como el archivo correcto de la home/buscador.

Se reemplazó completo por una versión estética con:

```txt
header claro
hero grande
card principal de buscador
filtros principales
filtros avanzados desplegables
cards informativas inferiores
colores consistentes con administración
```

Colores usados:

```txt
Fondo: #f4f6f8
Texto principal: #0b1f33
Azul: #063b75
Azul hover: #052f5f
Amarillo: #f5c400
Amarillo hover: #e5b800
Cards: blanco
Bordes: gray-200 / gray-300
```

---

## Importante: home pública no debe ir a administración

Se detectó que el header de la home tenía un botón:

```tsx
<a href="/admin/autos">Administración</a>
```

Ese acceso **no debe estar en el buscador público**.

Se indicó reemplazarlo por un botón interno hacia el buscador:

```tsx
<a
  href="#buscar"
  className="rounded-full bg-[#f5c400] px-5 py-2 text-sm font-bold text-[#0b1f33] transition hover:bg-[#e5b800]"
>
  Buscar vehículos
</a>
```

Y agregar `id="buscar"` en la sección del buscador:

```tsx
<section id="buscar" className="-mt-6 px-4">
```

---

# Buscador público — Estado funcional

## Situación actual

El buscador fue diseñado visualmente, pero sus botones todavía no tenían funcionalidad real.

Se confirmó:

```txt
los botones del buscador no funcionan todavía
```

Para iniciar interactividad, se convirtió `app/page.tsx` en componente cliente agregando arriba de todo:

```tsx
"use client";

import { useState } from "react";
```

Estado confirmado:

```txt
sin errores
```

---

## Estado de filtros creado

Dentro de:

```tsx
export default function Home() {
```

Se agregó el estado:

```tsx
const [filters, setFilters] = useState({
  brand: "",
  model: "",
  version: "",
  priceMin: "",
  priceMax: "",
  yearMin: "",
  yearMax: "",
  kilometersMax: "",
  province: "",
  city: "",
  fuel: "",
  transmission: "",
  color: "",
  scoreMin: "",
  sortBy: "",
});
```

Y la función para limpiar:

```tsx
const clearFilters = () => {
  setFilters({
    brand: "",
    model: "",
    version: "",
    priceMin: "",
    priceMax: "",
    yearMin: "",
    yearMax: "",
    kilometersMax: "",
    province: "",
    city: "",
    fuel: "",
    transmission: "",
    color: "",
    scoreMin: "",
    sortBy: "",
  });
};
```

Estado confirmado:

```txt
0 errores
```

---

## Botón Limpiar

El botón `Limpiar` fue conectado a:

```tsx
onClick={clearFilters}
```

Quedando así:

```tsx
<button
  type="button"
  onClick={clearFilters}
  className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
>
  Limpiar
</button>
```

Estado confirmado:

```txt
0 errores
```

---

## Campo Marca

Se empezó a conectar el campo `Marca` al estado.

El select de Marca debe quedar así:

```tsx
<select
  value={filters.brand}
  onChange={(e) =>
    setFilters({
      ...filters,
      brand: e.target.value,
    })
  }
  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#063b75] focus:ring-2 focus:ring-[#063b75]/10"
>
```

Todavía no se confirmó si este último cambio fue aplicado. La última instrucción antes de pedir el resumen fue conectar el campo Marca.

---

# Campos visuales existentes en el buscador

## Filtros principales

```txt
Marca
Modelo
Versión
Precio desde
Precio hasta
Año desde
Año hasta
```

## Filtros avanzados

Dentro de `<details>`:

```txt
Kilómetros hasta
Provincia
Ciudad
Combustible
Transmisión
Color
Score mínimo
Ordenar por
```

## Botones existentes

```txt
Limpiar
Buscar vehículos
```

Estado funcional:

```txt
Limpiar ya tiene función asignada si el cambio fue pegado
Buscar vehículos todavía no tiene función real
los campos todavía deben conectarse uno por uno al estado filters
```

---

# Próximos pasos recomendados

Continuar de a un paso:

## Paso siguiente probable

Confirmar si el select `Marca` quedó conectado y compila con 0 errores.

Después conectar los campos uno por uno:

```txt
Modelo
Versión
Precio desde
Precio hasta
Año desde
Año hasta
Kilómetros hasta
Provincia
Ciudad
Combustible
Transmisión
Color
Score mínimo
Ordenar por
```

Luego implementar:

```txt
botón Buscar vehículos
filtrado real usando data/vehicles.ts
resultados visibles debajo del buscador
filtros dependientes reales Marca → Modelo → Versión
botón Limpiar limpiando visualmente todos los campos
```

---

# Comandos útiles usados

Buscar `image:`:

```powershell
Get-ChildItem -Path app,components,data,scripts,types -Recurse -File | Select-String -Pattern "image:"
```

Buscar `.image`:

```powershell
Get-ChildItem -Path app,components,data,scripts,types -Recurse -File | Select-String -Pattern "\.image"
```

Ver archivos en `data`:

```powershell
Get-ChildItem -Path data
```

Build:

```powershell
npm run build
```

Dev server:

```powershell
npm run dev
```

Rutas relevantes:

```txt
http://localhost:3000
http://localhost:3000/admin/autos
```

---

# Criterios visuales acordados

La estética debe parecerse a mobile.de, pero adaptada a Motordata:

```txt
limpia
clara
marketplace automotor
fondo gris claro
cards blancas
bordes suaves
azul institucional
amarillo como acento principal
botones visibles
filtros atractivos
campos avanzados bien presentados
```

La administración y el buscador público deben compartir identidad visual.

---

# Restricción importante

La home pública `/` no debe enviar a `/admin/autos`.

La administración debe quedar separada. El buscador público debe orientarse a usuarios finales.
