import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { Event } from "../multichain/event";
import * as Subproject from "../subproject/model/Subproject";
import * as Project from "./model/Project";

export async function getProjectHistory(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

  const userIntent: Intent = "project.viewHistory";

  // Is the user allowed to view the project history?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Project.getPermissions(multichain, projectId),
  );

  const project = await Project.get(multichain, req.token, projectId).then(
    resources => resources[0],
  );

  const subprojects = await Subproject.get(multichain, req.token, projectId);

  const events = subprojects
    .reduce((eventsAcc, subproject) => eventsAcc.concat(subproject.log), project.log)
    .sort(compareEvents);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        events,
      },
    },
  ];
}

function compareEvents(a: Event, b: Event): number {
  const tsA = new Date(a.createdAt);
  const tsB = new Date(b.createdAt);
  if (tsA < tsB) return 1;
  if (tsA > tsB) return -1;
  return 0;
}