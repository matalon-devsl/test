import { FastifyInstance } from "fastify";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Group from "./service/domain/organization/group";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserRecord from "./service/domain/organization/user_record";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
    schema: {
      description:
        "List all registered users and groups.\n" +
        "In case of a user the 'organization' property exists" +
        "In case of a group the 'isGroup' property exists with value 'true",
      tags: ["user"],
      summary: "List all registered users",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          required: ["apiVersion", "data"],
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              required: ["items"],
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["id", "displayName", "isGroup"],
                    properties: {
                      id: { type: "string", example: "aSmith" },
                      displayName: { type: "string", example: "Alice Smith" },
                      organization: { type: "string", example: "Alice's Solutions & Co" },
                      isGroup: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

interface ExposedIdentity {
  id: string;
  displayName: string;
  organization?: string;
  isGroup: boolean;
}

interface Service {
  listUsers(ctx: Ctx, user: ServiceUser): Promise<UserRecord.UserRecord[]>;
  listGroups(ctx: Ctx, user: ServiceUser): Promise<Group.Group[]>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(`${urlPrefix}/user.list`, mkSwaggerSchema(server), async (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const issuer: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

    try {
      const users: ExposedIdentity[] = (await service.listUsers(ctx, issuer)).map(user => ({
        id: user.id,
        displayName: user.displayName,
        organization: user.organization,
        isGroup: false,
      }));

      const groups: ExposedIdentity[] = (await service.listGroups(ctx, issuer)).map(group => ({
        id: group.id,
        displayName: group.displayName,
        isGroup: true,
      }));

      const code = 200;
      const body = {
        apiVersion: "1.0",
        data: {
          items: users.concat(groups),
        },
      };
      reply.status(code).send(body);
    } catch (err) {
      const { code, body } = toHttpError(err);
      reply.status(code).send(body);
    }
  });
}
