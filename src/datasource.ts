import { IntegrationBase } from "@budibase/types"
import fetch from "node-fetch"
import { ArchiveQuery, DeleteQuery, JsonQuery, ReadQuery, SearchQuery, UpdateQuery } from "./types"
import { toBase64, trimUrlTrailingSlash } from "./util"

interface RequestOpts {
  method: string
  body?: string
  headers?: { [key: string]: string }
}

interface JiraApiConfig {
  atlassianDomainBaseUrl: string;
  username: string;
  apiToken: string;
}

const JIRA_V2_API_PATH = "/rest/api/2"
const JIRA_PROJECT_PATH = `${JIRA_V2_API_PATH}/project`;

class CustomIntegration implements IntegrationBase {
  private readonly jiraBaseUrl: string;
  private readonly authHeaderValue: string;

  constructor(config: JiraApiConfig) {
      this.jiraBaseUrl = trimUrlTrailingSlash(config.atlassianDomainBaseUrl);
      const encodedCreds = toBase64(`${config.username}:${config.apiToken}`);
      this.authHeaderValue = `Basic ${encodedCreds}`;
  }

  async create(query: JsonQuery) {
    const opts = {
      method: "POST",
      body: JSON.stringify(query.json),
      headers: {
        "Content-Type": "application/json",
      },
    }
    return this.request(`${this.jiraBaseUrl}${JIRA_PROJECT_PATH}`, opts)
  }

  async read(query: ReadQuery) {
    const opts = {
      method: "GET",
    };

    return this.request(`${this.jiraBaseUrl}${JIRA_PROJECT_PATH}/${query.projectIdOrKey}`, opts);
  }

  async search(query: SearchQuery) {
    const url = new URL(`${this.jiraBaseUrl}${JIRA_PROJECT_PATH}/search`);
    url.searchParams.append("startAt", String(query.startAt));
    url.searchParams.append("maxResults", String(query.maxResults));
    if (query.query) {
      url.searchParams.append("query", query.query);
    }
    if (query.expand) {
      url.searchParams.append("expand", query.expand);
    }

    const opts = {
      method: "GET",
    };

    return this.request(url, opts);
  }

  async update(query: UpdateQuery) {
    const opts = {
      method: "PUT",
      body: JSON.stringify(query.json),
      headers: {
        "Content-Type": "application/json",
      },
    }

    return this.request(`${this.jiraBaseUrl}${JIRA_PROJECT_PATH}/${query.projectIdOrKey}`, opts);
  }

  async delete(query: DeleteQuery) {
    const url = new URL(`${this.jiraBaseUrl}${JIRA_PROJECT_PATH}/${query.projectIdOrKey}`);
    if (query.deletePermanently) {
      url.searchParams.append("enableUndo", query.deletePermanently === true ? "false" : "true");
    } else {
      url.searchParams.append("enableUndo", "true");
    }

    const opts = {
      method: "DELETE",
    }

    const successfulResponse = JSON.stringify({ projectIdOrKey: query.projectIdOrKey });

    return this.request(url, opts, successfulResponse);
  }

  async archive(query: ArchiveQuery) {
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }

    return this.request(`${this.jiraBaseUrl}${JIRA_PROJECT_PATH}/${query.projectIdOrKey}/archive`, opts);
  }

  private async request(url: string | URL, opts: RequestOpts, successfulResponseReplacement?: string) {
    await this.addAuthHeader(opts);

    const response = await fetch(url, opts)
    if (response.status <= 300) {
      // Used if successful response from Jira API is empty
      if (successfulResponseReplacement) {
        return successfulResponseReplacement;
      }

      try {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("json")) {
          return await response.json()
        } else {
          return await response.text()
        }
      } catch (err) {
        return await response.text()
      }
    } else {
      const err = await response.text()
      throw new Error(err)
    }
  }

  private async addAuthHeader(opts: RequestOpts) {
    const authHeader = { Authorization: this.authHeaderValue };
    opts.headers = opts.headers ? { ...opts.headers, ...authHeader } : authHeader; 
  }
}

export default CustomIntegration
