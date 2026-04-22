// Ambiente de testes DeskHub: especificacao OpenAPI para suporte a QA e automacao funcional.
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'DeskHub API',
    version: '1.0.0',
    description:
      'API de reservas de mesas para escritorio, com persistencia em memoria e foco em testabilidade.',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor local de desenvolvimento',
    },
  ],
  tags: [
    { name: 'Health', description: 'Verificacao simples da API' },
    { name: 'Auth', description: 'Cadastro e autenticacao de colaboradores' },
    { name: 'Desks', description: 'Consulta de mesas por data' },
    { name: 'Reservations', description: 'Gestao de reservas do usuario autenticado' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiMessage: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Operacao concluida com sucesso.',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Nao foi possivel concluir a solicitacao.',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Marina Costa' },
          email: {
            type: 'string',
            example: 'marina.qa',
            description:
              'BUG PROPOSITAL: o sistema aceita qualquer texto como e-mail.',
          },
        },
        required: ['id', 'name', 'email'],
      },
      AuthRequestRegister: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: '   ',
            description:
              'BUG PROPOSITAL: nomes contendo apenas espacos em branco continuam sendo aceitos.',
          },
          email: {
            type: 'string',
            example: 'qualquer-texto',
            description:
              'BUG PROPOSITAL: nao ha validacao de formato para o e-mail.',
          },
          password: { type: 'string', example: '123456' },
        },
        required: ['name', 'email', 'password'],
      },
      AuthRequestLogin: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'qualquer-texto' },
          password: { type: 'string', example: '123456' },
        },
        required: ['email', 'password'],
      },
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Login realizado com sucesso.' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
        required: ['message', 'token', 'user'],
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          deskId: { type: 'integer', example: 7 },
          userId: { type: 'integer', example: 1 },
          userName: { type: 'string', example: 'Marina Costa' },
          date: {
            type: 'string',
            format: 'date',
            example: '2026-04-21',
            description:
              'BUG PROPOSITAL: a API aceita datas passadas para reservas.',
          },
          startTime: { type: 'string', example: '09:00' },
          endTime: { type: 'string', example: '14:00' },
        },
        required: ['id', 'deskId', 'userId', 'date', 'startTime', 'endTime'],
      },
      Desk: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          number: { type: 'integer', example: 1 },
          zone: { type: 'string', example: 'Ala Norte' },
          status: {
            type: 'string',
            enum: ['livre', 'reservada'],
            example: 'reservada',
          },
          reservations: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Reservation',
            },
          },
        },
        required: ['id', 'number', 'zone', 'status', 'reservations'],
      },
      ReservationCreateRequest: {
        type: 'object',
        properties: {
          deskId: { type: 'integer', example: 7 },
          date: {
            type: 'string',
            format: 'date',
            example: '2026-04-21',
          },
          startTime: { type: 'string', example: '09:00' },
          endTime: { type: 'string', example: '14:00' },
        },
        required: ['deskId', 'date', 'startTime', 'endTime'],
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          app: { type: 'string', example: 'DeskHub' },
        },
        required: ['status', 'app'],
      },
      DesksResponse: {
        type: 'object',
        properties: {
          desks: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Desk',
            },
          },
        },
        required: ['desks'],
      },
      MyReservationsResponse: {
        type: 'object',
        properties: {
          reservations: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Reservation',
            },
          },
        },
        required: ['reservations'],
      },
      ReservationCreateResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Reserva criada com sucesso.' },
          reservation: {
            $ref: '#/components/schemas/Reservation',
          },
        },
        required: ['message', 'reservation'],
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica se a API esta online',
        responses: {
          '200': {
            description: 'API respondendo normalmente',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Cria uma nova conta',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthRequestRegister',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Conta criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthSuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Dados obrigatorios ausentes',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'E-mail ja cadastrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Realiza login do colaborador',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthRequestLogin',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login efetuado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthSuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Dados obrigatorios ausentes',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Credenciais invalidas',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/desks': {
      get: {
        tags: ['Desks'],
        summary: 'Lista mesas e reservas da data informada',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'date',
            required: true,
            schema: {
              type: 'string',
              format: 'date',
            },
            example: '2026-04-21',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de mesas retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DesksResponse',
                },
              },
            },
          },
          '400': {
            description: 'Data invalida',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Nao autenticado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/reservations/my': {
      get: {
        tags: ['Reservations'],
        summary: 'Lista as reservas do usuario autenticado',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'date',
            required: false,
            schema: {
              type: 'string',
              format: 'date',
            },
            example: '2026-04-21',
          },
        ],
        responses: {
          '200': {
            description: 'Reservas retornadas com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MyReservationsResponse',
                },
              },
            },
          },
          '400': {
            description: 'Data invalida',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Nao autenticado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/reservations': {
      post: {
        tags: ['Reservations'],
        summary: 'Cria uma nova reserva',
        description:
          'Aplica as regras de horario e duracao, incluindo limite diario por usuario e antecedencia minima para reservas no mesmo dia. BUGS PROPOSITAIS: conflitos com sobreposicao de exatamente 1 minuto passam, o limite diario falha quando o usuario ja tem exatamente 2 reservas e a antecedencia minima ignora os minutos atuais.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ReservationCreateRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Reserva criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ReservationCreateResponse',
                },
              },
            },
          },
          '400': {
            description: 'Dados invalidos ou fora das regras RN02, RN03, RN06 ou RN07',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Nao autenticado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Mesa nao encontrada',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Conflito de agenda para a mesa',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/reservations/{id}': {
      delete: {
        tags: ['Reservations'],
        summary: 'Remove uma reserva do proprio usuario',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'integer',
            },
            example: 1,
          },
        ],
        responses: {
          '200': {
            description: 'Reserva removida com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiMessage',
                },
              },
            },
          },
          '400': {
            description: 'Identificador invalido',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Nao autenticado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Tentativa de remover reserva de outro usuario',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Reserva nao encontrada',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};
