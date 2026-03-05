import { useState, useMemo } from "react";

// ============================================================
// DATA MODEL — Operación Spano v2
// ============================================================

const ACCOMMODATIONS = {
  "2026-03-19": { name: "Novotel Madrid Center", city: "Madrid", address: "C/ O'Donnell, 53, Madrid", emoji: "🏨" },
  "2026-03-20": { name: "Novotel Madrid Center", city: "Madrid", address: "C/ O'Donnell, 53, Madrid", emoji: "🏨" },
  "2026-03-21": { name: "Novotel Madrid Center", city: "Madrid", address: "C/ O'Donnell, 53, Madrid", emoji: "🏨" },
  "2026-03-22": { name: "Residenza Alessandra", city: "Florencia", address: "Borgo SS. Apostoli, Florencia", emoji: "🏛️" },
  "2026-03-23": { name: "Residenza Alessandra", city: "Florencia", address: "Borgo SS. Apostoli, Florencia", emoji: "🏛️" },
  "2026-03-24": { name: "Residenza Alessandra", city: "Florencia", address: "Borgo SS. Apostoli, Florencia", emoji: "🏛️" },
  "2026-03-25": { name: "Residenza Alessandra", city: "Florencia", address: "Borgo SS. Apostoli, Florencia", emoji: "🏛️" },
  "2026-03-26": { name: "Il Cortile di Elisa", city: "Lucca", address: "Lucca, Toscana", emoji: "🌿" },
  "2026-03-27": { name: "Il Cortile di Elisa", city: "Lucca", address: "Lucca, Toscana", emoji: "🌿" },
  "2026-03-28": { name: "Il Cortile di Elisa", city: "Lucca", address: "Lucca, Toscana", emoji: "🌿" },
  "2026-03-29": { name: "San Giovanni in Poggio", city: "Val d'Orcia", address: "Val d'Orcia, Siena", emoji: "🌾" },
  "2026-03-30": { name: "San Giovanni in Poggio", city: "Val d'Orcia", address: "Val d'Orcia, Siena", emoji: "🌾" },
  "2026-03-31": { name: "San Giovanni in Poggio", city: "Val d'Orcia", address: "Val d'Orcia, Siena", emoji: "🌾" },
  "2026-04-01": { name: "San Giovanni in Poggio", city: "Val d'Orcia", address: "Val d'Orcia, Siena", emoji: "🌾" },
  "2026-04-02": { name: "San Giovanni in Poggio", city: "Val d'Orcia", address: "Val d'Orcia, Siena", emoji: "🌾" },
  "2026-04-03": { name: "San Giovanni in Poggio", city: "Val d'Orcia", address: "Val d'Orcia, Siena", emoji: "🌾" },
  "2026-04-04": { name: "NH Collection Gran Hotel Calderón", city: "Barcelona", address: "Rambla de Catalunya, 26", emoji: "🌊" },
  "2026-04-05": { name: "NH Collection Gran Hotel Calderón", city: "Barcelona", address: "Rambla de Catalunya, 26", emoji: "🌊" },
  "2026-04-06": { name: "NH Collection Gran Hotel Calderón", city: "Barcelona", address: "Rambla de Catalunya, 26", emoji: "🌊" },
  "2026-04-07": { name: "NH Collection Gran Hotel Calderón", city: "Barcelona", address: "Rambla de Catalunya, 26", emoji: "🌊" },
  "2026-04-08": { name: "NH Collection Gran Hotel Calderón", city: "Barcelona", address: "Rambla de Catalunya, 26", emoji: "🌊" },
};

const TYPE_CONFIG = {
  paseo:      { icon: "🚶", label: "Paseo",      color: "#4CAF50" },
  comida:     { icon: "🍽️", label: "Comida",     color: "#FF9800" },
  monumento:  { icon: "🏛️", label: "Monumento",  color: "#9C27B0" },
  transporte: { icon: "🚗", label: "Traslado",   color: "#2196F3" },
  kids:       { icon: "👶", label: "Niños",      color: "#E91E63" },
  mirador:    { icon: "📸", label: "Foto",       color: "#FF5722" },
  descanso:   { icon: "🌿", label: "Relax",      color: "#8BC34A" },
  compras:    { icon: "🛍️", label: "Compras",    color: "#607D8B" },
  checkin:    { icon: "🏨", label: "Check-in",   color: "#00BCD4" },
  cultura:    { icon: "🎨", label: "Cultura",    color: "#795548" },
};

// IDs de actividades ya confirmadas con ticket/reserva en mano
const CONFIRMED_IDS = new Set(["f5", "f10", "f15", "f17", "b4", "b11", "b15"]);

// Confirmaciones extra (no son actividades del itinerario pero sí reservas clave)
const EXTRA_CONFIRMATIONS = [
  {
    id: "auto",
    phase: "Florencia",
    date: "2026-03-26",
    time: "10:00",
    place: "Auto DRIVALIA — Jeep Renegade",
    note: "Retiro FLR aeropuerto 26/03 10:00 · Devolución 04/04 10:00 · Shuttle desde Arrivals · Depósito €500 tarjeta física · Cadenas nieve incluidas · Silla niño: €16/día a pagar en local.",
    bookingRef: "CRS IT887444450 · Conf. 1068390",
  },
];

// ── EMERGENCY OPTIONS: per city, quick activities if you have 1 free hour ──
const EMERGENCY_OPTIONS = {
  "Madrid": [
    { place: "Jardines de Cecilio Rodríguez", time: "30 min", note: "Pavos reales sueltos. Emma los persigue, Piero duerme en carriola.", type: "kids" },
    { place: "Paseo Serrano vidriera", time: "45 min", note: "Tiendas premium, aceras perfectas, sin esfuerzo.", type: "compras" },
    { place: "Terraza de la Fnac Callao", time: "20 min", note: "Vista de Gran Vía desde arriba. Gratuito.", type: "mirador" },
  ],
  "Florencia": [
    { place: "Fontana del Porcellino", time: "15 min", note: "Emma frota el hocico al jabalí → moneda → promesa de regreso.", type: "kids" },
    { place: "Loggia dei Lanzi", time: "30 min", note: "Museo de estatuas gigantes al aire libre. Gratis. Emma ve 'héroes y monstruos'.", type: "cultura" },
    { place: "Ponte Vecchio + Lungarno", time: "45 min", note: "Paseo plano, carriola perfecta, mejor luz de la tarde.", type: "paseo" },
  ],
  "Lucca": [
    { place: "Piazza dell'Anfiteatro", time: "20 min", note: "La plaza ovalada más original de Italia. Emma corre libremente.", type: "kids" },
    { place: "Muralla norte — tramo tranquilo", time: "30 min", note: "Sin bici, solo caminar. Vistas de la ciudad y los Alpes al fondo.", type: "paseo" },
    { place: "Antigua Bottega di Prospero", time: "25 min", note: "Tienda de productos locales. Ideal para comprar algo para llevar.", type: "compras" },
  ],
  "Val d'Orcia": [
    { place: "Mirador del hotel hacia el valle", time: "10 min", note: "La foto de la Toscana sin moverse del alojamiento.", type: "mirador" },
    { place: "Horti Leonini — San Quirico", time: "30 min", note: "Laberinto de arbustos renacentista. Gratis. Emma lo recorre sola.", type: "kids" },
    { place: "Carretera de cipreses más cercana", time: "20 min", note: "Cualquier camino rural del Val d'Orcia es una postal.", type: "mirador" },
  ],
  "Barcelona": [
    { place: "Paseo de Gràcia (fachadas)", time: "30 min", note: "Casa Batlló y La Pedrera vistas desde la calle. Sin entrada. Sin cola.", type: "paseo" },
    { place: "Plaça de Sant Felip Neri", time: "20 min", note: "La plaza más tranquila del Gótico. Emma juega, vos tomás café.", type: "kids" },
    { place: "Mercado de Santa Caterina (exterior)", time: "25 min", note: "El techo de mosaico de colores es pura euforia visual.", type: "mirador" },
  ],
};

