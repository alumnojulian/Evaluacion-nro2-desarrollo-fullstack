// Contenido de los blogs del Parcial 1 (blog-1.html y blog-2.html) como datos reutilizables
export const BLOGS = [
  {
    id: 'silla-gamer',
    titulo: 'Caso curioso #1: la silla que te salva la espalda',
    resumen:
      'Pasar muchas horas jugando también se nota en la postura. Revisa qué características debe tener una silla gamer para que las sesiones largas no terminen en dolor de espalda.',
    imagen: 'img/productos/silla.svg',
    altImagen: 'Ilustración de una silla gamer',
    articulo: {
      migas: 'Cómo elegir tu silla gamer',
      titulo: 'Cómo elegir tu primera silla gamer',
      meta: 'Guía de compra · lectura de 3 minutos',
      altImagen: 'Ilustración de una silla gamer con respaldo alto y base con ruedas',
      categoria: 'Sillas Gamers',
      textoBoton: 'Ver sillas gamer',
      intro:
        'Una silla gamer es una de las mejores inversiones si juegas o trabajas varias horas frente al computador. Pero no todas cuidan tu postura igual. Antes de comprar, revisa estos puntos.',
      secciones: [
        {
          titulo: '1. Ajustes de altura y reclinación',
          texto:
            'Tus pies deben apoyarse completos en el suelo y tus rodillas quedar a unos 90 grados. Busca una silla con regulación de altura y un respaldo que se pueda reclinar y bloquear en distintos ángulos.',
        },
        {
          titulo: '2. Soporte lumbar',
          texto:
            'La zona baja de la espalda es la que más sufre. Un cojín lumbar regulable, o un respaldo que respete la curva natural de tu columna, marca la diferencia en sesiones largas.',
        },
        {
          titulo: '3. Apoyabrazos regulables',
          texto:
            'Los brazos deben descansar sin subir los hombros. Los apoyabrazos que se ajustan en altura y ancho se adaptan mejor a tu escritorio y a tu cuerpo.',
        },
        {
          titulo: '4. Materiales y peso máximo',
          lista: [
            'El cuero sintético se limpia fácil, pero puede ser más caluroso.',
            'La tela respira mejor en verano.',
            'Revisa siempre el peso máximo y la altura recomendada que indica el fabricante.',
          ],
        },
        {
          titulo: 'Un consejo extra',
          texto: 'Ninguna silla reemplaza las pausas. Levántate y estírate cada cierto tiempo, aunque sea un minuto.',
        },
      ],
    },
  },
  {
    id: 'juegos-de-mesa',
    titulo: 'Caso curioso #2: noches de juegos de mesa',
    resumen:
      'Una selección de juegos de mesa fáciles de aprender para reunir a la familia o a los amigos, desde clásicos de estrategia hasta juegos cooperativos.',
    imagen: 'img/productos/catan.svg',
    altImagen: 'Ilustración de un tablero hexagonal de juego de mesa',
    articulo: {
      migas: 'Noches de juegos de mesa',
      titulo: 'Cinco juegos de mesa para tus noches con amigos',
      meta: 'Recomendaciones · lectura de 3 minutos',
      altImagen: 'Ilustración de un tablero hexagonal de juego de mesa',
      categoria: 'Juegos de Mesa',
      textoBoton: 'Ver juegos de mesa',
      intro:
        'Los juegos de mesa son una excelente forma de compartir sin pantallas. Estos cinco son fáciles de explicar y funcionan muy bien con amigos o en familia.',
      secciones: [
        {
          titulo: 'Catan (3 a 4 jugadores)',
          texto:
            'Cada jugador coloniza una isla, junta recursos y comercia con los demás. Es un clásico de estrategia y negociación: nadie gana solo.',
        },
        {
          titulo: 'Carcassonne (2 a 5 jugadores)',
          texto:
            'Se juega colocando fichas para construir caminos, ciudades y campos alrededor de la fortaleza medieval. Se aprende en pocos minutos.',
        },
        {
          titulo: 'Ticket to Ride (2 a 5 jugadores)',
          texto:
            'Consiste en conectar ciudades con rutas de tren. Sus reglas son simples y las partidas son entretenidas para todas las edades.',
        },
        {
          titulo: 'Azul (2 a 4 jugadores)',
          texto: 'Un juego de elegir y ordenar azulejos con mucho color. Es rápido y tiene la dosis justa de estrategia.',
        },
        {
          titulo: 'Pandemic (2 a 4 jugadores)',
          texto:
            'Aquí todos juegan del mismo lado: deben trabajar en equipo para frenar cuatro enfermedades antes de que se propaguen por el mundo.',
        },
      ],
    },
  },
];
