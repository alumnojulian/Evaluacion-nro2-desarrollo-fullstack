
/*
 * Arreglo de regiones y comunas de Chile.
 * Estructura: { id, nombre, comunas: [ ... ] }
 *
 * Es el "arreglo de JS complementario" que pide el enunciado. La Región
 * Metropolitana está completa (52 comunas); en las demás regiones se incluyen
 * las comunas principales. Si el docente entrega su propio arreglo, basta con
 * reemplazar este archivo manteniendo la misma estructura.
 */
export const REGIONES = [
  {
    id: "XV",
    nombre: "Región de Arica y Parinacota",
    comunas: ["Arica", "Camarones", "Putre", "General Lagos"]
  },
  {
    id: "I",
    nombre: "Región de Tarapacá",
    comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica", "Huara", "Camiña", "Colchane"]
  },
  {
    id: "II",
    nombre: "Región de Antofagasta",
    comunas: ["Antofagasta", "Calama", "Mejillones", "Tocopilla", "Taltal", "San Pedro de Atacama", "Sierra Gorda", "María Elena"]
  },
  {
    id: "III",
    nombre: "Región de Atacama",
    comunas: ["Copiapó", "Caldera", "Vallenar", "Chañaral", "Diego de Almagro", "Tierra Amarilla", "Huasco", "Freirina", "Alto del Carmen"]
  },
  {
    id: "IV",
    nombre: "Región de Coquimbo",
    comunas: ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Los Vilos", "Salamanca", "Andacollo", "Vicuña", "Monte Patria", "Combarbalá", "Paihuano", "Punitaqui", "Río Hurtado", "Canela"]
  },
  {
    id: "V",
    nombre: "Región de Valparaíso",
    comunas: ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana", "Quillota", "La Calera", "San Antonio", "Los Andes", "San Felipe", "Limache", "Olmué", "Casablanca", "Quintero", "Puchuncaví", "Cartagena", "El Quisco", "Algarrobo", "Isla de Pascua", "Juan Fernández"]
  },
  {
    id: "RM",
    nombre: "Región Metropolitana de Santiago",
    comunas: [
      "Alhué", "Buin", "Calera de Tango", "Cerrillos", "Cerro Navia", "Colina", "Conchalí", "Curacaví",
      "El Bosque", "El Monte", "Estación Central", "Huechuraba", "Independencia", "Isla de Maipo",
      "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Lampa", "Las Condes",
      "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "María Pinto", "Melipilla", "Ñuñoa",
      "Padre Hurtado", "Paine", "Pedro Aguirre Cerda", "Peñaflor", "Peñalolén", "Pirque", "Providencia",
      "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Bernardo",
      "San Joaquín", "San José de Maipo", "San Miguel", "San Pedro", "San Ramón", "Santiago",
      "Talagante", "Tiltil", "Vitacura"
    ]
  },
  {
    id: "VI",
    nombre: "Región del Libertador General Bernardo O'Higgins",
    comunas: ["Rancagua", "Machalí", "Rengo", "San Fernando", "Santa Cruz", "Pichilemu", "Graneros", "Requínoa", "San Vicente", "Chimbarongo", "Mostazal", "Codegua", "Doñihue", "Coltauco", "Peumo", "Las Cabras", "Olivar", "Nancagua", "Palmilla", "Peralillo"]
  },
  {
    id: "VII",
    nombre: "Región del Maule",
    comunas: ["Talca", "Curicó", "Linares", "Constitución", "Cauquenes", "Parral", "San Javier", "Molina", "Maule", "San Clemente", "Teno", "Longaví", "Villa Alegre", "Retiro", "Chanco", "Pelluhue", "Curepto"]
  },
  {
    id: "XVI",
    nombre: "Región de Ñuble",
    comunas: ["Chillán", "Chillán Viejo", "San Carlos", "Bulnes", "Quillón", "Coihueco", "Yungay", "Pemuco", "El Carmen", "Quirihue", "Coelemu", "Ninhue", "Pinto"]
  },
  {
    id: "VIII",
    nombre: "Región del Biobío",
    comunas: ["Concepción", "Talcahuano", "San Pedro de la Paz", "Chiguayante", "Hualpén", "Coronel", "Lota", "Penco", "Tomé", "Los Ángeles", "Lebu", "Arauco", "Cañete", "Curanilahue", "Nacimiento", "Mulchén", "Santa Juana", "Hualqui", "Laja", "Cabrero"]
  },
  {
    id: "IX",
    nombre: "Región de La Araucanía",
    comunas: ["Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol", "Lautaro", "Nueva Imperial", "Victoria", "Collipulli", "Loncoche", "Freire", "Gorbea", "Traiguén", "Carahue", "Curacautín", "Cunco"]
  },
  {
    id: "XIV",
    nombre: "Región de Los Ríos",
    comunas: ["Valdivia", "La Unión", "Río Bueno", "Panguipulli", "Paillaco", "Los Lagos", "Lanco", "Mariquina", "Futrono", "Lago Ranco"]
  },
  {
    id: "X",
    nombre: "Región de Los Lagos",
    comunas: ["Puerto Montt", "Osorno", "Puerto Varas", "Castro", "Ancud", "Quellón", "Calbuco", "Frutillar", "Llanquihue", "Purranque", "Fresia", "Chaitén", "Dalcahue", "Quinchao"]
  },
  {
    id: "XI",
    nombre: "Región de Aysén del General Carlos Ibáñez del Campo",
    comunas: ["Coyhaique", "Puerto Aysén", "Chile Chico", "Cochrane", "Puerto Cisnes", "Río Ibáñez", "Lago Verde", "Guaitecas", "O'Higgins", "Tortel"]
  },
  {
    id: "XII",
    nombre: "Región de Magallanes y de la Antártica Chilena",
    comunas: ["Punta Arenas", "Puerto Natales", "Porvenir", "Puerto Williams", "Cabo de Hornos", "Torres del Paine", "Río Verde", "Laguna Blanca", "San Gregorio", "Primavera", "Timaukel", "Antártica"]
  }
];
