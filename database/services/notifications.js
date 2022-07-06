import fsp from "fs/promises";
import path from "path";
import template from "lodash/template.js";
import groupBy from "lodash/groupBy.js";
import { createTransport } from "nodemailer";

export async function sendNotification({
  smtpConfig,
  userManager,
  from,
  to = [],
  cc = [],
  bcc = [],
  roleName = "",
  organizationName = "",
  subject,
  templateName,
  params,
  force = false,
  templatePath = "templates",
}) {
  if (!to?.length && !cc?.length && !bcc?.length && !roleName && !organizationName) {
    throw new Error("Missing recipient");
  }

  if (!templateName) {
    throw new Error("Missing template");
  }

  to = asArray(to);
  cc = asArray(cc);
  bcc = asArray(bcc);

  if (roleName) {
    const users = await userManager.getUsersByRoleName(roleName);
    bcc = bcc.concat(users.map((user) => user.email));
  }

  if (organizationName) {
    const users = await userManager.getUsersByOrganizationName(organizationName);
    bcc = bcc.concat(users.map((user) => user.email));
  }

  if (!force) {
    // force overrides notification preferences (eg: for inactive users)
    to = await getValidNotificationEmails(to, userManager);
    cc = await getValidNotificationEmails(cc, userManager);
    bcc = await getValidNotificationEmails(bcc, userManager);
  }

  const html = await renderTemplate(templateName, params, templatePath);
  return await sendMail({ from, to, cc, bcc, subject, html }, smtpConfig);
}

async function renderTemplate(templateName, params, basePath = "templates") {
  const templatePath = path.resolve(basePath, templateName);
  const templateSource = await fsp.readFile(templatePath, "utf-8");
  return template(templateSource)(params);
}

async function sendMail(params, smtpConfig) {
  const transport = createTransport(smtpConfig);
  return await transport.sendMail(params);
}

async function getValidNotificationEmails(emails, userManager) {
  const users = await userManager.getUsers();
  const userMap = groupBy(users, "email");
  return emails.filter((email) => {
    const [user] = userMap[email] || [];
    return user && user.receiveNotification && user.status !== "inactive";
  });
}

function asArray(values = []) {
  return Array.isArray(values) ? values : [values];
}
