const { readJsonFile } = require("./files");
const {
  createUser,
  createGroup,
  addUserToGroup,
  grantAllPermissionsToUser,
  grantGlobalPermissionToUser,
} = require("./api");
const log = require("./logger");

const provisionUsers = async (axios, folder, organization) => {
  try {
    const users = readJsonFile(folder + "users.json");

    for (const user of users) {
      log.info(`~> Adding user ${user.displayName}`); 
      await createUser(axios, {id: user.id, displayName: user.displayName, password: user.password}, organization);
    }

    const usersWithPermissions = users.filter((user) => user.permissions.length > 0);
    for (const user of usersWithPermissions) {
      if (user.permissions.includes("all")) {
        log.info(`~> all Permissions granted to ${user.id}`);
        await grantAllPermissionsToUser(axios, user.id);
      } 
      else {
        await Promise.all(user.permissions.map((intent) => { log.info(`~> Granting permission ${intent} to ${user.id}`); return grantGlobalPermissionToUser(axios, intent, user.id);}));
      }
    }
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      log.info("Failed to provision users, max retries exceeded");
    } else {
      log.info(
        `The following error occured during user provisioning ${err.message}`
      );
    }
  }
};

const provisionGroups = async (axios, folder) => {
  try {
    const groups = readJsonFile(folder + "groups.json");
    await Promise.all(groups.map((group) => createGroup(axios, group)));
    const groupsWithUsers = groups.filter((group) => group.users.length > 0);
    for (const group of groupsWithUsers) {
      await Promise.all(group.users.map((user) => addUserToGroup(axios, group.id, user)));
    }
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      log.info("Failed to provision groups, max retries exceeded");
    } else {
      log.info(
        `The following error occured during user provisioning ${err.message}`
      );
    }
  }
};

module.exports = {
  provisionUsers,
  provisionGroups,
};
