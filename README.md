# Budibase Datasource - Jira Cloud Projects
Manage Jira Cloud projects. Uses Jira REST API V2, you can find the docs for it [here](https://developer.atlassian.com/cloud/jira/platform/rest/v2/intro).

## Auth
Uses Basic Auth with an API Token. For more info on setting this up, check [here](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis).

# Trying it out
Jira Cloud isn't free, but you can start a free trial using a new account which will allow testing the queries in this datasource.
## Create and Update operations
Below is an example config to create a new project (POST/PUT request body):
```json
{
	"key": "BUDI",
	"name": "Budibase",
	"projectTypeKey": "software",
	"leadAccountId": "123467:d7e276eb-dda8-41e0-98b7-4d2f47a323d1"
}
```
To find out what your account ID is:
* Go to Jira
* Click your user portrait on the top right
* Click "Profile"
* Your account ID will be in the URL in the format seen above
* Note it's URL encoded and `%3A` is colon (`:`)