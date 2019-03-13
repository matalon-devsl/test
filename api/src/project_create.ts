import { FastifyInstance } from "fastify";
import Joi = require("joi");
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import * as AdditionalData from "./service/domain/additional_data";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import { projectedBudgetListSchema } from "./service/domain/workflow/projected_budget";
import * as ProjectCreate from "./service/project_create";

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    project: {
      id?: string;
      status?: "open" | "closed";
      displayName: string;
      description?: string;
      assignee?: string;
      thumbnail?: string;
      projectedBudgets?: Array<{
        organization: string;
        value: string;
        currencyCode: string;
      }>;
      additionalData?: object;
    };
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    project: Joi.object({
      id: Project.idSchema,
      status: Joi.valid("open", "closed"),
      displayName: Joi.string().required(),
      description: Joi.string().allow(""),
      assignee: Joi.string(),
      thumbnail: Joi.string(),
      projectedBudgets: projectedBudgetListSchema,
      additionalData: AdditionalData.schema,
    }).required(),
  }).required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

function validateRequestBody(body: any): Result.Type<RequestBody> {
  const { error, value } = Joi.validate(body, requestBodySchema);
  return !error ? value : error;
}

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
    description:
      "Create a new project.\n.\n" +
      "Note that the only possible values for 'status' are: 'open' and 'closed'",
    tags: ["global"],
    summary: "Create a new project",
    security: [
      {
        bearerToken: [],
      },
    ],
    body: {
      type: "object",
      required: ["apiVersion", "data"],
      properties: {
        apiVersion: { type: "string", example: "1.0" },
        data: {
          type: "object",
          required: ["project"],
          properties: {
            project: {
              type: "object",
              required: ["displayName"],
              properties: {
                id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                status: { type: "string", example: "open" },
                displayName: { type: "string", example: "Build a town-project" },
                description: { type: "string", example: "A town should be built" },
                assignee: { type: "string", example: "aSmith" },
                thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                projectedBudgets: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["organization", "value", "currencyCode"],
                    properties: {
                      organization: { type: "string", example: "My Goverment Bank" },
                      value: { type: "string", example: "1000000" },
                      currencyCode: { type: "string", example: "EUR" },
                    },
                  },
                },
                additionalData: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    response: {
      200: {
        description: "successful response",
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            properties: {
              created: { type: "boolean", example: "true" },
            },
          },
        },
      },
      401: NotAuthenticated.schema,
    },
  };
}

interface Service {
  createProject(ctx: Ctx, user: ServiceUser, createRequest: any): Promise<Project.Id>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(`${urlPrefix}/global.createProject`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const user: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "failed to create project"));
      reply.status(code).send(body);
      return;
    }

    const reqData: ProjectCreate.RequestData = bodyResult.data.project;

    service
      .createProject(ctx, user, reqData)
      .then((projectId: Project.Id) => {
        const code = 201;
        const body = {
          apiVersion: "1.0",
          data: {
            created: true,
            project: {
              id: projectId,
            },
          },
        };
        reply.status(code).send(body);
      })
      .catch(err => {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      });
  });
}
