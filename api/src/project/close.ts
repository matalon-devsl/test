import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { Event } from "../multichain/event";
import * as Subproject from "../subproject/model/Subproject";
import { notifyProjectAssignee } from "./lib/notifyProjectAssignee";
import * as Project from "./model/Project";

export const closeProject = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

  const userIntent: Intent = "project.close";

  // Is the user allowed to close a project?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Project.getPermissions(multichain, projectId),
  );

  // All assiciated subprojects need to be closed:
  if (!(await Subproject.areAllClosed(multichain, projectId))) {
    throw {
      kind: "PreconditionError",
      message: "Cannot close a project if at least one associated subproject is not yet closed.",
    };
  }

  const publishedEvent = await sendEventToDatabase(multichain, req.token, userIntent, projectId);

  await notifyProjectAssignee(multichain, req.token, projectId, publishedEvent);

  return [200, { apiVersion: "1.0", data: "OK" }];
};

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  projectId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: {},
  };
  const publishedEvent = await Project.publish(multichain, projectId, event);
  return publishedEvent;
}
