import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TestTrack Pro API",
      version: "1.0.0",
      description: "API documentation for Software Testing Platform",
    },
    components: {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
},
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
  },
  apis: ["./src/modules/**/*.ts"], // VERY IMPORTANT
};

export const swaggerSpec = swaggerJsdoc(options);
