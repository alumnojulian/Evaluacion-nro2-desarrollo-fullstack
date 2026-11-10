
/*
 * Categorías y arreglo de productos de Level-Up Gamer.
 *
 * Los 10 primeros productos vienen del caso (Forma B). PP002 y ST001 se
 * agregaron para cubrir las categorías "Polerones Gamers Personalizados" y
 * "Servicio Técnico", que el caso lista pero no trae con ejemplo.
 *
 * Este arreglo es la "semilla": la primera vez que se abre el sitio se copia a
 * localStorage y desde ahí el panel de administración lo puede modificar.
 */
export const CATEGORIAS = [
  "Juegos de Mesa",
  "Accesorios",
  "Consolas",
  "Computadores Gamers",
  "Sillas Gamers",
  "Mouse",
  "Mousepad",
  "Poleras Personalizadas",
  "Polerones Gamers Personalizados",
  "Servicio Técnico"
];

export const PRODUCTOS_INICIALES = [
  {
    codigo: "JM001",
    categoria: "Juegos de Mesa",
    nombre: "Catan",
    precio: 29990,
    stock: 25,
    stockCritico: 5,
    imagen: "img/productos/catan.svg",
    fabricante: "Kosmos / Catan Studio",
    distribuidor: "Level-Up Gamer",
    descripcion: "Un clásico juego de estrategia donde los jugadores compiten por colonizar y expandirse en la isla de Catan. Ideal para 3-4 jugadores y perfecto para noches de juego en familia o con amigos."
  },
  {
    codigo: "JM002",
    categoria: "Juegos de Mesa",
    nombre: "Carcassonne",
    precio: 24990,
    stock: 18,
    stockCritico: 5,
    imagen: "img/productos/carcassonne.svg",
    fabricante: "Hans im Glück",
    distribuidor: "Level-Up Gamer",
    descripcion: "Un juego de colocación de fichas donde los jugadores construyen el paisaje alrededor de la fortaleza medieval de Carcassonne. Ideal para 2-5 jugadores y fácil de aprender."
  },
  {
    codigo: "AC001",
    categoria: "Accesorios",
    nombre: "Controlador Inalámbrico Xbox Series X",
    precio: 59990,
    stock: 30,
    stockCritico: 8,
    imagen: "img/productos/controlador.svg",
    fabricante: "Microsoft",
    distribuidor: "Level-Up Gamer",
    descripcion: "Ofrece una experiencia de juego cómoda con botones mapeables y una respuesta táctil mejorada. Compatible con consolas Xbox y PC."
  },
  {
    codigo: "AC002",
    categoria: "Accesorios",
    nombre: "Auriculares Gamer HyperX Cloud II",
    precio: 79990,
    stock: 22,
    stockCritico: 6,
    imagen: "img/productos/auriculares.svg",
    fabricante: "HyperX",
    distribuidor: "Level-Up Gamer",
    descripcion: "Proporcionan un sonido envolvente de calidad con un micrófono desmontable y almohadillas de espuma viscoelástica para mayor comodidad durante largas sesiones de juego."
  },
  {
    codigo: "CO001",
    categoria: "Consolas",
    nombre: "PlayStation 5",
    precio: 549990,
    stock: 4,
    stockCritico: 5,
    imagen: "img/productos/ps5.svg",
    fabricante: "Sony Interactive Entertainment",
    distribuidor: "Level-Up Gamer",
    descripcion: "La consola de última generación de Sony, que ofrece gráficos impresionantes y tiempos de carga ultrarrápidos para una experiencia de juego inmersiva."
  },
  {
    codigo: "CG001",
    categoria: "Computadores Gamers",
    nombre: "PC Gamer ASUS ROG Strix",
    precio: 1299990,
    stock: 6,
    stockCritico: 2,
    imagen: "img/productos/pc.svg",
    fabricante: "ASUS (Republic of Gamers)",
    distribuidor: "Level-Up Gamer",
    descripcion: "Un potente equipo diseñado para los gamers más exigentes, equipado con los últimos componentes para ofrecer un rendimiento excepcional en cualquier juego."
  },
  {
    codigo: "SG001",
    categoria: "Sillas Gamers",
    nombre: "Silla Gamer Secretlab Titan",
    precio: 349990,
    stock: 9,
    stockCritico: 3,
    imagen: "img/productos/silla.svg",
    fabricante: "Secretlab",
    distribuidor: "Level-Up Gamer",
    descripcion: "Diseñada para el máximo confort, esta silla ofrece un soporte ergonómico y personalización ajustable para sesiones de juego prolongadas."
  },
  {
    codigo: "MS001",
    categoria: "Mouse",
    nombre: "Mouse Gamer Logitech G502 HERO",
    precio: 49990,
    stock: 40,
    stockCritico: 10,
    imagen: "img/productos/mouse.svg",
    fabricante: "Logitech",
    distribuidor: "Level-Up Gamer",
    descripcion: "Con sensor de alta precisión y botones personalizables, este mouse es ideal para gamers que buscan un control preciso y personalización."
  },
  {
    codigo: "MP001",
    categoria: "Mousepad",
    nombre: "Mousepad Razer Goliathus Extended Chroma",
    precio: 29990,
    stock: 35,
    stockCritico: 8,
    imagen: "img/productos/mousepad.svg",
    fabricante: "Razer",
    distribuidor: "Level-Up Gamer",
    descripcion: "Ofrece un área de juego amplia con iluminación RGB personalizable, asegurando una superficie suave y uniforme para el movimiento del mouse."
  },
  {
    codigo: "PP001",
    categoria: "Poleras Personalizadas",
    nombre: "Polera Gamer Personalizada 'Level-Up'",
    precio: 14990,
    stock: 60,
    stockCritico: 12,
    imagen: "img/productos/polera.svg",
    fabricante: "Level-Up Gamer (producción propia)",
    distribuidor: "Level-Up Gamer",
    descripcion: "Una camiseta cómoda y estilizada, con la posibilidad de personalizarla con tu gamer tag o diseño favorito."
  },
  {
    codigo: "PP002",
    categoria: "Polerones Gamers Personalizados",
    nombre: "Polerón Gamer Personalizado 'Level-Up'",
    precio: 34990,
    stock: 28,
    stockCritico: 6,
    imagen: "img/productos/poleron.svg",
    fabricante: "Level-Up Gamer (producción propia)",
    distribuidor: "Level-Up Gamer",
    descripcion: "Polerón con capucha y bolsillo canguro, con la posibilidad de estampar tu gamer tag o diseño favorito."
  },
  {
    codigo: "ST001",
    categoria: "Servicio Técnico",
    nombre: "Servicio Técnico: diagnóstico de consola o PC",
    precio: 19990,
    stock: 15,
    stockCritico: 3,
    imagen: "img/productos/servicio.svg",
    fabricante: "Level-Up Gamer",
    distribuidor: "Level-Up Gamer",
    descripcion: "Diagnóstico completo de tu consola o computador gamer: revisión de hardware, temperaturas y software, con informe de los problemas encontrados. Se coordina por WhatsApp."
  }
];