const DAYS = [
  // ── MADRID ──────────────────────────────────────────────
  {
    date: "2026-03-19",
    city: "Madrid", phase: "Madrid",
    title: "Día de viaje — en tránsito",
    tip: "Intentá que los niños duerman en el avión a horario europeo.",
    activities: [
      { id: "m0", time: "Todo el día", type: "transporte", place: "En tránsito hacia Madrid", zone: "Viaje", note: "Día de viaje desde México. El itinerario activo arranca el 20 de marzo.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-03-20",
    city: "Madrid", phase: "Madrid",
    title: "Anclaje del Retiro — Protocolo Jet Lag",
    tip: "🚨 Prohibido siesta larga antes de las 20:30. La luz solar de tarde es tu herramienta.",
    activities: [
      { id: "m1", time: "11:30", type: "transporte", place: "Barajas → Novotel Madrid Center", zone: "Madrid Centro", note: "Traslado privado. Solicitar cuna al hacer check-in.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10 },
      { id: "m2", time: "13:30", type: "comida", place: "Taberna Laredo", zone: "Dr. Castelo, 30", note: "6 min caminando del hotel. Menú de mediodía de producto puro. Muy cómodo con Piero en carriola.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 12, altRestaurants: ["La Montería (frente al Retiro)", "Trattoria Sostanza (opción backup)"] },
      { id: "m3", time: "16:00", type: "paseo", place: "Parque del Retiro — Palacio de Cristal", zone: "Retiro", note: "Entrar por Puerta de Madrid. Estructura de vidrio e ingeniería — Emma lo verá como 'el palacio de cristal de los cuentos'.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5, altActivities: ["Madrid Río (15 min taxi, juegos diseño)", "ABC Serrano si llueve"] },
      { id: "m4", time: "16:30", type: "kids", place: "Jardines de Cecilio Rodríguez — Pavos reales", zone: "Retiro", note: "Dentro del Retiro. Pavos reales sueltos. Emma los persigue. Pavimento liso para Piero.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 15 },
      { id: "m5", time: "19:30", type: "comida", place: "La Montería", zone: "Frente al Retiro", note: "Taberna auténtica, cero pretensiones, calidad imbatible. Cena ligera.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 8 },
      { id: "m6", time: "20:30", type: "descanso", place: "Hotel — A dormir", zone: "Novotel", note: "FIN DEL DÍA. Sincronizar sueño de los niños con horario europeo es la prioridad.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-03-21",
    city: "Madrid", phase: "Madrid",
    title: "Centro Histórico · Sol · La Latina · Sabatini",
    tip: "El único día real en Madrid. Eje continuo: Sol → Plaza Mayor → La Latina → Sabatini. Todo a pie o metro, sin taxi.",
    activities: [
      { id: "m7", time: "08:30", type: "comida", place: "Desayuno buffet Novotel", zone: "Novotel O'Donnell", note: "Segundo ancle horario del jet lag. Emma y Piero incluidos gratis. No saltear.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "m7b", time: "10:00", type: "transporte", place: "Metro O'Donnell → Sol", zone: "Línea 9 / L2", note: "L9 desde O'Donnell → Príncipe de Vergara → transbordo L2 → Sol. ~15 min. Alternativa: taxi directo ~€10 con carriola y bebé.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "m8", time: "10:30", type: "mirador", place: "Puerta del Sol — El Oso y el Madroño", zone: "Sol", note: "Kilómetro cero de España. Foto con la estatua de bronce — Emma lo va a querer tocar. Siempre hay fila pero avanza rápido.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5 },
      { id: "m9", time: "11:00", type: "monumento", place: "Plaza Mayor", zone: "Centro Histórico", note: "Una de las plazas más impresionantes de Europa — escala monumental, soportales del s.XVII. Entrar por Arco de Cuchilleros (sin escalones).", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 3 },
      { id: "m9b", time: "11:45", type: "paseo", place: "Mercado de San Miguel — Solo arquitectura", zone: "Plaza Mayor", note: "Entrar a ver la estructura de hierro del s.XIX — visualmente increíble. Tomar 1-2 tapas en barra (Gildas, croquetas) y salir. NO almorzar aquí con niños.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 8 },
      { id: "m10", time: "13:00", type: "paseo", place: "Calle Cava Baja — La Latina", zone: "La Latina", note: "El eje de tapas más auténtico de Madrid. 10 min desde Plaza Mayor bajando por C/ Toledo. Tiendas de productos locales sin presión de lujo.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5 },
      { id: "m10b", time: "13:30", type: "comida", place: "Taberna Txakolina", zone: "Cava Baja, 26 · La Latina", note: "Pintxos vascos de nivel. Sin reserva — llegar al abrir (13:30). Si hay fila: Casa Lucas (Cava Baja 30) o Juana la Loca (Plaza Puerta de Moros 4).", essential: true, carriola: false, effort: "bajo", needsReserve: false, walkMinsToNext: null, altRestaurants: ["Casa Lucas — Cava Baja 30", "Juana la Loca — Pl. Puerta de Moros 4"] },
      { id: "m11", time: "16:00", type: "paseo", place: "Jardines de Sabatini + Palacio Real", zone: "Ópera", note: "Desde La Latina: taxi ~€6 o 15 min caminando por C/ Bailén. Jardines formales con vistas a la fachada norte del Palacio. Carriola perfecta, Emma corre libre.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5, altActivities: ["Plaza de Oriente si tienen energía (5 min a pie)", "Terraza Novotel 7ª planta si están al límite"] },
      { id: "m11b", time: "20:00", type: "comida", place: "La Catapa", zone: "Barrio Retiro", note: "Taberna de mercado, mejor calidad/precio de la zona. Metro Ópera → Goya (~20 min). Reservar muy recomendado.", essential: false, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null },
    ]
  },
  // ── FLORENCIA ────────────────────────────────────────────
  {
    date: "2026-03-22",
    city: "Florencia", phase: "Florencia",
    title: "Madrid → Florencia · Llegada al Lungarno",
    tip: "✈️ Vuelo IB/VY 14:30 Barajas T4 → Florencia ~17:00. Primera caminata: Lungarno al atardecer — carriola perfecta.",
    activities: [
      { id: "m12", time: "09:30", type: "comida", place: "Mercado de la Paz — Casa Dani", zone: "Barrio Salamanca · Madrid", note: "Mercado de locales, sin turistas. La tortilla de Casa Dani: considerada la mejor de España. Pedir para llevar si hay cola.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 30 },
      { id: "m13", time: "12:15", type: "transporte", place: "✈️ Vuelo Madrid → Florencia · 14:30 T4", zone: "Barajas T4 · Madrid", note: "Llegar 2h antes. Iberia/Vueling desde T4. Piero y Emma: snacks en bolso de mano. Llegada GRS ~17:00.", essential: true, carriola: true, effort: "medio", needsReserve: false, walkMinsToNext: null },
      { id: "f1", time: "17:30", type: "checkin", place: "Residenza Alessandra", zone: "Borgo SS. Apostoli · Florencia", note: "Check-in. Calle tranquila pese a estar en el corazón de todo. Solicitar cuna para Piero.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 3 },
      { id: "f2", time: "18:00", type: "paseo", place: "Lungarno Acciaiuoli → Ponte Vecchio", zone: "Lungarno", note: "Calle que bordea el río. Amplia, plana, ideal carriola. Mejor vista del Ponte Vecchio al atardecer.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5, altActivities: ["Ponte Santa Trinita", "Piazza della Repubblica"] },
      { id: "f3", time: "20:00", type: "comida", place: "Osteria del Cinghiale Bianco", zone: "Oltrarno", note: "7-8 min del hotel cruzando el Arno por el Ponte Vecchio. Auténtica, sin filtro turístico.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-03-23",
    city: "Florencia", phase: "Florencia",
    title: "Florencia Medieval + El Oro",
    tip: "Museo dell'Opera tiene reserva 11:30. No pedir cappuccino después de las 11 (ley italiana).",
    activities: [
      { id: "f4", time: "09:00", type: "comida", place: "Ditta Artigianale o bar de barrio", zone: "Centro", note: "Cornetto + cappuccino. No pedir cappuccino después de las 11.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10 },
      { id: "f5", time: "11:30", type: "monumento", place: "Museo dell'Opera del Duomo", zone: "Duomo", note: "GHIBERTI PASS — Santa Reparata 11:30 EXACTO (horario fijo, irrenunciable). Acceso Baptistero: Puerta Norte. Museo: Piazza Duomo 9. ⚠️ SIN MOCHILAS — guardarlas en Piazza Duomo 38/r. Nota: el David de Donatello está en el Bargello (Via del Proconsolo 4, ~€8, 10 min a pie) — si sobra tiempo antes o después vale la visita.", bookingRef: "87-I2L8Z8Z · SPNY4S4ESFWA", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: 8 },
      { id: "f6", time: "13:00", type: "kids", place: "Fontana del Porcellino — Mercato Nuovo", zone: "Centro", note: "Emma frota el hocico al jabalí de bronce y pone moneda: asegura regreso a Florencia.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 12 },
      { id: "f7", time: "13:30", type: "comida", place: "Mercado de Sant'Ambrogio — Da Rocco", zone: "Sant'Ambrogio", note: "Trabajadores locales, comer de pie o en banquito, pasta del día. Lo más auténtico.", essential: false, carriola: false, effort: "bajo", needsReserve: false, walkMinsToNext: 15, altRestaurants: ["Trattoria da Ruggero", "Buca dell'Orafo"] },
      { id: "f8", time: "15:30", type: "paseo", place: "Barrio de Dante — callejuelas s.XIII", zone: "Centro Storico", note: "Emma busca 'escudos de piedra' en las paredes. Torre della Castagna.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 20, altActivities: ["Via de' Tornabuoni", "Piazza della Repubblica"] },
      { id: "f9", time: "20:00", type: "comida", place: "Trattoria Sostanza", zone: "Santa Maria Novella", note: "HISTÓRICO (1869). Solo efectivo. Pedir taglierini al burro o pollo al burro — los platos firma de la casa. Llegar puntual.", essential: true, carriola: false, effort: "bajo", needsReserve: true, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-03-24",
    city: "Florencia", phase: "Florencia",
    title: "Los Médici y La Gran Plaza",
    tip: "Galería Accademia reserva 8:15 — primer turno sin multitudes. El David mide 5.17m.",
    activities: [
      { id: "f10", time: "08:15", type: "monumento", place: "Galería de la Accademia — El David", zone: "San Marco", note: "Primer turno = sin multitudes. Emma verá 'al gigante'. El David original mide 5.17m. Jonathan ID76 · Ginamaria ID77 · Emma ID78 (gratuito) · Piero ID79 (gratuito).", bookingRef: "Orden 22048110 · Cod. 3847123", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: 8 },
      { id: "f11", time: "10:00", type: "monumento", place: "Palazzo Medici Riccardi", zone: "San Lorenzo", note: "La Capilla dei Magi: el fresco más secreto de Florencia. Pequeño y manejable con niños.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 12 },
      { id: "f12", time: "11:30", type: "paseo", place: "Via Calzaiuoli → Piazza della Signoria", zone: "Centro", note: "Peatonal y ancha. Loggia dei Lanzi = museo gratis al aire libre con estatuas gigantes.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 15, altActivities: ["Uffizi desde afuera", "Scalinata degli Uffizi"] },
      { id: "f13", time: "13:00", type: "comida", place: "4 Leoni — Oltrarno", zone: "Oltrarno", note: "Plaza tranquila, comida honesta, excelente para el ritmo familiar.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10, altRestaurants: ["I' Girone De' Ghiotti (panino de trufa en escalones Loggia)", "Il Latini"] },
      { id: "f14", time: "15:00", type: "paseo", place: "Oltrarno — Via Maggio + Piazza Santo Spirito", zone: "Oltrarno", note: "Talleres de marcos y restauración abiertos. La Florencia que trabaja, no la que posa.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 20 },
      { id: "f15", time: "19:00", type: "comida", place: "Buca Mario", zone: "Centro", note: "La mejor Bistecca alla Fiorentina. Pedirla al punto (rosada). ⚠️ Reserva para 3 personas (no 4 — Piero en brazos). Confirmado a las 19:00.", bookingRef: "#159019194", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-03-25",
    city: "Florencia", phase: "Florencia",
    title: "El Pasillo Secreto + Las Alturas",
    tip: "Uffizi: sala Botticelli es la key. Con niños máximo 90 min. Reserva obligatoria.",
    activities: [
      { id: "f16", time: "09:00", type: "comida", place: "Ditta Artigianale (Via dello Sprone)", zone: "Oltrarno", note: "La mejor versión del desayuno florentino. Sin turistas, panadería artesanal.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5 },
      { id: "f17", time: "09:30", type: "monumento", place: "Galería Uffizi", zone: "Piazza della Signoria", note: "Sala Botticelli (La Primavera, Venus) es la clave. Máx 90 min con niños. Jonathan €29 · Ginamaria €29 · Emma gratis · Piero gratis.", bookingRef: "S2KWT8Y2 · PNR Uffizi", essential: true, carriola: true, effort: "medio", needsReserve: true, walkMinsToNext: 10 },
      { id: "f18", time: "12:00", type: "paseo", place: "Corredor Vasariano exterior + Ponte Vecchio", zone: "Lungarno", note: "Ver las ventanitas redondas del corredor secreto de los Médici desde afuera. Cruzar el Ponte.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 20 },
      { id: "f19", time: "13:30", type: "comida", place: "Coquinarius", zone: "Duomo", note: "Refinado, despedida italiana. Crostini, tartufata, vino Chianti.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 25 },
      { id: "f20", time: "15:00", type: "paseo", place: "Jardín Bardini", zone: "Oltrarno", note: "Vistas bestiales de Florencia desde arriba. Más tranquilo que Boboli.", essential: false, carriola: false, effort: "medio", needsReserve: false, walkMinsToNext: 30, altActivities: ["Palazzo Pitti (jardines exteriores)", "San Miniato al Monte por Rampe del Poggi"] },
      { id: "f21", time: "19:00", type: "comida", place: "Fuori Porta — Enoteca", zone: "San Miniato", note: "Vinos naturales y vista a San Miniato. Cena perfecta de cierre florentino.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },

  // ── LUCCA ────────────────────────────────────────────────
  {
    date: "2026-03-26",
    city: "Lucca", phase: "Lucca",
    title: "Desembarco en Lucca",
    tip: "🚨 Check-in: confirmar matrícula del auto en el sistema ZTL — si no, multa automática.",
    activities: [
      { id: "l1", time: "09:00", type: "transporte", place: "Florencia → Pistoia → Lucca", zone: "A11", note: "Parada en Pistoia (40 min desde Florencia): Plaza del Duomo sin multitudes + Hospital del Ceppo. Parking: Parcheggio Pertini.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "l2", time: "12:00", type: "checkin", place: "Il Cortile di Elisa", zone: "Lucca Centro", note: "ACCIÓN CRÍTICA: Confirmar matrícula en sistema ZTL.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 8 },
      { id: "l3", time: "13:30", type: "comida", place: "Buca di Sant'Antonio", zone: "Via della Cervia, 3", note: "Estándar de oro en Lucca. Amplio, familiar.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: 10, altRestaurants: ["Trattoria Da Leo (€25-35, llegar 19:30)", "Osteria Baralla"] },
      { id: "l4", time: "15:30", type: "kids", place: "Murallas de Lucca en bicicleta", zone: "Murallas", note: "Alquilar bici con silla para Emma. El mejor paseo del viaje para Piero: sin tráfico, carriola perfecta.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 20 },
      { id: "l5", time: "20:30", type: "comida", place: "L'Imbuto — Chef Cristiano Tomei", zone: "Fuera de las murallas (verificar dirección exacta en limbuto.it)", note: "⚠️ Restaurante mudado fuera de las murallas — confirmar dirección exacta en limbuto.it o llamar al +39 331 930 8931 antes de ir. Sin menú fijo: elegís número de platos (6-10), el chef decide. ~€130/persona sin vino.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-03-27",
    city: "Lucca", phase: "Lucca",
    title: "Finalissima Day — Lucca + Partido",
    tip: "Opción A Viareggio (recomendada): 2km frente al mar, carriola perfecta, The Red Lion para el partido.",
    activities: [
      { id: "l6", time: "10:00", type: "kids", place: "Piazza Napoleone — Calesita histórica", zone: "Centro Lucca", note: "Calesita para Emma. Luego Iglesia de San Michele en Foro.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5 },
      { id: "l7", time: "13:30", type: "comida", place: "Pan di Strada", zone: "Centro Lucca", note: "Focaccias premium. Rápido, sin sentarse, para no perder tiempo.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "l8", time: "15:00", type: "transporte", place: "Despliegue → ciudad del partido", zone: "Toscana", note: "A: Viareggio (Passeggiata + The Red Lion 19:00) · B: Pisa (Giardino Scotto) · C: Livorno (Terrazza Mascagni + Surfer Joe)", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-03-28",
    city: "Lucca", phase: "Lucca",
    title: "Torre Guinigi + Suministros Val d'Orcia",
    tip: "Torre Guinigi: dejar carriola abajo, Piero en portabebés. 230 escalones.",
    activities: [
      { id: "l9", time: "09:30", type: "monumento", place: "Torre Guinigi — árboles en la cima", zone: "Centro Lucca", note: "CARRIOLA NO. Piero en portabebés. 230 escalones. El ícono de Lucca.", essential: true, carriola: false, effort: "alto", needsReserve: false, walkMinsToNext: 10 },
      { id: "l10", time: "12:30", type: "comida", place: "Gigi Trattoria", zone: "Piazza del Carmine", note: "Cocina honesta, ingredientes de proximidad. Sin pretensiones.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 8, altRestaurants: ["Osteria San Giorgio", "Buca di Sant'Antonio"] },
      { id: "l11", time: "15:00", type: "kids", place: "Piazza dell'Anfiteatro + Juegos Emma", zone: "Anfiteatro", note: "La plaza ovalada de forma de anfiteatro romano. Emma corre libre.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5 },
      { id: "l12", time: "16:00", type: "compras", place: "Antica Bottega di Prospero — Suministros", zone: "Centro Lucca", note: "Comprar legumbres, aceites y vinos para llevar al Val d'Orcia.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 15 },
      { id: "l13", time: "20:00", type: "comida", place: "Ristorante All'Olivo — Despedida Lucca", zone: "Via de' Paoli, 1", note: "Formal, pescados excelentes, bodega técnica.", essential: false, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null },
    ]
  },

  // ── VAL D'ORCIA ──────────────────────────────────────────
  {
    date: "2026-03-29",
    city: "Val d'Orcia", phase: "Val d'Orcia",
    title: "Traslado Estratégico + Pienza al Atardecer",
    tip: "Salir en la primera ventana de sueño de Piero. Via dell'Amore en Pienza: la mejor luz es a las 18:00.",
    activities: [
      { id: "v1", time: "08:30", type: "transporte", place: "Lucca → San Miniato → Val d'Orcia", zone: "Autopista", note: "Salir en primera ventana de sueño de Piero (2h de trayecto).", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "v2", time: "10:15", type: "paseo", place: "San Miniato — Rocca di Federico II", zone: "San Miniato", note: "Vistas de 360° de la Toscana. Capital de la trufa blanca. Almorzar aquí.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "v3", time: "13:30", type: "paseo", place: "Monteriggioni (opcional)", zone: "A1", note: "Pueblo circular amurallado. 20 min. Solo si los tiempos lo permiten.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "v4", time: "15:30", type: "checkin", place: "San Giovanni in Poggio", zone: "Val d'Orcia", note: "Check-in. Descanso 1 hora antes de Pienza.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "v5", time: "18:00", type: "paseo", place: "Pienza — Via dell'Amore + Via del Bacio", zone: "Pienza", note: "Calles colgantes sobre el valle con luz espectacular al atardecer. Catedral Renacentista.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5 },
      { id: "v6", time: "20:00", type: "comida", place: "Sette di Vino — Pienza", zone: "Pienza", note: "Local pequeño. Llamar por teléfono para reservar. Muy buscado.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null, altRestaurants: ["La Bandita Townhouse", "Trattoria da Fiorella"] },
    ]
  },
  {
    date: "2026-03-30",
    city: "Val d'Orcia", phase: "Val d'Orcia",
    title: "Bagno Vignoni + Granja de Emma",
    tip: "Podere Il Casale: reservar ANTES tour de granja + cena. Los cupos son limitados.",
    activities: [
      { id: "v19", time: "10:30", type: "paseo", place: "Bagno Vignoni — Plaza Termal", zone: "Bagno Vignoni", note: "La plaza central ES una piscina termal de 2000 años. Parco dei Mulini: molinos en la roca.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5 },
      { id: "v20", time: "13:00", type: "comida", place: "Bistrot Languorino", zone: "Bagno Vignoni", note: "Cocina de territorio, vista al valle.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null, altRestaurants: ["Osteria del Leone", "La Bottega di Cacio (barato)"] },

    ]
  },
  {
    date: "2026-03-31",
    city: "Val d'Orcia", phase: "Val d'Orcia",
    title: "Siena — Inmersión Total (Día y Noche)",
    tip: "El momento mágico es a las 18:30 en la Piazza del Campo: sentarse en el suelo como los locales.",
    activities: [
      { id: "v7", time: "11:30", type: "transporte", place: "San Giovanni → Siena", zone: "Siena", note: "Llegar a las 11:30 evitando el pico de las 9:00. Niños descansados para el día más intenso.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "v8", time: "13:00", type: "comida", place: "Calles laterales Piazza del Campo", zone: "Siena Centro", note: "Via Giovanni Duprè o similares. Evitar precios turísticos de la plaza.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10, altRestaurants: ["Osteria degli Svitati", "Salumeria il Cencio (rápido)"] },
      { id: "v9", time: "14:30", type: "monumento", place: "Duomo de Siena + Librería Piccolomini", zone: "Siena", note: "El suelo de mármol es único en el mundo. Librería: frescos más vívidos de Italia.", essential: true, carriola: true, effort: "medio", needsReserve: false, walkMinsToNext: 8 },
      { id: "v10", time: "16:30", type: "mirador", place: "Facciatone — Vista aérea de Siena", zone: "Siena", note: "Si Emma y vos tienen energía. La mejor vista de la ciudad.", essential: false, carriola: false, effort: "medio", needsReserve: false, walkMinsToNext: 5 },
      { id: "v11", time: "18:30", type: "paseo", place: "Piazza del Campo — Sentarse en el suelo", zone: "Siena", note: "MOMENTO MÁGICO. Sentarse como los locales a ver encenderse las luces del Palazzo Pubblico.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10 },
      { id: "v12", time: "20:00", type: "comida", place: "Osteria Permalico o La Taverna di San Giuseppe", zone: "Siena", note: "Cenar en Siena y regresar al hotel (45 min).", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-04-01",
    city: "Val d'Orcia", phase: "Val d'Orcia",
    title: "Montepulciano + Atardecer en la Z",
    tip: "🚨 Portabebé obligatorio en Montepulciano. Las subidas son intensas.",
    activities: [
      { id: "v13", time: "10:00", type: "paseo", place: "Montepulciano — Piazza Grande", zone: "Montepulciano", note: "Donde se filmó Crepúsculo. Subidas intensas: PORTABEBÉ para Piero obligatorio.", essential: true, carriola: false, effort: "alto", needsReserve: false, walkMinsToNext: 5 },
      { id: "v14", time: "11:00", type: "cultura", place: "Cantina Redi — Subterránea", zone: "Montepulciano", note: "Una catedral bajo tierra. Uno de los espacios más impresionantes del viaje.", essential: false, carriola: false, effort: "bajo", needsReserve: false, walkMinsToNext: 10 },
      { id: "v15", time: "13:00", type: "comida", place: "La Vineria — Montepulciano", zone: "Montepulciano", note: "Vino Nobile de Montepulciano. Pedir el pici al cinghiale.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 20, altRestaurants: ["Osteria Acquacheta (carne)", "Porta di Bacco"] },
      { id: "v16", time: "15:00", type: "kids", place: "Templo de San Biagio — Prados abiertos", zone: "Montepulciano base", note: "Al pie del pueblo. Grandes prados para que Emma corra sin límites.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 15 },
      { id: "v21", time: "16:30", type: "kids", place: "Podere Il Casale — Granja biológica", zone: "Pienza", note: "Emma ve pavos reales, cabras y cerdos. Ustedes: cata de Pecorino frente al valle.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null },
      { id: "v22", time: "19:30", type: "comida", place: "Cena en Podere Il Casale", zone: "Pienza", note: "Cenar en el mismo lugar del tour. Pecorino propio, vinos de la granja, vista al valle. Regreso al hotel ~20 min.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-04-02",
    city: "Val d'Orcia", phase: "Val d'Orcia",
    title: "Sant'Antimo + Montalcino + Brunello",
    tip: "Sant'Antimo a las 11:00 para chance de escuchar cantos gregorianos. Experiencia de profundidad inmensa.",
    activities: [
      { id: "v23", time: "11:00", type: "cultura", place: "Abadía de Sant'Antimo", zone: "Castelnuovo Abate", note: "Iglesia románica solitaria rodeada de olivos — uno de los espacios más serenos del viaje. ⚠️ La comunidad de monjes abandonó la abadía ~2015, ya no hay cantos gregorianos regulares. Vale la visita por la arquitectura y el silencio.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "v24", time: "13:00", type: "comida", place: "Bottega di Portanuova — San Quirico", zone: "San Quirico", note: "O almorzar en Montalcino antes de subir a la fortaleza.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "v25", time: "15:00", type: "paseo", place: "Montalcino — Fortezza + Murallas", zone: "Montalcino", note: "Caminar los muros de la fortaleza. Backup: Horti Leonini (laberinto de arbustos, gratis).", essential: false, carriola: false, effort: "medio", needsReserve: false, walkMinsToNext: 10 },
      { id: "v26", time: "20:00", type: "comida", place: "Porta al Cassero — Montalcino", zone: "Montalcino", note: "Pedir un Brunello de alto nivel. La cena más sofisticada del viaje.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null, altRestaurants: ["Re di Macchia (cinghiale)", "Locanda Franci"] },
    ]
  },
  {
    date: "2026-04-03",
    city: "Val d'Orcia", phase: "Val d'Orcia",
    title: "Íconos + Procesión de Viernes Santo",
    tip: "Procesión degli Scalzi a las 21:00 en Monticchiello: antorchas, silencio, encapuchados. Cenar antes en Pienza y llegar a Monticchiello a las 20:45.",
    activities: [
      { id: "v27", time: "09:00", type: "mirador", place: "Cipreses de San Quirico — Círculo perfecto", zone: "San Quirico", note: "La foto más icónica de la Toscana. Llegár temprano para luz suave.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10 },
      { id: "v28", time: "10:00", type: "mirador", place: "Capilla de Vitaleta", zone: "Val d'Orcia", note: "La iglesia pequeña más famosa del mundo. Foto obligatoria.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "v29", time: "13:00", type: "comida", place: "La Grotta — Radicofani", zone: "Radicofani", note: "El pueblo menos turístico del itinerario. La Italia real.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10 },
      { id: "v30", time: "15:00", type: "paseo", place: "Radicofani — La Rocca", zone: "Radicofani", note: "La fortaleza más alta del sur. Sin turistas.", essential: false, carriola: false, effort: "medio", needsReserve: false, walkMinsToNext: null },
      { id: "v31", time: "19:30", type: "comida", place: "Trattoria Latte di Luna — Pienza", zone: "Pienza", note: "Cena antes de la procesión. Reserva nueva clave.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: 5 },
      { id: "v32", time: "21:00", type: "cultura", place: "Processione degli Scalzi — Monticchiello", zone: "Monticchiello", note: "Personas encapuchadas con antorchas en silencio por las calles oscuras del pueblo. Tradición medieval de Viernes Santo — la procesión más auténtica de la zona. Cenar antes en Pienza (20 min en auto) y llegar a Monticchiello a las 20:45.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },

  // ── BARCELONA ────────────────────────────────────────────
  {
    date: "2026-04-04",
    city: "Barcelona", phase: "Barcelona",
    title: "Arribo + Eje Modernista",
    tip: "17:30 es la mejor hora para fotos en Paseo de Gràcia. Sin sol vertical.",
    activities: [
      { id: "b1", time: "15:00", type: "checkin", place: "NH Collection Gran Hotel Calderón", zone: "Eixample", note: "Traslado privado desde aeropuerto.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5 },
      { id: "b2", time: "17:30", type: "paseo", place: "Paseo de Gràcia — Casa Batlló + La Pedrera", zone: "Eixample", note: "Mejor hora para fotos (sin sol vertical). Observar fachadas desde la calle.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10 },
      { id: "b3", time: "20:30", type: "comida", place: "Can Cañete", zone: "Eixample", note: "Clásico auténtico. Tapas de producto. Muy buscado.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null, altRestaurants: ["El Xampanyet", "Bar Calders"] },
    ]
  },
  {
    date: "2026-04-05",
    city: "Barcelona", phase: "Barcelona",
    title: "Vistas y Aire Libre — Domingo de Resurrección",
    tip: "Park Güell: entrar por Carretera del Carmel (punto más alto) para BAJAR el parque sin esfuerzo.",
    activities: [
      { id: "b4", time: "09:30", type: "monumento", place: "Park Güell — Entrada Carretera del Carmel", zone: "Gràcia", note: "Entrar por el punto más alto para bajar sin esfuerzo. Jonathan €18 · Ginamaria €18 · Emma €0 · Piero €0. Acceso válido 30 min después del horario.", bookingRef: "Reserva 8025292", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null },
      { id: "b5", time: "13:00", type: "comida", place: "7 Portes", zone: "Puerto/Born", note: "El templo del arroz y la paella (est. 1836). Reservar con semanas de antelación.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null, altRestaurants: ["Can Culleretes (€35-45)", "El Salamanca"] },
      { id: "b6", time: "16:00", type: "paseo", place: "Montjuïc — Telefèric + Jardins de Joan Brossa", zone: "Montjuïc", note: "Subida en Telefèric. Jardines con juegos para Emma. Espacio natural con descarga total.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-04-06",
    city: "Barcelona", phase: "Barcelona",
    title: "El Born + Tradición — Lunes de Pascua",
    tip: "Museu de la Xocolata: hoy exhiben esculturas de chocolate. Tradición de Lunes de Pascua.",
    activities: [
      { id: "b7", time: "10:30", type: "kids", place: "Museu de la Xocolata", zone: "El Born", note: "Esculturas de chocolate. Tradición del día. Emma vs chocolatelandia.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 5 },
      { id: "b8", time: "12:00", type: "cultura", place: "Santa Maria del Mar + Born CCM", zone: "El Born", note: "Iglesia gótica perfecta + ruinas del s.XVIII bajo estructura industrial.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10 },
      { id: "b9", time: "14:00", type: "comida", place: "Cuines de Santa Caterina", zone: "El Born", note: "Cocina de mercado fresca y variada.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 15, altRestaurants: ["Bar del Convent (claustro, Emma corre)", "El Xampanyet"] },
      { id: "b10", time: "16:00", type: "kids", place: "Parc de la Ciutadella — Paseo en bote", zone: "Ciutadella", note: "Bote por el lago + picnic. El parque más familiar de Barcelona.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-04-07",
    city: "Barcelona", phase: "Barcelona",
    title: "Legado Gaudí + Sant Pau + Gótico",
    tip: "Sagrada Familia: tickets liberados 60 días antes (mediados de febrero). Emma y Piero entran gratis.",
    activities: [
      { id: "b11", time: "09:00", type: "monumento", place: "Sagrada Familia — Primer turno", zone: "Eixample", note: "Jonathan €26 · Ginamaria €26 · Emma gratuito · Piero gratuito. Acceso Carrer de la Marina. Entrada NOMINAL — llevar pasaporte.", bookingRef: "Reserva 94991045", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: 10 },
      { id: "b12", time: "11:30", type: "monumento", place: "Recinte Modernista de Sant Pau", zone: "Eixample", note: "Caminata por Av. Gaudí desde la Sagrada. Espacioso, tranquilo, 100% apto carriola.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 15 },
      { id: "b13", time: "14:00", type: "comida", place: "L'Arrosseria de Xàtiva", zone: "Eixample", note: "Arroces de alta calidad cerca del monumento.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: 20, altRestaurants: ["El Glop Rambla (brasas catalanas)", "Cervecería Catalana"] },
      { id: "b14", time: "16:30", type: "paseo", place: "Barrio Gótico", zone: "Gótico", note: "Calles estrechas: usar portabebés para mayor agilidad. Pont del Bisbe + Plaça Sant Felip Neri.", essential: false, carriola: false, effort: "medio", needsReserve: false, walkMinsToNext: null, altActivities: ["Plaça de Sant Felip Neri (Emma juega, vos tomás café)", "Pont del Bisbe foto"] },
    ]
  },
  {
    date: "2026-04-08",
    city: "Barcelona", phase: "Barcelona",
    title: "Ciencia + Mar",
    tip: "Xiringuito Escribà: reservar con semanas de antelación. La mejor paella del viaje.",
    activities: [
      { id: "b15", time: "09:00", type: "monumento", place: "Casa Batlló — Entrada Gold", zone: "Eixample", note: "Visita Gold ~1h15. 2 adultos €43 c/u · 2 niños €0. ⚠️ Máx 15 min de tolerancia en acceso.", bookingRef: "Reserva 94638531", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: null },
      { id: "b16", time: "12:30", type: "kids", place: "CosmoCaixa — Bosque Inundado", zone: "Zona Alta", note: "El Amazonas recreado con lluvia real dentro del museo. Emma se va a volver loca.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
      { id: "b17", time: "14:30", type: "comida", place: "Xiringuito Escribà — Nova Icária", zone: "Playa Nova Icária", note: "La mejor paella frente al mar. Reservar con semanas de antelación.", essential: true, carriola: true, effort: "bajo", needsReserve: true, walkMinsToNext: 5, altRestaurants: ["La Cova Fumada (sin reserva)", "Barraca"] },
      { id: "b18", time: "16:30", type: "kids", place: "Playa de Nova Icária", zone: "Barceloneta", note: "Arena para Emma. Paseo marítimo para Piero. El finale perfecto del viaje.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },
  {
    date: "2026-04-09",
    city: "Barcelona", phase: "Barcelona",
    title: "Salida — Fin de Operación Spano",
    tip: "Vuelo 14:45. Salir del hotel a las 12:15. Último desayuno sin apuro en terraza.",
    activities: [
      { id: "b19", time: "09:00", type: "comida", place: "Desayuno largo en terraza del hotel", zone: "Eixample", note: "El último desayuno. Sin apuro. La terraza del NH Calderón tiene vistas de la ciudad.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 10 },
      { id: "b20", time: "10:00", type: "compras", place: "Rambla Catalunya — Últimas compras", zone: "Eixample", note: "Souvenirs, turrones, aceites. La versión elegante de Las Ramblas.", essential: false, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: 15 },
      { id: "b21", time: "12:15", type: "transporte", place: "Traslado privado al aeropuerto", zone: "El Prat", note: "Vuelo 14:45. Llegar 2h antes con niños.", essential: true, carriola: true, effort: "bajo", needsReserve: false, walkMinsToNext: null },
    ]
  },
];

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}
function formatDateShort(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}
function getPhaseColor(phase) {
  const map = {
    "Madrid":     { bg: "#FFF3E0", accent: "#E65100", text: "#BF360C", light: "#FFE0B2" },
    "Florencia":  { bg: "#FCE4EC", accent: "#AD1457", text: "#880E4F", light: "#F8BBD0" },
    "Lucca":      { bg: "#E8F5E9", accent: "#2E7D32", text: "#1B5E20", light: "#C8E6C9" },
    "Val d'Orcia":{ bg: "#FFF8E1", accent: "#F57F17", text: "#E65100", light: "#FFECB3" },
    "Barcelona":  { bg: "#E3F2FD", accent: "#1565C0", text: "#0D47A1", light: "#BBDEFB" },
  };
  return map[phase] || { bg: "#F5F5F5", accent: "#616161", text: "#424242", light: "#EEEEEE" };
}
function getDayReserveAlerts(day) {
  return day.activities.filter(a => a.needsReserve && !CONFIRMED_IDS.has(a.id));
}

// ============================================================
// COMPONENTS
// ============================================================

// ── 1. ALERTA DE RESERVAS ──────────────────────────────────
function ReserveAlert({ days, selectedDate }) {
  const todayDay = days.find(d => d.date === selectedDate);
  const todayIdx = days.findIndex(d => d.date === selectedDate);
  const tomorrowDay = todayIdx >= 0 && todayIdx < days.length - 1 ? days[todayIdx + 1] : null;

  const todayAlerts = todayDay ? getDayReserveAlerts(todayDay) : [];
  const tomorrowAlerts = tomorrowDay ? getDayReserveAlerts(tomorrowDay) : [];

  if (todayAlerts.length === 0 && tomorrowAlerts.length === 0) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #FF3D00, #D32F2F)",
      borderRadius: 14,
      padding: "12px 14px",
      marginBottom: 12,
      color: "white",
      boxShadow: "0 4px 16px rgba(255,61,0,0.35)"
    }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        🚨 RESERVAS PENDIENTES
      </div>
      {todayAlerts.map(a => (
        <div key={a.id} style={{ fontSize: 12, padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.2)", display: "flex", gap: 6 }}>
          <span style={{ opacity: 0.8 }}>HOY</span>
          <span style={{ fontWeight: 700 }}>{a.place}</span>
        </div>
      ))}
      {tomorrowAlerts.map(a => (
        <div key={a.id} style={{ fontSize: 12, padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.2)", display: "flex", gap: 6 }}>
          <span style={{ opacity: 0.8 }}>MAÑANA</span>
          <span style={{ fontWeight: 700 }}>{a.place}</span>
        </div>
      ))}
    </div>
  );
}

// ── 2. MODO EMERGENCIA ─────────────────────────────────────
function EmergencyMode({ city, onClose }) {
  const options = EMERGENCY_OPTIONS[city] || [];
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 200, display: "flex", alignItems: "flex-end"
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 430, margin: "0 auto",
          background: "white", borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px"
        }}
      >
        <div style={{ width: 40, height: 4, background: "#E0E0E0", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", marginBottom: 4 }}>
          ⚡ Tengo 1 hora libre
        </div>
        <div style={{ fontSize: 13, color: "#757575", marginBottom: 20 }}>
          Opciones cercanas en {city}
        </div>
        {options.map((opt, i) => {
          const type = TYPE_CONFIG[opt.type] || TYPE_CONFIG.paseo;
          return (
            <div key={i} style={{
              background: "#F9F9F9",
              borderRadius: 14,
              padding: "14px",
              marginBottom: 10,
              border: "1.5px solid #F0F0F0"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{type.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{opt.place}</div>
                  <div style={{ fontSize: 11, color: "#FF9800", fontWeight: 700 }}>⏱ {opt.time}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{opt.note}</div>
            </div>
          );
        })}
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: 14, borderRadius: 12,
            background: "#1A1A1A", color: "white",
            border: "none", fontSize: 14, fontWeight: 700,
            cursor: "pointer", marginTop: 8
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ── HOTEL BANNER ──────────────────────────────────────────
function HotelBanner({ dateStr, colors }) {
  const hotel = ACCOMMODATIONS[dateStr];
  if (!hotel) return null;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.accent}, ${colors.text})`,
      borderRadius: 14,
      padding: "12px 16px",
      color: "white",
      marginBottom: 12,
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: `0 4px 16px ${colors.accent}44`
    }}>
      <div style={{ fontSize: 28 }}>{hotel.emoji}</div>
      <div>
        <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Dormimos aquí</div>
        <div style={{ fontSize: 15, fontWeight: 800 }}>{hotel.name}</div>
        <div style={{ fontSize: 11, opacity: 0.85 }}>{hotel.address}</div>
      </div>
    </div>
  );
}

// ── 4. TIP DEL DÍA ────────────────────────────────────────
function DayTip({ tip, colors }) {
  if (!tip) return null;
  const isAlert = tip.startsWith("🚨");
  return (
    <div style={{
      background: isAlert ? "#FFF3E0" : colors.bg,
      border: `1.5px solid ${isAlert ? "#FF9800" : colors.light}`,
      borderRadius: 12,
      padding: "10px 14px",
      marginBottom: 12,
      display: "flex", gap: 8, alignItems: "flex-start"
    }}>
      <div style={{ fontSize: 16, flexShrink: 0 }}>{isAlert ? "⚠️" : "💡"}</div>
      <div style={{ fontSize: 12, color: isAlert ? "#E65100" : colors.text, fontWeight: 600, lineHeight: 1.5 }}>
        {tip.replace("🚨 ", "")}
      </div>
    </div>
  );
}

// ── ACTIVITY CARD ─────────────────────────────────────────
function ActivityCard({ activity, done, onToggle, colors, showWalk }) {
  const [expanded, setExpanded] = useState(false);
  const type = TYPE_CONFIG[activity.type] || TYPE_CONFIG.paseo;

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        background: done ? "#F9F9F9" : "white",
        borderRadius: 14,
        border: `1.5px solid ${done ? "#E0E0E0" : CONFIRMED_IDS.has(activity.id) ? "#4CAF50" : activity.needsReserve ? "#FF9800" : colors.light}`,
        overflow: "hidden",
        opacity: done ? 0.55 : 1,
        boxShadow: done ? "none" : "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <div onClick={() => setExpanded(!expanded)} style={{ padding: "11px 13px", display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer" }}>
          <div style={{ minWidth: 46, fontSize: 11, fontWeight: 700, color: colors.accent, paddingTop: 2, fontFamily: "monospace" }}>
            {activity.time}
          </div>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: type.color + "22",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, flexShrink: 0
          }}>
            {type.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              <div style={{
                fontWeight: 700, fontSize: 13, color: done ? "#9E9E9E" : "#1A1A1A",
                textDecoration: done ? "line-through" : "none", lineHeight: 1.3
              }}>
                {activity.place}
              </div>
              {activity.needsReserve && !done && !CONFIRMED_IDS.has(activity.id) && (
                <span style={{ fontSize: 10, fontWeight: 800, color: "#FF6D00", background: "#FFF3E0", padding: "1px 5px", borderRadius: 4 }}>
                  📋 RESERVAR
                </span>
              )}
              {activity.needsReserve && CONFIRMED_IDS.has(activity.id) && (
                <span style={{ fontSize: 10, fontWeight: 800, color: "#2E7D32", background: "#E8F5E9", padding: "1px 5px", borderRadius: 4 }}>
                  🎫 CONFIRMADO
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#9E9E9E", marginTop: 2 }}>
              {activity.zone}
              {activity.carriola && <span style={{ marginLeft: 6, color: "#4CAF50" }}>🛺</span>}
              {activity.effort === "alto" && <span style={{ marginLeft: 4, color: "#F44336", fontSize: 10, fontWeight: 700 }}>💪 ALTO</span>}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            style={{
              width: 26, height: 26, borderRadius: "50%",
              border: `2px solid ${done ? "#4CAF50" : colors.accent}`,
              background: done ? "#4CAF50" : "transparent",
              color: done ? "white" : colors.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 13, flexShrink: 0
            }}
          >
            {done ? "✓" : "○"}
          </button>
        </div>

        {expanded && (
          <div style={{ borderTop: `1px solid ${colors.light}`, padding: "11px 13px", background: colors.bg + "66" }}>
            <p style={{ fontSize: 12, color: "#424242", margin: "0 0 8px 0", lineHeight: 1.5 }}>{activity.note}</p>
            {activity.essential && (
              <span style={{ background: "#FF3D00", color: "white", borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 800, marginRight: 5 }}>⚡ ESENCIAL</span>
            )}
            {activity.altRestaurants && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#757575", marginBottom: 3 }}>🍴 ALTERNATIVAS</div>
                {activity.altRestaurants.map((r, i) => <div key={i} style={{ fontSize: 11, color: "#555", padding: "2px 0" }}>• {r}</div>)}
              </div>
            )}
            {activity.altActivities && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#757575", marginBottom: 3 }}>📍 CERCA</div>
                {activity.altActivities.map((a, i) => <div key={i} style={{ fontSize: 11, color: "#555", padding: "2px 0" }}>• {a}</div>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. WALK TIME CONNECTOR ── */}
      {showWalk && activity.walkMinsToNext && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 14px", marginBottom: 2 }}>
          <div style={{ width: 2, height: 16, background: "#E0E0E0", marginLeft: 55 }} />
          <div style={{ fontSize: 10, color: "#BDBDBD", fontWeight: 600 }}>🚶 {activity.walkMinsToNext} min caminando</div>
        </div>
      )}
    </div>
  );
}

// ── DAY VIEW ──────────────────────────────────────────────
function DayView({ day, doneMap, onToggle, allDays }) {
  const colors = getPhaseColor(day.phase);
  const [filter, setFilter] = useState("all");
  const [showEmergency, setShowEmergency] = useState(false);

  const filteredActivities = useMemo(() => {
    return day.activities.filter(a => {
      if (filter === "essential") return a.essential;
      if (filter === "comida") return a.type === "comida";
      if (filter === "kids") return a.type === "kids" || a.carriola;
      if (filter === "reservar") return a.needsReserve && !CONFIRMED_IDS.has(a.id);
      return true;
    });
  }, [day.activities, filter]);

  const reserveCount = day.activities.filter(a => a.needsReserve && !CONFIRMED_IDS.has(a.id)).length;
  const filters = [
    { id: "all", label: "Todo" },
    { id: "essential", label: "⚡ Esencial" },
    { id: "comida", label: "🍽️ Comer" },
    { id: "kids", label: "👶 Niños" },
    ...(reserveCount > 0 ? [{ id: "reservar", label: `📋 Reservar (${reserveCount})` }] : []),
  ];

  const completedCount = day.activities.filter(a => doneMap[a.id]).length;
  const totalCount = day.activities.length;

  return (
    <div style={{ padding: "0 14px 120px" }}>
      {/* City header */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.bg}, ${colors.light})`,
        borderRadius: 18,
        padding: "18px",
        marginBottom: 12,
        border: `1px solid ${colors.light}`
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: colors.accent, marginBottom: 3 }}>
          {day.phase}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: colors.text, lineHeight: 1.2 }}>{day.title}</div>
        <div style={{ fontSize: 12, color: colors.accent, marginTop: 5, textTransform: "capitalize" }}>{formatDate(day.date)}</div>
        {/* Progress */}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.1)", borderRadius: 4, height: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`, background: colors.accent, borderRadius: 4, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 11, color: colors.accent, fontWeight: 700, whiteSpace: "nowrap" }}>{completedCount}/{totalCount}</div>
        </div>
      </div>

      {/* Hotel */}
      <HotelBanner dateStr={day.date} colors={colors} />

      {/* 1. Reserve alerts */}
      <ReserveAlert days={allDays} selectedDate={day.date} />

      {/* 4. Tip del día */}
      <DayTip tip={day.tip} colors={colors} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 7, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "6px 12px", borderRadius: 18, border: "none",
            background: filter === f.id ? colors.accent : colors.light,
            color: filter === f.id ? "white" : colors.text,
            fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Activities */}
      {filteredActivities.map((activity, idx) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          done={!!doneMap[activity.id]}
          onToggle={() => onToggle(activity.id)}
          colors={colors}
          showWalk={idx < filteredActivities.length - 1}
        />
      ))}

      {filteredActivities.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#BDBDBD" }}>Nada con ese filtro hoy.</div>
      )}

      {/* 2. Emergency button — floating */}
      <button
        onClick={() => setShowEmergency(true)}
        style={{
          position: "fixed",
          bottom: 90,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6D00, #E65100)",
          border: "none",
          color: "white",
          fontSize: 22,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(255,109,0,0.5)",
          zIndex: 150,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
        title="¿Qué hago ahora?"
      >
        ⚡
      </button>

      {showEmergency && <EmergencyMode city={day.city} onClose={() => setShowEmergency(false)} />}
    </div>
  );
}

// ── 5. WEEKLY VIEW ────────────────────────────────────────
function WeeklyView({ days, selectedDate, onSelectDate, doneMap }) {
  const phases = ["Madrid", "Florencia", "Lucca", "Val d'Orcia", "Barcelona"];

  return (
    <div style={{ padding: "14px 14px 100px" }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", marginBottom: 16 }}>Resumen del Viaje</div>
      {phases.map(phase => {
        const phaseDays = days.filter(d => d.phase === phase);
        if (phaseDays.length === 0) return null;
        const colors = getPhaseColor(phase);
        return (
          <div key={phase} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: colors.accent, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {phase}
            </div>
            {phaseDays.map(day => {
              const reserveAlerts = getDayReserveAlerts(day);
              const done = day.activities.filter(a => doneMap[a.id]).length;
              const total = day.activities.length;
              const isSelected = day.date === selectedDate;
              const isToday = day.date === getTodayDate();
              return (
                <button
                  key={day.date}
                  onClick={() => onSelectDate(day.date)}
                  style={{
                    width: "100%", background: isSelected ? colors.accent : isToday ? colors.bg : "white",
                    border: `1.5px solid ${isSelected ? colors.accent : isToday ? colors.accent : "#F0F0F0"}`,
                    borderRadius: 12, padding: "10px 14px",
                    marginBottom: 6, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    textAlign: "left"
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: isSelected ? "white" : "#1A1A1A" }}>
                      {formatDateShort(day.date)} — {day.title}
                    </div>
                    <div style={{ fontSize: 11, color: isSelected ? "rgba(255,255,255,0.7)" : "#9E9E9E", marginTop: 2 }}>
                      {total} actividades · {done} hechas
                      {reserveAlerts.length > 0 && (
                        <span style={{ marginLeft: 8, color: isSelected ? "#FFD740" : "#FF6D00", fontWeight: 800 }}>
                          📋 {reserveAlerts.length} por reservar
                        </span>
                      )}
                    </div>
                  </div>
                  {total > 0 && (
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: isSelected ? "rgba(255,255,255,0.2)" : colors.light,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 900, color: isSelected ? "white" : colors.accent,
                      flexShrink: 0
                    }}>
                      {Math.round((done / total) * 100)}%
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── CALENDAR VIEW ─────────────────────────────────────────
function CalendarView({ days, selectedDate, onSelectDate }) {
  const phases = [
    { name: "Madrid 🇪🇸", phase: "Madrid", color: "#E65100" },
    { name: "Florencia 🇮🇹", phase: "Florencia", color: "#AD1457" },
    { name: "Lucca 🌿", phase: "Lucca", color: "#2E7D32" },
    { name: "Val d'Orcia 🌾", phase: "Val d'Orcia", color: "#F57F17" },
    { name: "Barcelona 🌊", phase: "Barcelona", color: "#1565C0" },
  ];
  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

  return (
    <div style={{ padding: "14px 14px 100px" }}>
      {phases.map(phase => {
        const phaseDays = days.filter(d => d.phase === phase.phase);
        return (
          <div key={phase.name} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: phase.color, marginBottom: 8 }}>{phase.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
              {phaseDays.map(day => {
                const d = new Date(day.date + "T12:00:00");
                const isSelected = day.date === selectedDate;
                const isToday = day.date === getTodayDate();
                const hasReserve = getDayReserveAlerts(day).length > 0;
                return (
                  <button
                    key={day.date}
                    onClick={() => onSelectDate(day.date)}
                    style={{
                      background: isSelected ? phase.color : isToday ? phase.color + "18" : "#F5F5F5",
                      color: isSelected ? "white" : "#333",
                      border: isToday && !isSelected ? `2px solid ${phase.color}` : "2px solid transparent",
                      borderRadius: 12, padding: "9px 5px",
                      cursor: "pointer", textAlign: "center", position: "relative"
                    }}
                  >
                    {hasReserve && (
                      <div style={{ position: "absolute", top: 4, right: 6, width: 6, height: 6, borderRadius: "50%", background: isSelected ? "#FFD740" : "#FF6D00" }} />
                    )}
                    <div style={{ fontSize: 9, opacity: 0.65, marginBottom: 1 }}>{dayNames[d.getDay()]}</div>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{d.getDate()}</div>
                    <div style={{ fontSize: 9, opacity: 0.65, marginTop: 1 }}>{d.toLocaleDateString("es-ES", { month: "short" })}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{ background: "#FFF8E1", borderRadius: 12, padding: 12, border: "1.5px solid #FFB300", fontSize: 11, color: "#757575" }}>
        🟠 Punto naranja = tiene reservas pendientes en ese día
      </div>
    </div>
  );
}


// ── RESERVAS MASTER VIEW ──────────────────────────────────
function ReservasView({ days, doneReservas, onToggleReserva }) {
  const allReservas = days.flatMap(day =>
    day.activities
      .filter(a => a.needsReserve)
      .map(a => ({ ...a, date: day.date, city: day.city, phase: day.phase }))
  );

  // Auto-confirmed = tienen ticket en mano; manual-confirmed = marcados por usuario
  const confirmed = allReservas.filter(a => CONFIRMED_IDS.has(a.id));
  const pending = allReservas.filter(a => !CONFIRMED_IDS.has(a.id) && !doneReservas[a.id]);
  const manualDone = allReservas.filter(a => !CONFIRMED_IDS.has(a.id) && doneReservas[a.id]);

  const ReservaCard = ({ a, isConfirmed, isManualDone }) => {
    const colors = getPhaseColor(a.phase);
    const bgColor = isConfirmed ? "#F0FFF4" : isManualDone ? "#F9F9F9" : "white";
    const borderColor = isConfirmed ? "#4CAF50" : isManualDone ? "#E0E0E0" : colors.light;
    return (
      <div style={{
        background: bgColor, borderRadius: 14,
        border: `1.5px solid ${borderColor}`,
        padding: "12px 14px", marginBottom: 8,
        boxShadow: isConfirmed || isManualDone ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex", alignItems: "flex-start", gap: 10,
        opacity: isManualDone ? 0.65 : 1,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: isConfirmed ? "#2E7D32" : isManualDone ? "#BDBDBD" : colors.accent, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
            {a.phase} · {formatDateShort(a.date)} · {a.time}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: isManualDone ? "#9E9E9E" : "#1A1A1A", textDecoration: isManualDone ? "line-through" : "none", marginBottom: 3 }}>{a.place}</div>
          {isConfirmed && a.bookingRef && (
            <div style={{ fontSize: 10, color: "#2E7D32", fontWeight: 800, background: "#E8F5E9", borderRadius: 5, padding: "2px 7px", display: "inline-block", marginBottom: 5 }}>
              🎫 {a.bookingRef}
            </div>
          )}
          {!isManualDone && <div style={{ fontSize: 11, color: "#757575", lineHeight: 1.4 }}>{a.note}</div>}
        </div>
        {isConfirmed ? (
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✓</div>
        ) : (
          <button
            onClick={() => onToggleReserva(a.id)}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              border: `2px solid ${isManualDone ? "#4CAF50" : colors.accent}`,
              background: isManualDone ? "#4CAF50" : "transparent",
              color: isManualDone ? "white" : colors.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 14, flexShrink: 0
            }}
          >{isManualDone ? "✓" : "○"}</button>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "14px 14px 120px" }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A", marginBottom: 4 }}>📋 Reservas del Viaje</div>
      <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 16 }}>
        {pending.length} pendientes · {manualDone.length + confirmed.length} confirmadas
      </div>

      {pending.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#D32F2F", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
            🔴 Pendientes de reservar ({pending.length})
          </div>
          {pending.map(a => <ReservaCard key={a.id} a={a} isConfirmed={false} isManualDone={false} />)}
        </>
      )}

      {confirmed.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#2E7D32", letterSpacing: 1, marginBottom: 10, marginTop: pending.length > 0 ? 20 : 0, textTransform: "uppercase" }}>
            🎫 Ticket en mano ({confirmed.length + 1})
          </div>
          {/* Auto rental extra */}
          {EXTRA_CONFIRMATIONS.map(a => {
            const colors = getPhaseColor(a.phase);
            return (
              <div key={a.id} style={{ background: "#F0FFF4", borderRadius: 14, border: "1.5px solid #4CAF50", padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#2E7D32", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                  {a.phase} · {formatDateShort(a.date)} · {a.time}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1A1A", marginBottom: 3 }}>{a.place}</div>
                <div style={{ fontSize: 10, color: "#2E7D32", fontWeight: 800, background: "#E8F5E9", borderRadius: 5, padding: "2px 7px", display: "inline-block", marginBottom: 5 }}>🎫 {a.bookingRef}</div>
                <div style={{ fontSize: 11, color: "#757575", lineHeight: 1.4 }}>{a.note}</div>
              </div>
            );
          })}
          {confirmed.map(a => <ReservaCard key={a.id} a={a} isConfirmed={true} isManualDone={false} />)}
        </>
      )}

      {manualDone.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#4CAF50", letterSpacing: 1, marginBottom: 10, marginTop: 20, textTransform: "uppercase" }}>
            ✅ Marcadas como confirmadas ({manualDone.length})
          </div>
          {manualDone.map(a => <ReservaCard key={a.id} a={a} isConfirmed={false} isManualDone={true} />)}
        </>
      )}

      {pending.length === 0 && confirmed.length === 0 && manualDone.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#BDBDBD" }}>Sin reservas pendientes 🎉</div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const today = getTodayDate();
  const tripStart = "2026-03-19";
  const tripEnd = "2026-04-09";
  const defaultDate = today >= tripStart && today <= tripEnd ? today : tripStart;

  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [doneMap, setDoneMap] = useState({});
  const [doneReservas, setDoneReservas] = useState({});
  const toggleReserva = (id) => setDoneReservas(prev => ({ ...prev, [id]: !prev[id] }));

  const currentDay = DAYS.find(d => d.date === selectedDate) || DAYS[0];

  const toggleDone = (id) => setDoneMap(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setActiveTab("today");
  };

  const goToPrev = () => {
    const idx = DAYS.findIndex(d => d.date === selectedDate);
    if (idx > 0) setSelectedDate(DAYS[idx - 1].date);
  };
  const goToNext = () => {
    const idx = DAYS.findIndex(d => d.date === selectedDate);
    if (idx < DAYS.length - 1) setSelectedDate(DAYS[idx + 1].date);
  };

  const colors = getPhaseColor(currentDay?.phase);

  const tabs = [
    { id: "today", icon: "📅", label: "Hoy" },
    { id: "weekly", icon: "📋", label: "Resumen" },
    { id: "calendar", icon: "🗓️", label: "Fechas" },
    { id: "reservas", icon: "📋", label: "Reservas" },
  ];

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #F0F0F0", padding: "14px 16px 10px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#1A1A1A" }}>Operación Spano ✈️</div>
            <div style={{ fontSize: 10, color: "#BDBDBD", marginTop: 1 }}>
              {currentDay ? `${currentDay.city} · ${formatDateShort(currentDay.date)}` : ""}
              {getTodayDate() < "2026-03-19" && (
                <span style={{ marginLeft: 8, color: "#E65100", fontWeight: 800 }}>
                  🗓️ {Math.ceil((new Date("2026-03-19") - new Date()) / 86400000)}d para el despegue
                </span>
              )}
            </div>
          </div>
          {activeTab === "today" && (
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={goToPrev} style={{ padding: "6px 11px", borderRadius: 8, border: "1px solid #E0E0E0", background: "white", cursor: "pointer", fontSize: 16, color: "#555" }}>‹</button>
              <button onClick={goToNext} style={{ padding: "6px 11px", borderRadius: 8, border: "1px solid #E0E0E0", background: "white", cursor: "pointer", fontSize: 16, color: "#555" }}>›</button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 8 }}>
        {activeTab === "today" && currentDay && (
          <DayView day={currentDay} doneMap={doneMap} onToggle={toggleDone} allDays={DAYS} />
        )}
        {activeTab === "weekly" && (
          <WeeklyView days={DAYS} selectedDate={selectedDate} onSelectDate={handleSelectDate} doneMap={doneMap} />
        )}
        {activeTab === "calendar" && (
          <CalendarView days={DAYS} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
        )}
        {activeTab === "reservas" && (
          <ReservasView days={DAYS} doneReservas={doneReservas} onToggleReserva={toggleReserva} />
        )}
      </div>

      {/* Bottom tabs */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "white", borderTop: "1px solid #F0F0F0", display: "flex", padding: "8px 0 18px", boxShadow: "0 -4px 16px rgba(0,0,0,0.07)" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "5px 0" }}>
            <div style={{ fontSize: 21 }}>{tab.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: activeTab === tab.id ? "#1565C0" : "#BDBDBD", letterSpacing: 0.3 }}>{tab.label}</div>
            {activeTab === tab.id && <div style={{ width: 18, height: 3, background: "#1565C0", borderRadius: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
